const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const vendor = path.join(root, 'vendor');
fs.mkdirSync(vendor, { recursive: true });

const assets = [
  [path.join(root, 'node_modules/docx/build/index.js'), path.join(vendor, 'docx.min.js')],
  [path.join(root, 'node_modules/file-saver/dist/FileSaver.min.js'), path.join(vendor, 'FileSaver.min.js')]
];

for (const [source, destination] of assets) {
  if (!fs.existsSync(source)) {
    throw new Error(`Required browser library missing: ${source}`);
  }
  fs.copyFileSync(source, destination);
  console.log(`Prepared ${path.relative(root, destination)}`);
}
