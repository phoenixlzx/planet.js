planet.js
=========

Don't ask me why invent another wheel. :-(

### Requirements

* Node.js >= v22.0.0

### Usage (EJS templates)

1. Initialize working directory `planet i`
2. Edit `config.yml` for your needs (default `planet.format` is `html`)
3. Add `planet /path/to/your/config.yml` to cronjob
4. Point your webserver root to `/path/to/your/public/directory`

### JSON output + Next.js template

1. Set `planet.format: json` in your `config.yml`
2. Run `planet /path/to/your/config.yml` – this writes `public/data.json`, `public/rss.xml`, `public/atom.xml`
3. In `themes/next/` run once `npm install`
4. Build the Next.js template: `npm run export` (inside `themes/next/`). The command builds the app and publishes static files into the same `public/` directory
5. Serve the generated `public/` directory (contains `index.html`, the `_next/` assets, and feeds)

### License

MIT
