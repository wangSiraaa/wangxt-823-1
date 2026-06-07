import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { User, ShiftAssignment, ValidationError, UserRole, UserPreferences } from '../types';
import { users, initialAssignments } from '../data/fixtures';
import { validateAssignment } from '../utils/validation';

const PREFERENCES_KEY = 'hotline_duty_preferences';
const ASSIGNMENTS_KEY = 'hotline_duty_assignments';

interface AppState {
  currentUser: User | null;
  assignments: ShiftAssignment[];
  selectedDate: string;
  selectedAssignment: ShiftAssignment | null;
  errors: ValidationError[];
  showErrorToast: boolean;
  errorMessage: string;
  preferences: UserPreferences;
}

interface AppContextType extends AppState {
  setCurrentUser: (user: User | null) => void;
  setSelectedDate: (date: string) => void;
  setSelectedAssignment: (assignment: ShiftAssignment | null) => void;
  addCounselorToAssignment: (assignmentId: string, counselorId: string) => boolean;
  removeCounselorFromAssignment: (assignmentId: string, counselorId: string) => void;
  createAssignment: (date: string, shiftTypeId: string, hotlineId: string) => string;
  deleteAssignment: (assignmentId: string) => void;
  showError: (message: string) => void;
  hideError: () => void;
  getCurrentUserRole: () => UserRole | null;
  canEditSchedule: () => boolean;
  canViewAllSchedules: () => boolean;
  canManageUsers: () => boolean;
  savePreferences: (prefs: Partial<UserPreferences>) => void;
  updateAssignmentStatus: (assignmentId: string, status: 'normal' | 'abnormal' | 'resolved') => void;
  resetAssignments: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const defaultPreferences: UserPreferences = {
  selectedDate: new Date().toISOString().split('T')[0],
  viewMode: 'week',
};

function loadPreferences(): UserPreferences {
  try {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (saved) {
      return { ...defaultPreferences, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load preferences:', e);
  }
  return defaultPreferences;
}

function loadAssignments(): ShiftAssignment[] {
  try {
    const saved = localStorage.getItem(ASSIGNMENTS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load assignments:', e);
  }
  return initialAssignments;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>(loadAssignments);
  const [selectedDate, setSelectedDate] = useState<string>(preferences.selectedDate);
  const [selectedAssignment, setSelectedAssignment] = useState<ShiftAssignment | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to save preferences:', e);
    }
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
    } catch (e) {
      console.error('Failed to save assignments:', e);
    }
  }, [assignments]);

  const savePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...prefs };
      if (prefs.selectedDate) {
        setSelectedDate(prefs.selectedDate);
      }
      return updated;
    });
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setShowErrorToast(true);
    setTimeout(() => setShowErrorToast(false), 5000);
  }, []);

  const hideError = useCallback(() => {
    setShowErrorToast(false);
  }, []);

  const addCounselorToAssignment = useCallback((assignmentId: string, counselorId: string): boolean => {
    let success = false;
    setAssignments(prev => {
      const newAssignments = prev.map(a => {
        if (a.id === assignmentId) {
          if (a.counselorIds.includes(counselorId)) return a;
          const updated = { ...a, counselorIds: [...a.counselorIds, counselorId] };
          const validationErrors = validateAssignment(updated, prev);
          if (validationErrors.length > 0) {
            setErrors(validationErrors);
            showError(validationErrors[0].message);
            return a;
          }
          setErrors([]);
          success = true;
          return updated;
        }
        return a;
      });
      return newAssignments;
    });
    return success;
  }, [showError]);

  const removeCounselorFromAssignment = useCallback((assignmentId: string, counselorId: string) => {
    setAssignments(prev => 
      prev.map(a => 
        a.id === assignmentId 
          ? { ...a, counselorIds: a.counselorIds.filter(id => id !== counselorId) }
          : a
      )
    );
  }, []);

  const createAssignment = useCallback((date: string, shiftTypeId: string, hotlineId: string): string => {
    const newId = `a_${Date.now()}`;
    const newAssignment: ShiftAssignment = {
      id: newId,
      date,
      shiftTypeId,
      hotlineId,
      counselorIds: [],
      status: 'normal',
    };
    setAssignments(prev => [...prev, newAssignment]);
    return newId;
  }, []);

  const deleteAssignment = useCallback((assignmentId: string) => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    if (selectedAssignment?.id === assignmentId) {
      setSelectedAssignment(null);
    }
  }, [selectedAssignment]);

  const updateAssignmentStatus = useCallback((assignmentId: string, status: 'normal' | 'abnormal' | 'resolved') => {
    setAssignments(prev => 
      prev.map(a => 
        a.id === assignmentId ? { ...a, status } : a
      )
    );
    if (selectedAssignment?.id === assignmentId) {
      setSelectedAssignment(prev => prev ? { ...prev, status } : null);
    }
  }, [selectedAssignment]);

  const resetAssignments = useCallback(() => {
    setAssignments(initialAssignments);
    localStorage.removeItem(ASSIGNMENTS_KEY);
  }, []);

  const getCurrentUserRole = useCallback((): UserRole | null => {
    return currentUser?.role || null;
  }, [currentUser]);

  const canEditSchedule = useCallback((): boolean => {
    const role = getCurrentUserRole();
    return role === 'scheduler' || role === 'supervisor';
  }, [getCurrentUserRole]);

  const canViewAllSchedules = useCallback((): boolean => {
    const role = getCurrentUserRole();
    return role === 'scheduler' || role === 'supervisor';
  }, [getCurrentUserRole]);

  const canManageUsers = useCallback((): boolean => {
    return getCurrentUserRole() === 'supervisor';
  }, [getCurrentUserRole]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        assignments,
        selectedDate,
        selectedAssignment,
        errors,
        showErrorToast,
        errorMessage,
        preferences,
        setCurrentUser,
        setSelectedDate,
        setSelectedAssignment,
        addCounselorToAssignment,
        removeCounselorFromAssignment,
        createAssignment,
        deleteAssignment,
        showError,
        hideError,
        getCurrentUserRole,
        canEditSchedule,
        canViewAllSchedules,
        canManageUsers,
        savePreferences,
        updateAssignmentStatus,
        resetAssignments,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
