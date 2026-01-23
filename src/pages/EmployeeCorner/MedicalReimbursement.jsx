import React, { useState } from 'react'
import MedicalCalculation from './MedicalCalculation'

function MedicalReimbursement() {
    const [activeTab, setActiveTab] = useState('generate')

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
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MedicalReimbursement
