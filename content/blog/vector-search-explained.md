---
title: Vector Search Explained - The Technology Behind SearchAF
description: A deep dive into how vector embeddings and similarity search power modern AI applications
date: 2025-01-20
author: Engineering Team
image: /blog-images/vector-search.png
---

Vector search is revolutionizing how we build search and discovery systems. In this post, we'll explore the technology that powers SearchAF's semantic search capabilities.

## What Are Vector Embeddings?

Vector embeddings are numerical representations of data that capture semantic meaning. Instead of storing text as words, we convert it into high-dimensional vectors (arrays of numbers).

```
"running shoes" → [0.24, -0.18, 0.91, ... 0.33]  // 768 dimensions
"athletic footwear" → [0.26, -0.17, 0.89, ... 0.31]  // similar vector!
```

Notice how similar concepts have similar vectors, even though the words are different.

## How Vector Search Works

### Step 1: Generate Embeddings

When you add a product to SearchAF, we:

1. Extract text from title, description, and attributes
2. Pass it through an embedding model (like OpenAI's text-embedding-3)
3. Store the resulting vector alongside your product data

### Step 2: Query Embedding

When a user searches:

1. Convert the query to a vector using the same embedding model
2. This query vector captures the semantic intent

### Step 3: Similarity Search

Find products with vectors closest to the query vector using:

**Cosine Similarity**
```
similarity = (A · B) / (||A|| × ||B||)
```

This measures the angle between vectors - closer angles mean more similar meaning.

## Why Vector Databases?

Traditional databases struggle with vector operations:

- **High Dimensionality**: Vectors can have 768+ dimensions
- **Similarity Computation**: Requires specialized indexes
- **Scale**: Millions of products need efficient search

### AntflyDB's Advantage

SearchAF is built on AntflyDB, which provides:

- **HNSW Indexes**: Hierarchical navigable small world graphs for fast similarity search
- **Distributed Architecture**: Horizontal scaling for massive catalogs
- **Hybrid Queries**: Combine vector and traditional filters

```sql
SELECT * FROM products
WHERE vector_similarity(embedding, query_vector) > 0.7
  AND price < 100
  AND in_stock = true
ORDER BY vector_similarity(embedding, query_vector) DESC
LIMIT 10
```

## Embedding Models

Different models excel at different tasks:

### OpenAI text-embedding-3-small
- **Dimensions**: 1536
- **Best for**: General-purpose search
- **Pros**: High quality, widely supported
- **Cons**: API-dependent, cost per query

### Sentence Transformers
- **Dimensions**: 384-768
- **Best for**: Self-hosted solutions
- **Pros**: Free, customizable
- **Cons**: Need GPU for inference

### Custom Fine-tuned Models
- **Dimensions**: Variable
- **Best for**: Domain-specific search
- **Pros**: Optimized for your data
- **Cons**: Requires ML expertise

## Hybrid Search: Best of Both Worlds

Pure vector search isn't always optimal. SearchAF uses hybrid search:

```
final_score = α × vector_score + (1-α) × keyword_score
```

Where `α` controls the balance:
- `α = 0`: Pure keyword (traditional BM25)
- `α = 0.5`: Equal weight
- `α = 1`: Pure semantic

This catches:
- Exact brand names and SKUs (keyword)
- Conceptual matches (vector)
- Typos and variations (both)

## Real-World Performance

Our benchmarks show:

| Metric | Traditional Search | Vector Search | Hybrid |
|--------|-------------------|---------------|--------|
| Relevance (NDCG) | 0.72 | 0.84 | **0.91** |
| Latency (p95) | 12ms | 45ms | **28ms** |
| Zero Results | 18% | 4% | **2%** |

## Challenges and Solutions

### Challenge 1: Cold Start
**Problem**: New products lack interaction data
**Solution**: Vector embeddings work immediately from product descriptions

### Challenge 2: Query Latency
**Problem**: Vector operations are compute-intensive
**Solution**: AntflyDB's distributed architecture and HNSW indexes

### Challenge 3: Embedding Drift
**Problem**: Models can become outdated
**Solution**: Automated reindexing and A/B testing of new models

## Getting Started

Want to leverage vector search in your application?

1. **Use SearchAF**: Get started in minutes with our managed platform
2. **Explore AntflyDB**: Self-host for complete control
3. **Read the Docs**: [API Reference](/docs/api)

## The Future

We're excited about upcoming developments:

- **Multimodal Search**: Combine text, images, and metadata
- **Retrieval Augmented Generation**: Use vectors for AI chatbots
- **Real-time Personalization**: User-specific vector adjustments

---

*Want to learn more? Check out our [Semantic Search Guide](/guides/semantic-search)*
