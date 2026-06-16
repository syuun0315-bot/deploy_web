-- =============================================================================
-- 학습 실험 Supabase 스키마
-- Supabase SQL Editor에서 전체 실행하세요.
-- (기존 experiment_events 테이블이 있으면 DROP 후 재생성하거나 ALTER 구문을 따로 적용)
-- =============================================================================

-- 기존 테이블이 다른 구조라면 백업 후 실행
-- DROP TABLE IF EXISTS public.experiment_events CASCADE;
-- DROP TABLE IF EXISTS public.participant_summary CASCADE;

-- -----------------------------------------------------------------------------
-- 1. experiment_events (원자료 long format)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experiment_events (
    id BIGSERIAL PRIMARY KEY,
    participant_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    condition TEXT CHECK (
        condition IS NULL
        OR condition IN ('restudy_text', 'qg_text', 'restudy_ai', 'qg_ai')
    ),
    event_type TEXT NOT NULL,
    page_name TEXT NOT NULL CHECK (
        page_name IN (
            'welcome',
            'instruction',
            'learning_instruction',
            'learning_self_restudy',
            'learning_self_qg',
            'learning_ai_restudy',
            'learning_ai_qg',
            'study_page_1',
            'study_page_2',
            'review_page',
            'review_qg_ai',
            'review_qg_text',
            'distractor_page',
            'final_test_fact',
            'final_test_transfer',
            'survey_mental_effort',
            'submit'
        )
    ),
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    page_enter_time TIMESTAMPTZ,
    page_leave_time TIMESTAMPTZ,
    page_dwell_time_ms INTEGER,
    click_count INTEGER,
    input_value TEXT,

    item_id TEXT,
    participant_answer TEXT,
    correct_answer TEXT,
    correctness BOOLEAN,
    distractor_total_attempted_count INTEGER,
    distractor_correct_count INTEGER,
    distractor_incorrect_count INTEGER,
    distractor_accuracy NUMERIC(6, 4),

    chatbot_user_message TEXT,
    chatbot_ai_reply TEXT,

    generated_question_text TEXT,
    generated_answer_text TEXT,
    generated_explanation_text TEXT,
    question_type_check_memory_fact BOOLEAN,
    question_type_check_understanding_application BOOLEAN,

    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiment_events_participant_id
    ON public.experiment_events (participant_id);
CREATE INDEX IF NOT EXISTS idx_experiment_events_session_id
    ON public.experiment_events (session_id);
CREATE INDEX IF NOT EXISTS idx_experiment_events_page_name
    ON public.experiment_events (page_name);
CREATE INDEX IF NOT EXISTS idx_experiment_events_event_type
    ON public.experiment_events (event_type);
CREATE INDEX IF NOT EXISTS idx_experiment_events_event_timestamp
    ON public.experiment_events (event_timestamp DESC);

COMMENT ON TABLE public.experiment_events IS '실험 원자료 이벤트 로그 (long format, 이벤트마다 1행 insert)';

-- -----------------------------------------------------------------------------
-- 2. participant_summary (참가자 1명 1행, wide format)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.participant_summary (
    participant_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    condition TEXT CHECK (
        condition IS NULL
        OR condition IN ('restudy_text', 'qg_text', 'restudy_ai', 'qg_ai')
    ),
    experiment_start_time TIMESTAMPTZ,
    experiment_end_time TIMESTAMPTZ,
    total_duration_ms BIGINT,

    welcome_enter_time TIMESTAMPTZ,
    welcome_leave_time TIMESTAMPTZ,
    welcome_dwell_time_ms INTEGER,
    welcome_click_count INTEGER,
    welcome_input_value TEXT,

    instruction_enter_time TIMESTAMPTZ,
    instruction_leave_time TIMESTAMPTZ,
    instruction_dwell_time_ms INTEGER,
    instruction_click_count INTEGER,
    instruction_input_value TEXT,

    study_page_1_enter_time TIMESTAMPTZ,
    study_page_1_leave_time TIMESTAMPTZ,
    study_page_1_dwell_time_ms INTEGER,
    study_page_1_click_count INTEGER,
    study_page_1_input_value TEXT,

    study_page_2_enter_time TIMESTAMPTZ,
    study_page_2_leave_time TIMESTAMPTZ,
    study_page_2_dwell_time_ms INTEGER,
    study_page_2_click_count INTEGER,
    study_page_2_input_value TEXT,

    review_page_enter_time TIMESTAMPTZ,
    review_page_leave_time TIMESTAMPTZ,
    review_page_dwell_time_ms INTEGER,
    review_page_click_count INTEGER,
    review_page_input_value TEXT,

    review_qg_ai_enter_time TIMESTAMPTZ,
    review_qg_ai_leave_time TIMESTAMPTZ,
    review_qg_ai_dwell_time_ms INTEGER,
    review_qg_ai_click_count INTEGER,
    review_qg_ai_input_value TEXT,

    review_qg_text_enter_time TIMESTAMPTZ,
    review_qg_text_leave_time TIMESTAMPTZ,
    review_qg_text_dwell_time_ms INTEGER,
    review_qg_text_click_count INTEGER,
    review_qg_text_input_value TEXT,

    distractor_page_enter_time TIMESTAMPTZ,
    distractor_page_leave_time TIMESTAMPTZ,
    distractor_page_dwell_time_ms INTEGER,
    distractor_page_click_count INTEGER,
    distractor_page_input_value TEXT,

    final_test_fact_enter_time TIMESTAMPTZ,
    final_test_fact_leave_time TIMESTAMPTZ,
    final_test_fact_dwell_time_ms INTEGER,
    final_test_fact_click_count INTEGER,
    final_test_fact_input_value TEXT,

    final_test_transfer_enter_time TIMESTAMPTZ,
    final_test_transfer_leave_time TIMESTAMPTZ,
    final_test_transfer_dwell_time_ms INTEGER,
    final_test_transfer_click_count INTEGER,
    final_test_transfer_input_value TEXT,

    survey_mental_effort_enter_time TIMESTAMPTZ,
    survey_mental_effort_leave_time TIMESTAMPTZ,
    survey_mental_effort_dwell_time_ms INTEGER,
    survey_mental_effort_click_count INTEGER,
    survey_mental_effort_input_value TEXT,

    submit_enter_time TIMESTAMPTZ,
    submit_leave_time TIMESTAMPTZ,
    submit_dwell_time_ms INTEGER,
    submit_click_count INTEGER,
    submit_input_value TEXT,

    distractor_total_attempted_count INTEGER,
    distractor_correct_count INTEGER,
    distractor_incorrect_count INTEGER,
    distractor_accuracy NUMERIC(6, 4),

    question_generation_count INTEGER,
    chat_user_message_count INTEGER,
    chat_ai_message_count INTEGER,

    protocol_version TEXT,
    pre_jol_score INTEGER,
    post_jol_score INTEGER,
    jol_change_score INTEGER,
    learning_enter_time TIMESTAMPTZ,
    learning_leave_time TIMESTAMPTZ,
    learning_dwell_time_ms INTEGER,
    learning_click_count INTEGER,
    qg_complete_count INTEGER,
    qg_incomplete_count INTEGER,
    final_test_response_count INTEGER,
    final_fact_score NUMERIC(6, 4),
    final_transfer_score NUMERIC(6, 4),

    experiment_snapshot JSONB NOT NULL DEFAULT '{}'::JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_participant_summary_session_id
    ON public.participant_summary (session_id);
CREATE INDEX IF NOT EXISTS idx_participant_summary_condition
    ON public.participant_summary (condition);

COMMENT ON TABLE public.participant_summary IS '참가자별 실험 요약 (wide format, 최종 제출 시 upsert)';

-- -----------------------------------------------------------------------------
-- 3. updated_at 자동 갱신
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_participant_summary_updated_at ON public.participant_summary;
CREATE TRIGGER trg_participant_summary_updated_at
    BEFORE UPDATE ON public.participant_summary
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 4. RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.experiment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_summary ENABLE ROW LEVEL SECURITY;

-- experiment_events: anon insert
DROP POLICY IF EXISTS experiment_events_anon_insert ON public.experiment_events;
CREATE POLICY experiment_events_anon_insert
    ON public.experiment_events
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- experiment_events: anon select (디버깅·클라이언트 확인용, 필요 없으면 제거)
DROP POLICY IF EXISTS experiment_events_anon_select ON public.experiment_events;
CREATE POLICY experiment_events_anon_select
    ON public.experiment_events
    FOR SELECT
    TO anon
    USING (true);

-- participant_summary: anon insert (최초 upsert 대비)
DROP POLICY IF EXISTS participant_summary_anon_insert ON public.participant_summary;
CREATE POLICY participant_summary_anon_insert
    ON public.participant_summary
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- participant_summary: anon update
DROP POLICY IF EXISTS participant_summary_anon_update ON public.participant_summary;
CREATE POLICY participant_summary_anon_update
    ON public.participant_summary
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- participant_summary: anon select
DROP POLICY IF EXISTS participant_summary_anon_select ON public.participant_summary;
CREATE POLICY participant_summary_anon_select
    ON public.participant_summary
    FOR SELECT
    TO anon
    USING (true);

-- service_role은 RLS 우회 (서버 API Route 권장)
