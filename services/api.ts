
import { Student, Checklist, Assessment, Subject, Assessor, User } from '../types';

// CHANGE THIS TO YOUR CPANEL NODEJS SERVER URL
const API_URL = 'http://localhost:3001/api';

export const api = {
  // --- Students ---
  async getStudents(): Promise<Student[]> {
    const res = await fetch(`${API_URL}/students`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async createStudent(student: Student): Promise<void> {
    await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
  },

  // --- Checklists ---
  async getChecklists(): Promise<Checklist[]> {
    const res = await fetch(`${API_URL}/checklists`);
    if (!res.ok) throw new Error('Failed to fetch checklists');
    return res.json();
  },

  async createChecklist(checklist: Checklist): Promise<void> {
    await fetch(`${API_URL}/checklists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checklist),
    });
  },

  // --- Assessments ---
  async getAssessments(): Promise<Assessment[]> {
    const res = await fetch(`${API_URL}/assessments`);
    if (!res.ok) throw new Error('Failed to fetch assessments');
    return res.json();
  },

  async createAssessment(assessment: Assessment): Promise<void> {
    await fetch(`${API_URL}/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment),
    });
  },

  // --- Subjects ---
  async getSubjects(): Promise<Subject[]> {
    const res = await fetch(`${API_URL}/subjects`);
    if (!res.ok) throw new Error('Failed to fetch subjects');
    return res.json();
  },

  async createSubject(subject: Subject): Promise<void> {
    await fetch(`${API_URL}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subject),
    });
  },

  // --- Assessors ---
  async getAssessors(): Promise<Assessor[]> {
    const res = await fetch(`${API_URL}/assessors`);
    if (!res.ok) throw new Error('Failed to fetch assessors');
    return res.json();
  }
};
