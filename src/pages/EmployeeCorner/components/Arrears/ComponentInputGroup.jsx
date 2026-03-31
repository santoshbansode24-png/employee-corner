import React from 'react';

const ComponentInputGroup = ({ type, compKey, label, inputClass, components, updateComponent }) => {
    const isDue = type === 'due';
    const comps = components[compKey] || [];

    return (
        <React.Fragment>
            {comps.map((item, idx) => (
                <div key={idx} className={`input-group ${inputClass}`} style={{ marginBottom: idx < comps.length - 1 ? '10px' : '0' }}>
                    <label className="input-label">{label}</label>
                    <span className="currency-icon">₹</span>
                    <input
                        type="number"
                        className="input-field"
                        placeholder="0"
                        value={item.amount}
                        onChange={(e) => updateComponent(type, compKey, idx, 'amount', e.target.value)}
                    />
                </div>
            ))}
        </React.Fragment>
    );
};

export default ComponentInputGroup;
