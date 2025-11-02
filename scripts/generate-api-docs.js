#!/usr/bin/env node

/**
 * OpenAPI to MDX Generator
 *
 * Generates MDX documentation files from openapi.yaml specification.
 * Output files are placed in content/docs/api/ and are compatible with
 * the Next.js App Router + MDX documentation architecture.
 *
 * Usage: node scripts/generate-api-docs.js
 */

const fs = require('fs').promises
const path = require('path')
const yaml = require('js-yaml')

// Configuration
const OPENAPI_PATH = path.join(process.cwd(), 'openapi.yaml')
const OUTPUT_DIR = path.join(process.cwd(), 'content/docs/api')
const NAV_FILE = path.join(process.cwd(), 'config/docs-navigation.ts')

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting API documentation generation...\n')

  try {
    // Read and parse OpenAPI spec
    console.log('📖 Reading OpenAPI specification...')
    const spec = await readOpenAPISpec()
    console.log(`✓ Loaded OpenAPI ${spec.info.version}\n`)

    // Group endpoints by tags
    console.log('🏷️  Grouping endpoints by tags...')
    const groupedEndpoints = groupEndpointsByTag(spec)
    console.log(`✓ Found ${Object.keys(groupedEndpoints).length} tag groups\n`)

    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true })

    // Generate MDX files
    console.log('📝 Generating MDX files...')
    const generatedFiles = []

    for (const [tag, endpoints] of Object.entries(groupedEndpoints)) {
      const filename = await generateMDXFile(tag, endpoints, spec)
      generatedFiles.push(filename)
      console.log(`  ✓ Generated ${filename}`)
    }

    // Update navigation configuration
    console.log('\n🧭 Updating navigation configuration...')
    await updateNavigationConfig(groupedEndpoints)
    console.log(`  ✓ Updated ${path.basename(NAV_FILE)}`)

    // Summary
    console.log(`\n✨ Success! Generated ${generatedFiles.length} API documentation files.`)
    console.log(`\n📂 Files created in: ${OUTPUT_DIR}`)
    console.log(`📋 Navigation updated in: ${NAV_FILE}`)

  } catch (error) {
    console.error('\n❌ Error generating documentation:', error.message)
    process.exit(1)
  }
}

/**
 * Read and parse the OpenAPI YAML specification
 * @returns {Object} Parsed OpenAPI spec
 */
async function readOpenAPISpec() {
  try {
    const content = await fs.readFile(OPENAPI_PATH, 'utf8')
    return yaml.load(content)
  } catch (error) {
    throw new Error(`Failed to read OpenAPI spec: ${error.message}`)
  }
}

/**
 * Group API endpoints by their tags
 * @param {Object} spec - OpenAPI specification
 * @returns {Object} Endpoints grouped by tag
 */
function groupEndpointsByTag(spec) {
  const grouped = {}

  // Initialize groups from tags
  if (spec.tags) {
    spec.tags.forEach(tag => {
      grouped[tag.name] = {
        title: tag['x-displayName'] || tag.name,
        description: tag.description,
        endpoints: []
      }
    })
  }

  // Group endpoints
  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        const tags = operation.tags || ['Untagged']

        tags.forEach(tag => {
          if (!grouped[tag]) {
            grouped[tag] = {
              title: tag,
              description: '',
              endpoints: []
            }
          }

          grouped[tag].endpoints.push({
            path,
            method: method.toUpperCase(),
            operation,
            operationId: operation.operationId
          })
        })
      }
    }
  }

  return grouped
}

/**
 * Generate MDX file for a tag group
 * @param {string} tag - Tag name
 * @param {Object} group - Endpoint group data
 * @param {Object} spec - Full OpenAPI spec
 * @returns {string} Generated filename
 */
async function generateMDXFile(tag, group, spec) {
  const slug = tagToSlug(tag)
  const filename = `${slug}.mdx`
  const filepath = path.join(OUTPUT_DIR, filename)

  // Generate frontmatter
  const frontmatter = `---
title: "${group.title}"
description: "${group.description || `${group.title} API endpoints`}"
---

`

  // Generate content
  let content = frontmatter
  content += `# ${group.title}\n\n`

  if (group.description) {
    content += `${group.description}\n\n`
  }

  // Add each endpoint
  for (const endpoint of group.endpoints) {
    content += generateEndpointSection(endpoint, spec)
    content += '\n---\n\n'
  }

  // Remove trailing separator
  content = content.replace(/\n---\n\n$/, '\n')

  await fs.writeFile(filepath, content, 'utf8')
  return filename
}

