import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  console.log('=== AUTH CALLBACK ===');
  console.log('Code:', code ? 'EXISTS' : 'MISSING');
  console.log('Origin:', origin);
  console.log('Next:', next);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('Exchange result:', {
      session: data.session ? 'EXISTS' : 'NONE',
      user: data.user ? data.user.email : 'NONE',
      error: error?.message
    });

    if (!error && data.session) {
      // Check if user already has a company
      const { data: membership } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', data.user.id)
        .single();

      const redirectPath = membership ? '/dashboard' : '/onboarding';
      console.log('Redirecting to:', redirectPath);

      return NextResponse.redirect(`${origin}${redirectPath}`);
    }

    console.error('Session exchange failed:', error);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
