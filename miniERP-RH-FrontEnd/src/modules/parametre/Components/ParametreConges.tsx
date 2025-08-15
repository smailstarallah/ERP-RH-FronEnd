import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ParametreConges = () => {
    const [leaveTypes, setLeaveTypes] = useState([
        { id: 1, name: "Congé annuel", color: "#3b82f6", paye: true, nombreJoursMax: 25 },
        { id: 2, name: "Maladie", color: "#ef4444", paye: true, nombreJoursMax: 30 },
    ]);
    const [newLeaveName, setNewLeaveName] = useState("");
    const [newLeaveColor, setNewLeaveColor] = useState("#3b82f6");
    const [newLeavePaye, setNewLeavePaye] = useState(true);
    const [newLeaveJoursMax, setNewLeaveJoursMax] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    interface LeaveType {
        id: number;
        name: string;
        color: string;
        paye: boolean;
        nombreJoursMax: number;
    }

    // Fonction pour récupérer le token JWT (ajustez selon votre implémentation)
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Fonction pour envoyer à l'API
    const saveToAPI = async (leaveTypeData: Omit<LeaveType, 'id'>) => {
        const token = getToken();
        if (!token) {
            setMessage({ type: 'error', text: 'Token JWT manquant. Veuillez vous reconnecter.' });
            return false;
        }

        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/api/gestion-conge/save-type-conge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nom: leaveTypeData.name,
                    couleur: leaveTypeData.color,
                    paye: leaveTypeData.paye,
                    nombreJoursMax: leaveTypeData.nombreJoursMax
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Token expiré. Veuillez vous reconnecter.');
                }
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            setMessage({ type: 'success', text: 'Type de congé ajouté avec succès!' });
            return result;
        } catch (error) {
            console.error('Erreur API:', error);
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Erreur lors de l\'ajout du type de congé'
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour récupérer les types de congés depuis l'API
    const fetchLeaveTypes = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch('http://localhost:8080/api/gestion-conge/list-all-type-conge', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Types de congés récupérés:', data);
                if (Array.isArray(data)) {
                    setLeaveTypes(data.map(item => ({
                        id: item.id,
                        name: item.nom,
                        color: item.couleur,
                        paye: item.paye,
                        nombreJoursMax: item.nombreJoursMax
                    })));
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement des types de congés:', error);
        }
    };

    // Charger les types de congés au montage du composant
    useEffect(() => {
        fetchLeaveTypes();
    }, []);

    // Masquer le message après 5 secondes
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    async function addLeaveType(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (!newLeaveName.trim()) {
            setMessage({ type: 'error', text: 'Le nom du type de congé est requis.' });
            return;
        }

        const leaveTypeData = {
            name: newLeaveName.trim(),
            color: newLeaveColor,
            paye: newLeavePaye,
            nombreJoursMax: Number(newLeaveJoursMax) || 0,
        };

        // Envoyer à l'API
        const result = await saveToAPI(leaveTypeData);

        if (result) {
            // Si succès, ajouter localement aussi
            const next: LeaveType = {
                id: result.id || Date.now(), // Utiliser l'ID de l'API si disponible
                ...leaveTypeData
            };
            setLeaveTypes((s) => [next, ...s]);

            // Réinitialiser le formulaire
            setNewLeaveName("");
            setNewLeaveColor("#3b82f6");
            setNewLeavePaye(true);
            setNewLeaveJoursMax(0);
        }
    }

    async function removeLeaveType(id: number) {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:8080/api/gestion-conge/delete-type-conge/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                // Only update local state after successful deletion
                setLeaveTypes((s) => s.filter((t) => t.id !== id));
                console.log('Type de congé supprimé avec succès');
            } else {
                console.error('Erreur lors de la suppression:', response.statusText);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du type de congé:', error);
        }
    }

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Types de congés</CardTitle>
                    <CardDescription>Gérer les différents types de congés disponibles</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Message de feedback */}
                    {message.text && (
                        <Alert className={`mb-4 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                                {message.text}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <Label>Nom *</Label>
                                <Input
                                    value={newLeaveName}
                                    onChange={(e) => setNewLeaveName(e.target.value)}
                                    placeholder="Ex: Congé parental"
                                    required
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
                                    onChange={(e) => setNewLeaveJoursMax(Number(e.target.value))}
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
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    addLeaveType(e as any);
                                }}
                                className="w-full sm:w-auto"
                                disabled={loading}
                            >
                                {loading ? 'Enregistrement...' : 'Ajouter'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setNewLeaveName("");
                                    setNewLeaveColor("#3b82f6");
                                    setNewLeavePaye(true);
                                    setNewLeaveJoursMax(0);
                                    setMessage({ type: '', text: '' });
                                }}
                                className="w-full sm:w-auto"
                                disabled={loading}
                            >
                                Réinitialiser
                            </Button>
                        </div>
                    </div>

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
                                    disabled={loading}
                                >
                                    Supprimer
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};