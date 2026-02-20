import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const stripe = getStripe();
  const { priceId } = await request.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: member } = await supabase
    .from("company_members")
    .select("company_id, companies(stripe_customer_id, name)")
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "No company found" }, { status: 400 });
  }

  const company = (member as Record<string, unknown>).companies as Record<string, unknown>;
  let customerId = company.stripe_customer_id as string | null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: company.name as string,
      metadata: { company_id: member.company_id as string },
    });
    customerId = customer.id;

    await supabase.from("companies").update({
      stripe_customer_id: customerId,
    }).eq("id", member.company_id as string);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?billing=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?billing=canceled`,
    currency: "gbp",
  });

  return NextResponse.json({ url: session.url });
}
