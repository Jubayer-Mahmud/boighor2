"use client";

import React, { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

interface SuccessPopupProps {
  title: string;
  message?: string;
  subMessage?: string;
  onClose: () => void;
  /** Auto-dismiss after ms (default 4000, set 0 to disable) */
  autoClose?: number;
}

export default function SuccessPopup({
  title,
  message,
  subMessage,
  onClose,
  autoClose = 4000,
}: SuccessPopupProps) {
  useEffect(() => {
    if (!autoClose) return;
    const t = setTimeout(onClose, autoClose);
    return () => clearTimeout(t);
  }, [autoClose, onClose]);

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center animate-popIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} />
        </button>

        {/* Animated checkmark circle */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <CheckCircle size={48} className="text-green-500" strokeWidth={1.8} />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        {message && <p className="text-gray-600 text-sm mb-1">{message}</p>}
        {subMessage && <p className="text-gray-400 text-xs">{subMessage}</p>}

        {/* Progress bar */}
        {autoClose > 0 && (
          <div className="mt-6 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ animation: `shrink ${autoClose}ms linear forwards` }}
            />
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
        >
          OK
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.85) translateY(20px); }
          70%  { transform: scale(1.03) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease forwards; }
        .animate-popIn  { animation: popIn  0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>
    </div>
  );
}
