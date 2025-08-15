import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface TimeHeaderProps {
    currentTime: Date;
    location: {
        address: string;
    };
    getCurrentTimeString: () => string;
}

export const TimeHeader: React.FC<TimeHeaderProps> = ({
    currentTime,
    location,
    getCurrentTimeString
}) => {
    return (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Pointage</h1>
                        <div className="flex items-center gap-2 text-blue-100">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{location.address}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-mono font-bold">
                            {getCurrentTimeString()}
                        </div>
                        <div className="text-blue-100">
                            {currentTime.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
