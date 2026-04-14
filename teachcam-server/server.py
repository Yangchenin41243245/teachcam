# server.py
import os
os.environ['TF_USE_LEGACY_KERAS'] = '1'  # 強制使用 Keras 2，相容 Teachable Machine .h5

from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import base64, json
from PIL import Image
import io

app = Flask(__name__)

# ── 載入 Teachable Machine 模型 ──────────────────────────────
model = tf.keras.models.load_model("model/keras_model.h5", compile=False)

with open("model/labels.txt", "r", encoding="utf-8") as f:
    labels = [line.strip().split(" ", 1)[-1] for line in f if line.strip()]

print(f"✅ 模型載入完成，類別：{labels}")

# ── 推論端點 ─────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)
    b64 = data.get("image", "")

    # base64 → PIL Image → numpy（client 已送 224×224，省略 resize）
    img_bytes = base64.b64decode(b64)
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    arr = np.array(img, dtype=np.float32) / 127.5 - 1.0          # [-1, 1]
    arr = np.expand_dims(arr, axis=0)                             # [1,224,224,3]

    preds = model.predict(arr, verbose=0)[0]
    result = [{"label": labels[i], "probability": float(p)} for i, p in enumerate(preds)]
    return jsonify(result)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "keras_model.h5", "labels": labels})

if __name__ == "__main__":
    # 0.0.0.0 讓同網段手機能連進來
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)