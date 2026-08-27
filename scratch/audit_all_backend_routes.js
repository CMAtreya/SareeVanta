const fs = require('fs');
const path = require('path');

console.log('=== DEEP SYSTEM AUDIT: SCANNING FOR HARDCODED MOCK DATA & MISSING SUPABASE QUERIES ===\n');

const appDir = path.join(process.cwd(), 'app');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const allFiles = getAllFiles(appDir);
const suspiciousFiles = [];

allFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);

  const hasMockArray = /(const INITIAL_|const MOCK_)\w+\s*:\s*[^;=]*=\s*\[\s*\{/i.test(content);
  const returnsMock = /mockProduct|mockReview|mockData|mockOrders/i.test(content);
  const lacksSupabaseQuery = filePath.includes('api') && !content.includes('supabase') && !content.includes('createClient');

  if (hasMockArray || returnsMock || lacksSupabaseQuery) {
    suspiciousFiles.push({
      path: relativePath,
      hasMockArray,
      returnsMock,
      lacksSupabaseQuery,
    });
  }
});

console.log(`Found ${suspiciousFiles.length} files requiring audit/cleaning:\n`);
suspiciousFiles.forEach((file, idx) => {
  console.log(`${idx + 1}. [${file.path}]`);
  if (file.hasMockArray) console.log('   - Contains hardcoded MOCK array declarations');
  if (file.returnsMock) console.log('   - Returns fallback MOCK objects in response');
  if (file.lacksSupabaseQuery) console.log('   - API route does NOT query Supabase database!');
});

console.log('\n=== AUDIT COMPLETE ===');
