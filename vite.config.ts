import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/pangram': {
        target: 'https://text.api.pangram.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/pangram/, '/v3'),
      },
      '/api/plagiarism': {
        target: 'https://plagiarism.api.pangram.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/plagiarism/, ''),
      },
    },
  },
})
