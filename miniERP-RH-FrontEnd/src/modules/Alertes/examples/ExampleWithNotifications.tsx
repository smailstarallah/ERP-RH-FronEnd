import React from 'react';
import { NotificationLayout } from '../layouts/NotificationLayout';
import { ExamplePage } from './ExamplePage';

/**
 * Exemple d'intégration complète
 * Cette page montre comment wrapper n'importe quelle page avec les notifications
 */
export const ExampleWithNotifications: React.FC = () => {
    return (
        <NotificationLayout>
            <ExamplePage />
        </NotificationLayout>
    );
};

/**
 * Exemple d'utilisation du HOC withNotifications
 */
import { withNotifications } from '../layouts/NotificationLayout';

export const ExampleWithHOC = withNotifications(ExamplePage);
