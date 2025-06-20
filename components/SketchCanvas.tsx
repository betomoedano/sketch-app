import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
} from "react-native-reanimated";

const { height: screenHeight } = Dimensions.get("window");

interface SketchElement {
  id: string;
  type: "rectangle" | "circle" | "triangle";
  x: number;
  y: number;
  style: {
    color: string;
    width?: number;
    height?: number;
  };
}

const COLORS = ["#007AFF", "#FF3B30", "#34C759", "#5856D6"];

interface MovableElementProps {
  element: SketchElement;
  onMove: (id: string, x: number, y: number) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

function MovableElement({
  element,
  onMove,
  onSelect,
  isSelected,
}: MovableElementProps) {
  const translateX = useSharedValue(element.x);
  const translateY = useSharedValue(element.y);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.1);
      runOnJS(onSelect)(element.id);
    })
    .onUpdate((event) => {
      translateX.value = element.x + event.translationX;
      translateY.value = element.y + event.translationY;
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      runOnJS(onMove)(element.id, translateX.value, translateY.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const renderElement = () => {
    switch (element.type) {
      case "rectangle":
        return (
          <View
            style={[
              styles.rectangleElement,
              {
                backgroundColor: element.style.color,
                width: element.style.width || 80,
                height: element.style.height || 60,
              },
            ]}
          />
        );
      case "circle":
        return (
          <View
            style={[
              styles.circleElement,
              {
                backgroundColor: element.style.color,
                width: element.style.width || 60,
                height: element.style.height || 60,
              },
            ]}
          />
        );
      case "triangle":
        return (
          <View
            style={[
              styles.triangleElement,
              {
                borderBottomColor: element.style.color,
                borderBottomWidth: element.style.height || 60,
                borderLeftWidth: (element.style.width || 60) / 2,
                borderRightWidth: (element.style.width || 60) / 2,
              },
            ]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          animatedStyle,
          styles.elementContainer,
          isSelected && styles.selectedElement,
        ]}
      >
        {renderElement()}
      </Animated.View>
    </GestureDetector>
  );
}

export default function SketchCanvas() {
  const [elements, setElements] = useState<SketchElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<
    "rectangle" | "circle" | "triangle"
  >("rectangle");
  const [selectedColor, setSelectedColor] = useState("#2D3748");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );

  const addElement = (x: number, y: number) => {
    const newElement: SketchElement = {
      id: Date.now().toString(),
      type: selectedTool,
      x,
      y,
      style: {
        color: selectedColor,
        width:
          selectedTool === "rectangle"
            ? 80
            : selectedTool === "triangle"
            ? 60
            : 60,
        height:
          selectedTool === "rectangle"
            ? 60
            : selectedTool === "triangle"
            ? 60
            : 60,
      },
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  const moveElement = (id: string, x: number, y: number) => {
    setElements((prev) =>
      prev.map((element) =>
        element.id === id ? { ...element, x, y } : element
      )
    );
  };

  const selectElement = (id: string) => {
    setSelectedElementId(id);
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElementId(null);
  };

  const canvasTapGesture = Gesture.Tap().onEnd((event) => {
    if (event.y < screenHeight - 120) {
      // Avoid toolbar area
      runOnJS(addElement)(event.x, event.y);
    }
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={canvasTapGesture}>
        <View style={styles.canvas}>
          {elements.map((element) => (
            <MovableElement
              key={element.id}
              element={element}
              onMove={moveElement}
              onSelect={selectElement}
              isSelected={element.id === selectedElementId}
            />
          ))}
        </View>
      </GestureDetector>

      <View style={styles.toolbar}>
        <View style={styles.topRow}>
          <View style={styles.toolButtons}>
            {(["rectangle", "circle", "triangle"] as const).map((tool) => (
              <TouchableOpacity
                key={tool}
                style={[
                  styles.toolButton,
                  selectedTool === tool && styles.selectedTool,
                ]}
                onPress={() => setSelectedTool(tool)}
              >
                <Text style={styles.toolButtonText}>
                  {tool === "rectangle" ? "▭" : tool === "circle" ? "●" : "▲"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.clearButton} onPress={clearCanvas}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.colorPalette}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  canvas: {
    flex: 1,
    position: "relative",
  },
  elementContainer: {
    position: "absolute",
    padding: 4,
  },
  selectedElement: {
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    borderRadius: 4,
  },
  rectangleElement: {
    borderRadius: 4,
  },
  circleElement: {
    borderRadius: 100,
  },
  triangleElement: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  toolbar: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 12,
    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  toolButtons: {
    flexDirection: "row",
    gap: 8,
  },
  toolButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedTool: {
    backgroundColor: "#007AFF",
  },
  toolButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  colorPalette: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#333",
    borderWidth: 3,
  },
  clearButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
});
