import {
    insertExperimentEvents,
    normalizeExperimentEventRows,
    normalizeSupabaseProjectUrl,
    upsertParticipantSummary,
} from './lib/supabase-experiment.js';

/** Node.js Serverless Function (Edge 아님). export const runtime = 'edge' 사용 금지. */

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * handler 호출 시점에만 env 읽기 (빌드 타임 인라인 방지: bracket notation)
 */
function readSupabaseEnvInHandler() {
    const env = typeof process !== 'undefined' && process.env ? process.env : {};
    const url = normalizeSupabaseProjectUrl(env['SUPABASE_URL'] || '');
    const key = String(env['SUPABASE_SERVICE_ROLE_KEY'] || '').trim();
    return { supabaseUrl: url, serviceKey: key };
}

/**
 * POST /api/log
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

    const SUPABASE_URL = typeof process !== 'undefined' && process.env ? process.env['SUPABASE_URL'] : undefined;
    const SUPABASE_SERVICE_ROLE_KEY =
        typeof process !== 'undefined' && process.env ? process.env['SUPABASE_SERVICE_ROLE_KEY'] : undefined;

    console.log('[api/log] env check', {
        hasUrl: !!SUPABASE_URL,
        hasKey: !!SUPABASE_SERVICE_ROLE_KEY,
        urlLength: SUPABASE_URL ? String(SUPABASE_URL).length : 0,
        keyLength: SUPABASE_SERVICE_ROLE_KEY ? String(SUPABASE_SERVICE_ROLE_KEY).length : 0,
        hasProcess: typeof process !== 'undefined',
        hasProcessEnv: typeof process !== 'undefined' && !!process.env,
        vercelEnv: typeof process !== 'undefined' && process.env ? process.env['VERCEL_ENV'] || null : null,
    });

    const supabaseConfig = readSupabaseEnvInHandler();

    if (!supabaseConfig.supabaseUrl || !supabaseConfig.serviceKey) {
        return res.status(500).json({
            ok: false,
            error: 'missing_supabase_config',
            detail: {
                message:
                    'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables, then redeploy.',
                diagnostics: {
                    SUPABASE_URL: !!SUPABASE_URL,
                    SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
                },
            },
        });
    }

    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const action = String(body.action || 'insert_events');

    try {
        if (action === 'upsert_summary') {
            const summary = body.participant_summary || body.summary;
            if (!summary || typeof summary !== 'object') {
                return res.status(400).json({ ok: false, error: 'participant_summary_required' });
            }
            const result = await upsertParticipantSummary(summary, supabaseConfig);
            if (!result.ok) {
                console.error('[api/log] supabase upsert failed', result.detail || result.error);
                return res.status(result.status || 502).json({
                    ok: false,
                    error: 'supabase_upsert_failed',
                    detail: result.detail || result.error,
                });
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
            console.error('[api/log] supabase insert failed', result.detail || result.error);
            return res.status(result.status || 502).json({
                ok: false,
                error: 'supabase_insert_failed',
                detail: result.detail || result.error,
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
