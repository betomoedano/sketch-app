# Phase 1: Collaborative Sketch App - Moveable Elements

## Objective
Create a collaborative sketch app where users can add and move text and shapes around the canvas, perfect for real-time collaboration.

## Why This Approach is Better
- **Mobile-friendly**: Tap to add, drag to move - natural touch interactions
- **Collaboration-ready**: Discrete elements are easy to sync in real-time
- **More engaging**: Quick layouts, mood boards, collaborative designs
- **Clear data model**: Each element = `{id, type, x, y, content, style}`

## Technical Stack
- **React Native**: Core framework
- **react-native-gesture-handler**: Drag gestures for moving elements
- **react-native-reanimated**: Smooth element animations
- **react-native-svg**: Vector graphics for shapes
- **useState**: Local state management for elements array

## Core Data Model

```typescript
interface SketchElement {
  id: string;
  type: 'text' | 'rectangle' | 'circle';
  x: number;
  y: number;
  content?: string; // for text elements
  style: {
    color: string;
    backgroundColor?: string;
    fontSize?: number;
    width?: number;
    height?: number;
  };
}
```

## Features to Implement

### Phase 1A: Basic Elements
- [x] Tap anywhere to add text element
- [x] Drag elements around the canvas
- [x] Basic text editing (double-tap to edit?)
- [x] Element selection visual feedback

### Phase 1B: Shapes & Toolbar
- [ ] Add rectangle and circle shapes
- [ ] Toolbar with element type buttons (Text, Rectangle, Circle)
- [ ] Color picker for elements
- [ ] Delete functionality (long press or delete button)

### Phase 1C: Polish
- [ ] Element selection/deselection
- [ ] Resize handles for shapes
- [ ] Layer ordering (bring to front/back)
- [ ] Undo/redo functionality

## Implementation Plan

1. **Refactor Canvas Component**
   - Rename `DrawingCanvas` to `SketchCanvas`
   - Replace path-based drawing with element array
   - Implement tap-to-add functionality

2. **Element Management**
   - Each element rendered as individual component
   - Individual drag gestures per element
   - Selection state management

3. **Toolbar Interface**
   - Bottom toolbar with element type buttons
   - Active tool state (Text, Rectangle, Circle)
   - Color/style controls

## User Interactions

- **Tap empty space**: Add new element of selected type
- **Drag element**: Move element around canvas
- **Double-tap text**: Edit text content (future)
- **Long press**: Delete element or show context menu

## Next Phase Preview
Phase 2 will add InstantDB for real-time collaboration:
- Live element position updates
- Real-time element additions/deletions
- User cursors and selection indicators
- Conflict resolution for simultaneous edits