'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import 'highlight.js/styles/github-dark.css';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, {
            behavior: 'append',
            properties: {
              className: ['heading-anchor'],
              ariaLabel: 'Link to section',
            },
            content: {
              type: 'element',
              tagName: 'span',
              properties: { className: ['anchor-icon'] },
              children: [{ type: 'text', value: '#' }]
            }
          }],
          rehypeHighlight
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
