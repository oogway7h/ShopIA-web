import React, { useEffect } from "react";

export default function ToastNotification({ open, message, onClose, duration = 3000, color = 'red' }) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;
  const bgColor = color === 'green' ? 'bg-green-600' : 'bg-red-600';
  return (
    <div className="fixed right-6 top-5 z-[100]">
      <div className={`${bgColor} text-white px-4 py-3 rounded shadow-lg flex items-center min-w-[200px] animate-fade-in`}>
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-1.414 1.414M6.343 17.657l-1.414-1.414M5.636 5.636l1.414 1.414M17.657 17.657l1.414-1.414M12 8v4m0 4h.01" />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
}