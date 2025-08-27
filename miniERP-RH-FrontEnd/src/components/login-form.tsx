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
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Erreur lors de la connexion');
      }

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
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Connexion — ERP RH</h1>
        <p className="text-muted-foreground text-sm">
          Accédez à votre espace de travail
        </p>
        {error && (
          <div role="alert" className="w-full p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}
      </div>

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input id="email" type="email" placeholder="votre@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
        </div>

        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Mot de passe</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
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
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? 'Masquer' : 'Afficher'}
            </button>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={loading} />
          Se souvenir de moi
        </label>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </Button>

      </div>

      <div className="text-center text-sm">
        Pas de compte ? <span className="font-medium">Contactez votre administrateur RH</span>
      </div>
    </form>
  )
}
