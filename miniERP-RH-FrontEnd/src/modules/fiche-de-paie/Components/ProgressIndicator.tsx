import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import type { StepConfig } from '../types/ElementPaieTypes';

interface ProgressIndicatorProps {
    steps: StepConfig[];
    currentStep: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ steps, currentStep }) => {
    const completedSteps = steps.filter(step => step.completed).length;
    const progressPercentage = (completedSteps / steps.length) * 100;

    return (
        <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Progression</h2>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {completedSteps}/{steps.length} étapes complétées
                    </span>
                </div>

                {/* Barre de progression globale */}
                <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Avancement global</span>
                        <span className="font-semibold">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 to-green-500 ${progressPercentage === 0 ? 'w-0' :
                                    progressPercentage <= 25 ? 'w-1/4' :
                                        progressPercentage <= 50 ? 'w-2/4' :
                                            progressPercentage <= 75 ? 'w-3/4' :
                                                'w-full'
                                }`}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${step.completed
                                        ? 'bg-green-600 text-white shadow-md scale-105'
                                        : currentStep === step.number
                                            ? 'bg-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-200'
                                            : currentStep > step.number
                                                ? 'bg-blue-100 text-blue-600 border-2 border-blue-200'
                                                : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {step.completed ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                <div className="hidden sm:block">
                                    <div className={`font-medium text-sm transition-colors duration-300 ${step.completed
                                            ? 'text-green-700'
                                            : currentStep === step.number
                                                ? 'text-blue-700 font-semibold'
                                                : currentStep > step.number
                                                    ? 'text-blue-600'
                                                    : 'text-gray-500'
                                        }`}>
                                        {step.title}
                                    </div>
                                    {currentStep === step.number && (
                                        <div className="text-xs text-blue-500 mt-1 animate-pulse">
                                            En cours...
                                        </div>
                                    )}
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`mx-4 hidden md:block transition-all duration-300 ${step.completed
                                        ? 'text-green-400 scale-110'
                                        : currentStep > step.number
                                            ? 'text-blue-400'
                                            : 'text-gray-300'
                                    }`}>
                                    <ArrowRight className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
