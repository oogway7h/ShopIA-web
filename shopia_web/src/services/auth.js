export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
}

export function getUser() {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function removeUser() {
  localStorage.removeItem('user');
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}