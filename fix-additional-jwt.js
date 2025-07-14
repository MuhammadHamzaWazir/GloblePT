const fs = require('fs');
const path = require('path');

// Additional files that need JWT migration
const filesToFix = [
  'src/app/api/prescriptions/upload/route.ts',
  'src/app/api/prescriptions/user/route.ts',
  'src/app/api/prescriptions/submit/route.ts',
  'src/app/api/prescriptions/[id]/pricing/route.ts',
  'src/app/api/prescriptions/[id]/payment/route.ts',
  'src/app/api/prescriptions/route.ts',
  'src/app/api/auth/two-factor/route.ts',
  'src/app/api/admin/roles/route.ts',
  'src/app/api/admin/staff/route.ts',
  'src/app/api/admin/orders/route.ts',
  'src/app/api/admin/users/route.ts'
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

    // Replace old jwt import
    if (content.includes("import jwt from 'jsonwebtoken';")) {
      content = content.replace("import jwt from 'jsonwebtoken';", "import { verifyToken } from '@/lib/auth';");
      modified = true;
      console.log(`🔄 Fixed jwt import in: ${filePath}`);
    }

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

    // Fix jwt.verify patterns with different variations
    if (content.includes('jwt.verify')) {
      // Replace jwt.verify calls
      content = content.replace(/jwt\.verify\([^,]+,\s*process\.env\.JWT_SECRET[^)]*\)/g, 'verifyToken(token)');
      
      // Also handle jwt.verify with try-catch patterns
      content = content.replace(/const\s+(\w+)\s*=\s*jwt\.verify\([^,]+,\s*process\.env\.JWT_SECRET[^)]*\)\s*as\s*any;/g, 
        'const $1 = verifyToken(token);');
      
      modified = true;
      console.log(`🔄 Fixed jwt.verify usage in: ${filePath}`);
    }

    // Fix token extraction patterns for jwt files
    if (content.includes('req.headers.get(\'authorization\')?.replace(\'Bearer \', \'\')')) {
      content = content.replace(/const\s+token\s*=\s*req\.headers\.get\('authorization'\)\?\.replace\('Bearer\s+',\s+''\);/, 
        `const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.substring(7);`);
      modified = true;
      console.log(`🔄 Fixed token extraction in: ${filePath}`);
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

console.log('🚀 Starting JWT migration for additional files...\n');

let fixedCount = 0;
for (const file of filesToFix) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n🎉 Migration complete! Fixed ${fixedCount} additional files`);
