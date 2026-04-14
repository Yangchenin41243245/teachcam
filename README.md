# TeachCam

**Teachable Machine × Flask × Expo**

手機相機即時串流影像至電腦端 Flask 伺服器，由 Python + Keras 完成推論後即時回傳辨識結果的 AI 影像分類專題。

---

## 專題架構

```
手機（Expo App）                    電腦（Flask Server）
┌─────────────────────┐             ┌──────────────────────────┐
│  expo-camera 擷取   │──HTTP POST──▶  /predict               │
│  224×224 JPEG base64│             │  TensorFlow / Keras 推論 │
│  每 300ms 一幀      │◀──JSON──────│  回傳各類別信心度        │
│                     │             │                          │
│  長條圖 + FPS 顯示  │             │  keras_model.h5          │
│  Settings 設定 IP   │             │  labels.txt              │
└─────────────────────┘             └──────────────────────────┘
```

---

## 技術棧

| 層級 | 技術 |
|------|------|
| 手機端框架 | Expo Router（React Native） |
| 相機擷取 | expo-camera |
| 影像前處理 | expo-image-manipulator（resize 至 224×224 JPEG） |
| 通訊方式 | HTTP POST / JSON base64 |
| 伺服器 | Python Flask（threaded） |
| 推論引擎 | TensorFlow / Keras |
| 模型來源 | Google Teachable Machine（Keras `.h5` 格式） |

---

## 目錄結構

```
teachcam/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx       # 首頁（專題說明）
│   │   ├── vision.tsx      # 相機串流 + 辨識結果
│   │   └── settings.tsx    # Flask 伺服器 IP / Port 設定
│   └── _layout.tsx
├── context/
│   └── CamServerContext.tsx  # 全域伺服器 URL 狀態（AsyncStorage 持久化）
├── hooks/
│   ├── useStreamPredict.ts   # 擷取 → 壓縮 → 送幀 → 解析結果
│   └── useTeachableModel.ts  # 本機 TF.js 推論（備用）
└── teachcam-server/
    ├── server.py             # Flask 推論伺服器
    └── model/
        ├── keras_model.h5    # Teachable Machine 匯出模型
        └── labels.txt        # 類別標籤
```

---

## 快速開始

### 1. 電腦端 — 啟動 Flask 伺服器

```bash
cd teachcam-server

# 安裝依賴（建議使用虛擬環境）
pip install flask tensorflow pillow numpy

# 啟動伺服器（預設 0.0.0.0:5000）
python server.py
```

> 看到 `✅ 模型載入完成，類別：[...]` 表示啟動成功。

### 2. 查詢電腦 IP

```bash
# macOS
ipconfig getifaddr en0

# Windows（在命令提示字元執行）
ipconfig
# 找 IPv4 位址（通常是 192.168.x.x）
```

### 3. 手機端 — 啟動 Expo App

```bash
# 安裝依賴
npm install

# 啟動 Expo Dev Server
npx expo start
```

用 Expo Go 掃描 QR Code，或連接 Android / iOS 實機 / 模擬器。

### 4. 設定連線

1. 在 App 切換至 **SETTINGS** 頁籤
2. 填入電腦 IP（Port 預設 `5000`）
3. 按「**套用**」儲存設定
4. 按「**測試連線**」確認伺服器回應

### 5. 開始辨識

切換至 **VISION** 頁籤，按「**▶ 開始串流**」即可看到即時辨識結果與 FPS 數值。

---

## API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| `GET` | `/health` | 健康檢查，回傳模型名稱與類別清單 |
| `POST` | `/predict` | 接收 base64 影像，回傳各類別信心度陣列 |

**`/predict` 請求格式**

```json
{ "image": "<base64 JPEG string>" }
```

**`/predict` 回應格式**

```json
[
  { "label": "Cat",  "probability": 0.92 },
  { "label": "Dog",  "probability": 0.08 }
]
```

---

## 使用自訂模型

1. 至 [Teachable Machine](https://teachablemachine.withgoogle.com/) 訓練影像分類模型
2. 匯出時選擇 **Keras → 下載模型**
3. 將 `keras_model.h5` 與 `labels.txt` 放入 `teachcam-server/model/`
4. 重新啟動 `server.py`

---

## 注意事項

- 手機與電腦須連至**同一個 Wi-Fi 網段**
- 辨識準確度取決於 Teachable Machine 的訓練資料品質
- 網路延遲會影響實際 FPS；可在 SETTINGS 頁測試連線品質
- Flask 伺服器使用 `threaded=True`，可同時處理多個請求
