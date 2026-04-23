// 실험 데이터 저장 객체
const experimentData = {
    participantId: null,
    condition: null, // 1, 2, 3, 4
    /** 실험 중 누적 클릭 수(개발자 패널 클릭 제외) */
    clickCount: 0,
    startTime: null,
    stageTimes: {},
    learning: {
        startTime: null,
        endTime: null,
        duration: 0
    },
    jol1: null, // 학습 직후 예측 점수 (0~100)
    review: {
        startTime: null,
        endTime: null,
        duration: 0,
        notes: null,
        pairs: [], // 질문+답+해설 쌍 배열
        currentPairIndex: 0, // 현재 쌍 인덱스
        questions: null, // 하위 호환성을 위해 유지
        questionStage: 'question', // 하위 호환성을 위해 유지
        chatMessages: []
    },
    survey: {
        startTime: null,
        endTime: null,
        duration: 0,
        answers: {}
    },
    distractor: {
        startTime: null,
        endTime: null,
        duration: 0,
        problems: [],
        correctCount: 0,
        wrongCount: 0,
        totalCount: 0
    },
    /** 수학 과제 직후·최종 시험 직전 AI 리터러시 7점 척도(3문항) */
    aiLiteracy: {
        startTime: null,
        endTime: null,
        duration: 0,
        answers: {}
    },
    finalTest: {
        startTime: null,
        endTime: null,
        duration: 0,
        answers: {},
        questions: [] // 문제 목록
    },
    postSurvey: {
        startTime: null,
        endTime: null,
        duration: 0,
        answers: {}
    },
    demographics: {
        age: null,
        gender: null,
        major: null
    },
    gifticon: {
        option: null,
        phone: null
    }
};

/** 복습 화면 상단 바(모든 조건) 안내·복습 안내 마지막 페이지 강조에 동일 문구 사용 */
// 최종 시험 문제 목록
const finalTestQuestions = [
    { number: 1, question: "박쥐의 종류는 큰 박쥐류와 작은 박쥐류로 나뉩니다. 이중 작은 박쥐류는 전 세계에 서식하고 있습니다. 큰 박쥐류의 주요 서식지는 어디입니까?" },
    { number: 2, question: "미국 텍사스 주에 있는 브랙큰 동굴(Bracken Cave)에는 약 2천만 마리가 넘는 멕시코 큰귀박쥐(Mexican free-tail bats)가 살고 있습니다. 이 박쥐들은 보통 하룻밤에 몇 톤의 곤충을 먹어치웁니까?" },
    { number: 3, question: "어떤 박쥐들은 먹잇감을 찾기 위해 반향정위(echolocation)라는 능력을 사용합니다. 반향정위는 무엇이며, 이를 이용하여 박쥐는 어떻게 물체의 거리와 크기를 분별할 수 있는지 구체적으로 설명해보세요." },
    { number: 4, question: "박쥐들은 특별히 발달된 발톱을 사용하여 천장에 거꾸로 매달립니다. 박쥐가 발톱으로 거꾸로 매달릴 수 있는 이유를 구체적으로 설명해보세요." },
    { number: 5, question: "전 세계에는 5,500 종의 포유류가 있습니다. 박쥐 종은 모든 포유류 종의 대략 몇 퍼센트를 차지합니까?" },
    { number: 6, question: "특이하게도, 박쥐는 거꾸로 자고 있을 때가 아니라 밤에 날아다닐 때 다른 동물의 공격을 종종 받습니다. 주로 어떤 동물이 박쥐를 공격해 먹이로 삼을까요?" },
    { number: 7, question: "새보다 박쥐가 모기를 더 잘 잡습니다. 박쥐가 날아다니는 작은 곤충을 사냥하는 데 새보다 더 능숙한 이유는 무엇일까요?" },
    { number: 8, question: "많은 동물학자의 의견에 따르면, 자연선택(natural selection, 자연에 잘 적응하여 선택된 개체가 살아남아 진화한다는 가설)으로 인해 박쥐가 일시적으로 반수면 상태에 빠지는 능력을 갖추게 되었습니다. 이러한 능력이 발달하게 된 배경은 특히 먹이 소비(food consumption)와 관련 있다고 보고 있습니다. 먹이 소비를 고려해봤을 때, 박쥐가 일시적으로 반수면 상태에 빠지는 이유는 무엇일까요?" },
    { number: 9, question: "미군은 박쥐의 날개를 모델로 한 새로운 항공기를 개발 중입니다. 이 새로운 유형의 항공기는 전투기와 같은 기존 항공기와 어떤 점이 다를까요?" },
    { number: 10, question: "박쥐가 반향정위(echolocation)를 사용하여 밤 비행을 하는 것처럼, 잠수함도 소나(sonar, 수중 음향 탐지기)라는 기술을 사용하여 깊은 물 속을 항해합니다. 소나를 이용할 때, 움직이는 물체가 잠수함에 다가오는지를(혹은 멀어짐) 어떻게 파악할 수 있을까요?" },
    { number: 11, question: "어센더(ascender, 고정된 로프를 타고 오르기 위해 사용되는 기계)는 암벽등반 시 사용하는 기계로 박쥐의 발톱과 비슷한 기능을 합니다. 어센더를 이용해 등반가가 밧줄을 타고 오르는 상황에서 어센더의 주요 기능과 작동 원리를 구체적으로 설명해보세요." },
    { number: 12, question: "일부 과학자들은 계절성 우울증(seasonal affective disorder, 계절적인 흐름을 타는 우울증)과 일부 동물(예: 박쥐)이 반수면 상태에 빠지는 현상이 비슷하다고 주장합니다. 계절성 우울증의 주요 증상이 식욕을 잃는 것임을 고려해볼 때, 이러한 증상이 과학자들의 가설을 뒷받침하는 이유는 무엇일까요?" }
];

// 현재 단계
let currentStage = 'experiment-start';
let timers = {};
// 조건 3(AI 재학습) 복습 안내 2단계용 (1=첫 페이지, 2=두 번째 페이지)
let reviewInstructionStep = 0;

// ---------------------------------------------------------------------------
// 데이터 수집: 챗봇 대화 로그 + 실험 이벤트(시트/백엔드용)
// Google Sheets는 프론트가 아닌 서버(또는 Worker)에서만 접근. 프론트는 아래 URL로 JSON 전송.
// ---------------------------------------------------------------------------
/** 백엔드 저장 API (명시 없으면 CHAT_WORKER_URL 기반으로 /ingest 계산) */
const DATA_SINK_URL = '';

const sessionState = {
    sessionId: null,
    chatApiSessionId: null,
    chatMessageOrder: 0,
    experimentTrialCounter: 0,
    /** 현재 단계에 들어온 시각(ms) — 단계 전환 시 체류 시간 계산 */
    lastStageEnterAt: null,
    /** 설문/사후질문/최종 시험 문항 표시 시각 */
    surveyQuestionStartedAt: null,
    postSurveyQuestionStartedAt: null,
    finalTestQuestionStartedAt: null,
    /** 복습 질문생성: 현재 문제 카드에 머문 시간 */
    reviewPairStartedAt: null,
    /** 방해과제: 현재 산술 문항이 화면에 나온 시각 */
    distractorProblemShownAt: null,
    /** AI 리터러시 설문 문항 표시 시각 */
    aiLiteracyQuestionStartedAt: null,
    /** Google Sheets에 이미 동기화된 chat 로그의 최대 message_order */
    lastSyncedChatLogOrder: 0,
};

const collectedChatLogs = [];
/** 시트에 쌓을 실험 행(문항·체류·방해과제 등) */
const collectedExperimentRows = [];

function initSessionId() {
    const rand = Math.random().toString(36).slice(2, 10);
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    sessionState.sessionId = `sess_${stamp}_${rand}`;
}

/** 챗봇 API용 세션(참가자 1명 실험 세션 단위 유지) */
const CHAT_API_SESSION_STORAGE_KEY = 'bat_experiment_chat_api_session_v2';

