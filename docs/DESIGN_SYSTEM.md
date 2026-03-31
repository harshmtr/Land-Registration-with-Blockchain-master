# Minimalist Frontend Design System

## Overview
The Land Registration application has been redesigned with a clean, modern minimalist aesthetic. This design system emphasizes clarity, simplicity, and usability.

## Color Palette

### Primary Colors
- **Primary Blue**: `#0066cc` - Main interactive elements and accents
- **Primary Light**: `#e6f0ff` - Light backgrounds and hover states
- **Primary Dark**: `#004d99` - Hover and active states for primary elements

### Functional Colors
- **Success**: `#28a745` - Positive actions and confirmations
- **Warning**: `#ffc107` - Cautionary messages
- **Danger**: `#dc3545` - Destructive actions
- **Info**: `#17a2b8` - Information messages

### Neutral Colors
- **White**: `#ffffff` - Main background
- **Light Gray**: `#f5f5f5` - Secondary backgrounds
- **Medium Gray**: `#eeeeee` - Borders and dividers
- **Dark Gray**: `#999999` - Secondary text
- **Darker Gray**: `#666666` - Tertiary text
- **Black**: `#1e1e1e` - Primary text

## Typography

### Font Family
- **Primary**: System fonts (Segoe UI, Helvetica Neue, sans-serif)
- Ensures optimal readability and performance

### Font Sizes
- **Display**: 32px (h1)
- **Headlines**: 24px (h2), 20px (h3)
- **Body**: 16px (default)
- **Small**: 14px (secondary text)
- **Extra Small**: 12px (metadata)

### Font Weights
- **Normal**: 400 - Body text
- **Medium**: 500 - Labels, secondary headings
- **Semibold**: 600 - Section titles
- **Bold**: 700 - Primary headings

## Spacing System

Using an 8px base unit for consistency:
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

## Components

### Buttons
```
Primary Button      - Blue background, white text
Secondary Button    - Light gray background, dark text
Success Button      - Green background, white text
Danger Button       - Red background, white text
```

**States:**
- Default: Full opacity
- Hover: Darker shade + subtle shadow
- Active: Darker shade
- Disabled: 50% opacity

### Forms
- Input height: 40px (including padding)
- Border: 1px solid #e0e0e0
- Focus: Blue border with light blue background tint
- Label: 14px semibold, placed above input

### Cards
- Background: White
- Border: 1px solid #e0e0e0
- Border Radius: 4px
- Shadow: Subtle 1px shadow (default), 4px on hover
- Padding: 16-24px depending on context

### Tables
- Header Background: Light gray
- Row Hover: Light gray background
- Border: 1px solid #e0e0e0
- Cell Padding: 16px

### Alerts
- Padding: 16px vertical, 24px horizontal
- Border Left: 4px solid (color varies by type)
- Border Radius: 4px

## Layout

### Main Layout
- **Navbar**: Fixed height 60px, white background, shadow bottom
- **Sidebar**: 260px width, white background, border right
- **Content**: Flexible, 16px padding
- **Footer**: Light gray background, border top

### Responsive Breakpoints
- **Desktop**: 1200px+ (full layout)
- **Tablet**: 768px-1199px (adjusted spacing)
- **Mobile**: Below 768px (stacked layout)

## CSS Architecture

### Files Overview

1. **minimalist-theme.css** - Core design system
   - CSS variables for all colors, spacing, typography
   - Global element styles (body, typography, forms)
   - Utility classes

2. **admin-layout.css** - Dashboard structure
   - Navbar, sidebar, main panel
   - Navigation styles
   - Footer

3. **views-layout.css** - View-specific components
   - Cards, stats, profiles
   - Timelines, badges, empty states
   - View container styles

4. **login.css** - Authentication pages
   - Login form styling
   - Registration modal
   - Help button

5. **card.css** - Legacy component overrides
   - Dashboard cards
   - Property cards
   - Post modules

6. **App.css** - Application wrapper
   - Main app container
   - Section layout

7. **index-reset.css** - Normalize old styles
   - Overrides legacy decorative styles
   - Ensures consistency

## Best Practices

### When Adding New CSS

1. Use CSS variables for colors and spacing
2. Follow BEM naming convention for classes
3. Maintain consistent spacing (8px grid)
4. Add hover/active states for interactive elements
5. Include responsive media queries
6. Keep specificity low (avoid nested selectors)

### Examples

**Good:**
```css
.button-primary {
  background-color: var(--primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
}
```

**Avoid:**
```css
div.card span.text.large {
  color: #0066cc;
  padding: 15px 20px;
  border-radius: 5px;
}
```

### Component Grid

The views use a responsive grid system:
- Desktop: 3-4 columns
- Tablet: 2 columns
- Mobile: 1 column

## Customization

To change the primary color throughout the app, update in `minimalist-theme.css`:

```css
:root {
  --primary: #0066cc;  /* Change this */
  --primary-light: #e6f0ff;
  --primary-dark: #004d99;
}
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Latest versions

Modern CSS features used:
- CSS Custom Properties (Variables)
- Flexbox
- CSS Grid
- Media Queries
- CSS Transforms
