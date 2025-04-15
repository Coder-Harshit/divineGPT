from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
import pandas as pd
from shared.config import DATASET_DIR
import os

class QdrantGitaIndexer:
    def __init__(
            self,
            path: str = "./qdrant_data",
            host: str = "localhost",
            port: int = 6333,
            collection_name: str = "divinegpt-gita",
            dataset_path: str = str(DATASET_DIR / 'bhagwad_gita.csv').replace("/", os.sep),
            embedding_model_name:str = "all-MiniLM-L6-v2",
    ):
        self.client = QdrantClient(path=path)
        self.embedding_model = SentenceTransformer(embedding_model_name)
        self.collection_name = collection_name
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
        df = df.dropna(subset=["EngMeaning", "Shloka"])
        return df

    def prepare_points(self, df: pd.DataFrame):
        points = []
        for idx, row in df.iterrows():
            vector = self.embedding_model.encode(row["EngMeaning"]).tolist()
            payload = {
                "id": row["ID"],
                "chapter": int(row["Chapter"]),
                "verse": int(row["Verse"]),
                "shloka": row["Shloka"],
                "transliteration": row["Transliteration"],
                "hin_meaning": row["HinMeaning"],
                "eng_meaning": row["EngMeaning"],
                "word_meaning": row["WordMeaning"]
            }
            points.append(PointStruct(id=idx, vector=vector, payload=payload))
        return points

    def upload_to_qdrant(self):
        print("[📖] Loading Bhagavad Gita data...")
        df = self.load_data()
        print("[🧠] Data loaded. Embedding & preparing vectors...")
        points = self.prepare_points(df)
        print("[📦] Uploading to Qdrant vector DB...")
        self.client.upsert(collection_name=self.collection_name, points=points)
        print(f"[✅] Uploaded {len(points)} shlokas into Qdrant successfully!")

if __name__ == "__main__":
    indexer = QdrantGitaIndexer()
    indexer.recreate_collection()
    indexer.upload_to_qdrant()
