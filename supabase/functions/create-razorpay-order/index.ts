import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, planName } = await req.json();

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const auth = btoa(`${keyId}:${keySecret}`);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects amount in paise
        currency: currency || "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          plan: planName,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Razorpay API error: ${error}`);
    }

    const order = await response.json();

    return new Response(
      JSON.stringify({ 
        orderId: order.id, 
        amount: order.amount,
        currency: order.currency,
        keyId: keyId // Send public key to frontend
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error creating Razorpay order:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
