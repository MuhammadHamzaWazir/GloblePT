// Debug helper to check authentication state
console.log('=== Authentication Debug Helper ===');

// Check if we're in browser environment
if (typeof window !== 'undefined') {
  console.log('Current URL:', window.location.href);
  console.log('All cookies:', document.cookie);
  
  // Check for pharmacy_auth cookie specifically
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('pharmacy_auth='));
  console.log('Auth cookie found:', !!authCookie);
  
  if (authCookie) {
    console.log('Auth cookie value:', authCookie.split('=')[1].substring(0, 50) + '...');
  }
  
  // Test auth/me endpoint from browser
  fetch('/api/auth/me', { credentials: 'include' })
    .then(response => {
      console.log('Auth/me status from browser:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Auth/me response from browser:', data);
    })
    .catch(error => {
      console.error('Auth/me error from browser:', error);
    });
}
