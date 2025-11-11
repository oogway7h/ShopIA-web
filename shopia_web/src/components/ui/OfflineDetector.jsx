import { useEffect, useState } from 'react';
import ToastNotification from './ToastNotification';

export default function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      // Ya no se usa showOfflineToast, el banner cubre el aviso offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Banner persistente cuando está offline */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white px-4 py-3 shadow-lg">
          <div className="flex items-center justify-center gap-3">
            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
            </svg>
            <div className="text-center">
              <p className="font-semibold">Sin conexión a Internet</p>
              <p className="text-xs mt-1">Algunas funciones no estarán disponibles. Reconéctate lo antes posible.</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast cuando recupera conexión */}
      <ToastNotification
        open={showOnlineToast}
        message="✅ Conexión restaurada"
        color="green"
        onClose={() => setShowOnlineToast(false)}
        duration={3000}
      />
    </>
  );
}