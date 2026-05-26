/**
 * Supabase helpers (Vercel api/log.js)
 * @supabase/supabase-js 사용 — /rest/v1 수동 fetch 조합 없음
 */

import { createClient } from '@supabase/supabase-js';

const CANONICAL_PAGE_NAMES = new Set([
    'welcome',
    'instruction',
    'study_page_1',
    'study_page_2',
    'review_page',
    'review_qg_ai',
    'review_qg_text',
    'distractor_page',
    'final_test_fact',
    'final_test_transfer',
    'survey_mental_effort',
    'submit',
]);

export const SUPABASE_ENV_URL = 'SUPABASE_URL';
export const SUPABASE_ENV_SERVICE_ROLE_KEY = 'SUPABASE_SERVICE_ROLE_KEY';

/**
 * SUPABASE_URL은 https://xxxxx.supabase.co 만 허용.
 * env에 /rest/v1 이 붙어 있으면 제거 (중복 방지).
 * @param {string} raw
 */
export function normalizeSupabaseProjectUrl(raw) {
    let url = String(raw || '').trim();
    if (!url) return '';
    url = url.replace(/\/+$/, '');
    url = url.replace(/\/rest\/v1\/?$/i, '');
    return url;
}

export function readSupabaseEnvFromProcess() {
    const env = typeof process !== 'undefined' && process.env ? process.env : {};
    const supabaseUrl = normalizeSupabaseProjectUrl(env[SUPABASE_ENV_URL] || '');
    const serviceKey = String(env[SUPABASE_ENV_SERVICE_ROLE_KEY] || '').trim();
    return { supabaseUrl, serviceKey };
}

export function getSupabaseConfig(override) {
    if (override && (override.supabaseUrl || override.serviceKey)) {
        return {
            supabaseUrl: normalizeSupabaseProjectUrl(override.supabaseUrl || ''),
            serviceKey: String(override.serviceKey || '').trim(),
        };
    }
    return readSupabaseEnvFromProcess();
}

export function buildSupabaseRestUrl(projectUrl, table) {
    const base = normalizeSupabaseProjectUrl(projectUrl);
    return `${base}/rest/v1/${table}`;
}

/**
 * @param {{ supabaseUrl: string, serviceKey: string }} cfg
 */
