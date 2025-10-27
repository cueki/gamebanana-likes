# GameBanana Likes Graph

A serverless API that generates a star-history style graph for GameBanana submissions showing likes over time.

**Inspired by [star-history](https://github.com/star-history/star-history)**

## Usage
It takes a bit of time to generate the graph because it has to pageinate GameBanana for likes.

It only updates once every hour.

Embed the graph in your README or webpage:

### Dark theme (recommended)
```html
<img src="https://your-project.vercel.app/api/graph?section=Tool&id=19049&theme=dark" alt="Likes Graph">
```

### Light theme
```html
<img src="https://your-project.vercel.app/api/graph?section=Tool&id=19049&theme=light" alt="Likes Graph">
```

## Parameters

- `section`: GameBanana section type (default: `Tool`). Could be `Mod`, `Skin`, `Sound`, etc.
- `id`: Your submission ID (e.g., `19049`)
- `theme`: `light` or `dark`

## How it works

1. Fetches submission details from GameBanana API
2. Fetches all likes with pagination from GameBanana API
3. Extracts the `_tsDateAdded` timestamp from each like
4. Groups likes by date and creates cumulative counts

### Design Attribution

This project uses design elements adapted from [star-history](https://github.com/star-history/star-history) under the MIT License:
- xkcdify SVG filter for sketch effect
- Color palettes for light/dark themes
- Number formatting approach
- Typography and layout


## Example

For Casual Preloader (Tools #19049):
- Dark (recommended): `https://your-project.vercel.app/api/graph?section=Tool&id=19049&theme=dark`
