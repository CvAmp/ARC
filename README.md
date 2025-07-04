# Interactive Map Selector

A React-based interactive map application that allows users to select and color-code different regions on an SVG map. Perfect for planning, visualization, and data presentation.

## 🌟 Features

- **Interactive Map Selection**: Click on map regions to select and color them
- **Multi-Color Support**: Choose from 12 different colors for categorization
- **Zoom & Pan**: Navigate the map with mouse wheel zoom and click-drag panning
- **Export Options**: Save your selections as PNG or JPG images
- **Data Management**: Save, load, copy, and paste selection data as JSON
- **Real-time Statistics**: See color usage counts in the toolbar
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Live Demo

Visit the live application: [https://luminous-haupia-86e19d.netlify.app](https://luminous-haupia-86e19d.netlify.app)

## 🛠️ Local Development

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web-map
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 📖 How to Use

### Basic Selection

1. **Choose a Color**: Click on any color circle in the top toolbar to select it
2. **Select Map Regions**: Click on any region of the map to color it with your selected color
3. **Toggle Selection**: Click on an already-colored region with the same color to deselect it
4. **Change Colors**: Select a different color and click on regions to change their color

### Navigation

- **Zoom**: Use mouse wheel to zoom in/out
- **Pan**: Click and drag to move around the map
- **Reset View**: Refresh the page to return to the original view

### Color Management

- **Color Counts**: Numbers below each color show how many regions are using that color
- **Reset All**: Click the "Reset All" button to clear all selections

### Export & Save

#### Image Export
- **Save PNG**: Export your map as a PNG image (supports transparency)
- **Save JPG**: Export your map as a JPG image (solid background)

#### Data Management
- **Save Data**: Download your selections as a JSON file for later use
- **Load Data**: Upload a previously saved JSON file to restore selections
- **Copy JSON Data**: Copy selection data to clipboard for sharing
- **Paste JSON Data**: Import selection data from clipboard

### Sharing Your Work

1. **Image Sharing**: Use the PNG/JPG export to share visual representations
2. **Data Sharing**: Use "Copy JSON Data" to share the raw selection data
3. **Collaborative Editing**: Save and share JSON files for team collaboration

## 🔧 Technical Details

### Built With

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **html2canvas** - Image export functionality
- **Custom SVG Map** - Interactive map component

### Project Structure

```
src/
├── App.tsx              # Main application component
├── MapView.tsx          # Map view wrapper
├── MapSelector.tsx      # Main map selector component
├── SvgMap.tsx          # SVG map component (not shown)
├── data/
│   └── sample.ts       # Sample data (objectives and zones)
└── styles/
    ├── App.css         # Component styles
    └── index.css       # Global styles
```

### Data Format

Selection data is stored in JSON format:

```json
{
  "tiles": {
    "1": "#a0e0a0",
    "2": "#f0b0b0",
    "15": "#b0b0f0"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "totalTiles": 3,
  "version": "1.0"
}
```

## 🎨 Customization

### Adding New Colors

Edit the `COLORS` array in `src/MapSelector.tsx`:

```typescript
const COLORS = [
  "#e0e0e0", // Light gray
  "#c0c0c0", // Medium gray
  "#a0e0a0", // Light green
  // Add your custom colors here
];
```

### Modifying the Map

The map is defined in `src/SvgMap.tsx`. You can:
- Replace the SVG with your own map
- Modify tile definitions and boundaries
- Adjust styling and interactions

## 🐛 Troubleshooting

### Common Issues

1. **Map not loading**: Ensure all dependencies are installed with `npm install`
2. **Export not working**: Check browser permissions for file downloads
3. **Clipboard operations failing**: Ensure you're using HTTPS or localhost
4. **Performance issues**: Try reducing the map complexity or zoom level

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (clipboard operations require user interaction)
- Mobile browsers: Touch gestures supported for pan/zoom

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.