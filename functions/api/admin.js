async function fsGet(env, path) {
    const projectId = env.FIREBASE_PROJECT_ID;
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`);
    if (res.status === 404) return null;
    const data = await res.json();
    return data;
}

async function fsSet(env, path, fieldsObj) {
    const projectId = env.FIREBASE_PROJECT_ID;
    let fields = {};
    for (const key in fieldsObj) {
        const val = fieldsObj[key];
        if (typeof val === 'string') fields[key] = { stringValue: val };
        else if (typeof val === 'number') fields[key] = { integerValue: val.toString() };
        else if (typeof val === 'boolean') fields[key] = { booleanValue: val };
    }
    await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
    });
}

async function fsDelete(env, path) {
    const projectId = env.FIREBASE_PROJECT_ID;
    await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`, {
        method: 'DELETE'
    });
}

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" } });
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    try {
        const input = await request.json();
        const ADMIN_PASS = "spsfuthu";

        if (input.secret !== ADMIN_PASS) {
            return Response.json({ success: false, message: "Unauthorized. Bad Password." }, { status: 403, headers: { "Access-Control-Allow-Origin": "*" } });
        }

        const now = Date.now();
        const platform = (input.platform || 'pw').toLowerCase();

        if (input.action === 'verify_admin') {
            return Response.json({ success: true, message: "Access Granted." }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        if (input.action === 'toggle_system') {
            await fsSet(env, 'settings/system', { status: input.state });
            return Response.json({ success: true, message: `System is now ${input.state}.` }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        if (input.action === 'generate_manual') {
            const prefix = platform.toUpperCase();
            const newKey = input.customKey || (`${prefix}-VIP-` + Math.random().toString(36).substr(2, 6).toUpperCase());
            const hours = parseInt(input.hours) || 24;
            const expiresAt = now + (hours * 60 * 60 * 1000);

            await fsSet(env, `keys_${platform}/${newKey}`, { created: now, expires: expiresAt, platform: platform, type: 'manual' });
            return Response.json({ success: true, message: `Key generated for /${platform}!`, key: newKey, hours: hours }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        if (input.action === 'delete_key') {
            await fsDelete(env, `keys_pw/${input.targetKey}`);
            await fsDelete(env, `keys_nt/${input.targetKey}`);
            await fsDelete(env, `keys_mj/${input.targetKey}`);
            return Response.json({ success: true, message: `Key ${input.targetKey} deleted permanently.` }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        if (input.action === 'kill_all') {
            await fsSet(env, 'settings/kill_epoch', { epoch: now });
            return Response.json({ success: true, message: "NUKE ACTIVATED. All previous keys are now dead." }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        return Response.json({ success: false, message: "Unknown action." });
    } catch (err) {
        return Response.json({ success: false, message: "Admin Error", error: err.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
}
