import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const demoAccounts = [
      { email: "user@example.com", password: "password123", name: "Demo User", isAdmin: false },
      { email: "admin@example.com", password: "admin123", name: "Demo Admin", isAdmin: true },
    ];

    const results = [];

    for (const account of demoAccounts) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u) => u.email === account.email);

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        results.push({ email: account.email, status: "already exists", userId });
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: { name: account.name },
        });

        if (createError) {
          results.push({ email: account.email, status: "error", error: createError.message });
          continue;
        }

        userId = newUser.user.id;
        results.push({ email: account.email, status: "created", userId });
      }

      // Ensure profile exists
      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        name: account.name,
      });

      // Add admin role if needed
      if (account.isAdmin) {
        const { error: roleError } = await supabaseAdmin.from("user_roles").upsert(
          { user_id: userId, role: "admin" },
          { onConflict: "user_id,role" }
        );

        if (roleError) {
          results.push({ email: account.email, roleStatus: "error", error: roleError.message });
        } else {
          results.push({ email: account.email, roleStatus: "admin role added" });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
