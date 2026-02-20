"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugPage() {
  const [info, setInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkEverything() {
      const supabase = createClient();

      const debugData: any = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        env: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'MISSING',
        }
      };

      // Check session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      debugData.session = {
        exists: !!sessionData.session,
        error: sessionError?.message || null,
        expiresAt: sessionData.session?.expires_at || null,
      };

      // Check user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      debugData.user = {
        exists: !!userData.user,
        email: userData.user?.email || null,
        id: userData.user?.id || null,
        error: userError?.message || null,
      };

      // Check cookies
      debugData.cookies = document.cookie.split(';').map(c => {
        const [name] = c.trim().split('=');
        return name;
      });

      // If user exists, check company membership
      if (userData.user) {
        const { data: membership, error: memberError } = await supabase
          .from('company_members')
          .select('company_id, role')
          .eq('user_id', userData.user.id)
          .maybeSingle();

        debugData.membership = {
          exists: !!membership,
          companyId: membership?.company_id || null,
          role: membership?.role || null,
          error: memberError?.message || null,
        };
      }

      setInfo(debugData);
      setLoading(false);
    }

    checkEverything();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading debug info...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>🔍 Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-100 p-4 rounded-lg overflow-auto text-xs">
            {JSON.stringify(info, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
