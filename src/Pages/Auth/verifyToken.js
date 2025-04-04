import {jwtDecode} from 'jwt-decode';

export const verifyToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds

    // Check if the token is expired
    if (decoded.exp < currentTime) {
      console.log('Token has expired.');
      return null; // Token is expired
    }

    return decoded; // Token is valid
  } catch (error) {
    console.error('Invalid token:', error);
    return null; // Token is invalid
  }
};