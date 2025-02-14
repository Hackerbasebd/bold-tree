export default {
  async fetch(request, env) {
    const inputs = {
      prompt: "cyberpunk cat",
    };

    const aiResponse = await env.AI.run(
      "@cf/stabilityai/stable-diffusion-xl-base-1.0",
      inputs,
    );

    // Check if the AI response is successful
    if (!aiResponse.ok) {
      return new Response('AI image generation failed', { status: 500 });
    }

    // Get the image data as an ArrayBuffer
    const imageBuffer = await aiResponse.arrayBuffer();

    // Generate a unique filename using timestamp and random number
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    const filename = `cyberpunk_cat_${timestamp}_${randomNum}.png`;

    // Upload the image to R2
    await env.MY_BUCKET.put(filename, imageBuffer, {
      httpMetadata: { contentType: "image/png" },
    });

    // Construct the public URL
    const publicUrl = `https://pub-5da2978a830945c7a746eff535eedeb7.r2.dev/${filename}`;

    // Return the URL in the response
    return new Response(JSON.stringify({ url: publicUrl }), {
      headers: {
        "content-type": "application/json",
      },
    });
  },
} satisfies ExportedHandler<Env>;
