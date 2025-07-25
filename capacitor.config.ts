import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alwasiloon.fertilizer',
  appName: 'Al-Wasiloon Fertilizer',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    App: {
      launchShowDuration: 3000
    },
    SplashScreen: {
      launchAutoHide: false,
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#16a34a'
    }
  }
};

export default config;