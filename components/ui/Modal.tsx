import React from 'react';
import { CloseIcon } from './Icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
    size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
      <div 
        className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-green-400/20 rounded-2xl p-6 shadow-2xl w-full relative transform transition-all duration-300 ${sizeClasses[size]}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300 dark:border-gray-700">
            <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <button 
                onClick={onClose} 
                className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
            >
                <CloseIcon />
            </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
