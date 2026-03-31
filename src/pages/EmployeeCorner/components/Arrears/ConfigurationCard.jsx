import React from 'react';
import { Switch } from '@mui/material';

const ConfigurationCard = ({ toggles, setToggles, basicInfo, updateBasicInfo, newColumn, setNewColumn, addCustomColumn }) => {
    return (
        <div className="arrears-card">
            <div className="card-header">
                <span className="badge badge-purple">02</span>
                <h2 className="card-title">Configuration</h2>
            </div>
            <div className="card-body grid-3x2">
                <div className="input-group">
                    <label className="input-label">Auto-DA</label>
                    <div className="switch-container">
                        <span className="switch-label">Auto-DA {toggles.autoDAMaharashtra ? 'ON' : 'OFF'}</span>
                        <Switch 
                            size="small" 
                            checked={toggles.autoDAMaharashtra} 
                            onChange={e => setToggles(p => ({ ...p, autoDAMaharashtra: e.target.checked }))} 
                        />
                    </div>
                </div>
                <div className="input-group">
                    <label className="input-label">Auto-HRA</label>
                    <div className="switch-container">
                        <span className="switch-label">Auto-HRA {toggles.autoHRAMaharashtra ? 'ON' : 'OFF'}</span>
                        <Switch 
                            size="small" 
                            checked={toggles.autoHRAMaharashtra} 
                            onChange={e => setToggles(p => ({ ...p, autoHRAMaharashtra: e.target.checked }))} 
                            color="secondary" 
                        />
                    </div>
                </div>
                <div className="input-group">
                    <label className="input-label">Category</label>
                    <select 
                        className="input-field" 
                        value={basicInfo.category} 
                        onChange={e => updateBasicInfo('category', e.target.value)}
                    >
                        <option value="NPS">NPS</option>
                        <option value="GPF">GPF</option>
                    </select>
                </div>
                <div className="input-group">
                    <label className="input-label">City (HRA)</label>
                    <select 
                        className="input-field" 
                        value={basicInfo.cityCategory} 
                        onChange={e => updateBasicInfo('cityCategory', e.target.value)}
                    >
                        <option value="X">X (Metro)</option>
                        <option value="Y">Y (City)</option>
                        <option value="Z">Z (Rural)</option>
                    </select>
                </div>
                <div className="input-group">
                    <label className="input-label">Increment</label>
                    <select 
                        className="input-field" 
                        value={basicInfo.incrementMonth} 
                        onChange={e => updateBasicInfo('incrementMonth', e.target.value)}
                    >
                        <option value="No Increment">None</option>
                        <option value="January">January</option>
                        <option value="July">July</option>
                        <option value="Both">Both</option>
                    </select>
                </div>
                <div className="input-group">
                    <label className="input-label">Custom Col</label>
                    <div className="custom-col-group">
                        <input 
                            className="input-field" 
                            type="text" 
                            placeholder="Custom Col" 
                            value={newColumn.label} 
                            onChange={(e) => setNewColumn({ ...newColumn, label: e.target.value })} 
                        />
                        <button className="btn-add-col" onClick={addCustomColumn}>+</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigurationCard;
