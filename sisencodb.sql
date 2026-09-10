--
-- PostgreSQL database dump
--

\restrict IsAQi1VdpHV2HiJACm8JekP8NPfiur65JFYrRq9ZX4CLLqYx1sQfRNLE6WeUKq5

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-09-10 17:16:05

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 883 (class 1247 OID 33167)
-- Name: ReportStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReportStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'NEEDS_CORRECTION',
    'APPROVED'
);


ALTER TYPE public."ReportStatus" OWNER TO postgres;

--
-- TOC entry 892 (class 1247 OID 33194)
-- Name: ReviewAction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReviewAction" AS ENUM (
    'APPROVED',
    'REQUESTED_CHANGES'
);


ALTER TYPE public."ReviewAction" OWNER TO postgres;

--
-- TOC entry 877 (class 1247 OID 33035)
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'TEAM_MEMBER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- TOC entry 886 (class 1247 OID 33176)
-- Name: TaskPriority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaskPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH'
);


ALTER TYPE public."TaskPriority" OWNER TO postgres;

--
-- TOC entry 889 (class 1247 OID 33184)
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'COMPLETED',
    'BLOCKED'
);


ALTER TYPE public."TaskStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 225 (class 1259 OID 33200)
-- Name: Project; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Project" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Project" OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 33199)
-- Name: Project_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Project_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Project_id_seq" OWNER TO postgres;

--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 224
-- Name: Project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Project_id_seq" OWNED BY public."Project".id;


--
-- TOC entry 227 (class 1259 OID 33216)
-- Name: Report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Report" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "projectId" integer NOT NULL,
    "weekStart" timestamp(3) without time zone NOT NULL,
    "weekEnd" timestamp(3) without time zone NOT NULL,
    status public."ReportStatus" DEFAULT 'DRAFT'::public."ReportStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Report" OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 33327)
-- Name: ReportReview; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReportReview" (
    id integer NOT NULL,
    "reportId" integer NOT NULL,
    "reportVersionId" integer NOT NULL,
    "reviewerId" integer NOT NULL,
    action public."ReviewAction" NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ReportReview" OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 33326)
-- Name: ReportReview_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ReportReview_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ReportReview_id_seq" OWNER TO postgres;

--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 240
-- Name: ReportReview_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ReportReview_id_seq" OWNED BY public."ReportReview".id;


--
-- TOC entry 229 (class 1259 OID 33233)
-- Name: ReportVersion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReportVersion" (
    id integer NOT NULL,
    "reportId" integer NOT NULL,
    "versionNumber" integer NOT NULL,
    "submittedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ReportVersion" OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 33291)
-- Name: ReportVersionAchievement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReportVersionAchievement" (
    id integer NOT NULL,
    "reportVersionId" integer NOT NULL,
    description text NOT NULL,
    "isKeyAchievement" boolean DEFAULT false NOT NULL,
    "sortOrder" integer NOT NULL
);


ALTER TABLE public."ReportVersionAchievement" OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 33290)
-- Name: ReportVersionAchievement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ReportVersionAchievement_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ReportVersionAchievement_id_seq" OWNER TO postgres;

--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 236
-- Name: ReportVersionAchievement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ReportVersionAchievement_id_seq" OWNED BY public."ReportVersionAchievement".id;


--
-- TOC entry 235 (class 1259 OID 33276)
-- Name: ReportVersionBlocker; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReportVersionBlocker" (
    id integer NOT NULL,
    "reportVersionId" integer NOT NULL,
    description text NOT NULL,
    "isKeyIssue" boolean DEFAULT false NOT NULL,
    "sortOrder" integer NOT NULL
);


ALTER TABLE public."ReportVersionBlocker" OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 33275)
-- Name: ReportVersionBlocker_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ReportVersionBlocker_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ReportVersionBlocker_id_seq" OWNER TO postgres;

--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 234
-- Name: ReportVersionBlocker_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ReportVersionBlocker_id_seq" OWNED BY public."ReportVersionBlocker".id;


