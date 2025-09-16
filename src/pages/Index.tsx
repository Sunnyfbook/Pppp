import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Download, Sparkles, Zap, Star, TrendingUp, Globe, Shield, Clock, Users, ArrowRight, Search, Mic, Camera, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import AdDisplay from '@/components/AdDisplay';

const Index = () => {
  const [videoId, setVideoId] = useState('');
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const navigate = useNavigate();

  const loadRecentVideos = async () => {
    setLoadingVideos(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('file_id, title, views_count, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Shuffle the videos and pick one random video
      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setRecentVideos([shuffled[0]]); // Show only one random video
      } else {
        setRecentVideos([]);
      }
    } catch (error) {
      console.error('Error loading recent videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

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
        
        // Update document title
        if (settings.site_title) {
          document.title = settings.site_title;
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
    loadRecentVideos();
  }, []);

  const handleStream = () => {
    if (videoId.trim()) {
      navigate(`/stream?id=${encodeURIComponent(videoId.trim())}`);
    }
  };

  const handleVideoSelect = (selectedVideoId: string) => {
    setVideoId(selectedVideoId);
    navigate(`/stream?id=${encodeURIComponent(selectedVideoId)}`);
  };

  // Traditional homepage is now the main homepage

  // Add popup and interstitial ads for traditional homepage
  const popupAd = <AdDisplay placement="stream-popup" />;
  const interstitialAd = <AdDisplay placement="stream-interstitial" />;

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

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Play className="text-white" size={20} />
          </div>
          <span className="text-2xl font-bold text-white">{siteSettings.site_title || siteSettings.hero_title || 'StreamFlix'}</span>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main Title */}
          <div className="mb-6">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-4 leading-tight">
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {siteSettings.site_title || 'Video Streaming'}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {siteSettings.hero_subtitle || siteSettings.site_description || 'Experience lightning-fast, high-quality video streaming with our cutting-edge platform. Enter any video ID and start watching instantly.'}
            </p>
          </div>

          {/* Header Ads */}
          <div className="mb-6">
            <AdDisplay placement="header" className="max-w-4xl mx-auto" />
          </div>

          {/* Search Section */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-2">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter Video ID to start streaming..."
                      value={videoId}
                      onChange={(e) => setVideoId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleStream()}
                      className="bg-transparent border-0 text-white text-lg placeholder-gray-400 focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <Button 
                    onClick={handleStream} 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <Play className="mr-2" size={20} />
                    Watch Now
                  </Button>
                </div>
              </div>
            </div>
            
          </div>

          {/* Random Video Section */}
          {recentVideos.length > 0 && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Sparkles className="mr-2" size={20} />
                  Featured Video
                </h3>
                {loadingVideos ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <div
                    onClick={() => handleVideoSelect(recentVideos[0].file_id)}
                    className="bg-white/5 hover:bg-white/10 rounded-xl p-6 cursor-pointer transition-all duration-300 group border border-white/10 hover:border-white/20"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="text-white" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-lg group-hover:text-purple-300 transition-colors">
                          {recentVideos[0].title || `Video ${recentVideos[0].file_id}`}
                        </p>
                        <p className="text-gray-400 text-sm">
                          ID: {recentVideos[0].file_id}
                        </p>
                        {recentVideos[0].views_count && (
                          <p className="text-gray-500 text-sm mt-1">
                            {recentVideos[0].views_count} views
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mid-page Banner Ad */}
          <div className="max-w-4xl mx-auto mb-8">
            <AdDisplay placement="bottom-banner" className="w-full" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">4K+</div>
              <div className="text-gray-400">Quality</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">Instant</div>
              <div className="text-gray-400">Loading</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">Global</div>
              <div className="text-gray-400">CDN</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Available</div>
            </div>
          </div>

          {/* Join Community Button */}
          <div className="flex justify-center mb-8">
            <Button 
              onClick={() => window.open('https://t.me/+H8I94onbxyJlZjhl', '_blank')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105"
            >
              <Users className="mr-3" size={24} />
              Join Community
            </Button>
          </div>

          {/* Pre-footer Banner Ad - Only show if ad content is available */}
          <div className="max-w-4xl mx-auto mb-8">
            <AdDisplay placement="header" className="w-full" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Choose <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{siteSettings.site_title || 'StreamFlix'}</span>?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the next generation of video streaming with our advanced features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature Cards */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-500 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-300">Stream videos instantly with our optimized CDN network</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-500 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Secure & Private</h3>
              <p className="text-gray-300">Your data is protected with enterprise-grade security</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-500 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Global Access</h3>
              <p className="text-gray-300">Available worldwide with low latency streaming</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-500 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Camera className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">4K Ultra HD</h3>
              <p className="text-gray-300">Crystal clear video quality up to 4K resolution</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-500 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Download className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Download & Save</h3>
              <p className="text-gray-300">Download your favorite videos for offline viewing</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-500 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Community Driven</h3>
              <p className="text-gray-300">Join millions of users worldwide</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Ads */}
        <div className="mt-8">
          <AdDisplay placement="sidebar" className="max-w-md mx-auto" />
        </div>
      </div>

      {/* Bottom Banner Ads */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <AdDisplay placement="bottom-banner" className="max-w-4xl mx-auto" />
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-md">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Play className="text-white" size={16} />
              </div>
              <span className="text-xl font-bold text-white">{siteSettings.site_title || 'StreamFlix'}</span>
            </div>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>&copy; 2024 {siteSettings.site_title || 'StreamFlix'}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Popup and Interstitial Ads */}
      {popupAd}
      {interstitialAd}

    </div>
  );
};

export default Index;