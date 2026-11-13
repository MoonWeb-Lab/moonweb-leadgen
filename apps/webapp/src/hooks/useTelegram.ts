import { useEffect, useState, useCallback } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export function useTelegram() {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.expand();
      try {
        webApp.setHeaderColor('#070C18');
        webApp.setBackgroundColor('#070C18');
      } catch (e) {}

      setTg(webApp);
      if (webApp.initDataUnsafe?.user) {
        setUser(webApp.initDataUnsafe.user);
      }
    }
    setIsReady(true);
  }, []);

  const triggerHaptic = useCallback((style: 'light' | 'medium' | 'heavy' = 'light') => {
    try {
      tg?.HapticFeedback?.impactOccurred(style);
    } catch (e) {}
  }, [tg]);

  const triggerNotificationHaptic = useCallback((type: 'success' | 'warning' | 'error' = 'success') => {
    try {
      tg?.HapticFeedback?.notificationOccurred(type);
    } catch (e) {}
  }, [tg]);

  const closeApp = useCallback(() => {
    tg?.close();
  }, [tg]);

  return {
    tg,
    user,
    userId: user?.id || null,
    isTelegram: Boolean(window.Telegram?.WebApp?.initData),
    isReady,
    triggerHaptic,
    triggerNotificationHaptic,
    closeApp
  };
}
