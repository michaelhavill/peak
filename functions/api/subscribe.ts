// Cloudflare Pages Function - proxies newsletter subscriptions to Buttondown
// The API key is set in Cloudflare Pages dashboard:
//   Settings > Environment variables > Add: BUTTONDOWN_API_KEY

interface Env {
  BUTTONDOWN_API_KEY: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
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
};
