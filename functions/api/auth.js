async function fsGet(env, path) {
    const projectId = env.FIREBASE_PROJECT_ID;
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`);
    if (res.status === 404) return null;
    const data = await res.json();
    return parseDoc(data);
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

function parseDoc(doc) {
    if (!doc || !doc.fields) return null;
    let res = {};
    for (const key in doc.fields) {
        const v = doc.fields[key];
        res[key] = v.stringValue !== undefined ? v.stringValue :
                   v.integerValue !== undefined ? parseInt(v.integerValue) :
                   v.booleanValue !== undefined ? v.booleanValue : null;
    }
    return res;
}

export async function onRequest(context) {
    const { request, env } = context;
    if (request.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    try {
        const input = await request.json();
        const now = Date.now();
        const platform = (input.platform || 'pw').toLowerCase();

        // System Status Check
        const sys = await fsGet(env, 'settings/system');
        if (sys && sys.status === 'OFF') {
            return Response.json({ success: true, system_off: true, expires: now + (30 * 24 * 60 * 60 * 1000) }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        const kill = await fsGet(env, 'settings/kill_epoch');
        const killEpoch = kill ? kill.epoch : 0;

        // 1. Create Ad Session
        if (input.action === 'create_ad_session') {
            const currentKey = input.current_key;
            if (currentKey) {
                const kData = await fsGet(env, `keys_${platform}/${currentKey}`);
                if (kData) {
                    const hoursSince = (now - kData.created) / (60 * 60 * 1000);
                    if (hoursSince < 24 && now < kData.expires) {
                        return Response.json({ success: false, message: `Cooldown active. Please wait ${Math.ceil(24 - hoursSince)} hours.` }, { headers: { "Access-Control-Allow-Origin": "*" } });
                    }
                }
            }

            const token = 'TKN-' + platform.toUpperCase() + '-' + Math.random().toString(36).substr(2, 10).toUpperCase();
            await fsSet(env, `tokens/${token}`, { time: now, platform: platform });
            return Response.json({ success: true, token: token }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // 2. Verify Ad Return
        if (input.action === 'verify_ad_return') {
            const token = input.token;
            if (!token) return Response.json({ success: false, message: "Security Error: Missing token." }, { headers: { "Access-Control-Allow-Origin": "*" } });

            const tData = await fsGet(env, `tokens/${token}`);
            if (!tData) return Response.json({ success: false, message: "Token expired or invalid." }, { headers: { "Access-Control-Allow-Origin": "*" } });

            if (now - tData.time < 15000) {
                return Response.json({ success: false, message: "Task completed too quickly." }, { headers: { "Access-Control-Allow-Origin": "*" } });
            }

            await fsDelete(env, `tokens/${token}`);

            const prefix = tData.platform.toUpperCase();
            const newKey = `${prefix}-ARO-` + Math.random().toString(36).substr(2, 9).toUpperCase();
            const expiresAt = now + (48 * 60 * 60 * 1000);

            await fsSet(env, `keys_${tData.platform}/${newKey}`, { created: now, expires: expiresAt, platform: tData.platform, type: 'arolinks' });

            return Response.json({ success: true, key: newKey, expires: expiresAt, platform: tData.platform }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // 3. Verify Standard Key
        if (input.action === 'verify_key') {
            const keyToVerify = input.key;
            if (keyToVerify === 'spsfuthu' || keyToVerify === 'spsputhu') {
                return Response.json({ success: true, expires: now + (24 * 60 * 60 * 1000) }, { headers: { "Access-Control-Allow-Origin": "*" } });
            }

            const kData = await fsGet(env, `keys_${platform}/${keyToVerify}`);
            if (!kData) {
                return Response.json({ success: false, message: `Invalid or expired key for portal /${platform}.` }, { headers: { "Access-Control-Allow-Origin": "*" } });
            }

            if (kData.created < killEpoch) {
                await fsDelete(env, `keys_${platform}/${keyToVerify}`);
                return Response.json({ success: false, message: "Key revoked by Admin." }, { headers: { "Access-Control-Allow-Origin": "*" } });
            }

            if (now > kData.expires) {
                return Response.json({ success: false, message: "Key has expired." }, { headers: { "Access-Control-Allow-Origin": "*" } });
            }

            return Response.json({ success: true, expires: kData.expires }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        return Response.json({ success: false, message: "Unknown action." }, { status: 400 });
    } catch (err) {
        return Response.json({ success: false, message: "Server Error", error: err.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
}
