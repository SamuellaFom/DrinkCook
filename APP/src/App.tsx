import { AppRoutes } from "./routes";
import { AuthProvider, useAuth } from "./contexts/authContext";
import { BrowserRouter as Router } from "react-router-dom";
import { setupAuthInterceptor } from "./api/tools/authInterceptor";
import "./App.css";
import { useEffect } from "react";

function AppWithInterceptor() {
  const { logout } = useAuth();
  const basePath = `/${process.env.REACT_APP_PREFIXE}`;

  useEffect(() => {
    setupAuthInterceptor(logout);
  }, [logout]);

  return (
    <Router basename={basePath}>
      <div className="App">
        <main>
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
        <AppWithInterceptor />
    </AuthProvider>
  );
}
export default App;