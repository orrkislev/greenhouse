--
-- PostgreSQL database dump
--

\restrict vVReRzkvvqfZNwnYRNJwfqoGUNbU8glTcAQ0weYOlnjsrzc9ZX8OIsVxiPTQa9S

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, first_name, role, last_name, is_admin, active) FROM stdin;
98773a61-7921-4bb5-a623-8a7ce8281ca0	tal	טל	staff	מוזס	t	t
44cd7c4b-5872-46ac-a5c2-4017a7a8e135	demo3	גרטרוד	student	גלדיולה	f	t
1a3ca980-68ff-4b0b-bf90-5e2c60ac525c	demo1	ברק	student	בטטי	f	t
1a141c9f-7b7b-4f77-8b89-7489e4b5917a	demo4	דושאן	student	דשא	f	t
f512190e-e467-4dc4-b6f4-7d0794713c94	demo5	הרמן	student	הר-דוף	f	t
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, title, student_id, status, metadata, created_at, updated_at, term, master) FROM stdin;
\.


--
-- Data for Name: research; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.research (id, title, student_id, status, metadata, created_at, updated_at, sections, "docUrl", term) FROM stdin;
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log (id, updating_user, "timestamp", entity_type, project_id, student_id, research_id, new_data, old_data, changed_fields, metadata, created_at) FROM stdin;
63943767-bf41-4409-9563-8cf0c0e8688b	1a3ca980-68ff-4b0b-bf90-5e2c60ac525c	2026-04-29 10:54:25.280183+00	report_card	\N	1a3ca980-68ff-4b0b-bf90-5e2c60ac525c	\N	{"id": "1a3ca980-68ff-4b0b-bf90-5e2c60ac525c", "liba": null, "ikigai": null, "mentors": null, "special": null, "learning": {"generalTopics": [{"name": "אנגלית", "detail": "", "locked": true, "rating": 3, "keyTopic": true, "application": ""}, {"name": "פרזנטציה", "detail": "תכנון מצגת, הכנת חומרים, עמידה מול קהל, העברת מסרים", "locked": true, "rating": 4, "keyTopic": true, "application": ""}, {"name": "שפה", "detail": "", "locked": true, "rating": 5, "keyTopic": true, "application": ""}], "heutagogySkills": [{"name": "למידה עצמאית", "detail": "הצבת מטרות אישיות, תכנון מה ללמוד והובלת תהליך באופן עצמאי", "rating": 1}, {"name": "למידה שיתופית", "detail": "שיתוף ידע עם אחרים ולמידה הדדית בתוך קבוצה", "rating": 2}, {"name": "ניהול זמן בלמידה", "detail": "חלוקת משימות ללוחות זמנים מציאותיים והתמדה לאורך זמן", "rating": 3}, {"name": "", "detail": "", "rating": null}, {"name": "", "detail": "", "rating": null}], "professionalTopics": [{"name": "תכנות בסיסי", "detail": "כתבתי פירוט חדש לתכנות בסיסי", "rating": 1, "application": "עדות תכנות בסיסי"}, {"name": "Scratch", "detail": "מבוא תכנות בשפה ויזואלית", "rating": 2, "application": ""}]}, "vocation": null}	\N	{created}	{}	2026-04-29 10:54:25.280183+00
a6982850-3aa1-4723-b907-428b50f7e3bc	1a3ca980-68ff-4b0b-bf90-5e2c60ac525c	2026-04-30 10:10:56.380588+00	report_card	\N	1a3ca980-68ff-4b0b-bf90-5e2c60ac525c	\N	{"id": "1a3ca980-68ff-4b0b-bf90-5e2c60ac525c", "liba": null, "ikigai": null, "mentors": null, "special": null, "learning": {"generalTopics": [{"name": "אנגלית", "detail": "", "locked": true, "rating": 3, "keyTopic": true, "application": ""}, {"name": "פרזנטציה", "detail": "תכנון מצגת, הכנת חומרים, עמידה מול קהל, העברת מסרים", "locked": true, "rating": 4, "keyTopic": true, "application": ""}, {"name": "שפה", "detail": "", "locked": true, "rating": 5, "keyTopic": true, "application": ""}], "heutagogySkills": [{"name": "למידה עצמאית", "detail": "הצבת מטרות אישיות, תכנון מה ללמוד והובלת תהליך באופן עצמאי", "rating": 1}, {"name": "למידה שיתופית", "detail": "שיתוף ידע עם אחרים ולמידה הדדית בתוך קבוצה", "rating": 2}, {"name": "ניהול זמן בלמידה", "detail": "חלוקת משימות ללוחות זמנים מציאותיים והתמדה לאורך זמן", "rating": 3}, {"name": "", "detail": "", "rating": null}, {"name": "", "detail": "", "rating": null}], "professionalTopics": [{"name": "תכנות בסיסי", "detail": "כתבתי פירוט חדש לתכנות בסיסי", "rating": 1, "application": "עדות תכנות בסיסי"}, {"name": "Scratch", "detail": "מבוא תכנות בשפה ויזואלית", "rating": 2, "application": ""}]}, "vocation": null, "report_semester": "2026B"}	\N	{created}	{}	2026-04-30 10:10:56.380588+00
dc38ede3-6adf-477e-ae04-02113b87cb57	98773a61-7921-4bb5-a623-8a7ce8281ca0	2026-04-30 10:11:25.574637+00	report_card	\N	1a3ca980-68ff-4b0b-bf90-5e2c60ac525c	\N	{"id": "1a3ca980-68ff-4b0b-bf90-5e2c60ac525c", "liba": null, "ikigai": null, "mentors": null, "special": null, "learning": {"generalTopics": [{"name": "אנגלית", "detail": "", "locked": true, "rating": 3, "keyTopic": true, "application": ""}, {"name": "פרזנטציה", "detail": "תכנון מצגת, הכנת חומרים, עמידה מול קהל, העברת מסרים", "locked": true, "rating": 4, "keyTopic": true, "application": ""}, {"name": "שפה", "detail": "", "locked": true, "rating": 5, "keyTopic": true, "application": ""}], "heutagogySkills": [{"name": "למידה עצמאית", "detail": "הצבת מטרות אישיות, תכנון מה ללמוד והובלת תהליך באופן עצמאי", "rating": 1}, {"name": "למידה שיתופית", "detail": "שיתוף ידע עם אחרים ולמידה הדדית בתוך קבוצה", "rating": 2}, {"name": "ניהול זמן בלמידה", "detail": "חלוקת משימות ללוחות זמנים מציאותיים והתמדה לאורך זמן", "rating": 3}, {"name": "", "detail": "", "rating": null}, {"name": "", "detail": "", "rating": null}], "professionalTopics": [{"name": "תכנות בסיסי", "detail": "הערכת תכנות בסיסי לסמסטר ב", "rating": 1, "application": "עדות תכנות בסיסי"}, {"name": "Scratch", "detail": "מבוא תכנות בשפה ויזואלית", "rating": 2, "application": ""}]}, "vocation": null, "report_semester": "2026B"}	{"id": "1a3ca980-68ff-4b0b-bf90-5e2c60ac525c", "liba": null, "ikigai": null, "mentors": null, "special": null, "learning": {"generalTopics": [{"name": "אנגלית", "detail": "", "locked": true, "rating": 3, "keyTopic": true, "application": ""}, {"name": "פרזנטציה", "detail": "תכנון מצגת, הכנת חומרים, עמידה מול קהל, העברת מסרים", "locked": true, "rating": 4, "keyTopic": true, "application": ""}, {"name": "שפה", "detail": "", "locked": true, "rating": 5, "keyTopic": true, "application": ""}], "heutagogySkills": [{"name": "למידה עצמאית", "detail": "הצבת מטרות אישיות, תכנון מה ללמוד והובלת תהליך באופן עצמאי", "rating": 1}, {"name": "למידה שיתופית", "detail": "שיתוף ידע עם אחרים ולמידה הדדית בתוך קבוצה", "rating": 2}, {"name": "ניהול זמן בלמידה", "detail": "חלוקת משימות ללוחות זמנים מציאותיים והתמדה לאורך זמן", "rating": 3}, {"name": "", "detail": "", "rating": null}, {"name": "", "detail": "", "rating": null}], "professionalTopics": [{"name": "תכנות בסיסי", "detail": "כתבתי פירוט חדש לתכנות בסיסי", "rating": 1, "application": "עדות תכנות בסיסי"}, {"name": "Scratch", "detail": "מבוא תכנות בשפה ויזואלית", "rating": 2, "application": ""}]}, "vocation": null, "report_semester": "2026B"}	{learning}	{}	2026-04-30 10:11:25.574637+00
4ce9f757-3c6c-498e-af60-07e4d71d1e75	98773a61-7921-4bb5-a623-8a7ce8281ca0	2026-04-30 10:12:29.087049+00	report_card	\N	98773a61-7921-4bb5-a623-8a7ce8281ca0	\N	{"id": "98773a61-7921-4bb5-a623-8a7ce8281ca0", "liba": null, "ikigai": null, "mentors": null, "special": null, "learning": null, "vocation": null, "report_semester": "2026B"}	\N	{created}	{}	2026-04-30 10:12:29.087049+00
e894d1e0-b677-4d51-aa64-4553bb0ccb69	98773a61-7921-4bb5-a623-8a7ce8281ca0	2026-04-30 10:13:06.979259+00	report_card	\N	98773a61-7921-4bb5-a623-8a7ce8281ca0	\N	{"id": "98773a61-7921-4bb5-a623-8a7ce8281ca0", "liba": null, "ikigai": null, "mentors": null, "special": null, "learning": {"generalTopics": [{"name": "אנגלית", "detail": "", "locked": true, "rating": null, "keyTopic": true, "application": ""}, {"name": "פרזנטציה", "detail": "תכנון מצגת, הכנת חומרים, עמידה מול קהל, העברת מסרים", "locked": true, "rating": null, "keyTopic": true, "application": ""}, {"name": "שפה", "detail": "", "locked": true, "rating": null, "keyTopic": true, "application": ""}], "heutagogySkills": [{"name": "", "detail": "", "rating": null}, {"name": "", "detail": "", "rating": null}, {"name": "", "detail": "", "rating": null}, {"name": "", "detail": "", "rating": null}, {"name": "", "detail": "", "rating": null}], "professionalTopics": [{"name": "Scratch", "detail": "מבוא תכנות בשפה ויזואלית", "rating": 5, "application": "משחק סיימון"}]}, "vocation": null, "report_semester": "2026B"}	{"id": "98773a61-7921-4bb5-a623-8a7ce8281ca0", "liba": null, "ikigai": null, "mentors": null, "special": null, "learning": null, "vocation": null, "report_semester": "2026B"}	{learning}	{}	2026-04-30 10:13:06.979259+00
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (id, name, type, description, metadata, message) FROM stdin;
0afe01f3-2525-42a1-a5f4-ebea2185786b	לימוד	club	\N	{}	
0d23fd64-4886-4141-af4e-ff11e98db4f9	לימוד	club	\N	{}	\N
0dbb97dc-213e-418b-92bf-2739c9eb3208	מיוזיקל	club	\N	{}	\N
14e269d0-e076-4f03-aa97-0bbb43ba101f	לימוד	club	\N	{}	\N
15a34da2-5e97-4519-a2a1-a7aa0421014a	לימוד	club	\N	{}	\N
2a2002ef-bd6c-475c-aed5-789cf64ba9ae	צילום	club	\N	{}	\N
370ff691-37c6-4851-91a5-ac49c823f2c5	הייטק	major	\N	{}	<p>\t\t\t\t</p>
3dc5deff-c02e-45c3-a780-7e3386c60a74	לימוד	club	\N	{}	\N
3fd36090-c902-4113-9d55-0e1c61698719	המשחק "what how wow"	club	\N	{}	\N
3fef4daf-ff98-437d-b8dd-18bb0b33ded1	לימוד	club	\N	{}	\N
446e51d9-2552-4f01-82ae-e16370a0687a	לימוד	club	\N	{}	\N
45bb8269-4c7c-4b88-b64b-850c9566b000	לימוד	club	\N	{}	\N
4a6f3eda-35bf-4120-bf5a-f9334aa693a5	לימוד	club	\N	{}	\N
4c717177-6773-4a7d-82ef-9ff018c9a583	כל הסטודנטים.ות	club	\N	{}	<p><span class="ql-size-large">הי לכולם. </span></p><p>מוכנים לבחינות סוף סמסטר?</p><p>בכל יום שלישי, אני מפנה זמן לשבת איתכם. מוזמנים לקבוע. </p><p>שבו איתי לכתוב בתעודה כמה מילים על הלימודים באופ</p>
53349735-c873-41a3-9a30-2ded3e6a4f59	לימוד	club	\N	{}	\N
563f8448-bfaa-4753-a7bd-7f562c3e03bd	לימוד	club	\N	{}	\N
5e196dd7-face-450c-a32d-98aba4e0470b	הסרט	club	\N	{}	\N
60615bab-f00c-4673-a67c-0402c99e6ac9	קורס ראשון באופ	club	\N	{}	<p><span class="ql-size-large">היוש. צריך להגיש את ממן 14 . נפגש ביום ראשון.  25.1.26 12:00-13:30</span></p>
6a1c6c58-9b6c-4b4b-950c-71f7c7a51815	לימוד	club	\N	{}	\N
6f2c9b3f-7083-43a4-9641-9c7abb1b7690	אמנויות לחימה	club	\N	{}	<p>עשיתם כבר טאי צ'י היום?</p>
77d70aa1-c75b-4e4d-a4b5-cb91b7a3ec16	רובוטיקה	club	\N	{}	\N
8a68ba3d-531c-43cf-a429-f6bb3e3c7dad	לימוד	club	\N	{}	\N
a090a91f-227e-4bf2-8cc8-2c779f758377	לימוד	club	\N	{}	\N
a6026479-894a-47c0-9456-36d103aba693	GenAI	club	\N	{}	\N
ad89d55f-821f-497b-b6ad-3cc445557a82	סטודיו חממת האומנים 	club	\N	{}	\N
bbce7b8d-c021-40b8-b9eb-29f4f8fc3a23	שירות משמעותי יא	club	\N	{}	<p>יוצאים לצו ראשון יחד. נפגשים ביום שלישי 24/2 ב-6:30 בשער בית הספר. לא לשכוח להביא תעודה מזהה, טופס רפואי חתום, ועותקים מודפסים של הטפסים שהעליתם לאתר מתגייסים. עדית תלווה אתכם במהלך כל היום</p>
be39f3a0-8ef4-454f-9665-9a4ad5602fd4	לימוד	club	\N	{}	\N
ca69d71a-eff7-49ef-ba4a-5a5fe77e8e7e	עיצוב	major	\N	{}	<p><br></p>
fbaf9503-405d-4849-b487-fff180f3a895	הפקה	major	\N	{}	<p>הזדמנות אחרונה להגיש את הסרטונים</p>
064037f7-678b-4ea9-b257-4c9271503215	בטטה	class	4	{}	<p><br></p>
13e50b43-6501-4b24-96ea-1d021d9165aa	הרדוף	class	1	{}	<p><br></p>
812f6dca-07dc-49be-b5d4-f9c5d1eece2a	דשא	class	2	{}	<p>נשארו שבועיים לסיום הפרויקט!</p>
e58d93b9-bfa4-4271-95e5-53c4e4fcf838	גלדיולה	class	3	{}	<p><br></p>
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, title, start, "end", created_by, metadata, created_at, updated_at, day_of_the_week, date, group_id) FROM stdin;
\.


