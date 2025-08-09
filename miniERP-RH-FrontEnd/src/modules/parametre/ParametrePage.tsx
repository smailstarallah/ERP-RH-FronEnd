import React, { useState } from "react";
import {
    Settings,
    Calendar,
    Home,
    ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ParametrePage = () => {
    const [selfRegistrationEnabled, setSelfRegistrationEnabled] = useState(true);
    const [defaultRole, setDefaultRole] = useState("employe");
    const [requireApproval, setRequireApproval] = useState(true);

    const [leaveTypes, setLeaveTypes] = useState([
        { id: 1, name: "Congé annuel", color: "#3b82f6", paye: true, nombreJoursMax: 25 },
        { id: 2, name: "Maladie", color: "#ef4444", paye: true, nombreJoursMax: 30 },
    ]);
    const [newLeaveName, setNewLeaveName] = useState("");
    const [newLeaveColor, setNewLeaveColor] = useState("#3b82f6");
    const [newLeavePaye, setNewLeavePaye] = useState(true);
    const [newLeaveJoursMax, setNewLeaveJoursMax] = useState(0);

    const [notifyManagerOnRequest, setNotifyManagerOnRequest] = useState(true);

    function addLeaveType(e) {
        e.preventDefault();
        if (!newLeaveName.trim()) return;
        const next = {
            id: Date.now(),
            name: newLeaveName.trim(),
            color: newLeaveColor,
            paye: newLeavePaye,
            nombreJoursMax: Number(newLeaveJoursMax) || 0,
        };
        setLeaveTypes((s) => [next, ...s]);
        setNewLeaveName("");
        setNewLeaveColor("#3b82f6");
        setNewLeavePaye(true);
        setNewLeaveJoursMax(0);
    }

    function removeLeaveType(id) {
        setLeaveTypes((s) => s.filter((t) => t.id !== id));
    }

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900">
            <div className="flex">
                {/* Sidebar institutionnelle */}
                <aside className="w-64 border-r bg-white min-h-screen p-4 hidden md:block">
                    <div className="font-semibold text-lg mb-6 flex items-center gap-2">
                        <Settings size={18} /> RH ERP
                    </div>
                    <nav className="space-y-1 text-sm text-slate-700">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Home size={16} /> Home
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <ClipboardList size={16} /> Gestion des Congés
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Settings size={16} /> Paramètres
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Calendar size={16} /> Calendrier
                        </Button>
                    </nav>
                </aside>

                {/* Contenu principal */}
                <main className="flex-1 p-4 sm:p-6">
                    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <h1 className="text-xl sm:text-2xl font-extrabold">
                            Système intégré de gestion des ressources humaines
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600">Admin</span>
                            <div className="w-10 h-10 rounded-full bg-slate-200" />
                        </div>
                    </header>

                    {/* Paramètres - Chaque section dans sa propre card */}
                    <div className="space-y-6">

                        {/* Section Enregistrement */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration d'enregistrement</CardTitle>
                                <CardDescription>Paramètres pour l'inscription des nouveaux utilisateurs</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <span>Inscription libre</span>
                                    <Switch checked={selfRegistrationEnabled} onCheckedChange={setSelfRegistrationEnabled} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Rôle par défaut</Label>
                                    <Select value={defaultRole} onValueChange={setDefaultRole}>
                                        <SelectTrigger className="w-full sm:w-64">
                                            <SelectValue placeholder="Choisir un rôle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="employe">Employé</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <span>Requiert validation</span>
                                    <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                    <Button className="w-full sm:w-auto">Enregistrer</Button>
                                    <Button variant="outline" className="w-full sm:w-auto">Annuler</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section Types de congés */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Types de congés</CardTitle>
                                <CardDescription>Gérer les différents types de congés disponibles</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={addLeaveType} className="space-y-4 mb-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <Label>Nom</Label>
                                            <Input
                                                value={newLeaveName}
                                                onChange={(e) => setNewLeaveName(e.target.value)}
                                                placeholder="Ex: Congé parental"
                                            />
                                        </div>
                                        <div>
                                            <Label>Couleur</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    value={newLeaveColor}
                                                    onChange={(e) => setNewLeaveColor(e.target.value)}
                                                    className="w-16 h-10 p-1 border rounded"
                                                />
                                                <Input
                                                    value={newLeaveColor}
                                                    onChange={(e) => setNewLeaveColor(e.target.value)}
                                                    placeholder="#3b82f6"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Nombre jours max</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={newLeaveJoursMax}
                                                onChange={(e) => setNewLeaveJoursMax(e.target.value)}
                                                placeholder="30"
                                            />
                                        </div>
                                        <div>
                                            <Label>Options</Label>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Switch
                                                    checked={newLeavePaye}
                                                    onCheckedChange={setNewLeavePaye}
                                                />
                                                <span className="text-sm">Payé</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button type="submit" className="w-full sm:w-auto">Ajouter</Button>
                                        <Button
                                            variant="outline"
                                            type="button"
                                            className="w-full sm:w-auto"
                                            onClick={() => {
                                                setNewLeaveName("");
                                                setNewLeaveColor("#3b82f6");
                                                setNewLeavePaye(true);
                                                setNewLeaveJoursMax(0);
                                            }}
                                        >
                                            Réinitialiser
                                        </Button>
                                    </div>
                                </form>

                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm text-slate-600">Types configurés</h4>
                                    {leaveTypes.map((t) => (
                                        <div key={t.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-md bg-slate-50 border gap-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded-full border"
                                                    style={{ backgroundColor: t.color }}
                                                />
                                                <div>
                                                    <div className="font-medium">{t.name}</div>
                                                    <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                                                        <span>{t.nombreJoursMax} jours max</span>
                                                        <span>•</span>
                                                        <span className={t.paye ? "text-green-600" : "text-red-600"}>
                                                            {t.paye ? "Payé" : "Non payé"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => removeLeaveType(t.id)}
                                                className="w-full sm:w-auto"
                                            >
                                                Supprimer
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section Notifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>Configuration des notifications système</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <span className="font-medium">Notifier le manager</span>
                                        <p className="text-sm text-slate-500">Envoyer un email au manager lors des demandes</p>
                                    </div>
                                    <Switch
                                        checked={notifyManagerOnRequest}
                                        onCheckedChange={setNotifyManagerOnRequest}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions rapides */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions rapides</CardTitle>
                                <CardDescription>Raccourcis pour les actions administratives</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full">Créer un utilisateur</Button>
                                <Button variant="outline" className="w-full">Importer utilisateurs</Button>
                                <Button variant="outline" className="w-full">Exporter configuration</Button>

                                <div className="mt-6">
                                    <div className="text-sm font-medium text-slate-600 mb-3">Dernières actions</div>
                                    <ul className="text-sm space-y-2">
                                        <li className="p-2 rounded bg-blue-50 border-l-4 border-blue-500">
                                            John Doe a demandé un congé (12 Aug)
                                        </li>
                                        <li className="p-2 rounded bg-green-50 border-l-4 border-green-500">
                                            Nouvelle règle: requireApproval activé
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}