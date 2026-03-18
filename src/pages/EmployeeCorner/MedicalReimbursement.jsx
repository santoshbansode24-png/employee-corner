import React from 'react'
import MedicalCalculation from './MedicalCalculation'

function MedicalReimbursement() {
    return (
        <div className="w-full animate-fade-in">
            <div className="card p-0 overflow-hidden bg-white">
                <MedicalCalculation />
            </div>
        </div>
    )
}

export default MedicalReimbursement
