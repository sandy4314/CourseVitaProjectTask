export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
     
  
  const response = await fetch(`http://localhost:5000/api${url}`, {
    ...options,
    headers,
  });

  const responseText = await response.text();
  
  if (responseText.startsWith('<!DOCTYPE html>')) {
    throw new Error(`Server returned HTML (${response.status} ${response.statusText})`);
  }

  try {
    const data = JSON.parse(responseText);
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  } catch  {
    throw new Error(responseText || 'Invalid JSON response');
  }
};