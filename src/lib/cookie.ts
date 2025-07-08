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
  // 🔥 NUCLEAR COOKIE DELETION - THE HARDEST WAY POSSIBLE 🔥
  const domain = window.location.hostname;
  const timestamp = new Date().toISOString();
  
  console.log(`🔥 [${timestamp}] NUCLEAR DELETION of cookie: ${name}`);
  console.log(`🔥 [${timestamp}] Domain: ${domain}`);
  console.log(`🔥 [${timestamp}] Before deletion:`, getCookie(name));
  
  // STRATEGY 1: Basic nuclear deletion (every possible combination)
  const paths = ['/', '', '/dashboard', '/auth', '/admin', '/staff-dashboard', '/supervisor-dashboard'];
  const domains = ['', domain, `.${domain}`, `www.${domain}`];
  const expires = ['Thu, 01 Jan 1970 00:00:00 GMT', 'Thu, 01 Jan 1970 00:00:00 UTC', 'Wed, 31 Dec 1969 23:59:59 GMT'];
  const maxAges = ['0', '-1', '-999999999'];
  const secureFlags = ['', '; Secure'];
  const httpOnlyFlags = ['', '; HttpOnly'];
  const sameSiteFlags = ['', '; SameSite=Lax', '; SameSite=Strict', '; SameSite=None'];
  
  let attemptCount = 0;
  
  // Try every possible combination
  for (const path of paths) {
    for (const dom of domains) {
      for (const expire of expires) {
        for (const maxAge of maxAges) {
          for (const secure of secureFlags) {
            for (const httpOnly of httpOnlyFlags) {
              for (const sameSite of sameSiteFlags) {
                try {
                  let cookieString = `${name}=`;
                  if (path) cookieString += `; Path=${path}`;
                  if (dom) cookieString += `; Domain=${dom}`;
                  cookieString += `; Expires=${expire}`;
                  cookieString += `; Max-Age=${maxAge}`;
                  cookieString += secure;
                  cookieString += httpOnly;
                  cookieString += sameSite;
                  
                  document.cookie = cookieString;
                  attemptCount++;
                } catch (error) {
                  // Ignore errors, keep trying
                }
              }
            }
          }
        }
      }
    }
  }
  
  // STRATEGY 2: Production-specific nuclear deletion
  if (domain.includes('globalpharmatrading.co.uk')) {
    const productionDomains = [
      '',
      'globalpharmatrading.co.uk',
      '.globalpharmatrading.co.uk', 
      'www.globalpharmatrading.co.uk',
      '.www.globalpharmatrading.co.uk'
    ];
    
    for (const prodDomain of productionDomains) {
      for (const path of paths) {
        for (const expire of expires) {
          for (const maxAge of maxAges) {
            try {
              // Every possible secure/httpOnly combination
              const variations = [
                `${name}=; Path=${path}; Domain=${prodDomain}; Expires=${expire}; Max-Age=${maxAge}`,
                `${name}=; Path=${path}; Domain=${prodDomain}; Expires=${expire}; Max-Age=${maxAge}; Secure`,
                `${name}=; Path=${path}; Domain=${prodDomain}; Expires=${expire}; Max-Age=${maxAge}; HttpOnly`,
                `${name}=; Path=${path}; Domain=${prodDomain}; Expires=${expire}; Max-Age=${maxAge}; Secure; HttpOnly`,
                `${name}=; Path=${path}; Domain=${prodDomain}; Expires=${expire}; Max-Age=${maxAge}; SameSite=Lax`,
                `${name}=; Path=${path}; Domain=${prodDomain}; Expires=${expire}; Max-Age=${maxAge}; SameSite=Strict`,
                `${name}=; Path=${path}; Domain=${prodDomain}; Expires=${expire}; Max-Age=${maxAge}; SameSite=None; Secure`,
                `${name}=; Path=${path}; Domain=${prodDomain}; Expires=${expire}; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Lax`,
                `${name}=; Path=${path}; Domain=${prodDomain}; Expires=${expire}; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Strict`,
                `${name}=; Path=${path}; Domain=${prodDomain}; Expires=${expire}; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=None`,
              ];
              
              for (const variation of variations) {
                try {
                  document.cookie = variation;
                  attemptCount++;
                } catch (error) {
                  // Continue trying
                }
              }
            } catch (error) {
              // Continue trying
            }
          }
        }
      }
    }
  }
  
  // STRATEGY 3: Brute force - try to clear any cookie that might have this name
  try {
    // Get all existing cookies and try to delete anything that might match
    const allCookies = document.cookie.split(';');
    for (const cookie of allCookies) {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.includes(name) || name.includes(cookieName)) {
        // Try to delete this cookie with multiple strategies
        for (const path of paths) {
          for (const dom of domains) {
            try {
              document.cookie = `${cookieName}=; Path=${path}; Domain=${dom}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`;
              document.cookie = `${cookieName}=; Path=${path}; Domain=${dom}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Secure`;
              document.cookie = `${cookieName}=; Path=${path}; Domain=${dom}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly`;
              document.cookie = `${cookieName}=; Path=${path}; Domain=${dom}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Secure; HttpOnly`;
              attemptCount += 4;
            } catch (error) {
              // Continue
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn('Error in brute force cookie deletion:', error);
  }
  
  console.log(`🔥 [${timestamp}] NUCLEAR DELETION COMPLETE: Made ${attemptCount} deletion attempts for cookie: ${name}`);
  
  // Wait and verify deletion
  setTimeout(() => {
    const remainingValue = getCookie(name);
    const status = remainingValue ? '❌ STILL EXISTS' : '✅ SUCCESSFULLY DELETED';
    console.log(`🔥 [${timestamp}] Final result for ${name}: ${status}`);
    if (remainingValue) {
      console.error(`🔥 [${timestamp}] COOKIE SURVIVED NUCLEAR DELETION: ${name} = ${remainingValue}`);
      
      // LAST RESORT: Try to overwrite with empty values multiple times
      for (let i = 0; i < 50; i++) {
        try {
          document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Max-Age=0`;
          document.cookie = `${name}=DELETED; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Max-Age=0`;
        } catch (error) {
          // Continue
        }
      }
    }
  }, 200);
}

// NUCLEAR DELETE ALL COOKIES FUNCTION
export function nukeAllCookies() {
  console.log('🔥🔥🔥 NUCLEAR OPTION: DELETING ALL COOKIES 🔥🔥🔥');
  
  const cookieNames = [
    'pharmacy_auth', 'token', 'session', 'auth_token', 'user_session', 
    'remember_token', 'csrf_token', 'user', 'user_id', 'userid', 
    'user_token', 'access_token', 'refresh_token', 'jwt', 'jwt_token',
    'bearer_token', 'api_token', 'login_token', 'auth', 'authentication',
    'pharmacy_session', 'pharmacy_user', 'pharmacy_token', 'global_pharma_auth',
    'globalpharma_auth', 'pharmacy_remember', 'user_preferences'
  ];
  
  // Delete specific known cookies
  for (const cookieName of cookieNames) {
    deleteCookie(cookieName);
  }
  
  // Also try to delete all existing cookies
  try {
    const allCookies = document.cookie.split(';');
    for (const cookie of allCookies) {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName) {
        deleteCookie(cookieName);
      }
    }
  } catch (error) {
    console.error('Error in nuclear cookie deletion:', error);
  }
  
  console.log('🔥🔥🔥 NUCLEAR COOKIE DELETION COMPLETE 🔥🔥🔥');
}
