export interface SurveyQuestion {
  id: string;
  type: 'single' | 'multiple' | 'text' | 'rating';
  question: string;
  options?: string[];
}

export interface Survey {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  reward?: string;
  expiresAt: string;
  responseCount: number;
  status: 'active' | 'draft' | 'closed';
  createdAt: string;
}

export interface SurveyResponse {
  surveyId: string;
  oderId: string;
  answers: Record<string, string | string[] | number>;
  submittedAt: string;
}
