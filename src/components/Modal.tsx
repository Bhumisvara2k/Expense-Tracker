import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-cyber-dark/80 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />
        <div className="relative glass-panel rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-cyber-cyan to-cyber-magenta bg-clip-text text-transparent">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors group"
            >
              <X size={20} className="text-gray-400 group-hover:text-white" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
