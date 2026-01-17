import { createContext, useState } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null
  });

  // Log initial auth state
  console.log("Initial Auth State:", auth);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setAuth({ token, user });

    // Log after login
    console.log("Login Called - Token:", localStorage.getItem("token"));
    console.log("Login Called - User:", localStorage.getItem("user"));
    console.log("Auth State after login:", { token, user });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuth({ token: null, user: null });

    // Log after logout
    console.log("Logout Called - Token:", localStorage.getItem("token"));
    console.log("Logout Called - User:", localStorage.getItem("user"));
    console.log("Auth State after logout:", { token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
