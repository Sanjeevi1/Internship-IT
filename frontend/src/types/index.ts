export interface Student {
  _id: string;
  name: string;
  registerNumber: string;
  email: string;
  department: string;
  classAdvisor?: User;
  mentor?: User;
}

export interface Faculty {
  _id?: string;
  facultyId: number;
  facultyName: string;
  email: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  registerNumber?: string;
  facultyRoles?: ('class_advisor' | 'mentor' | 'hod' | 'internship_coordinator')[];
  department?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Internship {
  _id: string;
  student: Student;
  organisationName: string;
  natureOfWork: string;
  modeOfInternship: 'online' | 'offline' | 'hybrid';
  startDate: string;
  completionDate: string;
  stipend: 'Yes' | 'No';
  stipendAmount?: number;
  status: 'pending' | 'approved' | 'rejected';
  offerLetter?: string;
  approvalStatus: {
    classAdvisor?: { approved: boolean; timestamp?: string };
    mentor?: { approved: boolean; timestamp?: string };
    hod?: { approved: boolean; timestamp?: string };
    internshipCoordinator?: { approved: boolean; timestamp?: string };
  };
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface OD {
  _id: string;
  student: Student;
  internship: Internship;
  startDate: string;
  endDate: string;
  purpose: string;
  approved: boolean;
  approvalFlow: {
    classAdvisor?: { approved: boolean; timestamp?: string };
    mentor?: { approved: boolean; timestamp?: string };
    hod?: { approved: boolean; timestamp?: string };
    internshipCoordinator?: { approved: boolean; timestamp?: string };
  };
  currentApprovalStep: 'class_advisor' | 'mentor' | 'hod' | 'internship_coordinator' | 'completed' | 'rejected';
}

export interface AuthResponse {
  token: string;
  role: 'student' | 'faculty';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface InternshipStats {
  totalInternships: number;
  approvedInternships: number;
  pendingInternships: number;
  rejectedInternships: number;
  byOrganization: { [key: string]: number };
  byMode: { [key: string]: number };
  byMonth: { [key: string]: number };
  averageStipend: number;
}

export interface ODStats {
  totalODs: number;
  approvedODs: number;
  pendingODs: number;
  rejectedODs: number;
  byMonth: { [key: string]: number };
  averageDuration: number;
} 