import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
    type: 'success' | 'error' | 'info' | '';
    text: string;
}

interface MessageAlertProps {
    message: Message;
}

export const MessageAlert: React.FC<MessageAlertProps> = ({ message }) => {
    if (!message.text) return null;

    return (
        <Alert className={`${message.type === 'error' ? 'border-red-200 bg-red-50' :
            message.type === 'info' ? 'border-blue-200 bg-blue-50' :
                'border-green-200 bg-green-50'}`}>
            <AlertDescription className={`${message.type === 'error' ? 'text-red-800' :
                message.type === 'info' ? 'text-blue-800' :
                    'text-green-800'}`}>
                {message.text}
            </AlertDescription>
        </Alert>
    );
};
