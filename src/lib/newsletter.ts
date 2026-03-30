// Newsletter subscription - calls the Cloudflare Worker endpoint
// which proxies to Buttondown with the API key stored server-side

interface SubscribeResult {
  success: boolean;
  error?: string;
}

export async function subscribe(email: string): Promise<SubscribeResult> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json() as SubscribeResult;
    return data;
  } catch {
    return { success: false, error: "Connection failed. Try again." };
  }
}