--
-- TOC entry 239 (class 1259 OID 33306)
-- Name: ReportVersionHours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReportVersionHours" (
    id integer NOT NULL,
    "reportVersionId" integer NOT NULL,
    development double precision DEFAULT 0 NOT NULL,
    testing double precision DEFAULT 0 NOT NULL,
    meetings double precision DEFAULT 0 NOT NULL,
    documentation double precision DEFAULT 0 NOT NULL,
    other double precision DEFAULT 0 NOT NULL,
    "totalHours" double precision DEFAULT 0 NOT NULL
);


ALTER TABLE public."ReportVersionHours" OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 33305)
-- Name: ReportVersionHours_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ReportVersionHours_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ReportVersionHours_id_seq" OWNER TO postgres;

--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 238
-- Name: ReportVersionHours_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ReportVersionHours_id_seq" OWNED BY public."ReportVersionHours".id;


--
-- TOC entry 233 (class 1259 OID 33264)
-- Name: ReportVersionNextTask; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReportVersionNextTask" (
    id integer NOT NULL,
    "reportVersionId" integer NOT NULL,
    description text,
    "sortOrder" integer NOT NULL,
    "taskName" text NOT NULL
);


ALTER TABLE public."ReportVersionNextTask" OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 33263)
-- Name: ReportVersionNextTask_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ReportVersionNextTask_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ReportVersionNextTask_id_seq" OWNER TO postgres;

--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 232
-- Name: ReportVersionNextTask_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ReportVersionNextTask_id_seq" OWNED BY public."ReportVersionNextTask".id;


--
-- TOC entry 231 (class 1259 OID 33245)
-- Name: ReportVersionTask; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReportVersionTask" (
    id integer NOT NULL,
    "reportVersionId" integer NOT NULL,
    "taskName" text NOT NULL,
    priority public."TaskPriority" NOT NULL,
    "plannedPercentage" double precision NOT NULL,
    "actualPercentage" double precision NOT NULL,
    status public."TaskStatus" NOT NULL,
    "plannedHours" double precision NOT NULL,
    "spentHours" double precision NOT NULL,
    deliverable text,
    "sortOrder" integer NOT NULL
);


ALTER TABLE public."ReportVersionTask" OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 33244)
-- Name: ReportVersionTask_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ReportVersionTask_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ReportVersionTask_id_seq" OWNER TO postgres;

--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 230
-- Name: ReportVersionTask_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ReportVersionTask_id_seq" OWNED BY public."ReportVersionTask".id;


--
-- TOC entry 228 (class 1259 OID 33232)
-- Name: ReportVersion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ReportVersion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ReportVersion_id_seq" OWNER TO postgres;

--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 228
-- Name: ReportVersion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ReportVersion_id_seq" OWNED BY public."ReportVersion".id;


--
-- TOC entry 226 (class 1259 OID 33215)
-- Name: Report_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Report_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Report_id_seq" OWNER TO postgres;

--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 226
-- Name: Report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Report_id_seq" OWNED BY public."Report".id;


--
-- TOC entry 223 (class 1259 OID 33040)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'TEAM_MEMBER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 33039)
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 222
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- TOC entry 221 (class 1259 OID 32889)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 4927 (class 2604 OID 33203)
-- Name: Project id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project" ALTER COLUMN id SET DEFAULT nextval('public."Project_id_seq"'::regclass);


--
-- TOC entry 4930 (class 2604 OID 33219)
-- Name: Report id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Report" ALTER COLUMN id SET DEFAULT nextval('public."Report_id_seq"'::regclass);


--
-- TOC entry 4948 (class 2604 OID 33330)
-- Name: ReportReview id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportReview" ALTER COLUMN id SET DEFAULT nextval('public."ReportReview_id_seq"'::regclass);


--
-- TOC entry 4933 (class 2604 OID 33236)
-- Name: ReportVersion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersion" ALTER COLUMN id SET DEFAULT nextval('public."ReportVersion_id_seq"'::regclass);


