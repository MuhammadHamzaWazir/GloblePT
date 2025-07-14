const fs = require('fs');
const path = require('path');

// Final batch of files that need JWT migration
const filesToFix = [
  'src/app/api/admin/users/[id]/route.ts',
  'src/app/api/admin/complaints/route.ts',
  'src/app/api/admin/prescriptions/route.ts',
  'src/app/api/admin/prescriptions/[id]/route.ts',
  'src/app/api/admin/prescriptions/[id]/create-payment/route.ts'
];

function fixFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  File not found, skipping: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Replace requireAuth import (various formats)
    if (content.includes('import { requireAuth }')) {
      // Different import patterns
      content = content.replace(/import { requireAuth[^}]*} from "@\/lib\/auth";/, 'import { verifyToken } from "@/lib/auth";');
      content = content.replace(/import { requireAuth[^}]*} from '@\/lib\/auth';/, 'import { verifyToken } from "@/lib/auth";');
      content = content.replace(/import { requireAuth[^}]*} from '\.\.\/\.\.\/\.\.\/\.\.\/lib\/auth';/, 'import { verifyToken } from "@/lib/auth";');
      modified = true;
      console.log(`🔄 Fixed requireAuth import in: ${filePath}`);
    }

    // Replace requireAuth usage patterns - more comprehensive
    let requireAuthMatches = content.match(/const\s+(\w+)\s*=\s*await\s+requireAuth\((\w+)\);/g);
    if (requireAuthMatches) {
      for (let match of requireAuthMatches) {
        const [fullMatch, userVar, reqVar] = match.match(/const\s+(\w+)\s*=\s*await\s+requireAuth\((\w+)\);/);
        const replacement = `// Get authorization header
    const authHeader = ${reqVar}.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const ${userVar} = verifyToken(token);
    
    if (!${userVar}) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }`;
        
        content = content.replace(fullMatch, replacement);
        modified = true;
      }
      console.log(`🔄 Fixed requireAuth usage in: ${filePath}`);
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Successfully updated: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed in: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🚀 Starting final JWT migration...\n');

let fixedCount = 0;
for (const file of filesToFix) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n🎉 Final migration complete! Fixed ${fixedCount} files`);
