import type { ShiftAssignment, ValidationError } from '../types';
import { counselors, hotlines, shiftTypes, qualifications } from '../data/fixtures';

export function checkCounselorQualification(
  counselorId: string,
  hotlineId: string
): ValidationError | null {
  const counselor = counselors.find(c => c.id === counselorId);
  const hotline = hotlines.find(h => h.id === hotlineId);
  
  if (!counselor || !hotline) return null;
  
  if (!counselor.qualifications.includes(hotline.requiredQualification)) {
    const requiredQual = qualifications.find(q => q.id === hotline.requiredQualification);
    const counselorQualNames = counselor.qualifications
      .map(qId => qualifications.find(q => q.id === qId)?.name)
      .filter(Boolean);
    
    return {
      type: 'qualification',
      message: `${counselor.name} 不具备 ${hotline.name} 所需的资质`,
      detail: `需要「${requiredQual?.name}」资质，当前仅具备：${counselorQualNames.length > 0 ? counselorQualNames.join('、') : '无'}`,
      counselorId,
      counselorName: counselor.name,
      requiredQualification: hotline.requiredQualification,
      requiredQualificationName: requiredQual?.name,
      counselorQualifications: counselor.qualifications,
    };
  }
  
  return null;
}

export function checkNightShiftRequirement(
  shiftTypeId: string,
  currentCounselorIds: string[]
): ValidationError | null {
  const shiftType = shiftTypes.find(s => s.id === shiftTypeId);
  
  if (!shiftType || !shiftType.isNightShift) return null;
  
  if (currentCounselorIds.length < shiftType.requiredCounselors) {
    return {
      type: 'night_shift',
      message: `夜班必须安排 ${shiftType.requiredCounselors} 人值守，当前仅 ${currentCounselorIds.length} 人`,
      detail: `请补充 ${shiftType.requiredCounselors - currentCounselorIds.length} 名咨询师`,
    };
  }
  
  return null;
}

export function checkCounselorConflict(
  counselorId: string,
  date: string,
  shiftTypeId: string,
  assignments: ShiftAssignment[],
  excludeAssignmentId?: string
): ValidationError | null {
  const conflict = assignments.find(
    a => 
      a.date === date && 
      a.shiftTypeId === shiftTypeId && 
      a.counselorIds.includes(counselorId) &&
      a.id !== excludeAssignmentId
  );
  
  if (conflict) {
    const counselor = counselors.find(c => c.id === counselorId);
    const hotline = hotlines.find(h => h.id === conflict.hotlineId);
    return {
      type: 'conflict',
      message: `${counselor?.name || '该咨询师'} 已在同一时段被安排到 ${hotline?.name || '其他热线'}`,
      detail: `无法在同一时段重复排班`,
      counselorId,
    };
  }
  
  return null;
}

export function validateAssignment(
  assignment: ShiftAssignment,
  allAssignments: ShiftAssignment[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const shiftType = shiftTypes.find(s => s.id === assignment.shiftTypeId);
  
  for (const counselorId of assignment.counselorIds) {
    const qualError = checkCounselorQualification(counselorId, assignment.hotlineId);
    if (qualError) errors.push(qualError);
    
    const conflictError = checkCounselorConflict(
      counselorId, 
      assignment.date, 
      assignment.shiftTypeId, 
      allAssignments,
      assignment.id
    );
    if (conflictError) errors.push(conflictError);
  }
  
  if (shiftType?.isNightShift) {
    const nightError = checkNightShiftRequirement(
      assignment.shiftTypeId,
      assignment.counselorIds
    );
    if (nightError) errors.push(nightError);
  }
  
  return errors;
}

export function canAddCounselorToShift(
  counselorId: string,
  date: string,
  shiftTypeId: string,
  hotlineId: string,
  currentCounselorIds: string[],
  allAssignments: ShiftAssignment[]
): { valid: boolean; error?: ValidationError } {
  const qualError = checkCounselorQualification(counselorId, hotlineId);
  if (qualError) return { valid: false, error: qualError };
  
  const conflictError = checkCounselorConflict(
    counselorId,
    date,
    shiftTypeId,
    allAssignments
  );
  if (conflictError) return { valid: false, error: conflictError };
  
  const shiftType = shiftTypes.find(s => s.id === shiftTypeId);
  if (shiftType && currentCounselorIds.length >= shiftType.requiredCounselors && !shiftType.isNightShift) {
    return {
      valid: false,
      error: {
        type: 'conflict',
        message: `该班次已达到最大人数限制 (${shiftType.requiredCounselors}人)`,
        detail: `白班仅需 ${shiftType.requiredCounselors} 人值守`,
      },
    };
  }
  
  return { valid: true };
}
