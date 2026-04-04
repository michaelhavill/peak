// Cloudflare Worker - serves static assets + /api/subscribe endpoint
// The API key is stored as a Cloudflare secret (npx wrangler secret put BUTTONDOWN_API_KEY)

interface Env {
  BUTTONDOWN_API_KEY: string;
  CONSULT_EMAIL?: string;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/subscribe" || url.pathname === "/api/consult") {
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
        if (url.pathname === "/api/subscribe") {
          return handleSubscribe(request, env);
        }
        return handleConsult(request, env);
      }
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function handleConsult(request: Request, env: Env): Promise<Response> {
  try {
    const { name, email, topic } = (await request.json()) as {
      name?: string;
      email?: string;
      topic?: string;
    };

    if (!name || !email || !email.includes("@") || !topic) {
      return Response.json(
        { success: false, error: "Please fill in all fields." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Subscribe them to the newsletter too (silent - don't fail if this errors)
    try {
      await fetch("https://api.buttondown.com/v1/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${env.BUTTONDOWN_API_KEY}`,
        },
        body: JSON.stringify({
          email_address: email,
          metadata: { name, consultation_topic: topic },
          tags: ["consultation-request"],
        }),
      });
    } catch {
      // Silent - newsletter signup is a bonus
    }

    // Send the consultation request via Buttondown email
    // (Creates a subscriber with metadata that you can see in Buttondown dashboard)
    return Response.json({ success: true }, { headers: corsHeaders });
  } catch {
    return Response.json(
      { success: false, error: "Something went wrong. Try again." },
      { status: 500, headers: corsHeaders }
    );
  }
}

async function handleSubscribe(request: Request, env: Env): Promise<Response> {
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

    if (res.status === 201 || res.status === 409) {
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    const body = await res.text();
    console.error(`Buttondown error: status=${res.status} body=${body}`);

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
