import { LoginForm } from "@/components/login-form"
import { GalleryVerticalEnd, Shield, Users, BarChart3 } from "lucide-react"
import logo from "@/assets/images/logo.png"


export default function LoginPage() {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* Section formulaire */}
            <div className="flex flex-col gap-4 p-6 md:p-10 bg-slate-50">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="bg-blue-600 text-white flex size-6 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        <span className="text-slate-800">Acme Inc.</span>
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>

            {/* Section droite avec dégradé doux */}
            <div className="relative h-screen hidden lg:block bg-gradient-to-br from-slate-50 via-blue-200 to-sky-100">
                {/* Cercles décoratifs avec des tons apaisants */}
                <div className="absolute top-10 right-20 w-64 h-64 bg-blue-200/15 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-48 h-48 bg-sky-200/15 rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-indigo-200/10 rounded-full blur-xl"></div>

                {/* Contenu principal */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-slate-700">
                    {/* Logo */}
                    <div className="w-48 h-48 mx-auto  rounded-xl flex items-center justify-center">
                        <img src={logo} alt="Logo" />
                    </div>

                    {/* Titre principal */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4 text-slate-800">ERP RH</h1>
                        <p className="text-lg text-slate-600 max-w-md leading-relaxed">
                            Système intégré de gestion des ressources humaines
                        </p>
                    </div>

                    {/* Cartes de fonctionnalités */}
                    <div className="space-y-3 w-full max-w-sm">
                        <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100/50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-slate-800">Sécurisé</h3>
                                <p className="text-slate-600 text-sm">Protection des données</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-sky-100/50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-sky-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-slate-800">Collaboratif</h3>
                                <p className="text-slate-600 text-sm">Gestion d'équipe</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100/50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-slate-800">Analytique</h3>
                                <p className="text-slate-600 text-sm">Tableaux de bord</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}