# Spec: Interactive API Playground for Documentation

## Overview

Add an interactive API playground component to the documentation system that allows users to test API endpoints directly from the docs. Similar to Readme.com's playground, users should be able to input their API credentials, see code examples in multiple languages, execute requests, and view responses in real-time.

## Goals

1. **Reduce friction**: Allow developers to test APIs without leaving documentation
2. **Improve onboarding**: Help users understand API behavior through live interaction
3. **Show, don't tell**: Demonstrate actual API responses with real data
4. **Multi-language support**: Provide code examples in popular languages
5. **Persistent authentication**: Remember API credentials across sessions

## User Experience

### Core User Flow

1. User navigates to an API endpoint documentation page (e.g., `/docs/api/search`)
2. Playground component is embedded inline with the documentation
3. User enters their API key/token in a secure input field
4. User selects their preferred language/framework from tabs (JavaScript, Python, cURL, etc.)
5. User reviews the auto-generated code example with their credentials
6. User can modify request parameters, headers, and body
7. User clicks "Try it" to execute the request
8. Response is displayed with syntax highlighting, status code, and timing information
9. User can copy the code example or response for use in their application

### Visual Design

```
┌─────────────────────────────────────────────────────────┐
│ 🔑 API Authentication                                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ API Key: [sk_live_••••••••••••••••] 👁 [Clear]      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Request                                                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [JavaScript] [Python] [cURL] [Go] [Ruby]            │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ const response = await fetch(                       │ │
│ │   'https://api.searchaf.io/v1/search',              │ │
│ │   {                                                  │ │
│ │     method: 'POST',                                  │ │
│ │     headers: {                                       │ │
│ │       'X-API-Key': 'sk_live_...',                   │ │
│ │       'Content-Type': 'application/json'            │ │
│ │     },                                               │ │
│ │     body: JSON.stringify({                          │ │
│ │       query: 'blue shoes',                          │ │
│ │       limit: 20                                      │ │
│ │     })                                               │ │
│ │   }                                                  │ │
│ │ );                                                   │ │
│ │                                     [Copy] [Try it]  │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Response                                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Status: 200 OK • 45ms                    [Copy]     │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ {                                                    │ │
│ │   "results": [                                       │ │
│ │     {                                                │ │
│ │       "id": "prod_123",                              │ │
│ │       "title": "Nike Air Zoom Pegasus",             │ │
│ │       "score": 0.95                                  │ │
│ │     }                                                │ │
│ │   ],                                                 │ │
│ │   "total": 42,                                       │ │
│ │   "took_ms": 12                                      │ │
│ │ }                                                    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Technical Architecture

### Component Structure

```
components/
  docs/
    playground/
      api-playground.tsx          # Main playground component
      api-auth-input.tsx          # API token/key input with persistence
      code-tabs.tsx               # Language/framework tabs
      code-block.tsx              # Syntax-highlighted code display
      request-editor.tsx          # Editable request parameters
      response-viewer.tsx         # Response display with formatting
      use-api-playground.ts       # Custom hook for state management

lib/
  playground/
    code-generators.ts            # Generate code for different languages
    api-client.ts                 # HTTP client wrapper
    storage.ts                    # localStorage helpers for credentials
```

### Data Flow

1. **Authentication State**
   - Store API key in `localStorage` (encrypted if possible)
   - Provide "Clear credentials" option
   - Option to use session-only storage (cleared on tab close)

2. **Request Building**
   - Base URL from config
   - Path parameters substitution
   - Headers auto-populated (auth, content-type, etc.)
   - Body from user-editable JSON

3. **Code Generation**
   - Template-based code generation for each language
   - Inject user's API key into examples
   - Support for different HTTP clients (fetch, axios, requests, etc.)

4. **Request Execution**
   - Use Fetch API with AbortController for cancellation
   - Timeout handling (default 30s)
   - Error handling (network, auth, validation, etc.)
   - CORS proxy if needed (backend endpoint)

5. **Response Handling**
   - Parse JSON responses
   - Display non-JSON responses (HTML, plain text)
   - Show response headers
   - Display timing information

## MDX Integration

### Usage in Documentation

```mdx
# Search API

Execute semantic and keyword searches with advanced filtering to power intelligent answers.

