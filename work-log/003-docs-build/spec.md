# Task: Build Custom OpenAPI to MDX Generator

## Objective

Create a Node.js script that automatically generates MDX documentation files from the `openapi.yaml` specification. The generated files will be placed in `content/docs/api/` and will integrate seamlessly with the existing Next.js App Router + MDX documentation architecture.

## Context

The website now uses a custom MDX-based documentation system (migrated from Nextra) that:
- Renders MDX files from `content/docs/` via `app/docs/[[...slug]]/page.tsx`
- Uses a manually configured sidebar defined in `config/docs-navigation.ts`
- Leverages Tailwind CSS prose classes for content styling
- Outputs static files for GitHub Pages deployment

The API reference documentation currently exists as manually authored MDX files. This task will automate the generation of these files from the OpenAPI specification, ensuring consistency and reducing maintenance overhead.

## High-Level Requirements

- Create a generator script at `scripts/generate-api-docs.js`
- Parse the existing `openapi.yaml` file
- Generate well-structured MDX files organized by API resource/tag
- Optionally update `config/docs-navigation.ts` with generated API endpoints
- Support running as an npm script (`npm run generate-api-docs`)
- Preserve custom formatting compatible with the existing prose styling

## Technical Specifications

### 1. Dependencies

Install required packages:
```bash
npm install -D js-yaml
```

This provides YAML parsing capabilities. No other heavy dependencies are needed.

### 2. Script Structure

**Location:** `scripts/generate-api-docs.js`

**Core responsibilities:**
1. Read and parse `openapi.yaml`
2. Extract paths, operations, schemas, and components
3. Group endpoints by tags (e.g., Authentication, Users, Organizations)
4. Generate MDX files for each tag/resource group
5. Create proper frontmatter for metadata
6. Format request/response examples
7. Document parameters, schemas, and error responses

### 3. Output Structure

**Directory:** `content/docs/api/`

**File organization options:**

**Option A: One file per tag** (Recommended for initial implementation)
- `content/docs/api/authentication.mdx`
- `content/docs/api/users.mdx`
- `content/docs/api/organizations.mdx`
- `content/docs/api/projects.mdx`
- etc.

**Option B: One file per endpoint** (For granular control)
- `content/docs/api/authentication/oauth-login.mdx`
- `content/docs/api/users/get-current-user.mdx`
- etc.

### 4. MDX File Format

Each generated MDX file should include:

**Frontmatter:**
```yaml
---
title: "Authentication"
description: "OAuth and JWT authentication endpoints"
---
```

**Content sections:**
1. Overview/introduction
2. Endpoint documentation with:
   - HTTP method and path
   - Description
   - Parameters (path, query, body)
   - Request examples
   - Response examples
   - Error responses

**Example output:**

```mdx
---
title: "Authentication"
description: "OAuth and JWT authentication endpoints"
---

# Authentication

OAuth and JWT authentication endpoints for the SearchAF API.

## Initiate OAuth Login

```
GET /auth/oauth/{provider}/login
```

Redirects to OAuth provider login page.

### Parameters

| Name | Type | Location | Description |
|------|------|----------|-------------|
| `provider` | string | path | OAuth provider: `google`, `github`, `shopify` |
| `redirect_uri` | string | query | Post-login redirect URL |

### Example Request

```bash
curl https://searchaf-api.antfly.io/api/v1/auth/oauth/google/login?redirect_uri=https://myapp.com/callback
```

### Response

**302 Redirect** - Redirects to OAuth provider

---

## OAuth Callback Handler

```
GET /auth/oauth/{provider}/callback
```

Handles OAuth provider callback and generates JWT.

### Parameters

| Name | Type | Location | Description |
|------|------|----------|-------------|
| `provider` | string | path | OAuth provider |
| `code` | string | query | OAuth authorization code |
| `state` | string | query | CSRF protection state |

### Response

**200 OK**

```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```
```

### 5. Navigation Configuration

The script should have an option to automatically update `config/docs-navigation.ts` with generated API endpoints. This can be:

**Option 1:** Manual update (keep existing navigation as-is)
**Option 2:** Automatic update (regenerate API Reference section)
**Option 3:** Hybrid (generate a suggestion file that can be manually merged)

Recommend starting with **Option 3** - output a `config/docs-navigation.generated.ts` file that developers can review and merge.

### 6. Script Interface

Add npm script to `package.json`:

```json
{
  "scripts": {
    "generate-api-docs": "node scripts/generate-api-docs.js"
  }
}
```

**CLI options (optional enhancements):**
- `--output-dir` - Specify output directory
- `--group-by` - Group by 'tag' or 'path'
- `--update-nav` - Automatically update navigation config
- `--watch` - Watch mode for development

### 7. Features & Enhancements

**Phase 1 (MVP):**
- Parse OpenAPI spec
- Generate one MDX file per tag
- Include endpoints, parameters, and basic examples
- Proper frontmatter

**Phase 2 (Enhancements):**
- Generate navigation config
- Include response schemas with proper formatting
- Add syntax highlighting hints for code blocks
- Support for request body schemas
- Error response documentation
- Custom MDX components for API elements

**Phase 3 (Advanced):**
- Interactive API playground components
- Request/response validation
- Code generation in multiple languages
- Type definitions export

## Implementation Steps

