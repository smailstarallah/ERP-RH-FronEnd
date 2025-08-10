import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { useState } from "react";

export const Profil = () => {
    const [userData, setUserData] = useState({
        nom: "Admin Système",
        email: "admin@entreprise.com",
        role: "Administrateur"
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Mon profil</CardTitle>
                    <CardDescription>Informations de votre compte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                            <User size={24} />
                        </div>
                        <div>
                            <div className="font-semibold text-lg">{userData.nom}</div>
                            <div className="text-slate-500">{userData.role}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Nom complet</Label>
                            <Input
                                value={userData.nom}
                                onChange={(e) => setUserData({ ...userData, nom: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={userData.email}
                                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <Button className="w-full sm:w-auto">Sauvegarder</Button>
                        <Button variant="outline" className="w-full sm:w-auto">Changer mot de passe</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mes congés</CardTitle>
                    <CardDescription>Solde et historique personnel</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded">
                            <div className="text-2xl font-bold text-green-600">15</div>
                            <div className="text-sm text-slate-500">Jours disponibles</div>
                        </div>
                        <div className="text-center p-4 border rounded">
                            <div className="text-2xl font-bold text-blue-600">5</div>
                            <div className="text-sm text-slate-500">Jours pris</div>
                        </div>
                        <div className="text-center p-4 border rounded">
                            <div className="text-2xl font-bold text-orange-600">2</div>
                            <div className="text-sm text-slate-500">En attente</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};