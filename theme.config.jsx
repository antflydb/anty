export default {
  logo: <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>SearchAF Documentation</span>,
  project: {
    link: 'https://github.com/antflydb'
  },
  docsRepositoryBase: 'https://github.com/antflydb/www',
  footer: {
    text: (
      <span>
        {new Date().getFullYear()} ©{' '}
        <a href="https://searchaf.antfly.io" target="_blank">
          SearchAF
        </a>
        . Product search and discovery powered by AntflyDB.
      </span>
    )
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – SearchAF Documentation'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="SearchAF Documentation" />
      <meta property="og:description" content="Product search and discovery powered by AntflyDB" />
    </>
  ),
  primaryHue: 220,
  darkMode: true,
  nextThemes: {
    defaultTheme: 'system'
  }
}
