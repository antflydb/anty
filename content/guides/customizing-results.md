---
title: Customizing Search Results
description: Fine-tune search relevance, ranking, and filtering for optimal user experience
category: Quickstart
readTime: 10 min read
image: /guide-images/customizing-results.png
---

Learn how to customize your search results to deliver the most relevant products to your customers and optimize for conversions.

## Understanding Search Relevance

Search relevance determines which products appear for a given query and in what order. SearchAF uses multiple signals to calculate relevance:

- **Text Matching**: How well the query matches product fields
- **Semantic Similarity**: Meaning and intent understanding (if enabled)
- **Popularity**: Historical click and conversion data
- **Freshness**: Recently added or updated products
- **Custom Boosts**: Your manual ranking adjustments

## Basic Customization

### Field Weights

Control which product fields matter most:

```bash
curl https://searchaf-api.antfly.io/api/v1/search/config \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -X PUT \
  -d '{
    "field_weights": {
      "title": 3.0,
      "brand": 2.0,
      "description": 1.0,
      "tags": 1.5,
      "sku": 0.5
    }
  }'
```

**Higher weights** = More influence on ranking

### Minimum Relevance Score

Filter out low-quality results:

```bash
curl https://searchaf-api.antfly.io/api/v1/search \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "running shoes",
    "min_score": 0.5
  }'
```

Scores range from 0.0 (no match) to 1.0 (perfect match).

## Advanced Ranking

### Boosting by Field Values

Promote products with specific attributes:

```json
{
  "query": "laptop",
  "boost_rules": [
    {
      "field": "brand",
      "value": "Apple",
      "boost": 2.0
    },
    {
      "field": "in_stock",
      "value": true,
      "boost": 1.5
    },
    {
      "field": "rating",
      "range": { "gte": 4.5 },
      "boost": 1.3
    }
  ]
}
```

### Negative Boosting

Demote certain products without excluding them:

```json
{
  "boost_rules": [
    {
      "field": "inventory",
      "range": { "lte": 3 },
      "boost": 0.5
    }
  ]
}
```

### Time-Based Boosting

Promote new products:

```json
{
  "boost_rules": [
    {
      "field": "created_at",
      "range": {
        "gte": "now-7d"
      },
      "boost": 1.5
    }
  ]
}
```

## Personalization

### User-Specific Results

Personalize based on user behavior:

```bash
curl https://searchaf-api.antfly.io/api/v1/search \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "shoes",
    "user_id": "user_12345",
    "personalize": true
  }'
```

SearchAF will consider:
- Previous purchases
- Browsing history
- Click patterns
- Cart additions

### Collaborative Filtering

Show products liked by similar users:

```json
{
  "query": "wireless headphones",
  "user_id": "user_12345",
  "similar_users_boost": 1.2
}
```

## Filtering Results

### Basic Filters

Allow users to narrow results:

```bash
curl https://searchaf-api.antfly.io/api/v1/search \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "shoes",
    "filters": {
      "brand": ["Nike", "Adidas"],
      "price": { "gte": 50, "lte": 150 },
      "color": ["black", "blue"],
      "in_stock": true
    }
  }'
```

### Range Filters

Filter by numeric or date ranges:

```json
{
  "filters": {
    "price": { "gte": 100, "lte": 500 },
    "rating": { "gte": 4.0 },
    "release_date": { "gte": "2025-01-01" }
  }
}
```

### Negative Filters

Exclude specific values:

```json
{
  "filters": {
    "brand": { "not": ["BrandX", "BrandY"] },
    "category": { "not": "clearance" }
  }
}
```

## Faceted Search

Enable dynamic filtering with facets:

```bash
curl https://searchaf-api.antfly.io/api/v1/search \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "laptop",
    "facets": ["brand", "price_range", "screen_size", "processor"]
  }'
```

Response includes facet counts:

```json
{
  "results": [...],
  "facets": {
    "brand": {
      "Apple": 45,
      "Dell": 38,
      "HP": 52
    },
    "price_range": {
      "0-500": 12,
      "500-1000": 67,
      "1000+": 56
    }
  }
}
```

