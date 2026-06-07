export type UserRole = 'counselor' | 'supervisor' | 'scheduler';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  qualifications: string[];
}

export interface Counselor {
  id: string;
  name: string;
  avatar: string;
  qualifications: string[];
  isOnLeave: boolean;
}

export interface ShiftType {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isNightShift: boolean;
  requiredCounselors: number;
}

export interface Hotline {
  id: string;
  name: string;
  requiredQualification: string;
  color: string;
}

export interface ShiftAssignment {
  id: string;
  date: string;
  shiftTypeId: string;
  hotlineId: string;
  counselorIds: string[];
}

export interface Qualification {
  id: string;
  name: string;
  description: string;
}

export interface ValidationError {
  type: 'qualification' | 'night_shift' | 'conflict';
  message: string;
  detail?: string;
  counselorId?: string;
  counselorName?: string;
  requiredQualification?: string;
  requiredQualificationName?: string;
  counselorQualifications?: string[];
  shiftId?: string;
}
