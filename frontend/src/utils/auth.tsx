const CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export const login = (username: string, password: string): boolean => {
  if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
    localStorage.setItem("isLoggedIn", "true");
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem("isLoggedIn");
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem("isLoggedIn") === "true";
};