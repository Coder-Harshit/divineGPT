from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
import pandas as pd
from shared.config import DATASET_DIR, QDRANT_URL, QDRANT_API_KEY, EMBEDDING_MODEL
import os

class QdrantScriptureIndexer:
    def __init__(
            self,
            scripture_name: str,
            collection_name: str = None,
            dataset_path: str = None,
            embedding_model_name: str = EMBEDDING_MODEL,
    ):
        self.scripture_name = scripture_name
        self.collection_name = collection_name or f"divinegpt-{scripture_name.lower()}"
        
        # Default dataset paths based on scripture
        if dataset_path is None:
            if scripture_name.lower() == "gita":
                dataset_path = str(DATASET_DIR / 'bhagwad_gita.csv').replace("/", os.sep)
            elif scripture_name.lower() == "ramayana":
                dataset_path = str(DATASET_DIR / 'Valmiki_Ramayan_Shlokas.csv').replace("/", os.sep)
            else:
                raise ValueError(f"Unknown scripture: {scripture_name}")
                
        self.client = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY,
            timeout=180,
        )
        self.embedding_model = SentenceTransformer(embedding_model_name)
        self.dataset_path = dataset_path

    def recreate_collection(self):
        if not self.client.collection_exists(self.collection_name):
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=self.embedding_model.get_sentence_embedding_dimension(),
                    distance=Distance.COSINE
                )
            )
            print(f"✅ Collection {self.collection_name} created!")
        else:
            print(f"✅ Collection {self.collection_name} already exists!")

    def load_data(self):
        df = pd.read_csv(self.dataset_path)
        
        # Handle different column names based on scripture
        if self.scripture_name.lower() == "gita":
            df = df.dropna(subset=["EngMeaning", "Shloka"])
        elif self.scripture_name.lower() == "ramayana":
            # Make sure these columns exist and are not empty
            required_columns = ["shloka_text", "explanation"]
            df = df.dropna(subset=required_columns)
        
        return df

    def prepare_points(self, df: pd.DataFrame):
        points = []
        for idx, row in df.iterrows():
            # For Ramayana data, use the explanation as the English meaning
            if self.scripture_name.lower() == "ramayana":
                eng_meaning = row["explanation"]
                sanskrit_text = row["shloka_text"]
            else:
                eng_meaning = row["EngMeaning"]
                sanskrit_text = row["Shloka"]
                
            # Prepare the embedding vector from English meaning
            vector = self.embedding_model.encode(eng_meaning).tolist()
            
            # Handle different column structures based on scripture
            if self.scripture_name.lower() == "gita":
                payload = {
                    "id": row.get("ID", idx),
                    "chapter": int(row["Chapter"]),
                    "verse": int(row["Verse"]),
                    "shloka": sanskrit_text,
                    "transliteration": row.get("Transliteration", ""),
                    "hin_meaning": row.get("HinMeaning", ""),
                    "eng_meaning": eng_meaning,
                    "word_meaning": row.get("WordMeaning", ""),
                    "scripture": "bhagavad_gita"
                }
            elif self.scripture_name.lower() == "ramayana":
                payload = {
                    "id": idx,
                    "book": row["kanda"],
                    "chapter": row["sarga"],
                    "verse": row["shloka"],
                    "shloka": sanskrit_text,
                    "transliteration": "",
                    "hin_meaning": "",
                    "eng_meaning": eng_meaning,
                    "word_meaning": "",
                    "scripture": "ramayana"
                }
                
            points.append(PointStruct(id=idx, vector=vector, payload=payload))
        return points

    def upload_to_qdrant(self, batch_size=100):
        print(f"[📖] Loading {self.scripture_name} data...")
        df = self.load_data()
        print(f"[🧠] Data loaded. Embedding & preparing vectors...")
        points = self.prepare_points(df)
        
        print(f"[📦] Uploading to Qdrant vector DB in batches...")
        # Upload in batches to avoid payload size limitations
        total_points = len(points)
        for i in range(0, total_points, batch_size):
            batch_end = min(i + batch_size, total_points)
            batch = points[i:batch_end]
            self.client.upsert(collection_name=self.collection_name, points=batch)
            print(f"[📤] Uploaded batch {i//batch_size + 1}/{(total_points + batch_size - 1)//batch_size} ({batch_end}/{total_points} points)")
        
        print(f"[✅] Uploaded {total_points} shlokas from {self.scripture_name} into Qdrant successfully!")

if __name__ == "__main__":
    # Upload Gita shlokas
    gita_indexer = QdrantScriptureIndexer(scripture_name="gita")
    gita_indexer.recreate_collection()
    gita_indexer.upload_to_qdrant()
    
    # Upload Ramayana shlokas
    ramayana_indexer = QdrantScriptureIndexer(scripture_name="ramayana")
    ramayana_indexer.recreate_collection()
    ramayana_indexer.upload_to_qdrant(batch_size=20)  # Use smaller batch size for Ramayana
