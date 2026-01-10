import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    loading?: boolean;
    icon?: React.ReactNode;
}

const variants = {
    primary: 'btn-primary',
    secondary: 'bg-white dark:bg-[#252525] text-steel-700 dark:text-[#d4d4d4] hover:bg-neutral-50 dark:hover:bg-[#2a2a2a] border border-neutral-300 dark:border-[rgba(255,255,255,0.12)] shadow-[0_2px_4px_0_rgba(0,0,0,0.08)] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.12)] active:scale-[0.97] disabled:opacity-50',
    outline: 'bg-transparent border-2 border-primary-500 dark:border-primary-400 text-primary-500 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 active:scale-[0.97] disabled:opacity-50',
    ghost: 'bg-transparent text-steel-500 dark:text-[#a3a3a3] hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] active:scale-[0.97] disabled:opacity-50',
    danger: 'bg-danger-500 hover:bg-danger-600 text-white shadow-[0_2px_4px_0_rgba(220,53,69,0.2)] hover:shadow-[0_4px_8px_0_rgba(220,53,69,0.3)] active:scale-[0.97] disabled:opacity-50',
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
        relative flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200
        min-h-[44px]
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            onMouseDown={(e) => {
                const target = e.currentTarget;
                if (!disabled && !loading && target && target.classList) {
                    target.classList.add('animate-mechanical-press');
                    setTimeout(() => {
                        if (target && target.classList) {
                            target.classList.remove('animate-mechanical-press');
                        }
                    }, 100);
                }
            }}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-loading-circle" />
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
