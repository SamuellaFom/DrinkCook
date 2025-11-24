import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

import {AuthContextType, DecodedToken} from "../assets/ts/interfaces";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [franchiseId, setFranchiseId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const extractToken = (): string | undefined => {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];
  };

  const decodeToken = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      setUser(decoded.name);
      setRole(decoded.role);
      setId(decoded.userId);
      setFranchiseId(decoded.franchiseId ?? null);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error decoding token:", error);
      logout();
    }
  };

  const checkAuth = () => {
    const token = extractToken();
    if (token) {
      decodeToken(token);
    } else {
      logout();
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = () => {
    const token = extractToken();
    if (token) {
      decodeToken(token);
    } else {
      logout();
    }
    setLoading(false);
  };

  const logout = () => {
    document.cookie = "accessToken=; Max-Age=0; path=/; SameSite=Lax";

    setUser(null);
    setRole(null);
    setId(null);
    setFranchiseId(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  return (
      <AuthContext.Provider
          value={{ user, id, role, franchiseId, isAuthenticated, loading, login, logout }}
      >
        {!loading && children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
