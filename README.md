# Bravo

**Bootstrap with the fixes you've been adding by hand — now built-in, cleaner, and future-proof.**

[![npm version](https://img.shields.io/npm/v/@appitude/bravo.svg)](https://www.npmjs.com/package/@appitude/bravo)
[![License](https://img.shields.io/npm/l/@appitude/bravo.svg)](https://github.com/appitudeio/bravo/blob/main/LICENSE)

Bravo extends Bootstrap 5.3.8 with thoughtful enhancements and modern patterns while maintaining full compatibility.

## Quick Start

### NPM
```bash
npm install @appitude/bravo
```

### CDN
```html
<!-- CSS -->
<link href="https://cdn.jsdelivr.net/npm/@appitude/bravo@5.3.8/dist/css/bravo.min.css" rel="stylesheet">

<!-- JavaScript Bundle with Popper -->
<script src="https://cdn.jsdelivr.net/npm/@appitude/bravo@5.3.8/dist/js/bravo.bundle.min.js"></script>
```

## Key Features

### 🎨 **Colors that actually scale**
- Full stepped color palettes (50-900 shades)
- All shades available as CSS variables and utilities
- Consistent color system across your entire project

### 🧩 **Components you wish existed**
- **Programmatic modals** - Create and control modals from JavaScript
- **Button loaders** - Built-in loading states
- **Interactive tooltips** - Click-to-stay, HTML content support
- **Hover dropdowns** - Open on hover with `data-bs-trigger="hover"`
- **Modal navigation** - Navigate between modals seamlessly

### ⚡ **Automatic wiring**
- **DynamicObserver** - Components initialize automatically when added to DOM
- No more `new Tooltip(...)` everywhere
- Works with dynamically loaded content

### 📐 **Layouts that fit today**
- **Responsive container gutters** - Gutters that adapt to screen size
- **iOS safe area support** - Respect device safe areas
- **Cleaner grid aliases** - Use `column-*` instead of `col-*`

### ✨ **Modern animations**
- Smooth, modern transitions
- Reduced motion support
- GPU-accelerated animations

## Migration from Bootstrap

Bravo is a drop-in replacement for Bootstrap. Simply replace your Bootstrap imports:

```diff
- import 'bootstrap/dist/css/bootstrap.min.css'
- import 'bootstrap'
+ import '@appitude/bravo/dist/css/bravo.min.css'
+ import '@appitude/bravo'
```

All Bootstrap components and utilities work exactly as expected, plus you get Bravo's enhancements.

## Version Strategy

Bravo maintains version parity with Bootstrap:
- Main version matches Bootstrap (e.g., `5.3.8`)
- Bravo-specific updates use patch versions (e.g., `5.3.8.v1`, `5.3.8.v2`)

When Bootstrap releases `5.3.9`, Bravo will release `5.3.9` with all enhancements ported over.

## Documentation

Full documentation is available at [https://appitudeio.github.io/bravo/](https://appitudeio.github.io/bravo/)

## Browser Support

Bravo supports the same browsers as Bootstrap 5:
- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Bravo is built on top of [Bootstrap](https://getbootstrap.com) by the team at [Appitude](https://appitude.io).