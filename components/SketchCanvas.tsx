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
  type: "rectangle" | "circle" | "triangle" | "diamond" | "star" | "hexagon";
  x: number;
  y: number;
  color: string;
  width?: number;
  height?: number;
}

const COLORS = [
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#8B5CF6", // Violet
  "#EF4444", // Red
];

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
      case "diamond":
        return (
          <View
            style={[
              styles.diamondElement,
              {
                backgroundColor: element.color,
                width: element.width || 60,
                height: element.height || 60,
              },
            ]}
          />
        );
      case "star":
        return (
          <View style={styles.starContainer}>
            <Text
              style={[
                styles.starElement,
                {
                  color: element.color,
                  fontSize: (element.width || 70) * 0.8,
                },
              ]}
            >
              ★
            </Text>
          </View>
        );
      case "hexagon":
        return (
          <View style={styles.hexagonContainer}>
            <Text
              style={[
                styles.hexagonElement,
                {
                  color: element.color,
                  fontSize: (element.width || 70) * 0.7,
                },
              ]}
            >
              ⬡
            </Text>
          </View>
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
  const { data } = db.useQuery({
    elements: {},
  });

  const elements = React.useMemo(() => data?.elements || [], [data?.elements]);

  const [selectedTool, setSelectedTool] = useState<
    "rectangle" | "circle" | "triangle" | "diamond" | "star" | "hexagon"
  >("circle");
  const [selectedColor, setSelectedColor] = useState("#6366F1");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );

  const addElement = (x: number, y: number) => {
    const elementId = id();
    let width = 60;
    let height = 60;

    if (selectedTool === "rectangle") {
      width = 80;
      height = 60;
    } else if (selectedTool === "star" || selectedTool === "hexagon") {
      width = 70;
      height = 70;
    }

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
    );

    setSelectedElementId(elementId);
  };

  const moveElement = (elementId: string, x: number, y: number) => {
    db.transact(db.tx.elements[elementId].update({ x, y }));
  };

  const selectElement = (id: string) => {
    setSelectedElementId(id);
  };

  const clearCanvas = () => {
    if (elements.length > 0) {
      const elementIds = elements.map((el: any) => el.id);
      db.transact(
        elementIds.map((elementId: string) =>
          db.tx.elements[elementId].delete()
        )
      );
    }
    setSelectedElementId(null);
  };

  const canvasTapGesture = Gesture.Tap().onEnd((event) => {
    if (event.y < screenHeight - 120) {
      // Avoid toolbar area
      runOnJS(addElement)(event.x, event.y);
    }
  });

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case "circle":
        return "●";
      case "rectangle":
        return "▭";
      case "triangle":
        return "▲";
      case "diamond":
        return "◆";
      case "star":
        return "★";
      case "hexagon":
        return "⬡";
      default:
        return "●";
    }
  };

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
            {(
              [
                "circle",
                "rectangle",
                "triangle",
                "diamond",
                "star",
                "hexagon",
              ] as const
            ).map((tool) => (
              <TouchableOpacity
                key={tool}
                style={[
                  styles.toolButton,
                  selectedTool === tool && styles.selectedTool,
                ]}
                onPress={() => setSelectedTool(tool)}
              >
                <Text
                  style={[
                    styles.toolButtonText,
                    selectedTool === tool && styles.selectedToolText,
                  ]}
                >
                  {getToolIcon(tool)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.clearButton} onPress={clearCanvas}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.colorRow}>
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
    backgroundColor: "#FAFAFA",
  },
  canvas: {
    flex: 1,
    position: "relative",
  },
  elementContainer: {
    position: "absolute",
    padding: 6,
  },
  selectedElement: {
    borderWidth: 2,
    borderColor: "#6366F1",
    borderStyle: "dashed",
    borderRadius: 8,
    boxShadow: "0 2px 4px 0 rgba(99, 102, 241, 0.3)",
  },
  rectangleElement: {
    borderRadius: 8,
    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
  },
  circleElement: {
    borderRadius: 100,
    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
  },
  triangleElement: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  diamondElement: {
    transform: [{ rotate: "45deg" }],
    borderRadius: 4,
    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
  },
  starContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  starElement: {
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  hexagonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  hexagonElement: {
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  toolbar: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 16,
    boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(10px)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  toolButtons: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 6,
  },
  toolButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedTool: {
    backgroundColor: "#6366F1",
    boxShadow: "0 2px 4px 0 rgba(99, 102, 241, 0.3)",
  },
  toolButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6B7280",
  },
  selectedToolText: {
    color: "#FFFFFF",
  },
  colorPalette: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 8,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "transparent",
    boxShadow: "0 2px 3px 0 rgba(0, 0, 0, 0.1)",
  },
  selectedColor: {
    borderColor: "#FFFFFF",
    borderWidth: 4,
    boxShadow: "0 4px 6px 0 rgba(0, 0, 0, 0.2)",
    transform: [{ scale: 1.1 }],
  },
  clearButton: {
    width: 44,
    height: 44,
    backgroundColor: "#EF4444",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 2px 4px 0 rgba(239, 68, 68, 0.3)",
  },
  clearButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
