import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rectangular' | 'circular';
    width?: string | number;
    height?: string | number;
}

export default function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
    const baseClasses = "animate-pulse bg-slate-200 dark:bg-slate-700 rounded";

    let variantClasses = "";
    if (variant === 'circular') {
        variantClasses = "rounded-full";
    } else if (variant === 'text') {
        variantClasses = "rounded h-4 w-full";
    }

    const style: React.CSSProperties = {};
    if (width) style.width = width;
    if (height) style.height = height;

    return (
        <div
            className={`${baseClasses} ${variantClasses} ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
}
