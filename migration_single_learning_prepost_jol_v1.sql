-- =============================================================================
-- single_learning_prepost_jol_v1 프로토콜 마이그레이션
-- Supabase SQL Editor에서 실행하세요. (기존 테이블 DROP 없음)
-- =============================================================================

-- 1) experiment_events.page_name CHECK 확장 (기존 값 유지 + 학습 세션 page_name 추가)
ALTER TABLE public.experiment_events
    DROP CONSTRAINT IF EXISTS experiment_events_page_name_check;

ALTER TABLE public.experiment_events
    ADD CONSTRAINT experiment_events_page_name_check
    CHECK (
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
    );

-- 2) participant_summary — 새 프로토콜 컬럼 추가 (기존 wide 컬럼은 유지)
ALTER TABLE public.participant_summary
    ADD COLUMN IF NOT EXISTS protocol_version TEXT,
    ADD COLUMN IF NOT EXISTS pre_jol_score INTEGER,
    ADD COLUMN IF NOT EXISTS post_jol_score INTEGER,
    ADD COLUMN IF NOT EXISTS jol_change_score INTEGER,
    ADD COLUMN IF NOT EXISTS learning_enter_time TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS learning_leave_time TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS learning_dwell_time_ms INTEGER,
    ADD COLUMN IF NOT EXISTS learning_click_count INTEGER,
    ADD COLUMN IF NOT EXISTS qg_complete_count INTEGER,
    ADD COLUMN IF NOT EXISTS qg_incomplete_count INTEGER,
    ADD COLUMN IF NOT EXISTS final_test_response_count INTEGER,
    ADD COLUMN IF NOT EXISTS final_fact_score NUMERIC(6, 4),
    ADD COLUMN IF NOT EXISTS final_transfer_score NUMERIC(6, 4);

COMMENT ON COLUMN public.participant_summary.protocol_version IS '실험 프로토콜 버전 (예: single_learning_prepost_jol_v1)';
