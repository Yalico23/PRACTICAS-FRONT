import React from 'react';

type OpcionProps = {
  children?: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
}

export const Opcion = ({ children, isSelected = false, onClick }: OpcionProps) => {
  return (
    <div 
      className={`p-2 m-2 mb-2 rounded-xl cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-slate-500 text-white' 
          : 'bg-slate-300 hover:bg-slate-400 focus:bg-slate-400'
      }`}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {children}
    </div>
  )
}