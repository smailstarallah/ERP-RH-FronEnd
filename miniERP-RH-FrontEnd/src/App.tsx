import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { VerifyToken } from './services/verifyExpirationToken';
import { Logout } from './Authentification/Logout';
import Login from './Authentification/Login';
import { AppSidebar } from "@/components/app-sidebar"
import { NavActions } from "@/components/nav-actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { GestionConges } from './modules/gestion-conges/GestionConges';
import { ParametrePage } from './modules/parametre/ParametrePage';
import { TimeTrackingPage } from './modules/time-tracking/TimeTrackingPage';
import FichePaiePage from './modules/fiche-de-paie/FichePaiePage';


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
        // Routes protégées avec sidebar
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2">
              <div className="flex flex-1 items-center gap-2 px-3">
                <SidebarTrigger />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage className="line-clamp-1">
                        Système intégré de gestion des ressources humaines
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

            </header>
            <div className="flex flex-1 flex-col gap-4 px-4 py-10">
              <Routes>
                <Route path="/" element={<div>Dashboard</div>} />
                <Route path="/gestion-conges" element={<GestionConges />} />
                <Route path="/parametres" element={<ParametrePage />} />
                <Route path="/time-tracking" element={<TimeTrackingPage />} />
                <Route path="/fiche-paie" element={<FichePaiePage />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </SidebarInset>
        </SidebarProvider>
      )}
    </Router>
  );
}

export default App
