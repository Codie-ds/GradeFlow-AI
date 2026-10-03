-- GradeFlow-AI — schema already running in Supabase
-- Storage: private bucket named "submissions" (created via Supabase dashboard)

create table if not exists assignments (
    id          uuid        primary key default gen_random_uuid(),
    title       text        not null,
    description text,
    created_at  timestamptz default now()
);

create table if not exists questions (
    id            uuid        primary key default gen_random_uuid(),
    assignment_id uuid        not null references assignments(id) on delete cascade,
    number        text        not null,
    text          text        not null,
    max_marks     int         not null,
    answer_key    text,
    rubric        jsonb,
    created_at    timestamptz default now()
);

create table if not exists submissions (
    id            uuid        primary key default gen_random_uuid(),
    assignment_id uuid        not null references assignments(id) on delete cascade,
    student_name  text        not null,
    file_path     text        not null,
    status        text        not null default 'uploaded'
                              check (status in ('uploaded','processing','graded','failed')),
    error         text,
    submitted_at  timestamptz default now()
);

create table if not exists results (
    id            uuid        primary key default gen_random_uuid(),
    submission_id uuid        not null unique references submissions(id) on delete cascade,
    extraction    jsonb,
    evaluation    jsonb,
    total_marks   numeric,
    max_total     numeric,
    needs_review  boolean     default false,
    created_at    timestamptz default now()
);
