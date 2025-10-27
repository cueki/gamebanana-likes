# GameBanana Likes Graph

A serverless API that generates a star-history style graph for GameBanana submissions showing likes over time.

**Inspired by [star-history](https://github.com/star-history/star-history)**

## Usage

Embed the graph in your mods description by replacing `{SECTION}` and `{ID}` with your GameBanana submission details:

### HTML
```html
<img src="https://gamebanana-likes.vercel.app/api/graph?section={SECTION}&id={ID}&theme={THEME}" alt="Likes Graph">
```

## Parameters

- `section`: GameBanana section type. Examples: `tools`, `mods` (find it in your GameBanana URL)
- `id`: Your submission ID (also find it in your GameBanana URL)
- `theme`: `light` or `dark` (optional, defaults to `light`)

## Notes

- The graph caches for 1 hour
- Supports up to 12,500 likes (250 pages)

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


## Markdown Example

For Casual Preloader (Tools #19049):

Dark (recommended): `https://gamebanana-likes.vercel.app/api/graph?section=Tool&id=19049&theme=dark`

![Example Graph](https://gamebanana-likes.vercel.app/api/graph?section=Tool&id=19049&theme=dark)

Light: `https://gamebanana-likes.vercel.app/api/graph?section=Tool&id=19049&theme=light`

![Example Graph Light](https://gamebanana-likes.vercel.app/api/graph?section=Tool&id=19049&theme=light)

