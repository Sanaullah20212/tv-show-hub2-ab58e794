// Worker Configuration
// এই ফাইলটি Worker URL সহজে পরিবর্তন করতে ব্যবহার করুন

import { supabase } from '@/integrations/supabase/client';

export const WORKER_CONFIG = {
  // Mobile users এর জন্য Worker URL
  MOBILE_WORKER_URL: 'https://mobi.btspro24.xyz/',
  
  // Business users এর জন্য Worker URL
  BUSINESS_WORKER_URL: 'https://web.btspro24.xyz/',
  
  // Authentication token
  WORKER_AUTH_TOKEN: 'GDI-Auth-8c5e9a4f-7b1d-4f6c-8e3b-9a2d1e5f0b4a',
  
  // GDI Path prefix
  GDI_PATH_PREFIX: '0:/',
  
  // Custom domain (if configured)
  CUSTOM_DOMAIN: ''
} as const;

// Cache for worker config from database
let cachedWorkerConfig: {
  mobile_worker_url: string;
  business_worker_url: string;
  custom_domain: string;
} | null = null;

// Load worker config from database
export const loadWorkerConfig = async () => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'worker_config')
      .single();
    
    if (!error && data) {
      const config = data.value as {
        mobile_worker_url: string;
        business_worker_url: string;
        custom_domain: string;
      };
      cachedWorkerConfig = config;
      return config;
    }
  } catch (error) {
    console.error('Error loading worker config:', error);
  }
  return null;
};

// Helper function to get worker URL by user type
export const getWorkerUrl = async (userType: 'mobile' | 'business'): Promise<string> => {
  // Try to load from cache or database
  if (!cachedWorkerConfig) {
    await loadWorkerConfig();
  }
  
  // If custom domain is configured, use it
  if (cachedWorkerConfig?.custom_domain) {
    return `https://${cachedWorkerConfig.custom_domain}/`;
  }
  
  // Otherwise use the configured worker URLs
  if (cachedWorkerConfig) {
    return userType === 'mobile' 
      ? cachedWorkerConfig.mobile_worker_url 
      : cachedWorkerConfig.business_worker_url;
  }
  
  // Fallback to hardcoded values
  return userType === 'mobile' 
    ? WORKER_CONFIG.MOBILE_WORKER_URL 
    : WORKER_CONFIG.BUSINESS_WORKER_URL;
};
