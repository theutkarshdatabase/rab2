// core.js - Cloudflare Absolute Stealth Engine
window.ParchamCore = async function(actionKey, params = {}, method = 'GET', payloadBody = null) {
    
    // Connects seamlessly to your Cloudflare Edge Function (/api/vault).
    // The Network Tab will only ever show "vault". ALL URLs are hidden.
    const VAULT_URL = "/api/data";
    
    try {
        const response = await fetch(VAULT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: actionKey,
                params: params,
                method: method,
                payload: payloadBody
            })
        });
        
        return await response.json();
    } catch (error) {
        console.error("Vault Connection Offline", error);
        return null;
    }
};
