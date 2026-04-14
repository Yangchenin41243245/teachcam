import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#0f172a', dark: '#0f172a' }}
      headerImage={
        <ThemedView style={styles.headerContent}>
          <ThemedText style={styles.headerEmoji}>📷</ThemedText>
          <ThemedText style={styles.headerTitle}>TeachCam</ThemedText>
          <ThemedText style={styles.headerSub}>Teachable Machine × Flask × Expo</ThemedText>
        </ThemedView>
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">即時影像辨識</ThemedText>
        <ThemedText style={styles.badge}>🧠 AI Powered</ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText style={styles.cardIcon}>🎯</ThemedText>
        <ThemedView style={styles.cardBody}>
          <ThemedText type="subtitle">專題簡介</ThemedText>
          <ThemedText>
            本專題結合 Google Teachable Machine 訓練的自訂影像分類模型，
            手機相機以每秒多幀的方式將影像串流送至電腦端 Flask 伺服器，
            由 Python + Keras 完成推論後即時回傳辨識結果。
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText style={styles.cardIcon}>🛠</ThemedText>
        <ThemedView style={styles.cardBody}>
          <ThemedText type="subtitle">技術架構</ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">手機端框架：</ThemedText>Expo Router（React Native）{'\n'}
            <ThemedText type="defaultSemiBold">相機擷取：</ThemedText>expo-camera{'\n'}
            <ThemedText type="defaultSemiBold">影像前處理：</ThemedText>expo-image-manipulator（224×224 JPEG）{'\n'}
            <ThemedText type="defaultSemiBold">通訊方式：</ThemedText>HTTP POST / JSON base64{'\n'}
            <ThemedText type="defaultSemiBold">伺服器：</ThemedText>Python Flask（threaded）{'\n'}
            <ThemedText type="defaultSemiBold">推論引擎：</ThemedText>TensorFlow / Keras（keras_model.h5）{'\n'}
            <ThemedText type="defaultSemiBold">模型來源：</ThemedText>Teachable Machine（Keras 格式）
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText style={styles.cardIcon}>🔄</ThemedText>
        <ThemedView style={styles.cardBody}>
          <ThemedText type="subtitle">運作流程</ThemedText>
          <ThemedView style={styles.steps}>
            {[
              '在 SETTINGS 頁填入電腦 IP，按「套用」',
              '前往 VISION 頁，按下「開始串流」',
              '手機每 300ms 拍攝一幀並壓縮至 224×224',
              '以 base64 JSON 送至 Flask /predict 端點',
              'Flask 執行 Keras 推論，回傳各類別信心度',
              'App 即時更新長條圖與 FPS 顯示',
            ].map((step, i) => (
              <ThemedView key={i} style={styles.stepRow}>
                <ThemedView style={styles.stepNum}>
                  <ThemedText style={styles.stepNumText}>{i + 1}</ThemedText>
                </ThemedView>
                <ThemedText style={styles.stepText}>{step}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText style={styles.cardIcon}>📌</ThemedText>
        <ThemedView style={styles.cardBody}>
          <ThemedText type="subtitle">使用注意事項</ThemedText>
          <ThemedText>
            • 手機與電腦須在同一個 Wi-Fi 網段{'\n'}
            • 使用前先在電腦執行 python server.py{'\n'}
            • 辨識準確度取決於 Teachable Machine 訓練資料品質{'\n'}
            • 網路延遲會影響實際 fps，可在 SETTINGS 測試連線
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>
          先至 <ThemedText type="defaultSemiBold">⚙️ SETTINGS</ThemedText> 設定 IP，再前往 <ThemedText type="defaultSemiBold">📷 VISION</ThemedText> 開始串流
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerEmoji: {
    fontSize: 56,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badge: {
    fontSize: 12,
    backgroundColor: '#1e40af',
    color: '#bfdbfe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(148,163,184,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.15)',
  },
  cardIcon: {
    fontSize: 28,
    marginTop: 2,
  },
  cardBody: {
    flex: 1,
    gap: 6,
    backgroundColor: 'transparent',
  },
  steps: {
    gap: 8,
    backgroundColor: 'transparent',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'transparent',
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
  },
});