## Sorting Options

### Default Sort

Set the default sort order:

```json
{
  "query": "headphones",
  "sort": "relevance"
}
```

Options:
- `relevance` (default)
- `price_asc`
- `price_desc`
- `newest`
- `popularity`
- `rating`

### Custom Sort

Sort by any field:

```json
{
  "query": "laptops",
  "sort": [
    { "field": "in_stock", "order": "desc" },
    { "field": "price", "order": "asc" }
  ]
}
```

## Result Formatting

### Limiting Results

Control the number of results:

```json
{
  "query": "shoes",
  "limit": 20,
  "offset": 0
}
```

### Field Selection

Return only specific fields:

```json
{
  "query": "shoes",
  "fields": ["id", "title", "price", "image", "url"]
}
```

Reduces payload size and improves performance.

### Highlighting

Highlight matching terms:

```json
{
  "query": "blue running shoes",
  "highlight": {
    "fields": ["title", "description"],
    "pre_tag": "<mark>",
    "post_tag": "</mark>"
  }
}
```

Response:
```json
{
  "title": "<mark>Blue</mark> Trail <mark>Running</mark> <mark>Shoes</mark>"
}
```

## A/B Testing

Test different configurations:

```bash
# Variant A: Default relevance
curl ... -d '{"query": "shoes", "variant": "control"}'

# Variant B: Boost new products
curl ... -d '{"query": "shoes", "variant": "boost_new"}'
```

Track metrics by variant:
- Click-through rate
- Conversion rate
- Revenue per search

## Performance Optimization

### Caching

Enable result caching:

```json
{
  "query": "popular query",
  "cache_ttl": 300
}
```

Cache duration in seconds.

### Query Suggestions

Pre-compute common queries:

```bash
curl https://searchaf-api.antfly.io/api/v1/search/autocomplete \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "run",
    "limit": 5
  }'
```

Response:
```json
{
  "suggestions": [
    "running shoes",
    "running shorts",
    "running watch",
    "running belt",
    "running socks"
  ]
}
```

## Monitoring & Analytics

Track key metrics in the dashboard:

1. **Search Analytics**
   - Top queries
   - No-result queries
   - Average results per query

2. **Performance Metrics**
   - Click-through rate (CTR)
   - Conversion rate
   - Revenue per search

3. **Quality Metrics**
   - Average relevance score
   - Time to first click
   - Bounce rate

## Best Practices

### 1. Start Simple

Begin with basic configurations:
- Set field weights
- Enable semantic search
- Configure basic filters

### 2. Iterate Based on Data

Use analytics to guide improvements:
- Identify low-performing queries
- Track which filters users engage with
- Monitor conversion rates

### 3. Test Changes

Always A/B test major changes:
- New boost rules
- Different field weights
- Personalization strategies

### 4. Balance Relevance and Business Goals

Find the sweet spot between:
- Showing what customers want
- Promoting profitable products
- Clearing inventory

## Common Patterns

### Promoting Sale Items

```json
{
  "boost_rules": [
    {
      "field": "on_sale",
      "value": true,
      "boost": 1.3
    }
  ]
}
```

### Hiding Out of Stock

```json
{
  "filters": {
    "in_stock": true
  }
}
```

### Geographic Personalization

```json
{
  "boost_rules": [
    {
      "field": "warehouse_location",
      "value": "US-WEST",
      "boost": 1.2,
      "user_location": "California"
    }
  ]
}
```

## Next Steps

- [Analytics & Insights](/guides/analytics) - Deep dive into search analytics
- [Product Indexing](/guides/product-indexing) - Optimize your product data
- [Semantic Search](/guides/semantic-search) - Enable AI-powered search
- [API Reference](/docs/api) - Complete API documentation

## Need Help?

- Check the [FAQ](/docs/faq)
- Email support@searchaf.antfly.io
- Join our community forum
