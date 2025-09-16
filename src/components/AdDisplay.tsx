import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Component to handle script-based ads - injects directly into <head>
const ScriptAdRenderer: React.FC<{ html: string; className?: string }> = ({ html, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [scriptsInjected, setScriptsInjected] = useState(false);

  useEffect(() => {
    if (html && !scriptsInjected) {
      try {
        setHasError(false);
        
        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Extract scripts and inject them directly into <head>
        const scripts = tempDiv.querySelectorAll('script');
        const nonScriptContent = tempDiv.innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Inject all scripts directly into <head> section
        scripts.forEach((script) => {
          try {
            const newScript = document.createElement('script');
            
            // Copy all attributes from original script
            Array.from(script.attributes).forEach(attr => {
              newScript.setAttribute(attr.name, attr.value);
            });
            
            // Set content if it's an inline script
            if (script.textContent) {
              newScript.textContent = script.textContent;
            }
            
            // Add to head section
            document.head.appendChild(newScript);
            console.log('Script injected into head:', newScript);
          } catch (error) {
            console.error('Error injecting script into head:', error);
            setHasError(true);
          }
        });
        
        setScriptsInjected(true);
        
        // Add non-script content to container if any
        if (containerRef.current && nonScriptContent.trim()) {
          containerRef.current.innerHTML = nonScriptContent;
        }
        
      } catch (error) {
        console.error('Error processing ad HTML:', error);
        setHasError(true);
      }
    }
  }, [html, scriptsInjected]);

  // Cleanup: remove scripts when component unmounts
  useEffect(() => {
    return () => {
      // Note: We don't remove scripts from head as they might be needed globally
      // This is intentional behavior for ad scripts
    };
  }, []);

  if (hasError) {
    return (
      <div className={`${className} p-4 bg-yellow-50 border border-yellow-200 rounded text-center`}>
        <p className="text-sm text-yellow-800">Ad content failed to load</p>
        <p className="text-xs text-yellow-600 mt-1">Please check your ad code</p>
      </div>
    );
  }

  return <div ref={containerRef} className={className} style={{ minHeight: '100px' }} />;
};

// Component to handle VAST ads
const VastAdPlayer: React.FC<{ vastUrl: string }> = ({ vastUrl }) => {
  return (
    <div className="vast-player bg-black text-white p-4 text-center">
      <p>VAST Ad Player</p>
      <p className="text-sm opacity-75">URL: {vastUrl}</p>
      <div className="mt-2">
        <button className="bg-white text-black px-4 py-2 rounded">
          Play VAST Ad
        </button>
      </div>
    </div>
  );
};

interface Ad {
  id: string;
  name: string;
  type: 'banner' | 'popup' | 'interstitial' | 'vast';
  content: any;
  placement: string;
  priority: number;
}

interface AdDisplayProps {
  placement: string;
  className?: string;
}

const AdDisplay: React.FC<AdDisplayProps> = ({ placement, className = '' }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const loadAds = async () => {
      try {
        console.log('Loading ads for placement:', placement);
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .eq('placement', placement)
          .eq('is_active', true)
          .order('priority', { ascending: false });

        if (error) {
          console.error('Supabase error loading ads:', error);
          throw error;
        }
        
        const validAds = (data || []) as Ad[];
        console.log('Loaded ads for placement', placement, ':', validAds);
        console.log('Number of ads found:', validAds.length);
        
        setAds(validAds);
        if (validAds.length > 0) {
          const ad = validAds[0];
          console.log('Selected ad for display:', ad);
          console.log('Ad type:', ad.type);
          console.log('Ad content:', ad.content);
          console.log('Ad HTML content:', ad.content?.html);
          
          setCurrentAd(ad);
          
          // Show all ads immediately
          console.log('Showing ad immediately');
          setShowPopup(true);
        } else {
          console.log('No ads found for placement:', placement);
        }
      } catch (error) {
        console.error('Error loading ads:', error);
      }
    };

    loadAds();
  }, [placement]);

  if (!currentAd || !showPopup) return null;

  const renderAd = () => {
    switch (currentAd.type) {
      case 'banner':
        return (
          <div className={`ad-banner ${className}`}>
            {currentAd.content.html ? (
              <ScriptAdRenderer 
                html={currentAd.content.html}
                className="w-full"
              />
            ) : currentAd.content.image_url ? (
              <a href={currentAd.content.link_url} target="_blank" rel="noopener noreferrer">
                <img 
                  src={currentAd.content.image_url} 
                  alt={currentAd.content.alt_text || 'Advertisement'}
                  className="w-full h-auto"
                />
              </a>
            ) : (
              <div className="p-4 bg-muted/20 border border-border rounded text-center">
                <p className="text-sm text-muted-foreground">No ads configured for {placement}</p>
              </div>
            )}
          </div>
        );
      
      case 'popup':
        // For popup ads, just inject the scripts into head
        // The ad code itself will handle display and closing
        return (
          <ScriptAdRenderer 
            html={currentAd.content.html || ''}
            className="w-full"
          />
        );
        
      case 'interstitial':
        return (
          <div className="ad-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-lg w-full max-h-[80vh] overflow-auto">
              {currentAd.content.html && currentAd.content.html.trim() ? (
                <ScriptAdRenderer 
                  html={currentAd.content.html}
                  className="w-full"
                />
              ) : (
                <div className="p-8 text-center text-gray-500 bg-white rounded-lg">
                  <p className="text-sm">No ad content available</p>
                  <p className="text-xs mt-2">Please add HTML content for this interstitial ad in admin panel</p>
                  <p className="text-xs mt-1">Ad: {currentAd.name}</p>
                </div>
              )}
              <button 
                onClick={() => setCurrentAd(null)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                title="Close ad"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        );
      
      case 'vast':
        return (
          <div className={`vast-ad ${className}`}>
            {currentAd.content.vast_url ? (
              <VastAdPlayer vastUrl={currentAd.content.vast_url} />
            ) : currentAd.content.html ? (
              <ScriptAdRenderer 
                html={currentAd.content.html}
                className="w-full h-full"
              />
            ) : (
              <div className="p-4 bg-black text-white text-center">
                <p>VAST Ad Player - No content configured</p>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return renderAd();
};

export default AdDisplay;