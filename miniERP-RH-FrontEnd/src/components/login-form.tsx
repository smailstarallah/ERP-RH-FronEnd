import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Tentative de connexion avec:', { email, apiUrl: `${API_URL}/api/auth/login` });
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📊 Réponse du serveur:', response.status, response.statusText);

      // Vérifier si la réponse est OK avant de tenter de parser le JSON
      if (!response.ok) {
        // Essayer de lire la réponse comme texte d'abord
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', errorText);
        
        let errorMessage = 'Erreur lors de la connexion';
        
        // Essayer de parser en JSON si possible
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Si ce n'est pas du JSON, utiliser le texte brut ou un message par défaut
          if (response.status === 403) {
            errorMessage = 'Accès refusé. Vérifiez vos identifiants.';
          } else if (response.status === 401) {
            errorMessage = 'Identifiants incorrects.';
          } else if (response.status === 500) {
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          } else if (errorText.trim()) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Si la réponse est OK, parser le JSON
      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || 'Identifiants invalides');
      }

      // Choisir le type de stockage selon "Se souvenir de moi"
      const storage = rememberMe ? localStorage : sessionStorage;

      // Stockage des informations
      storage.setItem('token', responseData.data.accessToken);
      storage.setItem('refreshToken', responseData.data.refreshToken);
      storage.setItem('userData', JSON.stringify(responseData.data.user));
      storage.setItem('tokenExpiration', (Date.now() + responseData.data.expiresIn * 1000).toString());

      // Redirection vers le tableau de bord
      navigate('/');
      console.info("Connexion réussie (ERP RH)", responseData.data);

    } catch (err) {
      // Messages d'erreur en français
      const message = err instanceof Error ? err.message : 'Une erreur est survenue lors de la connexion';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Connexion ERP RH</h1>
        <p className="text-slate-600 text-sm">
          Accédez à votre espace de travail sécurisé
        </p>
        {error && (
          <div role="alert" className="w-full p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
      </div>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-900">
            Adresse e-mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-slate-900">
              Mot de passe
            </Label>
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline"
            >
              Mot de passe oublié ?
            </a>
          </div>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg pr-20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? 'Masquer' : 'Afficher'}
            </button>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={loading}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          Se souvenir de moi
        </label>

        <Button
          type="submit"
          className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
          disabled={loading}
        >
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
      </div>

      <div className="text-center text-sm text-slate-600">
        Pas de compte ? <span className="font-medium text-slate-900">Contactez votre administrateur RH</span>
      </div>
    </form>
  )
}
