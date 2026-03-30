// Cloudflare Worker - proxies newsletter subscriptions to Buttondown
// The API key is stored as a Cloudflare secret, never exposed to the browser
//
// Set the secret with:
//   npx wrangler secret put BUTTONDOWN_API_KEY
//   (paste your key when prompted)

interface Env {
  BUTTONDOWN_API_KEY: string;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle the subscribe API endpoint
    if (url.pathname === "/api/subscribe") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }
      if (request.method === "POST") {
        return handleSubscribe(request, env);
      }
    }

    // Everything else is served from static assets
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function handleSubscribe(request: Request, env: Env): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email || !email.includes("@")) {
      return Response.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400, headers: corsHeaders }
      );
    }

    const res = await fetch("https://api.buttondown.com/v1/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${env.BUTTONDOWN_API_KEY}`,
      },
      body: JSON.stringify({ email_address: email }),
    });

    // 201 = created, 409 = already subscribed (both are success)
    if (res.status === 201 || res.status === 409) {
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    return Response.json(
      { success: false, error: "Something went wrong. Try again." },
      { status: 500, headers: corsHeaders }
    );
  } catch {
    return Response.json(
      { success: false, error: "Something went wrong. Try again." },
      { status: 500, headers: corsHeaders }
    );
  }
}
