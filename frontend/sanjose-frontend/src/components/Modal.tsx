import type { ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  children: ReactNode;
  onClose: () => void;
  title?: string;
};

export default function Modal({ children, onClose, title }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-slideUp overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">{title ?? ""}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition"
            aria-label="Cerrar"
          >
            <X size={18} className="text-slate-700" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
