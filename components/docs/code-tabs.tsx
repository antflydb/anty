'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Copy, Terminal } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeSample {
  language: string
  code: string
}

interface CodeTabsProps {
  samples: CodeSample[]
}

// Map display language names to syntax highlighter language identifiers
const languageMap: Record<string, string> = {
  'cURL': 'bash',
  'TypeScript': 'typescript',
  'JavaScript': 'javascript',
  'Python': 'python',
  'Go': 'go',
}

export function CodeTabs({ samples }: CodeTabsProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState(samples[0]?.language || '')

  if (!samples || samples.length === 0) {
    return null
  }

  const copyToClipboard = () => {
    const activeCode = samples.find(s => s.language === activeTab)?.code || ''
    navigator.clipboard.writeText(activeCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="not-prose my-6">
      <Tabs
        defaultValue={samples[0].language}
        className="w-full"
        onValueChange={setActiveTab}
      >
        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-950 dark:border-slate-800">
          {/* Tab bar with copy button */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
            <TabsList className="h-auto gap-2 bg-transparent p-0">
              <Terminal className="mr-1.5 h-3 w-3" />
              {samples.map((sample, index) => (
                <TabsTrigger
                  key={sample.language}
                  value={sample.language}
                  className="h-7 rounded-md border border-transparent px-3 py-1 text-xs font-medium text-slate-400 transition-colors hover:text-slate-300 data-[state=active]:border-slate-700 data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100"
                >
                  {/*index === 0 && <Terminal className="mr-1.5 h-3 w-3" />*/}
                  {sample.language}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Copy button */}
            <button
              onClick={copyToClipboard}
              className="flex h-7 items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-300 transition-colors hover:bg-slate-700 hover:text-slate-100"
              aria-label="Copy code"
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
          </div>

          {/* Code content with syntax highlighting */}
          {samples.map((sample) => (
            <TabsContent
              key={sample.language}
              value={sample.language}
              className="mt-0"
            >
              <SyntaxHighlighter
                language={languageMap[sample.language] || 'text'}
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
                {sample.code}
              </SyntaxHighlighter>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
