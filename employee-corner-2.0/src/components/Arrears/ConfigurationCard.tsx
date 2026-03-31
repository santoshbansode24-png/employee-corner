"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ConfigurationProps {
    toggles: any;
    setToggles: any;
    basicInfo: any;
    updateBasicInfo: (key: string, val: any) => void;
    newColumn: any;
    setNewColumn: any;
    addCustomColumn: () => void;
}

const ConfigurationCard: React.FC<ConfigurationProps> = ({ toggles, setToggles, basicInfo, updateBasicInfo, newColumn, setNewColumn, addCustomColumn }) => {
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
                    <Label className="text-gray-600 font-semibold">Auto-DA</Label>
                    <div className="flex items-center space-x-3 bg-gray-50 border border-gray-200 p-2 rounded-md h-10 w-full">
                        <input 
                            type="checkbox" 
                            id="autoDA"
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded cursor-pointer" 
                            checked={toggles.autoDAMaharashtra} 
                            onChange={e => setToggles((p: any) => ({ ...p, autoDAMaharashtra: e.target.checked }))} 
                        />
                        <label htmlFor="autoDA" className="text-sm font-medium leading-none cursor-pointer">
                            Auto-DA {toggles.autoDAMaharashtra ? 'ON' : 'OFF'}
                        </label>
                    </div>
                </div>

                <div className="flex flex-col space-y-2">
                    <Label className="text-gray-600 font-semibold">Auto-HRA</Label>
                    <div className="flex items-center space-x-3 bg-gray-50 border border-gray-200 p-2 rounded-md h-10 w-full">
                        <input 
                            type="checkbox" 
                            id="autoHRA"
                            className="w-4 h-4 text-pink-600 focus:ring-pink-500 rounded cursor-pointer" 
                            checked={toggles.autoHRAMaharashtra} 
                            onChange={e => setToggles((p: any) => ({ ...p, autoHRAMaharashtra: e.target.checked }))} 
                        />
                        <label htmlFor="autoHRA" className="text-sm font-medium leading-none cursor-pointer">
                            Auto-HRA {toggles.autoHRAMaharashtra ? 'ON' : 'OFF'}
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">Category</Label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                        value={basicInfo.category} 
                        onChange={e => updateBasicInfo('category', e.target.value)}
                    >
                        <option value="NPS">NPS</option>
                        <option value="GPF">GPF</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">City (HRA)</Label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                        value={basicInfo.cityCategory} 
                        onChange={e => updateBasicInfo('cityCategory', e.target.value)}
                    >
                        <option value="X">X (Metro)</option>
                        <option value="Y">Y (City)</option>
                        <option value="Z">Z (Rural)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">Increment</Label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                        value={basicInfo.incrementMonth} 
                        onChange={e => updateBasicInfo('incrementMonth', e.target.value)}
                    >
                        <option value="No Increment">None</option>
                        <option value="January">January</option>
                        <option value="July">July</option>
                        <option value="Both">Both</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">Custom Col</Label>
                    <div className="flex gap-2">
                        <Input 
                            type="text" 
                            placeholder="Custom Col" 
                            value={newColumn.label} 
                            onChange={(e) => setNewColumn({ ...newColumn, label: e.target.value })} 
                            className="bg-gray-50 border-gray-200 focus:ring-purple-500"
                        />
                        <Button 
                            onClick={addCustomColumn}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4"
                        >
                            +
                        </Button>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};

export default ConfigurationCard;
