// Script to identify all files that need JWT verification updates
const fs = require('fs');
const path = require('path');

function findJWTFiles(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .git directories
      if (!file.startsWith('.') && file !== 'node_modules') {
        findJWTFiles(filePath, results);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('jwt.verify') || content.includes('import jwt from')) {
          results.push({
            file: filePath,
            hasJwtVerify: content.includes('jwt.verify'),
            hasJwtImport: content.includes('import jwt from'),
            content: content
          });
        }
      } catch (error) {
        // Skip files we can't read
      }
    }
  }
  
  return results;
}

console.log('🔍 Scanning for JWT usage...');
const jwtFiles = findJWTFiles('./src');

console.log(`\n📊 Found ${jwtFiles.length} files using JWT:\n`);

jwtFiles.forEach((fileInfo, index) => {
  console.log(`${index + 1}. ${fileInfo.file}`);
  console.log(`   - Uses jwt.verify: ${fileInfo.hasJwtVerify}`);
  console.log(`   - Has jwt import: ${fileInfo.hasJwtImport}`);
  console.log('');
});

console.log('🔧 These files need to be updated to use our native crypto JWT implementation.');
