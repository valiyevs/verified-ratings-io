import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch reviews for the company
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("content, rating, service_rating, price_rating, speed_rating, quality_rating, created_at")
      .eq("company_id", companyId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    if (!reviews || reviews.length === 0) {
      return new Response(JSON.stringify({ 
        keywords: { positive: [], negative: [] },
        trends: { improving: [], declining: [] },
        summary: "Analiz üçün kifayət qədər rəy yoxdur."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reviewTexts = reviews.map(r => `Reytinq: ${r.rating}/5, Rəy: ${r.content}`).join("\n\n");

    const analysisPrompt = `Aşağıdakı şirkət rəylərini analiz et və açar söz analizi həyata keçir.

Rəylər:
${reviewTexts}

JSON formatında aşağıdakıları qaytar:
{
  "positive_keywords": ["söz1", "söz2", ...],
  "negative_keywords": ["söz1", "söz2", ...],
  "strengths": ["güclü cəhət 1", "güclü cəhət 2", ...],
  "weaknesses": ["zəif cəhət 1", "zəif cəhət 2", ...],
  "common_themes": ["tema 1", "tema 2", ...],
  "sentiment_score": number (0-100),
  "recommendation": "string"
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
          { role: "system", content: "Sən şirkət rəylərini analiz edən AI assistentisən. JSON formatında cavab ver." },
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
        analysis = {
          positive_keywords: [],
          negative_keywords: [],
          strengths: [],
          weaknesses: [],
          common_themes: [],
          sentiment_score: 50,
          recommendation: "Analiz edilə bilmədi."
        };
      }
    } catch {
      analysis = {
        positive_keywords: [],
        negative_keywords: [],
        strengths: [],
        weaknesses: [],
        common_themes: [],
        sentiment_score: 50,
        recommendation: "Analiz edilə bilmədi."
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("analyze-company-keywords error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
