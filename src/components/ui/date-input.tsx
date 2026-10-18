"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value?: string;
    onChange?: (e: any) => void;
    className?: string;
}

// Convert YYYY-MM-DD or YYYY-MM to DD/MM/YYYY
function isoToDDMMYYYY(val?: string): string {
    if (!val) return '';
    const trimmed = val.trim();
    const parts = trimmed.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    if (parts.length === 2 && parts[0].length === 4) {
        return `01/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    // If already in DD/MM/YYYY
    if (trimmed.includes('/') && trimmed.length === 10) {
        return trimmed;
    }
    return trimmed;
}

// Convert DD/MM/YYYY to YYYY-MM-DD
function ddmmyyyyToIso(dmyStr: string): string | null {
    if (!dmyStr || dmyStr.length !== 10) return null;
    const parts = dmyStr.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (month < 1 || month > 12) return null;
    if (year < 1900 || year > 2100) return null;

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) return null;

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Format input text smoothly into DD/MM/YYYY with auto-slashes
function formatToDDMMYYYY(rawInput: string, prevValue: string = ''): string {
    const isDeleting = rawInput.length < prevValue.length;
    const digits = rawInput.replace(/\D/g, '').slice(0, 8);

    if (isDeleting) {
        if (digits.length <= 2) return digits;
        if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }

    if (digits.length === 0) return '';
    if (digits.length === 1) return digits;
    if (digits.length === 2) return `${digits}/`;
    if (digits.length === 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    if (digits.length === 4) return `${digits.slice(0, 2)}/${digits.slice(2)}/`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(({
    value = '',
    onChange,
    name,
    placeholder = 'DD/MM/YYYY',
    className,
    disabled,
    required,
    ...props
}, ref) => {
    const [textValue, setTextValue] = useState<string>(() => isoToDDMMYYYY(value));
    const hiddenDateInputRef = useRef<HTMLInputElement>(null);

    // Sync external value changes
    useEffect(() => {
        setTextValue(isoToDDMMYYYY(value));
    }, [value]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const formatted = formatToDDMMYYYY(raw, textValue);
        setTextValue(formatted);

        if (formatted.length === 10) {
            const iso = ddmmyyyyToIso(formatted);
            if (iso && onChange) {
                onChange({ target: { name, value: iso } });
            }
        } else if (formatted.length === 0) {
            if (onChange) {
                onChange({ target: { name, value: '' } });
            }
        }
    };

    const handleBlur = () => {
        // If incomplete date is left on blur, revert to valid value or clear
        if (textValue.length > 0 && textValue.length < 10) {
            setTextValue(isoToDDMMYYYY(value));
        }
    };

    const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pickedIso = e.target.value; // YYYY-MM-DD
        if (pickedIso) {
            setTextValue(isoToDDMMYYYY(pickedIso));
            if (onChange) {
                onChange({ target: { name, value: pickedIso } });
            }
        }
    };

    const openCalendarPicker = () => {
        if (disabled) return;
        if (hiddenDateInputRef.current) {
            try {
                if ('showPicker' in HTMLInputElement.prototype) {
                    hiddenDateInputRef.current.showPicker();
                } else {
                    hiddenDateInputRef.current.focus();
                    hiddenDateInputRef.current.click();
                }
            } catch {
                hiddenDateInputRef.current.focus();
                hiddenDateInputRef.current.click();
            }
        }
    };

    // Calculate ISO representation for the hidden picker
    const currentIso = ddmmyyyyToIso(textValue) || (value?.length === 10 ? value : '');

    return (
        <div className="relative flex items-center w-full">
            <input
                ref={ref}
                type="text"
                inputMode="numeric"
                name={name}
                value={textValue}
                onChange={handleTextChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                maxLength={10}
                className={cn(
                    "w-full rounded-md border border-input bg-transparent px-3 py-1 pr-9 text-base md:text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            />

            <button
                type="button"
                onClick={openCalendarPicker}
                disabled={disabled}
                tabIndex={-1}
                aria-label="Pick date from calendar"
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
                <CalendarIcon size={16} />
            </button>

            {/* Hidden native date input to show calendar dialog */}
            <input
                ref={hiddenDateInputRef}
                type="date"
                tabIndex={-1}
                value={currentIso}
                onChange={handleNativePickerChange}
                disabled={disabled}
                className="sr-only pointer-events-none absolute bottom-0 left-0 h-0 w-0 opacity-0"
                aria-hidden="true"
            />
        </div>
    );
});

DateInput.displayName = 'DateInput';
export default DateInput;
