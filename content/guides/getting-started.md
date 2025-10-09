---
title: Getting Started with SearchAF
description: Learn how to set up your first SearchAF project and integrate it with your e-commerce platform
category: Quickstart
readTime: 5 min read
---

# Getting Started with SearchAF

Welcome to SearchAF! This guide will walk you through setting up your first project and integrating search capabilities into your e-commerce platform.

## Prerequisites

Before you begin, make sure you have:

- A SearchAF account (sign up at [searchaf.antfly.io](https://searchaf.antfly.io))
- An e-commerce platform (Shopify, WooCommerce, or custom)
- Basic knowledge of REST APIs

## Step 1: Create an Organization

Organizations are the top-level containers for your projects and team members.

1. Log in to your SearchAF dashboard
2. Click "Create Organization"
3. Enter your organization name and billing email
4. Click "Create"

## Step 2: Create a Project

Projects represent individual search implementations for your stores or applications.

1. Navigate to your organization
2. Click "Create Project"
3. Choose your platform type:
   - Shopify
   - WooCommerce
   - Custom (API-based)
4. Enter a project name and slug
5. Click "Create Project"

## Step 3: Generate API Keys

API keys allow your application to communicate with SearchAF.

1. Open your project settings
2. Navigate to the "API Keys" tab
3. Click "Create API Key"
4. Choose the key type:
   - **Read-Only**: For search queries only
   - **Read-Write**: For full access
5. Copy and securely store your API key

> ⚠️ **Important**: Your API key will only be shown once. Store it securely!

## Step 4: Install the Integration

### For Shopify

1. Visit the Shopify App Store
2. Search for "SearchAF"
3. Click "Add app"
4. Follow the installation prompts

### For WooCommerce

1. Download the SearchAF WordPress plugin
2. Install via WordPress admin panel
3. Activate the plugin
4. Enter your API key in settings

### For Custom Platforms

Use the REST API to integrate SearchAF:

```bash
curl https://searchaf-api.antfly.io/api/v1/search \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "red shoes",
    "limit": 10
  }'
```

## Step 5: Configure Search Settings

Customize your search experience:

1. **Semantic Search**: Enable AI-powered understanding
2. **Filters**: Configure product attributes for filtering
3. **Ranking**: Adjust relevance scoring
4. **Synonyms**: Add custom synonym mappings

## Step 6: Test Your Integration

1. Navigate to your storefront
2. Use the search functionality
3. Verify results are appearing correctly
4. Check the SearchAF dashboard for analytics

## Next Steps

- [Shopify Integration](/guides/shopify-integration) - Detailed Shopify setup
- [Semantic Search](/guides/semantic-search) - Advanced AI features
- [API Reference](/docs/api) - Complete API documentation

## Need Help?

- Check our [documentation](/docs)
- Contact support at support@searchaf.antfly.io
- Join our community forum
