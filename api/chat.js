import {
    buildChatHistoryFromBody,
    buildOpenAiMessages,
    normalizeSheetRows,
    OPENAI_TEMPERATURE,
    resolveOpenAiModel,
    sheetTimestampSeoul,
} from './lib/experiment-chat-core.js';

/** Node.js Serverless Function (Edge 아님). export const runtime = 'edge' 사용 금지. */

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Vercel Serverless: POST /api/chat → OpenAI (Cloudflare Worker 미사용)
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

    try {
        console.log('[api/chat] POST begin');

        const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
        const {
            message,
            session_id,
            participant_id,
            page_name,
            dwell_time_ms,
            correctness,
            additional_metadata,
            messages: bodyMessages,
            sheet_rows,
        } = body;

        const mergedBody = { message, messages: bodyMessages };
        const { history } = buildChatHistoryFromBody(mergedBody);
        const sheetRowsRaw = normalizeSheetRows(sheet_rows);

        console.log('[api/chat] parsed', {
            session_id: typeof session_id === 'string' ? session_id.slice(0, 40) : session_id,
            historyTurns: history.length,
            sheetRowsIn: sheetRowsRaw.length,
        });

        const apiKey =
            typeof process.env.OPENAI_API_KEY === 'string' ? process.env.OPENAI_API_KEY.trim() : '';
        if (!apiKey) {
            console.error('[api/chat] missing OPENAI_API_KEY');
            return res.status(500).json({ ok: false, error: 'missing_openai_api_key' });
        }

        const openAiMessages = buildOpenAiMessages(history);
        const model = resolveOpenAiModel();
        const openAiBody = JSON.stringify({
            model,
            messages: openAiMessages,
            temperature: OPENAI_TEMPERATURE,
        });

        console.log('[api/chat] openai request', {
            model,
            messageCount: openAiMessages.length,
            bodyBytes: openAiBody.length,
        });

        const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: openAiBody,
        });

        const openAiText = await aiRes.text();
        console.log('[api/chat] openai response', {
            httpStatus: aiRes.status,
            bodyBytes: openAiText.length,
        });

        if (!aiRes.ok) {
            console.error('[api/chat] OpenAI HTTP error', {
                status: aiRes.status,
                text: openAiText.slice(0, 2000),
            });
            return res.status(502).json({
                ok: false,
                error: 'openai_request_failed',
                status: aiRes.status,
                detail: openAiText.slice(0, 500),
            });
        }

        let aiData;
        try {
            aiData = JSON.parse(openAiText);
        } catch (parseErr) {
            console.error('[api/chat] openai JSON.parse failed', {
                head: openAiText.slice(0, 400),
                message: parseErr instanceof Error ? parseErr.message : String(parseErr),
            });
            throw parseErr;
        }

        const reply = aiData.choices?.[0]?.message?.content?.trim();
        if (!reply) {
            const openaiErrMsg = aiData.error?.message || 'openai_empty_reply';
            console.error('[api/chat] OpenAI empty reply', {
                openaiErrMsg,
                head: openAiText.slice(0, 500),
            });
            return res.status(502).json({
                ok: false,
                error: 'openai_empty_reply',
                detail: openaiErrMsg,
            });
        }

        console.log('[api/chat] reply chars', reply.length);

        const skipSheet =
            process.env.DEBUG_SKIP_SHEET === '1' || process.env.DEBUG_SKIP_SHEET === 'true';
        const sheetWebhookUrl =
            typeof process.env.GOOGLE_SHEETS_WEBHOOK_URL === 'string'
                ? process.env.GOOGLE_SHEETS_WEBHOOK_URL.trim()
                : '';

        if (sheetWebhookUrl && !skipSheet) {
            const assistantRow = {
                session_id,
                participant_id,
                timestamp: sheetTimestampSeoul(),
                page_name,
                event_type: 'chat_assistant',
                user_input: null,
                bot_response: reply,
                correctness,
                dwell_time_ms,
                additional_metadata: JSON.stringify({
                    role: 'assistant',
                    source: 'vercel',
                    prior_client_rows: sheetRowsRaw.length,
                    ...(typeof additional_metadata === 'object' && additional_metadata
                        ? additional_metadata
                        : {}),
                }),
            };
            const rows = [...sheetRowsRaw, assistantRow];
            const sheetBody = JSON.stringify({ rows });
            console.log('[api/chat] sheet webhook', { rowCount: rows.length, bodyBytes: sheetBody.length });

            try {
                const sheetRes = await fetch(sheetWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: sheetBody,
                });
                const sheetText = await sheetRes.text();
                console.log('[api/chat] sheet webhook response', {
                    httpStatus: sheetRes.status,
                    responseText: sheetText.slice(0, 500),
                });
                if (!sheetRes.ok) {
                    console.error('[api/chat] sheet webhook failed', {
                        httpStatus: sheetRes.status,
                        responseText: sheetText,
                    });
                }
            } catch (sheetErr) {
                console.error(
                    '[api/chat] sheet webhook fetch threw',
                    sheetErr instanceof Error ? sheetErr.stack || sheetErr.message : String(sheetErr)
                );
            }
        } else if (skipSheet) {
            console.log('[api/chat] sheet skipped (DEBUG_SKIP_SHEET)');
        }

        console.log('[api/chat] OK returning reply');
        return res.status(200).json({ reply });
    } catch (err) {
        console.error('[api/chat] FATAL', err instanceof Error ? err.stack || err.message : String(err));
        return res.status(500).json({
            ok: false,
            error: 'server_error',
            detail: err instanceof Error ? err.message : String(err),
        });
    }
}
