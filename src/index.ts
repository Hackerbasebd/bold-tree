interface Env {
  AI: {
    run: (model: string, inputs: any) => Promise<Response>;
  };
  MY_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const inputs = {
        prompt: "cyberpunk cat",
      };

      // Generate the image using Stable Diffusion
      const imageResponse = await env.AI.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        inputs
      );

      if (!imageResponse.ok) {
        throw new Error(`AI image generation failed: ${imageResponse.statusText}`);
      }

      // Convert the image response to a Uint8Array
      const imageBuffer = await imageResponse.arrayBuffer();
      const imageArray = new Uint8Array(imageBuffer);

      // Generate a unique filename
      const filename = `cyberpunk-cat-${Date.now()}.png`;

      // Store the image in R2
      await env.MY_BUCKET.put(filename, imageArray, {
        httpMetadata: {
          contentType: "image/png",
        },
      });

      // Construct the R2 URL
      const r2Url = `https://pub-5da2978a830945c7a746eff535eedeb7.r2.dev/${filename}`;

      // Return the R2 URL as the response
      return new Response(JSON.stringify({ url: r2Url }), {
        headers: {
          "content-type": "application/json",
        },
      });
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: 'An error occurred while processing your request' }), {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      });
    }
  },
};
