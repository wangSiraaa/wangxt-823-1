import { useDrag } from 'react-dnd';
import { counselors, qualifications } from '../data/fixtures';
import type { Counselor } from '../types';

interface CounselorCardProps {
  counselor: Counselor;
}

function CounselorCard({ counselor }: CounselorCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COUNSELOR',
    item: { id: counselor.id, type: 'COUNSELOR' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const qualNames = counselor.qualifications
    .map(qId => qualifications.find(q => q.id === qId)?.name)
    .filter(Boolean);

  return (
    <div
      ref={drag}
      className={`p-4 bg-white rounded-xl shadow-sm border-2 cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95 border-blue-400' : 'border-gray-100 hover:border-blue-300 hover:shadow-md'
      } ${counselor.isOnLeave ? 'bg-gray-100 opacity-60' : ''}`}
      data-counselor-id={counselor.id}
      data-testid={`counselor-${counselor.id}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{counselor.avatar}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 truncate">{counselor.name}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {counselor.isOnLeave ? (
              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                休假中
              </span>
            ) : (
              qualNames.map((name, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full"
                >
                  {name}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CounselorListProps {
  title?: string;
  filterQualification?: string;
}

export function CounselorList({ title = '咨询师列表', filterQualification }: CounselorListProps) {
  const filteredCounselors = filterQualification
    ? counselors.filter(c => c.qualifications.includes(filterQualification))
    : counselors;

  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>👥</span>
        {title}
        {filterQualification && (
          <span className="text-sm font-normal text-gray-500">
            (已筛选资质)
          </span>
        )}
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredCounselors.map(counselor => (
          <CounselorCard key={counselor.id} counselor={counselor} />
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">
        💡 拖拽咨询师卡片到班次槽位进行排班
      </p>
    </div>
  );
}
