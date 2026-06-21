export default async function handler(req, res) {
    // 🚀 1. BASIC CORS HEADERS (Crucial for cross-domain requests)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', 'https://studyparcham.in'); // Or restrict to 'https://studyparcham.in' later
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Instantly approve preflight requests from the browser
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Vercel automatically parses req.body if the content-type is application/json
        const input = req.body || {};
        const action = input.action;
        const params = input.params || {};
        const method = input.method || 'GET';
        const payload = input.payload || null;

        if (!action) {
            return res.status(400).json({ success: false, message: "Invalid Vault Request" });
        }

        const PW_API = "https://api.penpencil.co";
        const PW_GATE = "https://pw-api-gate.penpencil.co";
        
        let targetUrl = "";
        let isDirectFetch = false; 

        // --- THE SECRET DICTIONARY ---
        switch (action) {
                            
            // 🚀 THE MASTER VIDEO ENDPOINT
            case 'parcham_vid': 
                targetUrl = `https://thestudyspark.site/api/v2/videos/video-url-details?id=${params.childId}`; 
                isDirectFetch = true; 
                break;

            // 📚 BATCH & SYSTEM MAPS
            case 'pw_btch_dtl': targetUrl = `${PW_API}/v3/batches/${params.batchId}/details`; break;
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

            // 📝 EXAMS, TESTS, AND DPPS
            case 'pw_test_strt': targetUrl = `${PW_API}/v3/test-service/tests/${params.testId}/start-test?batchId=${params.batchId}&exerciseId=${params.testId}&testSource=${params.testSource}&type=${params.type}&batchScheduleId=${params.scheduleId}&subjectId=${params.subjectId}`; break;
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
            
            default: return res.status(404).json({ success: false, message: "Secure Endpoint Not Mapped" });
        }

        let response;

        if (isDirectFetch) {
            // 🚀 FETCH THE MASTER API DIRECTLY
            response = await fetch(targetUrl, {
                method: 'GET',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "application/json"
                }
            });
        } else {
            // 🚀 PENPENCIL PROXY FOR APP DATA
            const vercelProxyUrl = "https://pw-proxy-two.vercel.app/api/proxy";
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

        let text = await response.text();

        // --- NORMAL JSON PARSER ---
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        
        if (start !== -1 && end !== -1) {
            const cleanJson = JSON.parse(text.substring(start, end + 1));
            if (cleanJson && cleanJson.data && typeof cleanJson.data === 'string' && cleanJson.data.startsWith('{')) {
                try { cleanJson.data = JSON.parse(cleanJson.data); } catch(e){}
            }
            return res.status(200).json(cleanJson);
        } else {
            return res.status(502).json({ success: false, message: "Proxy Connection Failed", rawResponse: text.substring(0, 100) });
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: "Vault Processing Error", error: error.message });
    }
}
