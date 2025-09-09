import { LoginForm } from "@/components/login-form"
import { Shield, Users, BarChart3 } from "lucide-react"
import logo from "@/assets/images/digitalia-logo.png"


export default function LoginPage() {
    const token = localStorage.getItem('token');
    if (token) {
        // Redirection vers la page d'accueil si l'utilisateur est déjà connecté
        window.location.href = '/';
    }

    return (
        <div className="grid min-h-screen lg:grid-cols-2 bg-slate-50">
            <div className="flex flex-1 items-center justify-center">
                <div className=" max-w-sm">
                    <LoginForm />
                </div>
            </div>

            <div className="relative h-screen hidden lg:block bg-gradient-to-br from-slate-100 to-blue-200">
                <div className="absolute top-20 right-20 w-40 h-32 bg-slate-200 rounded-2xl rotate-12 opacity-50"></div>
                <div className="absolute top-60 right-4 w-64 h-32 bg-slate-200 rounded-2xl rotate-12 opacity-50"></div>
                <div className="absolute bottom-32 left-16 w-24 h-24 bg-blue-200 rounded-2xl -rotate-12 opacity-60"></div>
                <div className="absolute top-3/4 right-16 w-24 h-32 bg-slate-200 rounded-2xl rotate-45 opacity-45"></div>
                <div className="absolute top-1/3 left-20 w-20 h-20 bg-blue-300 rounded-2xl -rotate-6 opacity-35"></div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-slate-700">

                    <div className="w-auto px-6 py-2 h-auto mx-auto bg-white/900 rounded-xl shadow-lg border-slate-200 flex items-center justify-center mb-6 mt-4">
                        <img src={logo} alt="Logo ERP RH" className="w-48 h-auto" />
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-semibold mb-4 text-slate-900">ERP Ressources Humaines</h1>
                        <p className="text-md text-slate-600 max-w-md leading-relaxed">
                            Plateforme intégrée de gestion administrative et stratégique
                        </p>
                    </div>

                    <div className="space-y-4 w-full max-w-sm">
                        <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200/50 shadow-md hover:shadow-lg transition-all duration-200">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                                    <Shield className="w-5 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Sécurité Renforcée</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">Conformité RGPD & ISO 27001</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200/50 shadow-md hover:shadow-lg transition-all duration-200">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                                    <Users className="w-5 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Gestion Centralisée</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">Administration unifiée</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200/50 shadow-md hover:shadow-lg transition-all duration-200">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                                    <BarChart3 className="w-5 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Analyse Prédictive</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">Tableaux de bord avancés</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}