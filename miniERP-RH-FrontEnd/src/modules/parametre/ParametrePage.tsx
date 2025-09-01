import { useState } from "react";
import {
    Settings,
    ClipboardList,
    Users,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Profil } from "./Components/Profil";
import GestionUtilisateurs from "./Components/GestionUtilisateurs";
import { ParametreConges } from "./Components/ParametreConges";
import { WeeklyPlanner } from "./Components/ParametreTimeTracking";


export const ParametrePage = () => {
    const [currentPage, setCurrentPage] = useState("profil");

    const menuItems = [
        { id: "conges", label: "Gestion des Congés", icon: ClipboardList },
        { id: "WeeklyPlanner", label: "suivi de temps", icon: ClipboardList },
        { id: "utilisateurs", label: "Gestion Utilisateurs", icon: Users },
        { id: "profil", label: "Mon Profil", icon: User },
    ];

    const renderCurrentPage = () => {
        switch (currentPage) {
            case "conges": return <ParametreConges />;
            case "utilisateurs": return <GestionUtilisateurs />;
            case "WeeklyPlanner": return <WeeklyPlanner />;
            // case "calendrier": return <Calendrier />;
            case "profil": return <Profil />;
            default: return <ParametreConges />;
        }
    };

    const getPageTitle = () => {
        switch (currentPage) {
            case "conges": return "Gestion des congés";
            case "utilisateurs": return "Gestion des utilisateurs";
            case "WeeklyPlanner": return "Paramètres du suivi de temps";
            case "profil": return "Mon profil";
            default: return "Gestion des congés";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900">
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 border-r bg-white min-h-screen p-4 hidden md:block">
                    <div className="font-semibold text-lg mb-6 flex items-center gap-2">
                        <Settings size={18} /> RH ERP
                    </div>
                    <nav className="space-y-1 text-sm">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Button
                                    key={item.id}
                                    variant={currentPage === item.id ? "default" : "ghost"}
                                    className="w-full justify-start gap-2"
                                    onClick={() => setCurrentPage(item.id)}
                                >
                                    <Icon size={16} /> {item.label}
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Menu mobile */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2">
                    <div className="flex justify-around">
                        {menuItems.slice(0, 4).map((item) => {
                            const Icon = item.icon;
                            return (
                                <Button
                                    key={item.id}
                                    variant={currentPage === item.id ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setCurrentPage(item.id)}
                                    className="flex-col h-auto py-2"
                                >
                                    <Icon size={16} />
                                    <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Contenu principal */}
                <main className="flex-1 p-4 sm:p-6 mb-16 md:mb-0">
                    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <h1 className="text-xl sm:text-2xl font-extrabold">
                            {getPageTitle()}
                        </h1>
                    </header>

                    {renderCurrentPage()}
                </main>
            </div>
        </div>
    );
}