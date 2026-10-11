import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative paths so the build works from any folder or sub-path.
  base: './',
  plugins: [react()],
  // The Windows app folder is redirected; following the real path breaks module loading.
  resolve: { preserveSymlinks: true },
});
