const fs = require('fs');
const path = require('path');

// List of files that need JWT fixes based on our grep results
const filesToFix = [
  'src/app/api/prescriptions/upload/route.ts',
  'src/app/api/prescriptions/user/route.ts', 
  'src/app/api/prescriptions/submit/route.ts',
  'src/app/api/uploads/[filename]/route.ts',
  'src/app/api/messages/conversations/route.ts',
  'src/app/api/messages/conversations/[id]/route.ts',
  'src/app/api/staff/complaints/route.ts',
  'src/app/api/user/profile/route.ts',
  'src/app/api/staff/complaints/[id]/route.ts',
  'src/app/api/uploads/complaints/[filename]/route.ts',
  'src/app/api/prescriptions/debug/route.ts',
  'src/app/api/prescriptions/[id]/status/route.ts',
  'src/app/api/complaints/route.ts',
  'src/app/api/admin/complaints/[id]/route.ts'
];

function fixJWTInFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Replace JWT import
    if (content.includes("import jwt from 'jsonwebtoken'")) {
      content = content.replace("import jwt from 'jsonwebtoken';", "import { verifyToken } from '@/lib/auth';");
      modified = true;
      console.log(`🔄 Fixed JWT import in: ${filePath}`);
    }
    
    // Replace JWT verification patterns
    const jwtVerifyPatterns = [
      /const decoded = jwt\.verify\(token, process\.env\.JWT_SECRET!\) as any;/g,
      /const decoded = jwt\.verify\(token, process\.env\.JWT_SECRET\) as any;/g,
      /jwt\.verify\(token, process\.env\.JWT_SECRET!\)/g,
      /jwt\.verify\(token, process\.env\.JWT_SECRET\)/g
    ];
    
    jwtVerifyPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, `const decoded = verifyToken(token);
        
        if (!decoded) {
          return NextResponse.json({ 
            success: false, 
            message: 'Invalid authentication token' 
          }, { status: 401 });
        }`);
        modified = true;
        console.log(`🔄 Fixed JWT verification in: ${filePath}`);
      }
    });
    
    // Fix common userId patterns
    if (content.includes('decoded.userId || decoded.id')) {
      content = content.replace(/parseInt\(decoded\.userId \|\| decoded\.id\)/g, 'parseInt(decoded.id)');
      modified = true;
      console.log(`🔄 Fixed userId pattern in: ${filePath}`);
    }
    
    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Successfully updated: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️ No changes needed in: ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🚀 Starting JWT migration script...\n');

let totalFixed = 0;
filesToFix.forEach(file => {
  if (fixJWTInFile(file)) {
    totalFixed++;
  }
  console.log(''); // Empty line for readability
});

console.log(`\n🎉 Migration complete! Fixed ${totalFixed} files.`);