/**
 * Generate documentation section for a single endpoint
 * @param {Object} endpoint - Endpoint data
 * @param {Object} spec - Full OpenAPI spec
 * @returns {string} Markdown content
 */
function generateEndpointSection(endpoint, spec) {
  const { method, path, operation } = endpoint
  let content = ''

  // Endpoint header
  content += `## ${operation.summary || path}\n\n`

  // Method and path
  content += `<MethodBadge method="${method}" path="${path}" />\n\n`

  // Description
  if (operation.description) {
    content += `${operation.description}\n\n`
  }

  // Security requirements
  if (operation.security && operation.security.length > 0) {
    const authTypes = operation.security.flatMap(s => Object.keys(s))

    // Check if BearerAuth is required
    if (authTypes.includes('BearerAuth')) {
      content += '### Security\n\nProvide your bearer token in the Authorization header when making requests to protected resources.\n\n'
      content += 'Example: `Authorization: Bearer YOUR_API_KEY`\n\n'
    } else {
      content += '**Authentication required:** '
      content += `${authTypes.join(', ')}\n\n`
    }
  } else if (operation.security === undefined && spec.security) {
    // Check global security for BearerAuth
    const globalAuthTypes = spec.security.flatMap(s => Object.keys(s))
    if (globalAuthTypes.includes('BearerAuth')) {
      content += 'Provide your bearer token in the Authorization header when making requests to protected resources.\n\n'
      content += 'Example: `Authorization: Bearer YOUR_API_KEY`\n\n'
    } else {
      content += '**Authentication required**\n\n'
    }
  }

  // Resolve all parameters (including parameter-level $refs)
  const rawParameters = operation.parameters || []
  const parameters = rawParameters.map(paramRef => {
    if (paramRef.$ref) {
      return resolveRef(paramRef.$ref, spec) || paramRef
    }
    return paramRef
  })

  // Parameters
  if (parameters.length > 0) {
    content += '### Parameters\n\n'
    content += '| Name | Type | Location | Required | Description |\n'
    content += '|------|------|----------|----------|-------------|\n'

    parameters.forEach(param => {

      const name = `\`${param.name}\``

      // Resolve $ref in schema if present
      let type = 'string'
      if (param.schema) {
        if (param.schema.$ref) {
          const resolvedSchema = resolveRef(param.schema.$ref, spec)
          type = resolvedSchema?.type || 'string'
          if (resolvedSchema?.enum) {
            type += ` (${resolvedSchema.enum.join(', ')})`
          }
        } else {
          type = param.schema.type || 'string'
        }
      } else if (param.type) {
        type = param.type
      }

      const location = param.in
      const required = param.required ? 'Yes' : 'No'
      const description = param.description || ''

      content += `| ${name} | ${type} | ${location} | ${required} | ${description} |\n`
    })

    content += '\n'
  }

  // Request body
  if (operation.requestBody) {
    content += '### Request Body\n\n'
    const requestContent = operation.requestBody.content

    if (requestContent) {
      const contentType = Object.keys(requestContent)[0]
      const schema = requestContent[contentType]?.schema

      if (schema) {
        content += `**Content-Type:** \`${contentType}\`\n\n`

        if (schema.example) {
          content += '```json\n'
          content += JSON.stringify(schema.example, null, 2) + '\n'
          content += '```\n\n'
        } else if (schema.$ref) {
          const schemaName = schema.$ref.split('/').pop()
          content += `Schema: \`${schemaName}\`\n\n`
        }
      }
    }
  }

  // Code samples
  content += generateCodeSamples(endpoint, spec, parameters)

  // Responses
  content += generateResponseTabs(operation, spec)

  return content
}

/**
 * Generate code samples in multiple languages
 * @param {Object} endpoint - Endpoint data
 * @param {Object} spec - Full OpenAPI spec
 * @param {Array} parameters - Endpoint parameters
 * @returns {string} MDX content with CodeTabs component
 */
