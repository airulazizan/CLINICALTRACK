
export interface Student {
  id: string;
  name: string;
  matricNumber: string;
  group: string;
  yearLevel: string;
  email?: string;
  phoneNumber?: string;
}

export interface Subject {
  id: string;
  code: string;
  title: string;
  yearLevel: string;
}

export interface Checklist {
  id: string;
  title: string;
  subjectId: string; // Link to Subject
  subject: string; // Denormalized Title for display
  yearLevel: string;
  steps: string[];
}

export interface Assessor {
  id: string;
  name: string;
  verificationCode: string; // The PIN/Password used to finalize
  role?: string; // Optional: e.g., Senior Lecturer, Resident
}

export interface Assessment {
  id: string;
  studentId: string;
  checklistId: string;
  checklistTitle: string;
  studentName: string;
  assessorName: string; // Snapshot of who assessed
  completedStepIndices: number[]; // Indices where score was 2 (Full performance)
  stepScores: number[]; // Specific score (0, 1, 2) for each step
  totalSteps: number;
  score: number; // Percentage based on max possible points (totalSteps * 2)
  timestamp: string; // ISO string
}

// --- OSCE Feature Types ---

export interface OsceStation {
  id: string;
  number: number;
  title: string;
  description: string;
  durationMinutes: number;
  checklistId: string; // Link to the specific checklist used for grading this station
  checklistTitle: string; // Snapshot
}

export interface OsceCircuit {
  id: string;
  title: string; // e.g., "Circuit A", "Track Red"
  stations: OsceStation[];
}

export interface OsceSession {
  id: string;
  title: string; // e.g., "Year 3 Sem 1 Final OSCE"
  date: string;
  startTime: string;
  status: 'upcoming' | 'active' | 'completed';
  circuits: OsceCircuit[];
}

export type UserRole = 'Admin' | 'Professor' | 'Lecturer' | 'Clinical Instructor';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this would be hashed
  role: UserRole;
}

export type View = 'dashboard' | 'students' | 'checklists' | 'subjects' | 'assessors' | 'assess' | 'osce' | 'results' | 'settings';
