import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // <--- تأكيد مسار الجذر الرئيسي
  build: {
    outDir: 'dist',
    sourcemap: true, // <--- باش يخلينا نشوفو أي خطأ في الكونسول إذا وقع
  },
})