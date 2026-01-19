# CLAUDE.md

Chrome extension that converts weight from lbs to kg on Garmin Connect while preserving miles for distance.

## Project Structure

- `manifest.json` - Extension manifest (Manifest V3)
- `content.js` - Content script that runs on Garmin Connect weight pages
- `README.md` - User-facing documentation
- `LICENSE` - MIT license

## How It Works

The content script injects into `https://connect.garmin.com/*` pages and:

1. Converts "X lbs" text patterns to kg
2. Converts bare numbers in weight-related SVG charts (values 15-400)
3. Uses MutationObserver to handle dynamically loaded content
4. Hides SVG text until converted to prevent flicker

## Development

Load unpacked extension from this directory in `chrome://extensions` with Developer mode enabled.
