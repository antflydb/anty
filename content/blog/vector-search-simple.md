---
title: Vector Search Simple - The Technology Behind SearchAF
description: A deep dive into how vector embeddings and similarity search power modern AI applications
date: 2025-01-20
author: Engineering Team
---

## Vector Search Simple: The Technology Behind SearchAF

Vector search is the technology powering SearchAF's advanced semantic search. It allows search systems to understand the *meaning* of a query, not just the keywords.

### What is a Vector Embedding?

Instead of storing text as words, we convert it into a **vector embedding**: a high-dimensional array of numbers that captures the data's semantic meaning.

* **Example:** "running shoes" $\rightarrow$ [0.24, -0.18, 0.91, ...]
* Concepts with similar meaning, like "athletic footwear," will have vectors that are numerically very close.

### How SearchAF Uses Vector Search

1.  **Generate Embeddings (Indexing):** When a product is added, we use an embedding model (like an OpenAI model) to convert its description and attributes into a vector, which is then stored.
2.  **Query Embedding:** When a user searches, the query is immediately converted into a query vector using the *same* model.
3.  **Similarity Search:** The system finds products whose vectors are mathematically **closest** to the query vector, typically using **Cosine Similarity**. Closer vectors mean more relevant results.

### The Role of Vector Databases

Traditional databases cannot efficiently handle these large, high-dimensional vectors and the intensive similarity calculations. SearchAF uses **AntflyDB**, a specialized vector database that provides:

* **HNSW Indexes:** Specialized data structures for extremely fast similarity search across millions of items.
* **Scale:** Distributed architecture to handle massive product catalogs.

### Hybrid Search: The Best Results

Pure vector search is great for concepts, but can miss exact names or product IDs. SearchAF uses **Hybrid Search** by combining the semantic (vector) score with a traditional keyword score (like BM25).

$$\text{final\_score} = \alpha \times \text{vector\_score} + (1-\alpha) \times \text{keyword\_score}$$

This approach ensures users find both conceptual matches and exact product names, leading to higher relevance (NDCG $\mathbf{0.91}$) and fewer zero-result searches.

Vector search is the foundation for the future of search, enabling SearchAF to deliver highly relevant results instantly, even with complex, natural language queries.