function generateCodeSamples(endpoint, spec, parameters) {
  const { method, path, operation } = endpoint
  const baseUrl = spec.servers?.[0]?.url || 'https://api.example.com'

  // Build example path and query params
  let examplePath = path
  const pathParams = parameters.filter(p => p.in === 'path')
  pathParams.forEach(param => {
    const exampleValue = param.example || param.schema?.example || `{${param.name}}`
    examplePath = examplePath.replace(`{${param.name}}`, exampleValue)
  })

  const queryParams = parameters.filter(p => p.in === 'query')
  const requestBody = operation.requestBody?.content?.['application/json']?.schema?.example

  // Generate samples for each language
  const samples = [
    {
      language: 'cURL',
      code: generateCurlSample(method, baseUrl, examplePath, queryParams, requestBody)
    },
    {
      language: 'TypeScript',
      code: generateTypeScriptSample(method, baseUrl, examplePath, queryParams, requestBody)
    },
    {
      language: 'JavaScript',
      code: generateJavaScriptSample(method, baseUrl, examplePath, queryParams, requestBody)
    },
    {
      language: 'Python',
      code: generatePythonSample(method, baseUrl, examplePath, queryParams, requestBody)
    },
    {
      language: 'Go',
      code: generateGoSample(method, baseUrl, examplePath, queryParams, requestBody)
    }
  ]

  // Format as MDX with CodeTabs component
  let content = '### Code Examples\n\n'
  content += '<CodeTabs samples={[\n'

  samples.forEach((sample, index) => {
    const escapedCode = sample.code.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
    content += `  {\n`
    content += `    language: "${sample.language}",\n`
    content += `    code: \`${escapedCode}\`\n`
    content += `  }${index < samples.length - 1 ? ',' : ''}\n`
  })

  content += ']} />\n\n'
  return content
}

/**
 * Generate cURL code sample
 */
function generateCurlSample(method, baseUrl, path, queryParams, body) {
  let url = `${baseUrl}${path}`
  if (queryParams.length > 0) {
    const queryString = queryParams
      .map(p => `${p.name}=${p.example || p.schema?.example || 'value'}`)
      .join('&')
    url += `?${queryString}`
  }

  let code = `curl -X ${method} "${url}" \\\\\n    -H "Authorization: Bearer YOUR_API_KEY"`

  if (body) {
    code += ` \\\\\n    -H "Content-Type: application/json" \\\\\n    -d '${JSON.stringify(body, null, 4)}'`
  }

  return code
}

/**
 * Generate TypeScript code sample
 */
function generateTypeScriptSample(method, baseUrl, path, queryParams, body) {
  let url = `${baseUrl}${path}`
  if (queryParams.length > 0) {
    const params = queryParams
      .map(p => `${p.name}=${p.example || p.schema?.example || 'value'}`)
      .join('&')
    url += `?${params}`
  }

  let code = `const response = await fetch('${url}', {\n    method: '${method}',\n    headers: {\n        'Authorization': 'Bearer YOUR_API_KEY'`

  if (body) {
    code += `,\n        'Content-Type': 'application/json'\n    },\n    body: JSON.stringify(${JSON.stringify(body, null, 4).replace(/\n/g, '\n    ')})`
  } else {
    code += `\n    }`
  }

  code += `\n});\n\nconst data = await response.json();`
  return code
}

/**
 * Generate JavaScript code sample
 */
function generateJavaScriptSample(method, baseUrl, path, queryParams, body) {
  let url = `${baseUrl}${path}`
  if (queryParams.length > 0) {
    const params = queryParams
      .map(p => `${p.name}=${p.example || p.schema?.example || 'value'}`)
      .join('&')
    url += `?${params}`
  }

  let code = `fetch('${url}', {\n    method: '${method}',\n    headers: {\n        'Authorization': 'Bearer YOUR_API_KEY'`

  if (body) {
    code += `,\n        'Content-Type': 'application/json'\n    },\n    body: JSON.stringify(${JSON.stringify(body, null, 4).replace(/\n/g, '\n    ')})`
  } else {
    code += `\n    }`
  }

  code += `\n})\n    .then(response => response.json())\n    .then(data => console.log(data));`
  return code
}

/**
 * Generate Python code sample
 */
function generatePythonSample(method, baseUrl, path, queryParams, body) {
  let url = `${baseUrl}${path}`
  if (queryParams.length > 0) {
    const params = queryParams
      .map(p => `${p.name}=${p.example || p.schema?.example || 'value'}`)
      .join('&')
    url += `?${params}`
  }

  let code = `import requests\n\nheaders = {\n    'Authorization': 'Bearer YOUR_API_KEY'\n}\n\n`

  if (body) {
    code += `response = requests.${method.toLowerCase()}(\n    '${url}',\n    headers=headers,\n    json=${JSON.stringify(body, null, 4).replace(/\n/g, '\n    ')}\n)\n\n`
  } else {
    code += `response = requests.${method.toLowerCase()}('${url}', headers=headers)\n\n`
  }

  code += `data = response.json()`
  return code
}

