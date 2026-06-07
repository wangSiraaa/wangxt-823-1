import { useApp } from '../context/AppContext';
import { counselors, shiftTypes, hotlines, qualifications } from '../data/fixtures';
import { checkNightShiftRequirement } from '../utils/validation';
import type { ShiftStatus } from '../types';

const statusConfig: Record<ShiftStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  normal: { label: '正常', color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
  abnormal: { label: '异常', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
  resolved: { label: '已处理', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
};

export function ShiftDetailPanel() {
  const { selectedAssignment, setSelectedAssignment, removeCounselorFromAssignment, updateAssignmentStatus, canEditSchedule } = useApp();

  if (!selectedAssignment) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">班次详情</h3>
        <p className="text-gray-500">点击左侧值班表中的班次查看详细信息</p>
      </div>
    );
  }

  const shiftType = shiftTypes.find(s => s.id === selectedAssignment.shiftTypeId);
  const hotline = hotlines.find(h => h.id === selectedAssignment.hotlineId);
  const assignedCounselors = counselors.filter(c => 
    selectedAssignment.counselorIds.includes(c.id)
  );
  const requiredQual = qualifications.find(q => q.id === hotline?.requiredQualification);
  const status = selectedAssignment.status || 'normal';
  const statusInfo = statusConfig[status];
  
  const nightShiftError = checkNightShiftRequirement(
    selectedAssignment.shiftTypeId,
    selectedAssignment.counselorIds
  );

  const handleRemoveCounselor = (counselorId: string) => {
    if (canEditSchedule()) {
      removeCounselorFromAssignment(selectedAssignment.id, counselorId);
    }
  };

  const handleStatusChange = (newStatus: ShiftStatus) => {
    if (canEditSchedule()) {
      updateAssignmentStatus(selectedAssignment.id, newStatus);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden" data-testid="shift-detail-panel">
      <div 
        className="p-6 text-white"
        style={{ backgroundColor: hotline?.color || '#3B82F6' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">{hotline?.name}</h3>
            <p className="text-white/80">{shiftType?.name} · {selectedAssignment.date}</p>
          </div>
          <button
            onClick={() => setSelectedAssignment(null)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="mt-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
            状态：{statusInfo.label}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {canEditSchedule() && (
          <div>
            <h4 className="font-bold text-gray-700 mb-3">🔄 状态管理</h4>
            <div className="flex gap-2">
              {(['normal', 'abnormal', 'resolved'] as ShiftStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    status === s
                      ? `${statusConfig[s].bgColor} ${statusConfig[s].color} ${statusConfig[s].borderColor} border-2`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-bold text-gray-700 mb-3">⏰ 班次时间</h4>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-lg font-medium text-gray-800">
              {shiftType?.startTime} - {shiftType?.endTime}
            </p>
            {shiftType?.isNightShift && (
              <div className="mt-2 flex items-center gap-2">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  🌙 夜班
                </span>
                <span className="text-sm text-red-600">
                  需 {shiftType.requiredCounselors} 人值守
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-gray-700 mb-3">📜 资质要求</h4>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-blue-800 font-medium">{requiredQual?.name}</p>
            <p className="text-sm text-blue-600 mt-1">{requiredQual?.description}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-700">
              👥 已排班咨询师 ({assignedCounselors.length}/{shiftType?.requiredCounselors || '∞'})
            </h4>
          </div>

          {nightShiftError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium">
                ⚠️ {nightShiftError.message}
              </p>
              {nightShiftError.detail && (
                <p className="text-red-600 text-xs mt-1">{nightShiftError.detail}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            {assignedCounselors.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>暂无排班</p>
                <p className="text-sm mt-1">从左侧拖拽咨询师到此班次</p>
              </div>
            ) : (
              assignedCounselors.map(counselor => {
                const hasRequiredQual = counselor.qualifications.includes(hotline?.requiredQualification || '');
                const counselorQualNames = counselor.qualifications
                  .map(qId => qualifications.find(q => q.id === qId)?.name)
                  .filter(Boolean);
                return (
                  <div
                    key={counselor.id}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 ${
                      hasRequiredQual 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{counselor.avatar}</span>
                      <div>
                        <p className="font-medium text-gray-800">{counselor.name}</p>
                        {!hasRequiredQual ? (
                          <div>
                            <p className="text-xs text-red-600 font-medium">⚠️ 资质不匹配</p>
                            <p className="text-xs text-red-500">
                              需要：{requiredQual?.name} | 现有：{counselorQualNames.join('、') || '无'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-green-600">✓ 资质符合</p>
                        )}
                      </div>
                    </div>
                    {canEditSchedule() && (
                      <button
                        onClick={() => handleRemoveCounselor(counselor.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {canEditSchedule() && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center">
              💡 从左侧咨询师列表拖拽人员到班次进行排班
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
