import { useApp } from '../context/AppContext';
import { users } from '../data/fixtures';

export function RoleSelector() {
  const { setCurrentUser } = useApp();

  const roleDescriptions = {
    counselor: {
      title: '咨询师',
      desc: '查看个人值班安排、申请调班',
      icon: '👨‍⚕️',
    },
    supervisor: {
      title: '热线主管',
      desc: '查看全局排班、管理咨询师资质、审批调班',
      icon: '👩‍💼',
    },
    scheduler: {
      title: '排班员',
      desc: '编辑值班表、拖拽排班、处理排班冲突',
      icon: '👨‍💻',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🌙 心理热线值班表系统
          </h1>
          <p className="text-gray-600 text-lg">
            专业、高效的心理热线排班管理平台
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => setCurrentUser(user)}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              <div className="text-6xl mb-4">
                {roleDescriptions[user.role].icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {roleDescriptions[user.role].title}
              </h3>
              <p className="text-gray-500 mb-4">
                {roleDescriptions[user.role].desc}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <span>{user.avatar}</span>
                <span>以 {user.name} 身份登录</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl p-6 shadow-md">
          <h4 className="font-bold text-gray-700 mb-3">🔧 测试提示</h4>
          <ul className="text-sm text-gray-500 space-y-2">
            <li>• <strong>咨询师</strong>：只能查看自己的值班安排，无编辑权限</li>
            <li>• <strong>热线主管</strong>：可查看全局排班、管理咨询师资质</li>
            <li>• <strong>排班员</strong>：可拖拽排班、编辑值班表</li>
            <li>• <strong>Smoke 测试</strong>：请使用排班员身份登录进行拖拽测试</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
