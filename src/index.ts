export default {
  async fetch(request, env) {
    try {
      const inputs = {
        prompt: "cyberpunk cat",
      };

      console.log("Starting AI image generation...");
      const aiResponse = await env.AI.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        inputs,
      );

      console.log("AI response:", aiResponse);

      if (!aiResponse || !aiResponse.length) {
        console.error("AI image generation failed: Empty response");
        return new Response(JSON.stringify({
          error: "AI image generation failed",
          details: "Empty response from AI model"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      const imageBuffer = aiResponse[0];

      // Generate a unique filename using timestamp and random number
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 10000);
      const filename = `cyberpunk_cat_${timestamp}_${randomNum}.png`;

      console.log("Uploading to R2...");
      await env.MY_BUCKET.put(filename, imageBuffer, {
        httpMetadata: { contentType: "image/png" },
      });

      const publicUrl = `https://pub-5da2978a830945c7a746eff535eedeb7.r2.dev/${filename}`;

      return new Response(JSON.stringify({ url: publicUrl }), {
        headers: {
          "content-type": "application/json",
        },
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      return new Response(JSON.stringify({
        error: "An unexpected error occurred",
        details: error.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
} satisfies ExportedHandler<Env>;