function createScopedChatApiSessionId(participantId) {
    const pid = String(participantId || 'anonymous').replace(/[^a-zA-Z0-9_-]/g, '_');
    const sid = String(sessionState.sessionId || `sess_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    const rid =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    return `chat_${pid}_${sid}_${rid}`;
}

function setChatApiSessionForCurrentParticipant(participantId) {
    const id = createScopedChatApiSessionId(participantId);
    sessionState.chatApiSessionId = id;
    try {
        sessionStorage.setItem(CHAT_API_SESSION_STORAGE_KEY, id);
        localStorage.setItem(CHAT_API_SESSION_STORAGE_KEY, id);
    } catch {
        /* ignore */
    }
    return id;
}

function getOrCreateChatApiSessionId() {
    if (sessionState.chatApiSessionId) {
        return sessionState.chatApiSessionId;
    }
    try {
        let id = sessionStorage.getItem(CHAT_API_SESSION_STORAGE_KEY) || localStorage.getItem(CHAT_API_SESSION_STORAGE_KEY);
        if (!id) {
            id = createScopedChatApiSessionId(experimentData.participantId);
            sessionStorage.setItem(CHAT_API_SESSION_STORAGE_KEY, id);
            localStorage.setItem(CHAT_API_SESSION_STORAGE_KEY, id);
        }
        sessionState.chatApiSessionId = id;
        return id;
    } catch {
        const id = createScopedChatApiSessionId(experimentData.participantId);
        sessionState.chatApiSessionId = id;
        return id;
    }
}

/** 배포된 Cloudflare Worker 루트 URL (POST 시 본문으로 채팅 전달, 응답은 { reply }) */
const DEFAULT_EXPERIMENT_WORKER_URL = 'https://my-worker.syuun0315.workers.dev/api/chat';

function getExperimentWorkerUrl() {
    try {
        if (typeof window !== 'undefined' && window.EXPERIMENT_WORKER_URL && String(window.EXPERIMENT_WORKER_URL).trim()) {
            return String(window.EXPERIMENT_WORKER_URL).trim().replace(/\/$/, '');
        }
        if (typeof window !== 'undefined' && window.CHAT_WORKER_URL && String(window.CHAT_WORKER_URL).trim()) {
            return String(window.CHAT_WORKER_URL).trim().replace(/\/$/, '');
        }
    } catch {
        /* ignore */
    }
    return DEFAULT_EXPERIMENT_WORKER_URL;
}

function getDataSinkUrl(options) {
    if (options && options.url && String(options.url).trim()) return String(options.url).trim();
    if (DATA_SINK_URL && String(DATA_SINK_URL).trim()) return String(DATA_SINK_URL).trim();
    try {
        if (typeof window !== 'undefined' && typeof window.DATA_SINK_URL === 'string' && window.DATA_SINK_URL.trim()) {
            return window.DATA_SINK_URL.trim();
        }
    } catch {
        /* ignore */
    }
    return '';
}

function getChatEndpointLabel() {
    return getExperimentWorkerUrl();
}

/** OpenAI용: 최근 user/assistant 5개 메시지만 (collectedChatLogs 기준) */
function buildWorkerOpenAiMessagesLast30() {
    const lines = collectedChatLogs.filter((l) => l.role === 'user' || l.role === 'assistant');
    const last = lines.slice(-5);
    return last.map((l) => ({
        role: l.role === 'assistant' ? 'assistant' : 'user',
        content: String(l.message_text || ''),
    }));
}

/** 시트용: 아직 Worker로 보내지 않은 발화만 (전체 로그는 collectedChatLogs에 누적 유지) */
function buildUnsyncedSheetRowsForWorker() {
    const synced = sessionState.lastSyncedChatLogOrder || 0;
    return collectedChatLogs
        .filter((l) => (l.role === 'user' || l.role === 'assistant') && l.message_order > synced)
        .map((l) => ({
            session_id: l.session_id,
            participant_id: l.participant_id,
            timestamp: l.timestamp,
            page_name: l.task_stage || '',
            event_type: l.role === 'assistant' ? 'chat_assistant' : 'chat_user',
            user_input: l.role === 'user' ? l.message_text : null,
            bot_response: l.role === 'assistant' ? l.message_text : null,
            correctness: null,
            dwell_time_ms: l.dwell_time_ms != null ? l.dwell_time_ms : null,
            additional_metadata: JSON.stringify({
                role: l.role,
                message_order: l.message_order,
                task_stage: l.task_stage,
                condition: l.condition,
                extra: l.additional_metadata != null ? l.additional_metadata : null,
            }),
        }));
}

/**
 * Worker만 호출 (OpenAI는 Worker 내부에서만 호출)
 * @param {string} message
 * @param {number} dwellTimeMs
 * @param {Array<{role:string,content:string}>} openAiMessages
 * @param {unknown[]} sheetRows
 */
async function requestChatToWorker(message, dwellTimeMs, openAiMessages, sheetRows) {
    const url = getExperimentWorkerUrl();
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            session_id: sessionState.sessionId,
            participant_id: getParticipantIdSafe(),
            page_name: currentStage,
            dwell_time_ms: dwellTimeMs,
            messages: openAiMessages,
            sheet_rows: sheetRows,
        })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const detail = data && (data.detail || data.error) ? String(data.detail || data.error) : '';
        throw new Error(`chat_api_error:${response.status}${detail ? ':' + detail.slice(0, 200) : ''}`);
    }
    const aiResponse = extractWorkerChatReply(data);
    if (!aiResponse) {
        throw new Error('chat_no_reply');
    }
    return { data, aiResponse, endpoint: url };
}

function getConditionLabel() {
    const c = experimentData.condition;
    if (c === 1) return 'text_reread';
    if (c === 2) return 'question_generation';
    if (c === 3) return 'AI_reread';
    if (c === 4) return 'AI_question_generation';
    return c != null ? String(c) : 'unknown';
}

function getParticipantIdSafe() {
    return experimentData.participantId || 'anonymous';
}

/** 참가자 시작 이후 전역 클릭 수(개발자 UI 제외). 실험 시작 시 0으로 리셋 */
function bindExperimentClickCounterOnce() {
    if (typeof window !== 'undefined' && window.__batExpClickBound) return;
    if (typeof window !== 'undefined') window.__batExpClickBound = true;
    document.addEventListener(
        'click',
        (e) => {
            if (!experimentData.participantId) return;
            const t = e.target;
            if (t && typeof t.closest === 'function') {
                if (t.closest('#dev-mode-toggle-btn') || t.closest('#designer-nav')) return;
            }
            experimentData.clickCount = (experimentData.clickCount || 0) + 1;
        },
        true
    );
}

/** Google Sheets·전송용: 한국 표준시(Asia/Seoul) 벽시계 문자열 (예: 2026-04-23T18:30:00+09:00) */
function experimentSheetTimestamp(msOrDate) {
    let d;
    if (msOrDate == null) {
        d = new Date();
    } else if (msOrDate instanceof Date) {
        d = msOrDate;
    } else {
        d = new Date(typeof msOrDate === 'number' ? msOrDate : Number(msOrDate));
    }
    const wall = d.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).replace(' ', 'T');
    return `${wall}+09:00`;
}

/**
 * 챗봇 한 줄 로그 (user / assistant)
 * @param {'user'|'assistant'} role
 * @param {string} messageText
 * @param {string} [taskStage] 예: review, learning
 * @param {{ dwell_time_ms?: number|null, additional_metadata?: any }} [meta]
 */
function saveChatLog(role, messageText, taskStage, meta) {
    const resolvedMeta = meta && typeof meta === 'object' ? meta : {};
    sessionState.chatMessageOrder += 1;
    const entry = {
        participant_id: getParticipantIdSafe(),
        session_id: sessionState.sessionId,
        condition: getConditionLabel(),
        timestamp: experimentSheetTimestamp(),
        role: role === 'assistant' ? 'assistant' : 'user',
        message_text: String(messageText || ''),
        message_order: sessionState.chatMessageOrder,
        task_stage: taskStage || currentStage || 'unknown',
        dwell_time_ms: Number.isFinite(resolvedMeta.dwell_time_ms) ? Math.round(resolvedMeta.dwell_time_ms) : null,
        additional_metadata: resolvedMeta.additional_metadata != null ? resolvedMeta.additional_metadata : null,
    };
    collectedChatLogs.push(entry);
    return entry;
}

/**
 * 실험 이벤트 한 행 (확장 가능)
 * time_spent: ms 단위 권장
 */
function saveExperimentEvent(partial) {
    sessionState.experimentTrialCounter += 1;
    const nowSheetTs = experimentSheetTimestamp();
    const dwellMs = partial.time_spent != null ? partial.time_spent : null;
    const dwellSec =
        dwellMs != null && Number.isFinite(dwellMs) ? Math.max(0, Math.round(dwellMs / 1000)) : null;
    const row = {
        participant_id: getParticipantIdSafe(),
        session_id: sessionState.sessionId,
        condition: getConditionLabel(),
        condition_number: experimentData.condition,
        trial_number: sessionState.experimentTrialCounter,
        page_name: partial.page_name != null ? partial.page_name : null,
        block_name: partial.block_name != null ? partial.block_name : null,
        response_value: partial.response_value != null ? partial.response_value : null,
        response_time: partial.response_time != null ? partial.response_time : null,
        start_time: partial.start_time != null ? partial.start_time : null,
        end_time: partial.end_time != null ? partial.end_time : null,
        time_spent: dwellMs,
        dwell_time_seconds: dwellSec,
        interaction_click_count: experimentData.clickCount ?? 0,
        correct_answer: partial.correct_answer != null ? partial.correct_answer : null,
        is_correct: partial.is_correct != null ? partial.is_correct : null,
        score: partial.score != null ? partial.score : null,
        timestamp: partial.timestamp != null ? partial.timestamp : nowSheetTs,
        extra: partial.extra != null ? partial.extra : null,
    };
    collectedExperimentRows.push(row);
    return row;
}

/** 이전 화면 단계 체류 시간 기록 후 새 단계로 진입 */
function recordStageDwellAndEnter(newStageKey) {
    const prevStage = currentStage;
    const prevAt = sessionState.lastStageEnterAt;
    const now = Date.now();
    if (prevAt != null && prevStage !== newStageKey) {
        saveExperimentEvent({
            page_name: `stage_${prevStage}`,
            block_name: 'stage_dwell',
            time_spent: Math.round(now - prevAt),
            start_time: experimentSheetTimestamp(prevAt),
            end_time: experimentSheetTimestamp(now),
        });
    }
    sessionState.lastStageEnterAt = now;
}

function getSurveyAnswerValue(qNum) {
    if (qNum >= 1 && qNum <= 7) {
        const el = document.querySelector(`input[name="survey-q${qNum}"]:checked`);
        return el ? el.value : '';
    }
    const inp = document.getElementById(`survey-q${qNum}`);
    return inp ? String(inp.value || '') : '';
}

/** 현재 보이는 설문 문항(1~9) 응답 + 체류 시간 로그 */
function logSurveyQuestionResponse(qNum) {
    const start = sessionState.surveyQuestionStartedAt;
    const end = Date.now();
    saveExperimentEvent({
        page_name: `survey_q${qNum}`,
        block_name: 'mid_survey',
        response_value: getSurveyAnswerValue(qNum),
        time_spent: start != null ? Math.round(end - start) : null,
        start_time: start != null ? experimentSheetTimestamp(start) : null,
        end_time: experimentSheetTimestamp(end),
        is_correct: null,
    });
}

function getPostSurveyAnswerValue(qNum) {
    if (qNum === 1) {
        const el = document.querySelector('input[name="post-survey-q1"]:checked');
        return el ? el.value : '';
    }
    if (qNum === 2) {
        const el = document.getElementById('post-survey-q2');
        return el ? String(el.value || '') : '';
    }
    if (qNum === 3) {
        // q3는 textarea(문제/이슈 서술)입니다.
        const el = document.getElementById('post-survey-q3');
        return el ? String(el.value || '') : '';
    }
    if (qNum === 4) {
        const el = document.querySelector('input[name="post-survey-q4"]:checked');
        return el ? el.value : '';
    }
    if (qNum === 5) {
        const el = document.getElementById('post-survey-q5');
        return el ? String(el.value || '') : '';
    }
    return '';
}

function logPostSurveyQuestionResponse(qNum) {
    const start = sessionState.postSurveyQuestionStartedAt;
    const end = Date.now();
    saveExperimentEvent({
        page_name: `post_survey_q${qNum}`,
        block_name: 'post_survey',
        response_value: getPostSurveyAnswerValue(qNum),
        time_spent: start != null ? Math.round(end - start) : null,
        start_time: start != null ? experimentSheetTimestamp(start) : null,
        end_time: experimentSheetTimestamp(end),
        is_correct: null,
    });
}

function logFinalTestQuestionResponse(qNum) {
    const start = sessionState.finalTestQuestionStartedAt;
    const end = Date.now();
    const inp = document.getElementById(`test-q${qNum}`);
    const text = inp ? String(inp.value || '') : '';
    saveExperimentEvent({
        page_name: `final_test_q${qNum}`,
        block_name: 'final_test',
        response_value: text,
        time_spent: start != null ? Math.round(end - start) : null,
        start_time: start != null ? experimentSheetTimestamp(start) : null,
        end_time: experimentSheetTimestamp(end),
        correct_answer: null,
        is_correct: null,
    });
}

/**
 * 수집분을 백엔드로 전송 → 서버에서 Google Sheets 등에 기록
 * @param {{ url?: string, silent?: boolean }} [options]
 */
async function submitAllDataToBackend(options) {
    const url = getDataSinkUrl(options);
    const silent = options && options.silent;
    if (!url || !String(url).trim()) {
        if (!silent) console.warn('[submitAllDataToBackend] DATA_SINK_URL/CHAT_WORKER_URL 이 비어 있어 전송하지 않습니다.');
        return { ok: false, skipped: true, reason: 'no_url' };
    }
    const chatRows = collectedChatLogs.map((l) => ({
        session_id: l.session_id,
        participant_id: l.participant_id,
        timestamp: l.timestamp,
        page_name: l.task_stage || currentStage || 'unknown',
        event_type: l.role === 'assistant' ? 'chat_assistant' : 'chat_user',
        user_input: l.role === 'user' ? l.message_text : null,
        bot_response: l.role === 'assistant' ? l.message_text : null,
        correctness: null,
        dwell_time_ms: l.dwell_time_ms != null ? l.dwell_time_ms : null,
        additional_metadata: {
            condition: l.condition,
            condition_number: experimentData.condition,
            interaction_click_count: experimentData.clickCount ?? 0,
            dwell_time_seconds:
                l.dwell_time_ms != null && Number.isFinite(l.dwell_time_ms)
                    ? Math.max(0, Math.round(l.dwell_time_ms / 1000))
                    : null,
            message_order: l.message_order,
            extra: l.additional_metadata != null ? l.additional_metadata : null,
        },
    }));
    const eventRows = collectedExperimentRows.map((r) => ({
        session_id: r.session_id,
        participant_id: r.participant_id,
        timestamp: r.timestamp,
        page_name: r.page_name || null,
        event_type: r.block_name || 'experiment_event',
        user_input: r.response_value,
        bot_response: null,
        correctness: r.is_correct,
        dwell_time_ms: r.time_spent,
        additional_metadata: {
            trial_number: r.trial_number,
            condition: r.condition,
            condition_number: r.condition_number,
            interaction_click_count: r.interaction_click_count,
            dwell_time_seconds: r.dwell_time_seconds,
            response_time: r.response_time,
            start_time: r.start_time,
            end_time: r.end_time,
            correct_answer: r.correct_answer,
            score: r.score,
            extra: r.extra,
        },
    }));
    const d = experimentData.distractor;
    const distractorWrong =
        d && Number.isFinite(d.wrongCount) ? d.wrongCount : Math.max(0, (d?.totalCount || 0) - (d?.correctCount || 0));
    const payload = {
        participant_id: getParticipantIdSafe(),
        session_id: sessionState.sessionId,
        condition: getConditionLabel(),
        condition_number: experimentData.condition,
        interaction_click_count: experimentData.clickCount ?? 0,
        distractor_math_summary: {
            correct_total: d?.correctCount ?? 0,
            wrong_total: distractorWrong,
            trials_total: d?.totalCount ?? 0,
        },
        event_rows: chatRows.concat(eventRows),
        chat_logs: collectedChatLogs.slice(),
        experiment_data: collectedExperimentRows.slice(),
        experiment_snapshot: experimentData,
    };
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const t = await res.text();
            throw new Error(`HTTP ${res.status}: ${t}`);
        }
        if (!silent) console.log('[submitAllDataToBackend] 전송 완료');
        return { ok: true };
    } catch (e) {
        console.error('[submitAllDataToBackend] 실패:', e);
        return { ok: false, error: String(e.message || e) };
    }
}

// saveLogsToSheet 는 백엔드 URL 별칭 (동일 동작)
async function saveLogsToSheet(options) {
    return submitAllDataToBackend(options);
}

/** 실험 행 저장 별칭 (요구사항 명칭과 맞춤) */
const saveExperimentData = saveExperimentEvent;

/** 전체 제출 별칭 */
const submitExperimentData = submitAllDataToBackend;

// 조건 랜덤 배정 (1-4)
function assignCondition() {
    const condition = Math.floor(Math.random() * 4) + 1;
    experimentData.condition = condition;
    // 참가자 ID는 시작 화면에서 입력받음
    experimentData.startTime = experimentSheetTimestamp();
    return condition;
}

/** 학습 단계일 때만 뷰포트 고정 남은 시간 배지 표시 */
function syncLearningTimerFloatVisibility(stageKey) {
    const el = document.getElementById('learning-timer-float-root');
    if (!el) return;
    const show = stageKey === 'learning';
    if (show) {
        el.hidden = false;
        el.setAttribute('aria-hidden', 'false');
        el.classList.add('learning-timer-float-root--visible');
    } else {
        el.hidden = true;
        el.setAttribute('aria-hidden', 'true');
        el.classList.remove('learning-timer-float-root--visible');
    }
}

// 단계 전환
function showStage(stage) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const targetScreen = document.getElementById(stage + '-screen');
    if (targetScreen) {
        // 스크롤을 맨 위로 이동
        targetScreen.scrollTop = 0;
        window.scrollTo(0, 0);
        
        targetScreen.classList.add('active');
        recordStageDwellAndEnter(stage);
        currentStage = stage;
        
        // 각 단계별 초기화
        if (stage === 'review-instruction') {
            setupReviewInstruction();
        } else if (stage === 'review') {
            setupReviewStage();
        } else if (stage === 'survey') {
            setTimeout(() => {
                setupSurvey();
            }, 100);
        } else if (stage === 'distractor') {
            // distractor는 setupDistractorTask에서 처리하되, showStage는 이미 호출되었으므로
            // setupDistractorTask 내부에서 showStage를 호출하지 않도록 수정
            setTimeout(() => {
                setupDistractorTaskInternal();
            }, 50);
        } else if (stage === 'ai-literacy-survey') {
            if (!experimentData.aiLiteracy.startTime) {
                experimentData.aiLiteracy.startTime = experimentSheetTimestamp();
            }
            setTimeout(() => {
                setupAiLiteracySurvey();
            }, 100);
        } else if (stage === 'completion') {
            submitAllDataToBackend({ silent: true });
            const btn = document.getElementById('download-btn');
            if (btn) {
                btn.style.display = 'none';
            }
            const up = document.getElementById('upload-btn');
            if (up) up.style.display = 'none';
        }
        
        // 시간 기록
        if (!experimentData.stageTimes[stage]) {
            experimentData.stageTimes[stage] = {
                startTime: experimentSheetTimestamp()
            };
        }
        
        // 설계자 모드일 때 정보 업데이트
        if (designerMode) {
            updateActiveNavButton();
            updateDesignerInfo();
        }

        const reviewStageBar = document.getElementById('review-stage-bar');
        const reviewToSurveyBtn = document.getElementById('review-to-survey-btn');
        if (reviewStageBar && stage !== 'review') {
            reviewStageBar.style.display = 'none';
            if (reviewToSurveyBtn) reviewToSurveyBtn.style.display = 'none';
        }
    }
    syncLearningTimerFloatVisibility(stage);
}

function updateReviewStageBar() {
    const bar = document.getElementById('review-stage-bar');
    const hintEl = document.getElementById('review-stage-bar-hint');
    if (!bar || !hintEl) return;
    if (currentStage !== 'review') {
        bar.style.display = 'none';
        return;
    }
    bar.style.display = 'flex';
    hintEl.textContent = '';
    hintEl.style.display = 'none';
}

// 복습 단계 설정
function setupReviewStage() {
    const condition = experimentData.condition;
    const reviewLeft = document.querySelector('.review-left');
    const reviewCenter = document.querySelector('.review-center');
    const reviewRight = document.querySelector('.review-right');
    
    // 질문 단계 초기화 (복습 단계가 처음 시작될 때는 질문 만들기 단계)
    // startTime이 없으면 처음 시작하는 것이므로 질문 만들기 단계로 초기화
    if (!experimentData.review.startTime) {
        experimentData.review.questionStage = 'question';
    }
    
    // 모든 모드 숨기기
    const relearningMode = document.getElementById('relearning-mode');
    const questionMode = document.getElementById('question-generation-mode');
    const answerMode = document.getElementById('answer-writing-mode');
    const aiChatMode = document.getElementById('ai-chat-mode');
    
    if (relearningMode) relearningMode.style.display = 'none';
    if (questionMode) questionMode.style.display = 'none';
    if (answerMode) answerMode.style.display = 'none';
    if (aiChatMode) aiChatMode.style.display = 'none';
    
    // review-center 초기화
    if (reviewCenter) {
        reviewCenter.classList.remove('hidden');
    }
    
    // 모든 모드 초기화 (questionMode, aiChatMode는 위에서 이미 선언됨)
    const notesTextarea = document.getElementById('relearning-notes');
    
    // 학습노트는 기본적으로 표시
    if (notesTextarea) {
        notesTextarea.style.display = '';
    }
    
    // order 초기화
    if (aiChatMode) {
        aiChatMode.style.order = '';
    }
    if (questionMode) {
        questionMode.style.order = '';
    }
    
    // 레이아웃 스타일 초기화
    const reviewLayout = document.querySelector('.review-layout');
    if (reviewLayout) {
        reviewLayout.classList.remove('learning-style');
    }
    
    const reviewLeftEl = document.querySelector('.review-left');
    if (reviewLeftEl) {
        reviewLeftEl.classList.remove('content-area-style', 'full-width');
    }
    
    // review-center 초기화
    if (reviewCenter) {
        reviewCenter.classList.remove('hidden');
    }
    
    // 조건 클래스 초기화
    const reviewScreen = document.getElementById('review-screen');
    if (reviewScreen) {
        reviewScreen.classList.remove('condition-4');
    }
    
    // 조건에 따라 모드 표시
    if (condition === 1) {
        // 지문 재학습 - 처음 학습 화면과 똑같이 (지문만 전체 화면)
        if (reviewCenter) {
            reviewCenter.classList.add('hidden');
        }
        reviewRight.classList.add('hidden');
        reviewLeft.classList.add('full-width');
        
        // review-layout을 content-area 스타일로 변경
        const reviewLayout = document.querySelector('.review-layout');
        if (reviewLayout) {
            reviewLayout.classList.add('learning-style');
        }
        
        // review-left를 content-area처럼 보이도록
        const reviewLeftEl = document.querySelector('.review-left');
        if (reviewLeftEl) {
            reviewLeftEl.classList.add('content-area-style');
        }
    } else if (condition === 2) {
        // 지문 질문생성 - 질문+답+해설 만들기
        if (reviewCenter) {
            reviewCenter.classList.add('hidden');
        }
        reviewRight.classList.remove('hidden');
        reviewLeft.classList.remove('full-width');
        if (questionMode) {
            questionMode.style.display = 'block';
            // 질문+답+해설 쌍 초기화 (DOM이 준비된 후 실행)
            setTimeout(() => {
                initializeQuestionAnswerPair();
            }, 100);
        }
    } else if (condition === 3) {
        // 지문+AI 재학습: 왼쪽엔 지문, 가운데엔 AI 챗봇만 표시
        if (reviewCenter) {
            reviewCenter.classList.remove('hidden');
        }
        reviewRight.classList.add('hidden');
        reviewLeft.classList.remove('full-width');
        // 재학습 모드는 숨기기
        if (document.getElementById('relearning-mode')) {
            document.getElementById('relearning-mode').style.display = 'none';
        }
        // AI 챗봇만 표시
        if (aiChatMode) {
            aiChatMode.style.display = 'block';
            // 챗봇 메시지 영역 초기화
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
                // 환영 메시지 추가
                const welcomeMsg = document.createElement('div');
                welcomeMsg.className = 'chat-message ai';
                setAssistantMessageBody(
                    welcomeMsg,
                    '안녕하세요! 박쥐에 관한 학습 지문에 대해 질문해주세요. 도움을 드리겠습니다.',
                    { markdown: false }
                );
                chatMessages.appendChild(welcomeMsg);
            }
        }
    } else if (condition === 4) {
        // 지문+AI 질문생성: 세로로 3분할 (지문, 챗봇, 질문생성)
        // 조건 4 클래스 추가하여 화면을 넓게 사용
        const reviewScreen = document.getElementById('review-screen');
        if (reviewScreen) {
            reviewScreen.classList.add('condition-4');
        }
        
        // 질문+답+해설 만들기 단계: 지문, 챗봇, 질문생성 모두 표시
        if (reviewCenter) {
            reviewCenter.classList.remove('hidden');
        }
        reviewRight.classList.remove('hidden');
        reviewRight.classList.remove('full-width');
        reviewLeft.classList.remove('full-width');
        if (aiChatMode) {
            aiChatMode.style.display = 'block';
            // 챗봇 메시지 영역 초기화
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages && chatMessages.children.length === 0) {
                // 환영 메시지 추가
                const welcomeMsg = document.createElement('div');
                welcomeMsg.className = 'chat-message ai';
                setAssistantMessageBody(
                    welcomeMsg,
                    '안녕하세요! 박쥐에 관한 학습 지문에 대해 질문해주세요. 도움을 드리겠습니다.',
                    { markdown: false }
                );
                chatMessages.appendChild(welcomeMsg);
            }
        }
        if (questionMode) {
            questionMode.style.display = 'block';
            // 질문+답+해설 쌍 초기화 (DOM이 준비된 후 실행)
            setTimeout(() => {
                initializeQuestionAnswerPair();
            }, 100);
        }
    } else if (!condition || condition === null) {
        // 관리자 모드: 조건이 없을 때 기본적으로 질문+답+해설 모드 표시
        if (reviewCenter) {
            reviewCenter.classList.add('hidden');
        }
        reviewRight.classList.remove('hidden');
        reviewLeft.classList.remove('full-width');
        if (questionMode) {
            questionMode.style.display = 'block';
            // 질문+답+해설 쌍 초기화 (DOM이 준비된 후 실행)
            setTimeout(() => {
                initializeQuestionAnswerPair();
            }, 100);
        }
    }
    
    experimentData.review.startTime = experimentSheetTimestamp();

    // 질문생성 조건(2, 4)에서만 사실/이해 유형 선택 표시 (1·3·개발자 미지정은 숨김)
    const questionTypeChoices = document.querySelector('.question-type-choices');
    if (questionTypeChoices) {
        if (condition === 1 || condition === 3) {
            questionTypeChoices.style.display = 'none';
        } else {
            questionTypeChoices.style.removeProperty('display');
        }
    }

    updateReviewStageBar();

    // 복습 상단 바 오른쪽 '다음 단계로': 조건 1·3은 1분 후, 조건 2·4는 showCurrentPair에서 문제 6 이상일 때 표시
    const reviewToSurveyBtn = document.getElementById('review-to-survey-btn');
    if (reviewToSurveyBtn) reviewToSurveyBtn.style.display = 'none';
    if (condition === 1 || condition === 3) {
        setTimeout(() => {
            const btn = document.getElementById('review-to-survey-btn');
            if (btn && currentStage === 'review') btn.style.display = 'inline-block';
        }, 60000);
    }
}

// 질문+답+해설 쌍 초기화
function initializeQuestionAnswerPair() {
    // pairs 배열이 없으면 초기화
    if (!experimentData.review.pairs) {
        experimentData.review.pairs = [];
    }
    
    // 복습 단계가 처음 시작될 때 currentPairIndex 초기화
    if (experimentData.review.currentPairIndex === undefined || experimentData.review.currentPairIndex === null) {
        experimentData.review.currentPairIndex = 0;
    }
    
    // 현재 쌍 표시
    showCurrentPair();
}

// 현재 쌍 표시
function showCurrentPair() {
    const currentPairIndex = experimentData.review.currentPairIndex || 0;
    const pairs = experimentData.review.pairs || [];
    
    // 문제 번호 표시 (문제 1, 문제 2, ...)
    const pairInfo = document.getElementById('current-pair-info');
    if (pairInfo) {
        pairInfo.textContent = `문제 ${currentPairIndex + 1}`;
    }
    
    // 조건 2, 4에서 문제 6 이상이면 상단 바에 '다음 단계로' 버튼 표시
    const condition = (typeof experimentData !== 'undefined' && experimentData.condition) ? experimentData.condition : 0;
    const reviewToSurveyBtn = document.getElementById('review-to-survey-btn');
    if (reviewToSurveyBtn && (condition === 2 || condition === 4)) {
        reviewToSurveyBtn.style.display = currentPairIndex >= 5 ? 'inline-block' : 'none';
    }

    // 현재 쌍 데이터가 있으면 표시, 없으면 빈 필드
    const currentQuestion = document.getElementById('current-question');
    const currentAnswer = document.getElementById('current-answer');
    const currentExplanation = document.getElementById('current-explanation');
    
    const factCb = document.getElementById('question-type-fact');
    const understandCb = document.getElementById('question-type-understand');
    if (pairs[currentPairIndex]) {
        // 기존 쌍 데이터 표시
        if (currentQuestion) currentQuestion.value = pairs[currentPairIndex].question || '';
        if (currentAnswer) currentAnswer.value = pairs[currentPairIndex].answer || '';
        if (currentExplanation) currentExplanation.value = pairs[currentPairIndex].explanation || '';
        if (factCb) factCb.checked = !!pairs[currentPairIndex].typeFact;
        if (understandCb) understandCb.checked = !!pairs[currentPairIndex].typeUnderstand;
    } else {
        // 새 쌍 - 빈 필드
        if (currentQuestion) currentQuestion.value = '';
        if (currentAnswer) currentAnswer.value = '';
        if (currentExplanation) currentExplanation.value = '';
        if (factCb) factCb.checked = false;
        if (understandCb) understandCb.checked = false;
    }
    
    sessionState.reviewPairStartedAt = Date.now();
}

// 다음 쌍으로 이동
function moveToNextPair() {
    // 현재 쌍 데이터 저장
    const currentQuestion = document.getElementById('current-question');
    const currentAnswer = document.getElementById('current-answer');
    const currentExplanation = document.getElementById('current-explanation');
    
    if (!currentQuestion || !currentAnswer || !currentExplanation) return;
    
    const question = currentQuestion.value.trim();
    const answer = currentAnswer.value.trim();
    const explanation = currentExplanation.value.trim();

    const factCb = document.getElementById('question-type-fact');
    const understandCb = document.getElementById('question-type-understand');
    const typeFact = !!(factCb && factCb.checked);
    const typeUnderstand = !!(understandCb && understandCb.checked);
    if (!typeFact && !typeUnderstand) {
        alert("이 문제가 '사실'인지 '이해'인지 체크해 주세요. (둘 다 해당되면 두 칸 모두 선택할 수 있습니다.)");
        return;
    }
    
    // 현재 쌍 데이터 저장 또는 업데이트
    const currentPairIndex = experimentData.review.currentPairIndex;
    if (experimentData.review.pairs[currentPairIndex]) {
        // 기존 쌍 업데이트
        experimentData.review.pairs[currentPairIndex] = {
            number: currentPairIndex + 1,
            question: question,
            answer: answer,
            explanation: explanation,
            typeFact,
            typeUnderstand,
        };
    } else {
        // 새 쌍 추가
        experimentData.review.pairs.push({
            number: currentPairIndex + 1,
            question: question,
            answer: answer,
            explanation: explanation,
            typeFact,
            typeUnderstand,
        });
    }
    
    const pairStart = sessionState.reviewPairStartedAt;
    const nowMs = Date.now();
    saveExperimentEvent({
        page_name: `review_generated_problem_${currentPairIndex + 1}`,
        block_name: 'question_generation',
        response_value: JSON.stringify({
            question,
            answer,
            explanationSnippet: explanation.slice(0, 500),
            typeFact,
            typeUnderstand,
        }),
        time_spent: pairStart != null ? Math.round(nowMs - pairStart) : null,
        start_time: pairStart != null ? experimentSheetTimestamp(pairStart) : null,
        end_time: experimentSheetTimestamp(nowMs),
        is_correct: null,
    });
    
    // 다음 쌍으로 이동
    experimentData.review.currentPairIndex++;
    showCurrentPair();
}

// 질문 항목 추가
function addQuestionItem() {
    const questionsContainer = document.getElementById('questions-container');
    if (!questionsContainer) return;
    
    const questionNumber = questionsContainer.children.length + 1;
    const questionItem = document.createElement('div');
    questionItem.className = 'question-item';
    questionItem.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <label style="flex: 0 0 auto;">질문 ${questionNumber}:</label>
            <button class="remove-question-btn" style="flex: 0 0 auto; background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.9em;">삭제</button>
        </div>
        <textarea class="question-input" placeholder="질문을 입력하세요..." rows="2"></textarea>
    `;
    
    questionsContainer.appendChild(questionItem);
    
    // 삭제 버튼 이벤트 리스너
    const removeBtn = questionItem.querySelector('.remove-question-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            if (questionsContainer.children.length > 1) {
                questionItem.remove();
                updateQuestionNumbers();
            } else {
                alert('최소 1개 이상의 질문이 필요합니다.');
            }
        });
    }
}

