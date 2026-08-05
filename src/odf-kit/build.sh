mkdir odf-kit
cd odf-kit

npm init -y
npm install odf-kit
echo 'export { odtToHtml } from "odf-kit/reader";' > entry.js
npx esbuild entry.js --bundle --format=esm --outfile=reader.js

echo 'export { htmlToOdt } from "odf-kit/odt";' > entry.js
npx esbuild entry.js --bundle --format=esm --outfile=odt.js

