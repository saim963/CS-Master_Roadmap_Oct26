import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/CS-Master_Roadmap_Oct26/',
  plugins: [
    tailwindcss(),
    react(),
  ],
});
