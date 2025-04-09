import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  plugins: [
    react(),
    commonjs()
  ],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: [
        /@react-pdf\/renderer\/.*/,
        'react-pdf',
        '@react-pdf/font',
        '@react-pdf/layout',
        '@react-pdf/pdfkit',
        '@react-pdf/image',
        '@react-pdf/textkit'
      ]
    }
  }
});
