// Subscription plan permission definitions
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface PlanPermissions {
  canViewAnalytics: boolean;
  canViewDetailedAnalytics: boolean;
  canUseAIAnalysis: boolean;
  canCreateSurveys: boolean;
  surveysPerMonth: number;
  canAccessAPI: boolean;
  canReplyToReviews: boolean;
  reviewsLimit: number; // -1 for unlimited
  hasPrioritySupport: boolean;
  canManageMultipleCompanies: boolean;
  hasWhiteLabel: boolean;
  hasDedicatedManager: boolean;
}

export const PLAN_PERMISSIONS: Record<SubscriptionPlan, PlanPermissions> = {
  free: {
    canViewAnalytics: true,
    canViewDetailedAnalytics: false,
    canUseAIAnalysis: false,
    canCreateSurveys: false,
    surveysPerMonth: 0,
    canAccessAPI: false,
    canReplyToReviews: true,
    reviewsLimit: 10,
    hasPrioritySupport: false,
    canManageMultipleCompanies: false,
    hasWhiteLabel: false,
    hasDedicatedManager: false,
  },
  pro: {
    canViewAnalytics: true,
    canViewDetailedAnalytics: true,
    canUseAIAnalysis: true,
    canCreateSurveys: true,
    surveysPerMonth: 5,
    canAccessAPI: false,
    canReplyToReviews: true,
    reviewsLimit: -1,
    hasPrioritySupport: true,
    canManageMultipleCompanies: false,
    hasWhiteLabel: false,
    hasDedicatedManager: false,
  },
  enterprise: {
    canViewAnalytics: true,
    canViewDetailedAnalytics: true,
    canUseAIAnalysis: true,
    canCreateSurveys: true,
    surveysPerMonth: -1,
    canAccessAPI: true,
    canReplyToReviews: true,
    reviewsLimit: -1,
    hasPrioritySupport: true,
    canManageMultipleCompanies: true,
    hasWhiteLabel: true,
    hasDedicatedManager: true,
  },
};

export function getPlanPermissions(plan: string | null | undefined): PlanPermissions {
  const normalizedPlan = (plan?.toLowerCase() || 'free') as SubscriptionPlan;
  return PLAN_PERMISSIONS[normalizedPlan] || PLAN_PERMISSIONS.free;
}

export function getPlanName(plan: string | null | undefined): string {
  const names: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };
  return names[plan?.toLowerCase() || 'free'] || 'Free';
}

export function getPlanBadgeVariant(plan: string | null | undefined): 'default' | 'secondary' | 'outline' {
  const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
    free: 'outline',
    pro: 'secondary',
    enterprise: 'default',
  };
  return variants[plan?.toLowerCase() || 'free'] || 'outline';
}
