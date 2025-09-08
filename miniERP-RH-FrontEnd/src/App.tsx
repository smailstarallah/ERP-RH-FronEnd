import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { VerifyToken } from './services/verifyExpirationToken';
import { Logout } from './Authentification/Logout';
import Login from './Authentification/Login';
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { GestionConges } from './modules/gestion-conges/GestionConges';
import { ParametrePage } from './modules/parametre/ParametrePage';
import { TimeTrackingPage } from './modules/time-tracking/TimeTrackingPage';
import FichePaiePage from './modules/fiche-de-paie/FichePaiePage';
import DashboardPage from './modules/dashboard/DashboardPage';
import { AlertesPage } from './modules/Alertes';
import { AlertesProvider } from './modules/Alertes/contexts/AlertesContext';
import { GlobalNotifications } from './modules/Alertes/components/GlobalNotifications';
import { ToastManager } from './modules/Alertes/components/ToastManager';
import { getCurrentEmployeId } from './services/authService';

// Bouton flottant simple avec couleur bleue
function FloatingMenuButton() {
  const { open, toggleSidebar, isMobile } = useSidebar();

  return (
    <div className={`
      fixed z-50 transition-all duration-300
      ${isMobile
        ? 'top-4 left-4'
        : open
          ? 'top-12 left-[13.5rem]'
          : 'top-12 left-[-1.75rem]'
      }
    `}>
      <Button
        onClick={toggleSidebar}
        className={`
          bg-blue-600 hover:bg-blue-700 active:bg-blue-800
          text-white shadow-lg hover:shadow-xl
          transition-all duration-200
          focus:ring-2 focus:ring-blue-400 focus:outline-none
          ${isMobile
            ? 'w-12 h-12 rounded-lg'
            : open
              ? 'w-12 h-12 rounded-full'
              : 'w-14 h-10 rounded-lg px-3'
          }
        `}
        size="icon"
      >
        <div className="flex items-center gap-2">
          <Menu className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-90' : 'rotate-0 ml-6'}`} />

        </div>
        <span className="sr-only">{open ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
      </Button>
    </div>
  );
}



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = () => {
      const isValid = VerifyToken();
      setIsAuthenticated(isValid);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <Router>
      {!isAuthenticated ? (
        // Routes publiques sans sidebar
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/recover-password" element={<div>Récupération de mot de passe</div>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        // Routes protégées avec sidebar institutionnel compact
        <AlertesProvider employeId={getCurrentEmployeId()}>
          <SidebarProvider>
            <AppSidebar />
            <FloatingMenuButton />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-4 bg-gradient-to-br from-slate-50 to-white min-h-screen">
                {/* Indicateur de navigation pour mobile */}
                <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3 m-4 mb-0">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Système RH - Navigation active</span>
                  </div>
                </div>

                {/* Contenu principal avec padding responsive */}
                <div className="flex-1 p-4 pt-0 md:pt-4">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/alertes" element={<AlertesPage />} />
                    <Route path="/gestion-conges" element={<GestionConges />} />
                    <Route path="/parametres" element={<ParametrePage />} />
                    <Route path="/time-tracking" element={<TimeTrackingPage />} />
                    <Route path="/fiche-paie" element={<FichePaiePage />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="*" element={<Navigate to="/" />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                  </Routes>
                </div>
              </div>

              {/* 🔔 Gestionnaire de notifications toast temps réel */}
              <ToastManager
                userId={getCurrentEmployeId()}
                maxToasts={5}
                toastDuration={7000}
              />
            </SidebarInset>
          </SidebarProvider>

          {/* 🚨 Notifications globales en haut à droite */}
          <GlobalNotifications />

        </AlertesProvider>

      )}
    </Router>
  );
}

export default App
