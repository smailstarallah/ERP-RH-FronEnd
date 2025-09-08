import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCard } from './AlertCard';
import { ChevronLeft, ChevronRight, Bell, BellOff, RefreshCw } from 'lucide-react';
import type { Alerte } from '../types';

interface AlertListProps {
  alertes: Alerte[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  onMarquerCommeLue: (alerteId: string) => Promise<void>;
  onSupprimer: (alerteId: string) => Promise<void>;
  onChangerPage: (page: number) => Promise<void>;
  onRafraichir: () => Promise<void>;
}

export const AlertList: React.FC<AlertListProps> = ({
  alertes,
  loading,
  error,
  totalPages,
  currentPage,
  onMarquerCommeLue,
  onSupprimer,
  onChangerPage,
  onRafraichir
}) => {
  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-2">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Erreur lors du chargement</p>
          </div>
          <p className="text-xs text-slate-600 mb-4">{error}</p>
          <Button 
            onClick={onRafraichir}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Bell className="w-5 h-5 text-blue-600" />
              Mes Alertes
              {!loading && alertes && (
                <span className="text-sm font-normal text-slate-500">
                  ({alertes.length} {alertes.length > 1 ? 'alertes' : 'alerte'})
                </span>
              )}
            </CardTitle>
            <Button
              onClick={onRafraichir}
              disabled={loading}
              size="sm"
              variant="outline"
              className="h-8"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Liste des alertes */}
      <div className="space-y-2">
        {loading && (
          <>
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <div className="flex justify-between items-center pt-2">
                        <Skeleton className="h-3 w-20" />
                        <div className="flex gap-2">
                          <Skeleton className="h-7 w-20" />
                          <Skeleton className="h-7 w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {!loading && alertes.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <BellOff className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-sm font-medium text-slate-600 mb-2">
                Aucune alerte disponible
              </p>
              <p className="text-xs text-slate-500">
                Vous n'avez pas reçu d'alertes récemment
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && alertes.length > 0 && (
          <>
            {alertes.map((alerte) => (
              <AlertCard
                key={alerte.id}
                alerte={alerte}
                onMarquerCommeLue={onMarquerCommeLue}
                onSupprimer={onSupprimer}
                loading={loading}
              />
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-600">
                Page {currentPage + 1} sur {totalPages}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onChangerPage(currentPage - 1)}
                  disabled={currentPage === 0 || loading}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        onClick={() => onChangerPage(pageNum)}
                        disabled={loading}
                        size="sm"
                        variant={pageNum === currentPage ? "default" : "outline"}
                        className={`
                          h-8 w-8 p-0 text-xs
                          ${pageNum === currentPage 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : ''
                          }
                        `}
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  onClick={() => onChangerPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || loading}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
