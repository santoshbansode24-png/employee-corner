"use client";

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ArrearsPDFDocument from './ArrearsPDFDocument';

interface ArrearsPDFDownloadButtonProps {
    basicInfo: any;
    customColumns: any[];
    results: any[];
}

const ArrearsPDFDownloadButton: React.FC<ArrearsPDFDownloadButtonProps> = ({
    basicInfo,
    customColumns,
    results
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    if (!results || results.length === 0) {
        return (
            <Button 
                size="lg" 
                disabled 
                className="w-full md:w-96 h-14 text-base font-bold bg-gray-200 text-gray-500 rounded-full cursor-not-allowed"
            >
                Enter Details to Generate PDF
            </Button>
        );
    }

    const handleDownload = async () => {
        if (isGenerating) return;
        try {
            setIsGenerating(true);
            const { pdf } = await import('@react-pdf/renderer');
            const blob = await pdf(
                <ArrearsPDFDocument 
                    basicInfo={basicInfo} 
                    customColumns={customColumns} 
                    results={results} 
                />
            ).toBlob();

            const fileName = `Arrears_Statement_${(basicInfo.empName || 'Employee').trim().replace(/\s+/g, '_')}.pdf`;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to generate Arrears PDF:', error);
            alert('Failed to generate PDF. Please check your entered values and try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button 
            size="lg" 
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full md:w-96 h-14 text-lg font-bold shadow-xl shadow-blue-500/25 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white flex items-center justify-center gap-3 rounded-full transition-all hover:scale-105 cursor-pointer disabled:opacity-80 disabled:cursor-wait"
        >
            {isGenerating ? (
                <>
                    <Loader2 size={22} className="animate-spin" />
                    Building PDF Document...
                </>
            ) : (
                <>
                    <Download size={22} />
                    Download Official PDF Statement
                </>
            )}
        </Button>
    );
};

export default React.memo(ArrearsPDFDownloadButton);
