--
-- PostgreSQL database dump
--

\restrict YNfjOIrX6Yq3FDDPtWgL93m3dbCyPqgN0jVIHGeWrUJVaGE5xpJwm48qkyf2XO2

-- Dumped from database version 16.14 (146758d)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (2, 'Fadhilah Apta Nur Safitri', '2026-06-08', 'hadir', NULL, '2026-06-08 02:43:46.542627');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (4, 'Miftakhul Jannah', '2026-06-08', 'izin', NULL, '2026-06-08 03:09:29.687322');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (5, 'Navida Fitria', '2026-06-08', 'izin', NULL, '2026-06-08 03:09:29.999936');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (6, 'Quro''atul A''ini', '2026-06-08', 'alfa', NULL, '2026-06-08 03:09:31.590322');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (7, 'Vrizcka Aullia Asmara', '2026-06-08', 'alfa', NULL, '2026-06-08 03:09:32.641996');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (8, 'Dewi Anita Sari', '2026-06-08', 'sakit', NULL, '2026-06-08 03:09:33.409412');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (9, 'Tiara Nuril Safitri', '2026-06-08', 'izin', NULL, '2026-06-08 03:09:35.554762');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (10, 'Muhamad Naufal', '2026-06-15', 'hadir', NULL, '2026-06-08 03:10:57.480624');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (11, 'Lutfia Tri Rahmacahyani', '2026-06-15', 'izin', NULL, '2026-06-08 03:10:59.321137');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (12, 'Navida Fitria', '2026-06-15', 'sakit', NULL, '2026-06-08 03:11:00.577024');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (13, 'Vrizcka Aullia Asmara', '2026-06-15', 'sakit', NULL, '2026-06-08 03:11:01.949294');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (14, 'Dewi Anita Sari', '2026-06-15', 'izin', NULL, '2026-06-08 03:11:03.412313');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (15, 'Quro''atul A''ini', '2026-06-15', 'alfa', NULL, '2026-06-08 03:11:05.114247');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (16, 'Tiara Nuril Safitri', '2026-06-15', 'sakit', NULL, '2026-06-08 03:11:08.493218');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (17, 'Fadhilah Apta Nur Safitri', '2026-06-15', 'izin', NULL, '2026-06-08 03:11:10.667889');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (3, 'Lutfia Tri Rahmacahyani', '2026-06-08', 'sakit', NULL, '2026-06-08 02:45:14.964305');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (1, 'Muhamad Naufal', '2026-06-08', 'hadir', NULL, '2026-06-08 02:43:41.008318');
INSERT INTO public.attendance (id, member_name, date, status, notes, created_at) VALUES (18, 'Muhamad Naufal', '2026-06-07', 'hadir', NULL, '2026-06-08 05:38:36.989889');


