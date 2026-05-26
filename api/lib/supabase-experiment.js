/**
 * Supabase REST helpers (Vercel api/log.js 전용)
 * 이 파일 내부에는 다른 local import 없음
 */

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

export function readSupabaseEnvFromProcess() {
    const env = typeof process !== 'undefined' && process.env ? process.env : {};
    const supabaseUrl = String(env[SUPABASE_ENV_URL] || '').trim().replace(/\/$/, '');
    const serviceKey = String(env[SUPABASE_ENV_SERVICE_ROLE_KEY] || '').trim();
    return { supabaseUrl, serviceKey };
}

export function getSupabaseConfig(override) {
    if (override && (override.supabaseUrl || override.serviceKey)) {
        return {
            supabaseUrl: String(override.supabaseUrl || '')
                .trim()
                .replace(/\/$/, ''),
            serviceKey: String(override.serviceKey || '').trim(),
        };
    }
    return readSupabaseEnvFromProcess();
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

function logSupabaseFailure(table, payload, resStatus, errText, parsed) {
    console.error('[supabase] request failed', {
        table,
        payload,
        status: resStatus,
        message: parsed?.message || errText,
        code: parsed?.code || null,
        details: parsed?.details || null,
        hint: parsed?.hint || null,
        raw: errText?.slice?.(0, 2000) || errText,
    });
}

export async function insertExperimentEvents(rows, configOverride) {
    const table = 'experiment_events';
    const cfg = resolveSupabaseConfig(configOverride, 'insertExperimentEvents');
    if (!cfg) {
        console.error('[supabase] insert failed', {
            table,
            payload: rows,
            message: 'missing_supabase_config',
        });
        return { ok: false, error: 'missing_supabase_config' };
    }
    const { supabaseUrl, serviceKey } = cfg;
    if (!rows.length) {
        return { ok: true, inserted: 0 };
    }

    const payload = rows;
    console.log('[supabase] insert begin', { table, count: payload.length, sample: payload[0] });

    const restUrl = `${supabaseUrl}/rest/v1/${table}`;
    const res = await fetch(restUrl, {
        method: 'POST',
        headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
        },
        body: JSON.stringify(payload),
    });

    const text = await res.text().catch(() => '');
    let parsed = null;
    try {
        parsed = text ? JSON.parse(text) : null;
    } catch {
        parsed = { message: text };
    }

    if (!res.ok) {
        logSupabaseFailure(table, payload, res.status, text, parsed);
        return { ok: false, status: res.status, error: parsed };
    }

    console.log('[supabase] insert result', { table, status: res.status, inserted: payload.length });
    return { ok: true, inserted: payload.length, status: res.status };
}

export async function upsertParticipantSummary(summaryRow, configOverride) {
    const table = 'participant_summary';
    const cfg = resolveSupabaseConfig(configOverride, 'upsertParticipantSummary');
    if (!cfg) {
        console.error('[supabase] upsert failed', {
            table,
            payload: summaryRow,
            message: 'missing_supabase_config',
        });
        return { ok: false, error: 'missing_supabase_config' };
    }
    const { supabaseUrl, serviceKey } = cfg;

    const payload = summaryRow;
    console.log('[supabase] upsert begin', { table, participant_id: payload.participant_id });

    const restUrl = `${supabaseUrl}/rest/v1/${table}?on_conflict=participant_id`;
    const res = await fetch(restUrl, {
        method: 'POST',
        headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(payload),
    });

    const text = await res.text().catch(() => '');
    let parsed = null;
    try {
        parsed = text ? JSON.parse(text) : null;
    } catch {
        parsed = { message: text };
    }

    if (!res.ok) {
        logSupabaseFailure(table, payload, res.status, text, parsed);
        return { ok: false, status: res.status, error: parsed };
    }

    console.log('[supabase] upsert result', { table, status: res.status, participant_id: payload.participant_id });
    return { ok: true, status: res.status };
}