// 질문 번호 업데이트
function updateQuestionNumbers() {
    const questionsContainer = document.getElementById('questions-container');
    if (!questionsContainer) return;
    
    const questionItems = questionsContainer.querySelectorAll('.question-item');
    questionItems.forEach((item, index) => {
        const label = item.querySelector('label');
        if (label) {
            label.textContent = `질문 ${index + 1}:`;
        }
    });
}

// 질문 만들기에서 답 써보기로 전환
function switchToAnswerWriting() {
    // 질문들 수집
    const questionInputs = document.querySelectorAll('#questions-container .question-input');
    const questions = [];
    questionInputs.forEach((input, index) => {
        const questionText = input.value.trim();
        if (questionText) {
            questions.push({
                number: index + 1,
                question: questionText
            });
        }
    });
    
    // 최소 1개 이상의 질문이 있어야 함
    if (questions.length === 0) {
        alert('최소 1개 이상의 질문을 입력해주세요.');
        return;
    }
    
    // 질문들을 저장
    experimentData.review.questions = questions;
    experimentData.review.questionStage = 'answer';
    
    // 답 써보기 컨테이너에 질문들 표시
    const answersContainer = document.getElementById('answers-container');
    if (answersContainer) {
        answersContainer.innerHTML = '';
        questions.forEach((q) => {
            const answerItem = document.createElement('div');
            answerItem.className = 'question-item';
            answerItem.innerHTML = `
                <label style="display: block; font-weight: bold; margin-bottom: 10px; color: #2c3e50; font-size: 1.1em; line-height: 1.6;">질문 ${q.number}: ${q.question}</label>
                <textarea class="answer-input" id="answer-${q.number}" placeholder="답을 입력하세요..." rows="6" style="width: 100%; padding: 15px; border: 2px solid #ddd; border-radius: 4px; font-size: 1em; font-family: inherit; resize: vertical;"></textarea>
            `;
            answersContainer.appendChild(answerItem);
        });
    }
    
    // 질문 만들기 모드 숨기고 답 써보기 모드 표시
    const questionMode = document.getElementById('question-generation-mode');
    const answerMode = document.getElementById('answer-writing-mode');
    if (questionMode) {
        questionMode.style.display = 'none';
    }
    if (answerMode) {
        answerMode.style.display = 'block';
    }
    
    // 지문과 AI 숨기기
    const reviewLeft = document.querySelector('.review-left');
    const reviewCenter = document.querySelector('.review-center');
    if (reviewLeft) {
        reviewLeft.classList.add('hidden');
    }
    if (reviewCenter) {
        reviewCenter.classList.add('hidden');
    }
    
    // review-right를 전체 너비로 확장
    const reviewRight = document.querySelector('.review-right');
    if (reviewRight) {
        reviewRight.classList.add('full-width');
    }
    
    // setupReviewStage를 다시 호출하여 레이아웃 업데이트
    setupReviewStage();
    
    // 타이머는 계속 진행 (답 써보기 단계에서도 같은 타이머 사용)
}

// 최종 시험 관련 변수
let currentQuestionIndex = 0;
let testQuestionTimers = {}; // 각 문제를 이미 본 적이 있는지 저장
let nextButtonTimers = {}; // 다음 버튼 표시 타이머

// 최종 시험 설정
function setupFinalTest() {
    const container = document.getElementById('test-questions-container');
    if (!container) return;
    
    // 기존 내용 제거 및 초기화
    container.innerHTML = '';
    currentQuestionIndex = 0;
    testQuestionTimers = {};
    // 기존 타이머 모두 제거
    Object.values(nextButtonTimers).forEach(timer => {
        if (timer) clearTimeout(timer);
    });
    nextButtonTimers = {};
    // 기존 타이머 모두 제거
    Object.values(nextButtonTimers).forEach(timer => {
        if (timer) clearTimeout(timer);
    });
    nextButtonTimers = {};
    
    // 문제가 없으면 기본 12개 생성
    let questions = finalTestQuestions;
    if (questions.length === 0) {
        questions = Array.from({ length: 12 }, (_, i) => ({
            number: i + 1,
            question: `문제 ${i + 1} (문제 내용을 추가해주세요)`
        }));
    }
    
    // 모든 문제 생성 (숨김 처리)
    questions.forEach((q) => {
        const testItem = document.createElement('div');
        testItem.className = 'test-item';
        testItem.id = `test-item-${q.number}`;
        testItem.style.display = 'none';
        testItem.innerHTML = `
            <label>${q.number}. ${q.question}</label>
            <textarea id="test-q${q.number}" rows="5" placeholder="답변을 입력해주세요..."></textarea>
        `;
        container.appendChild(testItem);
    });
    
    experimentData.finalTest.questions = questions;
    
    // 첫 번째 문제 표시
    showQuestion(0);
}

