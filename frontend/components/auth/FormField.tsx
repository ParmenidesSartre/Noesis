import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  helperText?: string;
  error?: string;
}

export function FormField({ label, id, helperText, error, className = '', ...inputProps }: FormFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </Label>
      )}
      <Input
        id={id}
        className={`h-11 px-4 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 ${className}`}
        {...inputProps}
      />
      {helperText && !error && (
        <p className="text-xs text-slate-500 font-medium">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  );
}
