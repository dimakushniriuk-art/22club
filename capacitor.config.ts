import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.club22.app',
  appName: '22Club',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // In produzione, specifica l'URL del server
    // url: 'https://your-production-url.com',
    // Per sviluppo locale, lascia commentato
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
}

export default config
