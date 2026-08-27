const fs = require('fs');
const path = require('path');

function searchFiles(dir, matchStr, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (file === 'node_modules' || file === '.next' || file === '.git') return;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      searchFiles(filePath, matchStr, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(matchStr)) {
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes(matchStr)) {
            fileList.push({ file: filePath, line: idx + 1, code: line.trim() });
          }
        });
      }
    }
  });
  return fileList;
}

console.log('=== SEARCHING ALL LOCALSTORAGE USAGES IN CODEBASE ===\n');
const results = searchFiles(process.cwd(), 'localStorage');
results.forEach((r) => console.log(`${r.file}:${r.line} -> ${r.code}`));
console.log(`\nTotal occurrences: ${results.length}`);
