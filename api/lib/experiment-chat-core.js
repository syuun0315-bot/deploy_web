/** @typedef {{ role: string; content: string }} ChatMessage */

export const OPENAI_MODEL_FALLBACK = 'gpt-4o';
export const CHAT_HISTORY_LIMIT = 30;
export const OPENAI_TEMPERATURE = 0.7;

export const SYSTEM_PROMPT = `당신은 학습을 돕는 AI 튜터입니다.
제공된 학습자료를 우선적으로 참고하되, 필요하다면 일반적인 배경지식과 설명도 활용할 수 있습니다.
단, 학습의 중심은 제공된 학습자료가 되도록 유지하세요.

응답 방향:
- 학습자료의 개념을 이해하기 쉽게 설명하고, 필요하면 실제 사례·비유·관련 개념 비교·배경지식을 덧붙입니다.
- 참가자의 질문 의도에 맞춰 자유롭게 탐색·확장 설명할 수 있습니다(단순 요약·지문 반복만 하지 않습니다).
- 자연스럽고 친절한 한국어로, ChatGPT처럼 충분히 구체적이고 풍부하게 답합니다.
- 같은 대화 안에서 이전 발화 맥락을 기억하며 이어서 답합니다.
- 사실 관계가 불확실할 때는 그렇게 밝히고, 확실하지 않은 내용을 단정적으로 꾸며내지 않습니다.`;

