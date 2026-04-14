import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { DEFAULT_CAM_HOST, DEFAULT_CAM_PORT, useCamServer } from '../../context/CamServerContext';

type PingState = 'idle' | 'loading' | 'ok' | 'error';

export default function SettingsScreen() {
  const { host, port, baseUrl, setHost, setPort } = useCamServer();

  const [editingHost, setEditingHost] = useState(host);
  const [editingPort, setEditingPort] = useState(String(port));
  const [pingState, setPingState] = useState<PingState>('idle');
  const [pingMsg, setPingMsg] = useState('');

  const applySettings = () => {
    const trimmedHost = editingHost.trim();
    const parsed = parseInt(editingPort.trim(), 10);
    const validPort = !isNaN(parsed) && parsed > 0 && parsed <= 65535 ? parsed : port;
    setHost(trimmedHost);
    setPort(validPort);
    setPingState('idle');
    setPingMsg('');
  };

  const resetToDefault = () => {
    setEditingHost(DEFAULT_CAM_HOST);
    setEditingPort(String(DEFAULT_CAM_PORT));
    setHost(DEFAULT_CAM_HOST);
    setPort(DEFAULT_CAM_PORT);
    AsyncStorage.multiRemove(['cam_host', 'cam_port']).catch(() => {});
    setPingState('idle');
  };

  const pingServer = async () => {
    setPingState('loading');
    setPingMsg('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(`http://${editingHost.trim()}:${editingPort.trim()}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        const labelLine = Array.isArray(json?.labels) && json.labels.length > 0
          ? `\n類別：${(json.labels as string[]).join(' / ')}`
          : '';
        setPingState('ok');
        setPingMsg(`✓ 連線成功　${json?.model ?? ''}${labelLine}`);
      } else {
        setPingState('error');
        setPingMsg(`HTTP ${res.status}`);
      }
    } catch (e: unknown) {
      clearTimeout(timeoutId);
      setPingState('error');
      setPingMsg(e instanceof Error ? e.message : '連線失敗');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── 標題 ── */}
      <Text style={styles.sectionTitle}>FLASK SERVER 設定</Text>

      {/* ── IP 輸入 ── */}
      <View style={styles.row}>
        <Text style={styles.label}>IP</Text>
        <TextInput
          style={styles.input}
          value={editingHost}
          onChangeText={setEditingHost}
          placeholder="192.168.1.xxx"
          placeholderTextColor="#444"
          autoCapitalize="none"
          keyboardType="numbers-and-punctuation"
          onSubmitEditing={applySettings}
        />
      </View>

      {/* ── Port 輸入 ── */}
      <View style={styles.row}>
        <Text style={styles.label}>Port</Text>
        <TextInput
          style={[styles.input, { width: 100 }]}
          value={editingPort}
          onChangeText={setEditingPort}
          placeholder="5000"
          placeholderTextColor="#444"
          keyboardType="number-pad"
          onSubmitEditing={applySettings}
        />
      </View>

      {/* ── 目前連線 ── */}
      <Text style={styles.currentUrl}>目前連線：{baseUrl}</Text>

      {/* ── 按鈕列 ── */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.applyBtn} onPress={applySettings}>
          <Text style={styles.btnText}>套用</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pingBtn} onPress={pingServer} disabled={pingState === 'loading'}>
          {pingState === 'loading'
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.btnText}>🔌 測試連線</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetBtn} onPress={resetToDefault}>
          <Text style={styles.btnText}>重設</Text>
        </TouchableOpacity>
      </View>

      {/* ── Ping 結果 ── */}
      {pingState !== 'idle' && pingState !== 'loading' && (
        <View style={[styles.pingResult, pingState === 'ok' ? styles.pingOk : styles.pingError]}>
          <Text style={styles.pingResultText}>{pingMsg}</Text>
        </View>
      )}

      {/* ── 說明 ── */}
      <View style={styles.hintBox}>
        <Text style={styles.hintTitle}>📋 連線步驟</Text>
        <Text style={styles.hintText}>
          1. 電腦與手機連至同一個 WiFi{'\n'}
          2. 電腦執行 <Text style={styles.code}>python server.py</Text>{'\n'}
          3. 查詢電腦 IP（macOS: <Text style={styles.code}>ipconfig getifaddr en0</Text>）{'\n'}
          4. 填入上方 IP 欄位，按「套用」{'\n'}
          5. 按「測試連線」確認是否成功
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0f1117' },
  content:     { padding: 16, gap: 12 },
  sectionTitle: {
    color: '#4a90e2', fontSize: 11, fontFamily: 'monospace',
    letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase',
  },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label:       { color: '#888', fontSize: 13, fontFamily: 'monospace', width: 36 },
  input: {
    flex: 1, backgroundColor: '#1a1d27', color: '#e0e0e0',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 14, fontFamily: 'monospace',
    borderWidth: 1, borderColor: '#2a2d3a',
  },
  currentUrl:  { color: '#3a5a8a', fontSize: 11, fontFamily: 'monospace' },
  btnRow:      { flexDirection: 'row', gap: 8, marginTop: 4 },
  applyBtn:    { flex: 1, backgroundColor: '#2563eb', borderRadius: 8, padding: 12, alignItems: 'center' },
  pingBtn:     { flex: 2, backgroundColor: '#0e7490', borderRadius: 8, padding: 12, alignItems: 'center' },
  resetBtn:    { flex: 1, backgroundColor: '#374151', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: 13 },
  pingResult:  { borderRadius: 8, padding: 12 },
  pingOk:      { backgroundColor: '#14532d' },
  pingError:   { backgroundColor: '#7f1d1d' },
  pingResultText: { color: '#fff', fontFamily: 'monospace', fontSize: 13 },
  hintBox: {
    backgroundColor: '#1a1d27', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#2a2d3a', marginTop: 8,
  },
  hintTitle:   { color: '#94a3b8', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  hintText:    { color: '#64748b', fontSize: 12, lineHeight: 22 },
  code:        { color: '#7dd3fc', fontFamily: 'monospace' },
});
