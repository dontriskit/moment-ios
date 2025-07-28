// Shared types between web and mobile apps
// These should eventually be extracted to a shared package

export interface User {
  id: string;
  email: string;
  name: string | null;
  onboardingCompleted: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
}

export interface Activation {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  duration: number | null;
  categoryId: string | null;
  category?: Category;
  audioUrl: string | null;
  featured: boolean;
  publishedAt: Date | null;
  status: 'draft' | 'published';
}

export interface UserProgress {
  id: string;
  userId: string;
  activationId: string;
  completed: boolean;
  completedAt: Date | null;
  progressPercent: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
}