--
-- Data for Name: event_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_participants (event_id, user_id, role, created_at) FROM stdin;
\.


--
-- Data for Name: links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.links (id, a_table, a_id, b_table, b_id, metadata, last_check) FROM stdin;
\.


--
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs (id, user_id, action_type, text, metadata, created_at, updated_at, mentor_id, context_table, context_id) FROM stdin;
\.


--
-- Data for Name: mentorships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mentorships (id, mentor_id, student_id, subject, description, is_active, started_at, ended_at, metadata, created_at, updated_at) FROM stdin;
4d84eb2e-8868-4c65-836a-6382ab8cf7d7	98773a61-7921-4bb5-a623-8a7ce8281ca0	1a141c9f-7b7b-4f77-8b89-7489e4b5917a	הנחייה חדשה	\N	t	2026-04-29 07:29:28.413825+00	\N	{}	2026-04-29 07:29:28.413825+00	2026-04-29 07:29:28.413825+00
\.


--
-- Data for Name: misc; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.misc (id, name, data) FROM stdin;
98a43bb2-9639-465b-95a9-f377b20e9ddb	study_groups	{"study_groups": [{"day": "2", "title": "9:00 : קריאה וכתיבה אקדמית", "content": "מרכז שפה"}, {"day": "2", "title": "12:00 : קפוארה", "content": "עם ברק, חדר גוף"}, {"day": "2", "title": "11:40 : מבוכים ודרקונים", "content": "עם שלו במרכז הלמידה"}, {"day": "1", "title": "11:30 : סטודיו לתוכנה ", "content": "הכשרות מייקרס"}, {"day": 4, "title": "12:00 : רובוטיקה", "content": "חדר רובוטיקה"}, {"day": 4, "title": "11:00 : עמידות ידיים", "content": "עם ברק"}, {"day": 4, "title": "11:30 : ג׳אז", "content": "עם יוני בחדר מוזיקה"}, {"day": "0", "title": "11:30 : אנסמבל", "content": "חדר תיאטרון"}, {"day": "2", "title": "12:00 : צילום סטילס", "content": "עם שי בחדר תיאטרון"}, {"day": "1", "title": "11:30 : שיעור תחפושות", "content": "הכשרות מייקרס"}, {"day": "2", "title": "7:45 : כשפות מים", "content": "עם אמרי"}, {"day": "3", "title": "12:00 : עיצוב אתרים", "content": "עם ירון בחדר גרניום"}, {"day": 4, "title": "12:00 : יוגה", "content": "עם ברק"}]}
c07404ca-ec62-4756-a467-cdae92aa8e2e	studySideContext	{"data": [{"url": "https://www.coursera.org/learn/learning-how-to-learn", "name": "ללמוד איך ללמוד", "text": "קורס טוב (באנגלית)"}, {"url": "https://serendipity-engine.vercel.app/interdisciplinary", "name": "מחבר התחומים", "text": "משהו מגניב שאור עשה"}, {"url": "https://tmp147.my.canva.site/dagoxbr0aus", "name": "מה אני רוצה להיות", "text": "תכניות לימודים מגוונות"}, {"url": "https://chatgpt.com/g/g-Z6TeNPBAB-zvrz", "name": "ז׳ורז׳ המאסטר המלאכותי", "text": "AI!!!"}, {"url": "https://learnyourway.withgoogle.com/", "name": "Learn Your Way", "text": ""}]}
ca8ef88f-6486-44f5-b65c-7901cdf550bb	school_message	{"text": "<p>תיהנו <strong>ביום המגמה</strong>! </p><p>בהצלחה לכל מי שיוצא ל<strong>צו ראשון</strong> השבוע</p><p>השבוע יהיה <strong>תרגיל</strong> רעידת אדמה.</p><p><br></p><p><strong>פורים</strong> מתקרב!</p><p>המסע<strong> פולין</strong> מתקרב!</p><p><br></p><p>בהצלחה ל<strong>קבוצת הרובוטיקה</strong> בתחרות השבוע</p><p><br></p><p>וכל הכבוד ל<strong>גרניום וברקן</strong> על הנסיון הראשון לבחינות</p>"}
\.


