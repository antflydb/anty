# Task: API Documentation Enhancements - Request Examples, Theme Toggle & Navigation

## Objective

Enhance the API documentation with complete request body examples, implement a theme toggle for light/dark mode preferences, and improve API navigation with accordion-style tag groups and method badges.

## Context

The current API documentation generator (`scripts/generate-api-docs.js`) displays schema types for request bodies but does not include example JSON objects in the documentation or code samples. Additionally, the site lacks a theme toggle, requiring users to rely solely on system preferences. The API navigation sidebar does not display individual endpoints or method badges, making it difficult to quickly identify and navigate to specific API endpoints.

## High-Level Requirements

1. **Request Body Examples:**
   - Generate example JSON objects from request body schemas
   - Include examples in the "Request Body" section of each endpoint
   - Embed examples in all code samples (cURL, TypeScript, JavaScript, Python, Go)

2. **Theme Toggle:**
   - Add a theme toggle button to the header navigation
   - Support three modes: Light, Dark, System
   - Persist user preference in localStorage
   - Position at top-right of navigation, before "Sign in" link
   - Use appropriate icon (Sun/Moon)

3. **API Navigation Enhancement:**
   - Display individual endpoints under each API tag group in sidebar
   - Show HTTP method badges (GET, POST, PUT, DELETE, etc.) for each endpoint
   - Implement accordion behavior: only one tag group open at a time
   - Clicking a tag group navigates to that tag page and toggles its endpoint list
   - Method badges are color-coded and right-justified

## Technical Specifications

### Part 1: Request Body Examples

#### Current State

Currently, for endpoints with request bodies:
- Only Content-Type is shown: `**Content-Type:** \`application/json\``
- No example JSON is provided
- Code samples don't include request body data

#### Requirements

**1. Request Body Section**

Add example JSON after Content-Type in MDX:

```markdown
### Request Body

**Content-Type:** `application/json`

**Example:**

```json
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "billing_email": "billing@acme.com",
  "settings": {}
}
```
```

**2. Schema Resolution for Request Bodies**

Extend the existing `generateExampleFromSchema()` function to support request body schemas:
- Resolve `$ref` references in request body schemas
- Generate realistic example data based on schema properties
- Handle required vs optional fields appropriately
- Use schema examples when provided in OpenAPI spec

**3. Code Sample Integration**

Update all five code generators to include request body examples:

```javascript
// TypeScript example
const response = await fetch('https://api.example.com/organizations', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        "name": "Acme Corp",
        "slug": "acme-corp",
        "billing_email": "billing@acme.com",
        "settings": {}
    })
});
```

**4. Implementation Changes**

Update `scripts/generate-api-docs.js`:

1. In `generateEndpointSection()`:
   - Check for `operation.requestBody?.content?.['application/json']?.schema`
   - Generate example using `generateExampleFromSchema()`
   - Add example JSON to MDX content after Content-Type

2. Update all code generators:
   - `generateCurlSample()` - Add `-d` flag with JSON
   - `generateTypeScriptSample()` - Add `body: JSON.stringify()`
   - `generateJavaScriptSample()` - Add `body: JSON.stringify()`
   - `generatePythonSample()` - Add `json=` parameter
   - `generateGoSample()` - Add body bytes and content-type header

3. Extract request body logic to reusable helper:
   ```javascript
   function getRequestBodyExample(operation, spec) {
     const schema = operation.requestBody?.content?.['application/json']?.schema
     if (!schema) return null
     return generateExampleFromSchema(schema, spec)
   }
   ```

### Part 2: Theme Toggle

#### Requirements

**1. Theme Toggle Component**

Create `components/ui/theme-toggle.tsx`:
- Three-state toggle: Light → Dark → System
- Visual icon changes (Sun for light, Moon for dark, Monitor/Auto for system)
- Dropdown or cycle-through button interface
- Uses next-themes for theme management

**2. Theme Provider Setup**

Install and configure next-themes:
```bash
npm install next-themes
```

