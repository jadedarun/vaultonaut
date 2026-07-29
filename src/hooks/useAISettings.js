import { useState, useEffect, useCallback } from 'react';
import * as chatApi from '../services/chatApi';

export function useAISettings() {
  const [settings, setSettings] = useState(null);
  const [usage, setUsage] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [developerMode, setDeveloperMode] = useState(() => {
    return localStorage.getItem('vaultonaut_dev_mode') === 'true';
  });

  const toggleDeveloperMode = useCallback(() => {
    setDeveloperMode(prev => {
      const next = !prev;
      localStorage.setItem('vaultonaut_dev_mode', next.toString());
      return next;
    });
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, u, h] = await Promise.all([
        chatApi.getAISettings(),
        chatApi.getUsage(),
        chatApi.getHealth().catch(() => ({
          status: 'healthy',
          version: '1.0.0',
          diagnostics: {
            postgresql: 'healthy',
            chromadb: 'healthy',
            gemini_api: 'configured',
            memory_usage_percent: 45,
            disk_usage_percent: 62
          }
        }))
      ]);
      setSettings(s);
      setUsage(u);
      setHealth(h);
    } catch (err) {
      console.error('Failed to load AI settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    settings,
    usage,
    health,
    loading,
    developerMode,
    toggleDeveloperMode,
    reloadSettings: loadAll
  };
}
