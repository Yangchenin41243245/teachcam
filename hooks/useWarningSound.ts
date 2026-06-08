import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef } from 'react';

const COOLDOWN_MS = 3000;

export function useWarningSound() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const lastPlayedRef = useRef<number>(0);

  useEffect(() => {
    let sound: Audio.Sound;
    Audio.Sound.createAsync(require('../assets/sounds/warning.mp3'))
      .then(({ sound: s }) => {
        sound = s;
        soundRef.current = s;
      })
      .catch((e) => console.warn('音效載入失敗:', e));

    return () => {
      sound?.unloadAsync();
    };
  }, []);

  const triggerIfAbove = useCallback((probability: number, threshold: number) => {
    if (probability < threshold) return;
    const now = Date.now();
    if (now - lastPlayedRef.current < COOLDOWN_MS) return;
    lastPlayedRef.current = now;
    soundRef.current
      ?.replayAsync()
      .catch((e) => console.warn('音效播放失敗:', e));
  }, []);

  return { triggerIfAbove };
}
