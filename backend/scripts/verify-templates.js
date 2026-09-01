const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

const files = walk(path.join(__dirname, '..', 'views')).filter((file) => file.endsWith('.ejs'));
for (const file of files) ejs.compile(fs.readFileSync(file, 'utf8'), { filename: file });
console.log(`Compiled ${files.length} EJS templates.`);
