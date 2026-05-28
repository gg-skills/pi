# Refresh Documentation

## When to Refresh

- Pi has a new npm release with breaking API changes
- A user reports behavior that contradicts the embedded docs
- New official extension examples are added to the pi-mono repo
- Significant community packages gain traction (>5k downloads/mo)

## Refresh Cadence

Re-run the refresh workflow if the capture date exceeds 90 days, a new major
version is released, or the user explicitly requests current behavior.

## How to Refresh

### 1. Check for drift

```bash
# Check npm version
npm view @mariozechner/pi-coding-agent version

# Check GitHub releases
firecrawl scrape "https://github.com/badlogic/pi-mono/releases" --format markdown \
  -o /tmp/pi-releases.md
```

### 2. Scrape updated docs

Scrape the key pages:

```bash
SESSION=".researches/<new-session>/documentation/markdown"

# Core docs
firecrawl scrape "https://raw.githubusercontent.com/badlogic/pi-mono/main/README.md" \
  --format markdown -o "$SESSION/github-raw-readme.md"

# Homepage
firecrawl scrape "https://pi.dev" --format markdown --only-main-content \
  -o "$SESSION/pi-dev-home.md"

# Packages
firecrawl scrape "https://pi.dev/packages" --format markdown --only-main-content \
  -o "$SESSION/pi-dev-packages.md"
```

### 3. Update the curated docs

Update the relevant files in `references/`, replacing their content with the new synthesis.

### 4. Update metadata

Add an entry to `research-provenance.md` with the new capture date.

### 5. Verify

Review the updated references for accuracy and consistency before use.
