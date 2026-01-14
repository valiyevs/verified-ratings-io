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

interface NotifyReplyRequest {
  reviewId: string;
  companyName: string;
  replyContent: string;
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

    const userId = user.id;
    console.log("Authenticated user:", userId);

    const { reviewId, companyName, replyContent }: NotifyReplyRequest = await req.json();

    // Use service role client for data fetching
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Notify review reply for reviewId:", reviewId);

    // Get the review to find the user and verify authorization
    const { data: review, error: reviewError } = await serviceClient
      .from("reviews")
      .select("user_id, title, company_id")
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      console.error("Review not found:", reviewError);
      return new Response(JSON.stringify({ error: "Review not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller owns the company that the review is about (or is admin/moderator)
    const { data: company } = await serviceClient
      .from("companies")
      .select("owner_id")
      .eq("id", review.company_id)
      .single();

    if (!company || company.owner_id !== userId) {
      // Check if user is admin or moderator
      const { data: roles } = await serviceClient
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      const isPrivileged = roles?.some(r => ['admin', 'moderator'].includes(r.role));
      if (!isPrivileged) {
        console.error("User not authorized to send notifications for this company");
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // Get user's email and notification preferences from profile
    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("email, full_name, email_notifications_enabled, review_reply_notifications")
      .eq("user_id", review.user_id)
      .single();

    if (profileError || !profile?.email) {
      console.log("No email found for user");
      return new Response(JSON.stringify({ message: "No email to notify" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has notifications enabled
    if (profile.email_notifications_enabled === false || profile.review_reply_notifications === false) {
      console.log("User has disabled reply notifications");
      return new Response(JSON.stringify({ message: "User has disabled notifications" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailResponse = await resend.emails.send({
      from: "RəyAz <onboarding@resend.dev>",
      to: [profile.email],
      subject: `${companyName} rəyinizə cavab verdi`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Rəyinizə Cavab Var!</h1>
          <p>Hörmətli ${profile.full_name || "İstifadəçi"},</p>
          <p><strong>${companyName}</strong> şirkəti "${review.title}" başlıqlı rəyinizə cavab yazdı:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
            <p style="margin: 0; color: #333;">${replyContent}</p>
          </div>
          <p>
            <a href="https://reytings.az" style="color: #4F46E5; text-decoration: none;">
              Cavabı görmək üçün platformaya daxil olun →
            </a>
          </p>
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
    console.error("Error in notify-review-reply function:", error);
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
