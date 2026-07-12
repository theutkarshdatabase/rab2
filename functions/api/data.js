// Use 'onRequest' to handle both POST requests and CORS OPTIONS preflight
export async function onRequest(context) {
    const { request } = context;

    // 1. INSTANT CORS PREFLIGHT (Prevents browser Status 0 errors)
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

    // Reject non-POST requests to prevent generic 405 routing glitches
    if (request.method !== "POST") {
        return Response.json({ success: false, message: `Method ${request.method} not allowed. Send a POST request.` }, { 
            status: 405, 
            headers: { "Access-Control-Allow-Origin": "*" } 
        });
    }

    try {
        const input = await request.json();
        const action = input.action;
        const params = input.params || {};
        const method = input.method || 'GET';
        const payload = input.payload || null;

        if (!action) {
            return Response.json({ success: false, message: "Invalid Vault Request: Missing action variable" }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        const PW_API = "https://api.penpencil.co";
        const PW_GATE = "https://pw-api-gate.penpencil.co";
        
        let targetUrl = "";
        let isDirectFetch = false; 

        // --- THE SECRET DICTIONARY ---
        switch (action) {
             case 'pw_v2_list': 
                targetUrl = `${PW_API}/v2/batches/634bd315ed7a360018558283/subject/${params.subjectId}/contents?tag=${params.tagId}&contentType=videos&page=1`;
                isDirectFetch = false; 
                break;
           
            // 📚 BATCH & SYSTEM MAPS
            case 'pw_btch_dtl': targetUrl = `${PW_API}/v3/batches/${params.batchId}/details`; 
                isDirectFetch = true;
                break;
            case 'pw_tchr_dtl': targetUrl = `${PW_API}/v1/batches/${params.batchId}/${params.teacherId}/teacher-details`; break;
            case 'pw_topics': targetUrl = `${PW_API}/batch-service/v1/batch-tags/${params.batchId}/topics?page=${params.page}&batchSubjectIds=${params.subjectIds}`; break;
            case 'pw_sub_topics': targetUrl = `${PW_API}/batch-service/v1/batch-tags/${params.batchId}/subject/${params.subjectId}/topics?page=${params.page}&batchTagType=${params.tagType || ''}&limit=${params.limit}`; break;
            case 'pw_res_topics': targetUrl = `${PW_API}/batch-service/v1/batch-tags/${params.batchId}/topics?page=1&batchSubjectIds=${params.subjectIds}`; break;

            // 📅 SCHEDULES & DVR STREAMS
            case 'pw_tdy_sch': targetUrl = `${PW_API}/v2/batches/${params.batchId}/todays-schedule?batchId=${params.batchId}`; break;
            case 'pw_wkly_sch': targetUrl = `${PW_API}/v2/batches/${params.batchId}/weekly-schedules?batchId=${params.batchId}&startDate=${params.startDate}&endDate=${params.endDate}&page=${params.page}`; break;
            case 'pw_sch_cntnt': targetUrl = `${PW_API}/batch-service/v3/batch-subject-schedules/${params.batchId}/subject/${params.subjectId}/contents?skip=${params.skip}&limit=${params.limit}&contentType=${params.contentType}&contentFilter=ALL&tagId=${params.tagId}`; break;
            case 'pw_sch_dtl': targetUrl = `${PW_API}/v1/batches/${params.batchId}/subject/${params.subjectId}/schedule/${params.scheduleId}/schedule-details`; break;
            case 'pw_slides': targetUrl = `${PW_API}/v1/batches/${params.batchId}/subject/${params.subjectId}/schedule/${params.scheduleId}/slides`; break;
            case 'pw_notes': targetUrl = `${PW_API}/v1/batches/${params.batchId}/subject/${params.subjectId}/schedule/${params.scheduleId}/notes`; break;
            case 'get-video-url': targetUrl = `${PW_API}/v1/batches/634bd315ed7a360018558283/subject/${params.subjectId}/schedule/${params.scheduleId}/schedule-details`; break;
           
            // 📝 EXAMS, TESTS, AND DPPS
            case 'pw_test_strt': targetUrl = `${PW_API}/v3/test-service/tests/${params.testId}/start-test?batchId=634bd315ed7a360018558283&exerciseId=${params.testId}&testSource=${params.testSource}&type=${params.type}&batchScheduleId=${params.scheduleId}&subjectId=${params.subjectId}`; break;
            case 'pw_dpp_lst': targetUrl = `${PW_API}/v3/test-service/tests/new-dpp-list?page=${params.page}&batchId=${params.batchId}&batchSubjectId=${params.subjectId}&chapterId=${params.chapterId}&dppType=ALL&limit=${params.limit}`; break;
            case 'pw_test_lst': targetUrl = `${PW_API}/v3/test-service/tests?testType=All&testStatus=All&attemptStatus=All&batchId=${params.batchId}&isSubjective=false&isPurchased=true&limit=${params.limit}`; break;
            case 'pw_test_map': targetUrl = `${PW_API}/v3/test-service/tests/user-test-student-mapping-list`; break;

            // 💬 CHAT SYSTEM & POLLS
            case 'pw_vid_cmnts': targetUrl = `${PW_API}/v1/comments/${params.schId}?isPinned=true&limit=20&lastSeenId=${params.lastSeenId || ''}`; break;
            case 'pw_chat_get': targetUrl = `${PW_API}/v1/conversation/${params.conversationId}/chat?limit=${params.limit}&lastSeenId=${params.lastSeenId || ''}`; break;
            case 'pw_chat_post': targetUrl = `${PW_API}/v1/conversation/${params.conversationId}/chat`; break;
            case 'pw_poll_actv': targetUrl = `${PW_API}/v2/poll/entity/${params.scheduleId}/active-poll`; break;
            case 'pw_poll_vote': targetUrl = `${PW_API}/v2/poll/upvote-poll`; break;

            // 🌍 COMMUNITY FEED FEEDS
            case 'pw_com_chnl': targetUrl = `${PW_GATE}/v3/community/channels/batch/${params.batchId}`; break;
            case 'pw_com_posts': targetUrl = `${PW_GATE}/v3/community/posts/v2?channelId=${params.channelId}&page=${params.page}&timestamp=${params.timestamp}`; break;
            case 'pw_com_create': targetUrl = `${PW_GATE}/v3/community/posts`; break;
            case 'pw_com_react': targetUrl = `${PW_GATE}/v3/community/posts/${params.postId}/reactions`; break;
            case 'pw_com_views': targetUrl = `${PW_GATE}/v3/community/posts/${params.postId}/views`; break;
            case 'pw_com_cmnts': targetUrl = `${PW_API}/v1/comments/${params.postId}?type=${params.type}&limit=${params.limit}&skip=${params.skip}`; break;
            case 'pw_com_cmnt_mk': targetUrl = `${PW_API}/v1/comments`; break;

            // 👤 STUDENT PROFILE HOOKS
            case 'pw_usr_prof': targetUrl = `${PW_API}/student-engagement-core/private/v1/gamification/user/profile`; break;
            case 'pw_tch_prof': targetUrl = `${PW_GATE}/v3/community/users/profile?teacherId=${params.teacherId}`; break;
            case 'pw_notifs': targetUrl = `${PW_API}/v1/batches/${params.batchId}/announcement?page=${params.page}&limit=${params.limit}`; break;
            
            default: 
                return Response.json({ success: false, message: `Secure Endpoint Not Mapped for action: ${action}` }, { headers: { "Access-Control-Allow-Origin": "*" } });
        }

        let response;
        let httpStatus = 200;

        if (isDirectFetch) {
            response = await fetch(targetUrl, {
                method: method, // Fixed to use dynamic method instead of hardcoded 'GET'
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "application/json"
                },
                body: payload && method !== 'GET' ? (typeof payload === 'string' ? payload : JSON.stringify(payload)) : undefined
            });
        } else {
            const vercelProxyUrl = "https://pw-proxy-lime.vercel.app/api/proxy";
            const postData = new URLSearchParams();
            postData.append('target_url', targetUrl);
            postData.append('method', method);
            if (payload) {
                postData.append('payload', typeof payload === 'string' ? payload : JSON.stringify(payload));
            }

            response = await fetch(vercelProxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: postData.toString()
            });
        }

        httpStatus = response.status;
        let text = await response.text();
        let cleanJson;

        // --- BULLETPROOF JSON PARSER & ERROR REPORTER ---
        try {
            // First, try to parse it normally
            cleanJson = JSON.parse(text);
            
            // Unpack nested stringified data if it exists
            if (cleanJson && cleanJson.data && typeof cleanJson.data === 'string' && cleanJson.data.startsWith('{')) {
                try { cleanJson.data = JSON.parse(cleanJson.data); } catch(e){}
            }
            
            // Add HTTP status so the frontend knows if it was a 403 or 429
            cleanJson.httpStatus = httpStatus;
            
            return Response.json(cleanJson, { headers: { "Access-Control-Allow-Origin": "*" } });

        } catch (parseError) {
            // If normal parse fails, try the substring fallback (for dirty proxy responses)
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            
            if (start !== -1 && end !== -1) {
                try {
                    cleanJson = JSON.parse(text.substring(start, end + 1));
                    cleanJson.httpStatus = httpStatus;
                    return Response.json(cleanJson, { headers: { "Access-Control-Allow-Origin": "*" } });
                } catch (fallbackError) {
                    // Both parsing methods failed. Report exactly what the server sent.
                    return Response.json({ 
                        success: false, 
                        message: "Failed to parse API response as JSON.", 
                        httpStatus: httpStatus,
                        rawResponse: text.substring(0, 300) // Send the first 300 characters to frontend to debug
                    }, { headers: { "Access-Control-Allow-Origin": "*" } });
                }
            } else {
                // Not even close to JSON. Probably an HTML error page.
                return Response.json({ 
                    success: false, 
                    message: "API returned non-JSON format (Likely HTML error page).", 
                    httpStatus: httpStatus, 
                    rawResponse: text.substring(0, 300) 
                }, { headers: { "Access-Control-Allow-Origin": "*" } });
            }
        }

    } catch (error) {
        // Core execution crash
        return Response.json({ 
            success: false, 
            message: "Vault Processing Error", 
            error: error.message 
        }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
    }
