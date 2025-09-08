import React from 'react';
import { WebSocketProvider } from '../contexts/WebSocketProvider';
import { AlertesProvider } from '../contexts/AlertesProvider';
import { GlobalNotifications } from '../components/GlobalNotifications';
import { getCurrentEmployeId } from '../../../services/authService';

interface NotificationLayoutProps {
    children: React.ReactNode;
}

/**
 * Layout qui ajoute les notifications globales à n'importe quelle page
 * Ce composant doit entourer votre application pour avoir les notifications partout
 */
export const NotificationLayout: React.FC<NotificationLayoutProps> = ({ children }) => {
    const employeId = getCurrentEmployeId();

    return (
        <WebSocketProvider>
            <AlertesProvider employeId={employeId}>
                {children}
                <GlobalNotifications />
            </AlertesProvider>
        </WebSocketProvider>
    );
};

/**
 * HOC (Higher Order Component) pour ajouter les notifications à n'importe quel composant
 */
export const withNotifications = <P extends object>(Component: React.ComponentType<P>) => {
    const WrappedComponent = (props: P) => (
        <NotificationLayout>
            <Component {...props} />
        </NotificationLayout>
    );

    WrappedComponent.displayName = `withNotifications(${Component.displayName || Component.name})`;

    return WrappedComponent;
};
