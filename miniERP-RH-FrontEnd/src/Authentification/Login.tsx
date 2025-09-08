import { LoginForm } from "@/components/login-form"
import { Shield, Users, BarChart3 } from "lucide-react"
import logo from "@/assets/images/logo.png"


export default function LoginPage() {
    const token = localStorage.getItem('token');
    if (token) {
        // Redirection vers la page d'accueil si l'utilisateur est déjà connecté
        window.location.href = '/';
    }

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10 bg-white">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-sm">
                        <LoginForm />
                    </div>
                </div>
            </div>

            <div className="relative h-screen hidden lg:block bg-slate-50">
                <div className="absolute top-20 right-20 w-32 h-32 bg-blue-100 rounded-lg rotate-12 opacity-20"></div>
                <div className="absolute bottom-32 left-16 w-24 h-24 bg-slate-200 rounded-lg -rotate-12 opacity-30"></div>
                <div className="absolute top-1/2 right-32 w-16 h-16 bg-blue-200 rounded-lg rotate-45 opacity-25"></div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-slate-700">

                    <div className="w-32 h-32 mx-auto bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-8">
                        <img src={logo} alt="Logo ERP RH" className="w-20 h-20" />
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-semibold mb-3 text-slate-900">ERP Ressources Humaines</h1>
                        <p className="text-lg text-slate-600 max-w-md leading-relaxed">
                            Plateforme intégrée de gestion administrative et stratégique
                        </p>
                    </div>

                    {/* Fonctionnalités - Style institutionnel */}
                    <div className="space-y-4 w-full max-w-sm">
                        <div className="flex items-center space-x-4 bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-900">Sécurité Renforcée</h3>
                                <p className="text-slate-600 text-sm">Conformité RGPD & ISO 27001</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-900">Gestion Centralisée</h3>
                                <p className="text-slate-600 text-sm">Administration unifiée</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-900">Analyse Prédictive</h3>
                                <p className="text-slate-600 text-sm">Tableaux de bord avancés</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}