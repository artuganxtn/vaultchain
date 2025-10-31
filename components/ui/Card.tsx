
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white/70 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/80 dark:border-green-400/20 rounded-2xl p-6 shadow-md dark:shadow-lg dark:shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;