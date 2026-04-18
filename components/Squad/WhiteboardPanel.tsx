import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text, PanResponder,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Pencil, Eraser, Undo2, Trash2 } from 'lucide-react-native';
import { useSocket, WhiteboardPath } from '@/context/SocketContext';

const CANVAS_BG = '#111827';
const COLORS = ['#FFFFFF', '#3B82F6', '#EF4444', '#10B981', '#F5A623', '#A855F7', '#EC4899'];
const STROKE_SIZES = [2, 4, 6, 8];

export default function WhiteboardPanel() {
  const {
    whiteboardPaths, editingUser, currentUser,
    sendDrawPath, sendEditing, sendStopEditing, sendUndo, sendClear,
  } = useSocket();

  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [strokeSize, setStrokeSize] = useState(3);
  // activePath is only the current live stroke — cleared on release
  const [activePath, setActivePath] = useState<string>('');
  // Show "you are drawing" indicator
  const [selfEditing, setSelfEditing] = useState(false);

  // Refs to avoid stale closures in PanResponder
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const toolRef = useRef<'pen' | 'eraser'>('pen');
  const colorRef = useRef('#FFFFFF');
  const strokeRef = useRef(3);
  const editingTimerRef = useRef<NodeJS.Timeout | null>(null);

  toolRef.current = tool;
  colorRef.current = selectedColor;
  strokeRef.current = strokeSize;

  const buildSmoothPath = useCallback((points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[0].x.toFixed(1)} ${(points[0].y + 0.1).toFixed(1)}`;
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length - 1; i++) {
      const cpX = points[i].x;
      const cpY = points[i].y;
      const endX = (points[i].x + points[i + 1].x) / 2;
      const endY = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${cpX.toFixed(1)} ${cpY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;
    }
    const last = points[points.length - 1];
    d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
    return d;
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        pointsRef.current = [{ x: locationX, y: locationY }];
        setSelfEditing(true);

        // Throttle editing events to avoid spamming server
        if (editingTimerRef.current) clearTimeout(editingTimerRef.current);
        sendEditing();
      },

      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        pointsRef.current.push({ x: locationX, y: locationY });

        // Sample every 2 points for performance, keep first + last
        const pts = pointsRef.current;
        let sampledPts: typeof pts;
        if (pts.length > 60) {
          sampledPts = [pts[0]];
          for (let i = 2; i < pts.length - 1; i += 2) sampledPts.push(pts[i]);
          sampledPts.push(pts[pts.length - 1]);
        } else {
          sampledPts = pts;
        }

        const d = buildSmoothPath(sampledPts);
        setActivePath(d);
      },

      onPanResponderRelease: () => {
        const allPoints = pointsRef.current;
        const finalD = buildSmoothPath(allPoints);

        if (finalD) {
          const isEraser = toolRef.current === 'eraser';
          sendDrawPath({
            d: finalD,
            color: isEraser ? CANVAS_BG : colorRef.current,
            strokeWidth: isEraser ? strokeRef.current * 4 : strokeRef.current,
          });
        }

        pointsRef.current = [];
        setActivePath('');
        setSelfEditing(false);
        sendStopEditing();
      },

      onPanResponderTerminate: () => {
        pointsRef.current = [];
        setActivePath('');
        setSelfEditing(false);
        sendStopEditing();
      },
    })
  ).current;

  const handleUndo = () => sendUndo();
  const handleClear = () => sendClear();

  // Who is drawing (could be self or remote)
  const drawingLabel = selfEditing
    ? `✏️ You are drawing...`
    : editingUser
    ? `✏️ ${editingUser} is drawing...`
    : null;

  return (
    <View style={styles.container}>
      {/* Drawing indicator */}
      {drawingLabel && (
        <View style={[styles.editingBadge, selfEditing && styles.selfEditingBadge]}>
          <Text style={[styles.editingText, selfEditing && styles.selfEditingText]}>
            {drawingLabel}
          </Text>
        </View>
      )}

      {/* Canvas */}
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Svg style={StyleSheet.absoluteFill}>
          {/* All committed paths — PERMANENT, persists across sessions */}
          {whiteboardPaths.map((p) => (
            <Path
              key={p.id}
              d={p.d}
              stroke={p.color}
              strokeWidth={p.strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {/* Live active stroke — shown while finger is down */}
          {activePath ? (
            <Path
              d={activePath}
              stroke={tool === 'eraser' ? CANVAS_BG : selectedColor}
              strokeWidth={tool === 'eraser' ? strokeSize * 4 : strokeSize}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        {/* Tools */}
        <View style={styles.toolGroup}>
          <TouchableOpacity
            style={[styles.toolBtn, tool === 'pen' && styles.toolBtnActive]}
            onPress={() => setTool('pen')}
          >
            <Pencil size={16} color={tool === 'pen' ? '#3B82F6' : '#64748B'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, tool === 'eraser' && styles.toolBtnActive]}
            onPress={() => setTool('eraser')}
          >
            <Eraser size={16} color={tool === 'eraser' ? '#F59E0B' : '#64748B'} />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        {/* Colors */}
        <View style={styles.colorGroup}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                selectedColor === c && tool === 'pen' && styles.colorDotActive,
              ]}
              onPress={() => { setSelectedColor(c); setTool('pen'); }}
            />
          ))}
        </View>

        <View style={styles.separator} />

        {/* Stroke sizes */}
        <View style={styles.sizeGroup}>
          {STROKE_SIZES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.sizeBtn, strokeSize === s && styles.sizeBtnActive]}
              onPress={() => setStrokeSize(s)}
            >
              <View style={[styles.sizeDot, { width: s + 2, height: s + 2, borderRadius: (s + 2) / 2 }]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.separator} />

        {/* Actions */}
        <View style={styles.toolGroup}>
          <TouchableOpacity style={styles.toolBtn} onPress={handleUndo}>
            <Undo2 size={16} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={handleClear}>
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  editingBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(59,130,246,0.1)',
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 10, marginTop: 6,
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)',
  },
  selfEditingBadge: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.2)',
  },
  editingText: { color: '#3B82F6', fontSize: 11, fontWeight: '600' },
  selfEditingText: { color: '#10B981' },

  canvasContainer: {
    flex: 1,
    backgroundColor: CANVAS_BG,
    margin: 10, marginBottom: 0,
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },

  toolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    flexWrap: 'wrap', gap: 4,
  },
  toolGroup: { flexDirection: 'row', gap: 4 },
  colorGroup: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  sizeGroup: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  separator: {
    width: 1, height: 24,
    backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 6,
  },
  toolBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center',
  },
  toolBtnActive: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
  },
  colorDot: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 4,
  },
  sizeBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center',
  },
  sizeBtnActive: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)',
  },
  sizeDot: { backgroundColor: '#94A3B8', borderRadius: 5 },
});
