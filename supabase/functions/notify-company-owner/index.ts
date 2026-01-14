import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore - Resend npm package
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  companyId: string;
  reviewTitle: string;
  reviewerName: string;
  rating: number;
}

const handler = async (req: Request): Promise<Response> => {
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

    console.log("Authenticated user:", user.id);

    const { companyId, reviewTitle, reviewerName, rating }: NotifyRequest = await req.json();

    // Use service role client for data fetching
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get company with owner info
    const { data: company, error: companyError } = await serviceClient
      .from("companies")
      .select("name, owner_id, email")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      console.error("Company not found:", companyError);
      return new Response(JSON.stringify({ error: "Company not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get owner's email from profile
    let ownerEmail = company.email;
    if (company.owner_id) {
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("email")
        .eq("user_id", company.owner_id)
        .single();
      
      if (profile?.email) {
        ownerEmail = profile.email;
      }
    }

    if (!ownerEmail) {
      console.log("No email found for company owner");
      return new Response(JSON.stringify({ message: "No email to notify" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stars = "⭐".repeat(rating);
    
    const emailResponse = await resend.emails.send({
      from: "RəyAz <onboarding@resend.dev>",
      to: [ownerEmail],
      subject: `Yeni rəy: ${company.name} üçün ${rating} ulduzlu rəy`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Yeni Rəy Bildirişi</h1>
          <p>Hörmətli ${company.name} nümayəndəsi,</p>
          <p>Şirkətiniz üçün yeni rəy yazılıb:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Başlıq:</strong> ${reviewTitle}</p>
            <p><strong>Yazan:</strong> ${reviewerName}</p>
            <p><strong>Reytinq:</strong> ${stars} (${rating}/5)</p>
          </div>
          <p>Rəy moderator tərəfindən təsdiqlədikdən sonra şirkət səhifənizdə görünəcək.</p>
          <p style="color: #666; font-size: 14px;">Bu e-poçt RəyAz platforması tərəfindən avtomatik göndərilib.</p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in notify-company-owner function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
