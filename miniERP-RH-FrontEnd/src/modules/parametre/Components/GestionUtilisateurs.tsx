import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export const GestionUtilisateurs = () => {
    const [users] = useState([
        { id: 1, nom: "Marie Dubois", email: "marie@entreprise.com", role: "Employé", statut: "Actif" },
        { id: 2, nom: "Pierre Martin", email: "pierre@entreprise.com", role: "Manager", statut: "Actif" },
        { id: 3, nom: "Sophie Leroux", email: "sophie@entreprise.com", role: "Employé", statut: "Inactif" },
    ]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Gestion des utilisateurs</CardTitle>
                    <CardDescription>Administrer les comptes utilisateurs</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <Button className="w-full sm:w-auto">Ajouter un utilisateur</Button>
                        <Button variant="outline" className="w-full sm:w-auto">Importer CSV</Button>
                        <Button variant="outline" className="w-full sm:w-auto">Exporter liste</Button>
                    </div>

                    <div className="space-y-3">
                        {users.map((user) => (
                            <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4">
                                <div>
                                    <div className="font-medium">{user.nom}</div>
                                    <div className="text-sm text-slate-500">{user.email}</div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {user.role}
                                    </span>
                                    <span className={`text-sm px-2 py-1 rounded ${user.statut === "Actif" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                        }`}>
                                        {user.statut}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">Modifier</Button>
                                        <Button size="sm" variant="outline">Désactiver</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