--
-- TOC entry 4939 (class 2604 OID 33294)
-- Name: ReportVersionAchievement id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionAchievement" ALTER COLUMN id SET DEFAULT nextval('public."ReportVersionAchievement_id_seq"'::regclass);


--
-- TOC entry 4937 (class 2604 OID 33279)
-- Name: ReportVersionBlocker id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionBlocker" ALTER COLUMN id SET DEFAULT nextval('public."ReportVersionBlocker_id_seq"'::regclass);


--
-- TOC entry 4941 (class 2604 OID 33309)
-- Name: ReportVersionHours id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionHours" ALTER COLUMN id SET DEFAULT nextval('public."ReportVersionHours_id_seq"'::regclass);


--
-- TOC entry 4936 (class 2604 OID 33267)
-- Name: ReportVersionNextTask id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionNextTask" ALTER COLUMN id SET DEFAULT nextval('public."ReportVersionNextTask_id_seq"'::regclass);


--
-- TOC entry 4935 (class 2604 OID 33248)
-- Name: ReportVersionTask id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionTask" ALTER COLUMN id SET DEFAULT nextval('public."ReportVersionTask_id_seq"'::regclass);


--
-- TOC entry 4924 (class 2604 OID 33043)
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- TOC entry 5148 (class 0 OID 33200)
-- Dependencies: 225
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Project" (id, name, description, "isActive", "createdAt", "updatedAt") FROM stdin;
2	Website Redesign	Redesign the public website	t	2026-09-07 09:13:57.4	2026-09-07 09:13:57.4
5	Employee Management System	Internal employee reporting and management system.	t	2026-09-08 11:29:41.563	2026-09-08 11:29:41.563
3	Internal Toling control	Create internal tooling	t	2026-09-07 09:14:40.54	2026-09-08 13:41:55.573
\.


--
-- TOC entry 5150 (class 0 OID 33216)
-- Dependencies: 227
-- Data for Name: Report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Report" (id, "userId", "projectId", "weekStart", "weekEnd", status, "createdAt", "updatedAt") FROM stdin;
10	2	5	2026-09-07 00:00:00	2026-09-13 23:59:59	SUBMITTED	2026-09-08 11:29:41.563	2026-09-08 11:29:41.563
11	3	5	2026-09-07 00:00:00	2026-09-13 23:59:59	NEEDS_CORRECTION	2026-09-08 11:29:41.563	2026-09-08 11:29:41.563
14	4	5	2026-08-31 00:00:00	2026-09-06 23:59:59	APPROVED	2026-09-08 16:00:28.632	2026-09-08 16:00:28.632
15	4	5	2026-08-24 00:00:00	2026-08-30 23:59:59	APPROVED	2026-09-08 16:00:28.632	2026-09-08 16:00:28.632
16	4	5	2026-08-17 00:00:00	2026-08-23 23:59:59	APPROVED	2026-09-08 16:00:28.632	2026-09-08 16:00:28.632
17	4	5	2026-08-10 00:00:00	2026-08-16 23:59:59	APPROVED	2026-09-08 16:00:28.632	2026-09-08 16:00:28.632
18	4	5	2026-09-07 00:00:00	2026-09-13 00:00:00	APPROVED	2026-09-08 10:49:27.852	2026-09-08 12:21:30.901
19	6	3	2026-09-07 00:00:00	2026-09-13 00:00:00	APPROVED	2026-09-10 10:47:53.817	2026-09-10 10:50:14.228
\.


