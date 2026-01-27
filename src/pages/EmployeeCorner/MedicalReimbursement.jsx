import React, { useState } from 'react'
import MedicalCalculation from './MedicalCalculation'

function MedicalReimbursement() {
    const [activeTab, setActiveTab] = useState('generate')
    const [isLoading, setIsLoading] = useState(true)

    const handleLoad = () => {
        setIsLoading(false)
    }

    return (
        <div className="w-full animate-fade-in">
            <div className="card p-0 overflow-hidden bg-white">
                {/* Header removed as per request */}


                {/* Content */}
                <div className="w-full relative">
                    <div className="w-full">
                        <iframe
                            src="/reimbursement-gen/?embed=true"
                            title="Medical Reimbursement Form"
                            width="100%"
                            height="1200px"
                            style={{ border: 'none', display: 'block', width: '100%', height: '1200px' }}
                            allow="camera; microphone; geolocation; clipboard-read; clipboard-write; display-capture"
                            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-downloads allow-modals allow-top-navigation"
                            onLoad={handleLoad}
                        />
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-600 font-medium">Initializing Secure Server...</p>
                                <p className="text-gray-400 text-sm mt-2">This may take a moment on first load.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MedicalReimbursement
