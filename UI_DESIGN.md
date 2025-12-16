# UI Design Guidelines - TripMate

## Design Philosophy

TripMate follows a **modern minimalist** approach inspired by leading travel apps (TripIt, Hopper, Airbnb). The interface prioritizes **speed, clarity, and ease of use** over feature overload.

### Target Audience
Gen Z and Millennials (70%+ prefer intuitive mobile-first interfaces with clean design)

## Core Design Principles

### 1. Card-Based Layout
Cards are the primary UI pattern for grouping related information:
- **Weather cards**: One card per day with icon, temperature, conditions
- **Attraction cards**: Image, name, type (museum/restaurant/landmark), distance
- **Itinerary cards**: Day number, date, list of activities, daily budget
- **Trip summary cards**: City, dates, total budget at-a-glance

**Visual Style**: White background, subtle shadow (`elevation={2-3}`), rounded corners (`borderRadius: 2`)

### 2. Color Palette
Colors inspired by travel and adventure:
- **Primary**: Blue (#1976d2) - trust, sky, sea
- **Secondary**: Orange (#ff9800) - energy, sunset, exploration
- **Success**: Green (#4caf50) - confirmation, nature
- **Background**: Light gray (#f5f5f5) - reduces eye strain
- **Text**: Dark gray (#212121) - high contrast for readability

Use **vibrant imagery** for destination photos with white typography overlay.

### 3. Typography
Material-UI default font family (Roboto):
- **Headers**: `variant="h4"` or `h5` - bold, clear hierarchy
- **Subheaders**: `variant="h6"` - section titles
- **Body text**: `variant="body1"` - descriptions, details
- **Captions**: `variant="caption"` - metadata (dates, distances)

### 4. Spacing & Layout
- **Container max-width**: `lg` (1200px) - prevents ultra-wide layouts
- **Grid spacing**: `spacing={3}` (24px) between major sections
- **Card padding**: `2` (16px) internal spacing
- **Mobile-first**: Stack vertically on `xs`, grid layout on `md+`

## Component-Specific Guidelines

### Trip Creation Form
- **Layout**: Single-column form with generous spacing
- **Components**:
  - `TextField` for city/country (with autocomplete if time permits)
  - `DatePicker` from `@mui/x-date-pickers` for start/end dates
  - `TextField type="number"` for budget with currency prefix
  - `Button variant="contained"` for primary action
- **Validation**: Show errors inline with `error` and `helperText` props

### Weather Display
- **Pattern**: Flexbox row with equal-width cards (`flex: 1`)
- **Card content**:
  - Weather icon (sun/cloud/rain) - use Material Icons or emoji
  - Temperature (large, bold)
  - Day of week (caption)
  - Conditions text (small)
- **Layout**: All 5 cards occupy equal width to match container width
- **Interaction**: Click card to expand hourly forecast (stretch goal)

### Attractions List
- **Pattern**: Vertical list with `ListItem` + `ListItemAvatar` + `ListItemText`
- **Avatar**: Icon representing type (museum, restaurant, landmark)
- **Actions**: Checkbox to "add to itinerary", info button for details
- **Filtering**: Chip group at top for filtering by type
- **Loading state**: Skeleton screens showing title, chips, and list items
- **Container**: Scrollable with max-height (500px), border, and background
- **Empty state**: Illustration + "No attractions found" message

### Itinerary Builder
- **Pattern**: `Stepper` component (vertical orientation)
- **Step content**:
  - Date header
  - List of activities with delete buttons
  - TextField with independent state per day (object-based state)
  - Budget for the day with progress indicator
- **Add activity**: TextField + "Add" button per day
- **Container**: Scrollable with max-height (600px), border, and background

### Budget Tracker
- **Pattern**: Linear progress bar showing spent vs. total budget
- **Components**:
  - `LinearProgress` with `value` prop (percentage spent)
  - `Typography` for "€500 / €1000" display
  - Color coding: green (<50%), orange (50-90%), red (>90%)
- **Per-day breakdown**: Accordion or collapsible cards

## Navigation & Layout

### AppBar (Top)
- **Left**: Logo/app name ("TripMate")
- **Center**: Current page title
- **Right**: (Future) User avatar/menu

### Main Layout
```
┌─────────────────────────┐
│       AppBar            │
├─────────────────────────┤
│                         │
│   Container (maxWidth)  │
│                         │
│   [Page Content]        │
│                         │
└─────────────────────────┘
```

### Routing
- `/` - Trip list (homepage)
- `/create` - New trip form
- `/trip/:id` - Trip details with tabs:
  - Overview (weather + attractions)
  - Itinerary (day-by-day plan)
  - Budget (spending tracker)

## Responsive Breakpoints

Material-UI breakpoints:
- **xs**: 0-600px (mobile)
- **sm**: 600-900px (tablet portrait)
- **md**: 900-1200px (tablet landscape)
- **lg**: 1200px+ (desktop)

### Mobile-First Rules
- Stack all grid items vertically on `xs`
- Weather cards: horizontal scroll on `xs`, grid on `md+`
- Hide secondary info on small screens (show "..." menu instead)
- Bottom navigation for mobile (stretch goal)

## Interaction Patterns

### Loading States
- **Skeleton screens**: Use `Skeleton` component for cards/lists while fetching data (modern approach)
  - AttractionsList: Shows skeleton title, chips, and list items
  - Circular progress deprecated in favor of skeletons
- **Button loading**: `Button loading={true}` during form submission

### Error States
- **Snackbar**: Non-intrusive notifications for API errors
- **Alert component**: Inline warnings (e.g., "Weather data unavailable")
- **Empty states**: Friendly illustrations + actionable message

### Success Feedback
- **Snackbar**: "Trip created successfully!" with green background
- **Checkmark animation**: (Stretch goal) after successful actions

## Accessibility

- **Contrast ratio**: Minimum 4.5:1 for text
- **Focus indicators**: Default Material-UI focus rings
- **ARIA labels**: Add to icon buttons (`aria-label="Add to itinerary"`)
- **Keyboard navigation**: All interactive elements reachable via Tab

## Design Resources & Inspiration

### Reference Apps
- **TripIt**: Clean itinerary organization
- **Hopper**: Colorful, approachable UI with strong data visualization
- **Airbnb**: Card-based layout, beautiful imagery

### Design Galleries
- Dribbble: Search "travel app ui" or "itinerary builder"
- Behance: "Navaro Travel Booking Mobile App", "Flight Booking UI/UX"
- Material Design: https://material.io/design for component patterns

### Key Takeaways from Research
- 25%+ higher engagement with strong UI/UX
- Users expect **speed** (caching!), **personalization** (saved trips), **ease of use** (max 3 clicks to goal)
- Card design is universal for mobile travel apps
- Natural color palettes (sea, sky, mountain) enhance travel feel

## Implementation Notes

### MUI Theme Setup
```javascript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#ff9800' },
    background: { default: '#f5f5f5' }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif'
  },
  shape: { borderRadius: 8 }
});
```

### Component Import Pattern
```javascript
import { Card, CardContent, Typography, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
```

### Grid Layout Example
```javascript
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    <WeatherCard />
  </Grid>
  <Grid item xs={12} md={6}>
    <AttractionsList />
  </Grid>
</Grid>
```

## Future Enhancements (Post-Milestone 1)
- Dark mode toggle
- Drag-and-drop itinerary reordering
- Map integration (Google Maps / Leaflet)
- Social sharing (export itinerary as image/PDF)
- Voice search for destinations
- AI trip recommendations
