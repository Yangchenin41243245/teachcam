import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef } from 'react';
import {
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useStreamPredict } from '../../hooks/useStreamPredict';

export default function VisionScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { predictions, streaming, fps, startStream, stopStream } = useStreamPredict(cameraRef);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.label}>需要相機權限</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>授予權限</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const top = predictions[0];

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      <View style={styles.overlay}>
        {/* ── 頂部標籤 ── */}
        {top && (
          <View style={styles.resultCard}>
            <Text style={styles.topLabel} numberOfLines={1}>{top.label}</Text>
            <Text style={styles.topProb}>{(top.probability * 100).toFixed(1)}%</Text>
          </View>
        )}

        {/* ── 長條圖 ── */}
        {predictions.length > 0 && (
          <View style={styles.barsContainer}>
            {predictions.map((p) => (
              <View key={p.label} style={styles.barRow}>
                <Text style={styles.barLabel} numberOfLines={1}>{p.label}</Text>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${p.probability * 100}%` as any },
                      p.label === top?.label && styles.barFillTop,
                    ]}
                  />
                </View>
                <Text style={styles.barProb}>{(p.probability * 100).toFixed(0)}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── FPS 指示 ── */}
        {streaming && (
          <Text style={styles.fpsText}>
            🟢 串流中　{fps} fps
          </Text>
        )}

        {/* ── 控制按鈕 ── */}
        <TouchableOpacity
          style={[styles.btn, streaming && styles.btnStop]}
          onPress={streaming ? stopStream : startStream}
        >
          <Text style={styles.btnText}>
            {streaming ? '⏹ 停止串流' : '▶ 開始串流'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#000' },
  camera:       { flex: 1 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 36,
    backgroundColor: 'rgba(0,0,0,0.70)',
    gap: 12,
  },
  resultCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12,
  },
  topLabel:     { color: '#fff', fontSize: 20, fontWeight: '700', flex: 1 },
  topProb:      { color: '#4ade80', fontSize: 24, fontWeight: '800' },
  barsContainer:{ gap: 6 },
  barRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel:     { color: '#ccc', fontSize: 12, width: 80 },
  barBg:        { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4 },
  barFill:      { height: 8, backgroundColor: '#6b7280', borderRadius: 4 },
  barFillTop:   { backgroundColor: '#4ade80' },
  barProb:      { color: '#ccc', fontSize: 11, width: 34, textAlign: 'right' },
  fpsText:      { color: '#86efac', fontSize: 12, textAlign: 'center' },
  btn:          { backgroundColor: '#2563eb', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnStop:      { backgroundColor: '#dc2626' },
  btnText:      { color: '#fff', fontWeight: '700', fontSize: 16 },
  label:        { color: '#fff', marginBottom: 12, fontSize: 16 },
});
