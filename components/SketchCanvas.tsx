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
import db from "@/db";
import { id } from "@instantdb/react-native";

const { height: screenHeight } = Dimensions.get("window");

interface SketchElement {
  id: string;
  type: "rectangle" | "circle" | "triangle";
  x: number;
  y: number;
  color: string;
  width?: number;
  height?: number;
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
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // Reset translate values when element position changes from database
  React.useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [element.x, element.y, translateX, translateY]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.1);
      runOnJS(onSelect)(element.id);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      scale.value = withSpring(1);
      const finalX = element.x + event.translationX;
      const finalY = element.y + event.translationY;
      runOnJS(onMove)(element.id, finalX, finalY);
      // Don't reset translate values immediately - let the database update first
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: element.x + translateX.value },
      { translateY: element.y + translateY.value },
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
                backgroundColor: element.color,
                width: element.width || 80,
                height: element.height || 60,
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
                backgroundColor: element.color,
                width: element.width || 60,
                height: element.height || 60,
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
                borderBottomColor: element.color,
                borderBottomWidth: element.height || 60,
                borderLeftWidth: (element.width || 60) / 2,
                borderRightWidth: (element.width || 60) / 2,
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
  const { data, isLoading, error } = db.useQuery({
    elements: {},
  });
  
  const elements = React.useMemo(() => data?.elements || [], [data?.elements]);
  
  // Debug connection status
  React.useEffect(() => {
    console.log('InstantDB Query Status:', { 
      hasData: !!data, 
      elementCount: elements.length, 
      isLoading, 
      error 
    });
  }, [data, elements.length, isLoading, error]);
  
  const [selectedTool, setSelectedTool] = useState<
    "rectangle" | "circle" | "triangle"
  >("rectangle");
  const [selectedColor, setSelectedColor] = useState("#007AFF");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );

  const addElement = (x: number, y: number) => {
    const elementId = id();
    const width = selectedTool === "rectangle" ? 80 : 60;
    const height = selectedTool === "rectangle" ? 60 : 60;
    
    console.log('Adding element:', { elementId, type: selectedTool, x, y, color: selectedColor });
    
    db.transact(
      db.tx.elements[elementId].update({
        type: selectedTool,
        x,
        y,
        color: selectedColor,
        width,
        height,
        createdAt: Date.now(),
      })
    ).then((result) => {
      console.log('Transaction successful:', result);
    }).catch((error) => {
      console.error('Transaction failed:', error);
    });
    
    setSelectedElementId(elementId);
  };

  const moveElement = (elementId: string, x: number, y: number) => {
    console.log('Moving element:', elementId, 'to:', x, y);
    
    db.transact(
      db.tx.elements[elementId].update({ x, y })
    ).then((result) => {
      console.log('Move transaction successful:', result);
    }).catch((error) => {
      console.error('Move transaction failed:', error);
    });
  };

  const selectElement = (id: string) => {
    setSelectedElementId(id);
  };

  const clearCanvas = () => {
    if (elements.length > 0) {
      const elementIds = elements.map((el: any) => el.id);
      db.transact(elementIds.map((elementId: string) => db.tx.elements[elementId].delete()));
    }
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
          {elements.map((element: any) => (
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
