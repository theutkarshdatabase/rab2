export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    const requestedId = url.searchParams.get('id');

    // MODE 1: Dynamic single deep-dive payload via Core Proxy 
    if (requestedId) {
        try {
            // Directly stream precise metadata from target provider when clicked
            let bDetails = await context.env.ParchamCore?.('pw_btch_dtl', { batchId: requestedId }) || {};
            return Response.json(bDetails, { headers: corsHeaders });
        } catch(e) {
            return Response.json({ data: null, error: "Failed fetching backend parameters" }, { headers: corsHeaders });
        }
    }

    // MODE 2: Serve raw lightweight array saved in KV to client
    try {
        if (env.PW_KV) {
            const rawKVData = await env.PW_KV.get('batches_cache');
            return new Response(rawKVData || "[]", { headers: corsHeaders });
        }
    } catch (e) {
        console.error("KV read pipeline failure", e);
    }

    return new Response("[]", { headers: corsHeaders });
}
