---
title: Setting Up Product Indexing
description: Configure and optimize how your products are indexed for search
category: Quickstart
readTime: 8 min read
image: /guide-images/product-indexing.png
---

Learn how to configure product indexing in SearchAF to ensure your catalog is searchable, discoverable, and optimized for the best search experience.

## What is Product Indexing?

Product indexing is the process of organizing and structuring your product data so SearchAF can efficiently search and retrieve relevant results. Think of it as creating a comprehensive map of your entire catalog.

## Automatic vs Manual Indexing

### Automatic Indexing

For integrated platforms (Shopify, WooCommerce), indexing happens automatically:

- Products are indexed when first imported
- Updates sync in real-time via webhooks
- Deletions are reflected immediately
- No manual intervention required

### Manual Indexing

For custom integrations, you control the indexing process:

```bash
curl https://searchaf-api.antfly.io/api/v1/products \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "id": "prod_12345",
    "title": "Women'\''s Running Shoes",
    "description": "Lightweight running shoes with superior cushioning",
    "price": 89.99,
    "sku": "WRS-001",
    "tags": ["shoes", "running", "women"],
    "variants": [
      {
        "id": "var_123",
        "size": "7",
        "color": "Blue",
        "inventory": 15
      }
    ]
  }'
```

## Essential Fields to Index

### Required Fields

These fields must be included for every product:

- **id**: Unique product identifier
- **title**: Product name
- **price**: Current price (for sorting and filtering)

### Recommended Fields

Include these for better search results:

- **description**: Full product description
- **images**: Product image URLs
- **sku**: Stock keeping unit
- **brand**: Product manufacturer
- **categories**: Product categorization
- **tags**: Searchable keywords
- **inventory**: Stock count

### Custom Fields

Add custom metadata for advanced filtering:

```json
{
  "custom_fields": {
    "material": "synthetic",
    "sustainability_score": 8.5,
    "eco_friendly": true,
    "made_in": "USA"
  }
}
```

## Batch Indexing

For large catalogs, use batch operations:

```bash
curl https://searchaf-api.antfly.io/api/v1/products/batch \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "products": [
      { "id": "1", "title": "Product 1", ... },
      { "id": "2", "title": "Product 2", ... },
      { "id": "3", "title": "Product 3", ... }
    ]
  }'
```

**Best Practices:**
- Batch up to 100 products per request
- Use gzip compression for large payloads
- Implement retry logic for failed batches

## Indexing Variants

Handle product variants properly:

### Option 1: Index as Separate Products

Best for products with distinct variants:

```json
[
  {
    "id": "shoes-blue-7",
    "title": "Women's Running Shoes - Blue - Size 7",
    "parent_id": "shoes-base",
    "variant": { "color": "blue", "size": "7" }
  },
  {
    "id": "shoes-red-8",
    "title": "Women's Running Shoes - Red - Size 8",
    "parent_id": "shoes-base",
    "variant": { "color": "red", "size": "8" }
  }
]
```

### Option 2: Index with Nested Variants

Best for products with many similar variants:

```json
{
  "id": "shoes-base",
  "title": "Women's Running Shoes",
  "variants": [
    { "color": "blue", "size": "7", "sku": "WRS-B-7" },
    { "color": "red", "size": "8", "sku": "WRS-R-8" }
  ]
}
```

## Updating Products

### Single Product Update

```bash
curl https://searchaf-api.antfly.io/api/v1/products/prod_12345 \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -X PUT \
  -d '{
    "price": 79.99,
    "inventory": 10
  }'
```

### Partial Update

Update only specific fields:

```bash
curl https://searchaf-api.antfly.io/api/v1/products/prod_12345 \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -X PATCH \
  -d '{
    "inventory": 5
  }'
```

## Deleting Products

Remove products from the index:

```bash
curl https://searchaf-api.antfly.io/api/v1/products/prod_12345 \
  -H "X-API-Key: YOUR_API_KEY" \
  -X DELETE
```

## Monitoring Index Status

Check indexing progress and health:

```bash
curl https://searchaf-api.antfly.io/api/v1/index/status \
  -H "X-API-Key: YOUR_API_KEY"
```

Response:
```json
{
  "total_products": 1523,
  "indexed_products": 1523,
  "pending_updates": 0,
  "last_sync": "2025-10-21T14:30:00Z",
  "health": "healthy"
}
```

## Optimization Tips

### 1. Use Meaningful Titles

**Good:**
```
Women's Waterproof Trail Running Shoes - Blue
```

**Bad:**
```
Product #12345
```

### 2. Write Rich Descriptions

Include keywords naturally:
- Features and benefits
- Use cases
- Materials and specifications
- Who it's for

### 3. Leverage Tags Strategically

```json
{
  "tags": [
    "running",
    "women",
    "waterproof",
    "trail",
    "athletic",
    "outdoor"
  ]
}
```

### 4. Keep Inventory Current

Update inventory in real-time to:
- Prevent searches for out-of-stock items
- Enable accurate filtering
- Improve user experience

## Troubleshooting

### Products Not Appearing

1. Verify product was successfully indexed:
```bash
curl https://searchaf-api.antfly.io/api/v1/products/YOUR_PRODUCT_ID \
  -H "X-API-Key: YOUR_API_KEY"
```

2. Check for indexing errors in dashboard
3. Ensure required fields are present
4. Verify API key has write permissions

### Slow Indexing

1. Use batch operations instead of single updates
2. Reduce payload size (remove unnecessary fields)
3. Index during off-peak hours
4. Contact support for rate limit increases

## Next Steps

- [Customizing Search Results](/guides/customizing-results) - Configure ranking and relevance
- [Semantic Search](/guides/semantic-search) - Enable AI-powered understanding
- [API Reference](/docs/api) - Complete API documentation

## Need Help?

- Check the [FAQ](/docs/faq)
- Email support@searchaf.antfly.io
- Join our community forum