// 특정 문제 표시
function showQuestion(index) {
    const questions = experimentData.finalTest.questions || finalTestQuestions;
    if (index < 0 || index >= questions.length) return;
    
    // 모든 문제 숨기기
    questions.forEach((q) => {
        const item = document.getElementById(`test-item-${q.number}`);
        if (item) {
            item.style.display = 'none';
        }
    });
    
    // 현재 문제 표시
    const currentQ = questions[index];
    const currentItem = document.getElementById(`test-item-${currentQ.number}`);
    if (currentItem) {
        currentItem.style.display = 'block';
        currentQuestionIndex = index;
        
        // 진행 상황 업데이트
        const progressEl = document.getElementById('test-progress');
        if (progressEl) {
            progressEl.textContent = `문제 ${index + 1} / ${questions.length}`;
        }
        
        sessionState.finalTestQuestionStartedAt = Date.now();
        
        // 네비게이션 버튼 업데이트
        const nextBtn = document.getElementById('test-next-btn');
        const submitBtn = document.getElementById('final-test-submit-btn');
        
        // 다음 버튼과 제출 버튼 처리
        if (index < questions.length - 1) {
            // 마지막 문제가 아닌 경우
            if (nextBtn) {
                // 기존 타이머가 있으면 제거
                if (nextButtonTimers[index]) {
                    clearTimeout(nextButtonTimers[index]);
                    delete nextButtonTimers[index];
                }
                
                // 이미 이 문제를 본 적이 있으면 즉시 표시, 아니면 10초 후 표시
                if (testQuestionTimers[currentQ.number]) {
                    nextBtn.style.display = 'inline-block';
                    nextBtn.disabled = false;
                } else {
                    // 다음 버튼을 처음에는 숨김
                    nextBtn.style.display = 'none';
                    nextBtn.disabled = true;
                    
                    // 10초 후 다음 버튼 표시
                    nextButtonTimers[index] = setTimeout(() => {
                        if (nextBtn) {
                            nextBtn.style.display = 'inline-block';
                            nextBtn.disabled = false;
                        }
                        testQuestionTimers[currentQ.number] = true;
                    }, 10000);
                }
            }
            if (submitBtn) {
                submitBtn.style.display = 'none';
            }
        } else {
            // 마지막 문제인 경우
            if (nextBtn) {
                nextBtn.style.display = 'none';
            }
            if (submitBtn) {
                // 기존 타이머가 있으면 제거
                if (nextButtonTimers[index]) {
                    clearTimeout(nextButtonTimers[index]);
                    delete nextButtonTimers[index];
                }
                
                // 이미 이 문제를 본 적이 있으면 즉시 표시, 아니면 10초 후 표시
                if (testQuestionTimers[currentQ.number]) {
                    submitBtn.style.display = 'inline-block';
                    submitBtn.disabled = false;
                } else {
                    // 제출 버튼을 처음에는 숨김
                    submitBtn.style.display = 'none';
                    submitBtn.disabled = true;
                    
                    // 10초 후 제출 버튼 표시
                    nextButtonTimers[index] = setTimeout(() => {
                        if (submitBtn) {
                            submitBtn.style.display = 'inline-block';
                            submitBtn.disabled = false;
                        }
                        testQuestionTimers[currentQ.number] = true;
                    }, 10000);
                }
            }
        }
        
        // 답변 입력은 언제든 가능 (즉시 활성화)
        const answerInput = document.getElementById(`test-q${currentQ.number}`);
        if (answerInput) {
            answerInput.disabled = false;
        }
    }
}

// 사후질문 관련 변수
let currentPostSurveyIndex = 0;
let currentSurveyIndex = 0;

// 설문 설정
function setupSurvey() {
    const container = document.getElementById('survey-questions-container');
    if (!container) {
        console.error('survey-questions-container를 찾을 수 없습니다.');
        return;
    }
    
    // 기존 내용 제거 및 초기화
    container.innerHTML = '';
    currentSurveyIndex = 0;
    
    // 설문 질문 목록
    const surveyQuestions = [
        {
            number: 1,
            type: 'scale',
            instruction: '다음 질문을 읽고, 해당하는 정도에 체크해주세요.',
            question: '오늘 학습한 내용을 공부하는 것이 재밌었다.',
            scale: {
                min: 1,
                max: 7,
                minLabel: '전혀 그렇지 않음',
                maxLabel: '매우 그렇다'
            }
        },
        {
            number: 2,
            type: 'scale',
            instruction: '다음 질문을 읽고, 해당하는 정도에 체크해주세요.',
            question: '앞으로도 오늘과 같은 방식으로 공부하고 싶다.',
            scale: {
                min: 1,
                max: 7,
                minLabel: '전혀 그렇지 않음',
                maxLabel: '매우 그렇다'
            }
        },
        {
            number: 3,
            type: 'scale',
            instruction: '다음 질문을 읽고, 해당하는 정도에 체크해주세요.',
            question: '오늘 학습한 내용에 대해 더 알고 싶어졌다.',
            scale: {
                min: 1,
                max: 7,
                minLabel: '전혀 그렇지 않음',
                maxLabel: '매우 그렇다'
            }
        },
        {
            number: 4,
            type: 'scale',
            instruction: '다음 질문을 읽고, 해당하는 정도에 체크해주세요.',
            question: '오늘 학습한 내용이 나에게 유용했다.',
            scale: {
                min: 1,
                max: 7,
                minLabel: '전혀 그렇지 않음',
                maxLabel: '매우 그렇다'
            }
        },
        {
            number: 5,
            type: 'scale',
            instruction: '다음 질문을 읽고, 해당하는 정도에 체크해주세요.',
            question: '학습 활동을 하는 동안 스트레스를 느꼈다.',
            scale: {
                min: 1,
                max: 7,
                minLabel: '전혀 그렇지 않음',
                maxLabel: '매우 그렇다'
            }
        },
        {
            number: 6,
            type: 'scale',
            instruction: '다음 질문을 읽고, 해당하는 정도에 체크해주세요.',
            question: '이 학습 과제를 수행하는 데 얼마나 많은 정신적 노력을 기울였습니까?',
            scale: {
                min: 1,
                max: 7,
                minLabel: '매우 낮은 정신적 노력을 들였다',
                maxLabel: '매우 높은 정신적 노력을 들였다'
            }
        },
        {
            number: 7,
            type: 'scale',
            instruction: '다음 질문을 읽고, 해당하는 정도에 체크해주세요.',
            question: '이 학습 과제를 수행하는 것은 얼마나 어렵다고 느꼈습니까?',
            scale: {
                min: 1,
                max: 7,
                minLabel: '전혀 어렵지 않았다',
                maxLabel: '매우 어려웠다'
            }
        },
        {
            number: 8,
            type: 'number',
            instruction: '다음 질문을 읽고, 해당하는 정도에 체크해주세요.',
            question:
                '잠시 후, 방금 읽은 지문에 대한 최종 시험을 보게 됩니다. 지금 시험을 본다면 몇 %의 문제를 맞힐 수 있을 것 같나요?',
            subtitle: '0~100 사이에서 선택해주세요.',
            min: 0,
            max: 100
        }
    ];
    
    // 모든 질문 생성 (숨김 처리)
    surveyQuestions.forEach((q) => {
        const questionItem = document.createElement('div');
        questionItem.className = 'post-survey-item';
        questionItem.id = `survey-item-${q.number}`;
        questionItem.style.display = 'none';
        
        let questionHTML = `
            <div class="post-survey-instruction">${q.instruction}</div>
            <div class="post-survey-question">${q.question}</div>
        `;
        
        if (q.subtitle) {
            questionHTML += `<div class="post-survey-subtitle">${q.subtitle}</div>`;
        }
        
        if (q.type === 'scale') {
            questionHTML += `
                <div class="scale-container">
                    <div class="scale-labels">
                        <span class="scale-min">${q.scale.minLabel}</span>
                        <span class="scale-max">${q.scale.maxLabel}</span>
                    </div>
                    <div class="scale-options">
            `;
            for (let i = q.scale.min; i <= q.scale.max; i++) {
                questionHTML += `
                    <label class="scale-option">
                        <input type="radio" name="survey-q${q.number}" value="${i}">
                        <span>${i}</span>
                    </label>
                `;
            }
            questionHTML += `
                    </div>
                </div>
            `;
        } else if (q.type === 'number') {
            const unit = q.min === 0 && q.max === 100 ? '%' : '';
            const placeholder = q.min === 0 && q.max === 100 ? '0~100' : '';
            questionHTML += `
                <div class="number-input-container">
                    <input type="text" inputmode="numeric" id="survey-q${q.number}" min="${q.min}" max="${q.max}" pattern="[0-9]*"${placeholder ? ` placeholder="${placeholder}"` : ''}>
                    ${unit ? `<span class="percent-sign">${unit}</span>` : ''}
                </div>
            `;
        }
        
        questionItem.innerHTML = questionHTML;
        container.appendChild(questionItem);
    });
    
    // 첫 번째 질문 표시 및 버튼 초기화
    setTimeout(() => {
        showSurveyQuestion(0);
        // 버튼 강제 표시 확인
        const nextBtn = document.getElementById('survey-next-btn');
        if (nextBtn) {
            nextBtn.style.display = 'inline-block';
            nextBtn.style.visibility = 'visible';
            nextBtn.style.opacity = '1';
            nextBtn.disabled = false;
        }
        
        // 숫자 입력 필드에 숫자만 입력되도록 제한
        const numberInput8 = document.getElementById('survey-q8');
        [numberInput8].forEach((input) => {
            if (input) {
                input.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    const num = parseInt(e.target.value);
                    if (!isNaN(num)) {
                        if (num > 100) {
                            e.target.value = '100';
                        } else if (num < 0) {
                            e.target.value = '0';
                        }
                    }
                });
                
                input.addEventListener('keypress', (e) => {
                    const char = String.fromCharCode(e.which);
                    if (!/[0-9]/.test(char)) {
                        e.preventDefault();
                    }
                });
            }
        });
    }, 100);
}

// 특정 설문 질문 표시
function showSurveyQuestion(index) {
    const container = document.getElementById('survey-questions-container');
    if (!container) return;

    clearSurveyValidationMsg();

    const totalQuestions = 8;
    if (index < 0 || index >= totalQuestions) return;
    
    // 모든 질문 숨기기
    for (let i = 1; i <= totalQuestions; i++) {
        const item = document.getElementById(`survey-item-${i}`);
        if (item) {
            item.style.display = 'none';
        }
    }
    
    // 현재 질문 표시
    const currentItem = document.getElementById(`survey-item-${index + 1}`);
    if (currentItem) {
        currentItem.style.display = 'block';
        currentSurveyIndex = index;
        
        // 진행 상황 업데이트
        const progressEl = document.getElementById('survey-progress');
        if (progressEl) {
            progressEl.textContent = `질문 ${index + 1} / ${totalQuestions}`;
        }
        
        sessionState.surveyQuestionStartedAt = Date.now();
        
        // 네비게이션 버튼 업데이트
        const nextBtn = document.getElementById('survey-next-btn');
        const submitBtn = document.getElementById('survey-submit-btn');
        
        // 다음 버튼과 완료 버튼 처리
        if (index < totalQuestions - 1) {
            // 마지막 질문이 아닌 경우
            if (nextBtn) {
                nextBtn.style.display = 'inline-block';
                nextBtn.style.visibility = 'visible';
                nextBtn.style.opacity = '1';
                nextBtn.disabled = false;
            }
            if (submitBtn) {
                submitBtn.style.display = 'none';
            }
        } else {
            // 마지막 질문인 경우
            if (nextBtn) {
                nextBtn.style.display = 'none';
            }
            if (submitBtn) {
                submitBtn.style.display = 'inline-block';
                submitBtn.style.visibility = 'visible';
                submitBtn.style.opacity = '1';
                submitBtn.disabled = false;
            }
        }
    }
}

let currentAiLiteracyIndex = 0;

function clearSurveyValidationMsg() {
    const el = document.getElementById('survey-validation-msg');
    if (el) {
        el.textContent = '';
        el.style.display = 'none';
    }
}

function showSurveyValidationMsg(text) {
    const el = document.getElementById('survey-validation-msg');
    if (el) {
        el.textContent = text;
        el.style.display = 'block';
    } else {
        alert(text);
    }
}

/** 설문 현재 문항(index 0~7) 응답 완료 여부 */
function validateSurveyStep(index) {
    const qNum = index + 1;
    if (qNum >= 1 && qNum <= 7) {
        return !!document.querySelector(`input[name="survey-q${qNum}"]:checked`);
    }
    if (qNum === 8) {
        const inp = document.getElementById('survey-q8');
        const v = inp ? parseInt(String(inp.value || '').trim(), 10) : NaN;
        return !isNaN(v) && v >= 0 && v <= 100;
    }
    return true;
}

function getAiLiteracyAnswerValue(qNum) {
    const el = document.querySelector(`input[name="ai-literacy-q${qNum}"]:checked`);
    return el ? el.value : '';
}

function logAiLiteracyQuestionResponse(qNum) {
    const start = sessionState.aiLiteracyQuestionStartedAt;
    const end = Date.now();
    saveExperimentEvent({
        page_name: `ai_literacy_q${qNum}`,
        block_name: 'ai_literacy_survey',
        response_value: getAiLiteracyAnswerValue(qNum),
        time_spent: start != null ? Math.round(end - start) : null,
        start_time: start != null ? experimentSheetTimestamp(start) : null,
        end_time: experimentSheetTimestamp(end),
        is_correct: null,
    });
}

function setupAiLiteracySurvey() {
    const container = document.getElementById('ai-literacy-questions-container');
    if (!container) {
        console.error('ai-literacy-questions-container를 찾을 수 없습니다.');
        return;
    }
    container.innerHTML = '';
    currentAiLiteracyIndex = 0;

    const items = [
        { num: 1, text: '학습 상황에서 생성형 AI를 얼마나 자주 활용하나요?' },
        { num: 2, text: '생성형 AI를 얼마나 능숙하게 사용하나요?' },
        { num: 3, text: '생성형 AI가 자신의 학습에 도움이 된다고 생각하나요?' },
    ];

    items.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'post-survey-item';
        div.id = `ai-literacy-item-${item.num}`;
        div.style.display = 'none';
        let inner = `
            <div class="post-survey-instruction">다음 질문을 읽고, 해당하는 정도에 체크해주세요.</div>
            <div class="post-survey-question">${item.text}</div>
            <div class="scale-container">
                <div class="scale-labels">
                    <span class="scale-min">전혀 그렇지 않음</span>
                    <span class="scale-max">매우 그렇다</span>
                </div>
                <div class="scale-options">
        `;
        for (let i = 1; i <= 7; i++) {
            inner += `
                    <label class="scale-option">
                        <input type="radio" name="ai-literacy-q${item.num}" value="${i}">
                        <span>${i}</span>
                    </label>`;
        }
        inner += `
                </div>
            </div>`;
        div.innerHTML = inner;
        container.appendChild(div);
    });

    setTimeout(() => showAiLiteracyQuestion(0), 50);
}

function showAiLiteracyQuestion(index) {
    const total = 3;
    if (index < 0 || index >= total) return;

    for (let i = 1; i <= total; i++) {
        const el = document.getElementById(`ai-literacy-item-${i}`);
        if (el) el.style.display = 'none';
    }
    const current = document.getElementById(`ai-literacy-item-${index + 1}`);
    if (!current) return;

    current.style.display = 'block';
    currentAiLiteracyIndex = index;
    sessionState.aiLiteracyQuestionStartedAt = Date.now();

    const progressEl = document.getElementById('ai-literacy-progress');
    if (progressEl) progressEl.textContent = `질문 ${index + 1} / ${total}`;

    const nextBtn = document.getElementById('ai-literacy-next-btn');
    const submitBtn = document.getElementById('ai-literacy-submit-btn');
    if (index < total - 1) {
        if (nextBtn) {
            nextBtn.style.display = 'inline-block';
            nextBtn.disabled = false;
        }
        if (submitBtn) submitBtn.style.display = 'none';
    } else {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) {
            submitBtn.style.display = 'inline-block';
            submitBtn.disabled = false;
        }
    }

    const valEl = document.getElementById('ai-literacy-validation-msg');
    if (valEl) {
        valEl.textContent = '';
        valEl.style.display = 'none';
    }
}

function validateAiLiteracyStep(index) {
    const qNum = index + 1;
    return !!document.querySelector(`input[name="ai-literacy-q${qNum}"]:checked`);
}

