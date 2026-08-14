mkdir odf-kit
cd odf-kit

npm init -y
npm install odf-kit
echo 'export { odtToHtml } from "odf-kit/reader";' > entry.js
npx esbuild entry.js --bundle --format=esm --outfile=reader.js

echo 'export { htmlToOdt } from "odf-kit/odt";' > entry.js
npx esbuild entry.js --bundle --format=esm --outfile=odt.js

mv ./odt.js ../odt.js
mv ./reader.js ../reader.js
cd ..

rm INFORMATION

touch INFORMATION

echo "https://github.com/GitHubNewbie0/odf-kit
https://www.npmjs.com/package/odf-kit" > INFORMATION

grep -oP '"odf-kit":\s*"\^\K[^"]+' odf-kit/package.json >> INFORMATION

rm -r odf-kit