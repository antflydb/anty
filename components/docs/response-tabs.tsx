'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Braces, Check, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface ResponseSample {
  statusCode: string
  description: string
  body?: string
}

interface ResponseTabsProps {
  responses: ResponseSample[]
}

// Get status code badge color based on code
const getStatusColor = (code: string) => {
  const numCode = parseInt(code)
  if (numCode >= 200 && numCode < 300) return 'text-green-400'
  if (numCode >= 300 && numCode < 400) return 'text-blue-400'
  if (numCode >= 400 && numCode < 500) return 'text-yellow-400'
  if (numCode >= 500) return 'text-red-400'
  return 'text-slate-400'
}

export function ResponseTabs({ responses }: ResponseTabsProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState(responses[0]?.statusCode || '')

  if (!responses || responses.length === 0) {
    return null
  }

  const copyToClipboard = () => {
    const activeResponse = responses.find(r => r.statusCode === activeTab)?.body || ''
    if (activeResponse) {
      navigator.clipboard.writeText(activeResponse)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="not-prose my-6">
      <Tabs
        defaultValue={responses[0].statusCode}
        className="w-full"
        onValueChange={setActiveTab}
      >
        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-950 dark:border-slate-800">
          {/* Tab bar with copy button */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
            <TabsList className="h-auto gap-2 bg-transparent p-0">
              <Braces className="mr-1.5 h-3 w-3" />
              {responses.map((response) => (
                <TabsTrigger
                  key={response.statusCode}
                  value={response.statusCode}
                  className="h-7 rounded-md border border-transparent px-3 py-1 text-xs font-medium text-slate-400 transition-colors hover:text-slate-300 data-[state=active]:border-slate-700 data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100"
                >
                  <span className={getStatusColor(response.statusCode)}>
                    {response.statusCode}
                  </span>
                  <span className="ml-1.5">{response.description}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Copy button - only show if active tab has body */}
            {responses.find(r => r.statusCode === activeTab)?.body && (
              <button
                onClick={copyToClipboard}
                className="flex h-7 items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-300 transition-colors hover:bg-slate-700 hover:text-slate-100"
                aria-label="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Response content with syntax highlighting */}
          {responses.map((response) => (
            <TabsContent
              key={response.statusCode}
              value={response.statusCode}
              className="mt-0"
            >
              {response.body ? (
                <SyntaxHighlighter
                  language="json"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    lineHeight: '1.7',
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    }
                  }}
                >
                  {(() => {
                    try {
                      // Re-parse and re-stringify to ensure proper formatting
                      const parsed = JSON.parse(response.body)
                      return JSON.stringify(parsed, null, 2)
                    } catch {
                      // If parsing fails, return original
                      return response.body
                    }
                  })()}
                </SyntaxHighlighter>
              ) : (
                <div className="p-4 text-sm text-slate-400">
                  No response body
                </div>
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