// 사후질문 설정
function setupPostSurvey() {
    const container = document.getElementById('post-survey-questions-container');
    if (!container) {
        console.error('post-survey-questions-container를 찾을 수 없습니다.');
        return;
    }
    
    // 기존 내용 제거 및 초기화
    container.innerHTML = '';
    currentPostSurveyIndex = 0;
    
    // 사후질문 목록
    const postSurveyQuestions = [
        {
            number: 1,
            type: 'scale',
            instruction: '다음 질문을 읽고, 해당하는 정도에 체크해주세요. (답변에 관계없이 실험이 완료되면 보상이 지급되니, 솔직하게 응답해주세요.)',
            question: '본 실험에 참여하기 전, 박쥐에 대해 얼마나 알고 있었나요?',
            subtitle: '박쥐에 대한 사전지식이 얼마나 있었는지 7점 척도로 응답해주세요.',
            scale: {
                min: 1,
                max: 7,
                minLabel: '박쥐에 대한 사전지식이 전혀 없었음',
                maxLabel: '박쥐에 대해 잘 알고 있었음'
            }
        },
        {
            number: 2,
            type: 'number',
            instruction: '다음 질문을 읽고, 해당하는 정도에 체크해주세요. (답변에 관계없이 실험이 완료되면 보상이 지급되니, 솔직하게 응답해주세요.)',
            question: '만약 학습단계 없이 실험을 시작하자마자 바로 박쥐에 대한 시험을 봤다면, 몇 %의 문제를 맞혔을 거라고 생각하나요?',
            subtitle: '0~100 사이의 숫자를 입력해주세요.',
            min: 0,
            max: 100
        },
        {
            number: 3,
            type: 'text',
            instruction: '다음 질문을 읽고, 해당하는 정도에 체크해주세요. (답변에 관계없이 실험이 완료되면 보상이 지급되니, 솔직하게 응답해주세요.)',
            question: '본 연구 진행 중 발생한 문제가 있나요? (예. 네트워크 연결, 소음 등)',
            subtitle: '연구자가 알아야 할 내용이 있다면 자유롭게 적어주시고, 없으면 "없음" 이라고 적어주세요.',
            placeholder: '자유롭게 입력해주세요...'
        }
    ];
    
    // 모든 질문 생성 (숨김 처리)
    postSurveyQuestions.forEach((q) => {
        const questionItem = document.createElement('div');
        questionItem.className = 'post-survey-item';
        questionItem.id = `post-survey-item-${q.number}`;
        questionItem.style.display = 'none';

        let questionHtml = q.question;
        if (q.number === 1) {
            questionHtml = q.question.replace(
                '본 실험에 참여하기 전',
                '<span class="text-highlight-red">본 실험에 참여하기 전</span>'
            );
        } else if (q.number === 2) {
            questionHtml = q.question.replace(
                '학습단계 없이',
                '<span class="text-highlight-red">학습단계 없이</span>'
            );
        }

        let questionHTML = `
            <div class="post-survey-instruction">${q.instruction}</div>
            <div class="post-survey-question">${questionHtml}</div>
        `;
        
        if (q.subtitle) {
            questionHTML += `<div class="post-survey-subtitle">${q.subtitle}</div>`;
        }
        
        if (q.type === 'scale') {
            questionHTML += `
                <div class="scale-container">
                    <div class="scale-labels">
                        <span class="scale-min">${q.scale.minLabel}</span>
                        <span class="scale-max">${q.scale.maxLabel}</span>
                    </div>
                    <div class="scale-options">
            `;
            for (let i = q.scale.min; i <= q.scale.max; i++) {
                questionHTML += `
                    <label class="scale-option">
                        <input type="radio" name="post-survey-q${q.number}" value="${i}">
                        <span>${i}</span>
                    </label>
                `;
            }
            questionHTML += `
                    </div>
                </div>
            `;
        } else if (q.type === 'number') {
            questionHTML += `
                <div class="number-input-container">
                    <input type="text" inputmode="numeric" id="post-survey-q${q.number}" min="${q.min}" max="${q.max}" pattern="[0-9]*">
                    <span class="percent-sign">%</span>
                </div>
            `;
        } else if (q.type === 'radio') {
            questionHTML += `<div class="radio-options-container">`;
            q.options.forEach((option) => {
                questionHTML += `
                    <label class="radio-option-large">
                        <input type="radio" name="post-survey-q${q.number}" value="${option.value}">
                        <span>${option.label}</span>
                    </label>
                `;
            });
            questionHTML += `</div>`;
        } else if (q.type === 'text') {
            questionHTML += `
                <textarea id="post-survey-q${q.number}" rows="5" placeholder="${q.placeholder || '자유롭게 입력해주세요...'}"></textarea>
            `;
        }
        
        questionItem.innerHTML = questionHTML;
        container.appendChild(questionItem);
    });
    
    // 첫 번째 질문 표시 및 버튼 초기화
    setTimeout(() => {
        showPostSurveyQuestion(0);
        // 버튼 강제 표시 확인
        const nextBtn = document.getElementById('post-survey-next-btn');
        if (nextBtn) {
            nextBtn.style.display = 'inline-block';
            nextBtn.style.visibility = 'visible';
            nextBtn.style.opacity = '1';
            nextBtn.disabled = false;
        }
        
        // 숫자 입력 필드에 숫자만 입력되도록 제한
        const numberInput = document.getElementById('post-survey-q2');
        if (numberInput) {
            numberInput.addEventListener('input', (e) => {
                // 숫자가 아닌 문자 제거
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                // 0-100 범위 제한
                const num = parseInt(e.target.value);
                if (!isNaN(num)) {
                    if (num > 100) {
                        e.target.value = '100';
                    } else if (num < 0) {
                        e.target.value = '0';
                    }
                }
            });
            
            // 키보드 입력 제한 (숫자만)
            numberInput.addEventListener('keypress', (e) => {
                const char = String.fromCharCode(e.which);
                if (!/[0-9]/.test(char)) {
                    e.preventDefault();
                }
            });
        }
    }, 100);
}

// 특정 사후질문 표시
function showPostSurveyQuestion(index) {
    const container = document.getElementById('post-survey-questions-container');
    if (!container) return;
    
    const totalQuestions = 3;
    if (index < 0 || index >= totalQuestions) return;
    
    // 모든 질문 숨기기
    for (let i = 1; i <= totalQuestions; i++) {
        const item = document.getElementById(`post-survey-item-${i}`);
        if (item) {
            item.style.display = 'none';
        }
    }
    
    // 현재 질문 표시
    const currentItem = document.getElementById(`post-survey-item-${index + 1}`);
    if (currentItem) {
        currentItem.style.display = 'block';
        currentPostSurveyIndex = index;
        
        // 진행 상황 업데이트
        const progressEl = document.getElementById('post-survey-progress');
        if (progressEl) {
            progressEl.textContent = `질문 ${index + 1} / ${totalQuestions}`;
        }
        
        sessionState.postSurveyQuestionStartedAt = Date.now();
        
        // 네비게이션 버튼 업데이트
        const nextBtn = document.getElementById('post-survey-next-btn');
        const submitBtn = document.getElementById('post-survey-submit-btn');
        
        // 다음 버튼과 완료 버튼 처리
        if (index < totalQuestions - 1) {
            // 마지막 질문이 아닌 경우
            if (nextBtn) {
                nextBtn.style.display = 'inline-block';
                nextBtn.style.visibility = 'visible';
                nextBtn.style.opacity = '1';
                nextBtn.disabled = false;
            }
            if (submitBtn) {
                submitBtn.style.display = 'none';
            }
        } else {
            // 마지막 질문인 경우
            if (nextBtn) {
                nextBtn.style.display = 'none';
            }
            if (submitBtn) {
                submitBtn.style.display = 'inline-block';
                submitBtn.style.visibility = 'visible';
                submitBtn.style.opacity = '1';
                submitBtn.disabled = false;
            }
        }
    }
}

// 타이머 시작 (백그라운드에서도 정확히 작동하도록 실제 경과 시간 기반)
/** @param {HTMLElement|HTMLElement[]|null} displayElement 단일 표시 요소 또는 동일 시각을 표시할 요소 배열 */
function startTimer(timerId, duration, displayElement, onComplete) {
    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);
    const displays = Array.isArray(displayElement)
        ? displayElement.filter(Boolean)
        : displayElement
          ? [displayElement]
          : [];

    // 타이머 정보 저장
    if (!timers[timerId]) {
        timers[timerId] = {};
    }
    timers[timerId].endTime = endTime;
    timers[timerId].onComplete = onComplete;
    timers[timerId].displayElements = displays;

    function updateTimer() {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        const text = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        displays.forEach((el) => {
            if (el) el.textContent = text;
        });

        if (remaining <= 0) {
            clearInterval(timers[timerId].intervalId);
            delete timers[timerId].intervalId;
            if (onComplete) onComplete();
        }
    }

    // 초기 표시
    updateTimer();

    // 주기적으로 업데이트 (백그라운드에서도 정확한 시간 계산)
    timers[timerId].intervalId = setInterval(updateTimer, 100);
}

// 타이머 중지
function stopTimer(timerId) {
    if (timers[timerId]) {
        if (timers[timerId].intervalId) {
            clearInterval(timers[timerId].intervalId);
        }
        delete timers[timerId];
    }
}

// 지문 학습 단계
function startLearningStage() {
    showStage('learning');
    const timerDisplay = document.getElementById('learning-timer');
    const timerFloatDisplay = document.getElementById('learning-timer-float-display');

    experimentData.learning.startTime = experimentSheetTimestamp();

    startTimer('learning', 360, [timerDisplay, timerFloatDisplay].filter(Boolean), () => {
        // 시간이 지나면 자동으로 다음 단계로
        experimentData.learning.endTime = experimentSheetTimestamp();
        const start = new Date(experimentData.learning.startTime);
        const end = new Date(experimentData.learning.endTime);
        experimentData.learning.duration = (end - start) / 1000;
        saveExperimentEvent({
            page_name: 'learning',
            block_name: 'learning',
            response_value: 'timer_completed',
            time_spent: Math.round(end - start),
            start_time: experimentData.learning.startTime,
            end_time: experimentData.learning.endTime,
            is_correct: null,
        });
        startReviewStage();
    });
}

// 조건 2 복습 안내 두 번째 페이지 내용 (사실 문제 예시)
function setReviewInstructionCondition2Page2() {
    const content = document.getElementById('review-instruction-content');
    if (!content) return;
    content.innerHTML = `
        <p>다음은 문제의 예시입니다.</p>
        <div style="margin-top: 1.5em; padding: 1em; background: #f9f9f9; border-radius: 6px; border-left: 4px solid #3498db;">
            <p style="font-weight: bold; margin-bottom: 0.75em;">[예시 1 - 사실(개념) 문제]</p>
            <p style="font-weight: bold; margin-bottom: 0.5em;">Q. 큰 박쥐류와 작은 박쥐류는 서로 다른 방식으로 먹이의 위치를 특정합니다. 두 박쥐류는 각각 어떻게 먹이의 위치를 파악하나요?</p>
            <p style="margin-top: 1em;"><strong>답:</strong> 큰 박쥐류는 주로 시각에 의존하고, 작은 박쥐류는 반향정위를 이용한다.</p>
            <p style="margin-top: 0.75em;"><strong>해설:</strong> 지문에 따르면 큰 박쥐류는 시각을 통해 주변 환경을 파악하는 반면, 작은 박쥐류는 시각이 크게 발달하지 않았기 때문에 반향정위(echolocation)를 사용하여 먹이의 위치를 탐색한다. 반향정위는 초음파를 발사한 후 되돌아오는 메아리를 통해 물체의 위치를 파악하는 방식으로, 어두운 환경에서도 효과적으로 먹이를 찾을 수 있게 한다.</p>
        </div>
    `;
}

// 조건 2 복습 안내 세 번째 페이지 내용 (이해·추론 문제 예시)
function setReviewInstructionCondition2Page3() {
    const content = document.getElementById('review-instruction-content');
    if (!content) return;
    content.innerHTML = `
        <div style="margin-top: 0.5em; padding: 1em; background: #f9f9f9; border-radius: 6px; border-left: 4px solid #3498db;">
            <p style="font-weight: bold; margin-bottom: 0.75em;">[예시 2 - 이해(추론) 문제]</p>
            <p style="font-weight: bold; margin-bottom: 0.5em;">Q. 박쥐는 낮보다 밤에 다른 동물로부터 공격을 더 많이 받습니다. 그 이유는 무엇일까요?</p>
            <p style="margin-top: 1em;"><strong>답:</strong> 박쥐는 밤에 주로 활동하기 때문이다.</p>
            <p style="margin-top: 0.75em;"><strong>해설:</strong> 지문에 따르면 박쥐는 낮에는 동굴이나 나무 속에서 거꾸로 매달린 채 휴식을 취한다. 이때 높은 곳에 숨어 있기 때문에 천적으로부터 발견되기 어렵다. 반면 밤에는 먹이를 찾기 위해 활발히 이동하며 활동하기 때문에 외부에 노출되는 시간이 길어지고, 그 결과 다른 동물의 공격을 받을 가능성이 높아진다. 따라서 박쥐는 활동이 많은 밤에 더 자주 공격을 받는다.</p>
        </div>
    `;
}

// 조건 2 복습 안내 네 번째 페이지 내용
function setReviewInstructionCondition2Page4() {
    const content = document.getElementById('review-instruction-content');
    if (!content) return;
    content.innerHTML = `
        <p>시간 제한은 없으며, 만드는 문제의 개수도 제한이 없습니다.</p>
        <p style="margin-top: 1em;">시험을 볼 준비가 되었다고 판단했을 때 '다음' 버튼을 눌러 다음 단계로 이동해주세요.</p>
        <p style="margin-top: 1em;">준비되었으면 '다음' 버튼을 눌러주세요.</p>
    `;
}

// 조건 4 복습 안내 두 번째 페이지 내용 (AI 챗봇 안내)
function setReviewInstructionCondition4Page2() {
    const content = document.getElementById('review-instruction-content');
    if (!content) return;
    content.innerHTML = `
        <p>단, 이번에는 'AI 챗봇'을 사용하며 지문을 학습할 수 있습니다.</p>
        <p>AI 챗봇은 지문에 관련된 답을 하도록 설정되어 있으며, 원하는 방식대로 자유롭게 사용할 수 있습니다.</p>
        <p>다만, 실험 페이지 내부가 아닌 외부의 다른 AI를 사용하는 것은 삼가주세요.</p>
    `;
}

// 조건 3 복습 안내 두 번째 페이지 내용
function setReviewInstructionCondition3Page2() {
    const content = document.getElementById('review-instruction-content');
    if (!content) return;
    content.innerHTML = `
        <p>시간 제한은 없으나, 1분이 지나고 '다음' 버튼이 활성화됩니다.</p>
        <p>시험을 볼 준비가 되었다고 판단했을 때 '다음' 버튼을 눌러 다음 단계로 이동해주세요.</p>
        <p style="margin-top: 1em;"><strong>준비되었으면 '다음'을 눌러주세요.</strong></p>
    `;
}

// 복습 단계
function startReviewStage() {
    if (experimentData.condition) {
        setupReviewInstruction();
        showStage('review-instruction');
        const reviewNextBtn = document.getElementById('review-instruction-next-btn');
        if (reviewNextBtn) reviewNextBtn.disabled = false;
        // 조건 1(지문 재학습): '다음' 버튼은 1분 후 활성화
        if (experimentData.condition === 1) {
            if (reviewNextBtn) {
                reviewNextBtn.disabled = true;
                setTimeout(() => {
                    reviewNextBtn.disabled = false;
                }, 60000);
            }
        }
    } else {
        // 설계자 모드에서 조건이 없을 때는 바로 복습 화면으로
        showStage('review');
        setupReviewStage();
    }
    // 복습 타이머 제거 - 시간 제한 없음
}

