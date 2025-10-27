---
title: Implementing Semantic Search
description: Leverage AI-powered vector search to power intelligent answer generation
category: Advanced
readTime: 15 min read
image: /guide-images/semantic-search.png
---

Semantic search uses AI to understand the meaning and intent behind search queries, delivering more relevant results than traditional keyword matching.

## What is Semantic Search?

Traditional search matches keywords exactly:
- Query: "running shoes" → Only finds products with those exact words

Semantic search understands meaning:
- Query: "footwear for jogging" → Finds running shoes, sneakers, athletic shoes
- Query: "workout gear for feet" → Also finds relevant products

## How It Works

SearchAF's semantic search uses:

1. **Embedding Models**: Convert text to vector representations
2. **Vector Database**: Store and search high-dimensional vectors
3. **Similarity Search**: Find products with similar meaning
4. **Hybrid Ranking**: Combine semantic and keyword signals

## Enabling Semantic Search

### Via Dashboard

1. Navigate to your project settings
2. Go to "Search Configuration"
3. Toggle "Semantic Search" on
4. Choose your embedding model:
   - **Fast**: Lower latency, good accuracy
   - **Accurate**: Higher latency, best accuracy
5. Click "Save"

### Via API

Enable semantic search in your search requests:

```bash
curl https://searchaf-api.antfly.io/api/v1/search \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "comfortable shoes for hiking",
    "semantic": true,
    "hybrid_weight": 0.7
  }'
```

The `hybrid_weight` parameter controls the balance:
- `0.0`: Pure keyword search
- `0.5`: Equal weight to semantic and keyword
- `1.0`: Pure semantic search

## Best Practices

### Optimize Product Descriptions

Semantic search works best with rich, descriptive content:

**Good:**
```
Women's Trail Running Shoes - Waterproof hiking footwear with
superior grip and cushioning for outdoor adventures
```

**Bad:**
```
Shoes - Blue - SKU12345
```

### Use Natural Language

Write product descriptions the way customers search:

- Include synonyms and related terms
- Describe use cases and benefits
- Add context about who it's for

### Configure Relevance Tuning

Fine-tune which fields contribute to semantic matching:

```json
{
  "semantic_fields": {
    "title": 0.4,
    "description": 0.4,
    "tags": 0.2
  }
}
```

## Advanced Features

### Multi-Language Support

Semantic search works across languages:

```bash
{
  "query": "chaussures de course",
  "language": "fr",
  "semantic": true
}
```

### Custom Embeddings

Use your own embedding model:

1. Train or select a custom model
2. Upload to SearchAF
3. Configure in project settings

### Query Expansion

Automatically expand queries with related terms:

```bash
{
  "query": "laptop",
  "semantic": true,
  "expand_query": true
}
```

This might expand to: "laptop computer notebook portable pc"

## Monitoring Performance

Track semantic search effectiveness:

1. **Click-Through Rate**: Are users clicking results?
2. **Conversion Rate**: Are searches leading to purchases?
3. **No-Result Queries**: Which queries return nothing?
4. **Latency**: Is response time acceptable?

## Cost Considerations

Semantic search uses more compute resources:

- **Embedding Generation**: ~2-5ms per query
- **Vector Search**: ~10-50ms depending on catalog size
- **Storage**: ~1KB per product for embeddings

Plan your tier accordingly based on query volume.

## Next Steps

- [Analytics & Insights](/guides/analytics)
- [Performance Optimization](/guides/performance)
- [Custom Models](/guides/custom-models)
