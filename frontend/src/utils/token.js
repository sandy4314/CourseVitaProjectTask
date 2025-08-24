// utils/token.js - Token validation helper
export const validateToken = (token) => {
  if (!token) return { isValid: false, reason: 'No token provided' };
  
  try {
    // Check if token is a string
    if (typeof token !== 'string') {
      return { isValid: false, reason: 'Token is not a string' };
    }
    
    // Clean the token
    token = token.replace(/^"(.*)"$/, '$1').trim();
    
    // Check if token has JWT structure (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, reason: 'Invalid token format' };
    }
    
    // Try to parse the payload (middle part)
    try {
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return { isValid: false, reason: 'Token expired' };
      }
      
      return { isValid: true, payload };
    } catch (parseError) {
      return { isValid: false, reason: 'Invalid token payload' };
    }
  } catch (error) {
    return { isValid: false, reason: 'Token validation error' };
  }
};

export const refreshTokenIfNeeded = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const validation = validateToken(token);
  
  if (!validation.isValid && validation.reason === 'Token expired') {
    try {
      // Attempt to refresh the token
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data.token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, clear the invalid token
      localStorage.removeItem('token');
      return null;
    }
  }
  
  return token;
};