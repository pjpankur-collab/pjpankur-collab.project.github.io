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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName, userId } = await req.json();

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) {
      throw new Error("Razorpay secret not configured");
    }

    // Verify signature using Web Crypto API
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(keySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    // Update user subscription in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate subscription end date based on plan
    const now = new Date();
    let subscriptionEndsAt: Date;
    
    if (planName === "Trial") {
      subscriptionEndsAt = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
    } else {
      subscriptionEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_subscribed: true,
        subscription_ends_at: subscriptionEndsAt.toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Payment verified and subscription activated" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error verifying payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
