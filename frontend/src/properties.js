export const API_URL = process.env.NODE_ENV === 'production' ? `${window.location.origin}/post-it` : 'http://localhost:8080';
export const SOCKET_URL = process.env.NODE_ENV === 'production' ? `${window.location.origin}` : 'http://localhost:8080';
export const SOCKET_PATH = process.env.NODE_ENV === 'production' ? '/post-it/socket.io' : '/socket.io';
