import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import { useEffect, useRef, useState } from 'react';
import { bundleResourceIO } from './bundleResourceIO';

const modelJson = require('../assets/model/model.json');
const modelWeights = require('../assets/model/weights.bin');

export type Prediction = { label: string; probability: number };

// React Native（Hermes）不會自動初始化 TF.js platform，需手動補上
function ensurePlatform() {
  if (tf.env().platform == null) {
    tf.setPlatform('rn', {
      fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
      now: () => Date.now(),
      encode: (text: string, _encoding: string) =>
        new TextEncoder().encode(text),
      decode: (bytes: Uint8Array, _encoding: string) =>
        new TextDecoder().decode(bytes),
      isTypedArray: (a: unknown): a is Float32Array | Int32Array | Uint8Array | Uint8ClampedArray =>
        ArrayBuffer.isView(a) && !(a instanceof DataView),
    });
  }
}

export function useTeachableModel() {
  const modelRef = useRef<tf.LayersModel | null>(null);
  const [ready, setReady] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        ensurePlatform();
        await tf.setBackend('cpu');
        await tf.ready();

        const model = await tf.loadLayersModel(
          bundleResourceIO(modelJson, modelWeights)
        );
        modelRef.current = model;

        try {
          const meta = require('../assets/model/metadata.json');
          setLabels(meta.labels ?? []);
        } catch {
          const outputShape = model.outputShape as number[];
          const count = outputShape[outputShape.length - 1];
          setLabels(Array.from({ length: count }, (_, i) => `Class ${i}`));
        }

        setReady(true);
      } catch (e) {
        console.error('模型載入失敗:', e);
      }
    })();
  }, []);

  async function predictTensor(tensor: tf.Tensor4D): Promise<Prediction[]> {
    if (!modelRef.current) return [];
    try {
      const output = modelRef.current.predict(tensor) as tf.Tensor;
      const probs = Array.from(await output.data());
      tf.dispose(output);
      return probs.map((prob, i) => ({
        label: labels[i] ?? `Class ${i}`,
        probability: prob,
      }));
    } catch (e) {
      console.error('推論失敗:', e);
      return [];
    }
  }

  return { ready, predictTensor, labels };
}
