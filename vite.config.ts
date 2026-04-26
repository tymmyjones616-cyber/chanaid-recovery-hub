import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig(({ mode }) => ({
  plugins: [
    tanstackStart(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ].filter(Boolean),
  define: {
    "process.env.SUPABASE_URL": JSON.stringify("https://taprwweemxfbrrkwajnc.supabase.co"),
    "process.env.SUPABASE_PUBLISHABLE_KEY": JSON.stringify("sb_publishable_DkGPo8pQd8OYfVxg9MMifQ_dx4y523q"),
    "process.env.SUPABASE_SERVICE_ROLE_KEY": JSON.stringify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhcHJ3d2VlbXhmYnJya3dham5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA2NzMyNCwiZXhwIjoyMDkyNjQzMzI0fQ.qo9CPDxFb9Ht5BP-x3imn-_jb0aoXV-yue_Do8l3WcU"),
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://taprwweemxfbrrkwajnc.supabase.co"),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify("sb_publishable_DkGPo8pQd8OYfVxg9MMifQ_dx4y523q"),
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
}));
