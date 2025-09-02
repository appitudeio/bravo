# Changelog

All notable changes to Bravo will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) with Bootstrap version parity.

## [5.3.8] - 2025-01-24

### Initial Public Release

This is the first public release of Bravo, extending Bootstrap 5.3.8 with modern enhancements.

### Added

#### Core Features
- **DynamicObserver** - Automatic component initialization for dynamically added DOM elements
- **Modal Navigation** - Seamless navigation between modals with history support
- **Enhanced Dropdowns** - Hover trigger support with `data-bs-trigger="hover"`
- **Interactive Tooltips** - Click-to-stay functionality and HTML content support
- **Button Loading States** - Built-in loading indicators for buttons

#### Color System
- Full stepped color palettes (50-900 shades)
- All color shades as CSS variables
- Extended color utilities for all shades
- Consistent color naming across the system

#### Layout Enhancements
- Responsive container gutters
- iOS safe area support  
- Grid column aliases (`column-*` in addition to `col-*`)
- Improved spacing utilities

#### Developer Experience
- Zero-config component initialization
- Programmatic modal creation
- Enhanced JavaScript API
- TypeScript support ready

### Changed
- Components now auto-initialize when added to DOM (via DynamicObserver)
- Modals can be created and controlled programmatically
- Dropdowns support hover interactions
- Tooltips can contain HTML and stay open on click

### Fixed
- Various Bootstrap inconsistencies
- Modal backdrop issues
- Dropdown positioning edge cases
- Tooltip initialization performance

### Notes
- Fully compatible with Bootstrap 5.3.8
- Drop-in replacement - no breaking changes
- All Bootstrap features preserved
- Progressive enhancement approach

---

## Version Strategy

Bravo follows Bootstrap's version numbering:
- **Major.Minor.Patch** - Matches Bootstrap version (e.g., 5.3.8)
- **Major.Minor.Patch.vX** - Bravo-specific updates (e.g., 5.3.8.v1)

When Bootstrap releases a new version, Bravo will release a matching version with all enhancements ported.