--
-- Data for Name: report_cards_private; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.report_cards_private (id, ikigai, mentors, liba, learning, vocation, special, report_semester) FROM stdin;
1a3ca980-68ff-4b0b-bf90-5e2c60ac525c	\N	\N	\N	{"generalTopics": [{"name": "אנגלית", "detail": "", "locked": true, "rating": 3, "keyTopic": true, "application": ""}, {"name": "פרזנטציה", "detail": "תכנון מצגת, הכנת חומרים, עמידה מול קהל, העברת מסרים", "locked": true, "rating": 4, "keyTopic": true, "application": ""}, {"name": "שפה", "detail": "", "locked": true, "rating": 5, "keyTopic": true, "application": ""}], "heutagogySkills": [{"name": "למידה עצמאית", "detail": "הצבת מטרות אישיות, תכנון מה ללמוד והובלת תהליך באופן עצמאי", "rating": 1}, {"name": "למידה שיתופית", "detail": "שיתוף ידע עם אחרים ולמידה הדדית בתוך קבוצה", "rating": 2}, {"name": "ניהול זמן בלמידה", "detail": "חלוקת משימות ללוחות זמנים מציאותיים והתמדה לאורך זמן", "rating": 3}, {"name": "", "detail": "", "rating": null}, {"name": "", "detail": "", "rating": null}], "professionalTopics": [{"name": "תכנות בסיסי", "detail": "כתבתי פירוט חדש לתכנות בסיסי", "rating": 1, "application": "עדות תכנות בסיסי"}, {"name": "Scratch", "detail": "מבוא תכנות בשפה ויזואלית", "rating": 2, "application": ""}]}	\N	\N	2026A
1a3ca980-68ff-4b0b-bf90-5e2c60ac525c	\N	\N	\N	{"generalTopics": [{"name": "אנגלית", "detail": "", "locked": true, "rating": 3, "keyTopic": true, "application": ""}, {"name": "פרזנטציה", "detail": "תכנון מצגת, הכנת חומרים, עמידה מול קהל, העברת מסרים", "locked": true, "rating": 4, "keyTopic": true, "application": ""}, {"name": "שפה", "detail": "", "locked": true, "rating": 5, "keyTopic": true, "application": ""}], "heutagogySkills": [{"name": "למידה עצמאית", "detail": "הצבת מטרות אישיות, תכנון מה ללמוד והובלת תהליך באופן עצמאי", "rating": 1}, {"name": "למידה שיתופית", "detail": "שיתוף ידע עם אחרים ולמידה הדדית בתוך קבוצה", "rating": 2}, {"name": "ניהול זמן בלמידה", "detail": "חלוקת משימות ללוחות זמנים מציאותיים והתמדה לאורך זמן", "rating": 3}, {"name": "", "detail": "", "rating": null}, {"name": "", "detail": "", "rating": null}], "professionalTopics": [{"name": "תכנות בסיסי", "detail": "הערכת תכנות בסיסי לסמסטר ב", "rating": 1, "application": "עדות תכנות בסיסי"}, {"name": "Scratch", "detail": "מבוא תכנות בשפה ויזואלית", "rating": 2, "application": ""}]}	\N	\N	2026B
98773a61-7921-4bb5-a623-8a7ce8281ca0	\N	\N	\N	{"generalTopics": [{"name": "אנגלית", "detail": "", "locked": true, "rating": null, "keyTopic": true, "application": ""}, {"name": "פרזנטציה", "detail": "תכנון מצגת, הכנת חומרים, עמידה מול קהל, העברת מסרים", "locked": true, "rating": null, "keyTopic": true, "application": ""}, {"name": "שפה", "detail": "", "locked": true, "rating": null, "keyTopic": true, "application": ""}], "heutagogySkills": [{"name": "", "detail": "", "rating": null}, {"name": "", "detail": "", "rating": null}, {"name": "", "detail": "", "rating": null}, {"name": "", "detail": "", "rating": null}, {"name": "", "detail": "", "rating": null}], "professionalTopics": [{"name": "Scratch", "detail": "מבוא תכנות בשפה ויזואלית", "rating": 5, "application": "משחק סיימון"}]}	\N	\N	2026B
\.


