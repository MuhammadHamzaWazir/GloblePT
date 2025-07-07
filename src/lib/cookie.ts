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
  // Multiple deletion methods for better compatibility
  const domain = window.location.hostname;
  
  // Method 1: Basic deletion
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  
  // Method 2: Delete with domain
  if (domain.includes('globalpharmatrading.co.uk')) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.globalpharmatrading.co.uk;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=globalpharmatrading.co.uk;`;
  }
  
  // Method 3: Delete without domain
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=;`;
  
  // Method 4: Max-age approach
  document.cookie = `${name}=; max-age=0; path=/;`;
  
  console.log(`Attempted to delete cookie: ${name}`);
}
