# pCon.basket Integration

pCon.basket integration script used to embed the shopping basket in our sales/CRM pages. Built with webpack/TypeScript, distributed via [jsDelivr](https://www.jsdelivr.com/) directly from this GitHub repository (no separate hosting required).

See `README-it.md` for build/test instructions in Italian.

## Release workflow

1. Bump `version` in `package.json`.
2. Build the production bundle:
   ```bash
   npm ci
   npm run build:production
   ```
3. Commit the updated `build/main.js` together with your source changes.
4. Tag and push:
   ```bash
   git tag vX.Y.Z
   git push --tags
   ```
5. Consumers reference the fixed version, never `@latest` or a branch, so the CDN result is immediate and never changes underneath them:
   ```
   https://cdn.jsdelivr.net/gh/mastertent/pcon-basket@X.Y.Z/build/main.js
   ```

If you need an immediate cache refresh for a URL you already used before tagging, use the [jsDelivr purge tool](https://www.jsdelivr.com/tools/purge).