--
-- Data for Name: study_paths; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.study_paths (id, title, description, student_id, metadata, created_at, updated_at, status, vocabulary, sources) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, student_id, status, due_date, metadata, created_at, updated_at, "position", goal, target_count, created_by, current_count, url, group_id, assigned_to, completed_by) FROM stdin;
\.


--
-- Data for Name: task_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_assignments (task_id, student_id, status, completed_at, current_count) FROM stdin;
\.


--
-- Data for Name: terms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.terms (id, created_at, name, start, "end") FROM stdin;
2105340d-e3d5-4cf5-b68c-ef57ff5454dc	2025-09-28 08:41:12.860184+00	חורף	2025-12-23	2026-02-05
5238fd66-a6f8-407f-b1d1-4f3c201523ae	2025-09-28 08:42:57.727123+00	אביב	2026-02-08	2026-03-19
a08e6acb-1d2d-43f0-89be-b8ebefb54d67	2025-09-28 08:45:18.553506+00	קיץ	2026-04-09	2026-05-31
c9eaa528-a73b-40ad-b950-7f8b25c15dac	2025-09-28 08:37:23.728795+00	ניקוי רעלים	2025-09-01	2025-11-01
ef0dddf1-3a4c-4e90-ad3f-d991f0e35755	2025-11-01 14:08:27.387703+00	סתו	2025-11-02	2025-12-07
\.


