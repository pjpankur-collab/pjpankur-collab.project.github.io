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
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a nutrition expert specializing in Indian food. Analyze food images and return JSON with nutrition info.
            
            Return ONLY valid JSON in this exact format (no markdown, no code fences, no extra text):
            {
              "food_name": "name of the dish",
              "serving_size": "estimated portion size",
              "calories": number,
              "protein_g": number,
              "carbs_g": number,
              "fat_g": number,
              "fiber_g": number,
              "confidence": "high/medium/low"
            }
            
            Focus on Indian foods like roti, dal, rice, sabzi, dosa, idli, biryani, paneer dishes, etc.
            Be accurate with typical portion sizes. Return ONLY the JSON object, nothing else.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this food image and provide nutrition information. Return ONLY a JSON object." },
              { type: "image_url", image_url: { url: imageBase64 } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error(`AI analysis failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("Raw AI response content:", content.substring(0, 500));
    
    // Clean the content: remove markdown code fences if present
    let cleanedContent = content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    
    // Try to parse JSON from response
    let nutrition;
    
    // First try direct parse
    try {
      nutrition = JSON.parse(cleanedContent);
    } catch {
      // Try regex extraction
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          nutrition = JSON.parse(jsonMatch[0]);
        } catch (parseErr) {
          console.error("Failed to parse extracted JSON:", jsonMatch[0].substring(0, 200));
          throw new Error("Could not parse nutrition data from AI response");
        }
      } else {
        console.error("No JSON object found in response:", cleanedContent.substring(0, 200));
        throw new Error("Could not parse nutrition data");
      }
    }

    // Validate required fields and provide defaults
    const result = {
      food_name: nutrition.food_name || "Unknown food",
      serving_size: nutrition.serving_size || "1 serving",
      calories: Number(nutrition.calories) || 0,
      protein_g: Number(nutrition.protein_g) || 0,
      carbs_g: Number(nutrition.carbs_g) || 0,
      fat_g: Number(nutrition.fat_g) || 0,
      fiber_g: Number(nutrition.fiber_g) || 0,
      confidence: nutrition.confidence || "medium",
    };
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
