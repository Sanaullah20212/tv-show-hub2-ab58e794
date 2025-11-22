import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise: Promise<any> | null = null;
let cachedFingerprint: string | null = null;

// Generate a more unique fingerprint by combining multiple factors
const generateEnhancedFingerprint = async (): Promise<string> => {
  try {
    // Initialize FingerprintJS
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }

    const fp = await fpPromise;
    const result = await fp.get();
    
    // Get additional browser-specific information
    const additionalData = {
      // Browser & Platform info
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages?.join(',') || '',
      
      // Screen info
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      
      // Timezone
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      
      // Hardware
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory || 0,
      
      // Additional entropy
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'unknown',
    };
    
    // Combine FingerprintJS visitorId with additional data
    const combinedString = result.visitorId + JSON.stringify(additionalData);
    
    // Generate SHA-256 hash for better uniqueness
    const encoder = new TextEncoder();
    const data = encoder.encode(combinedString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    console.log('Enhanced device fingerprint generated:', hashHex);
    console.log('Fingerprint components:', {
      fpVisitorId: result.visitorId,
      platform: additionalData.platform,
      screen: additionalData.screenResolution,
      timezone: additionalData.timezone
    });
    
    return hashHex;
  } catch (error) {
    console.error('Error in FingerprintJS, using fallback:', error);
    
    // Enhanced fallback fingerprint
    const fallbackData = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: new Date().getTimezoneOffset(),
      timestamp: Date.now(), // Add timestamp for uniqueness in fallback
      random: Math.random().toString(36).substring(7) // Additional randomness
    };
    
    const fallbackString = JSON.stringify(fallbackData);
    const encoder = new TextEncoder();
    const data = encoder.encode(fallbackString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    console.warn('Using fallback fingerprint:', hashHex);
    return hashHex;
  }
};

export const getDeviceFingerprint = async (): Promise<string> => {
  // Return cached fingerprint if available
  if (cachedFingerprint) {
    console.log('Using cached fingerprint:', cachedFingerprint);
    return cachedFingerprint;
  }

  try {
    // Generate enhanced fingerprint
    cachedFingerprint = await generateEnhancedFingerprint();
    
    // Store in sessionStorage for current session persistence
    try {
      sessionStorage.setItem('device_fingerprint', cachedFingerprint);
    } catch (e) {
      console.warn('Could not store fingerprint in sessionStorage:', e);
    }
    
    return cachedFingerprint;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    
    // Last resort fallback
    const lastResortFallback = btoa(
      navigator.userAgent + 
      screen.width + 
      screen.height + 
      Date.now()
    ).substring(0, 32);
    
    cachedFingerprint = lastResortFallback;
    return lastResortFallback;
  }
};

// Function to get device name for display
export const getDeviceInfo = (): string => {
  const ua = navigator.userAgent;
  
  // Detect device type
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'Mobile';
  }
  
  // Desktop - try to detect OS
  if (ua.includes('Win')) return 'Windows PC';
  if (ua.includes('Mac')) return 'Mac';
  if (ua.includes('Linux')) return 'Linux PC';
  if (ua.includes('X11')) return 'Unix PC';
  
  return 'Desktop';
};

// Alias for backward compatibility
export const getDeviceName = getDeviceInfo;