--
-- Data for Name: topic_bank; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topic_bank (id, name, detail, parent_id, is_key, created_at, "position") FROM stdin;
385cafe2-bebd-4821-8d5e-009364570b80	תכנות בסיסי	תכנות פרוצדורלי (משתנים, תנאים, לולאות, פונקציות) בפייתון או שפה אחרת	0cccacbf-b4cc-4d38-bc1c-5da1d309ad72	f	2026-04-27 16:36:15.121526+00	0
a56435b0-5736-4c79-a9e7-1db6ed906b68	קטגוריה 1 בהפקה		10000000-0000-0000-0000-000000000002	f	2026-04-27 16:17:41.261634+00	0
c61acb86-728c-4210-81f4-5ae9d7754174	קטגוריה 1 בעיצוב		10000000-0000-0000-0000-000000000003	f	2026-04-27 16:17:41.261634+00	0
f06f4bbc-4921-4fb1-8b72-a7d091b31f6b	אנגלית		10000000-0000-0000-0000-000000000004	t	2026-04-27 16:38:11.642929+00	0
170e5ac4-a320-4e63-8582-ed918d201d08	פרזנטציה	תכנון מצגת, הכנת חומרים, עמידה מול קהל, העברת מסרים	10000000-0000-0000-0000-000000000004	t	2026-04-27 16:17:41.261634+00	1
b8c5c273-7abc-4611-8bca-9e823c9e4db0	שפה		10000000-0000-0000-0000-000000000004	t	2026-04-27 16:37:55.456771+00	2
10000000-0000-0000-0000-000000000001	הייטק		\N	f	2026-04-27 16:17:41.261634+00	0
10000000-0000-0000-0000-000000000002	הפקה		\N	f	2026-04-27 16:17:41.261634+00	1
10000000-0000-0000-0000-000000000004	כללי		\N	f	2026-04-27 16:17:41.261634+00	2
10000000-0000-0000-0000-000000000005	מיומנויות יוטגוגיות		\N	f	2026-04-27 16:17:41.261634+00	3
10000000-0000-0000-0000-000000000003	עיצוב		\N	f	2026-04-27 16:17:41.261634+00	4
5acf499b-0b31-4932-b3fe-ec421b6b9912	לולאות	לולאות בסקרץ'	998420f4-47bb-4446-9505-d7214cc72120	f	2026-04-28 13:47:38.105129+00	1
8a76a764-a52f-42ee-b913-e7f01a0c6df8	מערכים	וקטורים, מטריצות	998420f4-47bb-4446-9505-d7214cc72120	f	2026-04-28 14:33:54.613394+00	2
1e4f3fbe-ef1b-4c24-9654-2ab0a12a5e1b	תנאים	תנאים בסקרץ'	998420f4-47bb-4446-9505-d7214cc72120	f	2026-04-28 13:47:15.847995+00	0
2149839b-86e6-41a1-a0ce-1047ad5f255f	מבוא למחשבים	מבנה פיזי של המחשב, שיטות ספירה (בינרי, הקסה)	10000000-0000-0000-0000-000000000001	f	2026-04-27 16:34:42.460908+00	1
05facb05-8561-49ad-94d5-4aec04392fb6	אבטחת מידע	אבטחה ותקיפת סייבר	10000000-0000-0000-0000-000000000001	f	2026-04-28 12:11:22.529025+00	3
90f1500d-10ce-4aae-b2bd-6f683bcd3c21	רשתות תקשורת	שימוש, תאוריה, תכנות רשתות תקשורת	10000000-0000-0000-0000-000000000001	f	2026-04-28 13:43:42.690105+00	4
0cccacbf-b4cc-4d38-bc1c-5da1d309ad72	לימודי בסיס הייטק	נושאי בסיס הנדרשים לכל המסלולים	10000000-0000-0000-0000-000000000001	f	2026-04-27 16:33:05.761611+00	0
20000000-0000-0000-0000-000000000001	למידה עצמאית	הצבת מטרות אישיות, תכנון מה ללמוד והובלת תהליך באופן עצמאי	10000000-0000-0000-0000-000000000005	f	2026-04-28 21:37:48.841563+00	0
998420f4-47bb-4446-9505-d7214cc72120	Scratch	מבוא תכנות בשפה ויזואלית	2149839b-86e6-41a1-a0ce-1047ad5f255f	f	2026-04-28 12:12:42.915862+00	0
20000000-0000-0000-0000-000000000002	רפלקציה	ניתוח מה עבד, מה לא עבד, ומה צריך לשנות במחזור הבא	10000000-0000-0000-0000-000000000005	f	2026-04-28 21:37:48.841563+00	1
20000000-0000-0000-0000-000000000003	שאלת שאלות עומק	ניסוח שאלות שמקדמות חקירה ולא רק תשובה מהירה	10000000-0000-0000-0000-000000000005	f	2026-04-28 21:37:48.841563+00	2
20000000-0000-0000-0000-000000000004	איתור מידע אמין	חיפוש, סינון והצלבת מקורות רלוונטיים ואמינים	10000000-0000-0000-0000-000000000005	f	2026-04-28 21:37:48.841563+00	3
20000000-0000-0000-0000-000000000005	למידה מניסוי וטעייה	בדיקה מהירה של רעיונות, הפקת לקחים ושיפור רציף	10000000-0000-0000-0000-000000000005	f	2026-04-28 21:37:48.841563+00	4
20000000-0000-0000-0000-000000000006	ניהול זמן בלמידה	חלוקת משימות ללוחות זמנים מציאותיים והתמדה לאורך זמן	10000000-0000-0000-0000-000000000005	f	2026-04-28 21:37:48.841563+00	5
20000000-0000-0000-0000-000000000007	הגדרת קריטריוני הצלחה	הבנה מראש איך נמדדת התקדמות ואיכות התוצר	10000000-0000-0000-0000-000000000005	f	2026-04-28 21:37:48.841563+00	6
20000000-0000-0000-0000-000000000008	גמישות מחשבתית	שינוי כיוון בהתאם לנתונים חדשים ולפידבק מהשטח	10000000-0000-0000-0000-000000000005	f	2026-04-28 21:37:48.841563+00	7
20000000-0000-0000-0000-000000000009	קבלת משוב ושימוש בו	קליטת משוב, בחינת הרלוונטיות שלו והטמעת שינויים	10000000-0000-0000-0000-000000000005	f	2026-04-28 21:37:48.841563+00	8
20000000-0000-0000-0000-000000000010	למידה שיתופית	שיתוף ידע עם אחרים ולמידה הדדית בתוך קבוצה	10000000-0000-0000-0000-000000000005	f	2026-04-28 21:37:48.841563+00	9
20000000-0000-0000-0000-000000000011	בעלות על תהליך הלמידה	אחריות אישית מלאה להתקדמות, בחירות ותוצאות	10000000-0000-0000-0000-000000000005	f	2026-04-28 21:37:48.841563+00	10
20000000-0000-0000-0000-000000000012	העברת ידע לאחרים	יכולת להסביר תהליך ותובנות בצורה ברורה לאחרים	10000000-0000-0000-0000-000000000005	f	2026-04-28 21:37:48.841563+00	11
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profiles (id, avatar_url, profile, "googleRefreshToken", updated_at, portfolio_url, id_number, cv_url, title) FROM stdin;
98773a61-7921-4bb5-a623-8a7ce8281ca0		{"pronouns": "he"}	\N	2026-02-26 15:17:58.001939+00	https://geranium-making-portfolio.my.canva.site/	\N	https://drive.google.com/file/d/1jTlhY50MZzpuMRoJow0kJMVxTX_yOS-2/	רכז מגמת הייטק, רכז שירות משמעותי
44cd7c4b-5872-46ac-a5c2-4017a7a8e135	\N	{"pronouns": "she"}	\N	2026-02-26 19:10:57.136144+00	\N	\N	\N	\N
1a3ca980-68ff-4b0b-bf90-5e2c60ac525c	\N	{"pronouns": "he"}	\N	2026-02-26 19:10:57.136144+00	\N	\N	\N	\N
1a141c9f-7b7b-4f77-8b89-7489e4b5917a	\N	{"pronouns": "he"}	\N	2026-02-26 19:22:55.691569+00	\N	\N	\N	\N
f512190e-e467-4dc4-b6f4-7d0794713c94	\N	{"pronouns": "he"}	\N	2026-02-26 19:23:19.197772+00	\N	\N	\N	\N
\.


