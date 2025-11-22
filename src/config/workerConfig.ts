// Worker Configuration
// এই ফাইলটি Worker URL সহজে পরিবর্তন করতে ব্যবহার করুন

export const WORKER_CONFIG = {
  // Mobile users এর জন্য Worker URL
  MOBILE_WORKER_URL: 'https://black-wildflower-1653.savshopbd.workers.dev/',
  
  // Business users এর জন্য Worker URL
  BUSINESS_WORKER_URL: 'https://webzip.savshopbd.workers.dev/',
  
  // Authentication token
  WORKER_AUTH_TOKEN: 'GDI-Auth-8c5e9a4f-7b1d-4f6c-8e3b-9a2d1e5f0b4a',
  
  // GDI Path prefix
  GDI_PATH_PREFIX: '0:/'
} as const;

// Helper function to get worker URL by user type
export const getWorkerUrl = (userType: 'mobile' | 'business'): string => {
  return userType === 'mobile' 
    ? WORKER_CONFIG.MOBILE_WORKER_URL 
    : WORKER_CONFIG.BUSINESS_WORKER_URL;
};
