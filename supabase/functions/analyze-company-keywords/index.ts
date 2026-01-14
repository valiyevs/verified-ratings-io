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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
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

    const { companyId } = await req.json();
    
    // Use service role client for data fetching
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user owns the company or is admin/moderator
    const { data: company } = await serviceClient
      .from('companies')
      .select('owner_id')
      .eq('id', companyId)
      .single();

    if (!company || company.owner_id !== userId) {
      // Check if user is admin or moderator
      const { data: roles } = await serviceClient
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      const isPrivileged = roles?.some(r => ['admin', 'moderator'].includes(r.role));
      if (!isPrivileged) {
        console.error("User not authorized to analyze this company");
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

    // Fetch reviews for the company
    const { data: reviews, error } = await serviceClient
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
