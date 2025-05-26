import React from 'react'

type ButtonVariant = "default" | "outline" | "destructive" | "start";

type ButtonProps = {
    children: React.ReactNode,
    variant?: ButtonVariant,
    className ?: string,
    onClick?: () => void
};

const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
};

const Button = ({ children, variant = "default", className = "", onClick, ...props }: ButtonProps) => {

    const baseStyles = "px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none";

    const variants = {
        default: "bg-[#2272FF] text-white hover:bg-blue-700 focus:ring-blue-500",
        outline:
            "border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 focus:ring-gray-400",
        destructive:
            "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        start:
            "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    }

    return (
        <>
            <button onClick={onClick} className={classNames(baseStyles, variants[variant], className)} {...props}>
                {children}
            </button>
        </>
    )
}

export default Button