--
-- TOC entry 5164 (class 0 OID 33327)
-- Dependencies: 241
-- Data for Name: ReportReview; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReportReview" (id, "reportId", "reportVersionId", "reviewerId", action, comment, "createdAt") FROM stdin;
6	11	14	1	REQUESTED_CHANGES	Please provide more details about the dashboard progress and update the blocker description.	2026-09-08 11:29:41.563
13	14	21	1	REQUESTED_CHANGES	Please complete schema modeling before marking seed tasks.	2026-09-08 16:00:28.632
14	14	22	1	APPROVED	Good update. Approved.	2026-09-08 16:00:28.632
15	15	23	1	REQUESTED_CHANGES	Please elaborate on entity relationships in the document.	2026-09-08 16:00:28.632
16	15	24	1	APPROVED	Looks complete now. Approved.	2026-09-08 16:00:28.632
17	16	25	1	REQUESTED_CHANGES	Need clarification on non-functional requirements.	2026-09-08 16:00:28.632
18	16	26	1	APPROVED	SRS looks clear now. Approved.	2026-09-08 16:00:28.632
19	17	27	1	REQUESTED_CHANGES	Please add next week tasks plan before submitting.	2026-09-08 16:00:28.632
20	17	28	1	APPROVED	Approved. Good start.	2026-09-08 16:00:28.632
21	18	29	1	APPROVED	Well done, All good	2026-09-08 12:21:30.891
22	19	30	1	REQUESTED_CHANGES	add another blocker	2026-09-10 10:49:00.585
23	19	31	1	APPROVED	all is good	2026-09-10 10:50:14.147
\.


--
-- TOC entry 5152 (class 0 OID 33233)
-- Dependencies: 229
-- Data for Name: ReportVersion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReportVersion" (id, "reportId", "versionNumber", "submittedAt", "createdAt") FROM stdin;
13	10	1	2026-09-08 09:00:00	2026-09-08 11:29:41.563
14	11	1	2026-09-08 10:00:00	2026-09-08 11:29:41.563
21	14	1	2026-09-01 09:00:00	2026-09-08 16:00:28.632
22	14	2	2026-09-02 11:00:00	2026-09-08 16:00:28.632
23	15	1	2026-08-25 09:30:00	2026-09-08 16:00:28.632
24	15	2	2026-08-26 14:00:00	2026-09-08 16:00:28.632
25	16	1	2026-08-18 10:00:00	2026-09-08 16:00:28.632
26	16	2	2026-08-19 16:30:00	2026-09-08 16:00:28.632
27	17	1	2026-08-11 08:30:00	2026-09-08 16:00:28.632
28	17	2	2026-08-12 10:00:00	2026-09-08 16:00:28.632
29	18	1	2026-09-08 12:20:51.377	2026-09-08 10:49:27.856
30	19	1	2026-09-10 10:48:13.759	2026-09-10 10:47:53.905
31	19	2	2026-09-10 10:49:52.709	2026-09-10 10:49:00.446
\.


--
-- TOC entry 5160 (class 0 OID 33291)
-- Dependencies: 237
-- Data for Name: ReportVersionAchievement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReportVersionAchievement" (id, "reportVersionId", description, "isKeyAchievement", "sortOrder") FROM stdin;
22	13	Completed JWT authentication implementation.	t	1
23	13	Completed initial API documentation.	f	2
24	14	Completed the initial weekly report UI.	t	1
33	22	Successfully migrated initial database models.	t	1
34	24	Finalized architecture database design.	t	1
35	26	Completed stakeholder requirement sign-off.	t	1
36	28	Environment setup completed successfully.	t	1
37	29	Completed the initial dashboard implementation	t	0
38	30	Completed the initial dashboard implementation	f	0
39	31	Completed the initial dashboard implementation	f	0
\.


--
-- TOC entry 5158 (class 0 OID 33276)
-- Dependencies: 235
-- Data for Name: ReportVersionBlocker; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReportVersionBlocker" (id, "reportVersionId", description, "isKeyIssue", "sortOrder") FROM stdin;
22	13	Waiting for final API requirements from the project team.	t	1
23	14	Dashboard API response format is still being finalized.	t	1
29	29	Waiting for production API credentials	f	0
30	30	Waiting for production API credentials	f	0
31	30	waiting for dashboard api	f	1
32	31	Waiting for production API credentials	f	0
33	31	waiting for dashboard api	f	1
34	31	Test blocker	f	2
\.


