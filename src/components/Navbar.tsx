import { useApp } from '../context/AppContext';

export function Navbar() {
  const { currentUser, setCurrentUser, canEditSchedule, canManageUsers } = useApp();

  if (!currentUser) return null;

  const roleLabels = {
    counselor: '咨询师',
    supervisor: '热线主管',
    scheduler: '排班员',
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌙</span>
          <h1 className="text-xl font-bold text-gray-800">心理热线值班表</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
            <span className="text-2xl">{currentUser.avatar}</span>
            <div>
              <p className="font-medium text-gray-800">{currentUser.name}</p>
              <p className="text-xs text-blue-600">{roleLabels[currentUser.role]}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEditSchedule() && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                ✏️ 可编辑
              </span>
            )}
            {canManageUsers() && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                👥 可管理
              </span>
            )}
          </div>

          <button
            onClick={() => setCurrentUser(null)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            切换身份
          </button>
        </div>
      </div>
    </nav>
  );
}
