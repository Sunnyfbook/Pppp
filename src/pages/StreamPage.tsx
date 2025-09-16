import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Home, Play, AlertTriangle, Download, Share2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoPlayer from '@/components/VideoPlayer';
import VideoReactions from '@/components/VideoReactions';
import VideoActions from '@/components/VideoActions';
import ErrorBoundary from '@/components/ErrorBoundary';
import AdDisplay from '@/components/AdDisplay';
import { validateFileId } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

import { VideoReactionsProvider } from '@/context/VideoReactionsContext';

const API_BASE_URL = 'https://camgrabber-mb2q.onrender.com';

const StreamPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const fileId = searchParams.get('id');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<any>({});

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await supabase
          .from('website_settings')
          .select('*');
        
        const settings = (data || []).reduce((acc: any, setting: any) => {
          acc[setting.setting_key] = typeof setting.setting_value === 'string' 
            ? setting.setting_value.replace(/"/g, '') 
            : setting.setting_value;
          return acc;
        }, {});
        
        setSiteSettings(settings);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  useEffect(() => {
    const fetchVideoInfo = async () => {
      if (!fileId || !validateFileId(fileId)) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/file/${fileId}`);
        if (response.ok) {
          const data = await response.json();
          const title = data.file_name || `Video ${fileId}`;
          setVideoTitle(title);
          // Update browser page title - use dynamic site title
          document.title = siteSettings.site_title || 'StreamFlix Pro';
        } else {
          setVideoTitle(`Video ${fileId}`);
          document.title = siteSettings.site_title || 'StreamFlix Pro';
        }
      } catch (error) {
        console.error('Error fetching video info:', error);
        setVideoTitle(`Video ${fileId}`);
        document.title = siteSettings.site_title || 'StreamFlix Pro';
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoInfo();
    
    // Cleanup: Reset title when component unmounts
    return () => {
      document.title = siteSettings.site_title || 'StreamFlix Pro';
    };
  }, [fileId, siteSettings.site_title]);

  if (!fileId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-4">Invalid Stream</h1>
          <p className="text-gray-300 mb-6">No video ID provided in the URL.</p>
          <Link to="/">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <Home className="mr-2" size={20} />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Security: Validate fileId to prevent injection attacks
  if (!validateFileId(fileId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={64} />
          <h1 className="text-4xl font-bold text-red-500 mb-4">Security Warning</h1>
          <p className="text-gray-300 mb-2">The video ID contains invalid characters.</p>
          <p className="text-gray-300 mb-6">This could be a security threat and has been blocked.</p>
          <Link to="/">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <Home className="mr-2" size={20} />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 sm:gap-3 max-w-full">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Play className="text-white" size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                  {siteSettings.site_title || 'StreamFlix Pro'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 hidden sm:block truncate">
                  {isLoading ? 'Loading...' : videoTitle || `Video ${fileId}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Video Player */}
      <main className="relative z-10 container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <VideoReactionsProvider videoId={fileId}>
          <div className="space-y-6">
            {/* Top of Player Ad */}
            <AdDisplay placement="stream-player-top" />
            
            <ErrorBoundary>
              <VideoPlayer fileId={fileId} apiBaseUrl={API_BASE_URL} />
            </ErrorBoundary>
            
            <div className="max-w-6xl mx-auto space-y-4">
              <ErrorBoundary>
                <VideoReactions videoId={fileId} />
              </ErrorBoundary>
              
              {/* Below Reactions Ad */}
              <AdDisplay placement="stream-below-reactions" />
              
              {/* Download Button with Ad */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `${API_BASE_URL}/dl/${fileId}`;
                      link.download = `video_${fileId}`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }} 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    <span>Download Video</span>
                  </Button>
                </div>
                
                {/* Below Download Ad */}
                <AdDisplay placement="stream-below-download" />
                
                {/* Copy Link Button */}
                <div className="flex justify-center">
                  <Button 
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`${window.location.origin}/stream?id=${fileId}`);
                        // You can add toast notification here
                      } catch (err) {
                        console.error('Copy failed');
                      }
                    }}
                    variant="outline" 
                    className="flex items-center justify-center gap-2 border-border hover:bg-card"
                  >
                    <LinkIcon size={18} />
                    <span>Copy Link</span>
                  </Button>
                </div>
                
                {/* Below Copy Ad */}
                <AdDisplay placement="stream-below-copy" />
                
                {/* Share Button */}
                <div className="flex justify-center">
                  <Button 
                    onClick={async () => {
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: 'Check out this video',
                            text: 'Watch this amazing video!',
                            url: `${window.location.origin}/stream?id=${fileId}`,
                          });
                        } catch (err) {
                          console.log('Share cancelled');
                        }
                      } else {
                        // Fallback to copy
                        try {
                          await navigator.clipboard.writeText(`${window.location.origin}/stream?id=${fileId}`);
                        } catch (err) {
                          console.error('Copy failed');
                        }
                      }
                    }}
                    variant="outline" 
                    className="flex items-center justify-center gap-2 border-border hover:bg-card"
                  >
                    <Share2 size={18} />
                    Share
                  </Button>
                </div>
                
                {/* Below Share Ad */}
                <AdDisplay placement="stream-below-share" />
              </div>
            </div>
            
            {/* Stream Popup Ad */}
            <AdDisplay placement="stream-popup" />
            
            {/* Stream Interstitial Ad */}
            <AdDisplay placement="stream-interstitial" />
          </div>
        </VideoReactionsProvider>
      </main>
    </div>
  );
};

export default StreamPage;