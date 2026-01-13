import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { reviewId, content, companyId, userId }: ReviewAnalysisRequest = await req.json();
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

    return new Response(JSON.stringify({
      reviewId,
      analysis,
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
