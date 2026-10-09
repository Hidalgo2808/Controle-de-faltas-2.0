import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.codein.meuprojeto',
  appName: 'Meu Projeto',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;