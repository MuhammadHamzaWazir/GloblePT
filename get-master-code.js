const crypto = require('crypto');

// Emergency master code generator (matches the one in verify-code)
const generateMasterCode = () => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const hash = crypto.createHash('md5').update(`global-pharma-${today}`).digest('hex');
  return hash.slice(0, 6).toUpperCase();
};

console.log('🔐 Current Master Code for Today:', generateMasterCode());
console.log('📅 Date:', new Date().toISOString().slice(0, 10));
console.log('');
console.log('ℹ️  You can use this master code if email delivery is not working.');
console.log('⚠️  This is for emergency access only!');
