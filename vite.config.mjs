import vttforge from '@vttforge/vite-plugin';
import { defineConfig } from 'vite';

// Bundles scripts/main.mjs into dist/main.mjs, copies system.json, lang/,
// templates/, css/ and packs/, and syncs the version. dist/ is what ships.
export default defineConfig({
  plugins: [vttforge({ id: 'cairn' })],
});