--
-- TOC entry 5162 (class 0 OID 33306)
-- Dependencies: 239
-- Data for Name: ReportVersionHours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReportVersionHours" (id, "reportVersionId", development, testing, meetings, documentation, other, "totalHours") FROM stdin;
16	13	12	3	2	3.5	1	21.5
17	14	10	2	2	1.5	0.5	16
22	21	12	2	2	1	0	17
23	22	14	3	1.5	1	0	19.5
24	23	8	1	2	2	0	13
25	24	10	1	2	4	0	17
26	25	4	0	5	5	0	14
27	26	4	0	6	7	0	17
28	27	4	0	3	1	2	10
29	28	6	0	3	1	2	12
30	29	15	2	1	1	1	20
31	30	10	6	6	1	0	23
32	31	10	6	6	1	0	109
\.


--
-- TOC entry 5156 (class 0 OID 33264)
-- Dependencies: 233
-- Data for Name: ReportVersionNextTask; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReportVersionNextTask" (id, "reportVersionId", description, "sortOrder", "taskName") FROM stdin;
26	13	Finish remaining CRUD operations and validation.	1	Complete user management module
27	13	Implement ADMIN and TEAM_MEMBER authorization.	2	Add role based authorization
28	13	Standardize API error responses.	3	Improve API error handling
29	14	Complete remaining dashboard components.	1	Finish dashboard implementation
30	14	Integrate report submission and retrieval APIs.	2	Connect frontend to report APIs
40	21	Fix relation constraints and indices	1	Complete DB schema
41	22	JWT tokens and middleware	1	Implement authentication API
42	28	Prepare questions for stakeholders	1	Start requirement gathering
43	29	Add integration and UI tests	0	Complete dashboard testing
44	30	Add integration and UI tests	0	Complete dashboard testing
45	31	Add integration and UI tests	0	Complete dashboard testing
\.


--
-- TOC entry 5154 (class 0 OID 33245)
-- Dependencies: 231
-- Data for Name: ReportVersionTask; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReportVersionTask" (id, "reportVersionId", "taskName", priority, "plannedPercentage", "actualPercentage", status, "plannedHours", "spentHours", deliverable, "sortOrder") FROM stdin;
30	13	Implement authentication API	HIGH	40	40	COMPLETED	8	8.5	JWT based authentication endpoints	1
31	13	Create user management endpoints	HIGH	30	25	IN_PROGRESS	6	5	CRUD APIs for users	2
32	13	Write API documentation	MEDIUM	20	20	COMPLETED	4	3.5	Swagger API documentation	3
33	14	Design dashboard UI	HIGH	50	40	IN_PROGRESS	10	8	Dashboard wireframes	1
34	14	Implement report form	HIGH	30	30	COMPLETED	6	6	Weekly report form	2
43	21	Setup Prisma ORM models	HIGH	50	40	IN_PROGRESS	10	9	Database Schema	1
44	21	Draft database seed script	MEDIUM	50	50	COMPLETED	8	8	Initial SQL seeds	2
45	22	Setup Prisma ORM models	HIGH	50	50	COMPLETED	10	11	Final Prisma Schema	1
46	22	Draft database seed script	MEDIUM	50	50	COMPLETED	8	8	Tested SQL seeds	2
47	23	Design ER diagram	HIGH	100	70	IN_PROGRESS	12	10	Draft ER diagram	1
48	24	Design ER diagram	HIGH	100	100	COMPLETED	12	13	Final ER diagram PDF	1
49	25	System requirement gathering	HIGH	100	80	IN_PROGRESS	15	12	SRS Document draft	1
50	26	System requirement gathering	HIGH	100	100	COMPLETED	15	15	Approved SRS Document	1
51	27	Initial project onboarding & setup	MEDIUM	100	90	IN_PROGRESS	10	8	Dev environment setup	1
52	28	Initial project onboarding & setup	MEDIUM	100	100	COMPLETED	10	10	Dev environment fully configured	1
53	29	Updated Implement project dashboard	MEDIUM	10	90	IN_PROGRESS	20	20	Changed Dashboard API and UI	0
54	30	Updated Implement project dashboard	MEDIUM	100	90	NOT_STARTED	10	8	Changed Dashboard API and UI	0
55	31	Updated Implement project dashboard	MEDIUM	100	90	NOT_STARTED	10	8	Changed Dashboard API and UI	0
\.


