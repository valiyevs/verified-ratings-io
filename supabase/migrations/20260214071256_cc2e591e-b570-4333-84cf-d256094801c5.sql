
-- ============================================
-- 1. FRAUD DETECTION: Review fraud logs table
-- ============================================
CREATE TABLE public.review_fraud_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_fingerprint TEXT,
  typing_speed_wpm NUMERIC,
  is_copy_paste BOOLEAN DEFAULT false,
  similarity_score NUMERIC DEFAULT 0,
  similar_review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL,
  fraud_type TEXT, -- 'ip_abuse', 'duplicate_content', 'bot_behavior', 'rapid_submission'
  risk_score NUMERIC DEFAULT 0, -- 0-1
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.review_fraud_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view fraud logs" ON public.review_fraud_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "System can insert fraud logs" ON public.review_fraud_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Index for fraud analysis
CREATE INDEX idx_fraud_logs_user ON public.review_fraud_logs(user_id);
CREATE INDEX idx_fraud_logs_ip ON public.review_fraud_logs(ip_address);
CREATE INDEX idx_fraud_logs_device ON public.review_fraud_logs(device_fingerprint);

-- ============================================
-- 2. GAMIFICATION: User badges table
-- ============================================
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL, -- 'first_review', 'helpful_10', 'expert_reviewer', 'survey_master', 'verified_buyer', 'ambassador', 'streak_7', 'top_reviewer'
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON public.user_badges
  FOR SELECT USING (true);

CREATE POLICY "System can insert badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX idx_badges_user ON public.user_badges(user_id);

-- ============================================
-- 3. LEADERBOARD: Materialized view approach using a table
-- ============================================
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  total_points INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_helpful INTEGER DEFAULT 0,
  badge_count INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  period TEXT DEFAULT 'all_time', -- 'weekly', 'monthly', 'all_time'
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard
  FOR SELECT USING (true);

CREATE POLICY "System can manage leaderboard" ON public.leaderboard
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow upsert from edge function
CREATE POLICY "Authenticated can upsert own leaderboard" ON public.leaderboard
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated can update own leaderboard" ON public.leaderboard
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 4. RESPONSE TEMPLATES for companies
-- ============================================
CREATE TABLE public.response_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- 'positive', 'negative', 'neutral', 'general'
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.response_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can manage templates" ON public.response_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM companies WHERE companies.id = response_templates.company_id AND companies.owner_id = auth.uid())
    OR is_company_member(auth.uid(), company_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM companies WHERE companies.id = response_templates.company_id AND companies.owner_id = auth.uid())
    OR is_company_member(auth.uid(), company_id)
  );

-- ============================================
-- 5. REVIEW CONTESTS
-- ============================================
CREATE TABLE public.review_contests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  prize_description TEXT,
  prize_points INTEGER DEFAULT 500,
  status TEXT DEFAULT 'active', -- 'active', 'ended', 'cancelled'
  winner_user_id UUID,
  winner_review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.review_contests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active contests" ON public.review_contests
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage contests" ON public.review_contests
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- 6. Add review_start_time to track writing behavior
-- ============================================
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS writing_duration_seconds INTEGER;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS submission_ip TEXT;

-- ============================================
-- 7. Daily login streaks for engagement
-- ============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
