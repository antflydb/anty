# @antflydb/anty-embed

Embeddable Anty character animation for web applications. Add an interactive search assistant to your website with minimal configuration.

## Installation

This package is published to GitHub Packages. Configure npm to use GitHub Packages for the `@antflydb` scope:

**1. Create or update `.npmrc` in your project root:**

```
@antflydb:registry=https://npm.pkg.github.com
```

**2. Authenticate with GitHub Packages:**

You need a GitHub personal access token with `read:packages` scope. Set it in your environment:

```bash
npm login --scope=@antflydb --registry=https://npm.pkg.github.com
```

Or add to your `.npmrc`:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

**3. Install the package:**

```bash
npm install @antflydb/anty-embed
```

## Usage

```tsx
import { AntyEmbed } from '@antflydb/anty-embed';
import '@antflydb/anty-embed/styles.css';

function App() {
  return (
    <AntyEmbed
      apiKey="your-openai-api-key"
      assistantId="your-assistant-id"
    />
  );
}
```

## Documentation

For full documentation, configuration options, and examples, see the [main repository](https://github.com/antflydb/anty).

## License

MIT
