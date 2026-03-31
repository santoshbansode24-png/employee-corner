import React from 'react';
import { AccountBalance, TrendingDown } from '@mui/icons-material';

const DueDrawnCard = ({ 
    type, 
    title, 
    subtitle, 
    components, 
    updateComponent, 
    toggles, 
    customColumns, 
    addPeriod,
    renderComponentInputs
}) => {
    const isDue = type === 'due';
    const Icon = isDue ? AccountBalance : TrendingDown;
    const cardClass = isDue ? 'due-card' : 'drawn-card';
    const inputClass = isDue ? 'due-input' : 'drawn-input';
    const btnClass = isDue ? 'btn-blue' : 'btn-orange';

    return (
        <div className={`arrears-card ${cardClass}`}>
            <div className="card-header">
                <div className="header-title-container">
                    <Icon fontSize="small" />
                    <h2 className="header-title">{title}</h2>
                </div>
                <p className="header-subtitle">{subtitle}</p>
            </div>
            <div className="card-body vertical-stack">
                {renderComponentInputs(type, 'pay', 'Basic Pay', inputClass)}
                {renderComponentInputs(type, 'daRate', `DA Rate ${toggles.autoDAMaharashtra ? '(Auto)' : ''}`, inputClass)}
                {renderComponentInputs(type, 'hraRate', `HRA Rate ${toggles.autoHRAMaharashtra ? '(Auto)' : ''}`, inputClass)}
                {renderComponentInputs(type, 'ta', 'Transport Allowance', inputClass)}
                {customColumns.map(col => renderComponentInputs(type, col.id, col.label, inputClass))}
            </div>
            <div className="card-footer">
                <button 
                    className={`btn-add-period ${btnClass}`} 
                    onClick={addPeriod}
                >
                    PROMOTION / TIMEBOUND DETAILS [+ Add Period]
                </button>
            </div>
        </div>
    );
};

export default DueDrawnCard;
