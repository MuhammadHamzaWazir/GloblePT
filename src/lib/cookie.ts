// Simple cookie helpers for client-side auth
export function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

export function getCookie(name: string): string | null {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, null as string | null);
}

export function deleteCookie(name: string) {
  // Comprehensive cookie deletion with maximum compatibility
  const domain = window.location.hostname;
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] Starting deletion of cookie: ${name}`);
  console.log(`[${timestamp}] Current domain: ${domain}`);
  console.log(`[${timestamp}] Current cookie value before deletion:`, getCookie(name));
  
  // Strategy 1: Basic deletion (no domain, no path)
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  
  // Strategy 2: Basic deletion with max-age
  document.cookie = `${name}=; max-age=0; path=/;`;
  
  // Strategy 3: Production domain specific deletions
  if (domain.includes('globalpharmatrading.co.uk')) {
    // With subdomain wildcard
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.globalpharmatrading.co.uk;`;
    document.cookie = `${name}=; max-age=0; path=/; domain=.globalpharmatrading.co.uk;`;
    
    // With exact domain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=globalpharmatrading.co.uk;`;
    document.cookie = `${name}=; max-age=0; path=/; domain=globalpharmatrading.co.uk;`;
    
    // Without domain (browser default)
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    document.cookie = `${name}=; max-age=0; path=/;`;
  }
  
  // Strategy 4: Root path variations
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  document.cookie = `${name}=; max-age=0; path=/;`;
  document.cookie = `${name}=; max-age=0;`;
  
  // Strategy 5: Secure flag variations (for HTTPS)
  if (window.location.protocol === 'https:') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure;`;
    document.cookie = `${name}=; max-age=0; path=/; secure;`;
    
    if (domain.includes('globalpharmatrading.co.uk')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.globalpharmatrading.co.uk; secure;`;
      document.cookie = `${name}=; max-age=0; path=/; domain=.globalpharmatrading.co.uk; secure;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=globalpharmatrading.co.uk; secure;`;
      document.cookie = `${name}=; max-age=0; path=/; domain=globalpharmatrading.co.uk; secure;`;
    }
  }
  
  // Wait a moment and check if deletion was successful
  setTimeout(() => {
    const remainingValue = getCookie(name);
    console.log(`[${timestamp}] Cookie deletion result for ${name}:`, remainingValue ? 'FAILED - Still exists' : 'SUCCESS - Deleted');
    if (remainingValue) {
      console.warn(`[${timestamp}] Cookie ${name} still exists with value:`, remainingValue);
    }
  }, 100);
}