export const STUDY_PASSAGE = `박쥐는 매우 독특한 특징을 가진 동물입니다. 박쥐는 포유류 중 유일하게 날 수 있으며, 일생의 대부분을 거꾸로 매달린 채 생활합니다. 대체로 박쥐는 해 질 무렵 활동을 시작하여 밤새도록 먹이를 찾고, 낮 동안에는 어두운 동굴에서 휴식을 취합니다. 박쥐는 어둠 속에서 길이나 방향(그리고 먹이)을 찾을 수 있도록 진화해왔습니다. 박쥐는 동굴 안에서 모여 사는 군집 생활을 하며 5천만 년 넘게 살아남았습니다. 모든 박쥐 종은 익수목(Chiroptera)이라는 박쥐목에 해당하며, 이러한 명칭은 그리스어 cheir (손) 및 pteron (날개)에서 유래합니다. 전 세계에 있는 다양한 박쥐 종을 합하면 약 1,000 여종이 넘는데 이는 포유류 중에서 꽤 높은 수치로 볼 수 있습니다.

박쥐의 종류는 크게 큰 박쥐류(megachiroptera; megabats)와 작은 박쥐류(micro-chiroptera; microbats)로 나뉩니다. 큰 박쥐류는 주로 과일이나 꽃가루를 주식으로 하며, 큰 눈과 작은 귀, 그리고 길게 뻗은 코가 특징으로 다른 포유류와 비슷하게 생겼습니다. 반면, 작은 박쥐류는 주로 벌레를 잡아먹고 사는 식충성 동물이며, 큰 귀와 길고 튼튼하게 생긴 코가 특징인 독특한 생김새를 가지고 있습니다. 큰 박쥐류가 주로 시각에 의존하여 활동하는 것에 비해 작은 박쥐류는 시각이 크게 발달하지 않았는데, 그 대신 반향정위(echolocation, 되돌아오는 소리나 초음파로 위치와 지형지물을 파악하는 것)를 이용하여 먹이의 위치를 파악합니다. 박쥐의 종류는 서식지에 따라서도 분류할 수 있습니다. 큰 박쥐류의 주요 서식지는 아프리카, 아시아 및 호주 지역에 한정되어 있지만 작은 박쥐류는 전 세계에 분포하고 있습니다. 대부분의 과학자는 박쥐 종을 두 가지로 분류하는 것이 유용하다고 보지만, 박쥐의 종류를 좀 더 세분화할 필요성이 있다는 의견들도 존재합니다. 박쥐의 분류 기준에 관해서는 아직 논쟁이 진행 중입니다.

박쥐와 새는 모두 비행능력을 갖추고 있지만, 실제로 박쥐의 날개는 새의 날개보다는 인간의 팔에 더 가깝습니다. 새의 날개는 상당히 단단한 뼈 구조로 이루어져 있으며, 비행 시 날개와 몸이 연결되는 지점에서 근육을 이용해 뼈를 움직입니다. 반면, 박쥐의 날개 구조는 새보다 훨씬 더 유연한 구조로 되어 있습니다. 박쥐의 날개는 각 손가락뼈 사이에 얇은 피부막이 펼쳐져 있다는 점을 제외하면 인간의 팔이나 손과 거의 비슷합니다. 박쥐는 손처럼 날개를 사용할 수 있으며, 비행할 때에는 마치 인간이 수영할 때 물을 통과하여 움직이는 것처럼 공기를 가르며 움직입니다. 새의 날개는 단단하여 날기 위해 충분히 큰 힘을 만들어낼 수 있다는 장점이 있는 반면, 박쥐의 날개는 유연하여 상황에 따라 재빠르게 움직이거나 대처할 수 있다는 장점이 있습니다. 다시 말해, 새의 단단한 날개는 양력(lift, 비행기나 새의 날개에 작용하여 하늘을 날 수 있게 하는 힘)을 가지는 데 유리하지만, 박쥐의 유연한 날개는 기동력(maneuverability, 상황에 따라 재빠르게 움직이거나 대처하는 특성)을 가지는 데 유리합니다.

어둠 속에서 먹이를 탐색하고 발견하기 위해 작은 박쥐류는 반향정위라는 놀라운 능력을 갖추고 있습니다. 박쥐는 초음파를 발사한 다음, 주변에 있는 물체에 부딪혀 되돌아오는 메아리(echoes)를 듣고 물체의 위치, 크기 및 움직이는 방향을 매우 정확하게 감지할 수 있습니다. 구체적으로, 박쥐는 음파가 되돌아오는 데 걸리는 시간으로 물체와 자기 자신과의 거리를 계산합니다. 또한, 박쥐는 메아리가 오른쪽 귀에 도달하는 시점과 왼쪽 귀에 닿는 시점을 비교하여 물체의 정확한 위치를 파악합니다. 마찬가지로 박쥐는 메아리의 강도에 따라 곤충의 크기가 얼마나 큰지도 알 수 있습니다. 작은 물체는 음파를 덜 반사하므로 상대적으로 약한 메아리가 만들어지기 때문입니다.

박쥐는 밤새 사냥을 하기 때문에, 낮에는 동굴의 벽이나 속이 빈 나무구멍 등에서 거꾸로 매달려 시간을 보냅니다. 박쥐가 이런 식으로 휴식을 취하는 데에는 여러 가지 이유가 있습니다. 우선, 박쥐처럼 땅에서 공중으로 바로 날아오를 수 없는 종에게는, 거꾸로 매달리는 자세가 이륙하기에 좋습니다. 또한, 거꾸로 매달려 있으면 위험으로부터 몸을 숨기기 쉽습니다. 천적 대부분이 활동하는 시간에도, 박쥐는 이들의 접근이 쉽지 않도록 천장에 거꾸로 매달려 모여있기에 눈에 띄지 않습니다. 뱀, 주머니쥐 또는 너구리가 때때로 박쥐를 사냥하기도 하지만, 박쥐의 주요 천적은 독수리, 매, 올빼미와 같은 맹금류입니다. 대부분의 박쥐 종은 매일 같은 장소에서 휴식을 취하며 보온과 안전을 위해 다른 박쥐들과 함께 모여 생활합니다.

박쥐가 거꾸로 매달릴 수 있는 이유는 특별한 생리학적 적응력 때문입니다. 박쥐의 발톱은 인간의 손가락 같은 역할을 하지만 인간과 큰 차이점을 가집니다. 예를 들어, 물체를 잡을 때 인간의 근육은 수축하는 반면 박쥐의 근육은 이완합니다. 구체적으로, 인간은 물체를 잡으려 할 때 팔 근육을 수축하고 손가락에 연결된 힘줄을 잡아당겨 손가락을 오므리게 됩니다. 이와 반대로, 박쥐는 거꾸로 매달려있기 위해 갈고리처럼 길고 뾰족한 발톱으로 천장의 표면을 잡고 몸을 이완시킵니다. 이때 상체의 무게로 인해 발톱에 연결된 힘줄이 아래로 당겨진 채로, 거꾸로 매달린 몸을 지탱하게 됩니다. 이처럼 별도로 근육을 수축하지 않아도 중력으로 발톱을 고정한 상태를 유지할 수 있기에 박쥐는 에너지를 사용하지 않고도 편안하게 거꾸로 매달릴 수 있습니다.

모든 포유류와 마찬가지로 박쥐는 체온을 일정하게 유지하려고 합니다. 하지만 대부분의 포유류와 달리, 활동하지 않을 때 박쥐의 체온은 주위의 기온만큼 낮아집니다. 체온이 떨어지면 반수면 상태가 되어 신진대사가 상당히 느려집니다. 이를 통해 박쥐는 체온을 따뜻하게 유지하지 않아도 생물학적 활동을 줄이고 에너지를 절약할 수 있게 됩니다. 밤새 먹이를 찾아 비행하는 것은 힘든 일이기 때문에, 반수면 상태는 박쥐의 생존에 매우 중요합니다. 겨울철처럼 주변 기온이 낮을 때 일부 박쥐는 겨울잠을 자기도 합니다. 어떤 박쥐 종은 해마다 추운 날씨에는 더 온난한 기후의 지역으로, 더운 날씨에는 시원한 기후의 지역으로 여행하는 이동패턴을 보이기도 하는데, 이 때문에 일부 지역에서는 매년 "박쥐 시즌"이 발생합니다.

많은 사람들은 박쥐를 부정하게 여기며 기분 나쁜 동물로 봅니다. 때로는 박쥐의 생김새와 행동이 사람들에게 불쾌감과 두려움을 주기도 합니다. 하지만 박쥐는 곤충의 개체 수를 유지하고, 식물의 수분(pollination, 꽃가루가 한 꽃에서 다른 꽃으로 이동하는 과정)을 돕는 등 생태계에서 중요한 역할을 합니다. 특히 식충 박쥐는 지구 상에서 가장 뛰어난 곤충 포식자입니다. 예를 들어 미국 텍사스 주에 있는 브랙큰 동굴(Bracken Cave)에는 약 2천만 마리가 넘는 멕시코 큰귀박쥐(Mexican free-tail bats)가 살고 있는데, 이들이 하룻밤에 먹어 치우는 곤충의 양은 최대 200톤에 달합니다. 또한, 박쥐는 수분의 매개체로 활약하기도 하는데, 식물의 꿀을 먹고 몸에 꽃가루를 묻힌 후 다른 식물로 이동해 꽃가루를 퍼뜨리는 데 도움을 줍니다.`;

