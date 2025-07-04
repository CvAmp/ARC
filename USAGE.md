# Usage Guide - Interactive Map Selector

This guide provides detailed instructions on how to use all features of the Interactive Map Selector.

## Getting Started

When you first open the application, you'll see:
- A toolbar at the top with color options and controls
- An interactive map that fills most of the screen
- The map is initially uncolored and ready for selection

## Step-by-Step Tutorial

### 1. Selecting Your First Region

1. **Choose a color** from the color palette in the top toolbar
   - Click on any colored circle to select it
   - The selected color will have a white border and glow effect
   - You'll see the color count (initially 0) below each color

2. **Click on a map region** to color it
   - The region will immediately change to your selected color
   - The color count will increase by 1

3. **Continue selecting** regions with the same or different colors
   - Switch colors anytime by clicking a different color in the palette
   - Each region can only have one color at a time

### 2. Navigation Controls

#### Zooming
- **Zoom In**: Scroll mouse wheel up or use trackpad pinch gesture
- **Zoom Out**: Scroll mouse wheel down or use trackpad pinch gesture
- **Zoom Center**: Zooming focuses on the center of your current view

#### Panning
- **Pan/Move**: Click and drag anywhere on the map to move around
- **Cursor Changes**: Notice the cursor changes from "grab" to "grabbing" when dragging

### 3. Managing Selections

#### Changing Colors
- Select a new color from the palette
- Click on any already-colored region to change its color
- The old color count decreases, new color count increases

#### Removing Colors
- Select the same color that a region currently has
- Click on that region to remove the color (deselect it)
- The region returns to its default appearance

#### Reset Everything
- Click the **"Reset All"** button to clear all selections
- This cannot be undone unless you have saved your data first

### 4. Exporting Your Work

#### Image Export
1. **PNG Export** (recommended for sharing):
   - Click **"Save PNG"** button
   - Creates a high-resolution image with transparent background
   - Perfect for presentations or overlaying on other images

2. **JPG Export** (smaller file size):
   - Click **"Save JPG"** button
   - Creates a compressed image with white background
   - Good for email attachments or web use

#### Data Export/Import
1. **Save Data** (for later editing):
   - Click **"Save Data"** to download a JSON file
   - File includes all your selections and metadata
   - Can be loaded later to continue editing

2. **Load Data** (restore previous work):
   - Click **"Load Data"** to select a JSON file
   - All previous selections will be restored
   - Overwrites current selections

3. **Copy JSON Data** (for sharing):
   - Click **"Copy JSON Data"** to copy data to clipboard
   - Share the copied text with others
   - Recipients can use "Paste JSON Data" to import

4. **Paste JSON Data** (import from others):
   - Click **"Paste JSON Data"** to import from clipboard
   - Must have valid JSON data in clipboard first
   - Useful for collaborative work

## Advanced Tips

### Efficient Workflow
1. **Plan your colors**: Decide what each color represents before starting
2. **Use consistent patterns**: Group related regions with the same color
3. **Save frequently**: Use "Save Data" to backup your work
4. **Export early**: Create PNG exports at different stages

### Color Strategy
- **Light colors** (grays, pastels) for background/neutral areas
- **Bright colors** (red, blue, green) for important/active areas
- **Similar shades** for related categories
- **High contrast** for areas that need to stand out

### Collaboration Workflow
1. **Initial Setup**: One person creates the base selection
2. **Share Data**: Use "Copy JSON Data" to share with team
3. **Individual Edits**: Each person imports, edits, and exports
4. **Final Merge**: Combine selections or choose best version
5. **Export Final**: Create PNG/JPG for presentation

### Performance Tips
- **Zoom in** when working on detailed areas
- **Use fewer colors** for better visual clarity
- **Save regularly** to prevent data loss
- **Close other browser tabs** if experiencing slowness

## Keyboard Shortcuts

Currently, the application is mouse/touch-driven, but here are some browser shortcuts that work:

- **Ctrl/Cmd + S**: Browser save (won't save your map data)
- **Ctrl/Cmd + R**: Refresh page (will lose unsaved work)
- **Ctrl/Cmd + Plus/Minus**: Browser zoom (different from map zoom)

## Troubleshooting

### Selection Issues
- **Can't select regions**: Make sure you've chosen a color first
- **Wrong color applied**: Check which color is currently selected
- **Can't deselect**: Click with the same color that's currently applied

### Export Issues
- **Download blocked**: Check browser download permissions
- **Poor image quality**: Try PNG format for better quality
- **File too large**: Use JPG format for smaller files

### Data Issues
- **Import failed**: Ensure JSON file is from this application
- **Clipboard empty**: Make sure you copied data first
- **Data corrupted**: Try re-saving and re-loading

### Performance Issues
- **Slow response**: Try zooming out or refreshing the page
- **Browser freezing**: Close other tabs and try again
- **Touch not working**: Ensure you're using a supported mobile browser

## Best Practices

### For Presentations
1. Use high-contrast colors for visibility
2. Export as PNG for crisp images
3. Save data file as backup
4. Test visibility on different screens

### For Analysis
1. Use consistent color coding
2. Document what each color means
3. Save multiple versions for comparison
4. Export data for further analysis

### For Collaboration
1. Establish color conventions upfront
2. Use descriptive file names when saving
3. Share both data files and images
4. Keep a master version for reference

## Getting Help

If you encounter issues:
1. Try refreshing the page
2. Check the browser console for errors
3. Ensure you're using a modern browser
4. Contact support with specific error messages