import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ApiSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string;
  updated_at: string;
}

interface ApiSettings {
  apiBaseUrl: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useApiSettings = (): ApiSettings => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('https://camgrabber-mb2q.onrender.com');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApiSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('api_settings')
        .select('*')
        .eq('setting_key', 'api_base_url')
        .single();

      if (fetchError) {
        // If no settings found, use default
        if (fetchError.code === 'PGRST116') {
          console.log('No API settings found, using default');
          setApiBaseUrl('https://camgrabber-mb2q.onrender.com');
        } else {
          throw fetchError;
        }
      } else if (data) {
        setApiBaseUrl(data.setting_value);
      }
    } catch (err) {
      console.error('Error fetching API settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch API settings');
      // Fallback to default URL
      setApiBaseUrl('https://camgrabber-mb2q.onrender.com');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchApiSettings();
  };

  useEffect(() => {
    fetchApiSettings();
  }, []);

  return {
    apiBaseUrl,
    loading,
    error,
    refresh
  };
};

// Hook for getting all API settings (admin use)
export const useAllApiSettings = () => {
  const [settings, setSettings] = useState<ApiSetting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('api_settings')
        .select('*')
        .order('setting_key');

      if (fetchError) throw fetchError;

      setSettings(data || []);
    } catch (err) {
      console.error('Error fetching all API settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch API settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refresh: fetchAllSettings
  };
};
