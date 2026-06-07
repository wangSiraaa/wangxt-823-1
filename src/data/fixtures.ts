import type { User, Counselor, ShiftType, Hotline, Qualification, ShiftAssignment } from '../types';

export const qualifications: Qualification[] = [
  { id: 'q1', name: '普通心理热线', description: '具备基础心理咨询能力' },
  { id: 'q2', name: '危机干预专线', description: '具备危机干预专业资质' },
  { id: 'q3', name: '青少年专线', description: '具备青少年心理咨询资质' },
  { id: 'q4', name: '婚姻家庭专线', description: '具备婚姻家庭咨询资质' },
];

export const users: User[] = [
  {
    id: 'u1',
    name: '张咨询师',
    role: 'counselor',
    avatar: '👨‍⚕️',
    qualifications: ['q1'],
  },
  {
    id: 'u2',
    name: '李主管',
    role: 'supervisor',
    avatar: '👩‍💼',
    qualifications: ['q1', 'q2', 'q3'],
  },
  {
    id: 'u3',
    name: '王排班员',
    role: 'scheduler',
    avatar: '👨‍💻',
    qualifications: [],
  },
];

export const counselors: Counselor[] = [
  {
    id: 'c1',
    name: '张小明',
    avatar: '👨',
    qualifications: ['q1'],
    isOnLeave: false,
  },
  {
    id: 'c2',
    name: '李小红',
    avatar: '👩',
    qualifications: ['q1', 'q2'],
    isOnLeave: false,
  },
  {
    id: 'c3',
    name: '王大伟',
    avatar: '👨‍🦱',
    qualifications: ['q1', 'q3'],
    isOnLeave: false,
  },
  {
    id: 'c4',
    name: '刘美丽',
    avatar: '👩‍🦰',
    qualifications: ['q1', 'q2', 'q3'],
    isOnLeave: false,
  },
  {
    id: 'c5',
    name: '陈志强',
    avatar: '👨‍🦳',
    qualifications: ['q1', 'q4'],
    isOnLeave: false,
  },
  {
    id: 'c6',
    name: '赵雅琴',
    avatar: '👩‍🦳',
    qualifications: ['q1'],
    isOnLeave: true,
  },
  {
    id: 'c7',
    name: '孙建国',
    avatar: '👴',
    qualifications: ['q1', 'q2', 'q4'],
    isOnLeave: false,
  },
  {
    id: 'c8',
    name: '周美玲',
    avatar: '👵',
    qualifications: ['q1', 'q3', 'q4'],
    isOnLeave: false,
  },
];

export const shiftTypes: ShiftType[] = [
  {
    id: 's1',
    name: '早班',
    startTime: '08:00',
    endTime: '16:00',
    isNightShift: false,
    requiredCounselors: 1,
  },
  {
    id: 's2',
    name: '中班',
    startTime: '16:00',
    endTime: '24:00',
    isNightShift: false,
    requiredCounselors: 1,
  },
  {
    id: 's3',
    name: '夜班',
    startTime: '00:00',
    endTime: '08:00',
    isNightShift: true,
    requiredCounselors: 2,
  },
];

export const hotlines: Hotline[] = [
  {
    id: 'h1',
    name: '普通心理热线',
    requiredQualification: 'q1',
    color: '#3B82F6',
  },
  {
    id: 'h2',
    name: '危机干预专线',
    requiredQualification: 'q2',
    color: '#EF4444',
  },
  {
    id: 'h3',
    name: '青少年专线',
    requiredQualification: 'q3',
    color: '#10B981',
  },
  {
    id: 'h4',
    name: '婚姻家庭专线',
    requiredQualification: 'q4',
    color: '#F59E0B',
  },
];

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
};

export const initialAssignments: ShiftAssignment[] = [
  {
    id: 'a1',
    date: formatDate(today),
    shiftTypeId: 's1',
    hotlineId: 'h1',
    counselorIds: ['c1'],
  },
  {
    id: 'a2',
    date: formatDate(today),
    shiftTypeId: 's2',
    hotlineId: 'h2',
    counselorIds: ['c2'],
  },
  {
    id: 'a3',
    date: formatDate(today),
    shiftTypeId: 's3',
    hotlineId: 'h1',
    counselorIds: ['c4', 'c7'],
  },
  {
    id: 'a4',
    date: formatDate(addDays(today, 1)),
    shiftTypeId: 's1',
    hotlineId: 'h3',
    counselorIds: ['c3'],
  },
  {
    id: 'a5',
    date: formatDate(addDays(today, 1)),
    shiftTypeId: 's3',
    hotlineId: 'h4',
    counselorIds: ['c5', 'c8'],
  },
];

export function getWeekDates(): string[] {
  const dates: string[] = [];
  const monday = new Date(today);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
}