--
-- TOC entry 5146 (class 0 OID 33040)
-- Dependencies: 223
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt") FROM stdin;
1	admin123	admin@example.com	$2b$12$1PReM/FGeQH7AHMs5QtmBeiNy5s2B5xp0.UGxIZg1DwytG2zdFZQe	ADMIN	2026-09-06 11:14:14.41	2026-09-06 11:14:14.41
2	John Doe	john@example.com	$2b$12$q45opV1t6D2g52RpvSOc6egHpkLn8l691IVorBQ.JxKgBoCYIUmz2	TEAM_MEMBER	2026-09-06 11:23:58.253	2026-09-06 11:23:58.253
3	Akhila Sanjeewa	akhila@example.com	$2b$12$EiOadZIiWY1CetNQ..VZBe5FzOFZayiK..PS5jO4rwfCHTJI0mWZy	TEAM_MEMBER	2026-09-06 11:28:05.03	2026-09-06 11:28:05.03
4	Amaya Irangi	amaya@gmail.com	$2b$12$Qz8848hU/uPyMH/lNt1c6eRvcs/ObCsUgLMq1ptZXPBj8DB9TU.vm	TEAM_MEMBER	2026-09-06 15:31:55.957	2026-09-06 15:31:55.957
5	Asela Maduwantha	aselamaduwantha@gmail.com	$2b$12$Vfdoi5Q7VM7.OhXLfVfRB.NFIYKy3W2MMhqh/ACcRqZILZ5AjOd1a	TEAM_MEMBER	2026-09-08 11:42:19.144	2026-09-08 11:42:19.144
6	sanjeewa akila	sanjeewa@example.com	$2b$12$X2/iS8VYuSqBEnD4LRvp/.dzsBaAQYcK9znt8M4Rbs49QEqJzpO1W	TEAM_MEMBER	2026-09-10 10:45:52.283	2026-09-10 10:45:52.283
\.


--
-- TOC entry 5144 (class 0 OID 32889)
-- Dependencies: 221
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b231a434-9021-4917-b328-9f2ebc8b3dfc	a381ce3f757f35d6db9b9eac77540027cb51fddb9ef6e9ce43728a0c744bcaab	2026-09-06 14:13:23.614249+05:30	20260906084037_init	\N	\N	2026-09-06 14:13:23.6039+05:30	1
610a9050-5992-4bb6-9c9f-ed717070e9f8	8b8a2845cd8eef2bab90cdde6bc212a1e650aae64b2c83892988175607eb5d83	2026-09-06 14:21:04.855798+05:30	20260906085104_add_post	\N	\N	2026-09-06 14:21:04.830264+05:30	1
c5572694-ff5d-47cf-bdd6-cc33d3eba2f8	49caa6d2b455a903f95c77456cce6edf956185c0129330b8da8cb4544cfb7b94	2026-09-06 15:35:44.458132+05:30	20260906100544_update_user	\N	\N	2026-09-06 15:35:44.436266+05:30	1
acfa34df-7f65-404f-990c-6d10d7cdc607	9c34b00634f1ed07e7eeeac1f6ca09aa68dea433c4b142da41b6b3f8a2fca8d8	2026-09-07 13:52:01.567847+05:30	20260907082201_add_reports	\N	\N	2026-09-07 13:52:01.476381+05:30	1
079ec370-69e1-4614-8492-de8a70482338	8cc59e06de798274211fe7e62f67efb3a059a33c7d81814bc52103ad8963444a	2026-09-07 17:08:40.611448+05:30	20260907113609_change_next_week_tasks_to_rows	\N	\N	2026-09-07 17:08:40.595947+05:30	1
\.


