import { CameraView } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCamServer } from '../context/CamServerContext';

export type Prediction = { label: string; probability: number };

const INTERVAL_MS = 300; // busyRef 會自然節流，設短讓下一幀盡快觸發

export function useStreamPredict(cameraRef: React.RefObject<CameraView | null>) {
  const { baseUrl } = useCamServer();
  const baseUrlRef = useRef(baseUrl);
  useEffect(() => { baseUrlRef.current = baseUrl; }, [baseUrl]);

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [fps, setFps] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const busyRef = useRef(false);
  const fpsCountRef = useRef(0);
  const fpsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const captureAndSend = useCallback(async () => {
    if (busyRef.current || !cameraRef.current) return;
    busyRef.current = true;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true, quality: 0.2, skipProcessing: true,
      });
      if (!photo?.base64) return;

      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 224, height: 224 } }],
        { base64: true, format: ImageManipulator.SaveFormat.JPEG, compress: 0.5 }
      );
      if (!resized.base64) return;

      const res = await fetch(`${baseUrlRef.current}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: resized.base64 }),
      });
      const data: Prediction[] = await res.json();
      setPredictions([...data].sort((a, b) => b.probability - a.probability));
      fpsCountRef.current += 1;
    } catch (e) {
      console.warn('送幀失敗:', e);
    } finally {
      busyRef.current = false;
    }
  }, [cameraRef]);

  const startStream = useCallback(() => {
    if (timerRef.current) return;
    setStreaming(true);
    timerRef.current = setInterval(captureAndSend, INTERVAL_MS);
    fpsTimerRef.current = setInterval(() => {
      setFps(fpsCountRef.current);
      fpsCountRef.current = 0;
    }, 1000);
  }, [captureAndSend]);

  const stopStream = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (fpsTimerRef.current) { clearInterval(fpsTimerRef.current); fpsTimerRef.current = null; }
    setStreaming(false);
    setFps(0);
  }, []);

  useEffect(() => () => { stopStream(); }, [stopStream]);

  return { predictions, streaming, fps, startStream, stopStream };
}
