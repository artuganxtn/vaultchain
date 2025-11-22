import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vaultchain.app',
  appName: 'VaultChain',
  webDir: 'dist',
  server: {
    // For development - uncomment to test with local server
    // url: 'http://localhost:3000',
    // cleartext: true
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK' // Use 'AAB' for Play Store
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#10b981",
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#10b981'
    }
  }
};

export default config;

