---
title: Shopify Integration Guide
description: Step-by-step guide to integrating SearchAF with your Shopify store
category: Integration
readTime: 10 min read
---

# Shopify Integration Guide

This guide covers the complete integration of SearchAF with your Shopify store for enhanced product search and discovery.

## Overview

The SearchAF Shopify app provides:

- **Automatic Product Sync**: Real-time synchronization of your product catalog
- **Smart Search Widget**: Beautiful, customizable search interface
- **Analytics Dashboard**: Track search performance and user behavior
- **Zero Configuration**: Works out of the box with sensible defaults

## Installation

### Step 1: Install the Shopify App

1. Visit the Shopify App Store
2. Search for "SearchAF"
3. Click "Add app"
4. Review permissions and click "Install"

### Step 2: Connect to SearchAF

1. You'll be redirected to SearchAF
2. Create an account or sign in
3. Create a new organization (if needed)
4. The app will automatically create a project for your store

### Step 3: Initial Sync

The app will automatically begin syncing your products:

- Product titles and descriptions
- Images and variants
- Pricing and inventory
- Collections and tags
- Custom metafields (configurable)

This process typically takes 5-15 minutes depending on catalog size.

## Configuration

### Search Widget Settings

Customize the search experience in your theme:

1. Go to **Shopify Admin → Online Store → Themes**
2. Click **Customize**
3. Find the SearchAF widget section
4. Configure:
   - Widget position
   - Color scheme
   - Result layout
   - Number of results

### Advanced Features

#### Semantic Search

Enable AI-powered understanding:

```liquid
{% raw %}
{% render 'searchaf-widget',
  semantic: true,
  min_relevance: 0.7
%}
{% endraw %}
```

#### Custom Filters

Add faceted search with filters:

```liquid
{% raw %}
{% render 'searchaf-widget',
  filters: 'price,color,size,brand'
%}
{% endraw %}
```

## Webhooks

The app automatically configures webhooks for:

- Product creation/updates/deletion
- Inventory changes
- Collection updates

These ensure your search index stays in sync.

## Analytics

View search analytics in the SearchAF dashboard:

- Top searches
- No-result queries
- Click-through rates
- Conversion metrics

## Troubleshooting

### Products Not Appearing

1. Check webhook status in Shopify settings
2. Verify products are published
3. Trigger manual sync from SearchAF dashboard

### Search Widget Not Showing

1. Confirm theme integration is enabled
2. Check for JavaScript errors in console
3. Verify app is installed and active

## Next Steps

- [Semantic Search Guide](/guides/semantic-search)
- [API Reference](/docs/api)
- [Advanced Customization](/guides/customization)
