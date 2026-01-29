import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
      <AlertCircle className="text-rose-600 flex-shrink-0 mt-0.5" size={18} />
      <p className="text-sm text-rose-800 font-medium">{message}</p>
    </div>
  );
}
