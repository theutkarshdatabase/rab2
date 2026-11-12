// ==========================================
// 🚀 PW DATA PROXY ENGINE (data.js) - ULTIMATE WAF BYPASS
// Features: Direct Fetch, Indian Mobile IPs, New UUIDs, 3x Auto-Retry Loop, No Cache
// ==========================================

const MASTER_TOKENS = [
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjY4MDE2YWRhMzQxOTVkYmU5YzFlYmVkOSIsImNvdW50cnlHcm91cCI6IklOIiwib3JnYW5pemF0aW9uIjp7Il9pZCI6IjVlYjM5M2VlOTVmYWI3NDY4YTc5ZDE4OSJ9LCJyb2xlcyI6WyI1YjI3YmQ5NjU4NDJmOTUwYTc3OGM2ZWYiXSwidHlwZSI6IlVTRVIiLCJ1c2VybmFtZSI6IjczNTU1NDUzNzkifSwiZXhwIjoxNzk1MDk4OTY1LjUyOCwiaWF0IjoxNzk0NDk0MTY1LCJqdGkiOiJnd0J6ZGJXQVJnT0JNZ09lQ3Y3aGZnXzY4MDE2YWRhMzQxOTVkYmU5YzFlYmVkOSJ9.RZ2iSU_gEXb1RhVJLdKQ2gIxlbVEAcV6AuA1skjdrig",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjY2ZWNmMDk5MzRiNjY5NmFlYzE3YTI0OCIsImNvdW50cnlHcm91cCI6IklOIiwib3JnYW5pemF0aW9uIjp7Il9pZCI6IjVlYjM5M2VlOTVmYWI3NDY4YTc5ZDE4OSJ9LCJyb2xlcyI6WyI1YjI3YmQ5NjU4NDJmOTUwYTc3OGM2ZWYiXSwidHlwZSI6IlVTRVIiLCJ1c2VybmFtZSI6Ijg3MDc4MjYyOTkifSwiZXhwIjoxNzk1MDk3MDg1LjQ2MywiaWF0IjoxNzk0NDkyMjg1LCJqdGkiOiJiOUhqVkEzeFNrQ3pMRTJ3ejNDOG9nXzY2ZWNmMDk5MzRiNjY5NmFlYzE3YTI0OCJ9.haONFaNt0BOzOHxfsZ4iovUHCmx-CL3zb2tB5dZhBBE"
];

