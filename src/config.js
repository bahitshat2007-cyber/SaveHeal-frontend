// В dev — Vite proxy, в prod — Railway URL
const isDev = import.meta.env.DEV;

export const API_URL = isDev ? '' : 'https://saveheal-backend-production.up.railway.app';
export const SOCKET_URL = isDev ? 'http://localhost:5000' : 'https://saveheal-backend-production.up.railway.app';
