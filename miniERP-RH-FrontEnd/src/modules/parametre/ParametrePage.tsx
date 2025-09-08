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
        { id: "WeeklyPlanner", label: "Suivi de Temps", icon: ClipboardList },
        { id: "utilisateurs", label: "Gestion Utilisateurs", icon: Users },
        { id: "profil", label: "Mon Profil", icon: User },
    ];

    const renderCurrentPage = () => {
        switch (currentPage) {
            case "conges": return <ParametreConges />;
            case "utilisateurs": return <GestionUtilisateurs />;
            case "WeeklyPlanner": return <WeeklyPlanner />;
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
        <div className="mx-4">
            {/* En-tête - Style institutionnel */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-4">
                <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-semibold text-slate-900">Paramètres</h1>
                </div>
            </div>

            {/* Navigation par onglets FIXE - Desktop */}
            <div className="hidden md:flex border-b border-slate-200 sticky top-0 z-30 bg-white shadow-sm mb-6">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Button
                            key={item.id}
                            variant="ghost"
                            className={`flex items-center gap-2 px-4 py-3 rounded-none border-b-2 transition-colors duration-200 ${currentPage === item.id
                                ? "border-blue-600 text-blue-600 bg-blue-50"
                                : "border-transparent text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                }`}
                            onClick={() => setCurrentPage(item.id)}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Button>
                    );
                })}
            </div>

            {/* Navigation par onglets FIXE - Mobile */}
            <div className="md:hidden p-2 sticky top-0 z-30 bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-2 gap-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Button
                                key={item.id}
                                variant={currentPage === item.id ? "default" : "ghost"}
                                className={`flex flex-col items-center gap-1 p-3 h-auto ${currentPage === item.id
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "hover:bg-blue-50 hover:text-blue-700 text-slate-700"
                                    }`}
                                onClick={() => setCurrentPage(item.id)}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-xs font-medium text-center">{item.label}</span>
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Contenu principal */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <Settings className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {getPageTitle()}
                        </h2>
                    </div>
                </div>

                <div className="p-4">
                    {renderCurrentPage()}
                </div>
            </div>
        </div>
    );
}