/**
 * Generate Go code sample
 */
function generateGoSample(method, baseUrl, path, queryParams, body) {
  let url = `${baseUrl}${path}`
  if (queryParams.length > 0) {
    const params = queryParams
      .map(p => `${p.name}=${p.example || p.schema?.example || 'value'}`)
      .join('&')
    url += `?${params}`
  }

  let code = `package main\n\nimport (\n    "bytes"\n    "encoding/json"\n    "net/http"\n)\n\nfunc main() {\n`

  if (body) {
    code += `    body := []byte(\`${JSON.stringify(body, null, 4)}\`)\n    req, _ := http.NewRequest("${method}", "${url}", bytes.NewBuffer(body))\n    req.Header.Set("Authorization", "Bearer YOUR_API_KEY")\n    req.Header.Set("Content-Type", "application/json")\n\n`
  } else {
    code += `    req, _ := http.NewRequest("${method}", "${url}", nil)\n    req.Header.Set("Authorization", "Bearer YOUR_API_KEY")\n\n`
  }

  code += `    client := &http.Client{}\n    resp, _ := client.Do(req)\n    defer resp.Body.Close()\n}`
  return code
}

/**
 * Generate response tabs with status codes
 * @param {Object} operation - OpenAPI operation object
 * @param {Object} spec - Full OpenAPI spec for resolving refs
 * @returns {string} MDX content with ResponseTabs component
 */
function generateResponseTabs(operation, spec) {
  if (!operation.responses) {
    return ''
  }

  const responses = []

  for (const [statusCode, response] of Object.entries(operation.responses)) {
    const description = response.description || getDefaultStatusDescription(statusCode)
    let body = null

    // Extract response body if available
    if (response.content) {
      const responseContent = response.content['application/json']

      if (responseContent?.schema) {
        const schema = responseContent.schema

        // Generate example from schema (handles $refs and nested structures)
        const exampleData = generateExampleFromSchema(schema, spec)
        if (exampleData !== null) {
          body = JSON.stringify(exampleData, null, 2)
        }
      }
    }

    responses.push({
      statusCode,
      description,
      body
    })
  }

  // Generate ResponseTabs MDX component
  let content = '### Responses\n\n'
  content += '<ResponseTabs responses={[\n'

  responses.forEach((resp, index) => {
    const escapedBody = resp.body ? resp.body.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$') : null
    content += `  {\n`
    content += `    statusCode: "${resp.statusCode}",\n`
    content += `    description: "${resp.description}",\n`
    if (escapedBody) {
      content += `    body: \`${escapedBody}\`\n`
    }
    content += `  }${index < responses.length - 1 ? ',' : ''}\n`
  })

  content += ']} />\n\n'
  return content
}

/**
 * Update navigation configuration with generated API endpoints
 * @param {Object} groupedEndpoints - Grouped endpoints
 */
async function updateNavigationConfig(groupedEndpoints) {
  // Build navigation items for generated endpoints
  const navItems = []
  for (const [tag, group] of Object.entries(groupedEndpoints)) {
    const slug = tagToSlug(tag)
    navItems.push({
      title: group.title,
      href: `/docs/api/${slug}`
    })
  }

  // Read current navigation file
  const navContent = await fs.readFile(NAV_FILE, 'utf8')

  // Build the updated navigation structure
  const updatedContent = buildNavigationFile(navItems)

  // Write updated navigation
  await fs.writeFile(NAV_FILE, updatedContent, 'utf8')
}

/**
 * Build the complete navigation TypeScript file
 * @param {Array} apiNavItems - Generated API navigation items
 * @returns {string} Complete navigation file content
 */
function buildNavigationFile(apiNavItems) {
  // Format API nav items with proper indentation
  const formattedItems = apiNavItems.map(item => {
    return `          {
            title: '${item.title}',
            href: '${item.href}',
          }`
  }).join(',\n')

  return `export interface NavItem {
  title: string
  href?: string
  items?: NavItem[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const docsNavigation: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      {
        title: 'Introduction',
        href: '/docs',
      },
      {
        title: 'Authentication',
        href: '/docs/authentication',
      },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      {
        title: 'Organizations',
        href: '/docs/organizations',
      },
      {
        title: 'Projects',
        href: '/docs/projects',
      },
      {
        title: 'Usage & Analytics',
        href: '/docs/usage',
      },
    ],
  },
  {
    title: 'API Reference',
    items: [
      {
        title: 'Overview',
        href: '/docs/api',
      },
      {
        title: 'API Documentation',
        items: [
${formattedItems}
        ],
      },
    ],
  },
  {
    title: 'Integrations',
    items: [
      {
        title: 'Webhooks',
        href: '/docs/webhooks',
      },
    ],
  },
]
`
}

