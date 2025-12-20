import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BELVO_API_URL = "https://sandbox.belvo.com"; // Use "https://api.belvo.com" for production

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify JWT and check user role
    const authorizationHeader = req.headers.get("Authorization");
    if (!authorizationHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authorizationHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has admin or manager role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "manager"]);

    if (roleError || !roleData || roleData.length === 0) {
      console.error("Role check failed:", roleError);
      return new Response(JSON.stringify({ error: "Insufficient permissions. Admin or manager role required." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Belvo integration accessed by user: ${user.id} with role: ${roleData[0].role}`);

    const BELVO_SECRET_ID = Deno.env.get("BELVO_SECRET_ID");
    const BELVO_SECRET_PASSWORD = Deno.env.get("BELVO_SECRET_PASSWORD");

    if (!BELVO_SECRET_ID || !BELVO_SECRET_PASSWORD) {
      throw new Error("Belvo credentials not configured");
    }

    const belvoAuthHeader = btoa(`${BELVO_SECRET_ID}:${BELVO_SECRET_PASSWORD}`);
    const { action, payload } = await req.json();

    console.log(`Belvo integration action: ${action}`);

    let response;

    switch (action) {
      case "create_widget_token":
        // Create a widget access token for the Belvo Connect widget
        response = await fetch(`${BELVO_API_URL}/api/token/`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${belvoAuthHeader}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: BELVO_SECRET_ID,
            password: BELVO_SECRET_PASSWORD,
            scopes: "read_institutions,write_links,read_links",
            widget: {
              branding: {
                company_name: "Lander 360º",
              },
            },
          }),
        });
        break;

      case "list_institutions":
        // List available banking institutions
        response = await fetch(`${BELVO_API_URL}/api/institutions/?country_code=BR&type__in=bank,fiscal`, {
          method: "GET",
          headers: {
            "Authorization": `Basic ${belvoAuthHeader}`,
            "Content-Type": "application/json",
          },
        });
        break;

      case "create_link":
        // Create a link to a bank account
        response = await fetch(`${BELVO_API_URL}/api/links/`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${belvoAuthHeader}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            institution: payload.institution,
            username: payload.username,
            password: payload.password,
            access_mode: "recurrent",
          }),
        });
        break;

      case "list_links":
        // List connected bank links
        response = await fetch(`${BELVO_API_URL}/api/links/`, {
          method: "GET",
          headers: {
            "Authorization": `Basic ${belvoAuthHeader}`,
            "Content-Type": "application/json",
          },
        });
        break;

      case "get_accounts":
        // Get accounts for a link
        response = await fetch(`${BELVO_API_URL}/api/accounts/`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${belvoAuthHeader}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            link: payload.link_id,
          }),
        });
        break;

      case "get_transactions":
        // Get transactions for a link
        response = await fetch(`${BELVO_API_URL}/api/transactions/`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${belvoAuthHeader}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            link: payload.link_id,
            date_from: payload.date_from,
            date_to: payload.date_to,
          }),
        });
        break;

      case "delete_link":
        // Delete a bank link
        response = await fetch(`${BELVO_API_URL}/api/links/${payload.link_id}/`, {
          method: "DELETE",
          headers: {
            "Authorization": `Basic ${belvoAuthHeader}`,
          },
        });
        
        if (response.status === 204) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Belvo API error: ${response.status}`, errorText);
      return new Response(JSON.stringify({ error: errorText }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Belvo integration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
