import { useDrop } from 'react-dnd';
import { useApp } from '../context/AppContext';
import { shiftTypes, hotlines, counselors, getWeekDates } from '../data/fixtures';
import { canAddCounselorToShift } from '../utils/validation';
import type { ShiftAssignment } from '../types';

interface ShiftSlotProps {
  date: string;
  shiftTypeId: string;
  hotlineId: string;
  assignment?: ShiftAssignment;
  onDrop: (counselorId: string) => void;
  onClick: () => void;
}

function ShiftSlot({ date, shiftTypeId, hotlineId, assignment, onDrop, onClick }: ShiftSlotProps) {
  const { canEditSchedule } = useApp();
  const shiftType = shiftTypes.find(s => s.id === shiftTypeId);
  const hotline = hotlines.find(h => h.id === hotlineId);
  const assignedCounselors = assignment 
    ? counselors.filter(c => assignment.counselorIds.includes(c.id))
    : [];

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'COUNSELOR',
    canDrop: (item: { id: string; type: string }) => {
      if (!canEditSchedule()) return false;
      const result = canAddCounselorToShift(
        item.id,
        date,
        shiftTypeId,
        hotlineId,
        assignment?.counselorIds || [],
        []
      );
      return result.valid;
    },
    drop: (item: { id: string; type: string }) => {
      onDrop(item.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [date, shiftTypeId, hotlineId, assignment, canEditSchedule]);

  const getBorderStyle = () => {
    if (isOver && canDrop) return 'border-green-400 bg-green-50';
    if (isOver && !canDrop) return 'border-red-400 bg-red-50';
    if (canDrop) return 'border-blue-300 border-dashed';
    return 'border-gray-200';
  };

  return (
    <div
      ref={drop}
      onClick={onClick}
      className={`min-h-20 p-2 rounded-xl border-2 cursor-pointer transition-all duration-200 ${getBorderStyle()} ${
        assignment?.counselorIds.length ? 'bg-white' : 'bg-gray-50'
      } hover:shadow-md`}
      data-testid={`shift-slot-${date}-${shiftTypeId}-${hotlineId}`}
      data-date={date}
      data-shift-type={shiftTypeId}
      data-hotline={hotlineId}
    >
      <div className="flex items-center justify-between mb-1">
        <span 
          className="text-xs px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: hotline?.color }}
        >
          {hotline?.name}
        </span>
        {shiftType?.isNightShift && (
          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
            🌙 夜班
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        {assignedCounselors.map(c => (
          <div key={c.id} className="flex items-center gap-1 text-sm bg-gray-100 rounded-lg px-2 py-1">
            <span>{c.avatar}</span>
            <span className="truncate">{c.name}</span>
          </div>
        ))}
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
  const { selectedDate, assignments, addCounselorToAssignment, createAssignment, canEditSchedule } = useApp();
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
      const success = addCounselorToAssignment(assignmentId, counselorId);
      if (!success && !assignment) {
      }
    }
  };

  const handleSlotClick = (date: string, shiftTypeId: string, hotlineId: string) => {
    const assignment = getAssignment(date, shiftTypeId, hotlineId);
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
        <div className="flex items-center gap-2">
          {weekDates.map(date => {
            const { day, weekDay, isToday } = formatDateLabel(date);
            return (
              <div
                key={date}
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
