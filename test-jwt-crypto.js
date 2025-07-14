// Test the native crypto JWT implementation locally
const crypto = require('crypto');

// Copy the JWT functions from our implementation
function base64urlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64urlDecode(str) {
  str += new Array(5 - (str.length % 4)).join('=');
  return Buffer.from(str.replace(/\-/g, '+').replace(/_/g, '/'), 'base64').toString();
}

function createSignature(header, payload, secret) {
  const data = `${header}.${payload}`;
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateToken(user, secret) {
  try {
    console.log('🔧 generateToken called with user:', { id: user.id, email: user.email, role: user.role });
    
    // JWT Header
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    // JWT Payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: now,
      exp: now + (7 * 24 * 60 * 60) // 7 days
    };
    
    console.log('📝 JWT payload prepared:', payload);
    
    // Encode header and payload
    const encodedHeader = base64urlEncode(JSON.stringify(header));
    const encodedPayload = base64urlEncode(JSON.stringify(payload));
    
    // Create signature
    const signature = createSignature(encodedHeader, encodedPayload, secret);
    
    // Combine to create JWT
    const token = `${encodedHeader}.${encodedPayload}.${signature}`;
    console.log('✅ JWT token generated successfully, length:', token?.length || 0);
    
    return token;
  } catch (error) {
    console.error('❌ JWT token generation failed:', error);
    throw new Error(`JWT token generation failed: ${error.message}`);
  }
}

function verifyToken(token, secret) {
  try {
    // Split token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }
    
    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Verify signature
    const expectedSignature = createSignature(encodedHeader, encodedPayload, secret);
    if (signature !== expectedSignature) {
      console.error('Invalid token signature');
      return null;
    }
    
    // Decode payload
    const payload = JSON.parse(base64urlDecode(encodedPayload));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.error('Token expired');
      return null;
    }
    
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role
    };
  } catch (error) {
    console.error('JWT token verification failed:', error);
    return null;
  }
}

// Test the implementation
async function testJWT() {
  console.log('🧪 Testing native crypto JWT implementation...\n');
  
  const secret = '9639abc4e5a74139f39c1d9d48d46ba1'; // Production secret
  
  const testUser = {
    id: "11",
    email: "admin@test.com",
    name: "Test Admin",
    role: "admin"
  };
  
  try {
    // Test token generation
    console.log('1️⃣ Testing token generation...');
    const token = generateToken(testUser, secret);
    console.log('Token preview:', token.substring(0, 50) + '...\n');
    
    // Test token verification
    console.log('2️⃣ Testing token verification...');
    const decoded = verifyToken(token, secret);
    console.log('Decoded user:', decoded);
    
    if (decoded && decoded.email === testUser.email) {
      console.log('✅ JWT implementation working correctly!\n');
    } else {
      console.log('❌ JWT verification failed\n');
    }
    
    // Test with invalid token
    console.log('3️⃣ Testing invalid token...');
    const invalidResult = verifyToken('invalid.token.here', secret);
    console.log('Invalid token result:', invalidResult);
    
    if (invalidResult === null) {
      console.log('✅ Invalid token correctly rejected!\n');
    } else {
      console.log('❌ Invalid token was accepted\n');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testJWT();