Wrap app in `app/layout.tsx`:
```tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**3. Header Integration**

Update `components/layout/header.tsx`:
- Add ThemeToggle component between Resources and "Sign in"
- Desktop: Show as icon button
- Mobile: Include in mobile menu drawer
- Ensure proper spacing and alignment

**4. Styling Considerations**

- Use existing Tailwind dark mode classes (already configured)
- Ensure all components respect `dark:` variants
- Test documentation pages for dark mode readability
- Verify code blocks maintain syntax highlighting in both themes

**5. Implementation Details**

Theme toggle button states:
- **Light Mode:** Sun icon, tooltip "Switch to dark mode"
- **Dark Mode:** Moon icon, tooltip "Switch to system"
- **System Mode:** Monitor/Auto icon, tooltip "Switch to light mode"

Store preference:
- Key: `theme` in localStorage
- Values: `light`, `dark`, `system`
- Auto-apply on page load

### Part 3: API Navigation Enhancement

#### Requirements

**1. Navigation Structure**

- Generate navigation items with nested endpoint sub-items for each API tag
- Each endpoint item includes: title, href (with anchor), method, and path
- Update `NavItem` interface to include optional `method` property

**2. Sidebar Behavior**

- API tag groups implement accordion behavior (only one open at a time)
- Clicking a tag group:
  - Navigates to the tag's documentation page
  - Opens that group's endpoint list
  - Closes other API tag groups
- Tag groups do not display chevron icons
- Non-API navigation items retain existing expand/collapse behavior

**3. Method Badge Display**

- Display color-coded method badges next to endpoint titles
- Method badge colors:
  - GET: Blue
  - POST: Green
  - PUT/PATCH: Amber
  - DELETE: Red
- Badges are compact and right-justified in the navigation item
- Use existing badge component with custom styling

## Implementation Steps

### Phase 1: Request Body Examples

1. **Add Request Body Helper Function**
   - Create `getRequestBodyExample()` in generator script
   - Use existing `generateExampleFromSchema()` for resolution

2. **Update MDX Generation**
   - Modify `generateEndpointSection()` to include request body examples
   - Format JSON with 2-space indentation
   - Add proper markdown fencing

3. **Update Code Generators**
   - Modify all five generator functions to accept request body
   - Format embedded JSON with 4-space indentation
   - Update Content-Type headers where needed

4. **Test & Regenerate**
   - Run `npm run generate-api-docs`
   - Verify request body examples appear in MDX
   - Check code samples include proper JSON
   - Test with endpoints that have and don't have request bodies

### Phase 2: Theme Toggle

1. **Install Dependencies**
   ```bash
   npm install next-themes
   ```

2. **Create Theme Provider**
   - Update `app/layout.tsx` with ThemeProvider wrapper
   - Configure attribute as "class" for Tailwind
   - Enable system preference detection

3. **Build Theme Toggle Component**
   - Create `components/ui/theme-toggle.tsx`
   - Implement three-state cycle logic
   - Add appropriate icons (lucide-react: Sun, Moon, Monitor)
   - Include smooth transitions

4. **Integrate in Header**
   - Import ThemeToggle in header component
   - Position before "Sign in" link
   - Add to mobile menu
   - Test responsive behavior

5. **Dark Mode Audit**
   - Review all pages for dark mode appearance
   - Fix any components with poor contrast
   - Verify code syntax highlighting works
   - Test documentation prose styles

6. **Test Theme Persistence**
   - Change theme and refresh page
   - Verify preference is remembered
   - Test system preference changes
   - Check SSR hydration (no flash of wrong theme)

## Code Quality Requirements

- Maintain existing code style and patterns
- Use TypeScript for theme toggle component
- Ensure accessibility (ARIA labels, keyboard navigation)
- Add JSDoc comments for new generator functions
- Test all theme modes across different pages
- Verify no hydration mismatches with theme provider

## Expected Output

### Request Body Examples

After regeneration, endpoints with request bodies should show:

```markdown
### Request Body

**Content-Type:** `application/json`

**Example:**

```json
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "billing_email": "billing@acme.com"
}
```

### Code Examples

<CodeTabs samples={[
  {
    language: "cURL",
    code: `curl -X POST "https://searchaf-api.antfly.io/api/v1/organizations" \\
    -H "Authorization: Bearer YOUR_API_KEY" \\
    -H "Content-Type: application/json" \\
    -d '{
    "name": "Acme Corp",
    "slug": "acme-corp",
    "billing_email": "billing@acme.com"
}'`
  }
]} />
```

### Theme Toggle

- Icon button visible in header (desktop) and mobile menu
- Clicking cycles through: Light → Dark → System
- Icon changes appropriately: ☀️ → 🌙 → 💻
- Preference persists across sessions
- No flash of unstyled content on page load

## Verification Steps

### Request Body Examples

1. Run `npm run generate-api-docs`
2. Check generated MDX files for request body examples
3. Verify examples appear in:
   - POST /organizations
   - POST /projects
   - PUT /users/me
   - Other endpoints with request bodies
4. Confirm code samples include JSON in all 5 languages
5. Test that JSON formatting is consistent (4 spaces in code, 2 in examples)

### Theme Toggle

1. Start dev server: `npm run dev`
2. Navigate to various pages
3. Test theme toggle functionality:
   - Click through all three modes
   - Verify visual changes apply immediately
   - Check localStorage stores preference
4. Refresh page and verify theme persists
5. Test mobile menu includes theme toggle
6. Change system preference and verify "System" mode follows
7. Check documentation pages for readability in dark mode
8. Verify no console errors or hydration warnings

## Success Criteria

- ✅ Request body examples generated from schemas
- ✅ Examples appear in MDX documentation
- ✅ All code samples include request body JSON
- ✅ JSON formatting is consistent across examples
- ✅ Theme toggle installed and functional
- ✅ Three modes work correctly (Light/Dark/System)
- ✅ Theme preference persists in localStorage
- ✅ No hydration mismatches or flashes
- ✅ Dark mode styling is readable across all pages
- ✅ Theme toggle accessible via keyboard navigation
- ✅ Mobile menu includes theme toggle option
- ✅ API navigation displays individual endpoints with method badges
- ✅ Accordion behavior works (one tag group open at a time)
- ✅ Clicking tag groups navigates and toggles endpoint list
- ✅ Method badges are color-coded and right-justified
- ✅ Tag groups do not show chevron icons
