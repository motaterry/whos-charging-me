import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite: a ferramenta que junta os arquivos React num site pronto (pasta dist).
export default defineConfig({
  plugins: [react()],
});
