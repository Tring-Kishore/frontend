import {jwtDecode} from 'jwt-decode';

export const verifyToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    
    if (decoded.exp < currentTime) {
      console.log('Token has expired.');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    return null; 
  }
};