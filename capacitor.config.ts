import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.46e5412090f14676bb5576d45e0f18e7',
  appName: 'tv-show-hub',
  webDir: 'dist',
  server: {
    url: 'https://46e54120-90f1-4676-bb55-76d45e0f18e7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
