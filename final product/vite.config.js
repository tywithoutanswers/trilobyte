import { defineConfig } from 'vite';
import { resolve } from 'path';
export default defineConfig({
  plugins: [],
  base: '/',
  publicDir: 'public',
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: true,
    fs: {
      strict: false
    },
    historyApiFallback: true 
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        game: './public/pages/game.html'
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});


