# GATE DA Exam Prep Dashboard - Design Guidelines

## Design Approach
**Reference-Based: Retro Pixel-Art Games** - Inspired by Stardew Valley's UI and classic 8-bit interfaces, emphasizing clean functionality over visual effects.

## Color System
- **Primary (Dark Slate)**: #2E3440 - Navigation, headers, primary containers
- **Secondary (Muted Blue)**: #5E81AC - Interactive elements, links, secondary buttons
- **Accent (Light Blue)**: #88C0D0 - Highlights, active states, focus indicators
- **Success (Sage Green)**: #A3BE8C - Completed topics, positive feedback, progress indicators
- **Background (Off-white)**: #ECEFF4 - Main background, card backgrounds
- **Text (Charcoal)**: #3B4252 - Primary text, labels, headings

## Typography
- **Font Family**: Fira Code or JetBrains Mono (monospace, pixel-perfect)
- **Hierarchy**:
  - Page Headers: 24px (3 grid units), font-weight: 700, letter-spacing: 0.05em
  - Section Titles: 16px (2 grid units), font-weight: 600
  - Body Text: 14px, font-weight: 400, line-height: 1.6
  - Small Text/Labels: 12px, font-weight: 500

## Layout System
- **Grid**: Strict 8px base grid system - all spacing, sizing, and positioning must align to 8px increments
- **Common Spacing**: Use 8px (1 unit), 16px (2 units), 24px (3 units), 32px (4 units), 40px (5 units)
- **Container**: Max-width 1200px for main content, 16px padding on mobile, 32px on desktop
- **Responsive Breakpoints**: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)

## Visual Style Rules
- **Borders**: Solid 2px borders, no border-radius (sharp corners only)
- **Shadows**: Avoid soft shadows - use solid offset shadows (e.g., 4px 4px 0px #2E3440)
- **Buttons**: Retro style with solid borders, 2px inset on active state, no gradients
- **Cards/Containers**: Solid borders, flat backgrounds, no rounded corners
- **High Contrast**: Ensure text is easily readable against all backgrounds

## Component Design

### Navigation
Top navigation bar with pixel-art styling, 56px height (7 grid units), solid border bottom, links with underline on hover

### Timer Widget (Study Workspace)
Large digital-style display, pixel font numbers, start/pause/stop buttons with retro styling, bordered container

### Study Session Logger
Form with solid-bordered inputs, textarea for notes, file upload for images/references, submit button with pixel-art treatment

### Topic Checklist
List view with checkboxes (custom pixel-art checkboxes), topic name, confidence level bar (0-100%), subject grouping with collapsible sections

### Confidence Level Bars
Horizontal bar graph style, segmented appearance (10% increments), fill with Success color, adjustable via slider or input

### Schedule Display
Week-based table/grid layout, date column, topics column, study hours column, completion checkboxes synced with topic checklist

### Quick References Page
Searchable/filterable list, grouped by subject then topic, resource type badges (Article/Video/PDF/GitHub), external link indicators

### Daily Reports Dashboard
Aggregated stats display: total hours (large number), session count, topics covered list, simple bar charts with pixel-art styling

## Animations
**Minimize animations** - Use sparingly only for:
- Checkbox state changes (instant or very fast)
- Button press feedback (2px offset on active)
- Page transitions (optional fade, <200ms)

## Images
**No large hero images** - This is a utility dashboard. Use:
- Small icons (16x16px or 24x24px pixel-art style) for subject categories
- Optional retro game-style avatar/character for user profile
- File upload preview thumbnails (bordered, small)

## Mobile Considerations
- Stack all multi-column layouts to single column on mobile
- Increase touch target sizes to minimum 40px
- Collapsible navigation menu (hamburger icon, pixel-art style)
- Tables transform to card-based layouts on mobile

## Key UX Principles
1. **Functionality over aesthetics** - Every element serves a clear purpose
2. **Instant feedback** - Checkbox toggles, form submissions show immediate results
3. **Data persistence** - All inputs auto-save, no data loss
4. **Cross-page sync** - Topic completion status updates everywhere
5. **Accessibility** - High contrast maintained, keyboard navigation supported, semantic HTML