function createSupabaseAdminClient(cfg) {
    const projectUrl = normalizeSupabaseProjectUrl(cfg.supabaseUrl);
    return createClient(projectUrl, cfg.serviceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

export function logSupabaseEnvDiagnostics(context = '') {
    const env = typeof process !== 'undefined' && process.env ? process.env : {};
    const cfg = readSupabaseEnvFromProcess();
    const diag = {
        context: context || 'unknown',
        hasProcess: typeof process !== 'undefined',
        hasProcessEnv: typeof process !== 'undefined' && !!process.env,
        hasUrl: !!cfg.supabaseUrl,
        hasKey: !!cfg.serviceKey,
        urlLength: cfg.supabaseUrl ? cfg.supabaseUrl.length : 0,
        keyLength: cfg.serviceKey ? cfg.serviceKey.length : 0,
        readNames: {
            [SUPABASE_ENV_URL]: !!env[SUPABASE_ENV_URL],
            [SUPABASE_ENV_SERVICE_ROLE_KEY]: !!env[SUPABASE_ENV_SERVICE_ROLE_KEY],
        },
        vercelEnv: env['VERCEL_ENV'] || null,
        normalizedProjectUrl: cfg.supabaseUrl || null,
    };
    console.log('[supabase] env diagnostics', diag);
    return diag;
}

function resolveSupabaseConfig(configOverride, context) {
    const cfg = getSupabaseConfig(configOverride);
    if (cfg.supabaseUrl && cfg.serviceKey) {
        return cfg;
    }
    logSupabaseEnvDiagnostics(context);
    return null;
}

function toRawErrorObject(error) {
    if (error == null) return null;
    if (typeof error !== 'object') return { value: String(error) };

    const raw = {};
    const keys = new Set([...Object.keys(error), ...Object.getOwnPropertyNames(error)]);
    for (const key of keys) {
        raw[key] = error[key];
    }
    return raw;
}

/**
 * Supabase insert/upsert 실패 시 Vercel Logs + API response 공통 포맷
 * @param {string} table
 * @param {{ supabaseUrl?: string }} cfg
 * @param {string} requestUrl
 * @param {unknown} error
 */
export function buildSupabaseFailureDetail(table, cfg, requestUrl, error) {
    const err = error && typeof error === 'object' ? error : { message: String(error ?? 'unknown_error') };
    const raw = toRawErrorObject(err);

    return {
        table,
        normalizedSupabaseUrl: normalizeSupabaseProjectUrl(cfg?.supabaseUrl || ''),
        requestUrl,
        code: err.code ?? raw?.code ?? null,
        message: err.message ?? raw?.message ?? null,
        details: err.details ?? raw?.details ?? null,
        hint: err.hint ?? raw?.hint ?? null,
        status: err.status ?? raw?.status ?? null,
        raw,
    };
}

function logSupabaseClientError(table, cfg, requestUrl, payload, error) {
    const detail = buildSupabaseFailureDetail(table, cfg, requestUrl, error);

    console.error('[supabase] request failed', detail);
    console.error('[supabase] raw error object', error);

    if (payload !== undefined) {
        const payloadPreview = Array.isArray(payload)
            ? { count: payload.length, sample: payload[0] ?? null }
            : payload;
        console.error('[supabase] request payload', payloadPreview);
    }
}

export function normalizeExperimentEventRow(row) {
    const metadata =
        row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
            ? row.metadata
            : row.additional_metadata && typeof row.additional_metadata === 'object'
              ? row.additional_metadata
              : {};

    const eventType = String(row.event_type || row.block_name || 'experiment_event');
    let pageName = String(row.page_name || 'instruction');
    if (!CANONICAL_PAGE_NAMES.has(pageName)) {
        metadata.legacy_page_name = pageName;
        pageName = 'instruction';
    }

    const ts = row.event_timestamp || row.timestamp || new Date().toISOString();

    return {
        participant_id: String(row.participant_id || 'anonymous'),
        session_id: String(row.session_id || ''),
        condition: row.condition != null ? String(row.condition) : null,
        event_type: eventType,
        page_name: pageName,
        event_timestamp: ts,

        page_enter_time: row.page_enter_time ?? null,
        page_leave_time: row.page_leave_time ?? null,
        page_dwell_time_ms:
            row.page_dwell_time_ms != null
                ? row.page_dwell_time_ms
                : row.dwell_time_ms != null
                  ? row.dwell_time_ms
                  : row.time_spent != null
                    ? row.time_spent
                    : null,
        click_count: row.click_count != null ? row.click_count : null,
        input_value: row.input_value != null ? String(row.input_value) : row.response_value != null ? String(row.response_value) : null,

        item_id: row.item_id != null ? String(row.item_id) : null,
        participant_answer: row.participant_answer != null ? String(row.participant_answer) : null,
        correct_answer: row.correct_answer != null ? String(row.correct_answer) : null,
        correctness: typeof row.correctness === 'boolean' ? row.correctness : row.is_correct != null ? !!row.is_correct : null,
        distractor_total_attempted_count: row.distractor_total_attempted_count ?? null,
        distractor_correct_count: row.distractor_correct_count ?? null,
        distractor_incorrect_count: row.distractor_incorrect_count ?? null,
        distractor_accuracy: row.distractor_accuracy ?? null,

        chatbot_user_message: row.chatbot_user_message != null ? String(row.chatbot_user_message) : row.user_input != null ? String(row.user_input) : null,
        chatbot_ai_reply: row.chatbot_ai_reply != null ? String(row.chatbot_ai_reply) : row.bot_response != null ? String(row.bot_response) : null,

        generated_question_text: row.generated_question_text != null ? String(row.generated_question_text) : null,
        generated_answer_text: row.generated_answer_text != null ? String(row.generated_answer_text) : null,
        generated_explanation_text: row.generated_explanation_text != null ? String(row.generated_explanation_text) : null,
        question_type_check_memory_fact:
            typeof row.question_type_check_memory_fact === 'boolean' ? row.question_type_check_memory_fact : null,
        question_type_check_understanding_application:
            typeof row.question_type_check_understanding_application === 'boolean'
                ? row.question_type_check_understanding_application
                : null,

        metadata,
    };
}

export function normalizeExperimentEventRows(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map((r) => normalizeExperimentEventRow(r && typeof r === 'object' ? r : {}));
}

export async function insertExperimentEvents(rows, configOverride) {
    const table = 'experiment_events';
    const cfg = resolveSupabaseConfig(configOverride, 'insertExperimentEvents');
    if (!cfg) {
        const detail = {
            table,
            normalizedSupabaseUrl: null,
            requestUrl: null,
            code: 'missing_supabase_config',
            message: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing',
            details: null,
            hint: 'Set env vars in Vercel and redeploy',
            raw: { code: 'missing_supabase_config' },
        };
        console.error('[supabase] insert failed', detail);
        console.error('[supabase] raw error object', detail.raw);
        return { ok: false, status: 500, error: 'missing_supabase_config', detail };
    }
    if (!rows.length) {
        return { ok: true, inserted: 0 };
    }

    const payload = rows;
    const requestUrl = buildSupabaseRestUrl(cfg.supabaseUrl, table);
    console.log('[supabase] insert begin', {
        table,
        normalizedSupabaseUrl: cfg.supabaseUrl,
        count: payload.length,
        sample: payload[0],
    });
    console.log('[supabase] request url', requestUrl);

    const supabase = createSupabaseAdminClient(cfg);
    const { error } = await supabase.from(table).insert(payload);

    if (error) {
        const detail = buildSupabaseFailureDetail(table, cfg, requestUrl, error);
        logSupabaseClientError(table, cfg, requestUrl, payload, error);
        return { ok: false, status: error.status || 502, error: detail.message || 'supabase_insert_failed', detail };
    }

    console.log('[supabase] insert result', { table, requestUrl, inserted: payload.length });
    return { ok: true, inserted: payload.length };
}

export async function upsertParticipantSummary(summaryRow, configOverride) {
    const table = 'participant_summary';
    const cfg = resolveSupabaseConfig(configOverride, 'upsertParticipantSummary');
    if (!cfg) {
        const detail = {
            table,
            normalizedSupabaseUrl: null,
            requestUrl: null,
            code: 'missing_supabase_config',
            message: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing',
            details: null,
            hint: 'Set env vars in Vercel and redeploy',
            raw: { code: 'missing_supabase_config' },
        };
        console.error('[supabase] upsert failed', detail);
        console.error('[supabase] raw error object', detail.raw);
        return { ok: false, status: 500, error: 'missing_supabase_config', detail };
    }

    const payload = summaryRow;
    const requestUrl = buildSupabaseRestUrl(cfg.supabaseUrl, table);
    console.log('[supabase] upsert begin', {
        table,
        normalizedSupabaseUrl: cfg.supabaseUrl,
        participant_id: payload.participant_id,
    });
    console.log('[supabase] request url', requestUrl);

    const supabase = createSupabaseAdminClient(cfg);
    const { error } = await supabase.from(table).upsert(payload, { onConflict: 'participant_id' });

    if (error) {
        const detail = buildSupabaseFailureDetail(table, cfg, requestUrl, error);
        logSupabaseClientError(table, cfg, requestUrl, payload, error);
        return { ok: false, status: error.status || 502, error: detail.message || 'supabase_upsert_failed', detail };
    }

    console.log('[supabase] upsert result', { table, requestUrl, participant_id: payload.participant_id });
    return { ok: true };
}
