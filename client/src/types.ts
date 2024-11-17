export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}