1. **Setup Script Skeleton**
   - Create `scripts/generate-api-docs.js`
   - Import `js-yaml` and `fs/promises`
   - Add basic error handling

2. **Parse OpenAPI Spec**
   - Read `openapi.yaml`
   - Parse with `js-yaml`
   - Extract: info, servers, paths, components, tags

3. **Group Endpoints**
   - Group paths by tags
   - Create data structure for each endpoint including:
     - Method, path, summary, description
     - Parameters (path, query, header, body)
     - Responses (success and error cases)
     - Security requirements

4. **Generate MDX Content**
   - Create template functions for:
     - Frontmatter
     - Endpoint headers
     - Parameter tables
     - Request examples
     - Response examples
   - Use template literals for clean formatting

5. **Write MDX Files**
   - Clear existing generated files (with safety checks)
   - Write one file per tag to `content/docs/api/`
   - Ensure proper formatting and spacing

6. **Generate Navigation Suggestion**
   - Build navigation structure from generated files
   - Output to `config/docs-navigation.generated.ts`
   - Include instructions for manual merge

7. **Testing & Validation**
   - Run generator script
   - Verify MDX files are created
   - Test rendering in Next.js dev server
   - Check formatting and links
   - Validate against OpenAPI spec

8. **Add to Build Pipeline**
   - Document when to run the script (pre-build, manual, CI/CD)
   - Add to README with instructions
   - Consider adding to `prebuild` script if appropriate

## Code Quality Requirements

- **TypeScript types:** Use JSDoc comments for type hints
- **Error handling:** Proper try/catch with helpful error messages
- **Validation:** Warn about missing required fields in OpenAPI spec
- **Logging:** Console output showing progress and files generated
- **Documentation:** Comments explaining complex logic
- **Idempotency:** Running multiple times produces same output

## Expected Output

After running `npm run generate-api-docs`:

1. Generated MDX files in `content/docs/api/`:
   - `authentication.mdx`
   - `users.mdx`
   - `organizations.mdx`
   - `projects.mdx`
   - `api-keys.mdx`
   - `subscriptions.mdx`
   - `usage.mdx`
   - `webhooks.mdx`
   - `search.mdx`

2. Optional: `config/docs-navigation.generated.ts` with suggested navigation structure

3. Console output showing:
   - Number of endpoints processed
   - Files generated
   - Any warnings or issues

## Verification Steps

1. Run the generator: `npm run generate-api-docs`
2. Start dev server: `npm run dev`
3. Navigate to `/docs/api/authentication` and other API pages
4. Verify:
   - Content renders correctly
   - Code blocks have proper formatting
   - Tables are readable
   - Links work (if any internal references)
   - Sidebar navigation is accurate

## Future Considerations

- **Versioning:** Support multiple API versions (v1, v2)
- **i18n:** Generate docs in multiple languages
- **Custom components:** Use MDX components for interactive elements
- **Validation:** Add OpenAPI spec validation before generation
- **Incremental generation:** Only regenerate changed endpoints
- **Source mapping:** Link generated docs back to spec sections

## Additional Components & Requirements

### MethodBadge Component

Create a custom MDX component to display HTTP methods as colored badges:
- Located at `components/docs/method-badge.tsx`
- Displays method (GET/POST/PUT/PATCH/DELETE) in color-coded badge
- Shows endpoint path inline with the badge
- Uses shadcn/ui Badge component with appropriate colors:
  - GET: blue
  - POST: green
  - PUT/PATCH: amber
  - DELETE: red

### Schema Resolution

Implement schema reference resolution for response bodies:
- Create `generateExampleFromSchema()` function to recursively resolve `$ref` references
- Generate realistic example JSON from schema definitions
- Support all OpenAPI schema types (object, array, string, number, boolean)
- Handle circular references with visited tracking
- Support special formats (uuid, date-time, email, uri)
- Use enum values when available
- Handle allOf, anyOf, oneOf compositions

### Code Formatting Standards

**Code Examples:**
- Use 4-space indentation for all code samples
- Generate samples in: cURL, TypeScript, JavaScript, Python, Go
- Include `Authorization: Bearer YOUR_API_KEY` header in all examples
- Format embedded JSON with proper indentation

**Response Bodies:**
- Use 2-space indentation for JSON responses
- Re-parse and re-format JSON in ResponseTabs component to ensure proper display
- Apply syntax highlighting with VS Code Dark Plus theme

### Security Documentation

For endpoints requiring BearerAuth, display:
```
### Security

Provide your bearer token in the Authorization header when making requests to protected resources.

Example: `Authorization: Bearer YOUR_API_KEY`
```

### Navigation Updates

- Script directly updates `config/docs-navigation.ts`
- Generates "API Documentation" section with all endpoint groups
- Maintains existing navigation sections (Getting Started, Core Concepts, Integrations)

## Success Criteria

- ✅ Script successfully parses `openapi.yaml`
- ✅ Generates valid MDX files without errors
- ✅ Files render correctly in the docs site
- ✅ Content includes all essential API information
- ✅ Formatting is consistent and professional
- ✅ Can be run repeatedly without issues
- ✅ Reduces manual documentation effort
- ✅ Response schemas are fully resolved (no placeholder text)
- ✅ Code examples use consistent 4-space indentation
- ✅ Method badges display with appropriate colors
- ✅ Security sections provide clear authentication instructions
