# Interactive Map Selector

A React-based interactive map application that allows users to select and color-code different regions on an SVG map. Perfect for planning, visualization, and data presentation.

## 🌟 Features

- **Interactive Map Selection**: Click on map tiles, gates, and shrines to select and color them
- **Multi-Element Support**: Select and color different types of map elements (tiles, gates, shrines)
- **Multi-Color Support**: Choose from 12 different colors for categorization
- **Color Labeling**: Add custom labels to colors for better organization
- **Zoom & Pan**: Navigate the map with mouse wheel zoom and click-drag panning
- **Export Options**: Save your selections as PNG or JPG images
- **Data Management**: Save, load, copy, and paste selection data as JSON
- **Real-time Statistics**: See color usage counts in the toolbar
- **Responsive Design**: Works on desktop and mobile devices

## ✨ Recent Improvements

- **Simplified Architecture**: Streamlined to use a single, optimized SVG map implementation
- **Reduced Bundle Size**: Removed unnecessary dependencies for faster loading
- **Enhanced Element Support**: Added support for gates and shrines in addition to tiles
- **Improved Labeling**: Custom color labels for better organization and sharing

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
2. **Select Map Elements**: Click on any tile, gate, or shrine on the map to color it with your selected color
3. **Toggle Selection**: Click on an already-colored element with the same color to deselect it
4. **Change Colors**: Select a different color and click on elements to change their color
5. **Add Labels**: Click on a color's label area to add custom text descriptions

### Navigation

- **Zoom**: Use Shift + mouse wheel to zoom in/out (centers on mouse cursor)
- **Pan**: Click and drag to move around the map
- **Reset Zoom**: Click the "Reset Zoom" button to return to the original view

### Color Management

- **Color Counts**: Numbers below each color show how many elements are using that color
- **Color Labels**: Click on the label area below colors to add descriptive text
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

- **React 19** - Modern UI framework with latest features
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **html2canvas** - High-quality image export functionality
- **Pure SVG Implementation** - Custom-built interactive map (no external map libraries)

### Project Structure

```
src/
├── App.tsx              # Application router and main structure
├── MapView.tsx          # Map view wrapper component
├── MapSelector.tsx      # Main interactive map component
├── SvgMap.tsx          # Programmatic SVG map renderer
├── assets/             # Static assets (minimal usage)
├── App.css             # Component-specific styles
└── index.css           # Global styles and CSS variables
```

*Note: For detailed technical documentation, see [DEVELOPMENT.md](DEVELOPMENT.md)*

### Data Format

Selection data is stored in JSON format:

```json
{
  "tiles": {
    "1": "#a0e0a0",
    "2": "#f0b0b0",
    "15": "#b0b0f0"
  },
  "gates": {
    "5": "#e0a0a0"
  },
  "shrines": {
    "12": "#a0a0e0"
  },
  "labels": {
    "#a0e0a0": "Forest Areas",
    "#f0b0b0": "Desert Regions"
  },
  "timestamp": "2025-01-15T10:30:00.000Z",
  "totalTiles": 5,
  "version": "1.0"
}
```

## 🎨 Customization

### Quick Customizations

Want to customize the map for your needs? Here are the most common modifications:

**Adding New Colors**: See [DEVELOPMENT.md](DEVELOPMENT.md#adding-new-colors) for instructions on extending the color palette.

**Using Your Own Map**: The application can be adapted to work with any SVG-based map. See [DEVELOPMENT.md](DEVELOPMENT.md#adding-new-map-types) for technical details.

**Styling Changes**: Modify colors, fonts, and layout through the CSS files in the `src/` directory.

## 🐛 Troubleshooting

### Common Issues

1. **Map not loading**: Ensure all dependencies are installed with `npm install`
2. **Export not working**: Check browser permissions for file downloads
3. **Clipboard operations failing**: Ensure you're using HTTPS or localhost
4. **Zoom feels off**: Use Shift + scroll wheel for zoom (known issue: may appear slightly diagonal)
5. **Performance on large maps**: Consider reducing zoom level or using fewer simultaneous selections

For technical troubleshooting and development issues, see [DEVELOPMENT.md](DEVELOPMENT.md#debugging-tips).

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (clipboard operations require user interaction)
- Mobile browsers: Touch gestures supported for pan/zoom

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! This project follows standard open-source contribution practices.

### Quick Start for Contributors

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Setup

For detailed development setup, code standards, and architecture information, please see [DEVELOPMENT.md](DEVELOPMENT.md).

## 📞 Support

- **General Questions**: Open an issue on the GitHub repository
- **Bug Reports**: Please include browser version and steps to reproduce
- **Feature Requests**: Describe your use case and proposed solution
- **Technical Issues**: Check [DEVELOPMENT.md](DEVELOPMENT.md) first, then open an issue