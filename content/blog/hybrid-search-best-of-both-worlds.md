---
title: "Hybrid Search: Combining the Best of Vector and Keyword Search"
description: "Learn how hybrid search combines semantic understanding with precision matching to deliver superior search results for modern applications"
date: 2025-01-25
author: Engineering Team
image: /blog-images/hybrid-search.png
---

When building modern search experiences, you often face a choice: should you use traditional keyword search or cutting-edge vector search? The answer is increasingly "both" - and that's where hybrid search comes in.

## The Limitations of Each Approach

**Keyword Search** excels at:
- Exact matching (product SKUs, model numbers, specific terms)
- Fast lookups for known queries
- Precise filtering and boolean logic

But it struggles with:
- Understanding intent and context
- Handling synonyms and related concepts
- Cross-lingual searches

**Vector Search** excels at:
- Semantic understanding ("show me running shoes" finds athletic footwear)
- Handling natural language queries
- Finding conceptually similar items

But it can miss:
- Exact matches when they matter most
- Specific technical terms or acronyms
- Edge cases where users expect literal matching

## How Hybrid Search Works

Hybrid search runs both keyword and vector searches in parallel, then combines the results using a weighted scoring mechanism. Here's a simplified example:

```typescript
interface HybridSearchConfig {
  vectorWeight: number;    // 0.0 to 1.0
  keywordWeight: number;   // 0.0 to 1.0
  rerankingStrategy?: 'rrf' | 'weighted' | 'custom';
}

async function hybridSearch(
  query: string,
  config: HybridSearchConfig
) {
  // Run searches in parallel
  const [vectorResults, keywordResults] = await Promise.all([
    vectorSearch(query),
    keywordSearch(query)
  ]);

  // Combine and rerank results
  return rerank(vectorResults, keywordResults, config);
}
```

## Reciprocal Rank Fusion (RRF)

One popular approach for combining results is Reciprocal Rank Fusion. Instead of trying to normalize different scoring systems, RRF focuses on the rank position of each result:

```
RRF_score(d) = Σ 1 / (k + rank(d))
```

Where `k` is a constant (typically 60), and `rank(d)` is the position of document `d` in each result set.

This elegantly handles the "apples and oranges" problem of combining different scoring algorithms.

## Real-World Use Cases

### E-commerce Product Search

Imagine a user searching for "MBP M3 Pro 36GB". A pure vector search might get confused by the technical specifications, while a pure keyword search might miss relevant alternatives. Hybrid search:

1. Uses keyword matching to find the exact model (MacBook Pro M3 Pro with 36GB RAM)
2. Uses vector search to suggest similar configurations and alternatives
3. Ranks exact matches higher while still showing semantically relevant options

### Documentation Search

When searching technical docs for "how to connect to postgres", you want:
- Keyword matching on "postgres" to find PostgreSQL-specific guides
- Vector search to understand "connect" includes tutorials on "setup", "configuration", and "getting started"
- Combined results that prioritize official PostgreSQL connection guides while including related database setup content

## Implementing Hybrid Search with Antfly

Antfly makes hybrid search straightforward by supporting both full-text and vector search natively:

```typescript
const results = await antflyDB.search({
  collection: 'products',
  hybrid: {
    text: {
      query: userQuery,
      fields: ['title', 'description', 'tags'],
      weight: 0.3
    },
    vector: {
      query: await embedQuery(userQuery),
      field: 'embedding',
      weight: 0.7
    },
    fusion: 'rrf',
    limit: 20
  }
});
```

## Tuning Your Hybrid Search

The optimal balance between keyword and vector search depends on your use case:

- **Technical/SKU-heavy catalogs**: Increase keyword weight (e.g., 60% keyword, 40% vector)
- **Natural language queries**: Increase vector weight (e.g., 30% keyword, 70% vector)
- **General e-commerce**: Start balanced (50/50) and tune based on user behavior

Use A/B testing and analytics to find your ideal configuration. Monitor metrics like:
- Click-through rate on search results
- Time to successful result click
- Null result rate
- User query reformulation rate

## The Future of Search

As LLMs and embedding models continue to improve, vector search will get even better at understanding intent. But keyword search will remain valuable for precision matching. Hybrid search isn't just a compromise - it's a synergy that delivers the best of both worlds.

By implementing hybrid search with a platform like SearchAF and Antfly, you can future-proof your search experience while maintaining the precision users expect today.

---

**Ready to implement hybrid search?** Check out our [documentation](/docs) to learn how SearchAF makes it easy to deploy sophisticated hybrid search in minutes, not months.
