import React from "react";
import { NavLink } from "react-router-dom";

type ButtonVariant = "default";
type ButtonProps = {
    children: React.ReactNode;
    variant?: ButtonVariant;
    className?: string;
    enlace: string;
};

const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(" ");
};

const Enlace = ({
    children,
    variant = "default",
    className = "",
    enlace = "",
    ...props
}: ButtonProps) => {
    const baseStyles =
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        default: "bg-[#2272FF] text-white hover:bg-blue-700 focus:ring-blue-500",
    };

    return (
        <>
            <NavLink
                to={enlace}
                className={({ isActive }) =>
                    classNames(
                        baseStyles,
                        variants[variant],
                        className,
                        isActive ? "ring-2 ring-blue-500 ring-offset-2" : ""
                    )
                }
                {...props}
            >
                {children}
            </NavLink>
        </>
    );
};

export default Enlace;
