import axios from 'axios';

/**
 * Instancia de Axios pública — sin Bearer Token, sin interceptores de auth.
 * Usada exclusivamente por la landing page pública para no requerir autenticación.
 */
const apiPublic = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default apiPublic;