/**
 * Resolve a $ref reference in the OpenAPI spec
 * @param {string} ref - The $ref string (e.g., '#/components/schemas/User')
 * @param {Object} spec - The full OpenAPI spec
 * @returns {Object|null} The resolved object or null if not found
 */
function resolveRef(ref, spec) {
  if (!ref || !ref.startsWith('#/')) {
    return null
  }

  // Remove leading '#/' and split path
  const path = ref.substring(2).split('/')

  // Navigate through the spec object
  let current = spec
  for (const segment of path) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment]
    } else {
      return null
    }
  }

  return current
}

/**
 * Generate example JSON from a schema definition
 * @param {Object} schema - OpenAPI schema object
 * @param {Object} spec - Full OpenAPI spec for resolving refs
 * @param {Set} visited - Set of visited refs to prevent circular references
 * @returns {*} Example value based on schema
 */
function generateExampleFromSchema(schema, spec, visited = new Set()) {
  if (!schema) return null

  // Handle $ref
  if (schema.$ref) {
    // Prevent circular references
    if (visited.has(schema.$ref)) {
      return '...'
    }
    visited.add(schema.$ref)

    const resolved = resolveRef(schema.$ref, spec)
    if (resolved) {
      return generateExampleFromSchema(resolved, spec, visited)
    }
    return null
  }

  // Use explicit example if provided
  if (schema.example !== undefined) {
    return schema.example
  }

  // Handle allOf, anyOf, oneOf - use first schema
  if (schema.allOf && schema.allOf.length > 0) {
    return generateExampleFromSchema(schema.allOf[0], spec, visited)
  }
  if (schema.anyOf && schema.anyOf.length > 0) {
    return generateExampleFromSchema(schema.anyOf[0], spec, visited)
  }
  if (schema.oneOf && schema.oneOf.length > 0) {
    return generateExampleFromSchema(schema.oneOf[0], spec, visited)
  }

  // Handle different types
  switch (schema.type) {
    case 'object':
      const obj = {}
      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          obj[propName] = generateExampleFromSchema(propSchema, spec, new Set(visited))
        }
      }
      return obj

    case 'array':
      if (schema.items) {
        return [generateExampleFromSchema(schema.items, spec, new Set(visited))]
      }
      return []

    case 'string':
      if (schema.enum && schema.enum.length > 0) {
        return schema.enum[0]
      }
      if (schema.format === 'date-time') {
        return '2024-01-01T00:00:00Z'
      }
      if (schema.format === 'date') {
        return '2024-01-01'
      }
      if (schema.format === 'email') {
        return 'user@example.com'
      }
      if (schema.format === 'uri' || schema.format === 'url') {
        return 'https://example.com'
      }
      if (schema.format === 'uuid') {
        return '123e4567-e89b-12d3-a456-426614174000'
      }
      return 'string'

    case 'number':
    case 'integer':
      if (schema.enum && schema.enum.length > 0) {
        return schema.enum[0]
      }
      return schema.minimum !== undefined ? schema.minimum : 0

    case 'boolean':
      return true

    case 'null':
      return null

    default:
      // If no type specified but has properties, treat as object
      if (schema.properties) {
        const obj = {}
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          obj[propName] = generateExampleFromSchema(propSchema, spec, new Set(visited))
        }
        return obj
      }
      return null
  }
}

/**
 * Get default description for HTTP status code
 * @param {string} statusCode - HTTP status code
 * @returns {string} Default description
 */
function getDefaultStatusDescription(statusCode) {
  const defaults = {
    '200': 'Success',
    '201': 'Created',
    '204': 'No Content',
    '400': 'Bad Request',
    '401': 'Unauthorized',
    '403': 'Forbidden',
    '404': 'Not Found',
    '500': 'Internal Server Error',
    '302': 'Redirect'
  }
  return defaults[statusCode] || 'Response'
}

/**
 * Convert tag name to URL-friendly slug
 * @param {string} tag - Tag name
 * @returns {string} Slug
 */
function tagToSlug(tag) {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Run the script
main()
