/**
 * Supabase REST helpers (Vercel API Route / Worker 공용)
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

/**
 * @param {{ supabaseUrl?: string, serviceKey?: string }} [override]
 */
export function getSupabaseConfig(override = {}) {
    const supabaseUrlRaw =
        override.supabaseUrl ||
        (typeof process !== 'undefined' && process.env && process.env.SUPABASE_URL) ||
        '';
    const supabaseUrl =
        typeof supabaseUrlRaw === 'string' ? supabaseUrlRaw.trim().replace(/\/$/, '') : '';
    const keyRaw =
        override.serviceKey ||
        (typeof process !== 'undefined' && process.env && process.env.SUPABASE_SERVICE_ROLE_KEY) ||
        (typeof process !== 'undefined' && process.env && process.env.SUPABASE_ANON_KEY) ||
        '';
    const serviceKey = typeof keyRaw === 'string' ? keyRaw.trim() : '';
    return { supabaseUrl, serviceKey };
}

/**
 * @param {Record<string, unknown>} row
 */
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

/**
 * @param {unknown[]} rows
 */
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

/**
 * @param {Record<string, unknown>[]} rows
 * @param {{ supabaseUrl?: string, serviceKey?: string }} [configOverride]
 */
export async function insertExperimentEvents(rows, configOverride) {
    const table = 'experiment_events';
    const { supabaseUrl, serviceKey } = getSupabaseConfig(configOverride);
    if (!supabaseUrl || !serviceKey) {
        const err = { message: 'missing_supabase_config' };
        console.error('[supabase] insert failed', { table, payload: rows, ...err });
        return { ok: false, error: 'missing_supabase_config' };
    }
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

/**
 * @param {Record<string, unknown>} summaryRow
 * @param {{ supabaseUrl?: string, serviceKey?: string }} [configOverride]
 */
export async function upsertParticipantSummary(summaryRow, configOverride) {
    const table = 'participant_summary';
    const { supabaseUrl, serviceKey } = getSupabaseConfig(configOverride);
    if (!supabaseUrl || !serviceKey) {
        const err = { message: 'missing_supabase_config' };
        console.error('[supabase] upsert failed', { table, payload: summaryRow, ...err });
        return { ok: false, error: 'missing_supabase_config' };
    }

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
