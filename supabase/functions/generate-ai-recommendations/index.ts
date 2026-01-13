import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecommendationRequest {
  companyId: string;
  companyName: string;
  category: string;
  averageRating: number;
  reviewCount: number;
  reviews: Array<{
    rating: number;
    content: string;
    service_rating?: number;
    price_rating?: number;
    speed_rating?: number;
    quality_rating?: number;
  }>;
  competitorRanking: number;
  totalInCategory: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: RecommendationRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build review summary
    const reviewSummary = request.reviews.slice(0, 20).map(r => 
      `Reytinq: ${r.rating}/5, Rəy: "${r.content.substring(0, 200)}"`
    ).join('\n');

    const criteriaAvg = request.reviews.length > 0 ? {
      service: request.reviews.reduce((s, r) => s + (r.service_rating || 0), 0) / request.reviews.length,
      price: request.reviews.reduce((s, r) => s + (r.price_rating || 0), 0) / request.reviews.length,
      speed: request.reviews.reduce((s, r) => s + (r.speed_rating || 0), 0) / request.reviews.length,
      quality: request.reviews.reduce((s, r) => s + (r.quality_rating || 0), 0) / request.reviews.length,
    } : null;

    const prompt = `Sən biznes məsləhətçisisən. Aşağıdakı şirkət üçün reytinqini yüksəltmək üçün praktik tövsiyələr ver.

Şirkət: ${request.companyName}
Kateqoriya: ${request.category}
Cari reytinq: ${request.averageRating.toFixed(1)}/5
Rəy sayı: ${request.reviewCount}
Kateqoriyada sıralama: ${request.competitorRanking}/${request.totalInCategory}

${criteriaAvg ? `Meyarlar üzrə ortalama:
- Xidmət: ${criteriaAvg.service.toFixed(1)}/5
- Qiymət: ${criteriaAvg.price.toFixed(1)}/5
- Sürət: ${criteriaAvg.speed.toFixed(1)}/5
- Keyfiyyət: ${criteriaAvg.quality.toFixed(1)}/5` : ''}

Son rəylər:
${reviewSummary}

Aşağıdakı formatda JSON cavab ver:
{
  "overall_assessment": "Şirkətin ümumi vəziyyəti haqqında qısa qiymət",
  "ranking_insight": "Kateqoriyada mövqe haqqında şərh",
  "priority_areas": ["Təcili diqqət tələb edən 3 sahə"],
  "recommendations": [
    {
      "title": "Tövsiyə başlığı",
      "description": "Ətraflı izahat",
      "impact": "high/medium/low",
      "timeframe": "Həyata keçirmə müddəti"
    }
  ],
  "quick_wins": ["Tez nəticə verəcək 3 sadə addım"],
  "competitor_advantage": "Rəqiblərdən fərqlənmək üçün tövsiyə"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Sən biznes analitika və müştəri məmnuniyyəti üzrə ekspertisən. Praktik və həyata keçirilə bilən tövsiyələr ver." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", await response.text());
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    let recommendations;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        recommendations = {
          overall_assessment: "Analiz edilə bilmədi",
          ranking_insight: "",
          priority_areas: [],
          recommendations: [],
          quick_wins: [],
          competitor_advantage: ""
        };
      }
    } catch {
      recommendations = {
        overall_assessment: content,
        ranking_insight: "",
        priority_areas: [],
        recommendations: [],
        quick_wins: [],
        competitor_advantage: ""
      };
    }

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-ai-recommendations error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
