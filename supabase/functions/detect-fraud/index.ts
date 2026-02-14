import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FraudCheckRequest {
  reviewId: string;
  content: string;
  userId: string;
  companyId: string;
  writingDurationSeconds?: number;
  isCopyPaste?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: FraudCheckRequest = await req.json();
    const { reviewId, content, userId, companyId, writingDurationSeconds, isCopyPaste } = body;

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const fraudIndicators: string[] = [];
    let riskScore = 0;

    // Get client IP and user agent
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 1. IP RATE LIMITING: Check how many reviews from this IP in last 24h
    const { data: ipReviews } = await serviceClient
      .from("review_fraud_logs")
      .select("id")
      .eq("ip_address", clientIp)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (ipReviews && ipReviews.length >= 5) {
      fraudIndicators.push("Eyni IP-dən 24 saatda 5+ rəy");
      riskScore += 0.3;
    }

    // 2. USER RATE: Too many reviews from same user in short time
    const { data: userReviews } = await serviceClient
      .from("reviews")
      .select("id, created_at")
      .eq("user_id", userId)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (userReviews && userReviews.length >= 3) {
      fraudIndicators.push("1 saatda 3+ rəy yazılıb");
      riskScore += 0.25;
    }

    // 3. DUPLICATE CONTENT: Check for similar reviews
    const { data: recentReviews } = await serviceClient
      .from("reviews")
      .select("id, content")
      .neq("id", reviewId)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    let maxSimilarity = 0;
    let similarReviewId: string | null = null;

    if (recentReviews) {
      for (const existing of recentReviews) {
        const similarity = calculateSimilarity(content, existing.content);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          similarReviewId = existing.id;
        }
      }
    }

    if (maxSimilarity > 0.8) {
      fraudIndicators.push(`${Math.round(maxSimilarity * 100)}% oxşar rəy tapıldı`);
      riskScore += 0.35;
    } else if (maxSimilarity > 0.6) {
      fraudIndicators.push(`${Math.round(maxSimilarity * 100)}% oxşarlıq`);
      riskScore += 0.15;
    }

    // 4. BEHAVIOR ANALYSIS: Writing speed
    if (writingDurationSeconds !== undefined && writingDurationSeconds > 0) {
      const wordCount = content.split(/\s+/).length;
      const wpm = (wordCount / writingDurationSeconds) * 60;
      
      if (wpm > 200) {
        fraudIndicators.push(`Çox sürətli yazma: ${Math.round(wpm)} söz/dəq`);
        riskScore += 0.2;
      }
    }

    // 5. COPY-PASTE detection
    if (isCopyPaste) {
      fraudIndicators.push("Mətn copy-paste ilə daxil edilib");
      riskScore += 0.15;
    }

    // 6. Content length check (too short or suspiciously generic)
    if (content.length < 50) {
      fraudIndicators.push("Çox qısa rəy");
      riskScore += 0.1;
    }

    // Cap risk score at 1
    riskScore = Math.min(riskScore, 1);

    // Determine fraud type
    let fraudType = "none";
    if (riskScore > 0.5) {
      if (ipReviews && ipReviews.length >= 5) fraudType = "ip_abuse";
      else if (maxSimilarity > 0.8) fraudType = "duplicate_content";
      else if (isCopyPaste || (writingDurationSeconds && writingDurationSeconds < 10)) fraudType = "bot_behavior";
      else if (userReviews && userReviews.length >= 3) fraudType = "rapid_submission";
    }

    // Log fraud check
    await serviceClient.from("review_fraud_logs").insert({
      review_id: reviewId,
      user_id: userId,
      ip_address: clientIp,
      user_agent: userAgent,
      typing_speed_wpm: writingDurationSeconds ? (content.split(/\s+/).length / writingDurationSeconds) * 60 : null,
      is_copy_paste: isCopyPaste || false,
      similarity_score: maxSimilarity,
      similar_review_id: similarReviewId,
      fraud_type: fraudType,
      risk_score: riskScore,
    });

    // Auto-flag if high risk
    if (riskScore > 0.6) {
      await serviceClient
        .from("reviews")
        .update({
          is_flagged: true,
          flag_reason: `Saxtakarlıq riski: ${fraudIndicators.join("; ")}`,
        })
        .eq("id", reviewId);
    }

    // Update review with submission data
    await serviceClient
      .from("reviews")
      .update({
        writing_duration_seconds: writingDurationSeconds || null,
        submission_ip: clientIp,
      })
      .eq("id", reviewId);

    return new Response(
      JSON.stringify({
        riskScore,
        fraudType,
        indicators: fraudIndicators,
        flagged: riskScore > 0.6,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("detect-fraud error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Simple Jaccard similarity for text comparison
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  let intersection = 0;
  for (const word of words1) {
    if (words2.has(word)) intersection++;
  }
  
  const union = words1.size + words2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
