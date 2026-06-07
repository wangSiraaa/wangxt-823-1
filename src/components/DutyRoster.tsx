import { useDrop } from 'react-dnd';
import { useApp } from '../context/AppContext';
import { shiftTypes, hotlines, counselors, getWeekDates } from '../data/fixtures';
import { canAddCounselorToShift } from '../utils/validation';
import type { ShiftAssignment, ShiftStatus } from '../types';

const statusConfig: Record<ShiftStatus, { label: string; color: string; bgColor: string }> = {
  normal: { label: '正常', color: 'text-green-700', bgColor: 'bg-green-100' },
  abnormal: { label: '异常', color: 'text-red-700', bgColor: 'bg-red-100' },
  resolved: { label: '已处理', color: 'text-blue-700', bgColor: 'bg-blue-100' },
};

interface ShiftSlotProps {
  date: string;
  shiftTypeId: string;
  hotlineId: string;
  assignment?: ShiftAssignment;
  onDrop: (counselorId: string) => void;
  onClick: () => void;
}

function ShiftSlot({ date, shiftTypeId, hotlineId, assignment, onDrop, onClick }: ShiftSlotProps) {
  const { canEditSchedule, showError } = useApp();
  const shiftType = shiftTypes.find(s => s.id === shiftTypeId);
  const hotline = hotlines.find(h => h.id === hotlineId);
  const assignedCounselors = assignment 
    ? counselors.filter(c => assignment.counselorIds.includes(c.id))
    : [];
  const status = assignment?.status || 'normal';
  const statusInfo = statusConfig[status];

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'COUNSELOR',
    canDrop: () => {
      if (!canEditSchedule()) return false;
      return true;
    },
    drop: (item: { id: string; type: string }) => {
      const result = canAddCounselorToShift(
        item.id,
        date,
        shiftTypeId,
        hotlineId,
        assignment?.counselorIds || [],
        []
      );
      if (!result.valid && result.error) {
        const detail = result.error.detail ? ` - ${result.error.detail}` : '';
        showError(result.error.message + detail);
        return;
      }
      onDrop(item.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [date, shiftTypeId, hotlineId, assignment, canEditSchedule, showError]);

  const getBorderStyle = () => {
    if (status === 'abnormal') return 'border-red-400 border-2';
    if (status === 'resolved') return 'border-blue-400 border-2';
    if (isOver && canDrop) return 'border-blue-400 bg-blue-50';
    if (isOver && !canDrop) return 'border-red-400 bg-red-50';
    if (canDrop && canEditSchedule()) return 'border-blue-300 border-dashed';
    return 'border-gray-200';
  };

  return (
    <div
      ref={drop}
      onClick={onClick}
      className={`min-h-24 p-2 rounded-xl border-2 cursor-pointer transition-all duration-200 ${getBorderStyle()} ${
        assignment?.counselorIds.length ? 'bg-white' : 'bg-gray-50'
      } hover:shadow-md`}
      data-testid={`shift-slot-${date}-${shiftTypeId}-${hotlineId}`}
      data-date={date}
      data-shift-type={shiftTypeId}
      data-hotline={hotlineId}
      data-status={status}
    >
      <div className="flex items-center justify-between mb-1">
        <span 
          className="text-xs px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: hotline?.color }}
        >
          {hotline?.name}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
        {shiftType?.isNightShift && (
          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
            🌙 夜班
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        {assignedCounselors.map(c => {
          const hasQual = c.qualifications.includes(hotline?.requiredQualification || '');
          return (
            <div 
              key={c.id} 
              className={`flex items-center gap-1 text-sm rounded-lg px-2 py-1 ${
                hasQual ? 'bg-gray-100' : 'bg-red-100 border border-red-300'
              }`}
            >
              <span>{c.avatar}</span>
              <span className={`truncate ${hasQual ? '' : 'text-red-700'}`}>{c.name}</span>
              {!hasQual && <span className="text-red-500" title="资质不匹配">⚠️</span>}
            </div>
          );
        })}
        {assignedCounselors.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">
            {canEditSchedule() ? '拖拽排班' : '暂无排班'}
          </p>
        )}
      </div>

      {shiftType?.isNightShift && assignedCounselors.length < 2 && (
        <p className="text-xs text-red-500 mt-1 text-center">
          ⚠️ 还需 {2 - assignedCounselors.length} 人
        </p>
      )}
    </div>
  );
}

interface DutyRosterProps {
  onSlotClick: (assignment: ShiftAssignment | null, date: string, shiftTypeId: string, hotlineId: string) => void;
}

export function DutyRoster({ onSlotClick }: DutyRosterProps) {
  const { selectedDate, assignments, addCounselorToAssignment, createAssignment, canEditSchedule, savePreferences } = useApp();
  const weekDates = getWeekDates();

  const getAssignment = (date: string, shiftTypeId: string, hotlineId: string) => {
    return assignments.find(
      a => a.date === date && a.shiftTypeId === shiftTypeId && a.hotlineId === hotlineId
    );
  };

  const handleDrop = (date: string, shiftTypeId: string, hotlineId: string, counselorId: string) => {
    if (!canEditSchedule()) return;
    
    let assignment = getAssignment(date, shiftTypeId, hotlineId);
    let assignmentId = assignment?.id;
    
    if (!assignment) {
      assignmentId = createAssignment(date, shiftTypeId, hotlineId);
    }
    
    if (assignmentId) {
      addCounselorToAssignment(assignmentId, counselorId);
    }
  };

  const handleSlotClick = (date: string, shiftTypeId: string, hotlineId: string) => {
    const assignment = getAssignment(date, shiftTypeId, hotlineId);
    savePreferences({ selectedDate: date });
    if (assignment) {
      onSlotClick(assignment, date, shiftTypeId, hotlineId);
    } else if (canEditSchedule()) {
      const newId = createAssignment(date, shiftTypeId, hotlineId);
      const newAssignment = {
        id: newId,
        date,
        shiftTypeId,
        hotlineId,
        counselorIds: [],
        status: 'normal' as const,
      };
      onSlotClick(newAssignment, date, shiftTypeId, hotlineId);
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return {
      day: date.getDate(),
      weekDay: weekDays[date.getDay()],
      isToday: dateStr === selectedDate,
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">📅 本周值班表</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
            <span className="text-gray-600">正常</span>
            <span className="w-3 h-3 rounded-full bg-red-400 ml-2"></span>
            <span className="text-gray-600">异常</span>
            <span className="w-3 h-3 rounded-full bg-blue-400 ml-2"></span>
            <span className="text-gray-600">已处理</span>
          </div>
          <div className="flex items-center gap-2">
            {weekDates.map(date => {
              const { day, weekDay, isToday } = formatDateLabel(date);
              return (
                <div
                  key={date}
                  onClick={() => savePreferences({ selectedDate: date })}
                  className={`text-center px-3 py-2 rounded-xl cursor-pointer transition-all ${
                    isToday 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <p className="text-lg font-bold">{day}</p>
                  <p className="text-xs">{weekDay}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-left text-gray-500 font-medium w-24">班次</th>
              {weekDates.map(date => {
                const { isToday } = formatDateLabel(date);
                return (
                  <th 
                    key={date} 
                    className={`p-2 text-center font-medium min-w-32 ${
                      isToday ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {date.slice(5)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shiftTypes.map(shiftType => (
              <tr key={shiftType.id}>
                <td className="p-2">
                  <div className={`p-2 rounded-xl text-center ${
                    shiftType.isNightShift ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <p className="font-bold">{shiftType.name}</p>
                    <p className="text-xs">{shiftType.startTime}-{shiftType.endTime}</p>
                    {shiftType.isNightShift && (
                      <p className="text-xs text-red-500">需{shiftType.requiredCounselors}人</p>
                    )}
                  </div>
                </td>
                {weekDates.map(date => (
                  <td key={`${shiftType.id}-${date}`} className="p-2 align-top">
                    <div className="space-y-2">
                      {hotlines.map(hotline => {
                        const assignment = getAssignment(date, shiftType.id, hotline.id);
                        return (
                          <ShiftSlot
                            key={hotline.id}
                            date={date}
                            shiftTypeId={shiftType.id}
                            hotlineId={hotline.id}
                            assignment={assignment}
                            onDrop={(counselorId) => handleDrop(date, shiftType.id, hotline.id, counselorId)}
                            onClick={() => handleSlotClick(date, shiftType.id, hotline.id)}
                          />
                        );
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
