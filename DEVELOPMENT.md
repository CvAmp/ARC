# Development Guide - Interactive Map Selector

This guide is for developers who want to understand, modify, or contribute to the Interactive Map Selector project.

## Architecture Overview

The application is built with React and TypeScript, using a component-based architecture:

```
┌─────────────────┐
│      App.tsx    │  ← Main app router
└─────────────────┘
         │
┌─────────────────┐
│   MapView.tsx   │  ← View wrapper (legacy)
└─────────────────┘
         │
┌─────────────────┐
│ MapSelector.tsx │  ← Main component
└─────────────────┘
         │
┌─────────────────┐
│   SvgMap.tsx    │  ← SVG map renderer
└─────────────────┘
```

## Key Components

### MapSelector.tsx
The main component that handles:
- State management for tile selections
- Color palette management
- Export/import functionality
- UI rendering and event handling

**Key State:**
```typescript
const [tileColors, setTileColors] = useState<{ [id: number]: string }>({});
const [selectedColor, setSelectedColor] = useState<string>(COLORS[2]);
```

### ZoomablePanSvgMap
A wrapper component that adds zoom and pan functionality to the SVG map:
- Handles mouse/touch events for panning
- Manages zoom with mouse wheel
- Maintains viewBox state for SVG transformations

### SvgMap.tsx
The core SVG map component that:
- Renders the actual map paths programmatically
- Handles tile click events for tiles, gates, and shrines
- Applies colors to selected elements
- Contains all map data (tiles, gates, shrines) as arrays
- Generates SVG paths dynamically rather than loading static files

## State Management

The application uses React's built-in state management:

### Primary State
- `tileColors`: Object mapping tile IDs to color strings
- `selectedColor`: Currently selected color from palette
- `viewBox`: SVG viewBox for zoom/pan state
- `gateColors`: Object mapping gate IDs to color strings
- `shrineColors`: Object mapping shrine IDs to color strings
- `colorLabels`: Object mapping colors to user-defined labels

### Derived State
- `colorCounts`: Calculated from tileColors for display
- `selectedTiles`: Array of selected tile IDs
- `selectedGates`: Array of selected gate IDs
- `selectedShrines`: Array of selected shrine IDs

## Data Flow

```
User Interaction → Event Handler → State Update → Re-render → UI Update
```

Example flow for tile selection:
1. User clicks on map tile/gate/shrine
2. `handleTileClick(id)`, `handleGateClick(id)`, or `handleShrineClick(id)` is called
3. Respective state setter updates the color mapping
4. Component re-renders with new colors
5. SVG map displays updated colors

## Key Features Implementation

### Color Selection System
```typescript
const COLORS = [
  "#e0e0e0", "#c0c0c0", "#a0e0a0", // ... 12 colors total
];

const handleTileClick = (id: number) => {
  setTileColors((prev) => {
    if (prev[id] === selectedColor) {
      // Remove color if same color clicked
      const copy = { ...prev };
      delete copy[id];
      return copy;
    }
    // Set new color
    return { ...prev, [id]: selectedColor };
  });
};
```

### Export Functionality
Uses `html2canvas` library to capture the map as an image:

```typescript
const exportAsImage = async (format: 'png' | 'jpg' = 'png') => {
  const mapContainer = document.querySelector('[data-export-target]');
  const canvas = await html2canvas(mapContainer, {
    backgroundColor: format === 'jpg' ? '#ffffff' : null,
    scale: 2, // Higher resolution
  });
  // Create download link...
};
```

### Data Persistence
JSON format for saving/loading selections:

```typescript
interface SelectionData {
  tiles: { [id: number]: string };
  gates?: { [id: number]: string };
  shrines?: { [id: number]: string };
  labels?: { [color: string]: string };
  timestamp: string;
  totalTiles: number;
  version: string;
}
```

## Development Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Modern browser with ES2022 support

