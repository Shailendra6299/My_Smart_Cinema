-- =========================================================
-- SMART CINEMA DATABASE SCHEMA
-- =========================================================

-- =========================
-- MOVIES
-- =========================

CREATE TABLE IF NOT EXISTS movies (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    genre TEXT,
    duration_minutes INTEGER,
    rating TEXT,
    description TEXT,
    poster_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- SEATS
-- =========================

CREATE TABLE IF NOT EXISTS seats (
    id BIGSERIAL PRIMARY KEY,
    seat_number TEXT NOT NULL UNIQUE,
    seat_row TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- SHOWS
-- =========================

CREATE TABLE IF NOT EXISTS shows (
    id BIGSERIAL PRIMARY KEY,
    movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    hall_name TEXT NOT NULL,
    screen_name TEXT NOT NULL,
    ticket_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(movie_id, show_date, show_time)
);

-- =========================
-- BOOKINGS
-- =========================

CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_code TEXT NOT NULL UNIQUE,

    customer_name TEXT NOT NULL,
    customer_email TEXT,
    phone TEXT,

    movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    show_id BIGINT NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    seat_id BIGINT NOT NULL REFERENCES seats(id) ON DELETE RESTRICT,

    booking_status TEXT NOT NULL DEFAULT 'BOOKED',

    qr_scanned BOOLEAN NOT NULL DEFAULT FALSE,
    qr_scanned_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(show_id, seat_id)
);

-- =========================
-- SENSOR LOGS
-- =========================

CREATE TABLE IF NOT EXISTS sensor_logs (
    id BIGSERIAL PRIMARY KEY,

    seat_id BIGINT NOT NULL REFERENCES seats(id) ON DELETE CASCADE,

    sensor_name TEXT NOT NULL,

    -- Future Raspberry Pi/load-cell value
    weight NUMERIC(10,2),

    occupied BOOLEAN NOT NULL DEFAULT FALSE,

    status TEXT NOT NULL DEFAULT 'CLEAR',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_bookings_booking_code
ON bookings(booking_code);

CREATE INDEX IF NOT EXISTS idx_bookings_show_id
ON bookings(show_id);

CREATE INDEX IF NOT EXISTS idx_bookings_seat_id
ON bookings(seat_id);

CREATE INDEX IF NOT EXISTS idx_sensor_logs_seat_id
ON sensor_logs(seat_id);

-- =========================================================
-- DEMO MOVIE
-- =========================================================

INSERT INTO movies (
    title,
    genre,
    duration_minutes,
    rating,
    description,
    poster_url
)
VALUES (
    'The Midnight Circuit',
    'Sci-Fi / Thriller',
    128,
    '8.7',
    'A brilliant engineer races through a city of neon signals to stop a rogue AI before midnight. Fast, tense, and full of cinematic energy.',
    '/images/poster.jpg'
)
ON CONFLICT DO NOTHING;

-- =========================================================
-- DEMO SEATS
-- =========================================================

INSERT INTO seats (seat_number, seat_row)
VALUES
    ('R01', 'R'),
    ('R02', 'R'),
    ('R03', 'R'),
    ('R04', 'R')
ON CONFLICT (seat_number) DO NOTHING;

-- =========================================================
-- DEMO SHOW
-- =========================================================

INSERT INTO shows (
    movie_id,
    show_date,
    show_time,
    hall_name,
    screen_name,
    ticket_price
)
SELECT
    id,
        CURRENT_DATE + 1,
    '19:30:00',
    'Smart Cinema Hall',
    'Screen 01',
    0.00
FROM movies
WHERE title = 'The Midnight Circuit'
    AND NOT EXISTS (
            SELECT 1
            FROM shows
            WHERE shows.movie_id = movies.id
                AND shows.show_date >= CURRENT_DATE
    )
ON CONFLICT (movie_id, show_date, show_time) DO NOTHING;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_logs ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- DEMO POLICIES
-- =========================================================

CREATE POLICY "Public can read movies"
ON movies
FOR SELECT
USING (true);

CREATE POLICY "Public can read seats"
ON seats
FOR SELECT
USING (true);

CREATE POLICY "Public can read shows"
ON shows
FOR SELECT
USING (true);

CREATE POLICY "Public can read bookings"
ON bookings
FOR SELECT
USING (true);

CREATE POLICY "Public can create bookings"
ON bookings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update bookings"
ON bookings
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can read sensor logs"
ON sensor_logs
FOR SELECT
USING (true);

CREATE POLICY "Public can create sensor logs"
ON sensor_logs
FOR INSERT
WITH CHECK (true);