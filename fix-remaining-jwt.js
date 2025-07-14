const fs = require('fs');
const path = require('path');

// Files that need JWT migration
const filesToFix = [
  'src/app/api/admin/pending-users/route.ts',
  'src/app/api/prescriptions/upload/route.ts',
  'src/app/api/prescriptions/user/route.ts',
  'src/app/api/prescriptions/submit/route.ts',
  'src/app/api/user/gp-details/route.ts',
  'src/app/api/orders/user/route.ts',
  'src/app/api/uploads/prescriptions/[filename]/route.ts',
  'src/app/api/supervisor/prescriptions/route.ts',
  'src/app/api/staff/prescriptions/[id]/route.ts',
  'src/app/api/staff/prescriptions/new-route.ts',
  'src/app/api/staff/prescriptions/route.ts',
  'src/app/api/orders/route.ts',
  'src/app/api/prescriptions/[id]/approve/route.ts'
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

    // Replace requireAuth import
    if (content.includes('import { requireAuth }')) {
      content = content.replace(/import { requireAuth[^}]*} from "@\/lib\/auth";/, 'import { verifyToken } from "@/lib/auth";');
      modified = true;
      console.log(`🔄 Fixed requireAuth import in: ${filePath}`);
    }

    // Replace requireAuth usage patterns
    const requireAuthPattern = /const (\w+) = await requireAuth\((\w+)\);\s*if \(!\1\) \{\s*return NextResponse\.json\(\{ message: ["']Unauthorized["'] \}, \{ status: 401 \}\);\s*\}/g;
    
    if (requireAuthPattern.test(content)) {
      content = content.replace(requireAuthPattern, (match, userVar, reqVar) => {
        return `// Get authorization header
    const authHeader = ${reqVar}.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const ${userVar} = verifyToken(token);
    
    if (!${userVar}) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }`;
      });
      modified = true;
      console.log(`🔄 Fixed requireAuth usage in: ${filePath}`);
    }

    // Alternative requireAuth pattern (simpler)
    const simpleRequireAuthPattern = /const (\w+) = await requireAuth\((\w+)\);/g;
    if (simpleRequireAuthPattern.test(content)) {
      content = content.replace(simpleRequireAuthPattern, (match, userVar, reqVar) => {
        return `// Get authorization header
    const authHeader = ${reqVar}.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const ${userVar} = verifyToken(token);
    
    if (!${userVar}) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }`;
      });
      modified = true;
      console.log(`🔄 Fixed simple requireAuth usage in: ${filePath}`);
    }

    // Fix jwt.verify patterns
    const jwtVerifyPattern = /jwt\.verify\([^,]+,\s*process\.env\.JWT_SECRET[^)]*\)/g;
    if (jwtVerifyPattern.test(content)) {
      content = content.replace(jwtVerifyPattern, 'verifyToken(token)');
      modified = true;
      console.log(`🔄 Fixed jwt.verify usage in: ${filePath}`);
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

console.log('🚀 Starting JWT migration for remaining files...\n');

let fixedCount = 0;
for (const file of filesToFix) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n🎉 Migration complete! Fixed ${fixedCount} files`);