--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 224
-- Name: Project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Project_id_seq"', 9, true);


--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 240
-- Name: ReportReview_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ReportReview_id_seq"', 23, true);


--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 236
-- Name: ReportVersionAchievement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ReportVersionAchievement_id_seq"', 39, true);


--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 234
-- Name: ReportVersionBlocker_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ReportVersionBlocker_id_seq"', 34, true);


--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 238
-- Name: ReportVersionHours_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ReportVersionHours_id_seq"', 32, true);


--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 232
-- Name: ReportVersionNextTask_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ReportVersionNextTask_id_seq"', 45, true);


--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 230
-- Name: ReportVersionTask_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ReportVersionTask_id_seq"', 55, true);


--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 228
-- Name: ReportVersion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ReportVersion_id_seq"', 31, true);


--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 226
-- Name: Report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Report_id_seq"', 19, true);


--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 222
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 6, true);


--
-- TOC entry 4957 (class 2606 OID 33214)
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- TOC entry 4983 (class 2606 OID 33341)
-- Name: ReportReview ReportReview_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportReview"
    ADD CONSTRAINT "ReportReview_pkey" PRIMARY KEY (id);


--
-- TOC entry 4977 (class 2606 OID 33304)
-- Name: ReportVersionAchievement ReportVersionAchievement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionAchievement"
    ADD CONSTRAINT "ReportVersionAchievement_pkey" PRIMARY KEY (id);


--
-- TOC entry 4974 (class 2606 OID 33289)
-- Name: ReportVersionBlocker ReportVersionBlocker_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionBlocker"
    ADD CONSTRAINT "ReportVersionBlocker_pkey" PRIMARY KEY (id);


--
-- TOC entry 4980 (class 2606 OID 33325)
-- Name: ReportVersionHours ReportVersionHours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionHours"
    ADD CONSTRAINT "ReportVersionHours_pkey" PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 33274)
-- Name: ReportVersionNextTask ReportVersionNextTask_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionNextTask"
    ADD CONSTRAINT "ReportVersionNextTask_pkey" PRIMARY KEY (id);


--
-- TOC entry 4968 (class 2606 OID 33262)
-- Name: ReportVersionTask ReportVersionTask_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionTask"
    ADD CONSTRAINT "ReportVersionTask_pkey" PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 33243)
-- Name: ReportVersion ReportVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersion"
    ADD CONSTRAINT "ReportVersion_pkey" PRIMARY KEY (id);


--
-- TOC entry 4959 (class 2606 OID 33231)
-- Name: Report Report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_pkey" PRIMARY KEY (id);


--
-- TOC entry 4954 (class 2606 OID 33056)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 32902)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 1259 OID 33342)
-- Name: Project_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Project_name_key" ON public."Project" USING btree (name);


--
-- TOC entry 4984 (class 1259 OID 33353)
-- Name: ReportReview_reportId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReportReview_reportId_idx" ON public."ReportReview" USING btree ("reportId");


--
-- TOC entry 4985 (class 1259 OID 33354)
-- Name: ReportReview_reportVersionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReportReview_reportVersionId_idx" ON public."ReportReview" USING btree ("reportVersionId");


--
-- TOC entry 4978 (class 1259 OID 33351)
-- Name: ReportVersionAchievement_reportVersionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReportVersionAchievement_reportVersionId_idx" ON public."ReportVersionAchievement" USING btree ("reportVersionId");


--
-- TOC entry 4975 (class 1259 OID 33350)
-- Name: ReportVersionBlocker_reportVersionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReportVersionBlocker_reportVersionId_idx" ON public."ReportVersionBlocker" USING btree ("reportVersionId");


--
-- TOC entry 4981 (class 1259 OID 33352)
-- Name: ReportVersionHours_reportVersionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ReportVersionHours_reportVersionId_key" ON public."ReportVersionHours" USING btree ("reportVersionId");


