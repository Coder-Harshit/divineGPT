from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from shared.config import EMBEDDING_MODEL, QDRANT_URL, QDRANT_API_KEY
from typing import List, Dict, Any, Optional

class ScriptureRetriever:
    def __init__(
        self,
        embedding_model_name: str = EMBEDDING_MODEL,
    ):
        self.client = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY,
            timeout=60,
        )
        self.embedding_model = SentenceTransformer(embedding_model_name)
        self.collections = {
            "gita": "divinegpt-gita",
            "ramayana": "divinegpt-ramayana"
        }

    def get_relevant_shloka(self, user_query: str, scripture: str = "all", top_k: int = 3):
        """
        Retrieve relevant shlokas based on the user query and selected scripture.
        
        Args:
            user_query: The user's question
            scripture: Which scripture to query - 'gita', 'ramayana', or 'all'
            top_k: Number of results to return per scripture
            
        Returns:
            List of payload dictionaries with shloka information
        """
        query_vector = self.embedding_model.encode(user_query).tolist()
        results = []
        
        if scripture.lower() == "all" or scripture.lower() == "gita":
            if self.client.collection_exists(self.collections["gita"]):
                gita_results = self.client.search(
                    collection_name=self.collections["gita"],
                    query_vector=query_vector,
                    limit=top_k,
                    with_payload=True,
                )
                results.extend([hit.payload for hit in gita_results])
                
        if scripture.lower() == "all" or scripture.lower() == "ramayana":
            if self.client.collection_exists(self.collections["ramayana"]):
                ramayana_results = self.client.search(
                    collection_name=self.collections["ramayana"],
                    query_vector=query_vector,
                    limit=top_k,
                    with_payload=True,
                )
                results.extend([hit.payload for hit in ramayana_results])
                
        return results

if __name__ == "__main__":
    retriever = ScriptureRetriever()
    query = "What is dharma? How should one live virtuously?"
    
    print("Querying Bhagavad Gita:")
    gita_shlokas = retriever.get_relevant_shloka(query, scripture="gita")
    for s in gita_shlokas:
        print(f"\n🔮 {s['shloka']}\n📜 {s['eng_meaning']}")
    
    print("\nQuerying Ramayana:")
    ramayana_shlokas = retriever.get_relevant_shloka(query, scripture="ramayana")
    for s in ramayana_shlokas:
        print(f"\n🔮 {s['shloka']}\n📜 {s['eng_meaning']}")