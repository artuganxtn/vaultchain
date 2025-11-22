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
        className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
      <div 
        className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-green-400/20 rounded-2xl shadow-2xl w-full flex flex-col max-h-[90vh] transform transition-all duration-300 ${sizeClasses[size]}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
            <div className="relative text-center p-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                <button 
                    onClick={onClose} 
                    className="absolute top-1/2 -translate-y-1/2 right-4 rtl:right-auto rtl:left-4 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Close modal"
                >
                    <CloseIcon />
                </button>
            </div>
        )}
        <div className="p-6 overflow-y-auto">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;