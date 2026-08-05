# Premium Developer Portfolio

A minimal, high-performance personal portfolio website built with pure HTML, CSS, and vanilla JavaScript. Designed with clean dark aesthetics inspired by Linear, Apple, and Vercel.

## Features

- **Dynamic Particle Background**: Organic canvas-based particles reacting to mouse proximity.
- **Spotlight Cards**: Radial gradient hover-tracking spotlights for featured project items.
- **Color Accent Customizer**: Switch between premium color accents (Violet, Blue, Emerald, Amber, Silver) instantly; choices persist across page refreshes.
- **Responsive Layout**: Designed mobile-first using clean flexbox and grid layouts.
- **Performance Optimized**: Sub-millisecond rendering paths, light assets, native lazy loading, and inline SVGs.
- **SEO & Social Metadata**: Rich meta variables, sitemap, robots configuration, and custom Open Graph graphic.
- **Accessibility (a11y)**: Built with semantic HTML elements and key aria attributes.

## Architecture

```
portfolio/
├── index.html            # Core layout & structural markup
├── robots.txt            # Search crawler directives
├── sitemap.xml           # URL index map
└── assets/
    ├── css/
    │   ├── variables.css # Design tokens, transitions, accents
    │   ├── global.css    # Resets, typography, utilities
    │   ├── components.css# Cards, customizer, timeline elements
    │   └── sections.css  # Layout rules for specific sections
    ├── js/
    │   ├── particles.js  # Canvas animation physics
    │   ├── spotlight.js  # Spotlight hover coordinates engine
    │   ├── theme.js      # Accent customizer persistence manager
    │   └── main.js       # Navigation observers and mobile triggers
    └── images/
        ├── avatar.jpg    # Custom abstract profile artwork
        ├── project1.jpg  # Project cover graphic
        ├── project2.jpg  # Project cover graphic
        ├── og-image.jpg  # Social share graphics
        └── favicon.svg   # Hexagonal SVG vector favicon
```

## How to Run Locally

You can launch the site using any basic static web server.

### Option 1: Node.js (http-server)

```bash
npx http-server .
```

### Option 2: Python

```bash
python -m http.server 8000
```

## Deployment on GitHub Pages

1. Commit your codebase to a new public GitHub repository.
2. Navigate to repository **Settings** -> **Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Set source branch to `main` (or the primary branch) and path to `/` (root).
5. Click **Save**. The website will go live shortly at `https://<your-username>.github.io/<your-repo-name>/`.
