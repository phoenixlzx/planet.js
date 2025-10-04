# Planet Next Theme

This theme renders planet data with Next.js and shadcn/ui.  
It relies on the core planet CLI to fetch feeds and emit `data.json`, then uses Next.js static export to build the site.

## Prerequisites

- `planet` CLI available (this repository).
- `npm` to run scripts.
- `config.yml` with:

```yaml
planet:
  theme: next
  format: json
  output: public   # or any folder
```

## Workflow

1. **Fetch data from feeds**

   ```bash
   planet ./config.yml
   ```

   This writes `data.json`, `atom.xml`, and `rss.xml` into `<output>/`.

2. **Build the Next.js site**

   ```bash
   npm run build:next -- --config ./config.yml
   ```

   The script:
   - Resolves the output directory from the config.
   - Requires `<output>/data.json` (generated in step 1).
   - Runs `next build && next export`.
   - Copies the static export into the same `<output>/` folder so feeds and pages live together.

3. Serve or deploy the contents of `<output>/`.

## Development

To work on the theme locally:

```bash
cd themes/next
npm install
npm run dev
```

Set `PLANET_DATA_PATH` to point to a `data.json` file before starting dev mode to load real data:

```bash
PLANET_DATA_PATH=/absolute/path/to/data.json npm run dev
```

The dev server reads the file at startup; update the file and restart to refresh data.

## Testing

From the project root:

```bash
npm test
```

A Mocha test ensures the resolver script handles configuration paths correctly.