// 🔥 GENERATES REAL INDIAN MOBILE NETWORK IPs (Jio, Airtel, VI) TO BYPASS WAF 🔥
function generateIndianMobileIP() {
    const blocks = [
        [49, Math.floor(Math.random() * 12) + 32],   // Jio
        [223, Math.floor(Math.random() * 64) + 176], // Airtel
        [157, Math.floor(Math.random() * 20) + 32],  // Idea/Vodafone
        [106, Math.floor(Math.random() * 30) + 192]  // Jio
    ];
    const block = blocks[Math.floor(Math.random() * blocks.length)];
    return `${block[0]}.${block[1]}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

export async function onRequest(context) {
    const { request } = context;

    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    if (request.method !== "POST") {
        return Response.json({ success: false, message: `Method ${request.method} not allowed.` }, { 
            status: 405, headers: { "Access-Control-Allow-Origin": "*" } 
        });
    }

    try {
        const input = await request.json();
        const action = input.action;
        const params = input.params || {};
        const method = (input.method || 'GET').toUpperCase(); 
        const payload = input.payload || null;

        if (!action) {
            return Response.json({ success: false, message: "Missing action" }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        const PW_API = "https://api.penpencil.co";
        let targetUrl = "";
        let resumeUrl = ""; 

        // --- THE SECRET DICTIONARY ---
        switch (action) {
            case 'pw_v2_list': targetUrl = `${PW_API}/v2/batches/634bd315ed7a360018558283/subject/${params.subjectId}/contents?tag=${params.tagId}&contentType=videos&limit=100000`; break;
            case 'pw_sp_sig': targetUrl = `https://pw.studybeepro.in/api/get-video-url?batchId=${params.batchId}&subjectId=${params.subjectSlug}&childId=${params.schId}&videoId=${params.videoId}`; break;
            case 'pw_sp_otp': targetUrl = `https://pw.studybeepro.in/api/get-otp?kid=${params.kid}`; break;
            case 'pw_btch_dtl': targetUrl = `${PW_API}/v3/batches/${params.batchId}/details`; break;
            case 'pw_tchr_dtl': targetUrl = `${PW_API}/v1/batches/${params.batchId}/${params.teacherId}/teacher-details`; break;
            case 'pw_topics': targetUrl = `${PW_API}/batch-service/v1/batch-tags/${params.batchId}/topics?page=${params.page || 1}&batchSubjectIds=${params.subjectIds}`; break;
            case 'pw_sub_topics': targetUrl = `${PW_API}/batch-service/v1/batch-tags/${params.batchId}/subject/${params.subjectId}/topics?page=${params.page || 1}&batchTagType=${params.tagType || ''}&limit=${params.limit || 50}`; break;
            case 'pw_res_topics': targetUrl = `${PW_API}/batch-service/v1/batch-tags/${params.batchId}/topics?page=1&batchSubjectIds=${params.subjectIds}`; break;
            case 'pw_tdy_sch': targetUrl = `${PW_API}/v2/batches/${params.batchId}/todays-schedule?batchId=${params.batchId}`; break;
            case 'pw_wkly_sch': targetUrl = `${PW_API}/v2/batches/${params.batchId}/weekly-schedules?batchId=${params.batchId}&startDate=${params.startDate}&endDate=${params.endDate}&page=${params.page || 1}`; break;
            case 'pw_sch_cntnt': targetUrl = `${PW_API}/batch-service/v3/batch-subject-schedules/${params.batchId}/subject/${params.subjectId}/contents?skip=${params.skip || 0}&limit=${params.limit || 50}&contentType=${params.contentType}&contentFilter=ALL&tagId=${params.tagId}`; break;
            case 'pw_sch_dtl': targetUrl = `${PW_API}/v1/batches/69fec994c47cb56afb44949f/subject/${params.subjectId}/schedule/${params.scheduleId}/schedule-details`; break;
            case 'pw_slides': targetUrl = `${PW_API}/v1/batches/${params.batchId}/subject/${params.subjectId}/schedule/${params.scheduleId}/slides`; break;
            case 'pw_notes': targetUrl = `${PW_API}/v1/batches/${params.batchId}/subject/${params.subjectId}/schedule/${params.scheduleId}/notes`; break;
            case 'get-video-url': targetUrl = `${PW_API}/v1/batches/634bd315ed7a360018558283/subject/${params.subjectId}/schedule/${params.scheduleId}/schedule-details`; break;
            case 'pw_btest_strt': targetUrl = `https://www.learnxpw.site/api/batch-tests?testId=${params.testId}&batchId=${params.batchId}&type=Start&testSource=BATCH_TEST_SERIES`; resumeUrl = `https://www.learnxpw.site/api/batch-tests?testId=${params.testId}&batchId=${params.batchId}&type=Resume&testSource=BATCH_TEST_SERIES`; break;
            case 'pw_test_strt': targetUrl = `https://www.learnxpw.site/api/dpp-tests?testId=${params.testId}&batchId=${params.batchId}&type=Start&batchScheduleId=${params.scheduleId || params.batchScheduleId || ''}&subjectId=${params.subjectId || params.batchSubjectId || ''}&exerciseId=${params.testId}&testSource=BATCH_QUIZ`; resumeUrl = `https://www.learnxpw.site/api/dpp-tests?testId=${params.testId}&batchId=${params.batchId}&type=Resume&batchScheduleId=${params.scheduleId || params.batchScheduleId || ''}&subjectId=${params.subjectId || params.batchSubjectId || ''}&exerciseId=${params.testId}&testSource=BATCH_QUIZ`; break;
            case 'pw_dpp_lst': targetUrl = `${PW_API}/v3/test-service/tests/new-dpp-list?page=${params.page || 1}&batchId=${params.batchId}&batchSubjectId=${params.subjectId}&chapterId=${params.chapterId}&dppType=ALL&limit=${params.limit || 50}`; break;
            case 'pw_test_lst': targetUrl = `${PW_API}/v3/test-service/tests?testType=All&testStatus=All&attemptStatus=All&batchId=${params.batchId}&isSubjective=false&isPurchased=true&limit=${params.limit || 50}`; break;
            case 'pw_test_map': targetUrl = `${PW_API}/v3/test-service/tests/user-test-student-mapping-list`; break;
            case 'pw_vid_cmnts': targetUrl = `${PW_API}/v1/comments/${params.schId}?isPinned=true&limit=20&lastSeenId=${params.lastSeenId || ''}`; break;
            case 'pw_chat_get': targetUrl = `${PW_API}/v1/conversation/${params.conversationId}/chat?limit=${params.limit || 20}&lastSeenId=${params.lastSeenId || ''}`; break;
            case 'pw_chat_post': targetUrl = `${PW_API}/v1/conversation/${params.conversationId}/chat`; break;
            case 'pw_poll_actv': targetUrl = `${PW_API}/v2/poll/entity/${params.scheduleId}/active-poll`; break;
            case 'pw_poll_vote': targetUrl = `${PW_API}/v2/poll/upvote-poll`; break;
            case 'pw_com_chnl': targetUrl = `https://pw-api-gate.penpencil.co/v3/community/channels/batch/${params.batchId}`; break;
            case 'pw_com_posts': targetUrl = `https://pw-api-gate.penpencil.co/v3/community/posts/v2?channelId=${params.channelId}&page=${params.page || 1}&timestamp=${params.timestamp}`; break;
            case 'pw_com_create': targetUrl = `https://pw-api-gate.penpencil.co/v3/community/posts`; break;
            case 'pw_com_react': targetUrl = `https://pw-api-gate.penpencil.co/v3/community/posts/${params.postId}/reactions`; break;
            case 'pw_com_views': targetUrl = `https://pw-api-gate.penpencil.co/v3/community/posts/${params.postId}/views`; break;
            case 'pw_com_cmnts': targetUrl = `${PW_API}/v1/comments/${params.postId}?type=${params.type}&limit=${params.limit || 20}&skip=${params.skip || 0}`; break;
            case 'pw_com_cmnt_mk': targetUrl = `${PW_API}/v1/comments`; break;
            case 'pw_usr_prof': targetUrl = `${PW_API}/student-engagement-core/private/v1/gamification/user/profile`; break;
            case 'pw_tch_prof': targetUrl = `https://pw-api-gate.penpencil.co/v3/community/users/profile?teacherId=${params.teacherId}`; break;
            case 'pw_notifs': targetUrl = `${PW_API}/v1/batches/${params.batchId}/announcement?page=${params.page || 1}&limit=${params.limit || 20}`; break;
            default: return Response.json({ success: false, message: `Endpoint Not Mapped: ${action}` }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        async function attemptFetch() {
            // 🔥 BRAND NEW IDENTITIES ON EVERY SINGLE ATTEMPT 🔥
            const activeIp = generateIndianMobileIP();
            const activeUuid = crypto.randomUUID();
            const activeToken = MASTER_TOKENS[Math.floor(Math.random() * MASTER_TOKENS.length)];
            const authHeader = activeToken.startsWith('Bearer') ? activeToken : `Bearer ${activeToken}`;

                        const pwHeaders = new Headers({
                "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 12; SM-G998B Build/SP1A.210812.016)", // Use the real mobile user agent!
                "Accept": "application/json, text/plain, */*",
                "Content-Type": "application/json",
                "client-id": "5eb393ee95fab7468a79d189",
                "client-type": "MOBILE",
                "client-version": "2.1.2",
                "Authorization": authHeader,
                "randomid": activeUuid,
                "X-Forwarded-For": activeIp, // Only use this one!
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            });


            if (targetUrl.includes("learnxpw.site")) {
                pwHeaders.set("Origin", "https://www.learnxpw.site");
                pwHeaders.set("Referer", "https://www.learnxpw.site/");
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000); 

            try {
                const fetchOptions = { method: method, headers: pwHeaders, signal: controller.signal };
                if ((method === 'POST' || method === 'PUT') && payload) {
                    fetchOptions.body = typeof payload === 'string' ? payload : JSON.stringify(payload);
                }

                // Call PenPencil API
                let response = await fetch(targetUrl, fetchOptions);
                let httpStatus = response.status;
                let text = await response.text();

                // Resume Fallback for Quiz/Tests
                if (resumeUrl && (httpStatus !== 200 || text.includes('"success":false') || text.includes("Test is not in start state"))) {
                    pwHeaders.set("randomid", crypto.randomUUID());
                    response = await fetch(resumeUrl, { method, headers: pwHeaders, body: fetchOptions.body, signal: controller.signal });
                    httpStatus = response.status;
                    text = await response.text();
                }
                
                clearTimeout(timeoutId);

                // 🔥 429 TRAP 🔥
                if (httpStatus === 403 || httpStatus === 429 || text.includes("too many requests")) {
                    return { isBlocked: true, text, httpStatus };
                }

                return { isBlocked: false, text, httpStatus };

            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        }

        // ==========================================
        // 🔥 THE AUTO-HEALING LOOP (Up to 3 Tries)
        // ==========================================
        let maxRetries = 3; 
        let attempt = 0;
        let success = false;
        let result = null;

        while (attempt < maxRetries && !success) {
            attempt++;
            try {
                // If it loops, it generates a completely new IP, new UUID, and picks a token again automatically
                result = await attemptFetch();
                if (!result.isBlocked) success = true;
            } catch (e) {
                if (e.name === 'AbortError' && attempt >= maxRetries) {
                    return Response.json({ success: false, message: "Timeout" }, { status: 504, headers: { "Access-Control-Allow-Origin": "*" } });
                }
            }
        }

        // ==========================================
        // 🔥 SAFE RESPONSE PARSER (Always returns data to frontend)
        // ==========================================
        let cleanJson;
        try {
            cleanJson = JSON.parse(result.text);
            if (cleanJson && cleanJson.data && typeof cleanJson.data === 'string' && cleanJson.data.startsWith('{')) {
                try { cleanJson.data = JSON.parse(cleanJson.data); } catch(e){}
            }
            cleanJson.httpStatus = result.httpStatus;
            
            return Response.json(cleanJson, { 
                headers: { 
                    "Access-Control-Allow-Origin": "*", 
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                } 
            });
        } catch (parseError) {
            // If the response is NOT clean JSON (e.g. a raw text error from PenPencil or HTML firewall block)
            // Wrap it safely in a JSON object so your frontend can read it without crashing.
            return Response.json({ 
                success: false, 
                httpStatus: result.httpStatus,
                message: "Non-JSON response received from Target API.",
                raw_response: result.text.substring(0, 1000) // First 1000 characters of the raw error
            }, { 
                headers: { 
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                } 
            });
        }
    } catch (error) {
        return Response.json({ success: false, message: "Vault Processing Error", error: error.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
}
