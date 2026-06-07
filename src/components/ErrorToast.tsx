import { useApp } from '../context/AppContext';

export function ErrorToast() {
  const { showErrorToast, errorMessage, hideError } = useApp();

  if (!showErrorToast) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-50 animate-slide-in"
      data-testid="error-toast"
    >
      <div className="bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md">
        <span className="text-2xl">❌</span>
        <div className="flex-1">
          <p className="font-bold">排班错误</p>
          <p className="text-sm text-red-100">{errorMessage}</p>
        </div>
        <button 
          onClick={hideError}
          className="p-1 hover:bg-red-600 rounded-lg transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
