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

- `section`: GameBanana section type. Examples: `Tool`, `Mod`, `Scipt`, `Sound`, `Spray` (find it in your GameBanana URL, notice the capitalization)
- `id`: Your submission ID (also find it in your GameBanana URL)
- `theme`: `light`, `dark`, or `trans` (transparent, optional, defaults to `light`)
- For GameBanana, I recommend the trans theme.

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

Dark: `https://gamebanana-likes.vercel.app/api/graph?section=Tool&id=19049&theme=dark`

Transparent theme uses the same white text.

![Example Graph](https://gamebanana-likes.vercel.app/api/graph?section=Tool&id=19049&theme=dark)

Light: `https://gamebanana-likes.vercel.app/api/graph?section=Tool&id=19049&theme=light`

![Example Graph Light](https://gamebanana-likes.vercel.app/api/graph?section=Tool&id=19049&theme=light)

