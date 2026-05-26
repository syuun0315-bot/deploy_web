import {
    getSupabaseConfig,
    insertExperimentEvents,
    logSupabaseEnvDiagnostics,
    normalizeExperimentEventRows,
    SUPABASE_ENV_SERVICE_ROLE_KEY,
    SUPABASE_ENV_URL,
    upsertParticipantSummary,
} from '../lib/supabase-experiment.js';

/**
 * Vercel Serverless: handler에서 env를 읽어 lib로 전달 (번들/런타임 이슈 방지)
 */
function readSupabaseEnvForHandler() {
    const fromProcess = getSupabaseConfig();
    return {
        supabaseUrl: fromProcess.supabaseUrl,
        serviceKey: fromProcess.serviceKey,
    };
}

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * POST /api/log
 * - action=insert_events (기본): experiment_events insert
 * - action=upsert_summary: participant_summary upsert
 * - 하위 호환: event_rows 배열
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export default async function handler(req, res) {
    setCors(res);

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST, OPTIONS');
        return res.status(405).json({ ok: false, error: 'method_not_allowed' });
    }

    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const action = String(body.action || 'insert_events');
    const supabaseConfig = readSupabaseEnvForHandler();

    console.log('[api/log] env check', {
        action,
        expectedNames: [SUPABASE_ENV_URL, SUPABASE_ENV_SERVICE_ROLE_KEY],
        hasUrl: !!supabaseConfig.supabaseUrl,
        hasKey: !!supabaseConfig.serviceKey,
        urlLength: supabaseConfig.supabaseUrl ? supabaseConfig.supabaseUrl.length : 0,
        keyLength: supabaseConfig.serviceKey ? supabaseConfig.serviceKey.length : 0,
    });

    if (!supabaseConfig.supabaseUrl || !supabaseConfig.serviceKey) {
        const diag = logSupabaseEnvDiagnostics(`api/log:${action}`);
        return res.status(500).json({
            ok: false,
            error: 'missing_supabase_config',
            detail: {
                message: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables, then redeploy.',
                diagnostics: diag.readNames,
            },
        });
    }

    try {
        if (action === 'upsert_summary') {
            const summary = body.participant_summary || body.summary;
            if (!summary || typeof summary !== 'object') {
                return res.status(400).json({ ok: false, error: 'participant_summary_required' });
            }
            const result = await upsertParticipantSummary(summary, supabaseConfig);
            if (!result.ok) {
                return res.status(result.status || 502).json({ ok: false, error: 'supabase_upsert_failed', detail: result.error });
            }
            return res.status(200).json({ ok: true, upserted: 1 });
        }

        const rawRows = body.events || body.event_rows || (body.event ? [body.event] : []);
        const rows = normalizeExperimentEventRows(rawRows);
        if (!rows.length) {
            return res.status(200).json({ ok: true, inserted: 0 });
        }

        const result = await insertExperimentEvents(rows, supabaseConfig);
        if (!result.ok) {
            return res.status(result.status || 502).json({
                ok: false,
                error: 'supabase_insert_failed',
                detail: result.error,
            });
        }

        return res.status(200).json({ ok: true, inserted: result.inserted });
    } catch (err) {
        console.error('[api/log] FATAL', err instanceof Error ? err.stack || err.message : String(err));
        return res.status(500).json({
            ok: false,
            error: 'server_error',
            detail: err instanceof Error ? err.message : String(err),
        });
    }
}