### Environment Setup
```bash
# Clone repository
git clone <repo-url>
cd web-map

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development Scripts
```json
{
  "dev": "vite",           // Development server
  "build": "tsc -b && vite build", // Production build
  "lint": "eslint .",      // Code linting
  "preview": "vite preview" // Preview production build
}
```

## Code Style & Standards

### TypeScript Configuration
- Strict mode enabled
- ES2022 target
- React JSX transform
- Path-based imports

### ESLint Rules
- React hooks rules
- TypeScript recommended rules
- React refresh rules

### Component Patterns
```typescript
// Functional components with TypeScript
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // Hooks at the top
  const [state, setState] = useState<Type>(initialValue);
  
  // Event handlers
  const handleEvent = (param: Type) => {
    // Handle event
  };
  
  // Render
  return <div>...</div>;
};
```

## Adding New Features

### Adding New Colors
1. Update the `COLORS` array in `MapSelector.tsx`
2. Ensure colors are web-safe and accessible
3. Test with different map regions

### Modifying Export Options
1. Add new format to `exportAsImage` function
2. Update UI buttons
3. Test with different browsers

### Adding New Map Types
1. Create new SVG map component
2. Update tile ID system if needed
3. Ensure compatibility with existing data format

## Performance Considerations

### Optimization Strategies
- Use React.memo for expensive components
- Debounce rapid state updates
- Lazy load large SVG maps
- Optimize SVG path complexity

### Current Limitations
- Large maps (>1000 tiles) may be slow
- Export quality limited by browser canvas size
- Memory usage grows with selection history

## Testing Strategy

### Manual Testing Checklist
- [ ] Color selection works for tiles, gates, and shrines
- [ ] Tile/gate/shrine selection/deselection works
- [ ] Zoom and pan functionality (mouse wheel with proper centering)
- [ ] Export PNG/JPG works
- [ ] Save/load data works (includes gates and shrines)
- [ ] Copy/paste JSON works
- [ ] Reset functionality works
- [ ] Mobile touch support
- [ ] Color labeling system works
- [ ] Color count display accurate

### Browser Testing
- Chrome/Edge (primary)
- Firefox
- Safari
- Mobile browsers

## Deployment

### Build Process
```bash
npm run build
```
Creates optimized bundle in `dist/` directory.

**Current Build Output (after Leaflet removal):**
- `index.html` (~0.67 kB)
- `index-DCIhOKP5.css` (~1.01 kB) - Styles
- `react-BI5Dw5vt.js` (~46.59 kB) - React framework
- `utils-B4CzG4On.js` (~202.28 kB) - html2canvas utility
- `index-3t3akRqD.js` (~529.44 kB) - Main application code

Total bundle size reduced by ~11KB after removing Leaflet dependency.

### Deployment Targets
- Netlify (current)
- Vercel
- GitHub Pages
- Any static hosting service

### Environment Variables
None required for basic functionality.

## Common Development Tasks

### Adding a New Button
1. Add button to toolbar in `MapSelector.tsx`
2. Create event handler function
3. Add styling consistent with existing buttons
4. Test functionality

### Modifying Map Appearance
1. Update SVG styles in `SvgMap.tsx`
2. Adjust colors in CSS or component styles
3. Test with different selections

### Changing Data Format
1. Update TypeScript interfaces
2. Modify save/load functions
3. Add migration logic for old formats
4. Update documentation

## Debugging Tips

### Common Issues
- **State not updating**: Check if state mutation is happening
- **Export not working**: Verify `data-export-target` attribute
- **Performance slow**: Profile with React DevTools
- **TypeScript errors**: Check type definitions
- **Zoom behavior diagonal**: Known issue with SVG viewBox zoom centering on mouse cursor

### Known Issues

#### SVG Zoom Behavior
**Problem**: When using Shift+scroll to zoom, the zoom appears to go diagonally rather than centering properly on the mouse cursor.

**Investigation Status**: 
- Event handling is correct (preventDefault, stopPropagation)
- Mathematical calculations for zoom centering are accurate
- Issue persists despite multiple attempted fixes
- May be related to browser rendering of SVG viewBox transformations

**Potential Solutions Being Explored**:
- Alternative zoom calculation methods
- CSS transform-based zoom instead of viewBox
- Different event listener attachment strategies
- Browser-specific workarounds

### Debug Tools
- React Developer Tools
- Browser DevTools Console
- Network tab for export issues
- Performance tab for optimization

## Contributing Guidelines

### Code Review Checklist
- [ ] TypeScript types are correct
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Responsive design maintained
- [ ] Accessibility considered
- [ ] Performance impact assessed

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit pull request
6. Address review feedback

## Future Enhancements

### Planned Features
- Undo/redo functionality
- Layer support
- Custom color picker
- Keyboard shortcuts
- Touch gesture improvements

### Technical Debt
- Refactor large components
- Add unit tests
- Improve TypeScript coverage
- Optimize bundle size
- Add error boundaries

## Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

### Libraries Used
- `react` - UI framework
- `html2canvas` - Image export
- `react-router-dom` - Routing (minimal usage)

**Recently Removed:**
- `leaflet` - Previously used for alternative map implementation
- `react-leaflet` - React wrapper for Leaflet (removed in favor of pure SVG approach)
- `@types/leaflet` - TypeScript definitions for Leaflet

### Useful Tools
- React DevTools
- TypeScript Language Server
- ESLint extension
- Prettier formatter