--
-- Data for Name: cleaning_schedules; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: cooking_schedules; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: deadlines; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.deadlines (id, title, type, due_date, status, assigned_to, notes, created_at) VALUES (5, 'Mencari informasi pick up', 'tugas', '2026-06-12', 'pending', '["Muhamad Naufal", "Lutfia Tri Rahmacahyani", "Miftakhul Jannah", "Quro''atul A''ini", "Tiara Nuril Safitri", "Fadhilah Apta Nur Safitri", "Navida Fitria", "Vrizcka Aullia Asmara", "Dewi Anita Sari"]', NULL, '2026-06-09 06:16:53.712192');
INSERT INTO public.deadlines (id, title, type, due_date, status, assigned_to, notes, created_at) VALUES (6, 'Mencetak banner', 'tugas', '2026-06-12', 'pending', '["Dewi Anita Sari", "Tiara Nuril Safitri"]', NULL, '2026-06-09 06:51:11.24149');
INSERT INTO public.deadlines (id, title, type, due_date, status, assigned_to, notes, created_at) VALUES (7, 'Membeli perlengkapan', 'tugas', '2026-06-13', 'pending', '["Muhamad Naufal", "Lutfia Tri Rahmacahyani", "Miftakhul Jannah", "Quro''atul A''ini", "Tiara Nuril Safitri", "Fadhilah Apta Nur Safitri", "Navida Fitria", "Vrizcka Aullia Asmara", "Dewi Anita Sari"]', NULL, '2026-06-09 06:51:47.792339');


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (1, 'Perban', 'p3k', 5, 'gulung', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (2, 'Plester luka', 'p3k', 20, 'lembar', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (3, 'Kapas', 'p3k', 3, 'bungkus', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (4, 'Antiseptik Betadine', 'p3k', 2, 'botol', 'Ukuran 100ml', '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (5, 'Paracetamol', 'obat', 30, 'tablet', 'Untuk demam dan sakit kepala', '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (6, 'Antasida', 'obat', 20, 'tablet', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (7, 'Oralit', 'obat', 10, 'sachet', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (8, 'Vitamin C', 'obat', 50, 'tablet', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (9, 'Stetoskop', 'alkes', 1, 'buah', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (10, 'Termometer digital', 'alkes', 2, 'buah', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (11, 'Ember', 'umum', 4, 'buah', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (12, 'Sapu', 'umum', 3, 'buah', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (13, 'Sabun cuci piring', 'umum', 2, 'botol', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (14, 'Tisu gulung', 'umum', 6, 'gulung', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (28, 'Koko', 'pakaian', 2, 'buah', NULL, '2026-06-09 02:38:10.054958', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (29, 'Botol Minum', 'alat_makan', 1, 'buah', NULL, '2026-06-09 02:38:10.057422', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (31, 'Piring', 'alat_makan', 1, 'buah', NULL, '2026-06-09 02:38:10.066546', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (32, 'Kaos', 'pakaian', 8, 'buah', NULL, '2026-06-09 02:38:10.083445', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (274, 'sikat mandi', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:15:14.377315', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (316, 'Parfum', 'pakaian', 1, 'botol', NULL, '2026-06-09 06:36:18.774088', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (333, 'Tissue', 'alat_kebersihan', 1, 'kotak', NULL, '2026-06-09 06:51:29.609331', 'pribadi', 'Vrizcka Aullia Asmara', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (37, 'Parfum', 'pakaian', 1, 'botol', NULL, '2026-06-09 02:38:10.101289', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (41, 'Celana Pendek', 'pakaian', 8, 'buah', NULL, '2026-06-09 02:38:10.11746', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (42, 'Sarung', 'pakaian', 3, 'buah', NULL, '2026-06-09 02:38:10.118317', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (44, 'Paracetamol', 'alat_kebersihan', 40, 'butir', NULL, '2026-06-09 02:38:10.130388', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (45, 'Laptop', 'device', 1, 'buah', NULL, '2026-06-09 02:38:10.13401', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (47, 'T Listrik', 'alat_elektronik', 1, 'buah', NULL, '2026-06-09 02:38:10.136839', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (53, 'Beras', 'stock_makanan', 2, 'kg', NULL, '2026-06-09 02:38:10.16619', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (55, 'Handphone', 'device', 1, 'buah', NULL, '2026-06-09 02:38:10.168706', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (58, 'Engkrak', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 02:38:10.182405', 'pinjaman', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (60, 'Sapu Lantai', 'alat_kebersihan', 2, 'buah', NULL, '2026-06-09 02:38:10.195173', 'pinjaman', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (61, 'Sweatshirt', 'pakaian', 2, 'buah', NULL, '2026-06-09 02:38:10.197812', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (62, 'Trash Bag', 'alat_kebersihan', 50, 'Buah', NULL, '2026-06-09 02:38:10.198384', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (63, 'Kecap', 'alat_kebersihan', 1, 'botol', NULL, '2026-06-09 02:38:10.200127', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (64, 'Kasur', 'tempat_tidur', 1, 'buah', NULL, '2026-06-09 02:38:10.210608', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (65, 'Obat Alergi', 'darurat', 10, 'butir', NULL, '2026-06-09 02:38:10.214326', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (66, 'Kemeja', 'pakaian', 5, 'Buah', NULL, '2026-06-09 02:38:10.215904', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (68, 'Sabut Stainless Steel', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 02:38:10.226544', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (69, 'Sarung Guling', 'tempat_tidur', 2, 'buah', NULL, '2026-06-09 02:38:10.2337', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (71, 'Celana Training', 'pakaian', 2, 'buah', NULL, '2026-06-09 02:38:10.235426', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (72, 'Baju Putih', 'pakaian', 2, 'buah', NULL, '2026-06-09 02:38:10.245175', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (73, 'Obat Gerd', 'darurat', 10, 'butir', NULL, '2026-06-09 02:38:10.248692', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (74, 'Charger Laptop', 'alat_elektronik', 1, 'buah', NULL, '2026-06-09 02:38:10.250694', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (78, 'Baju Batik', 'pakaian', 2, 'buah', NULL, '2026-06-09 02:38:10.260196', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (76, 'Celana Panjang', 'pakaian', 5, 'buah', NULL, '2026-06-09 02:38:10.2521', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (82, 'Kaus Kaki', 'pakaian', 6, 'pasang', NULL, '2026-06-09 02:38:10.270579', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (86, 'Pulpen', 'alat_tulis', 2, 'pcs', NULL, '2026-06-09 02:38:10.280216', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (87, 'Peci', 'pakaian', 1, 'buah', NULL, '2026-06-09 02:38:10.282912', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (88, 'Shampoo', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 02:38:10.28318', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (261, 'Ricecooker', 'alat_masak', 1, 'buah', NULL, '2026-06-09 06:08:09.252714', 'pinjaman', 'Fadhilah Apta Nur Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (275, 'make up', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:15:14.380217', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (100, 'Parfum', 'pakaian', 1, 'botol', NULL, '2026-06-09 02:38:11.623229', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (125, 'Pulpen', 'alat_tulis', 2, 'pcs', NULL, '2026-06-09 02:38:11.714234', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (317, 'Botol Minum', 'alat_makan', 1, 'buah', NULL, '2026-06-09 06:36:18.775371', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (334, 'conditioner', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:51:51.320147', 'pribadi', 'Vrizcka Aullia Asmara', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (91, 'Charger Handphone', 'alat_elektronik', 2, 'buah', NULL, '2026-06-09 02:38:11.578151', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (276, 'skincare', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:15:14.381977', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (126, 'Wadah Container Kecil', 'alat_makan', 10, 'Buah', NULL, '2026-06-09 02:38:11.71513', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (262, 'Earphone', 'alat_elektronik', 2, 'buah', 'kabel (robot) dan bluetooth (eggle) hitam', '2026-06-09 06:09:41.294547', 'pribadi', 'Fadhilah Apta Nur Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (151, 'Tissue', 'alat_kebersihan', 2, 'kotak', NULL, '2026-06-09 02:38:11.867716', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (318, 'Peniti', 'darurat', 1, 'pcs', NULL, '2026-06-09 06:36:18.777715', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (335, 'hanger', 'alat_kebersihan', 10, 'buah', NULL, '2026-06-09 06:52:12.351401', 'pribadi', 'Vrizcka Aullia Asmara', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (263, 'Kipas Angin', 'alat_elektronik', 1, 'buah', NULL, '2026-06-09 06:10:06.518562', 'pinjaman', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (277, 'wadah mandi', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:15:14.383289', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (285, 'Sepatu', 'pakaian', 1, 'pasang', NULL, '2026-06-09 06:23:30.758648', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (118, 'Sandal', 'pakaian', 1, 'pasang', NULL, '2026-06-09 02:38:11.694323', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (297, 'kerudung rabbani', 'pakaian', 1, 'buah', NULL, '2026-06-09 06:34:15.565859', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (299, 'sandal kodok', 'pakaian', 1, 'pasang', NULL, '2026-06-09 06:34:15.595216', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (302, 'kerudung pashmina', 'pakaian', 3, 'buah', NULL, '2026-06-09 06:34:15.611804', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (304, 'kerudung segitiga', 'pakaian', 5, 'buah', NULL, '2026-06-09 06:34:15.627095', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (319, 'Tas / Backpack', 'alat_tulis', 1, 'buah', NULL, '2026-06-09 06:36:18.779553', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (322, 'Terminal Listrik/Kabel Roll', 'alat_elektronik', 1, 'buah', 'warna hitam,kuning,hijau', '2026-06-09 06:42:39.795009', 'pinjaman', 'Fadhilah Apta Nur Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (336, 'kapas', 'alat_kebersihan', 1, 'wadah', NULL, '2026-06-09 06:52:31.078908', 'pribadi', 'Vrizcka Aullia Asmara', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (337, 'gunting kuku', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 15:04:39.601227', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (340, 'Ember', 'alat_kebersihan', 1, 'buah', 'pink', '2026-06-09 15:16:27.56299', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (343, 'Terminal Listrik/Kabel Roll', 'alat_elektronik', 1, 'buah', NULL, '2026-06-09 15:24:58.267727', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (344, 'Pisau', 'alat_masak', 1, 'buah', NULL, '2026-06-09 17:09:58.360065', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (345, 'Piring', 'alat_makan', 2, 'buah', NULL, '2026-06-09 17:11:49.434298', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (264, 'Tissue', 'alat_kebersihan', 1, 'kotak', NULL, '2026-06-09 06:10:18.15259', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (278, 'spons mandi', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:15:14.385154', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (105, 'Deodorant', 'pakaian', 2, 'buah', NULL, '2026-06-09 02:38:11.639468', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (109, 'Sweatshirt', 'pakaian', 2, 'buah', NULL, '2026-06-09 02:38:11.656513', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (112, 'Sajadah', 'pakaian', 2, 'buah', NULL, '2026-06-09 02:38:11.672986', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (286, 'Sajadah', 'pakaian', 1, 'buah', NULL, '2026-06-09 06:23:30.862602', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (138, 'Thermos', 'alat_makan', 1, 'buah', NULL, '2026-06-09 02:38:11.736046', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (298, 'rok', 'pakaian', 1, 'buah', NULL, '2026-06-09 06:34:15.577952', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (300, 'daleman', 'pakaian', 10, 'set', NULL, '2026-06-09 06:34:15.596024', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (301, 'kerudung bergi', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:34:15.611042', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (303, 'kaos pendek', 'pakaian', 5, 'buah', NULL, '2026-06-09 06:34:15.626251', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (305, 'almamater', 'pakaian', 1, 'buah', NULL, '2026-06-09 06:34:15.641496', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (306, 'flatshoes', 'pakaian', 1, 'pasang', NULL, '2026-06-09 06:34:15.880559', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (320, 'Thermos', 'alat_makan', 1, 'buah', NULL, '2026-06-09 06:36:18.794184', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (323, 'Keset/alas kaki', 'alat_kebersihan', 2, 'pcs', NULL, '2026-06-09 06:44:18.367732', 'pinjaman', 'Fadhilah Apta Nur Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (338, 'cotton bud', 'alat_kebersihan', 1, 'wadah', NULL, '2026-06-09 15:04:39.601991', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (341, 'Gayung', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 15:16:56.777205', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (346, 'Mangkuk', 'alat_makan', 1, 'buah', NULL, '2026-06-09 17:12:05.976368', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (347, 'Garpu', 'alat_makan', 1, 'pcs', NULL, '2026-06-09 17:12:16.630609', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (265, 'Ember', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:10:18.166172', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (133, 'Selimut', 'tempat_tidur', 1, 'buah', NULL, '2026-06-09 02:38:11.727472', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (280, 'sikat cuci', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:15:14.38927', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (145, 'Jacket / Hoodie / Jumper', 'pakaian', 2, 'buah', NULL, '2026-06-09 02:38:11.851019', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (287, 'Gamis', 'pakaian', 1, 'buah', NULL, '2026-06-09 06:23:30.870624', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (307, 'sandal jepit', 'pakaian', 1, 'pasang', NULL, '2026-06-09 06:34:15.957122', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (321, 'Tas Laundry', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:36:18.799952', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (324, 'Charger Handphone', 'alat_elektronik', 2, 'buah', 'Ugreen (hitam), ugreen (putih)', '2026-06-09 06:44:55.488653', 'pribadi', 'Vrizcka Aullia Asmara', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (339, 'Talenan', 'alat_masak', 1, 'buah', NULL, '2026-06-09 15:09:14.245872', 'pinjaman', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (342, 'Pompa galon', 'alat_elektronik', 1, 'buah', 'putih', '2026-06-09 15:18:55.684598', 'pinjaman', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (348, 'Sendok', 'alat_makan', 1, 'pcs', NULL, '2026-06-09 17:12:28.866791', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (95, 'Ember', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 02:38:11.58273', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (266, 'Gayung', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:10:18.168943', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (282, 'conditioner', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:15:14.391552', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (111, 'Celana Panjang', 'pakaian', 5, 'buah', NULL, '2026-06-09 02:38:11.666854', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (288, 'Mukena', 'pakaian', 1, 'buah', NULL, '2026-06-09 06:23:30.882466', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (308, 'celana formal', 'pakaian', 5, 'buah', NULL, '2026-06-09 06:34:15.966463', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (325, 'Charger Laptop', 'alat_elektronik', 1, 'buah', 'Lenovo (hitam)', '2026-06-09 06:45:18.614188', 'pribadi', 'Vrizcka Aullia Asmara', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (349, 'Sumpit', 'alat_makan', 1, 'buah', NULL, '2026-06-09 17:13:21.362798', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (350, 'Gelas', 'alat_makan', 1, 'Buah', NULL, '2026-06-09 17:13:33.870585', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (267, 'Handuk', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:10:18.176255', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (110, 'Garpu', 'alat_makan', 3, 'pcs', NULL, '2026-06-09 02:38:11.66452', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (132, 'Mangkuk', 'alat_makan', 2, 'buah', NULL, '2026-06-09 02:38:11.727255', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (289, 'Sweatshirt', 'pakaian', 2, 'buah', NULL, '2026-06-09 06:23:30.894869', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (283, 'Powerbank', 'alat_elektronik', 1, 'buah', 'vention hitam', '2026-06-09 06:18:11.947591', 'pribadi', 'Fadhilah Apta Nur Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (309, 'tunik', 'pakaian', 1, '1', NULL, '2026-06-09 06:34:15.993816', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (326, 'Kipas Angin', 'alat_elektronik', 1, 'buah', 'Maspion (hitam)', '2026-06-09 06:46:45.422702', 'pinjaman', 'Vrizcka Aullia Asmara', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (351, 'Tumbler', 'alat_makan', 1, 'botol', NULL, '2026-06-09 17:14:32.91787', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (268, 'Sabun Mandi', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:10:18.178478', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (290, 'Celana Pendek', 'pakaian', 2, 'buah', NULL, '2026-06-09 06:23:30.90103', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (150, 'Botol Minum', 'alat_makan', 1, 'buah', NULL, '2026-06-09 02:38:11.861068', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (292, 'Baju Batik', 'pakaian', 2, 'buah', NULL, '2026-06-09 06:23:31.840292', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (284, 'Charger Handphone', 'alat_elektronik', 1, 'buah', 'kepala charger samsung + vention putih', '2026-06-09 06:19:21.431844', 'pribadi', 'Fadhilah Apta Nur Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (310, 'kaus kaki pendek', 'pakaian', 3, 'pasang', NULL, '2026-06-09 06:34:15.995516', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (327, 'Kipas portable', 'alat_elektronik', 1, 'buah', 'Mini (pink putih)', '2026-06-09 06:48:04.619592', 'pribadi', 'Vrizcka Aullia Asmara', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (352, 'Charger Handphone', 'alat_elektronik', 2, 'buah', NULL, '2026-06-09 17:15:30.092177', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (353, 'Charger Laptop', 'alat_elektronik', 1, 'buah', NULL, '2026-06-09 17:15:44.815539', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (102, 'Kecap', 'alat_kebersihan', 1, 'botol', NULL, '2026-06-09 02:38:11.628406', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (269, 'Sikat Gigi', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:10:18.179522', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (291, 'Celana Training', 'pakaian', 2, 'buah', NULL, '2026-06-09 06:23:30.905187', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (311, 'kemeja formal', 'pakaian', 5, 'buah', NULL, '2026-06-09 06:34:16.008361', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (147, 'Bantal', 'tempat_tidur', 1, 'Buah', NULL, '2026-06-09 02:38:11.85436', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (328, 'Ember', 'alat_kebersihan', 1, 'buah', 'Abu-abu', '2026-06-09 06:48:46.25826', 'pribadi', 'Vrizcka Aullia Asmara', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (354, 'Handuk', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 17:17:27.36298', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (270, 'Shampoo', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:10:18.180142', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (124, 'Plester', 'darurat', 1, 'buah', NULL, '2026-06-09 02:38:11.713362', 'pinjaman', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (134, 'Tas / Backpack', 'alat_tulis', 2, 'buah', NULL, '2026-06-09 02:38:11.732668', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (154, 'Mouse', 'alat_elektronik', 2, 'buah', NULL, '2026-06-09 02:38:23.887358', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (155, 'Terminal Listrik / Roll Cable', 'alat_elektronik', 2, 'buah', NULL, '2026-06-09 02:38:23.887982', 'pinjaman', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (312, 'kaus kaki panjang', 'pakaian', 1, 'pasang', NULL, '2026-06-09 06:34:16.0125', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (329, 'Handuk', 'alat_kebersihan', 1, 'buah', 'Pink', '2026-06-09 06:49:07.363984', 'pribadi', 'Vrizcka Aullia Asmara', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (355, 'Mouse', 'device', 1, 'buah', NULL, '2026-06-09 17:19:08.223494', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (162, 'Earphone', 'alat_elektronik', 2, 'buah', NULL, '2026-06-09 02:38:23.891809', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (171, 'Tas Laundry', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 02:38:23.911543', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (175, 'Mie Instant', 'alat_kebersihan', 5, 'bungkus', NULL, '2026-06-09 02:38:23.921167', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (177, 'Sikat Gigi', 'alat_kebersihan', 3, 'buah', NULL, '2026-06-09 02:38:23.923136', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (178, 'Gelas', 'alat_makan', 1, 'Buah', NULL, '2026-06-09 02:38:23.923917', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (182, 'Spone Cuci Piring', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 02:38:23.928459', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (185, 'Kaos', 'pakaian', 8, 'buah', NULL, '2026-06-09 02:38:23.936553', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (186, 'Senter', 'darurat', 1, 'buah', NULL, '2026-06-09 02:38:23.937558', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (187, 'Garpu', 'alat_makan', 3, 'pcs', NULL, '2026-06-09 02:38:23.938475', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (188, 'Pisau', 'alat_masak', 2, 'buah', NULL, '2026-06-09 02:38:23.939935', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (190, 'Celana Pendek', 'pakaian', 8, 'buah', NULL, '2026-06-09 02:38:23.942392', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (192, 'Gunting', 'alat_tulis', 1, 'buah', NULL, '2026-06-09 02:38:23.94475', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (193, 'Sendok', 'alat_makan', 3, 'pcs', NULL, '2026-06-09 02:38:23.951506', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (194, 'Baju Gelap', 'pakaian', 2, 'buah', NULL, '2026-06-09 02:38:23.951837', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (200, 'Pulpen', 'alat_tulis', 2, 'pcs', NULL, '2026-06-09 02:38:23.958098', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (204, 'Parfum', 'pakaian', 1, 'botol', NULL, '2026-06-09 02:38:23.967447', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (206, 'Sprei Kasur', 'tempat_tidur', 2, 'buah', NULL, '2026-06-09 02:38:23.968722', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (207, 'Guling', 'tempat_tidur', 1, 'Buah', NULL, '2026-06-09 02:38:23.970915', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (211, 'Sarung Bantal', 'tempat_tidur', 2, 'buah', NULL, '2026-06-09 02:38:24.002396', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (212, 'Sepatu', 'pakaian', 2, 'pasang', NULL, '2026-06-09 02:38:24.002688', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (220, 'Rak Sepatu', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 02:39:08.451565', 'pinjaman', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (222, 'Selimut', 'tempat_tidur', 1, 'buah', NULL, '2026-06-09 04:55:22.053054', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (223, 'Sarung Guling', 'tempat_tidur', 1, 'buah', NULL, '2026-06-09 04:55:22.157031', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (224, 'Guling', 'tempat_tidur', 1, 'Buah', NULL, '2026-06-09 04:55:22.157489', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (271, 'hanger', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:15:14.371506', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (279, 'kapas', 'alat_kebersihan', 1, 'wadah', NULL, '2026-06-09 06:15:14.386622', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (294, 'Baju Gelap', 'pakaian', 1, 'buah', NULL, '2026-06-09 06:24:58.811234', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (313, 'kaos panjang', 'pakaian', 5, 'buah', NULL, '2026-06-09 06:34:16.014021', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (330, 'Sabun Mandi', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:49:41.440313', 'pribadi', 'Vrizcka Aullia Asmara', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (356, 'Laptop', 'device', 1, 'buah', NULL, '2026-06-09 17:20:01.930035', 'pribadi', 'Miftakhul Jannah', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (225, 'Kasur', 'tempat_tidur', 1, 'buah', NULL, '2026-06-09 04:55:22.158484', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (272, 'kispray', 'alat_kebersihan', 1, 'botol', NULL, '2026-06-09 06:15:14.373844', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (281, 'pasta gigi', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:15:14.390105', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (295, 'Baju Putih', 'pakaian', 1, 'buah', NULL, '2026-06-09 06:24:58.914516', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (296, 'Charger Laptop', 'alat_elektronik', 1, 'buah', 'lenovo hitam', '2026-06-09 06:25:03.629506', 'pribadi', 'Fadhilah Apta Nur Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (314, 'topi', 'pakaian', 1, 'buah', NULL, '2026-06-09 06:34:16.015129', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (331, 'Shampoo', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:50:09.551682', 'pribadi', 'Vrizcka Aullia Asmara', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (226, 'Sarung Bantal', 'tempat_tidur', 1, 'buah', NULL, '2026-06-09 04:55:22.158794', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (227, 'Bantal', 'tempat_tidur', 1, 'Buah', NULL, '2026-06-09 04:55:22.171622', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (228, 'bed cover', 'tempat_tidur', 1, 'buah', NULL, '2026-06-09 05:34:18.523517', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (229, 'Gayung', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 05:34:59.196881', 'pribadi', 'Muhamad Naufal', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (231, 'ibuprofen', 'darurat', 1, 'strip', NULL, '2026-06-09 05:41:56.604419', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (230, 'promag', 'darurat', 1, '1 strip', NULL, '2026-06-09 05:41:56.603773', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (233, 'minyak kayu putih', 'darurat', 1, 'buah', NULL, '2026-06-09 05:41:56.606168', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (232, 'pembalut siang', 'darurat', 1, 'pack', NULL, '2026-06-09 05:41:56.606321', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (234, 'pembalut malam', 'darurat', 1, 'pack', NULL, '2026-06-09 05:41:56.605063', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (235, 'Laptop', 'device', 1, 'buah', NULL, '2026-06-09 05:42:33.634408', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (236, 'Handphone', 'device', 1, 'buah', NULL, '2026-06-09 05:42:33.751484', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (237, 'Mie Instant', 'alat_kebersihan', 6, 'bungkus', NULL, '2026-06-09 05:44:48.365521', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (273, 'sabun cuci', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:15:14.376188', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (239, 'Pulpen', 'alat_tulis', 1, 'pcs', NULL, '2026-06-09 05:50:22.535517', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (240, 'Charger Laptop', 'alat_elektronik', 1, 'buah', NULL, '2026-06-09 05:54:42.402567', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (241, 'Earphone', 'alat_elektronik', 1, 'buah', NULL, '2026-06-09 05:54:42.412942', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (242, 'kipas portable', 'alat_elektronik', 1, 'buah', NULL, '2026-06-09 05:54:42.425834', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (243, 'Charger Handphone', 'alat_elektronik', 1, 'buah', NULL, '2026-06-09 05:54:42.426387', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (244, 'notes kecil', 'alat_tulis', 1, 'buah', NULL, '2026-06-09 05:59:03.393753', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (245, 'Gunting', 'alat_tulis', 1, 'buah', NULL, '2026-06-09 05:59:03.406051', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (246, 'Mangkuk', 'alat_makan', 1, 'buah', NULL, '2026-06-09 06:00:11.320874', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (247, 'Sendok', 'alat_makan', 1, 'pcs', NULL, '2026-06-09 06:00:11.330156', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (248, 'Garpu', 'alat_makan', 1, 'pcs', NULL, '2026-06-09 06:00:11.336664', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (249, 'Gelas', 'alat_makan', 1, 'Buah', NULL, '2026-06-09 06:00:11.337383', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (250, 'Piring', 'alat_makan', 1, 'buah', NULL, '2026-06-09 06:00:11.372467', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (251, 'Wajan', 'alat_masak', 1, 'buah', NULL, '2026-06-09 06:05:30.32479', 'pinjaman', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (252, 'Panci', 'alat_masak', 1, 'buah', NULL, '2026-06-09 06:05:30.46353', 'pinjaman', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (253, 'sendok sayur', 'alat_masak', 1, 'buah', NULL, '2026-06-09 06:05:30.477269', 'pinjaman', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (254, 'Pisau', 'alat_masak', 1, 'buah', NULL, '2026-06-09 06:05:30.477171', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (255, 'baskom', 'alat_masak', 1, 'buah', NULL, '2026-06-09 06:05:30.478669', 'pinjaman', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (256, 'sutil', 'alat_masak', 1, 'buah', NULL, '2026-06-09 06:05:30.479369', 'pinjaman', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (257, 'Tabung Gas', 'alat_masak', 1, 'buah', NULL, '2026-06-09 06:05:30.481833', 'pinjaman', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (258, 'tempat lauk mateng (kuah)', 'alat_masak', 1, 'buah', NULL, '2026-06-09 06:05:30.482388', 'pinjaman', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (259, 'tempat lauk mateng (goreng)', 'alat_masak', 1, 'buah', NULL, '2026-06-09 06:05:30.523811', 'pinjaman', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (315, 'Jarum', 'darurat', 1, 'pcs', NULL, '2026-06-09 06:36:18.770718', 'pribadi', 'Tiara Nuril Safitri', NULL);
INSERT INTO public.inventory (id, name, category, quantity, unit, notes, created_at, item_type, owner_name, owner_label) VALUES (332, 'Sikat Gigi', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 06:50:33.253149', 'pribadi', 'Vrizcka Aullia Asmara', NULL);


--
-- Data for Name: issues; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: item_catalog; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (1, 'Panci', 'alat_masak', 'buah', '2026-06-08 11:50:42.521696');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (2, 'Sendok', 'alat_makan', 'pcs', '2026-06-08 12:03:19.567455');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (3, 'Garpu', 'alat_makan', 'pcs', '2026-06-08 12:03:38.468448');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (4, 'Ricecooker', 'alat_masak', 'buah', '2026-06-08 12:04:04.11989');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (5, 'Handphone', 'device', 'buah', '2026-06-08 12:04:19.185132');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (6, 'Laptop', 'device', 'buah', '2026-06-08 12:04:28.891564');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (7, 'Tablet', 'device', 'buah', '2026-06-08 12:04:43.976272');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (8, 'Beras', 'stock_makanan', 'kg', '2026-06-08 12:05:08.788044');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (9, 'Minyak', 'stock_makanan', 'liter', '2026-06-08 12:05:34.608515');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (10, 'Sapu Lantai', 'alat_kebersihan', 'buah', '2026-06-08 12:05:52.586987');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (11, 'Engkrak', 'alat_kebersihan', 'buah', '2026-06-08 12:06:22.740077');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (12, 'Baju Batik', 'pakaian', 'buah', '2026-06-08 12:07:34.093156');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (13, 'Baju Putih', 'pakaian', 'buah', '2026-06-08 12:07:47.383121');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (14, 'Baju Gelap', 'pakaian', 'buah', '2026-06-08 12:08:03.104713');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (15, 'Pulpen', 'alat_tulis', 'pcs', '2026-06-08 12:09:51.218318');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (16, 'Pensil', 'alat_kebersihan', 'pcs', '2026-06-08 12:09:57.410485');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (17, 'Penghapus', 'alat_tulis', 'pcs', '2026-06-08 12:10:08.078853');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (18, 'Penggaris', 'alat_tulis', 'buah', '2026-06-08 12:10:20.930497');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (19, 'Piring', 'alat_makan', 'buah', '2026-06-08 12:10:43.078378');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (20, 'Mangkuk', 'alat_makan', 'buah', '2026-06-08 12:12:40.328999');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (21, 'Tabung Gas', 'alat_masak', 'buah', '2026-06-08 12:16:30.992111');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (22, 'Lap Lantai', 'alat_kebersihan', 'buah', '2026-06-08 12:16:46.340774');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (24, 'Sabun Cuci Tangan', 'alat_kebersihan', 'buah', '2026-06-08 12:17:34.175184');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (25, 'Sabun Cuci Piring', 'alat_kebersihan', 'buah', '2026-06-08 12:18:07.284638');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (26, 'Sabun Mandi', 'alat_kebersihan', 'buah', '2026-06-08 12:18:18.662643');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (27, 'Harpic', 'alat_kebersihan', 'botol', '2026-06-08 12:18:38.493604');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (28, 'Vixal', 'alat_kebersihan', 'Botol', '2026-06-08 12:18:49.374407');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (29, 'Pisau', 'alat_masak', 'buah', '2026-06-08 12:19:09.526297');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (30, 'Gunting', 'alat_tulis', 'buah', '2026-06-08 12:19:33.358296');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (31, 'Kasur', 'tempat_tidur', 'buah', '2026-06-08 12:27:57.202905');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (32, 'Selimut', 'tempat_tidur', 'buah', '2026-06-08 12:28:09.457339');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (34, 'Guling', 'tempat_tidur', 'Buah', '2026-06-08 12:28:29.451185');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (35, 'Celana Training', 'pakaian', 'buah', '2026-06-08 12:29:02.362457');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (36, 'Kaos', 'pakaian', 'buah', '2026-06-08 12:29:55.518932');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (38, 'Sandal', 'pakaian', 'pasang', '2026-06-08 12:30:22.341784');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (37, 'Sepatu', 'pakaian', 'pasang', '2026-06-08 12:30:03.064428');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (39, 'Tepung', 'stock_makanan', 'kg', '2026-06-08 12:31:34.083567');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (41, 'Garam', 'stock_makanan', 'gram', '2026-06-08 12:32:42.854658');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (40, 'Gula', 'stock_makanan', 'kg', '2026-06-08 12:31:50.917081');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (42, 'Kipas Angin', 'alat_elektronik', 'buah', '2026-06-08 12:36:19.636034');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (43, 'Charger Handphone', 'alat_elektronik', 'buah', '2026-06-08 12:37:08.445799');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (44, 'Charger Laptop', 'alat_elektronik', 'buah', '2026-06-08 12:37:17.012893');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (46, 'Sprei Kasur', 'tempat_tidur', 'buah', '2026-06-08 12:38:19.654176');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (47, 'Sarung Bantal', 'tempat_tidur', 'buah', '2026-06-08 12:38:32.838085');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (48, 'Sarung Guling', 'tempat_tidur', 'buah', '2026-06-08 12:38:50.988577');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (23, 'Lap Meja / Serbet', 'alat_kebersihan', 'buah', '2026-06-08 12:17:07.108665');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (49, 'Saus Sambal', 'stock_makanan', 'botol', '2026-06-08 12:40:11.141055');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (51, 'Tissue', 'alat_kebersihan', 'kotak', '2026-06-08 12:40:35.539683');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (53, 'Senter', 'darurat', 'buah', '2026-06-08 12:41:17.534456');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (54, 'Tali', 'darurat', 'buah', '2026-06-08 12:41:30.735373');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (56, 'Celana Panjang', 'pakaian', 'buah', '2026-06-08 12:42:00.303055');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (55, 'Celana Pendek', 'pakaian', 'buah', '2026-06-08 12:41:49.261461');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (57, 'Mukena', 'pakaian', 'buah', '2026-06-08 12:42:20.047167');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (58, 'Sarung', 'pakaian', 'buah', '2026-06-08 12:42:28.311702');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (59, 'Koko', 'pakaian', 'buah', '2026-06-08 12:42:39.520901');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (60, 'Kerudung / Hijab', 'pakaian', 'buah', '2026-06-08 12:42:52.219636');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (62, 'Peniti', 'darurat', 'pcs', '2026-06-08 12:43:13.213181');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (61, 'Jarum', 'darurat', 'pcs', '2026-06-08 12:43:07.340932');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (63, 'Tas Laundry', 'alat_kebersihan', 'buah', '2026-06-08 12:43:46.728233');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (64, 'Tas / Backpack', 'alat_tulis', 'buah', '2026-06-08 12:44:15.28699');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (65, 'Jacket / Hoodie / Jumper', 'pakaian', 'buah', '2026-06-08 12:45:25.986326');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (66, 'Sweatshirt', 'pakaian', 'buah', '2026-06-08 12:45:35.165629');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (69, 'Kemeja', 'pakaian', 'Buah', '2026-06-08 12:59:05.713339');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (70, 'Baju Santai', 'pakaian', 'buah', '2026-06-08 12:59:55.12998');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (71, 'Gamis', 'pakaian', 'buah', '2026-06-08 13:00:01.676524');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (72, 'Kaus Kaki', 'pakaian', 'pasang', '2026-06-08 13:00:07.964601');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (73, 'Botol Minum', 'alat_makan', 'buah', '2026-06-08 13:00:26.00532');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (74, 'Gelas', 'alat_makan', 'Buah', '2026-06-08 13:00:33.641971');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (75, 'Trash Bag', 'alat_kebersihan', 'Buah', '2026-06-08 13:01:03.123449');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (76, 'Parfum', 'pakaian', 'botol', '2026-06-08 13:01:17.605569');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (77, 'Deodorant', 'pakaian', 'buah', '2026-06-08 13:01:29.188425');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (78, 'Shampoo', 'alat_kebersihan', 'buah', '2026-06-08 13:02:06.402555');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (79, 'Sikat Gigi', 'alat_kebersihan', 'buah', '2026-06-08 13:02:17.275927');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (80, 'Sikat WC', 'alat_kebersihan', 'buah', '2026-06-08 13:02:29.09404');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (81, 'Buku Folio', 'alat_tulis', 'buah', '2026-06-08 13:21:43.744274');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (82, 'Kertas F4', 'alat_kebersihan', 'lembar', '2026-06-08 13:21:56.227301');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (83, 'Kertas A4', 'alat_kebersihan', 'lembar', '2026-06-08 13:22:08.007348');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (84, 'Wadah Container Kecil', 'alat_makan', 'Buah', '2026-06-08 13:22:28.719578');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (85, 'Sabut Stainless Steel', 'alat_kebersihan', 'buah', '2026-06-08 13:22:45.982783');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (86, 'Spone Cuci Piring', 'alat_kebersihan', 'buah', '2026-06-08 13:23:00.128768');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (87, 'Pel', 'alat_kebersihan', 'buah', '2026-06-08 17:31:27.473872');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (88, 'Ember', 'alat_kebersihan', 'buah', '2026-06-08 17:31:36.354838');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (89, 'Gayung', 'alat_kebersihan', 'buah', '2026-06-08 17:31:44.407477');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (91, 'Spatula', 'alat_kebersihan', 'buah', '2026-06-08 17:32:13.032329');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (90, 'Saringan Minyak', 'alat_masak', 'buah', '2026-06-08 17:32:01.166498');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (92, 'Saringan Mie', 'alat_masak', 'buah', '2026-06-08 17:32:41.734665');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (93, 'Thermos', 'alat_makan', 'buah', '2026-06-08 17:33:14.338012');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (94, 'Peci', 'pakaian', 'buah', '2026-06-08 17:33:44.680965');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (95, 'T Listrik', 'alat_elektronik', 'buah', '2026-06-08 17:34:06.599493');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (97, 'Sajadah', 'pakaian', 'buah', '2026-06-08 18:02:59.239611');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (98, 'Tikar', 'tempat_tidur', 'buah', '2026-06-08 18:03:18.949993');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (99, 'Galon Air', 'alat_makan', 'buah', '2026-06-08 18:04:15.344103');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (100, 'Kompor', 'alat_masak', 'buah', '2026-06-08 18:04:29.131909');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (101, 'Plester', 'darurat', 'buah', '2026-06-08 18:05:16.924098');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (102, 'Obat Gerd', 'darurat', 'butir', '2026-06-08 18:05:45.713041');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (52, 'Paracetamol', 'alat_kebersihan', 'butir', '2026-06-08 12:41:07.73913');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (103, 'Obat Alergi', 'darurat', 'butir', '2026-06-08 18:06:07.408349');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (104, 'Rak Sepatu', 'alat_kebersihan', 'buah', '2026-06-09 02:38:47.969595');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (106, 'Alcohol Swab', 'alat_kebersihan', 'buah', '2026-06-09 03:58:36.099893');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (105, 'Alcohol Spray', 'alat_kebersihan', 'botol', '2026-06-09 03:58:20.29169');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (107, 'Wajan', 'alat_masak', 'buah', '2026-06-09 04:07:57.565205');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (108, 'Setrika', 'alat_kebersihan', 'buah', '2026-06-09 04:08:27.599713');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (109, 'Handuk', 'alat_kebersihan', 'buah', '2026-06-09 04:08:43.333862');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (110, 'bed cover', 'tempat_tidur', 'buah', '2026-06-09 05:32:28.638778');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (111, 'minyak kayu putih', 'darurat', 'buah', '2026-06-09 05:35:02.91501');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (112, 'ibuprofen', 'darurat', 'strip', '2026-06-09 05:35:17.677454');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (113, 'promag', 'darurat', '1 strip', '2026-06-09 05:35:33.492004');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (114, 'pembalut malam', 'darurat', 'pack', '2026-06-09 05:36:11.303215');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (115, 'pembalut siang', 'darurat', 'pack', '2026-06-09 05:36:26.564287');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (68, 'Earphone', 'device', 'buah', '2026-06-08 12:45:48.298498');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (33, 'Bantal', 'tempat_tidur', 'buah', '2026-06-08 12:28:22.5835');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (67, 'Mouse', 'device', 'buah', '2026-06-08 12:45:42.443903');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (45, 'Terminal Listrik/Kabel Roll', 'alat_elektronik', 'buah', '2026-06-08 12:38:00.329093');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (50, 'Kecap', 'stock_makanan', 'botol', '2026-06-08 12:40:17.32475');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (96, 'Mie Instant', 'stock_makanan', 'bungkus', '2026-06-08 18:02:10.542787');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (117, 'notes kecil', 'alat_tulis', 'buah', '2026-06-09 05:55:38.14268');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (123, 'conditioner', 'alat_kebersihan', 'buah', '2026-06-09 06:10:38.743331');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (124, 'spons mandi', 'alat_kebersihan', 'buah', '2026-06-09 06:10:47.563089');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (125, 'sikat mandi', 'alat_kebersihan', 'buah', '2026-06-09 06:10:57.192358');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (126, 'pasta gigi', 'alat_kebersihan', 'buah', '2026-06-09 06:11:08.290313');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (127, 'sabun cuci', 'alat_kebersihan', 'buah', '2026-06-09 06:11:19.391988');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (128, 'sikat cuci', 'alat_kebersihan', 'buah', '2026-06-09 06:11:31.007523');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (129, 'hanger', 'alat_kebersihan', 'buah', '2026-06-09 06:11:51.728984');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (130, 'kispray', 'alat_kebersihan', 'botol', '2026-06-09 06:12:09.38904');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (131, 'kapas', 'alat_kebersihan', 'wadah', '2026-06-09 06:12:18.918377');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (132, 'skincare', 'alat_kebersihan', 'buah', '2026-06-09 06:12:30.388854');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (133, 'make up', 'alat_kebersihan', 'buah', '2026-06-09 06:12:58.165549');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (134, 'wadah mandi', 'alat_kebersihan', 'buah', '2026-06-09 06:13:10.364892');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (136, 'almamater', 'pakaian', 'buah', '2026-06-09 06:25:23.366887');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (137, 'Alas setrika', 'alat_elektronik', 'buah', '2026-06-09 06:25:47.841097');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (138, 'rok', 'pakaian', 'buah', '2026-06-09 06:26:08.067982');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (139, 'kemeja formal', 'pakaian', 'buah', '2026-06-09 06:26:21.700248');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (140, 'celana formal', 'pakaian', 'buah', '2026-06-09 06:26:32.921082');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (141, 'kaos panjang', 'pakaian', 'buah', '2026-06-09 06:26:46.426339');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (142, 'kaos pendek', 'pakaian', 'buah', '2026-06-09 06:26:56.820975');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (143, 'tunik', 'pakaian', '1', '2026-06-09 06:27:06.64551');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (144, 'kerudung rabbani', 'pakaian', 'buah', '2026-06-09 06:27:17.829182');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (145, 'kerudung bergi', 'alat_kebersihan', 'buah', '2026-06-09 06:27:26.532548');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (146, 'kerudung segitiga', 'pakaian', 'buah', '2026-06-09 06:27:38.280611');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (147, 'kerudung pashmina', 'pakaian', 'buah', '2026-06-09 06:27:54.742604');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (148, 'topi', 'pakaian', 'buah', '2026-06-09 06:28:06.074738');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (149, 'daleman', 'pakaian', 'set', '2026-06-09 06:28:34.284541');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (150, 'kaus kaki pendek', 'pakaian', 'pasang', '2026-06-09 06:28:58.258119');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (151, 'kaus kaki panjang', 'pakaian', 'pasang', '2026-06-09 06:29:09.145806');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (135, 'Powerbank', 'device', 'buah', '2026-06-09 06:17:48.786789');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (152, 'sandal jepit', 'pakaian', 'pasang', '2026-06-09 06:29:23.035713');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (153, 'sandal kodok', 'pakaian', 'pasang', '2026-06-09 06:29:33.969679');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (154, 'flatshoes', 'pakaian', 'pasang', '2026-06-09 06:29:47.330435');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (155, 'Jam tangan/smartwatch', 'device', 'buah', '2026-06-09 06:36:27.467162');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (120, 'Baskom', 'alat_masak', 'buah', '2026-06-09 06:03:43.869165');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (118, 'Tempat lauk mateng (kuah)', 'alat_masak', 'buah', '2026-06-09 06:03:11.62965');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (119, 'Tempat lauk mateng (goreng)', 'alat_masak', 'buah', '2026-06-09 06:03:31.232832');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (121, 'Sendok sayur', 'alat_masak', 'buah', '2026-06-09 06:03:56.529314');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (122, 'Sutil', 'alat_masak', 'buah', '2026-06-09 06:04:05.809515');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (116, 'Kipas portable', 'alat_elektronik', 'buah', '2026-06-09 05:53:50.388698');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (156, 'Keset/alas kaki', 'alat_kebersihan', 'pcs', '2026-06-09 06:43:49.876131');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (157, 'Talenan', 'alat_masak', 'buah', '2026-06-09 14:58:14.23917');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (158, 'gunting kuku', 'alat_kebersihan', 'buah', '2026-06-09 15:03:25.225125');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (159, 'cotton bud', 'alat_kebersihan', 'wadah', '2026-06-09 15:03:35.091706');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (160, 'masker', 'alat_kebersihan', 'pack', '2026-06-09 15:03:44.958373');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (161, 'Pompa galon', 'alat_elektronik', 'buah', '2026-06-09 15:18:39.10749');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (164, 'Sumpit', 'alat_makan', 'buah', '2026-06-09 17:12:58.995655');
INSERT INTO public.item_catalog (id, name, category, unit, created_at) VALUES (165, 'Tumbler', 'alat_makan', 'botol', '2026-06-09 17:14:17.939088');


--
-- Data for Name: kas; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: iuran_makan_payments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.iuran_makan_payments (id, member_name, week_label, amount, notes, created_at, kas_id) VALUES (12, 'Muhamad Naufal', '2026-W26', 100000, NULL, '2026-06-08 10:29:26.555781', NULL);


--
-- Data for Name: kas_config; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.kas_config (key, value) VALUES ('weekly_food_amount', '100000');
INSERT INTO public.kas_config (key, value) VALUES ('emergency_fund_target', '500000');


--
-- Data for Name: kas_items; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: program_schedules; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: logbook_entries; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: logbook_photos; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: member_conditions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.member_conditions (id, member_name, type, description, created_at) VALUES (3, 'Tiara Nuril Safitri', 'fobia', 'Fobia cabai', '2026-06-09 03:28:24.3371');
INSERT INTO public.member_conditions (id, member_name, type, description, created_at) VALUES (4, 'Muhamad Naufal', 'alergi', 'Dingin', '2026-06-09 03:34:44.616884');
INSERT INTO public.member_conditions (id, member_name, type, description, created_at) VALUES (5, 'Muhamad Naufal', 'fobia', 'Seafood', '2026-06-09 03:35:00.969733');
INSERT INTO public.member_conditions (id, member_name, type, description, created_at) VALUES (6, 'Muhamad Naufal', 'sakit bawaan', 'Tangan Tremor', '2026-06-09 03:35:25.406771');
INSERT INTO public.member_conditions (id, member_name, type, description, created_at) VALUES (8, 'Navida Fitria', 'alergi', 'Debu', '2026-06-09 06:45:48.927957');
INSERT INTO public.member_conditions (id, member_name, type, description, created_at) VALUES (9, 'Navida Fitria', 'alergi', 'Dingin', '2026-06-09 06:46:00.684241');
INSERT INTO public.member_conditions (id, member_name, type, description, created_at) VALUES (10, 'Navida Fitria', 'sakit bawaan', 'Magh', '2026-06-09 06:46:16.725142');
INSERT INTO public.member_conditions (id, member_name, type, description, created_at) VALUES (11, 'Navida Fitria', 'sakit bawaan', 'Asma', '2026-06-09 06:46:49.530213');
INSERT INTO public.member_conditions (id, member_name, type, description, created_at) VALUES (12, 'Vrizcka Aullia Asmara', 'sakit bawaan', 'Gerd', '2026-06-09 06:47:05.904838');
INSERT INTO public.member_conditions (id, member_name, type, description, created_at) VALUES (7, 'Fadhilah Apta Nur Safitri', 'lainnya', 'TFCC tear kanan (ngilu/kebas/kaku ketika overused)', '2026-06-09 06:13:05.478871');


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.members (id, name, system_role, division_role, password_hash, avatar_url, created_at) VALUES (6, 'Vrizcka Aullia Asmara', 'anggota', 'Humas', '$2b$10$btkzXpO6uKRaIGbcpoxGl.7lAPqQx3E85JhOz28VxyBaE3VorgPuG', NULL, '2026-06-08 01:06:58.147084');
INSERT INTO public.members (id, name, system_role, division_role, password_hash, avatar_url, created_at) VALUES (8, 'Dewi Anita Sari', 'anggota', 'PDD', '$2b$10$WoNK755JT4NK8WBP0VELT.liWW54mx.Vov8BtaCg8CS25r4bbnqpy', NULL, '2026-06-08 01:06:58.325608');
INSERT INTO public.members (id, name, system_role, division_role, password_hash, avatar_url, created_at) VALUES (4, 'Navida Fitria', 'anggota', 'Acara', '$2b$10$b3hWuklrVL/AYMJWT0beCObSj2OTAKkHoxmRIIuVogUfwVE5aIYGa', NULL, '2026-06-08 01:06:57.969403');
INSERT INTO public.members (id, name, system_role, division_role, password_hash, avatar_url, created_at) VALUES (1, 'Muhamad Naufal', 'ketua', 'Kormades', '$2b$10$L7jx/X.0UNcpS2onijk/nOnmLhGKavc5l6JvWyT3OYV6m1wSwYcl6', '/api/storage/objects/uploads/3b716dda-ecfd-485d-8d9e-84cd29ee4b7b', '2026-06-08 01:06:57.67779');
INSERT INTO public.members (id, name, system_role, division_role, password_hash, avatar_url, created_at) VALUES (3, 'Lutfia Tri Rahmacahyani', 'bendahara', 'Bendahara', '$2b$10$GPZfOtP.HUukUz8aw/ct0umroIj1eKHkwQ6YjiaxQuCP895jAiRp6', NULL, '2026-06-08 01:06:57.880062');
INSERT INTO public.members (id, name, system_role, division_role, password_hash, avatar_url, created_at) VALUES (5, 'Miftakhul Jannah', 'anggota', 'Acara', '$2b$10$oAy306PmALhdS3T6vlAm2OmXSMXN5iNyh/NXXZy6Xk3FcNMvOsXOW', NULL, '2026-06-08 01:06:58.05785');
INSERT INTO public.members (id, name, system_role, division_role, password_hash, avatar_url, created_at) VALUES (7, 'Quro''atul A''ini', 'anggota', 'Humas', '$2b$10$c4VyE17z3s4kIADinRo78.TaiK.3vm1Fqg2Z4pEd.xECqK5t5Xf5.', NULL, '2026-06-08 01:06:58.236711');
INSERT INTO public.members (id, name, system_role, division_role, password_hash, avatar_url, created_at) VALUES (2, 'Fadhilah Apta Nur Safitri', 'sekretaris', 'Sekretaris', '$2b$10$kNNmU7R/A35nk5rwlwZ4dO/7Hg32ZesR9f3Y6o4NuElpwk2OZSdri', '/api/storage/objects/uploads/6d333d31-9c3f-4302-b944-264e1b391433', '2026-06-08 01:06:57.790502');
INSERT INTO public.members (id, name, system_role, division_role, password_hash, avatar_url, created_at) VALUES (9, 'Tiara Nuril Safitri', 'anggota', 'PDD', '$2b$10$LsVb7lwUg4uD5Ei2syyH5OFpV5uVfvHBJYYlwHvt3UOJjmcGusbmO', NULL, '2026-06-08 01:06:58.414904');


--
-- Data for Name: notulensi; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (29, 'Bendahara', 'pengumuman', false);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (30, 'Bendahara', 'deadline', false);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (32, 'Bendahara', 'our-work', false);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (35, 'Bendahara', 'notulensi', false);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (41, 'Acara', 'kas', false);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (42, 'Acara', 'notulensi', false);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (43, 'Humas', 'pengumuman', false);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (48, 'Humas', 'kas', false);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (49, 'Humas', 'notulensi', false);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (50, 'PDD', 'pengumuman', false);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (54, 'PDD', 'masalah', false);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (55, 'PDD', 'kas', false);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (56, 'PDD', 'notulensi', false);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (26, 'Sekretaris', 'masalah', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (15, 'Kormades', 'pengumuman', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (19, 'Kormades', 'masalah', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (17, 'Kormades', 'our-life', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (21, 'Kormades', 'notulensi', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (16, 'Kormades', 'deadline', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (20, 'Kormades', 'kas', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (18, 'Kormades', 'our-work', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (22, 'Sekretaris', 'pengumuman', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (24, 'Sekretaris', 'our-life', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (28, 'Sekretaris', 'notulensi', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (27, 'Sekretaris', 'kas', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (25, 'Sekretaris', 'our-work', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (23, 'Sekretaris', 'deadline', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (34, 'Bendahara', 'kas', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (33, 'Bendahara', 'masalah', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (37, 'Acara', 'deadline', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (39, 'Acara', 'our-work', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (40, 'Acara', 'masalah', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (36, 'Acara', 'pengumuman', false);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (44, 'Humas', 'deadline', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (46, 'Humas', 'our-work', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (51, 'PDD', 'deadline', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (53, 'PDD', 'our-work', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (31, 'Bendahara', 'our-life', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (38, 'Acara', 'our-life', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (45, 'Humas', 'our-life', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (47, 'Humas', 'masalah', true);
INSERT INTO public.permissions (id, role, resource, can_edit) VALUES (52, 'PDD', 'our-life', true);


--
-- Data for Name: proker_funds; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.templates (id, title, category, content, created_at) VALUES (1, 'Laporan Kegiatan Harian', 'laporan', 'LAPORAN KEGIATAN HARIAN

Hari/Tanggal: _______________
Kegiatan: _______________
Waktu: _______________
Tempat: _______________
Peserta: _______________

Deskripsi Kegiatan:
_______________

Hasil yang Dicapai:
_______________

Kendala:
_______________

Rencana Tindak Lanjut:
_______________', '2026-06-06 17:51:45.573915');
INSERT INTO public.templates (id, title, category, content, created_at) VALUES (2, 'Notulen Rapat', 'administrasi', 'NOTULEN RAPAT

Hari/Tanggal: _______________
Waktu: _______________
Tempat: _______________
Pimpinan Rapat: _______________

Peserta yang Hadir:
1. _______________
2. _______________

Agenda:
1. _______________

Hasil Rapat:
1. _______________

Kesimpulan:
_______________', '2026-06-06 17:51:45.573915');
INSERT INTO public.templates (id, title, category, content, created_at) VALUES (3, 'Surat Permohonan', 'surat', 'Kepada Yth.
_______________
di Tempat

Dengan hormat,
Kami Tim KKN Universitas ___ memohon izin untuk _______________.

Demikian permohonan ini kami sampaikan. Atas perkenan Bapak/Ibu, kami ucapkan terima kasih.

Hormat kami,
Tim KKN
Kormades,

Muhamad Naufal', '2026-06-06 17:51:45.573915');
INSERT INTO public.templates (id, title, category, content, created_at) VALUES (4, 'Test Template', 'Test', 'Test content', '2026-06-08 05:23:32.812076');


--
-- Data for Name: transfer_kas; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcements_id_seq', 3, true);


--
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attendance_id_seq', 18, true);


--
-- Name: cleaning_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cleaning_schedules_id_seq', 3, true);


--
-- Name: complaints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.complaints_id_seq', 2, true);


--
-- Name: cooking_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cooking_schedules_id_seq', 6, true);


--
-- Name: deadlines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.deadlines_id_seq', 7, true);


--
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_id_seq', 356, true);


--
-- Name: issues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.issues_id_seq', 3, true);


--
-- Name: item_catalog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.item_catalog_id_seq', 165, true);


--
-- Name: iuran_makan_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.iuran_makan_payments_id_seq', 25, true);


--
-- Name: kas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.kas_id_seq', 38, true);


--
-- Name: kas_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.kas_items_id_seq', 2, true);


--
-- Name: logbook_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.logbook_entries_id_seq', 2, true);


--
-- Name: logbook_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.logbook_photos_id_seq', 1, true);


--
-- Name: member_conditions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.member_conditions_id_seq', 12, true);


--
-- Name: members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.members_id_seq', 9, true);


--
-- Name: notulensi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notulensi_id_seq', 2, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permissions_id_seq', 56, true);


--
-- Name: program_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.program_schedules_id_seq', 7, true);


--
-- Name: proker_funds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.proker_funds_id_seq', 3, true);


--
-- Name: templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.templates_id_seq', 4, true);


--
-- Name: transfer_kas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transfer_kas_id_seq', 8, true);


--
-- PostgreSQL database dump complete
--

\unrestrict YNfjOIrX6Yq3FDDPtWgL93m3dbCyPqgN0jVIHGeWrUJVaGE5xpJwm48qkyf2XO2

