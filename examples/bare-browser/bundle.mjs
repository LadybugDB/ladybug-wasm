import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const LBUG_DIST = path.dirname(require.resolve('@lbug/lbug-wasm'));

function printErr(err) {
    if (err) return console.log(err);
}
fs.cp(path.resolve(LBUG_DIST), './dist', { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    }
  });