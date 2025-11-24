import React, { useState } from "react";
import { login } from "../api/auth";
import { useAuth } from "../contexts/authContext";
import { useLocation, useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from =
      (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";
  const { login: authenticate } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const query = await login({ email, password });

      if (query.success) {
        authenticate();
        setSuccess(true);
        setLoading(false);



        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("accessToken="))
            ?.split("=")[1];

        if (token) {
          const decoded = jwtDecode<{ role: string }>(token);
          console.log("role décodé:", decoded.role);
          console.log("login with:", email);

          if (decoded.role === "Administrateur") {
            navigate("/", { replace: true });

          } else {
            navigate("/home-franchise", { replace: true });
          }

        }  else {
          navigate(from, { replace: true });
        }

      } else {
        if (query.status === 400) {
          setError("Email ou mot de passe incorrect.");
        } else if (query.status === 403) {
          setError(
              query.message || "Votre compte est bloqué. Contactez le support."
          );
        } else {
          setError(
              query.message || "Une erreur s'est produite, veuillez réessayer."
          );
        }
        setSuccess(false);
        setLoading(false);
      }
    } catch (err) {
      setError("Erreur serveur, veuillez réessayer plus tard.");
      setSuccess(false);
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Connexion
          </h2>

          {error && (
              <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
          )}

          {success && (
              <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-lg">
                Connexion réussie ✅
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Adresse e-mail
              </label>
              <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="nom@domaine.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
              />
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-lg font-semibold text-white ${
                    loading
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                } transition`}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
  );
}
