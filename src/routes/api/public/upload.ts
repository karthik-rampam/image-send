import { createFileRoute } from "@tanstack/react-router";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export const Route = createFileRoute("/api/public/upload")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders }),

      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            name?: string;
            image_data?: string;
            width?: number;
            height?: number;
            size_bytes?: number;
          };

          if (!body?.image_data || !body?.name) {
            return new Response(
              JSON.stringify({ error: "Missing name or image_data" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              },
            );
          }

          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );

          const { data, error } = await supabaseAdmin
            .from("captures")
            .insert({
              name: body.name,
              image_data: body.image_data,
              width: body.width ?? null,
              height: body.height ?? null,
              size_bytes: body.size_bytes ?? null,
            })
            .select("id, created_at")
            .single();

          if (error) throw error;

          return new Response(
            JSON.stringify({ ok: true, id: data.id, created_at: data.created_at }),
            {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            },
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : "Upload failed";
          console.error("Upload error:", err);
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      },
    },
  },
});