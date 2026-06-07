import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { DutyRoster } from '../components/DutyRoster';
import { ShiftDetailPanel } from '../components/ShiftDetailPanel';
import { CounselorList } from '../components/CounselorList';
import { ErrorToast } from '../components/ErrorToast';
import { useApp } from '../context/AppContext';
import type { ShiftAssignment } from '../types';

export function MainPage() {
  const [activeTab, setActiveTab] = useState('schedule');
  const { setSelectedAssignment, canEditSchedule } = useApp();

  const handleSlotClick = (
    assignment: ShiftAssignment | null,
    _date: string,
    _shiftTypeId: string,
    _hotlineId: string
  ) => {
    setSelectedAssignment(assignment);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
      case 'edit-schedule':
        return (
          <DndProvider backend={HTML5Backend}>
            <div className="grid grid-cols-12 gap-6">
              {canEditSchedule() && (
                <div className="col-span-3">
                  <CounselorList />
                </div>
              )}
              <div className={canEditSchedule() ? 'col-span-6' : 'col-span-9'}>
                <DutyRoster onSlotClick={handleSlotClick} />
              </div>
              <div className="col-span-3">
                <ShiftDetailPanel />
              </div>
            </div>
          </DndProvider>
        );
      
      case 'my-shifts':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">👤 我的值班</h2>
            <div className="text-center py-12 text-gray-500">
              <p className="text-6xl mb-4">📋</p>
              <p>个人值班查询功能开发中...</p>
            </div>
          </div>
        );

      case 'counselors':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 咨询师管理</h2>
            <div className="text-center py-12 text-gray-500">
              <p className="text-6xl mb-4">👨‍⚕️</p>
              <p>咨询师管理功能开发中...</p>
            </div>
          </div>
        );

      case 'statistics':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 统计报表</h2>
            <div className="text-center py-12 text-gray-500">
              <p className="text-6xl mb-4">📈</p>
              <p>统计报表功能开发中...</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ 系统设置</h2>
            <div className="text-center py-12 text-gray-500">
              <p className="text-6xl mb-4">🔧</p>
              <p>系统设置功能开发中...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
      <ErrorToast />
    </div>
  );
}