--
-- Data for Name: users_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users_groups (user_id, group_id, role_in_group, joined_at) FROM stdin;
98773a61-7921-4bb5-a623-8a7ce8281ca0	13e50b43-6501-4b24-96ea-1d021d9165aa	\N	2026-02-26 16:29:09.841354+00
98773a61-7921-4bb5-a623-8a7ce8281ca0	812f6dca-07dc-49be-b5d4-f9c5d1eece2a	\N	2026-02-26 16:29:11.771015+00
98773a61-7921-4bb5-a623-8a7ce8281ca0	e58d93b9-bfa4-4271-95e5-53c4e4fcf838	\N	2026-02-26 16:29:13.540428+00
1a3ca980-68ff-4b0b-bf90-5e2c60ac525c	064037f7-678b-4ea9-b257-4c9271503215	student	2026-02-26 17:01:15.870656+00
98773a61-7921-4bb5-a623-8a7ce8281ca0	064037f7-678b-4ea9-b257-4c9271503215	\N	2026-02-26 17:01:54.708434+00
44cd7c4b-5872-46ac-a5c2-4017a7a8e135	e58d93b9-bfa4-4271-95e5-53c4e4fcf838	\N	2026-02-26 19:10:57.237115+00
44cd7c4b-5872-46ac-a5c2-4017a7a8e135	ca69d71a-eff7-49ef-ba4a-5a5fe77e8e7e	\N	2026-02-26 19:10:57.327939+00
1a141c9f-7b7b-4f77-8b89-7489e4b5917a	812f6dca-07dc-49be-b5d4-f9c5d1eece2a	\N	2026-02-26 19:22:55.798753+00
1a141c9f-7b7b-4f77-8b89-7489e4b5917a	ca69d71a-eff7-49ef-ba4a-5a5fe77e8e7e	\N	2026-02-26 19:22:55.878772+00
f512190e-e467-4dc4-b6f4-7d0794713c94	13e50b43-6501-4b24-96ea-1d021d9165aa	\N	2026-02-26 19:23:19.294832+00
\.


--
-- Data for Name: vocation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vocation (id, created_at, user_id, place_of_work, "position", work_hours) FROM stdin;
\.


--
-- Name: vocation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vocation_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict vVReRzkvvqfZNwnYRNJwfqoGUNbU8glTcAQ0weYOlnjsrzc9ZX8OIsVxiPTQa9S

