import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';

// Plugin to copy translation files to dist folder
const copyTranslationsPlugin = () => {
  return {
    name: 'copy-translations',
    writeBundle() {
      const translationsDir = path.resolve(__dirname, 'translations');
      const distTranslationsDir = path.resolve(__dirname, 'dist', 'translations');
      
      // Create translations directory in dist
      if (!existsSync(distTranslationsDir)) {
        mkdirSync(distTranslationsDir, { recursive: true });
      }
      
      // Copy all JSON files from translations to dist/translations
      if (existsSync(translationsDir)) {
        const files = readdirSync(translationsDir);
        files.forEach(file => {
          if (file.endsWith('.json')) {
            const src = path.join(translationsDir, file);
            const dest = path.join(distTranslationsDir, file);
            copyFileSync(src, dest);
            console.log(`Copied translation file: ${file}`);
          }
        });
      }
    }
  };
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        copyTranslationsPlugin()
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      publicDir: 'public', // Use public directory if exists, or create it
      build: {
        // Ensure translations are included in build
        assetsInclude: ['**/*.json']
      }
    };
});
