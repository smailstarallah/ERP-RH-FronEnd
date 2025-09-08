// components/WeeklyPlanner.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Copy, Sun, Sunset, XCircle, Briefcase, CalendarDays, Loader2 } from 'lucide-react';

//================================================================================
// 1. TYPES ET CONFIGURATION (inchangés)
//================================================================================

const DAYS_OF_WEEK = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"] as const;
type DayOfWeek = typeof DAYS_OF_WEEK[number];

interface ScheduleDay {
    jourSemaine: DayOfWeek;
    heureDebutMatin: string;
    heureFinMatin: string;
    heureDebutApresMidi: string;
    heureFinApresMidi: string;
}

type WeeklySchedule = Record<DayOfWeek, ScheduleDay | null>;

const makeDefaultSchedule = (jourSemaine: DayOfWeek): ScheduleDay => ({
    jourSemaine,
    heureDebutMatin: "09:00",
    heureFinMatin: "12:00",
    heureDebutApresMidi: "13:00",
    heureFinApresMidi: "17:00",
});

const INITIAL_SCHEDULE: WeeklySchedule = {
    LUNDI: makeDefaultSchedule("LUNDI"),
    MARDI: makeDefaultSchedule("MARDI"),
    MERCREDI: makeDefaultSchedule("MERCREDI"),
    JEUDI: makeDefaultSchedule("JEUDI"),
    VENDREDI: makeDefaultSchedule("VENDREDI"),
    SAMEDI: null,
    DIMANCHE: null,
};

//================================================================================
// 2. COMPOSANT PRINCIPAL (logique inchangée, classes CSS modifiées)
//================================================================================

