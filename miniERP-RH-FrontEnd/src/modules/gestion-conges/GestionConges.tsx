import { DemandeCongeForm } from "./Components/DemandeConges"
import { SoldeConges } from "./Components/SoldeConges"
import PdfTesterComponent from "./Components/test"
import { ValidationConges } from "./Components/ValidationConges"

export const GestionConges = () => {
    return (
        <div className="w-full p-4 md:p-6">
            <div className="py-4 md:py-6">
                <ValidationConges />
            </div>
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Section solde de congés */}
                <div className="w-full lg:basis-1/2">
                    <SoldeConges />
                </div>

                {/* Section formulaire */}
                <div className="w-full lg:basis-1/2">
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                                Nouvelle demande de congés
                            </h2>
                        </div>
                        <div className="p-4 md:p-6">
                            <DemandeCongeForm />
                        </div>
                    </div>
                </div>
            </div>
            <PdfTesterComponent />
        </div>
    )
}