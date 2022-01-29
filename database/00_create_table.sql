-- Table: public.yt_stats

-- DROP TABLE IF EXISTS public.yt_stats;

CREATE TABLE IF NOT EXISTS public.yt_stats
(
    date timestamp with time zone NOT NULL,
    duration integer NOT NULL,
    amount integer NOT NULL,
    CONSTRAINT yt_stats_pkey PRIMARY KEY (date)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.yt_stats
    OWNER to lumen;