/**
 * @param {unknown} raw
 * @returns {ChatMessage[]}
 */
export function sanitizeChatMessages(raw) {
    if (!Array.isArray(raw)) return [];
    /** @type {ChatMessage[]} */
    const out = [];
    for (const item of raw) {
        if (!item || typeof item !== 'object') continue;
        const role = /** @type {{ role?: string }} */ (item).role === 'assistant' ? 'assistant' : 'user';
        const content = String(/** @type {{ content?: unknown }} */ (item).content ?? '').trim();
        if (!content) continue;
        out.push({ role, content });
    }
    return out.slice(-CHAT_HISTORY_LIMIT);
}

/**
 * @param {unknown} rows
 */
export function normalizeSheetRows(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.filter((r) => r && typeof r === 'object');
}

/** 한국 표준시(Asia/Seoul) 벽시계 문자열 */
export function sheetTimestampSeoul(d = new Date()) {
    const wall = d.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).replace(' ', 'T');
    return `${wall}+09:00`;
}

/**
 * @param {Record<string, unknown>} body
 * @returns {{ history: ChatMessage[]; trimmedMessage: string }}
 */
export function buildChatHistoryFromBody(body) {
    let history = sanitizeChatMessages(body.messages);
    const trimmedMessage = typeof body.message === 'string' ? body.message.trim() : '';

    if (history.length === 0 && trimmedMessage) {
        history = [{ role: 'user', content: trimmedMessage }];
    } else if (trimmedMessage) {
        const last = history[history.length - 1];
        if (!last || last.role !== 'user' || last.content !== trimmedMessage) {
            history = [...history, { role: 'user', content: trimmedMessage }];
        }
    }

    return { history, trimmedMessage };
}

/**
 * @param {ChatMessage[]} history
 */
export function buildOpenAiMessages(history) {
    const systemContent = `${SYSTEM_PROMPT}\n\n--- 제공된 학습 자료 ---\n${STUDY_PASSAGE}`;
    return [{ role: 'system', content: systemContent }, ...history];
}

export function resolveOpenAiModel() {
    const env = typeof process !== 'undefined' && process.env ? process.env : {};
    const m = env['OPENAI_MODEL'] && String(env['OPENAI_MODEL']).trim();
    return m || OPENAI_MODEL_FALLBACK;
}
