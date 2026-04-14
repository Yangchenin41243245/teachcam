import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export const DEFAULT_CAM_HOST = '192.168.1.1';
export const DEFAULT_CAM_PORT = 5000;

type CamServerCtx = {
  host: string;
  port: number;
  baseUrl: string;
  setHost: (h: string) => void;
  setPort: (p: number) => void;
};

const CamServerContext = createContext<CamServerCtx>({
  host: DEFAULT_CAM_HOST,
  port: DEFAULT_CAM_PORT,
  baseUrl: `http://${DEFAULT_CAM_HOST}:${DEFAULT_CAM_PORT}`,
  setHost: () => {},
  setPort: () => {},
});

export const useCamServer = () => useContext(CamServerContext);

export const CamServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [host, setHostState] = useState(DEFAULT_CAM_HOST);
  const [port, setPortState] = useState(DEFAULT_CAM_PORT);

  // 啟動時從 AsyncStorage 讀取上次設定
  useEffect(() => {
    (async () => {
      const [savedHost, savedPort] = await Promise.all([
        AsyncStorage.getItem('cam_host'),
        AsyncStorage.getItem('cam_port'),
      ]);
      if (savedHost) setHostState(savedHost);
      if (savedPort) setPortState(Number(savedPort));
    })();
  }, []);

  const setHost = useCallback((h: string) => {
    const trimmed = h.trim();
    setHostState(trimmed);
    AsyncStorage.setItem('cam_host', trimmed).catch(() => {});
  }, []);

  const setPort = useCallback((p: number) => {
    setPortState(p);
    AsyncStorage.setItem('cam_port', String(p)).catch(() => {});
  }, []);

  const baseUrl = `http://${host}:${port}`;

  return (
    <CamServerContext.Provider value={{ host, port, baseUrl, setHost, setPort }}>
      {children}
    </CamServerContext.Provider>
  );
};
