import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw, AlertCircle, CheckCircle, Globe } from 'lucide-react';

interface ApiSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string;
  updated_at: string;
}

const ApiSettings: React.FC = () => {
  const [settings, setSettings] = useState<ApiSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  // Form state
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('api_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;

      setSettings(data || []);
      
      // Set form values from loaded settings
      const apiUrlSetting = data?.find(s => s.setting_key === 'api_base_url');
      if (apiUrlSetting) {
        setApiBaseUrl(apiUrlSetting.setting_value);
        setDescription(apiUrlSetting.description || '');
      }
    } catch (error) {
      console.error('Error loading API settings:', error);
      toast({
        title: "Error",
        description: "Failed to load API settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Validate API URL
      if (!apiBaseUrl.trim()) {
        toast({
          title: "Validation Error",
          description: "API Base URL is required",
          variant: "destructive",
        });
        return;
      }

      // Basic URL validation
      try {
        new URL(apiBaseUrl);
      } catch {
        toast({
          title: "Validation Error",
          description: "Please enter a valid URL",
          variant: "destructive",
        });
        return;
      }

      // Update or insert API base URL setting
      const { error } = await supabase
        .from('api_settings')
        .upsert({
          setting_key: 'api_base_url',
          setting_value: apiBaseUrl.trim(),
          description: description.trim() || 'Base URL for video API endpoints'
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "API settings saved successfully",
      });

      // Reload settings
      await loadSettings();
    } catch (error) {
      console.error('Error saving API settings:', error);
      toast({
        title: "Error",
        description: "Failed to save API settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testApiConnection = async () => {
    if (!apiBaseUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an API Base URL first",
        variant: "destructive",
      });
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);

      // Test the API connection by making a simple request
      const testUrl = `${apiBaseUrl}/api/health`; // You might need to adjust this endpoint
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        setTestResult({
          success: true,
          message: `API is reachable (Status: ${response.status})`
        });
      } else {
        setTestResult({
          success: false,
          message: `API returned status: ${response.status}`
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading API settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Settings</h2>
          <p className="text-muted-foreground">
            Manage your video API configuration
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Video API Configuration
          </CardTitle>
          <CardDescription>
            Configure the base URL for your video API endpoints. This URL is used for streaming, downloading, and fetching video information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="api-base-url">API Base URL</Label>
            <Input
              id="api-base-url"
              type="url"
              placeholder="https://your-api-domain.com"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              The base URL for your video API (e.g., https://camgrabber-mb2q.onrender.com)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description for this API configuration"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {testResult && (
            <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={saveSettings} 
              disabled={saving || !apiBaseUrl.trim()}
              className="flex items-center gap-2"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>

            <Button 
              variant="outline" 
              onClick={testApiConnection}
              disabled={testing || !apiBaseUrl.trim()}
              className="flex items-center gap-2"
            >
              {testing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Settings Display */}
      {settings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Settings</CardTitle>
            <CardDescription>
              All configured API settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{setting.setting_key}</h4>
                    <p className="text-sm text-muted-foreground font-mono">
                      {setting.setting_value}
                    </p>
                    {setting.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {setting.description}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated: {new Date(setting.updated_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiSettings;