<ApiPlayground
  endpoint="/projects/{project_id}/search"
  method="POST"
  baseUrl="https://searchaf-api.antfly.io/api/v1"
  authentication={{
    type: "api-key",
    header: "X-API-Key",
    placeholder: "sk_live_..."
  }}
  pathParams={{
    project_id: {
      description: "Your project ID",
      default: "proj_abc123"
    }
  }}
  defaultBody={{
    query: "blue running shoes",
    limit: 20,
    filters: {
      category: ["shoes", "running"],
      price_range: {
        min: 50,
        max: 200
      }
    }
  }}
  languages={["javascript", "python", "curl", "go"]}
/>

## Response Format

The search endpoint returns...
```

### Component Props Interface

```typescript
interface ApiPlaygroundProps {
  // Required
  endpoint: string              // API endpoint path
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'

  // Optional
  baseUrl?: string              // Base URL (default from config)
  authentication?: {
    type: 'api-key' | 'bearer'
    header?: string             // Header name (default: X-API-Key or Authorization)
    placeholder?: string        // Placeholder text for input
  }
  pathParams?: Record<string, {
    description: string
    default?: string
    required?: boolean
  }>
  queryParams?: Record<string, {
    description: string
    default?: string | number | boolean
    type?: 'string' | 'number' | 'boolean'
  }>
  headers?: Record<string, string>  // Additional headers
  defaultBody?: object          // Default request body (for POST/PATCH/PUT)
  languages?: string[]          // Supported languages (default: all)
  enableTryIt?: boolean         // Allow live API calls (default: true)
  mockResponse?: object         // Mock response for demo purposes
}
```

## Feature Breakdown

### MVP (Phase 1) - Core Functionality

**Must-Have:**
1. ✅ API key input with localStorage persistence
2. ✅ Code examples in 3 languages (JavaScript, Python, cURL)
3. ✅ Syntax highlighting for code blocks
4. ✅ "Try it" button to execute requests
5. ✅ JSON response viewer with formatting
6. ✅ Error handling and display
7. ✅ Copy code button
8. ✅ Path parameter substitution

**Success Criteria:**
- User can input API key and it persists across page reloads
- User can see code examples in multiple languages
- User can execute requests and see real responses
- Error states are clear and actionable

### Phase 2 - Enhanced Features

**Should-Have:**
1. 🔶 Editable request parameters (body, query params, headers)
2. 🔶 Response headers display
3. 🔶 Request timing/performance metrics
4. 🔶 More language examples (Go, Ruby, PHP, Java)
5. 🔶 Request history (last 5-10 requests)
6. 🔶 Export response as JSON file
7. 🔶 Dark mode support
8. 🔶 Collapsible sections

### Phase 3 - Advanced Features

**Nice-to-Have:**
1. 🔷 Code snippet generation with user's actual data
2. 🔷 Auto-complete for request body based on schema
3. 🔷 Response schema validation
4. 🔷 Save/load custom request templates
5. 🔷 Share playground state via URL
6. 🔷 WebSocket/SSE support for streaming endpoints
7. 🔷 Rate limit indicators
8. 🔷 Multi-step API flows (e.g., OAuth flow)

## Implementation Steps

### Step 1: Core Components (2-3 hours)

1. Create `ApiPlayground` component skeleton
2. Implement `ApiAuthInput` with localStorage
3. Build `CodeTabs` for language switching
4. Add `CodeBlock` with syntax highlighting (using `shiki` or `react-syntax-highlighter`)

### Step 2: Code Generation (1-2 hours)

1. Create code templates for JavaScript, Python, cURL
2. Implement parameter substitution
3. Add authentication header injection
4. Build code generator utility functions

### Step 3: Request Execution (2-3 hours)

1. Build API client wrapper with error handling
2. Implement "Try it" functionality
3. Add loading states and spinners
4. Handle CORS issues (proxy if needed)

### Step 4: Response Display (1-2 hours)

1. Create `ResponseViewer` component
2. Add JSON syntax highlighting
3. Display status code and timing
4. Add copy response button

### Step 5: MDX Integration (1 hour)

1. Update `mdx-components.tsx` to include `ApiPlayground`
2. Create example documentation page
3. Test component in docs context

### Step 6: Polish & Testing (2-3 hours)

1. Responsive design
2. Accessibility (keyboard navigation, screen readers)
3. Error message improvements
4. Edge case handling
5. Documentation for using the component

**Total Estimate: 9-14 hours**

## Technical Considerations

### Security

1. **API Key Storage**
   - Store in localStorage (not sessionStorage for persistence)
   - Consider encryption (Web Crypto API)
   - Provide option to clear credentials
   - Never log or send keys to analytics

2. **Request Safety**
   - Validate inputs before sending
   - Sanitize user-provided data
   - Rate limit client-side requests
   - Show warning when making requests to production

3. **CORS Handling**
   - Document CORS requirements for API
   - Provide proxy option if needed
   - Handle preflight requests

### Performance

1. **Code Highlighting**
   - Lazy load syntax highlighter
   - Use web workers for large responses
   - Debounce parameter changes

2. **State Management**
   - Use React Context for shared auth state across playgrounds
   - Memoize code generation
   - Virtualize large response bodies

### Browser Compatibility

- Modern browsers only (ES2020+)
- Fetch API support required
- localStorage support required
- Graceful degradation if features unavailable

## Configuration

### Global Playground Config

```typescript
// config/playground.ts
export const playgroundConfig = {
  baseUrl: 'https://searchaf-api.antfly.io/api/v1',
  defaultLanguages: ['javascript', 'python', 'curl', 'go'],
  timeout: 30000, // 30 seconds
  enableProxy: false,
  proxyUrl: '/api/proxy', // If CORS proxy needed
  storage: {
    keyPrefix: 'searchaf_playground_',
    encryptKeys: false,
  },
  ui: {
    theme: 'auto', // 'light' | 'dark' | 'auto'
    defaultTab: 'javascript',
  },
}
```

## Edge Cases & Error Handling

### Authentication Errors
- **No API key provided**: Show friendly prompt to enter key
- **Invalid key format**: Validate format before request
- **401 Unauthorized**: Clear message with link to get API key
- **403 Forbidden**: Explain permission issue

### Network Errors
- **Timeout**: Show retry option with longer timeout
- **Network failure**: Check connection, suggest checking CORS
- **Rate limiting**: Display rate limit info from headers

### Request Errors
- **400 Bad Request**: Show validation errors clearly
- **404 Not Found**: Verify endpoint path
- **500 Server Error**: Display error, suggest checking status page

### Response Handling
- **Large responses**: Virtualize or paginate
- **Binary responses**: Show download option
- **Malformed JSON**: Display as plain text

## Future Enhancements

### Integration with OpenAPI Spec
- Auto-generate playgrounds from OpenAPI schema
- Validate requests against schema
- Auto-complete based on schema definitions

### Advanced Features
- GraphQL playground variant
- WebSocket testing
- Batch request testing
- Performance profiling
- Mock server mode

### Analytics (Optional)
- Track which endpoints are tested most
- Monitor error rates
- Measure time-to-first-API-call

## Dependencies

### New Packages Required

```json
{
  "dependencies": {
    "shiki": "^1.0.0",           // Syntax highlighting
    "copy-to-clipboard": "^3.3.3" // Copy functionality
  }
}
```

### Existing Packages to Use
- `lucide-react` - Icons
- `@/components/ui/*` - shadcn/ui components
- `tailwindcss` - Styling
- `next/image` - Optimized images

## Success Metrics

### User Engagement
- % of doc visitors who interact with playground
- Number of API calls made from playground
- Time spent on pages with playground vs without

### Developer Experience
- Reduction in time-to-first-API-call
- Reduction in support tickets about API usage
- Positive feedback in user surveys

### Technical
- Playground component renders in <100ms
- API requests complete in <2s (p95)
- Zero JavaScript errors in production
- 100% accessibility score

## Open Questions

1. Should we support mock responses for users without API keys?
2. Do we need a backend proxy to avoid CORS issues?
3. Should playgrounds work in static export mode (GitHub Pages)?
4. How do we handle pagination in responses?
5. Should we add request/response size limits?

## Appendix: Code Templates

### JavaScript Template

```javascript
const response = await fetch('{{baseUrl}}{{endpoint}}', {
  method: '{{method}}',
  headers: {
    '{{authHeader}}': '{{apiKey}}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({{body}})
});

const data = await response.json();
console.log(data);
```

### Python Template

```python
import requests

response = requests.{{method.lower()}}(
    '{{baseUrl}}{{endpoint}}',
    headers={
        '{{authHeader}}': '{{apiKey}}',
        'Content-Type': 'application/json'
    },
    json={{body}}
)

data = response.json()
print(data)
```

### cURL Template

```bash
curl -X {{method}} '{{baseUrl}}{{endpoint}}' \
  -H '{{authHeader}}: {{apiKey}}' \
  -H 'Content-Type: application/json' \
  -d '{{bodyJson}}'
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-25
**Status:** Draft Specification