export const WeeklyPlanner = () => {
    // --- ÉTATS (inchangés) ---
    const [schedule, setSchedule] = useState<WeeklySchedule>(INITIAL_SCHEDULE);
    const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['LUNDI']);
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // --- LOGIQUE (inchangée) ---
    const activeDay = useMemo(() => selectedDays.length > 0 ? selectedDays[0] : null, [selectedDays]);
    const activeSchedule = useMemo(() => activeDay ? schedule[activeDay] : null, [schedule, activeDay]);


    const handleTimeChange = useCallback((field: keyof Omit<ScheduleDay, 'jourSemaine'>, value: string) => {
        if (!activeDay) return;
        setSchedule(currentSchedule => ({
            ...currentSchedule,
            [activeDay]: { ...currentSchedule[activeDay]!, [field]: value },
        }));
    }, [activeDay]);

    const handleToggleDayOff = useCallback((isWorking: boolean) => {
        setSchedule(currentSchedule => {
            const newSchedule = { ...currentSchedule };
            selectedDays.forEach(day => {
                newSchedule[day] = isWorking ? makeDefaultSchedule(day) : null;
            });
            return newSchedule;
        });
    }, [selectedDays]);

    const handleApplyTemplate = useCallback(() => {
        if (!activeDay || selectedDays.length <= 1) return;

        const template = schedule[activeDay]; // Peut être null (Fermé) ou un objet ScheduleDay
        setSchedule(currentSchedule => {
            const newSchedule = { ...currentSchedule };
            selectedDays.forEach(day => {
                newSchedule[day] = template ? { ...template, jourSemaine: day } : null;
            });
            return newSchedule;
        });

    }, [activeDay, schedule, selectedDays]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);
        // Validation : au moins un jour travaillé
        const hasWorkingDay = Object.values(schedule).some(day => day !== null);
        if (!hasWorkingDay) {
            setFeedback({ type: 'error', message: 'Veuillez définir au moins un jour travaillé.' });
            return;
        }
        setIsLoading(true);
        try {
            // Transformer le planning en liste d'objets ScheduleDay avec jourSemaine en anglais (lowercase)
            const dayMap: Record<string, string> = {
                'LUNDI': 'MONDAY',
                'MARDI': 'TUESDAY',
                'MERCREDI': 'WEDNESDAY',
                'JEUDI': 'THURSDAY',
                'VENDREDI': 'FRIDAY',
                'SAMEDI': 'SATURDAY',
                'DIMANCHE': 'SUNDAY',
            };
            const padTime = (t: string) => t.length === 5 ? t + ':00' : t;
            const planningList = Object.values(schedule)
                .filter(Boolean)
                .map(day => ({
                    ...day!,
                    heureDebutMatin: padTime(day!.heureDebutMatin),
                    heureFinMatin: padTime(day!.heureFinMatin),
                    heureDebutApresMidi: padTime(day!.heureDebutApresMidi),
                    heureFinApresMidi: padTime(day!.heureFinApresMidi),
                    jourSemaine: dayMap[day!.jourSemaine] || day!.jourSemaine.toUpperCase()
                }));
            console.log("Données à envoyer à l'API:", planningList);
            const response = await fetch('http://localhost:8080/api/pointages/create-planning', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(planningList),
            });
            if (!response.ok) throw new Error('Erreur lors de l’enregistrement du planning');
            setFeedback({ type: 'success', message: 'Planning enregistré avec succès !' });
        } catch (err) {
            setFeedback({ type: 'error', message: "Erreur lors de l'enregistrement du planning." });
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <TooltipProvider>
            <div className="w-full min-h-screen flex justify-center items-start overflow-x-auto">
                <Card className="w-full max-w-4xl mx-auto shadow-sm border border-slate-200 my-2 md:my-4 flex-1">
                    <CardHeader className="bg-slate-50 border-b border-slate-200">
                        {/* AMÉLIORATION: Header adaptatif */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <CalendarDays className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-slate-900">Planification Hebdomadaire</CardTitle>
                                <CardDescription className="text-sm text-slate-600">Définissez le modèle d'horaires. Sélectionnez un ou plusieurs jours pour les modifier en groupe.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-6">
                        {/* AMÉLIORATION: Sélecteur de jours adaptatif */}
                        <div className="overflow-x-auto">
                            <Label className="text-sm font-medium text-slate-900">1. Sélectionnez les jours à configurer</Label>
                            <ToggleGroup
                                type="multiple"
                                value={selectedDays}
                                onValueChange={(days) => setSelectedDays(days as DayOfWeek[])}
                                className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2 min-w-[350px] md:min-w-0"
                            >
                                {DAYS_OF_WEEK.map(day => (
                                    <ToggleGroupItem
                                        key={day}
                                        value={day}
                                        className="flex flex-col h-16 text-center min-w-[70px]"
                                        variant="outline"
                                    >
                                        <span className="font-semibold">{day.substring(0, 3)}</span>
                                        <span className="text-xs text-muted-foreground mt-1">
                                            {schedule[day] ? `${schedule[day]!.heureDebutMatin} - ${schedule[day]!.heureFinApresMidi}` : 'Fermé'}
                                        </span>
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>

                        {activeDay ? (
                            // AMÉLIORATION: Grille principale adaptative
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start w-full">
                                <Card className="bg-slate-50 border border-slate-200">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-semibold text-slate-900">
                                            Édition pour : <span className="text-blue-600">{activeDay}</span>
                                            {selectedDays.length > 1 && ` (+${selectedDays.length - 1} autres)`}
                                        </CardTitle>
                                        <div className="flex items-center space-x-2 pt-2">
                                            <Switch id="is-working-day" checked={!!activeSchedule} onCheckedChange={handleToggleDayOff} />
                                            <Label htmlFor="is-working-day">{!!activeSchedule ? "Jour travaillé" : "Jour de repos (Fermé)"}</Label>
                                        </div>
                                    </CardHeader>
                                    {activeSchedule && (
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 text-slate-700"><Sun className="h-4 w-4" /> Matin</Label>
                                                    <div className="flex gap-2">
                                                        <Input type="time" value={activeSchedule.heureDebutMatin} onChange={e => handleTimeChange('heureDebutMatin', e.target.value)} className="border-slate-300 focus:border-blue-500 rounded-lg" />
                                                        <Input type="time" value={activeSchedule.heureFinMatin} onChange={e => handleTimeChange('heureFinMatin', e.target.value)} className="border-slate-300 focus:border-blue-500 rounded-lg" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2 text-slate-700"><Sunset className="h-4 w-4" /> Après-midi</Label>
                                                    <div className="flex gap-2">
                                                        <Input type="time" value={activeSchedule.heureDebutApresMidi} onChange={e => handleTimeChange('heureDebutApresMidi', e.target.value)} className="border-slate-300 focus:border-blue-500 rounded-lg" />
                                                        <Input type="time" value={activeSchedule.heureFinApresMidi} onChange={e => handleTimeChange('heureFinApresMidi', e.target.value)} className="border-slate-300 focus:border-blue-500 rounded-lg" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>

                                <div className="space-y-3 lg:space-y-4">
                                    <Card className="border border-slate-200">
                                        <CardHeader><CardTitle className="text-sm font-semibold text-slate-900">Actions de groupe</CardTitle></CardHeader>
                                        <CardContent>
                                            {/* AMÉLIORATION: Texte du bouton adaptatif */}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button onClick={handleApplyTemplate} disabled={selectedDays.length <= 1} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        {/* Texte court sur mobile, texte long sur les écrans plus larges */}
                                                        <span className="sm:hidden">Copier sur la sélection</span>
                                                        <span className="hidden sm:inline">Appliquer l'horaire de <b className="mx-1">{activeDay.substring(0, 3)}</b> aux jours sélectionnés</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Applique les horaires du jour actif ({activeDay}) à tous les autres jours sélectionnés.</TooltipContent>
                                            </Tooltip>
                                        </CardContent>
                                    </Card>
                                    <Alert className="border border-slate-200 bg-slate-50">
                                        <Briefcase className="h-4 w-4" />
                                        <AlertTitle className="text-slate-900">Comment ça marche ?</AlertTitle>
                                        <AlertDescription className="text-slate-600">Modifiez les horaires pour {activeDay}, puis cliquez sur "Appliquer" pour copier ces réglages sur tous les jours surlignés.</AlertDescription>
                                    </Alert>
                                </div>
                            </div>
                        ) : (
                            <Alert variant="destructive" className="text-center border border-red-200 bg-red-50">
                                <XCircle className="h-4 w-4" />
                                <AlertTitle className="text-red-900">Aucun jour sélectionné</AlertTitle>
                                <AlertDescription className="text-red-700">Veuillez sélectionner au moins un jour dans la liste ci-dessus pour commencer.</AlertDescription>
                            </Alert>
                        )}
                        <Separator />
                        {feedback && (
                            <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'} className={`mb-4 ${feedback.type === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
                                <AlertTitle className={feedback.type === 'error' ? 'text-red-900' : 'text-blue-900'}>{feedback.type === 'success' ? 'Succès' : 'Erreur'}</AlertTitle>
                                <AlertDescription className={feedback.type === 'error' ? 'text-red-700' : 'text-blue-700'}>{feedback.message}</AlertDescription>
                            </Alert>
                        )}
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSubmit}
                                size="lg"
                                disabled={isLoading || !Object.values(schedule).some(day => day !== null)}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                Enregistrer le planning
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
};