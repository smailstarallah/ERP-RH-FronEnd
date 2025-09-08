import React from 'react';
import { formatDistanceToNow, fr } from '../utils/dateUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trash2, Info, CheckCheck, AlertTriangle } from 'lucide-react';
import type { Alerte, AlertType } from '../types';

interface AlertCardProps {
  alerte: Alerte;
  onMarquerCommeLue: (alerteId: string) => Promise<void>;
  onSupprimer: (alerteId: string) => Promise<void>;
  loading?: boolean;
}

const getTypeConfig = (type: AlertType) => {
  switch (type) {
    case 'info':
      return {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        icon: Info,
        label: 'Information'
      };
    case 'success':
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        icon: CheckCheck,
        label: 'Succès'
      };
    case 'urgent':
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        icon: AlertTriangle,
        label: 'Urgent'
      };
    default:
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200',
        icon: Info,
        label: 'Information'
      };
  }
};

export const AlertCard: React.FC<AlertCardProps> = ({
  alerte,
  onMarquerCommeLue,
  onSupprimer,
  loading = false
}) => {
  const typeConfig = getTypeConfig(alerte.type);
  const TypeIcon = typeConfig.icon;

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: fr 
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  return (
    <Card className={`
      transition-all duration-200 hover:shadow-md
      ${alerte.lue ? 'opacity-75' : 'border-l-4 ' + typeConfig.borderColor}
      ${!alerte.lue ? 'bg-white' : 'bg-slate-50'}
    `}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icône de type */}
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full
            ${typeConfig.bgColor} flex-shrink-0
          `}>
            <TypeIcon className={`w-4 h-4 ${typeConfig.textColor}`} />
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`
                font-semibold text-sm leading-5
                ${alerte.lue ? 'text-slate-600' : 'text-slate-900'}
              `}>
                {alerte.titre}
              </h3>
              
              <Badge 
                variant="secondary" 
                className={`
                  text-xs px-2 py-0.5 border
                  ${typeConfig.bgColor} ${typeConfig.textColor} ${typeConfig.borderColor}
                `}
              >
                {typeConfig.label}
              </Badge>

              {alerte.lue && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Lue
                </Badge>
              )}
            </div>

            <p className={`
              text-xs mb-3 leading-4
              ${alerte.lue ? 'text-slate-500' : 'text-slate-600'}
            `}>
              {alerte.message}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {formatDate(alerte.dateCreation)}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!alerte.lue && (
                  <Button
                    onClick={() => onMarquerCommeLue(alerte.id)}
                    disabled={loading}
                    size="sm"
                    className="
                      bg-green-600 hover:bg-green-700 text-white 
                      rounded-lg text-xs px-2 py-1 h-7
                      focus:ring-2 focus:ring-green-400 focus:ring-offset-1
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors duration-200
                    "
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Marquer lue
                  </Button>
                )}

                <Button
                  onClick={() => onSupprimer(alerte.id)}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                  className="
                    border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300
                    rounded-lg text-xs px-2 py-1 h-7
                    focus:ring-2 focus:ring-red-400 focus:ring-offset-1
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200
                  "
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
