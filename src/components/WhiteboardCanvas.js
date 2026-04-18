import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  PanResponder, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle as SvgCircle, Rect as SvgRect, Line as SvgLine } from 'react-native-svg';
import { Colors, BorderRadius, Typography, Shadows } from '../theme/colors';
import { socket } from '../utils/socket';

const { width: screenWidth } = Dimensions.get('window');
const CANVAS_WIDTH = screenWidth - 32;
const CANVAS_HEIGHT = 400;

const TOOLS = [
  { id: 'pen', icon: 'pencil', label: 'Pen' },
  { id: 'eraser', icon: 'trash-bin', label: 'Eraser' },
  { id: 'line', icon: 'remove', label: 'Line' },
  { id: 'rect', icon: 'square-outline', label: 'Rect' },
  { id: 'circle', icon: 'ellipse-outline', label: 'Circle' },
];

const COLORS = [
  '#818CF8', '#A78BFA', '#F472B6', '#FB923C',
  '#34D399', '#38BDF8', '#FBBF24', '#FFFFFF',
];

export default function WhiteboardCanvas({ roomId }) {
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#818CF8');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [, forceUpdate] = useState(0);

  // Use refs for drawing data so PanResponder always has fresh values
  const pathsRef = useRef([]);
  const shapesRef = useRef([]);
  const currentPathRef = useRef('');
  const currentShapeRef = useRef(null);
  const toolRef = useRef('pen');
  const colorRef = useRef('#818CF8');
  const strokeWidthRef = useRef(3);
  const startPosRef = useRef({ x: 0, y: 0 });
  const lastPointRef = useRef({ x: 0, y: 0 });

  // Keep refs in sync with state
  const setToolSync = (t) => { setTool(t); toolRef.current = t; };
  const setColorSync = (c) => { setColor(c); colorRef.current = c; };
  const setStrokeWidthSync = (s) => { setStrokeWidth(s); strokeWidthRef.current = s; };

  // Setup Socket listeners for incoming drawings
  useEffect(() => {
    const handleDrawPath = (data) => {
      // Remote payload
      if (data.type === 'path') {
        pathsRef.current = [...pathsRef.current, data.payload];
      } else if (data.type === 'shape') {
        shapesRef.current = [...shapesRef.current, data.payload];
      }
      forceUpdate((n) => n + 1);
    };

    const handleClear = () => {
      pathsRef.current = [];
      shapesRef.current = [];
      forceUpdate((n) => n + 1);
    };

    const handleUndo = () => {
      if (pathsRef.current.length > 0) {
        pathsRef.current = pathsRef.current.slice(0, -1);
      } else if (shapesRef.current.length > 0) {
        shapesRef.current = shapesRef.current.slice(0, -1);
      }
      forceUpdate((n) => n + 1);
    };

    socket.on('draw_path', handleDrawPath);
    socket.on('clear_board', handleClear);
    socket.on('undo_path', handleUndo);

    return () => {
      socket.off('draw_path', handleDrawPath);
      socket.off('clear_board', handleClear);
      socket.off('undo_path', handleUndo);
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        startPosRef.current = { x: locationX, y: locationY };
        lastPointRef.current = { x: locationX, y: locationY };

        if (toolRef.current === 'pen' || toolRef.current === 'eraser') {
          currentPathRef.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        } else {
          currentShapeRef.current = {
            type: toolRef.current,
            startX: locationX,
            startY: locationY,
            endX: locationX,
            endY: locationY,
            color: colorRef.current,
            strokeWidth: strokeWidthRef.current,
          };
        }
        forceUpdate(n => n + 1);
      },

      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;

        if (toolRef.current === 'pen' || toolRef.current === 'eraser') {
          // Use quadratic bezier for smooth curves
          const prevX = lastPointRef.current.x;
          const prevY = lastPointRef.current.y;
          const midX = (prevX + locationX) / 2;
          const midY = (prevY + locationY) / 2;
          currentPathRef.current += ` Q${prevX.toFixed(1)},${prevY.toFixed(1)} ${midX.toFixed(1)},${midY.toFixed(1)}`;
          lastPointRef.current = { x: locationX, y: locationY };
        } else {
          currentShapeRef.current = {
            ...currentShapeRef.current,
            endX: locationX,
            endY: locationY,
          };
        }
        forceUpdate(n => n + 1);
      },

      onPanResponderRelease: () => {
        if (toolRef.current === 'pen' || toolRef.current === 'eraser') {
          if (currentPathRef.current && currentPathRef.current.length > 5) {
            const newPath = {
              d: currentPathRef.current,
              color: toolRef.current === 'eraser' ? Colors.bgSecondary : colorRef.current,
              strokeWidth: toolRef.current === 'eraser' ? strokeWidthRef.current * 4 : strokeWidthRef.current,
            };
            pathsRef.current = [...pathsRef.current, newPath];
            // Broadcast the new path
            socket.emit('draw_path', { roomId, type: 'path', payload: newPath });
          }
          currentPathRef.current = '';
        } else if (currentShapeRef.current) {
          shapesRef.current = [...shapesRef.current, currentShapeRef.current];
          // Broadcast the new shape
          socket.emit('draw_path', { roomId, type: 'shape', payload: currentShapeRef.current });
          currentShapeRef.current = null;
        }
        forceUpdate(n => n + 1);
      },
    })
  ).current;

  const clearBoard = () => {
    pathsRef.current = [];
    shapesRef.current = [];
    currentPathRef.current = '';
    currentShapeRef.current = null;
    socket.emit('clear_board', { roomId });
    forceUpdate(n => n + 1);
  };

  const undo = () => {
    if (pathsRef.current.length > 0) {
      pathsRef.current = pathsRef.current.slice(0, -1);
    } else if (shapesRef.current.length > 0) {
      shapesRef.current = shapesRef.current.slice(0, -1);
    }
    socket.emit('undo_path', { roomId });
    forceUpdate(n => n + 1);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="brush" size={18} color={Colors.accent} />
          <Text style={styles.headerTitle}>Whiteboard</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={undo}>
            <Ionicons name="arrow-undo" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={clearBoard}>
            <Ionicons name="trash-outline" size={16} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas */}
      <View style={styles.canvasWrap} {...panResponder.panHandlers}>
        <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={styles.canvas}>
          {/* Grid dots */}
          {Array.from({ length: 20 }).map((_, row) =>
            Array.from({ length: 15 }).map((_, col) => (
              <SvgCircle
                key={`${row}-${col}`}
                cx={col * 25 + 12}
                cy={row * 25 + 12}
                r={0.8}
                fill="rgba(255,255,255,0.06)"
              />
            ))
          )}

          {/* Saved paths */}
          {pathsRef.current.map((p, i) => (
            <Path
              key={`p-${i}`}
              d={p.d}
              stroke={p.color}
              strokeWidth={p.strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Saved shapes */}
          {shapesRef.current.map((s, i) => (
            <ShapeElement key={`s-${i}`} shape={s} />
          ))}

          {/* Current drawing path */}
          {currentPathRef.current ? (
            <Path
              d={currentPathRef.current}
              stroke={toolRef.current === 'eraser' ? Colors.bgSecondary : colorRef.current}
              strokeWidth={toolRef.current === 'eraser' ? strokeWidthRef.current * 4 : strokeWidthRef.current}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {/* Current shape */}
          {currentShapeRef.current && <ShapeElement shape={currentShapeRef.current} />}
        </Svg>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        {/* Tools */}
        <View style={styles.toolRow}>
          {TOOLS.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.toolBtn, tool === t.id && styles.toolBtnActive]}
              onPress={() => setToolSync(t.id)}
            >
              <Ionicons
                name={t.icon}
                size={16}
                color={tool === t.id ? '#fff' : Colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Colors */}
        <View style={styles.colorRow}>
          {COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorBtn,
                { backgroundColor: c },
                color === c && styles.colorBtnActive,
              ]}
              onPress={() => setColorSync(c)}
            />
          ))}
        </View>

        {/* Stroke size */}
        <View style={styles.sizeRow}>
          {[2, 3, 5, 8].map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sizeBtn, strokeWidth === s && styles.sizeBtnActive]}
              onPress={() => setStrokeWidthSync(s)}
            >
              <View style={[styles.sizeDot, {
                width: s * 2 + 4,
                height: s * 2 + 4,
                backgroundColor: strokeWidth === s ? color : Colors.textMuted,
              }]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

function ShapeElement({ shape }) {
  const { type, startX, startY, endX, endY, color, strokeWidth } = shape;

  if (type === 'line') {
    return (
      <SvgLine
        x1={startX} y1={startY} x2={endX} y2={endY}
        stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    );
  }
  if (type === 'rect') {
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const w = Math.abs(endX - startX);
    const h = Math.abs(endY - startY);
    return (
      <SvgRect
        x={x} y={y} width={w} height={h}
        stroke={color} strokeWidth={strokeWidth} fill="none"
        rx={4}
      />
    );
  }
  if (type === 'circle') {
    const cx = (startX + endX) / 2;
    const cy = (startY + endY) / 2;
    const r = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) / 2;
    return (
      <SvgCircle
        cx={cx} cy={cy} r={r}
        stroke={color} strokeWidth={strokeWidth} fill="none"
      />
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  headerBtn: {
    width: 34, height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasWrap: {
    flex: 1,
    margin: 16,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  canvas: {
    backgroundColor: 'transparent',
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    gap: 10,
  },
  toolRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  toolBtn: {
    width: 40, height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnActive: {
    backgroundColor: Colors.primary,
    ...Shadows.small,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  colorBtn: {
    width: 24, height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorBtnActive: {
    borderColor: '#fff',
    transform: [{ scale: 1.15 }],
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeBtn: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeBtnActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
  sizeDot: {
    borderRadius: 999,
  },
});
