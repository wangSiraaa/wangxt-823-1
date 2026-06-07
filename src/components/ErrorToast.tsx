import { useApp } from '../context/AppContext';

export function ErrorToast() {
  const { showErrorToast, errorMessage, errors, hideError } = useApp();

  if (!showErrorToast) return null;

  const currentError = errors.length > 0 ? errors[0] : null;
  const errorTypeIcon = {
    qualification: '🎓',
    night_shift: '🌙',
    conflict: '⚠️',
  };

  const errorTypeLabel = {
    qualification: '资质不匹配',
    night_shift: '夜班人数不足',
    conflict: '排班冲突',
  };

  const getIcon = () => {
    if (!currentError) return '❌';
    return errorTypeIcon[currentError.type] || '❌';
  };

  const getLabel = () => {
    if (!currentError) return '排班错误';
    return errorTypeLabel[currentError.type] || '排班错误';
  };

  return (
    <div 
      className="fixed top-4 right-4 z-50 animate-slide-in"
      data-testid="error-toast"
    >
      <div className="bg-white border-2 border-red-400 shadow-2xl rounded-2xl overflow-hidden max-w-md">
        <div className="bg-red-500 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getIcon()}</span>
            <span className="font-bold">{getLabel()}</span>
          </div>
          <button 
            onClick={hideError}
            className="p-1 hover:bg-red-600 rounded-lg transition-colors text-white"
            data-testid="error-toast-close"
          >
            ✕
          </button>
        </div>
        
        <div className="p-5 bg-red-50">
          <p className="font-bold text-red-800 text-base mb-2">
            {errorMessage}
          </p>
          
          {currentError?.detail && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-red-200">
              <p className="text-sm text-red-700">
                <span className="font-medium">详情：</span>
                {currentError.detail}
              </p>
            </div>
          )}

          {currentError?.type === 'qualification' && currentError.requiredQualificationName && (
            <div className="mt-3 flex items-start gap-2">
              <span className="text-red-500">💡</span>
              <p className="text-xs text-red-600">
                请选择具备「{currentError.requiredQualificationName}」资质的咨询师
              </p>
            </div>
          )}

          {currentError?.type === 'night_shift' && (
            <div className="mt-3 flex items-start gap-2">
              <span className="text-red-500">💡</span>
              <p className="text-xs text-red-600">
                夜班为保障安全必须双人值守，请补充人员
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
