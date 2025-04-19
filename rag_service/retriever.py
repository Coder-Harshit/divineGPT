from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from shared.config import EMBEDDING_MODEL
class GitaRetriever:
    def __init__(
        self,
        collection_name: str = "divinegpt-gita",
        # embedding_model_name: str = "all-MiniLM-L6-v2",
        embedding_model_name: str = EMBEDDING_MODEL,
    ):
        self.client=QdrantClient(
            host="localhost",
            port=6333
        )
        self.embedding_model = SentenceTransformer(embedding_model_name)
        self.collection_name = collection_name

    def get_relevant_shloka(self, user_query: str, top_k: int = 3):
        query_vector = self.embedding_model.encode(user_query).tolist()
        search_result = self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            limit=top_k,
            with_payload=True,
        )
        return [hit.payload for hit in search_result.points]

if __name__ == "__main__":
    retriever = GitaRetriever()
    query = "I'm feeling hopeless and stuck in life. What should I do?"
    shlokas = retriever.get_relevant_shloka(query)
    for s in shlokas:
        print(f"\n🔮 {s['shloka']}\n📜 {s['eng_meaning']}")