// 방해과제 문제 리스트
const distractorProblems = [
    "36-13", "14+47", "41-18", "15+32", "32-28", "12+17", "37-26", "27-12", "28+67", "45-18",
    "36-18", "51-32", "77+15", "43-19", "35-24", "42+38", "59+26", "52-12", "37-25", "64+28",
    "32-18", "52-33", "43-17", "32+57", "37-24", "28+53", "17+48", "26-18", "54-28", "29+63",
    "17+36", "15+42", "64-13", "20+44", "37-25", "15+57", "24+77", "62-15", "34-21", "29+65",
    "78-16", "53+37", "38+47", "45-22", "57-33", "11+45", "27+60", "29+54", "42-33", "28+51",
    "37+54", "55+23", "25+33", "36-27", "38-32", "28+44", "12+36", "54-27", "13+67", "51+48",
    "38-19", "67-28", "81+15", "96-25", "33+21", "47+14", "16+42", "32-15", "13+37", "19+11",
    "20+24", "12+38", "64-22", "79-15", "59-24", "54+14", "62-28", "34-25", "58-33", "16+27",
    "93-58", "43-21", "28+34", "57-29", "98-42", "12+63", "34-21", "49-17", "77+14", "31+24",
    "93-87", "70-26", "47-34", "24+57", "81-14", "21+69", "14+28", "84-17"
];

let currentDistractorProblemIndex = 0;
let distractorTimerActive = false;
let currentDistractorProblem = null;

// 방해과제 설정 (외부 호출용)
function setupDistractorTask() {
    showStage('distractor');
}

// 방해과제 내부 설정 (실제 초기화)
function setupDistractorTaskInternal() {
    // 데이터 초기화
    experimentData.distractor.startTime = experimentSheetTimestamp();
    experimentData.distractor.correctCount = 0;
    experimentData.distractor.wrongCount = 0;
    experimentData.distractor.totalCount = 0;
    experimentData.distractor.problems = [];
    currentDistractorProblemIndex = 0;
    distractorTimerActive = true;
    currentDistractorProblem = null;
    
    // DOM 요소 가져오기 (화면이 활성화된 후)
    const distractorScreen = document.getElementById('distractor-screen');
    if (!distractorScreen || !distractorScreen.classList.contains('active')) {
        console.log('방해과제 화면이 아직 활성화되지 않았습니다. 재시도합니다...');
        setTimeout(() => setupDistractorTaskInternal(), 100);
        return;
    }
    
    const problemTextEl = distractorScreen.querySelector('.problem-text');
    const answerInput = distractorScreen.querySelector('#distractor-answer');
    const timerDisplay = distractorScreen.querySelector('#distractor-timer');
    
    if (!problemTextEl) {
        console.error('문제 텍스트 요소를 찾을 수 없습니다. 선택자: .problem-text');
        console.log('distractor-problem 요소:', distractorScreen.querySelector('#distractor-problem'));
    }
    if (!answerInput) {
        console.error('답변 입력 요소를 찾을 수 없습니다. 선택자: #distractor-answer');
    }
    if (!timerDisplay) {
        console.error('타이머 요소를 찾을 수 없습니다. 선택자: #distractor-timer');
    }
    
    if (!problemTextEl || !answerInput || !timerDisplay) {
        console.error('방해과제 요소를 찾을 수 없습니다. 재시도합니다...');
        setTimeout(() => setupDistractorTaskInternal(), 100);
        return;
    }
    
    // 입력창 초기화
    answerInput.disabled = false;
    answerInput.value = '';
    
    // 기존 이벤트 리스너 제거 후 새로 설정
    const newInput = answerInput.cloneNode(true);
    answerInput.parentNode.replaceChild(newInput, answerInput);
    const freshInput = document.getElementById('distractor-answer');
    
    // 입력창 이벤트 리스너 설정
    freshInput.addEventListener('keypress', (e) => {
        if (!distractorTimerActive) {
            e.preventDefault();
            return;
        }
        
        // 엔터 키로 답변 제출
        if (e.key === 'Enter') {
            e.preventDefault();
            submitDistractorAnswer();
        }
        // 숫자가 아닌 키는 차단
        else if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    // 숫자만 입력 가능하도록
    freshInput.addEventListener('input', (e) => {
        if (distractorTimerActive) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        }
    });
    
    // 첫 번째 문제 표시
    showNextDistractorProblem();
    
    // 타이머 시작 (2분 = 120초)
    startTimer('distractor', 180, timerDisplay, () => {
        // 시간 종료 처리
        distractorTimerActive = false;
        freshInput.disabled = true;
        
        // 데이터 저장
        experimentData.distractor.endTime = experimentSheetTimestamp();
        const start = new Date(experimentData.distractor.startTime);
        const end = new Date(experimentData.distractor.endTime);
        experimentData.distractor.duration = (end - start) / 1000;
        experimentData.distractor.wrongCount = Math.max(
            0,
            experimentData.distractor.totalCount - experimentData.distractor.correctCount
        );
        
        // 다음 단계로 자동 이동 (지시문 단계)
        setTimeout(() => {
            showStage('ai-literacy-survey');
        }, 500);
    });
}

// 다음 방해과제 문제 표시
function showNextDistractorProblem() {
    if (!distractorTimerActive || currentDistractorProblemIndex >= distractorProblems.length) {
        return;
    }
    
    const problemStr = distractorProblems[currentDistractorProblemIndex];
    const match = problemStr.match(/(\d+)([+-])(\d+)/);
    
    if (!match) {
        currentDistractorProblemIndex++;
        if (currentDistractorProblemIndex < distractorProblems.length && distractorTimerActive) {
            showNextDistractorProblem();
        }
        return;
    }
    
    const num1 = parseInt(match[1]);
    const operation = match[2];
    const num2 = parseInt(match[3]);
    const answer = operation === '+' ? num1 + num2 : num1 - num2;
    
    // 현재 문제 정보 저장
    currentDistractorProblem = {
        num1,
        num2,
        operation: operation,
        answer: answer,
        userAnswer: null,
        correct: false,
        timestamp: experimentSheetTimestamp(),
        problemString: problemStr
    };
    sessionState.distractorProblemShownAt = Date.now();
    
    // 문제 표시
    const distractorScreen = document.getElementById('distractor-screen');
    const problemTextEl = distractorScreen ? distractorScreen.querySelector('.problem-text') : null;
    
    if (problemTextEl) {
        problemTextEl.textContent = `${num1} ${operation} ${num2}`;
        console.log('문제 표시 완료:', `${num1} ${operation} ${num2}`);
    } else {
        console.error('문제 텍스트 요소를 찾을 수 없습니다.');
        const problemBox = distractorScreen ? distractorScreen.querySelector('#distractor-problem') : null;
        if (problemBox) {
            console.log('distractor-problem 요소는 존재합니다:', problemBox);
            const textEl = problemBox.querySelector('.problem-text');
            if (textEl) {
                textEl.textContent = `${num1} ${operation} ${num2}`;
                console.log('대체 방법으로 문제 표시 완료');
            }
        } else {
            console.error('distractor-problem 요소 자체를 찾을 수 없습니다.');
        }
    }
    
    // 입력창 설정
    const answerInput = document.getElementById('distractor-answer');
    if (answerInput) {
        answerInput.value = '';
        answerInput.disabled = !distractorTimerActive;
        if (distractorTimerActive) {
            answerInput.focus();
        }
    }
}

// 방해과제 답변 제출 처리
function submitDistractorAnswer() {
    if (!distractorTimerActive || !currentDistractorProblem) {
        return;
    }
    
    const answerInput = document.getElementById('distractor-answer');
    if (!answerInput) {
        return;
    }
    
    const userAnswer = parseInt(answerInput.value);
    if (isNaN(userAnswer)) {
        return;
    }
    
    // 답변 저장
    currentDistractorProblem.userAnswer = userAnswer;
    currentDistractorProblem.correct = userAnswer === currentDistractorProblem.answer;
    
    if (currentDistractorProblem.correct) {
        experimentData.distractor.correctCount++;
    } else {
        experimentData.distractor.wrongCount++;
    }
    experimentData.distractor.totalCount++;
    experimentData.distractor.problems.push({...currentDistractorProblem});
    
    const dStart = sessionState.distractorProblemShownAt;
    const dNow = Date.now();
    saveExperimentEvent({
        page_name: `distractor_trial_${experimentData.distractor.totalCount}`,
        block_name: 'distractor',
        response_value: String(userAnswer),
        correct_answer: String(currentDistractorProblem.answer),
        is_correct: !!currentDistractorProblem.correct,
        time_spent: dStart != null ? Math.round(dNow - dStart) : null,
        start_time: dStart != null ? experimentSheetTimestamp(dStart) : null,
        end_time: experimentSheetTimestamp(dNow),
        extra: { problemString: currentDistractorProblem.problemString },
    });
    
    // 다음 문제로 이동
    currentDistractorProblemIndex++;
    if (currentDistractorProblemIndex < distractorProblems.length && distractorTimerActive) {
        showNextDistractorProblem();
    }
}

// AI 챗봇(Worker 전용): POST { sessionId, message } — 백엔드에서 OpenAI conversation 유지
const CHAT_ERROR_USER_MESSAGE = 'AI가 응답하지 않습니다.';

function extractWorkerChatReply(data) {
    if (!data || typeof data !== 'object') return '';
    if (typeof data.reply !== 'string') return '';
    const reply = data.reply.trim();
    return reply || '';
}

let __markedChatOptionsApplied = false;

function configureMarkedForChat() {
    if (__markedChatOptionsApplied || typeof marked === 'undefined') return;
    try {
        if (typeof marked.use === 'function') {
            marked.use({
                breaks: true,
                gfm: true,
                headerIds: false,
                mangle: false,
            });
        } else if (typeof marked.setOptions === 'function') {
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: false,
                mangle: false,
            });
        }
    } catch (e) {
        /* ignore */
    }
    __markedChatOptionsApplied = true;
}

/**
 * 어시스턴트 말풍선(.chat-message.ai) 내부에 본문만 채움.
 * @param {HTMLElement} wrapEl
 * @param {string} text
 * @param {{ markdown?: boolean }} [opts] markdown: false → 순수 텍스트 + 줄바꿈 유지
 */
function setAssistantMessageBody(wrapEl, text, opts) {
    const useMarkdown = !opts || opts.markdown !== false;
    wrapEl.textContent = '';
    const body = document.createElement('div');
    body.className = 'chat-message-body';
    const raw = String(text ?? '');
    if (!useMarkdown || typeof DOMPurify === 'undefined' || typeof marked === 'undefined') {
        body.classList.add('chat-message-body--plain');
        body.textContent = raw;
        wrapEl.appendChild(body);
        return;
    }
    configureMarkedForChat();
    try {
        if (typeof marked.parse !== 'function') {
            body.classList.add('chat-message-body--plain');
            body.textContent = raw;
            wrapEl.appendChild(body);
            return;
        }
        const dirty = marked.parse(raw);
        if (typeof dirty === 'string' && dirty.length) {
            body.classList.add('chat-message-body--markdown');
            body.innerHTML = DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
        } else {
            body.classList.add('chat-message-body--plain');
            body.textContent = raw;
        }
    } catch (e) {
        body.classList.add('chat-message-body--plain');
        body.textContent = raw;
    }
    wrapEl.appendChild(body);
}

async function sendChatMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    
    // 사용자 메시지 표시
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.textContent = message;
    chatMessages.appendChild(userMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    saveChatLog('user', message, currentStage);
    
    // 입력 필드와 버튼 비활성화
    if (chatInput) {
        chatInput.disabled = true;
    }
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = '전송 중...';
    }
    
    // 로딩 메시지 표시
    const chatRequestStartAt = Date.now();
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'chat-message ai';
    loadingMsg.id = 'loading-message';
    setAssistantMessageBody(loadingMsg, '답변을 생성하는 중...', { markdown: false });
    chatMessages.appendChild(loadingMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        const dwellTimeMs =
            sessionState.lastStageEnterAt != null ? Math.round(Date.now() - sessionState.lastStageEnterAt) : 0;
        const openAiMessages = buildWorkerOpenAiMessagesLast30();
        const sheetRows = buildUnsyncedSheetRowsForWorker();
        const { data, aiResponse, endpoint } = await requestChatToWorker(
            message,
            dwellTimeMs,
            openAiMessages,
            sheetRows
        );

        console.log('[chat debug]', {
            endpoint: endpoint || getChatEndpointLabel(),
            session_id: sessionState.sessionId,
            reply_preview: typeof aiResponse === 'string' ? aiResponse.slice(0, 80) : ''
        });
        
        // 로딩 메시지 제거
        const loadingEl = document.getElementById('loading-message');
        if (loadingEl) {
            loadingEl.remove();
        }
        
        // AI 응답 표시
        const aiMsg = document.createElement('div');
        aiMsg.className = 'chat-message ai';
        setAssistantMessageBody(aiMsg, aiResponse, { markdown: true });
        chatMessages.appendChild(aiMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        saveChatLog('assistant', aiResponse, currentStage, {
            dwell_time_ms: Date.now() - chatRequestStartAt
        });
        sessionState.lastSyncedChatLogOrder = sessionState.chatMessageOrder;

        // 채팅 메시지 저장
        experimentData.review.chatMessages.push({
            user: message,
            ai: aiResponse,
            timestamp: experimentSheetTimestamp()
        });
    } catch (error) {
        // OpenAI 응답 실패 시 고정 메시지 표시
        const loadingEl = document.getElementById('loading-message');
        if (loadingEl) {
            loadingEl.remove();
        }
        console.warn('[chat] request failed', {
            endpoint: getChatEndpointLabel(),
            reason: error && error.message ? error.message : String(error)
        });
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'chat-message ai';
        setAssistantMessageBody(errorMsg, CHAT_ERROR_USER_MESSAGE, { markdown: false });
        chatMessages.appendChild(errorMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        saveChatLog('assistant', CHAT_ERROR_USER_MESSAGE, currentStage, {
            dwell_time_ms: Date.now() - chatRequestStartAt,
            additional_metadata: {
                error_type: 'chat_request_failed'
            }
        });
        
        experimentData.review.chatMessages.push({
            user: message,
            ai: CHAT_ERROR_USER_MESSAGE,
            timestamp: experimentSheetTimestamp()
        });
    } finally {
        // 입력 필드와 버튼 다시 활성화
        if (chatInput) {
            chatInput.disabled = false;
            chatInput.focus();
        }
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.textContent = '전송';
        }
    }
}

