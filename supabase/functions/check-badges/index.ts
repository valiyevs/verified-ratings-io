import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BadgeDef {
  type: string;
  name: string;
  icon: string;
  description: string;
  check: (stats: UserStats) => boolean;
}

interface UserStats {
  totalReviews: number;
  totalHelpful: number;
  totalPoints: number;
  totalSurveys: number;
  isVerified: boolean;
  loginStreak: number;
  accountAgeMonths: number;
}

const BADGE_DEFINITIONS: BadgeDef[] = [
  { type: "first_review", name: "İlk Rəy", icon: "✍️", description: "İlk rəyinizi yazdınız!", check: (s) => s.totalReviews >= 1 },
  { type: "reviewer_5", name: "Aktiv Rəyçi", icon: "⭐", description: "5 rəy yazdınız", check: (s) => s.totalReviews >= 5 },
  { type: "expert_reviewer", name: "Ekspert Rəyçi", icon: "🏆", description: "20+ rəy yazdınız", check: (s) => s.totalReviews >= 20 },
  { type: "helpful_10", name: "Faydalı Üzv", icon: "👍", description: "10 faydalı səs aldınız", check: (s) => s.totalHelpful >= 10 },
  { type: "helpful_50", name: "Toplum Lideri", icon: "🌟", description: "50 faydalı səs aldınız", check: (s) => s.totalHelpful >= 50 },
  { type: "survey_master", name: "Sorğu Ustası", icon: "📋", description: "10+ sorğu doldurdunuz", check: (s) => s.totalSurveys >= 10 },
  { type: "verified_buyer", name: "Doğrulanmış", icon: "✅", description: "FIN ilə təsdiqlənmiş hesab", check: (s) => s.isVerified },
  { type: "streak_7", name: "7 Gün Sıra", icon: "🔥", description: "7 gün ardıcıl daxil oldunuz", check: (s) => s.loginStreak >= 7 },
  { type: "streak_30", name: "30 Gün Sıra", icon: "💎", description: "30 gün ardıcıl daxil oldunuz", check: (s) => s.loginStreak >= 30 },
  { type: "ambassador", name: "Səfir", icon: "👑", description: "1000+ xal və 50+ rəy", check: (s) => s.totalPoints >= 1000 && s.totalReviews >= 50 },
  { type: "veteran", name: "Veteran", icon: "🎖️", description: "12+ ay aktiv üzv", check: (s) => s.accountAgeMonths >= 12 },
  { type: "points_500", name: "500 Xal", icon: "🪙", description: "500 xal topladınız", check: (s) => s.totalPoints >= 500 },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Get user stats
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("total_reviews_count, total_points, is_fin_verified, login_streak, created_at, survey_participation_count")
      .eq("user_id", user.id)
      .single();

    // Get total helpful count
    const { data: reviews } = await serviceClient
      .from("reviews")
      .select("helpful_count")
      .eq("user_id", user.id)
      .eq("status", "approved");

    const totalHelpful = reviews?.reduce((sum, r) => sum + (r.helpful_count || 0), 0) || 0;
    const accountAgeMonths = profile?.created_at
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000))
      : 0;

    const stats: UserStats = {
      totalReviews: profile?.total_reviews_count || 0,
      totalHelpful,
      totalPoints: profile?.total_points || 0,
      totalSurveys: profile?.survey_participation_count || 0,
      isVerified: profile?.is_fin_verified || false,
      loginStreak: profile?.login_streak || 0,
      accountAgeMonths,
    };

    // Get existing badges
    const { data: existingBadges } = await serviceClient
      .from("user_badges")
      .select("badge_type")
      .eq("user_id", user.id);

    const existingTypes = new Set(existingBadges?.map(b => b.badge_type) || []);
    const newBadges: { badge_type: string; badge_name: string; badge_icon: string; badge_description: string }[] = [];

    for (const badge of BADGE_DEFINITIONS) {
      if (!existingTypes.has(badge.type) && badge.check(stats)) {
        newBadges.push({
          badge_type: badge.type,
          badge_name: badge.name,
          badge_icon: badge.icon,
          badge_description: badge.description,
        });
      }
    }

    // Insert new badges
    if (newBadges.length > 0) {
      await serviceClient.from("user_badges").insert(
        newBadges.map(b => ({ user_id: user.id, ...b }))
      );

      // Award points for each new badge
      for (const badge of newBadges) {
        await serviceClient.from("user_rewards").insert({
          user_id: user.id,
          points: 25,
          action_type: "badge",
          description: `Badge qazandınız: ${badge.badge_name}`,
        });
      }

      // Update total points
      await serviceClient
        .from("profiles")
        .update({ total_points: (profile?.total_points || 0) + newBadges.length * 25 })
        .eq("user_id", user.id);

      // Update leaderboard
      await serviceClient.from("leaderboard").upsert({
        user_id: user.id,
        full_name: profile ? (profile as any).full_name : null,
        total_points: (profile?.total_points || 0) + newBadges.length * 25,
        total_reviews: stats.totalReviews,
        total_helpful: totalHelpful,
        badge_count: (existingBadges?.length || 0) + newBadges.length,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

    return new Response(
      JSON.stringify({ newBadges, totalBadges: (existingBadges?.length || 0) + newBadges.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("check-badges error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