--
-- TOC entry 4972 (class 1259 OID 35217)
-- Name: ReportVersionNextTask_reportVersionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReportVersionNextTask_reportVersionId_idx" ON public."ReportVersionNextTask" USING btree ("reportVersionId");


--
-- TOC entry 4969 (class 1259 OID 33348)
-- Name: ReportVersionTask_reportVersionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReportVersionTask_reportVersionId_idx" ON public."ReportVersionTask" USING btree ("reportVersionId");


--
-- TOC entry 4966 (class 1259 OID 33347)
-- Name: ReportVersion_reportId_versionNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ReportVersion_reportId_versionNumber_key" ON public."ReportVersion" USING btree ("reportId", "versionNumber");


--
-- TOC entry 4960 (class 1259 OID 33344)
-- Name: Report_projectId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Report_projectId_idx" ON public."Report" USING btree ("projectId");


--
-- TOC entry 4961 (class 1259 OID 33343)
-- Name: Report_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Report_status_idx" ON public."Report" USING btree (status);


--
-- TOC entry 4962 (class 1259 OID 33346)
-- Name: Report_userId_weekStart_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Report_userId_weekStart_key" ON public."Report" USING btree ("userId", "weekStart");


--
-- TOC entry 4963 (class 1259 OID 33345)
-- Name: Report_weekStart_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Report_weekStart_idx" ON public."Report" USING btree ("weekStart");


--
-- TOC entry 4952 (class 1259 OID 33057)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 4994 (class 2606 OID 33395)
-- Name: ReportReview ReportReview_reportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportReview"
    ADD CONSTRAINT "ReportReview_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES public."Report"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4995 (class 2606 OID 33400)
-- Name: ReportReview ReportReview_reportVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportReview"
    ADD CONSTRAINT "ReportReview_reportVersionId_fkey" FOREIGN KEY ("reportVersionId") REFERENCES public."ReportVersion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4996 (class 2606 OID 33405)
-- Name: ReportReview ReportReview_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportReview"
    ADD CONSTRAINT "ReportReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4992 (class 2606 OID 33385)
-- Name: ReportVersionAchievement ReportVersionAchievement_reportVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionAchievement"
    ADD CONSTRAINT "ReportVersionAchievement_reportVersionId_fkey" FOREIGN KEY ("reportVersionId") REFERENCES public."ReportVersion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4991 (class 2606 OID 33380)
-- Name: ReportVersionBlocker ReportVersionBlocker_reportVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionBlocker"
    ADD CONSTRAINT "ReportVersionBlocker_reportVersionId_fkey" FOREIGN KEY ("reportVersionId") REFERENCES public."ReportVersion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4993 (class 2606 OID 33390)
-- Name: ReportVersionHours ReportVersionHours_reportVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionHours"
    ADD CONSTRAINT "ReportVersionHours_reportVersionId_fkey" FOREIGN KEY ("reportVersionId") REFERENCES public."ReportVersion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4990 (class 2606 OID 33375)
-- Name: ReportVersionNextTask ReportVersionNextTask_reportVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionNextTask"
    ADD CONSTRAINT "ReportVersionNextTask_reportVersionId_fkey" FOREIGN KEY ("reportVersionId") REFERENCES public."ReportVersion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4989 (class 2606 OID 33370)
-- Name: ReportVersionTask ReportVersionTask_reportVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersionTask"
    ADD CONSTRAINT "ReportVersionTask_reportVersionId_fkey" FOREIGN KEY ("reportVersionId") REFERENCES public."ReportVersion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4988 (class 2606 OID 33365)
-- Name: ReportVersion ReportVersion_reportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReportVersion"
    ADD CONSTRAINT "ReportVersion_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES public."Report"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4986 (class 2606 OID 33360)
-- Name: Report Report_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4987 (class 2606 OID 33355)
-- Name: Report Report_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-09-10 17:16:05

--
-- PostgreSQL database dump complete
--

\unrestrict IsAQi1VdpHV2HiJACm8JekP8NPfiur65JFYrRq9ZX4CLLqYx1sQfRNLE6WeUKq5

