import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReviewAnalysisRequest {
  reviewId: string;
  content: string;
  companyId: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error("Missing or invalid Authorization header");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the JWT token by getting the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("JWT verification failed:", userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const userId = user.id;
    console.log("Authenticated user:", userId);

    const { reviewId, content, companyId, userId: reviewUserId }: ReviewAnalysisRequest = await req.json();
    
    // Verify the user is the one submitting the review (or is admin/moderator)
    if (userId !== reviewUserId) {
      // Check if user is admin or moderator using service role
      const serviceClient = createClient(
        supabaseUrl,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      
      const { data: roles } = await serviceClient
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      const isPrivileged = roles?.some(r => ['admin', 'moderator'].includes(r.role));
      if (!isPrivileged) {
        console.error("User not authorized to analyze this review");
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Analyze review for suspicious patterns
    const analysisPrompt = `Aşağıdakı rəyi analiz et və şübhəli olub-olmadığını müəyyən et.

Rəy: "${content}"

Aşağıdakı meyarları yoxla:
1. Çox ümumi və şəxsi təcrübə olmadan yazılıb?
2. Spam və ya reklam xarakterli sözlər var?
3. Həddən artıq mübaliğəli ifadələr istifadə edilib?
4. Mətn strukturu digər saxta rəylərə oxşayır?
5. Minimum 50 simvol uzunluqdamı?

JSON formatında cavab ver:
{
  "is_suspicious": boolean,
  "confidence": number (0-1),
  "reasons": string[],
  "sentiment": "positive" | "negative" | "neutral",
  "keywords": string[]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Sən rəy analiz edən AI assistentisən. JSON formatında cavab ver." },
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = { is_suspicious: false, confidence: 0.5, reasons: [], sentiment: "neutral", keywords: [] };
      }
    } catch {
      analysis = { is_suspicious: false, confidence: 0.5, reasons: [], sentiment: "neutral", keywords: [] };
    }

    // Calculate trust score (inverse of suspicion confidence)
    const trustScore = analysis.is_suspicious 
      ? Math.max(0.1, 1 - analysis.confidence) 
      : Math.min(1, 0.7 + (analysis.confidence * 0.3));

    // Update review with trust score using service role
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient
      .from('reviews')
      .update({ 
        trust_score: trustScore,
        is_flagged: analysis.is_suspicious && analysis.confidence > 0.7,
        flag_reason: analysis.is_suspicious 
          ? `AI: ${analysis.reasons?.slice(0, 3).join(', ') || 'Şübhəli məzmun'}` 
          : null
      })
      .eq('id', reviewId);

    return new Response(JSON.stringify({
      reviewId,
      analysis: {
        ...analysis,
        trust_score: trustScore
      },
      analyzed_at: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("analyze-review error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
