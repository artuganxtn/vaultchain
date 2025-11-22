import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      base: './', // Important for mobile apps - use relative paths
      server: {
        port: 3000,
        host: '0.0.0.0',
        // No proxy needed - frontend uses relative /api URLs
        // Backend should be accessible at the same domain
      },
      plugins: [
        react(),
        // Note: Compression can be handled by server (nginx/apache) or CDN
        // For build-time compression, install: npm install --save-dev vite-plugin-compression
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      envPrefix: 'VITE_',
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Production optimizations
        target: 'es2015',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.logs in production
            drop_debugger: true,
          },
        },
        rollupOptions: {
          output: {
            // Code splitting for better caching
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'charts': ['recharts'],
              'icons': ['react-icons'],
            },
            // Optimize chunk file names
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          },
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Source maps for production debugging (optional, can be disabled)
        sourcemap: false,
        // CSS code splitting
        cssCodeSplit: true,
        // Optimize asset inlining threshold
        assetsInlineLimit: 4096,
      },
      // Optimize dependencies
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-icons'],
        exclude: ['@google/generative-ai'],
      },
    };
});
