import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
  latex: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
}

export default withNextra(nextConfig)
