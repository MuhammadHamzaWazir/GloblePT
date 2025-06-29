#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all .tsx files that need "use client" directive
const patterns = [
  'src/app/**/*.tsx'
];

const hookPatterns = [
  /useState/,
  /useEffect/,
  /useRouter/,
  /useSearchParams/,
  /usePathname/,
  /useParams/,
  /useAuth/,
  /useContext/
];

function needsUseClient(content) {
  return hookPatterns.some(pattern => pattern.test(content));
}

function addUseClient(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (needsUseClient(content) && !content.includes("'use client'")) {
    const newContent = `'use client';\n\n${content}`;
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Added 'use client' to: ${filePath}`);
    return true;
  }
  
  return false;
}

async function main() {
  console.log('🔧 Fixing client component directives...');
  
  let count = 0;
  
  for (const pattern of patterns) {
    const files = glob.sync(pattern);
    
    for (const file of files) {
      if (addUseClient(file)) {
        count++;
      }
    }
  }
  
  console.log(`✅ Fixed ${count} files`);
  
  if (count === 0) {
    console.log('ℹ️  No files needed fixing');
  }
}

// Check if glob is available
try {
  require('glob');
} catch (error) {
  console.log('Installing glob...');
  require('child_process').execSync('npm install glob', { stdio: 'inherit' });
}

main().catch(console.error);
