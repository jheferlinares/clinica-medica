import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno basado en el modo
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    // Definir variables de entorno para el cliente (solo VITE_*)
    define: {
      'process.env': {
        NODE_ENV: JSON.stringify(mode)
      }
    },
    // Configuración de build para producción
    build: {
      outDir: 'dist',
      sourcemap: mode === 'production' ? false : true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production'
        }
      }
    },
    // Configuración del servidor de desarrollo
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  }
})
