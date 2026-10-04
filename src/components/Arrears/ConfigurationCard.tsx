"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { Trash2 } from "lucide-react";

interface ConfigurationProps {
    toggles: any;
    setToggles: any;
    basicInfo: any;
    updateBasicInfo: (key: string, val: any) => void;
    newColumn: any;
    setNewColumn: any;
    addCustomColumn: () => void;
    customColumns?: any[];
    removeCustomColumn?: (id: string) => void;
}

const ConfigurationCard: React.FC<ConfigurationProps> = ({ 
    toggles, 
    setToggles, 
    basicInfo, 
    updateBasicInfo, 
    newColumn, 
    setNewColumn, 
    addCustomColumn,
    customColumns = [],
    removeCustomColumn
}) => {
    return (
        <Card className="shadow-lg border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b pb-4">
                <div className="flex items-center gap-2">
                    <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">02</span>
                    <CardTitle className="text-xl text-purple-900">Configuration</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col space-y-2">
                    <Label className="text-gray-600 font-semibold">Auto-DA (Maharashtra)</Label>
                    <div className="flex items-center space-x-3 bg-gray-50 border border-gray-200 p-2 rounded-md h-10 w-full">
                        <input 
                            type="checkbox" 
                            id="autoDA"
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded cursor-pointer" 
                            checked={toggles.autoDAMaharashtra} 
                            onChange={e => setToggles((p: any) => ({ ...p, autoDAMaharashtra: e.target.checked }))} 
                        />
                        <label htmlFor="autoDA" className="text-sm font-medium leading-none cursor-pointer">
                            Auto-DA {toggles.autoDAMaharashtra ? 'ON (Active)' : 'OFF (Manual)'}
                        </label>
                    </div>
                </div>

                <div className="flex flex-col space-y-2">
                    <Label className="text-gray-600 font-semibold">Auto-HRA (Maharashtra)</Label>
                    <div className="flex items-center space-x-3 bg-gray-50 border border-gray-200 p-2 rounded-md h-10 w-full">
                        <input 
                            type="checkbox" 
                            id="autoHRA"
                            className="w-4 h-4 text-pink-600 focus:ring-pink-500 rounded cursor-pointer" 
                            checked={toggles.autoHRAMaharashtra} 
                            onChange={e => setToggles((p: any) => ({ ...p, autoHRAMaharashtra: e.target.checked }))} 
                        />
                        <label htmlFor="autoHRA" className="text-sm font-medium leading-none cursor-pointer">
                            Auto-HRA {toggles.autoHRAMaharashtra ? 'ON (Active)' : 'OFF (Manual)'}
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">Pension Scheme</Label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                        value={basicInfo.category} 
                        onChange={e => updateBasicInfo('category', e.target.value)}
                    >
                        <option value="NPS">NPS / DCPS (10% Employee + 14% Govt)</option>
                        <option value="GPF">GPF (Old Pension Scheme)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">City Category (HRA Classification)</Label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium" 
                        value={basicInfo.cityCategory} 
                        onChange={e => updateBasicInfo('cityCategory', e.target.value)}
                    >
                        <option value="X">X - Metro (Mumbai, Pune, Thane) — 30% HRA (Min ₹5,400)</option>
                        <option value="Y">Y - Major Cities (Nagpur, Nashik, Sambhajinagar, etc.) — 20% HRA (Min ₹3,600)</option>
                        <option value="Z">Z - Other Cities & Rural (Latur, Akola, Ahilyanagar, etc.) — 10% HRA (Min ₹1,800)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">Annual Increment Month</Label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                        value={basicInfo.incrementMonth} 
                        onChange={e => updateBasicInfo('incrementMonth', e.target.value)}
                    >
                        <option value="No Increment">None</option>
                        <option value="January">January (1st Jan)</option>
                        <option value="July">July (1st July)</option>
                        <option value="Both">Both (Jan & July)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">Add Custom Allowance / Deduction</Label>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Input 
                                type="text" 
                                placeholder="Col Name (e.g. CLA, NPA)" 
                                value={newColumn.label} 
                                onChange={(e) => setNewColumn({ ...newColumn, label: e.target.value })} 
                                className="bg-gray-50 border-gray-200 focus:ring-purple-500 flex-1"
                            />
                            <select
                                className="h-10 rounded-md border border-gray-200 bg-gray-50 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={newColumn.type}
                                onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
                            >
                                <option value="manual">Manual ₹</option>
                                <option value="basic_percent">% of Basic</option>
                                <option value="basic_da_percent">% of (Basic+DA)</option>
                            </select>
                            {newColumn.type !== 'manual' && (
                                <Input
                                    type="number"
                                    placeholder="%"
                                    value={newColumn.percent || ''}
                                    onChange={(e) => setNewColumn({ ...newColumn, percent: parseFloat(e.target.value) || 0 })}
                                    className="w-16 bg-gray-50 border-gray-200"
                                />
                            )}
                            <Button 
                                type="button"
                                onClick={addCustomColumn}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3"
                            >
                                +
                            </Button>
                        </div>
                    </div>
                </div>

                {customColumns.length > 0 && (
                    <div className="md:col-span-2 pt-2 border-t border-purple-100">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Active Custom Columns:</Label>
                        <div className="flex flex-wrap gap-2">
                            {customColumns.map(col => (
                                <span 
                                    key={col.id} 
                                    className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                                >
                                    <span>{col.label}</span>
                                    <span className="text-[10px] text-purple-500">
                                        ({col.type === 'manual' ? 'Manual ₹' : `${col.percent}%`})
                                    </span>
                                    {removeCustomColumn && (
                                        <button 
                                            type="button"
                                            onClick={() => removeCustomColumn(col.id)}
                                            className="text-purple-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                                            title="Remove column"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    );
};

export default ConfigurationCard;
