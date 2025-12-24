
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdsSettings } from '../types';
import { getAdsSettings } from '../services/cms';
import { ADS_SETTINGS as DEFAULT_ADS } from '../constants';

interface AdsContextType {
  settings: AdsSettings;
  refreshSettings: () => Promise<void>;
  loading: boolean;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export const AdsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AdsSettings>(DEFAULT_ADS);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    setLoading(true);
    try {
      const data = await getAdsSettings();
      setSettings(data);
    } catch (error) {
      console.error("AdsProvider fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <AdsContext.Provider value={{ settings, refreshSettings, loading }}>
      {children}
    </AdsContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdsContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
};
