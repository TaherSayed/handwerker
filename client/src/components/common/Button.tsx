import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    loading?: boolean;
    icon?: React.ReactNode;
}

const variants = {
    primary: 'bg-indigo-900 text-white hover:bg-indigo-800 shadow-lg shadow-indigo-900/20 active:scale-95 disabled:bg-indigo-300',
    secondary: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95 disabled:opacity-50',
    outline: 'bg-transparent border-2 border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600 active:scale-95 disabled:opacity-50',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-50 active:scale-95 disabled:opacity-50',
    danger: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white active:scale-95 disabled:opacity-50',
};

const sizes = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm',
    xl: 'px-10 py-5 text-base',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={`
        relative flex items-center justify-center gap-3 rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="opacity-0">{children}</span>
                </>
            ) : (
                <>
                    {icon && <span className="shrink-0">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
}