// 데이터 다운로드
function downloadData() {
    // 최종 시간 기록
    experimentData.finalTest.endTime = experimentSheetTimestamp();
    if (experimentData.finalTest.startTime) {
        const start = new Date(experimentData.finalTest.startTime);
        const end = new Date(experimentData.finalTest.endTime);
        experimentData.finalTest.duration = (end - start) / 1000;
    }

    // xlsx 라이브러리 확인
    if (typeof XLSX === 'undefined') {
        alert('엑셀 생성 라이브러리를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    // 워크북 생성
    const wb = XLSX.utils.book_new();

    // 메타 정보
    const dMeta = experimentData.distractor;
    const metaRows = [
        {
            participant_id: experimentData.participantId,
            session_id: sessionState.sessionId,
            condition: getConditionLabel(),
            condition_number: experimentData.condition,
            interaction_click_count: experimentData.clickCount ?? 0,
            distractor_math_correct: dMeta?.correctCount ?? 0,
            distractor_math_wrong: Math.max(0, (dMeta?.totalCount ?? 0) - (dMeta?.correctCount ?? 0)),
            distractor_math_trials: dMeta?.totalCount ?? 0,
            exported_at: experimentSheetTimestamp(),
        },
    ];
    const wsMeta = XLSX.utils.json_to_sheet(metaRows);
    XLSX.utils.book_append_sheet(wb, wsMeta, 'meta');

    // 챗봇 로그
    const chatRows = collectedChatLogs.map((l) => ({
        participant_id: l.participant_id,
        session_id: l.session_id,
        condition: l.condition,
        timestamp: l.timestamp,
        role: l.role,
        message_text: l.message_text,
        message_order: l.message_order,
        task_stage: l.task_stage,
    }));
    const wsChat = XLSX.utils.json_to_sheet(chatRows);
    XLSX.utils.book_append_sheet(wb, wsChat, 'chat_logs');

    // 실험 이벤트
    const eventRows = collectedExperimentRows.map((r) => ({
        participant_id: r.participant_id,
        session_id: r.session_id,
        condition: r.condition,
        condition_number: r.condition_number,
        trial_number: r.trial_number,
        page_name: r.page_name,
        block_name: r.block_name,
        response_value: r.response_value,
        response_time: r.response_time,
        start_time: r.start_time,
        end_time: r.end_time,
        time_spent: r.time_spent,
        dwell_time_seconds: r.dwell_time_seconds,
        interaction_click_count: r.interaction_click_count,
        correct_answer: r.correct_answer,
        is_correct: r.is_correct,
        score: r.score,
        timestamp: r.timestamp,
        extra: r.extra != null ? JSON.stringify(r.extra) : '',
    }));
    const wsEvents = XLSX.utils.json_to_sheet(eventRows);
    XLSX.utils.book_append_sheet(wb, wsEvents, 'experiment_data');

    // 파일 저장 (로컬에 엑셀로 다운로드)
    const fileName = `experiment_${experimentData.participantId}_${sessionState.sessionId}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// 데이터 업로드
function uploadData() {
    const input = document.getElementById('upload-input');
    input.click();
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    console.log('업로드된 데이터:', data);
                    alert('데이터가 성공적으로 업로드되었습니다.');
                } catch (error) {
                    alert('데이터 파일을 읽는 중 오류가 발생했습니다.');
                }
            };
            reader.readAsText(file);
        }
    };
}

// 개발자 모드 (단축키: Ctrl+Shift+D 또는 우측 하단 버튼)
let designerMode = false;
let designerCondition = null; // 개발자 모드에서 선택한 조건

function toggleDesignerMode() {
    designerMode = !designerMode;
    const nav = document.getElementById('designer-nav');
    const body = document.body;
    
    if (designerMode) {
        nav.classList.add('show');
        body.classList.add('designer-mode');
        updateDesignerInfo();
        updateActiveNavButton();
        syncDevPageSelect();
        // 현재 실험 조건을 드롭다운에 설정
        if (experimentData.condition) {
            const sel = document.getElementById('condition-select');
            if (sel) sel.value = experimentData.condition;
        }
    } else {
        nav.classList.remove('show');
        body.classList.remove('designer-mode');
    }
}

// 개발자 모드에서 페이지 단위 이동 (모든 화면 지원)
function developerModeGoToStage(stage) {
    if (!designerMode) return;
    Object.keys(timers).forEach(key => stopTimer(key));
    
    if (stage === 'experiment-start') {
        showStage('experiment-start');
    } else if (stage === 'jol1') {
        showStage('jol1');
    } else if (stage === 'introduction') {
        showStage('introduction');
    } else if (stage === 'learning') {
        startLearningStage();
    } else if (stage === 'review-instruction') {
        if (!experimentData.condition) experimentData.condition = 1;
        setupReviewInstruction();
        showStage('review-instruction');
    } else if (stage === 'review') {
        if (!experimentData.condition) experimentData.condition = 2;
        experimentData.review.questionStage = 'question';
        showStage('review');
        setupReviewStage();
    } else if (stage === 'survey-instruction') {
        showStage('survey-instruction');
    } else if (stage === 'survey') {
        showStage('survey');
        experimentData.survey.startTime = experimentSheetTimestamp();
        setTimeout(() => setupSurvey(), 100);
    } else if (stage === 'math-preintro') {
        showStage('math-preintro');
    } else if (stage === 'distractor-instruction') {
        showStage('distractor-instruction');
    } else if (stage === 'distractor') {
        setupDistractorTask();
    } else if (stage === 'ai-literacy-survey') {
        showStage('ai-literacy-survey');
    } else if (stage === 'final-test-instruction') {
        showStage('final-test-instruction');
    } else if (stage === 'final-test') {
        showStage('final-test');
        experimentData.finalTest.startTime = experimentSheetTimestamp();
        setTimeout(() => setupFinalTest(), 100);
    } else if (stage === 'post-survey-intro') {
        showStage('post-survey-intro');
    } else if (stage === 'post-survey') {
        showStage('post-survey');
        experimentData.postSurvey.startTime = experimentSheetTimestamp();
        setTimeout(() => setupPostSurvey(), 100);
    } else if (stage === 'demographics') {
        showStage('demographics');
    } else if (stage === 'gifticon') {
        showStage('gifticon');
    } else if (stage === 'termination') {
        showStage('termination');
    } else if (stage === 'completion') {
        showStage('completion');
    }
    
    updateActiveNavButton();
    updateDesignerInfo();
    syncDevPageSelect();
}

function syncDevPageSelect() {
    const sel = document.getElementById('dev-page-select');
    if (sel && currentStage) {
        sel.value = currentStage;
    }
}

function updateDesignerInfo() {
    const currentCondition = designerCondition || experimentData.condition;
    const conditionNames = {
        1: '조건 1: 지문으로 재학습',
        2: '조건 2: 지문으로 질문생성',
        3: '조건 3: 지문+AI로 재학습',
        4: '조건 4: 지문+AI로 질문생성'
    };
    document.getElementById('current-condition').textContent = 
        currentCondition ? conditionNames[currentCondition] : '-';
    document.getElementById('current-stage').textContent = currentStage || '-';
}

function updateActiveNavButton() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const stageToBtnId = {
        'experiment-start': 'nav-experiment-start',
        'introduction': 'nav-introduction',
        'learning': 'nav-learning',
        'jol1': 'nav-jol1',
        'review-instruction': 'nav-review-instruction',
        'review': 'nav-review-question',
        'survey-instruction': 'nav-survey',
        'survey': 'nav-survey',
        'math-preintro': 'nav-math-preintro',
        'distractor-instruction': 'nav-distractor-instruction',
        'distractor': 'nav-distractor',
        'ai-literacy-survey': 'nav-ai-literacy',
        'final-test-instruction': 'nav-instruction',
        'final-test': 'nav-final',
        'post-survey-intro': 'nav-post-survey-intro',
        'post-survey': 'nav-post-survey',
        'demographics': 'nav-demographics',
        'gifticon': 'nav-gifticon',
        'termination': 'nav-termination',
        'completion': 'nav-completion'
    };
    
    let activeId = stageToBtnId[currentStage];
    if (currentStage === 'review' && experimentData.review && experimentData.review.questionStage === 'answer') {
        activeId = 'nav-review-answer';
    } else if (currentStage === 'review') {
        activeId = 'nav-review-question';
    }
    const activeBtn = activeId ? document.getElementById(activeId) : null;
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    const sel = document.getElementById('dev-page-select');
    if (sel && currentStage) {
        sel.value = currentStage;
    }
}

function applyDesignerCondition() {
    const selectedValue = parseInt(document.getElementById('condition-select').value);
    
    if (selectedValue) {
        designerCondition = selectedValue;
        experimentData.condition = selectedValue;
        updateDesignerInfo();
        
        // 복습 화면이 현재 활성화되어 있다면 조건에 맞게 업데이트
        if (currentStage === 'review') {
            setupReviewStage();
        }
    }
}

// 개발자 모드 네비게이션 이벤트 리스너 (페이지 단위 전체 이동)
function setupDesignerNavigation() {
    const navButtons = {
        'nav-experiment-start': 'experiment-start',
        'nav-introduction': 'introduction',
        'nav-learning': 'learning',
        'nav-jol1': 'jol1',
        'nav-review-instruction': 'review-instruction',
        'nav-survey': 'survey',
        'nav-math-preintro': 'math-preintro',
        'nav-distractor-instruction': 'distractor-instruction',
        'nav-distractor': 'distractor',
        'nav-ai-literacy': 'ai-literacy-survey',
        'nav-instruction': 'final-test-instruction',
        'nav-final': 'final-test',
        'nav-post-survey-intro': 'post-survey-intro',
        'nav-post-survey': 'post-survey',
        'nav-demographics': 'demographics',
        'nav-gifticon': 'gifticon',
        'nav-termination': 'termination',
        'nav-completion': 'completion'
    };
    
    Object.entries(navButtons).forEach(([btnId, stage]) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', function() {
                if (designerMode) {
                    developerModeGoToStage(stage);
                }
            });
        }
    });
    
    // 페이지 선택 드롭다운: 이동 버튼 및 변경 시 바로 이동
    const gotoPageBtn = document.getElementById('dev-goto-page-btn');
    const pageSelect = document.getElementById('dev-page-select');
    if (gotoPageBtn && pageSelect) {
        gotoPageBtn.addEventListener('click', function() {
            if (designerMode) {
                developerModeGoToStage(pageSelect.value);
            }
        });
        pageSelect.addEventListener('change', function() {
            if (designerMode) {
                developerModeGoToStage(pageSelect.value);
            }
        });
    }
    
    // 개발자 모드 토글 버튼 (항상 표시)
    const toggleBtn = document.getElementById('dev-mode-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            toggleDesignerMode();
        });
    }
    
    // 복습: 질문 만들기 버튼
    const navReviewQuestion = document.getElementById('nav-review-question');
    if (navReviewQuestion) {
        navReviewQuestion.addEventListener('click', function() {
            if (designerMode) {
                Object.keys(timers).forEach(key => stopTimer(key));
                if (!experimentData.condition) experimentData.condition = 2;
                experimentData.review.questionStage = 'question';
                showStage('review');
                setupReviewStage();
                updateActiveNavButton();
                updateDesignerInfo();
                syncDevPageSelect();
            }
        });
    }
    
    // 복습: 답 써보기 버튼
    const navReviewAnswer = document.getElementById('nav-review-answer');
    if (navReviewAnswer) {
        navReviewAnswer.addEventListener('click', function() {
            if (designerMode) {
                Object.keys(timers).forEach(key => stopTimer(key));
                if (!experimentData.condition) experimentData.condition = 2;
                const questionInputs = document.querySelectorAll('#questions-container .question-input');
                const questions = [];
                questionInputs.forEach((input, index) => {
                    const questionText = input.value.trim();
                    if (questionText) {
                        questions.push({ number: index + 1, question: questionText });
                    }
                });
                if (questions.length === 0) {
                    alert('먼저 질문 만들기 단계에서 질문을 입력해주세요.');
                    return;
                }
                experimentData.review.questions = questions;
                experimentData.review.questionStage = 'answer';
                showStage('review');
                setupReviewStage();
                switchToAnswerWriting();
                updateActiveNavButton();
                updateDesignerInfo();
                syncDevPageSelect();
            }
        });
    }
}

// 복습 안내 내용 설정 (조건에 따라)
function setupReviewInstruction() {
    const condition = experimentData.condition;
    const content = document.getElementById('review-instruction-content');
    if (!content) return;
    // 조건 2, 3, 4는 여러 페이지 구성이므로 진입 시 항상 1페이지부터
    if (condition === 2 || condition === 3 || condition === 4) reviewInstructionStep = 1;
    else reviewInstructionStep = 0;
    
    if (condition === 1) {
        // 조건 1: 지문 재학습
        content.innerHTML = `
            <p>첫 번째 학습을 마쳤습니다.</p>
            <p>지금부터는 앞에서 공부했던 지문을 동일한 방식으로 다시 학습합니다.</p>
            <p style="margin-top: 1em;">시간 제한은 없으나, 1분이 지나고 '다음' 버튼이 활성화됩니다.</p>
            <p>시험을 볼 준비가 되었다고 판단했을 때 '다음' 버튼을 눌러 다음 단계로 이동해주세요.</p>
            <p style="margin-top: 1em;"><strong>준비되었으면 '다음'을 눌러주세요.</strong></p>
        `;
    } else if (condition === 2) {
        // 조건 2: 지문+질문생성 (첫 페이지)
        content.innerHTML = `
            <p>첫 번째 학습을 마쳤습니다.</p>
            <p>지금부터는 앞에서 공부했던 지문을 다시 학습합니다.</p>
            <p>이 때, 다가올 최종 시험에 나올 만한 예상 시험 문제를 만들면서 공부하세요.</p>
            <p style="margin-top: 1em;">문제는 다음과 같이 구성해야 합니다:</p>
            <ul style="margin: 0.5em 0 0 1.25em; line-height: 1.6;">
                <li>지문의 내용을 그대로 확인하는 사실 문제 3문제 이상</li>
                <li>지문에 나온 개념을 활용하여 추론해야 하는 이해 문제 3문제 이상</li>
            </ul>
            <p style="margin-top: 1em;">각 문제에 대해 반드시 다음을 함께 작성하세요:</p>
            <ol style="margin: 0.5em 0 0 1.25em; line-height: 1.6;">
                <li>문제</li>
                <li>답 (간단하게 핵심만)</li>
                <li>해설 (답의 근거를 지문을 바탕으로 충분히 설명)</li>
            </ol>
            <p style="margin-top: 1em;">문제는 객관식 또는 주관식 등 다양한 형태로 자유롭게 만들 수 있습니다.</p>
        `;
    } else if (condition === 3) {
        // 조건 3: AI 재학습 (첫 페이지 – 다음 버튼 바로 활성화)
        content.innerHTML = `
            <p>첫 번째 학습을 마쳤습니다.</p>
            <p>지금부터는 앞에서 공부했던 지문을 다시 학습합니다.</p>
            <p style="margin-top: 1em;">단, 이번에는 'AI 챗봇'을 사용하며 지문을 학습할 수 있습니다.</p>
            <p>AI 챗봇은 지문에 관련된 답을 하도록 설정되어 있으며, 원하는 방식대로 자유롭게 사용할 수 있습니다.</p>
            <p>다만, 실험 페이지 내부가 아닌 외부의 다른 AI를 사용하는 것은 삼가주세요.</p>
        `;
    } else if (condition === 4) {
        // 조건 4: AI+질문생성 (첫 페이지 – 조건 2와 동일한 지시문)
        content.innerHTML = `
            <p>첫 번째 학습을 마쳤습니다.</p>
            <p>지금부터는 앞에서 공부했던 지문을 다시 학습합니다.</p>
            <p>이 때, 다가올 최종 시험에 나올 만한 예상 시험 문제를 만들면서 공부하세요.</p>
            <p style="margin-top: 1em;">문제는 다음과 같이 구성해야 합니다:</p>
            <ul style="margin: 0.5em 0 0 1.25em; line-height: 1.6;">
                <li>지문의 내용을 그대로 확인하는 사실 문제 3문제 이상</li>
                <li>지문에 나온 개념을 활용하여 추론해야 하는 이해 문제 3문제 이상</li>
            </ul>
            <p style="margin-top: 1em;">각 문제에 대해 반드시 다음을 함께 작성하세요:</p>
            <ol style="margin: 0.5em 0 0 1.25em; line-height: 1.6;">
                <li>문제</li>
                <li>답 (간단하게 핵심만)</li>
                <li>해설 (답의 근거를 지문을 바탕으로 충분히 설명)</li>
            </ol>
            <p style="margin-top: 1em;">문제는 객관식 또는 주관식 등 다양한 형태로 자유롭게 만들 수 있습니다.</p>
        `;
    }
}

// 실험 시작 버튼 클릭 처리 (참가자 번호 입력 후 도입으로 이동)
function onExperimentStartClick() {
    const input = document.getElementById('participant-id-input');
    const participantId = input ? input.value.trim() : '';
    if (!participantId) {
        alert('참가자 번호를 입력해 주세요.');
        if (input) input.focus();
        return;
    }
    experimentData.participantId = participantId;
    experimentData.clickCount = 0;
    sessionState.lastSyncedChatLogOrder = 0;
    // 참가자 시작 시 챗봇 세션을 새로 부여하고, 실험 중에는 같은 세션으로 맥락 유지
    setChatApiSessionForCurrentParticipant(participantId);
    assignCondition();
    showStage('introduction');
}

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    bindExperimentClickCounterOnce();
    initSessionId();
    getOrCreateChatApiSessionId();
    sessionState.lastStageEnterAt = Date.now();
    
    // 실험 시작 버튼
    const experimentStartBtn = document.getElementById('experiment-start-btn');
    if (experimentStartBtn) {
        experimentStartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            onExperimentStartClick();
        });
    }
    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'experiment-start-btn' || e.target.closest('#experiment-start-btn')) {
            e.preventDefault();
            e.stopPropagation();
            onExperimentStartClick();
        }
    }, true);
    // 참가자 번호 입력창 엔터 키로 시작
    const participantInput = document.getElementById('participant-id-input');
    if (participantInput) {
        participantInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onExperimentStartClick();
            }
        });
    }
    
    // Introduction 다음 버튼
    document.getElementById('introduction-next-btn').addEventListener('click', () => {
        startLearningStage();
    });
    
    // JOL1 다음 버튼
    const jol1NextBtn = document.getElementById('jol1-next-btn');
    const jol1Input = document.getElementById('jol1-input');
    if (jol1NextBtn && jol1Input) {
        jol1NextBtn.addEventListener('click', () => {
            const val = jol1Input.value.trim();
            if (val === '') {
                alert('0~100 사이의 값을 입력해 주세요.');
                jol1Input.focus();
                return;
            }
            const num = parseInt(val, 10);
            if (isNaN(num) || num < 0 || num > 100) {
                alert('0~100 사이의 숫자를 입력해 주세요.');
                jol1Input.focus();
                return;
            }
            experimentData.jol1 = num;
            const jStart = sessionState.lastStageEnterAt;
            const jNow = Date.now();
            saveExperimentEvent({
                page_name: 'jol1',
                block_name: 'jol1',
                response_value: String(num),
                time_spent: jStart != null ? Math.round(jNow - jStart) : null,
                start_time: jStart != null ? experimentSheetTimestamp(jStart) : null,
                end_time: experimentSheetTimestamp(jNow),
                is_correct: null,
            });
            startReviewStage();
        });
        jol1Input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            const n = parseInt(e.target.value, 10);
            if (!isNaN(n) && n > 100) e.target.value = '100';
        });
        jol1Input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                jol1NextBtn.click();
            }
        });
    }
    
    // 복습 안내 다음 버튼
    document.getElementById('review-instruction-next-btn').addEventListener('click', () => {
        const condition = experimentData.condition;
        const reviewNextBtn = document.getElementById('review-instruction-next-btn');
        const content = document.getElementById('review-instruction-content');
        // 조건 2(지문+질문생성): 1페이지 → 2페이지(객관식 예시) → 3페이지(주관식 예시) → 4페이지 → 복습 화면
        if (condition === 2 && reviewInstructionStep === 1) {
            reviewInstructionStep = 2;
            setReviewInstructionCondition2Page2();
            return;
        }
        if (condition === 2 && reviewInstructionStep === 2) {
            reviewInstructionStep = 3;
            setReviewInstructionCondition2Page3();
            return;
        }
        if (condition === 2 && reviewInstructionStep === 3) {
            reviewInstructionStep = 4;
            setReviewInstructionCondition2Page4();
            return;
        }
        if (condition === 2 && reviewInstructionStep === 4) {
            reviewInstructionStep = 0;
            showStage('review');
            setupReviewStage();
            return;
        }
        // 조건 3(AI 재학습): 첫 페이지에서 다음 → 두 번째 페이지로(바로 다음 가능), 두 번째 페이지에서 다음 → 복습 화면으로
        if (condition === 3 && reviewInstructionStep === 1) {
            reviewInstructionStep = 2;
            setReviewInstructionCondition3Page2();
            return;
        }
        if (condition === 3 && reviewInstructionStep === 2) {
            reviewInstructionStep = 0;
            showStage('review');
            setupReviewStage();
            return;
        }
        // 조건 4(AI+질문생성): 1페이지 → 2페이지(객관식 예시) → 3페이지(주관식 예시) → 4페이지(AI 챗봇 안내) → 5페이지(시간 제한 없음) → 복습 화면
        if (condition === 4 && reviewInstructionStep === 1) {
            reviewInstructionStep = 2;
            setReviewInstructionCondition2Page2();
            return;
        }
        if (condition === 4 && reviewInstructionStep === 2) {
            reviewInstructionStep = 3;
            setReviewInstructionCondition2Page3();
            return;
        }
        if (condition === 4 && reviewInstructionStep === 3) {
            reviewInstructionStep = 4;
            setReviewInstructionCondition4Page2();
            return;
        }
        if (condition === 4 && reviewInstructionStep === 4) {
            reviewInstructionStep = 5;
            setReviewInstructionCondition2Page4();
            return;
        }
        if (condition === 4 && reviewInstructionStep === 5) {
            reviewInstructionStep = 0;
            showStage('review');
            setupReviewStage();
            return;
        }
        reviewInstructionStep = 0;
        showStage('review');
        setupReviewStage();
    });
    
    // 복습 화면에서 설문 안내로 가는 '다음' 버튼 (1분 후 표시됨)
    const reviewToSurveyBtn = document.getElementById('review-to-survey-btn');
    if (reviewToSurveyBtn) {
        reviewToSurveyBtn.addEventListener('click', () => {
            showStage('survey-instruction');
        });
    }

    // 설문 안내에서 설문으로 가는 '다음' 버튼
    const surveyInstructionNextBtn = document.getElementById('survey-instruction-next-btn');
    if (surveyInstructionNextBtn) {
        surveyInstructionNextBtn.addEventListener('click', () => {
            showStage('survey');
            experimentData.survey.startTime = experimentSheetTimestamp();
            setTimeout(() => setupSurvey(), 100);
        });
    }

    const mathPreintroNextBtn = document.getElementById('math-preintro-next-btn');
    if (mathPreintroNextBtn) {
        mathPreintroNextBtn.addEventListener('click', () => {
            showStage('distractor-instruction');
        });
    }

    // 방해과제 안내 다음 버튼
    document.getElementById('distractor-instruction-next-btn').addEventListener('click', () => {
        setupDistractorTask();
    });
    
    // 사후질문 intro 다음 버튼
    document.getElementById('post-survey-intro-next-btn').addEventListener('click', () => {
        showStage('post-survey');
        setTimeout(() => {
            setupPostSurvey();
        }, 100);
        experimentData.postSurvey.startTime = experimentSheetTimestamp();
    });
    
    // 인구통계학 정보 다음 버튼
    document.getElementById('demographics-next-btn').addEventListener('click', () => {
        const age = document.getElementById('demographics-age').value.trim();
        const gender = document.querySelector('input[name="demographics-gender"]:checked');
        const major = document.getElementById('demographics-major').value.trim();
        
        if (!age || !gender || !major) {
            alert('모든 항목을 입력해주세요.');
            return;
        }
        
        // 데이터 저장
        experimentData.demographics = {
            age: age,
            gender: gender.value,
            major: major
        };
        
        saveExperimentEvent({
            page_name: 'demographics',
            block_name: 'demographics',
            response_value: JSON.stringify({ age, gender: gender.value, major }),
            is_correct: null,
        });

        // 기프티콘 페이지는 참가자 흐름에서 제거
        showStage('completion');
        submitAllDataToBackend({ silent: true });
    });
    
    // 기프티콘 완료 버튼
    document.getElementById('gifticon-complete-btn').addEventListener('click', () => {
        const gifticonOption = document.querySelector('input[name="gifticon-option"]:checked');
        
        if (!gifticonOption) {
            alert('기프티콘 수령 여부를 선택해주세요.');
            return;
        }
        
        if (gifticonOption.value === 'phone') {
            const phone = document.getElementById('gifticon-phone').value.trim();
            if (!phone) {
                alert('핸드폰 번호를 입력해주세요.');
                return;
            }
            experimentData.gifticon = {
                option: 'phone',
                phone: phone
            };
        } else {
            experimentData.gifticon = {
                option: 'decline'
            };
        }
        
        saveExperimentEvent({
            page_name: 'gifticon',
            block_name: 'gifticon',
            response_value: JSON.stringify(experimentData.gifticon),
            is_correct: null,
        });
        
        showStage('completion');
        submitAllDataToBackend({ silent: true });
    });
    
    // 설문 다음 버튼
    document.getElementById('survey-next-btn').addEventListener('click', () => {
        if (!validateSurveyStep(currentSurveyIndex)) {
            alert('필수 응답 항목입니다');
            return;
        }
        clearSurveyValidationMsg();
        if (currentSurveyIndex < 7) {
            logSurveyQuestionResponse(currentSurveyIndex + 1);
            showSurveyQuestion(currentSurveyIndex + 1);
        }
    });

    // 설문 완료 버튼
    document.getElementById('survey-submit-btn').addEventListener('click', () => {
        if (!validateSurveyStep(currentSurveyIndex)) {
            alert('필수 응답 항목입니다');
            return;
        }
        clearSurveyValidationMsg();
        logSurveyQuestionResponse(8);
        // 모든 답변 수집
        const answers = {};
        
        // 질문 1-7: 7점 척도
        for (let i = 1; i <= 7; i++) {
            const q = document.querySelector(`input[name="survey-q${i}"]:checked`);
            if (q) answers[`q${i}`] = q.value;
        }
        
        // 질문 8: 숫자 입력
        const q8 = document.getElementById('survey-q8');
        if (q8) answers.q8 = q8.value;
        
        // 데이터 저장
        experimentData.survey.answers = answers;
        experimentData.survey.endTime = experimentSheetTimestamp();
        if (experimentData.survey.startTime) {
            const start = new Date(experimentData.survey.startTime);
            const end = new Date(experimentData.survey.endTime);
            experimentData.survey.duration = Math.floor((end - start) / 1000);
        }
        
        // 다음 단계로 이동 (수학 과제 직전 안내)
        showStage('math-preintro');
    });

    const aiLitNextBtn = document.getElementById('ai-literacy-next-btn');
    const aiLitSubmitBtn = document.getElementById('ai-literacy-submit-btn');
    if (aiLitNextBtn) {
        aiLitNextBtn.addEventListener('click', () => {
            if (!validateAiLiteracyStep(currentAiLiteracyIndex)) {
                const val = document.getElementById('ai-literacy-validation-msg');
                if (val) {
                    val.textContent = '필수응답 항목입니다. 답변을 선택해 주세요.';
                    val.style.display = 'block';
                }
                return;
            }
            const val = document.getElementById('ai-literacy-validation-msg');
            if (val) {
                val.textContent = '';
                val.style.display = 'none';
            }
            logAiLiteracyQuestionResponse(currentAiLiteracyIndex + 1);
            showAiLiteracyQuestion(currentAiLiteracyIndex + 1);
        });
    }
    if (aiLitSubmitBtn) {
        aiLitSubmitBtn.addEventListener('click', () => {
            if (!validateAiLiteracyStep(currentAiLiteracyIndex)) {
                const val = document.getElementById('ai-literacy-validation-msg');
                if (val) {
                    val.textContent = '필수응답 항목입니다. 답변을 선택해 주세요.';
                    val.style.display = 'block';
                }
                return;
            }
            const val = document.getElementById('ai-literacy-validation-msg');
            if (val) {
                val.textContent = '';
                val.style.display = 'none';
            }
            logAiLiteracyQuestionResponse(3);
            const answers = {};
            for (let i = 1; i <= 3; i++) {
                const el = document.querySelector(`input[name="ai-literacy-q${i}"]:checked`);
                answers[`q${i}`] = el ? el.value : '';
            }
            experimentData.aiLiteracy.answers = answers;
            experimentData.aiLiteracy.endTime = experimentSheetTimestamp();
            if (experimentData.aiLiteracy.startTime) {
                const s = new Date(experimentData.aiLiteracy.startTime);
                const e = new Date(experimentData.aiLiteracy.endTime);
                experimentData.aiLiteracy.duration = Math.floor((e - s) / 1000);
            }
            showStage('final-test-instruction');
        });
    }

    // 최종 시험 지시문 시작 버튼
    document.getElementById('start-final-test-btn').addEventListener('click', () => {
        showStage('final-test');
        // DOM이 준비된 후 setupFinalTest 호출
        setTimeout(() => {
            setupFinalTest();
        }, 100);
        experimentData.finalTest.startTime = experimentSheetTimestamp();
    });
    
    // 최종 시험 다음 문제 버튼
    document.getElementById('test-next-btn').addEventListener('click', () => {
        const questions = experimentData.finalTest.questions || finalTestQuestions;
        if (currentQuestionIndex < questions.length - 1) {
            const cq = questions[currentQuestionIndex];
            if (cq) logFinalTestQuestionResponse(cq.number);
            showQuestion(currentQuestionIndex + 1);
        }
    });
    
    // 최종 시험 제출 버튼
    document.getElementById('final-test-submit-btn').addEventListener('click', () => {
        const questions = experimentData.finalTest.questions || finalTestQuestions;
        const curQ = questions[currentQuestionIndex];
        if (curQ) logFinalTestQuestionResponse(curQ.number);
        // 모든 답변 수집
        const answers = {};
        questions.forEach((q) => {
            const answerInput = document.getElementById(`test-q${q.number}`);
            if (answerInput) {
                answers[`q${q.number}`] = answerInput.value;
            }
        });
        experimentData.finalTest.answers = answers;
        experimentData.finalTest.endTime = experimentSheetTimestamp();
        const start = new Date(experimentData.finalTest.startTime);
        const end = new Date(experimentData.finalTest.endTime);
        experimentData.finalTest.duration = (end - start) / 1000;
        showStage('post-survey-intro');
    });
    
    // 다운로드/업로드 (완료 화면에서 숨김·개발용으로만 사용 가능)
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadData);
    }
    const uploadBtn = document.getElementById('upload-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', uploadData);
    }
    
    // 질문+답+해설 쌍 다음 버튼
    const pairNextBtn = document.getElementById('pair-next-btn');
    if (pairNextBtn) {
        pairNextBtn.addEventListener('click', () => {
            moveToNextPair();
        });
    }
    
    // AI 챗봇 전송 버튼
    const sendBtn = document.getElementById('send-btn');
    const chatInput = document.getElementById('chat-input');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            if (chatInput && !chatInput.disabled) {
                const message = chatInput.value.trim();
                if (message) {
                    sendChatMessage(message);
                    chatInput.value = '';
                }
            }
        });
    }
    
    // AI 챗봇 엔터 키
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !chatInput.disabled) {
                e.preventDefault();
                sendBtn.click();
            }
        });
    }
    
    // 사후질문 다음 버튼
    document.getElementById('post-survey-next-btn').addEventListener('click', () => {
        if (currentPostSurveyIndex < 2) {
            logPostSurveyQuestionResponse(currentPostSurveyIndex + 1);
            showPostSurveyQuestion(currentPostSurveyIndex + 1);
        }
    });
    
    // 사후질문 제출 버튼
    document.getElementById('post-survey-submit-btn').addEventListener('click', () => {
        logPostSurveyQuestionResponse(3);
        // 모든 답변 수집
        const answers = {};
        
        // 질문 1: 7점 척도
        const q1 = document.querySelector('input[name="post-survey-q1"]:checked');
        if (q1) answers.q1 = q1.value;
        
        // 질문 2: 숫자 입력
        const q2 = document.getElementById('post-survey-q2');
        if (q2) answers.q2 = q2.value;
        
        // 질문 3: 텍스트 입력
        const q3 = document.getElementById('post-survey-q3');
        if (q3) answers.q3 = q3.value;
        
        experimentData.postSurvey.answers = answers;
        experimentData.postSurvey.endTime = experimentSheetTimestamp();
        const start = new Date(experimentData.postSurvey.startTime);
        const end = new Date(experimentData.postSurvey.endTime);
        experimentData.postSurvey.duration = (end - start) / 1000;
        showStage('demographics');
    });
    
    // 개발자 모드 네비게이션 설정
    setupDesignerNavigation();
    
    // 조건 적용 버튼
    document.getElementById('apply-condition').addEventListener('click', applyDesignerCondition);

    // 페이지 이탈 전 best-effort 저장 (실패해도 사용자 흐름에는 영향 없음)
    window.addEventListener('pagehide', () => {
        submitAllDataToBackend({ silent: true });
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            submitAllDataToBackend({ silent: true });
        }
    });
    
    // 개발자 모드 단축키 (Ctrl + Shift + D)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            toggleDesignerMode();
        }
    });
});

