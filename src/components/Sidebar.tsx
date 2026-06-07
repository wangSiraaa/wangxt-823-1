import { useApp } from '../context/AppContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { canEditSchedule, canManageUsers, canViewAllSchedules, currentUser } = useApp();

  const allMenuItems = [
    {
      id: 'schedule',
      label: '值班表',
      icon: '📅',
      roles: ['counselor', 'supervisor', 'scheduler'] as const,
    },
    {
      id: 'my-shifts',
      label: '我的值班',
      icon: '👤',
      roles: ['counselor', 'supervisor'] as const,
    },
    {
      id: 'edit-schedule',
      label: '排班编辑',
      icon: '✏️',
      roles: ['scheduler', 'supervisor'] as const,
      requiresEdit: true,
    },
    {
      id: 'counselors',
      label: '咨询师管理',
      icon: '👥',
      roles: ['supervisor'] as const,
      requiresManage: true,
    },
    {
      id: 'statistics',
      label: '统计报表',
      icon: '📊',
      roles: ['supervisor', 'scheduler'] as const,
    },
    {
      id: 'settings',
      label: '系统设置',
      icon: '⚙️',
      roles: ['supervisor'] as const,
    },
  ];

  const visibleItems = allMenuItems.filter(item => {
    if (!currentUser) return false;
    if (!item.roles.includes(currentUser.role as any)) return false;
    if (item.requiresEdit && !canEditSchedule()) return false;
    if (item.requiresManage && !canManageUsers()) return false;
    return true;
  });

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen p-4">
      <div className="space-y-2">
        {visibleItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-amber-50 rounded-xl">
        <p className="text-sm text-amber-700 font-medium mb-2">💡 当前身份可见入口</p>
        <p className="text-xs text-amber-600">
          系统根据您的角色自动展示可用功能。如需更多权限，请联系管理员。
        </p>
      </div>
    </aside>
  );
}
