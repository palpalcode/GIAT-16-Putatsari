--
-- PostgreSQL database dump
--

\restrict 3nanfBVribTW0VqiqTjJncxdB2q89cPDo9ZKgYoyS090f4fgeTYh7YCK5vJrAke

-- Dumped from database version 16.10
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

INSERT INTO public.attendance VALUES (2, 'Fadhilah Apta Nur Safitri', '2026-06-08', 'hadir', NULL, '2026-06-08 02:43:46.542627');
INSERT INTO public.attendance VALUES (4, 'Miftakhul Jannah', '2026-06-08', 'izin', NULL, '2026-06-08 03:09:29.687322');
INSERT INTO public.attendance VALUES (5, 'Navida Fitria', '2026-06-08', 'izin', NULL, '2026-06-08 03:09:29.999936');
INSERT INTO public.attendance VALUES (6, 'Quro''atul A''ini', '2026-06-08', 'alfa', NULL, '2026-06-08 03:09:31.590322');
INSERT INTO public.attendance VALUES (7, 'Vrizcka Aullia Asmara', '2026-06-08', 'alfa', NULL, '2026-06-08 03:09:32.641996');
INSERT INTO public.attendance VALUES (8, 'Dewi Anita Sari', '2026-06-08', 'sakit', NULL, '2026-06-08 03:09:33.409412');
INSERT INTO public.attendance VALUES (9, 'Tiara Nuril Safitri', '2026-06-08', 'izin', NULL, '2026-06-08 03:09:35.554762');
INSERT INTO public.attendance VALUES (10, 'Muhamad Naufal', '2026-06-15', 'hadir', NULL, '2026-06-08 03:10:57.480624');
INSERT INTO public.attendance VALUES (11, 'Lutfia Tri Rahmacahyani', '2026-06-15', 'izin', NULL, '2026-06-08 03:10:59.321137');
INSERT INTO public.attendance VALUES (12, 'Navida Fitria', '2026-06-15', 'sakit', NULL, '2026-06-08 03:11:00.577024');
INSERT INTO public.attendance VALUES (13, 'Vrizcka Aullia Asmara', '2026-06-15', 'sakit', NULL, '2026-06-08 03:11:01.949294');
INSERT INTO public.attendance VALUES (14, 'Dewi Anita Sari', '2026-06-15', 'izin', NULL, '2026-06-08 03:11:03.412313');
INSERT INTO public.attendance VALUES (15, 'Quro''atul A''ini', '2026-06-15', 'alfa', NULL, '2026-06-08 03:11:05.114247');
INSERT INTO public.attendance VALUES (16, 'Tiara Nuril Safitri', '2026-06-15', 'sakit', NULL, '2026-06-08 03:11:08.493218');
INSERT INTO public.attendance VALUES (17, 'Fadhilah Apta Nur Safitri', '2026-06-15', 'izin', NULL, '2026-06-08 03:11:10.667889');
INSERT INTO public.attendance VALUES (3, 'Lutfia Tri Rahmacahyani', '2026-06-08', 'sakit', NULL, '2026-06-08 02:45:14.964305');
INSERT INTO public.attendance VALUES (1, 'Muhamad Naufal', '2026-06-08', 'hadir', NULL, '2026-06-08 02:43:41.008318');
INSERT INTO public.attendance VALUES (18, 'Muhamad Naufal', '2026-06-07', 'hadir', NULL, '2026-06-08 05:38:36.989889');
INSERT INTO public.attendance VALUES (19, 'Muhamad Naufal', '2026-06-09', 'izin', NULL, '2026-06-09 03:05:33.599934');


--
-- Data for Name: cleaning_schedules; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: cooking_schedules; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cooking_schedules VALUES (6, '2026-06-08', '["Miftakhul Jannah", "Vrizcka Aullia Asmara"]', NULL, NULL, '2026-06-08 09:18:14.710596');


--
-- Data for Name: deadlines; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.inventory VALUES (1, 'Perban', 'p3k', 5, 'gulung', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory VALUES (2, 'Plester luka', 'p3k', 20, 'lembar', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory VALUES (3, 'Kapas', 'p3k', 3, 'bungkus', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory VALUES (4, 'Antiseptik Betadine', 'p3k', 2, 'botol', 'Ukuran 100ml', '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory VALUES (5, 'Paracetamol', 'obat', 30, 'tablet', 'Untuk demam dan sakit kepala', '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory VALUES (6, 'Antasida', 'obat', 20, 'tablet', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory VALUES (7, 'Oralit', 'obat', 10, 'sachet', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory VALUES (8, 'Vitamin C', 'obat', 50, 'tablet', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory VALUES (9, 'Stetoskop', 'alkes', 1, 'buah', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory VALUES (10, 'Termometer digital', 'alkes', 2, 'buah', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory VALUES (11, 'Ember', 'umum', 4, 'buah', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory VALUES (12, 'Sapu', 'umum', 3, 'buah', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory VALUES (13, 'Sabun cuci piring', 'umum', 2, 'botol', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory VALUES (14, 'Tisu gulung', 'umum', 6, 'gulung', NULL, '2026-06-06 17:51:26.529319', 'kelompok', NULL, NULL);
INSERT INTO public.inventory VALUES (15, 'Sendook', 'alat_makan', 1, 'Buah', 'asas', '2026-06-08 06:50:13.292703', 'pribadi', 'Lutfia Tri Rahmacahyani', NULL);
INSERT INTO public.inventory VALUES (30, 'Gayung', 'alat_kebersihan', 1, 'buah', NULL, '2026-06-09 05:13:53.316959', 'pinjaman', 'Muhamad Naufal', NULL);


--
-- Data for Name: issues; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: item_catalog; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.item_catalog VALUES (1, 'Panci', 'alat_masak', 'buah', '2026-06-08 11:50:42.521696');
INSERT INTO public.item_catalog VALUES (2, 'Sendok', 'alat_makan', 'pcs', '2026-06-08 12:03:19.567455');
INSERT INTO public.item_catalog VALUES (3, 'Garpu', 'alat_makan', 'pcs', '2026-06-08 12:03:38.468448');
INSERT INTO public.item_catalog VALUES (4, 'Ricecooker', 'alat_masak', 'buah', '2026-06-08 12:04:04.11989');
INSERT INTO public.item_catalog VALUES (5, 'Handphone', 'device', 'buah', '2026-06-08 12:04:19.185132');
INSERT INTO public.item_catalog VALUES (6, 'Laptop', 'device', 'buah', '2026-06-08 12:04:28.891564');
INSERT INTO public.item_catalog VALUES (7, 'Tablet', 'device', 'buah', '2026-06-08 12:04:43.976272');
INSERT INTO public.item_catalog VALUES (8, 'Beras', 'stock_makanan', 'kg', '2026-06-08 12:05:08.788044');
INSERT INTO public.item_catalog VALUES (9, 'Minyak', 'stock_makanan', 'liter', '2026-06-08 12:05:34.608515');
INSERT INTO public.item_catalog VALUES (10, 'Sapu Lantai', 'alat_kebersihan', 'buah', '2026-06-08 12:05:52.586987');
INSERT INTO public.item_catalog VALUES (11, 'Engkrak', 'alat_kebersihan', 'buah', '2026-06-08 12:06:22.740077');
INSERT INTO public.item_catalog VALUES (12, 'Baju Batik', 'pakaian', 'buah', '2026-06-08 12:07:34.093156');
INSERT INTO public.item_catalog VALUES (13, 'Baju Putih', 'pakaian', 'buah', '2026-06-08 12:07:47.383121');
INSERT INTO public.item_catalog VALUES (14, 'Baju Gelap', 'pakaian', 'buah', '2026-06-08 12:08:03.104713');
INSERT INTO public.item_catalog VALUES (15, 'Pulpen', 'alat_tulis', 'pcs', '2026-06-08 12:09:51.218318');
INSERT INTO public.item_catalog VALUES (16, 'Pensil', 'alat_kebersihan', 'pcs', '2026-06-08 12:09:57.410485');
INSERT INTO public.item_catalog VALUES (17, 'Penghapus', 'alat_tulis', 'pcs', '2026-06-08 12:10:08.078853');
INSERT INTO public.item_catalog VALUES (18, 'Penggaris', 'alat_tulis', 'buah', '2026-06-08 12:10:20.930497');
INSERT INTO public.item_catalog VALUES (19, 'Piring', 'alat_makan', 'buah', '2026-06-08 12:10:43.078378');
INSERT INTO public.item_catalog VALUES (20, 'Mangkuk', 'alat_makan', 'buah', '2026-06-08 12:12:40.328999');
INSERT INTO public.item_catalog VALUES (21, 'Tabung Gas', 'alat_masak', 'buah', '2026-06-08 12:16:30.992111');
INSERT INTO public.item_catalog VALUES (22, 'Lap Lantai', 'alat_kebersihan', 'buah', '2026-06-08 12:16:46.340774');
INSERT INTO public.item_catalog VALUES (24, 'Sabun Cuci Tangan', 'alat_kebersihan', 'buah', '2026-06-08 12:17:34.175184');
INSERT INTO public.item_catalog VALUES (25, 'Sabun Cuci Piring', 'alat_kebersihan', 'buah', '2026-06-08 12:18:07.284638');
INSERT INTO public.item_catalog VALUES (26, 'Sabun Mandi', 'alat_kebersihan', 'buah', '2026-06-08 12:18:18.662643');
INSERT INTO public.item_catalog VALUES (27, 'Harpic', 'alat_kebersihan', 'botol', '2026-06-08 12:18:38.493604');
INSERT INTO public.item_catalog VALUES (28, 'Vixal', 'alat_kebersihan', 'Botol', '2026-06-08 12:18:49.374407');
INSERT INTO public.item_catalog VALUES (29, 'Pisau', 'alat_masak', 'buah', '2026-06-08 12:19:09.526297');
INSERT INTO public.item_catalog VALUES (30, 'Gunting', 'alat_tulis', 'buah', '2026-06-08 12:19:33.358296');
INSERT INTO public.item_catalog VALUES (31, 'Kasur', 'tempat_tidur', 'buah', '2026-06-08 12:27:57.202905');
INSERT INTO public.item_catalog VALUES (32, 'Selimut', 'tempat_tidur', 'buah', '2026-06-08 12:28:09.457339');
INSERT INTO public.item_catalog VALUES (33, 'Bantal', 'tempat_tidur', 'Buah', '2026-06-08 12:28:22.5835');
INSERT INTO public.item_catalog VALUES (34, 'Guling', 'tempat_tidur', 'Buah', '2026-06-08 12:28:29.451185');
INSERT INTO public.item_catalog VALUES (35, 'Celana Training', 'pakaian', 'buah', '2026-06-08 12:29:02.362457');
INSERT INTO public.item_catalog VALUES (36, 'Kaos', 'pakaian', 'buah', '2026-06-08 12:29:55.518932');
INSERT INTO public.item_catalog VALUES (38, 'Sandal', 'pakaian', 'pasang', '2026-06-08 12:30:22.341784');
INSERT INTO public.item_catalog VALUES (37, 'Sepatu', 'pakaian', 'pasang', '2026-06-08 12:30:03.064428');
INSERT INTO public.item_catalog VALUES (39, 'Tepung', 'stock_makanan', 'kg', '2026-06-08 12:31:34.083567');
INSERT INTO public.item_catalog VALUES (41, 'Garam', 'stock_makanan', 'gram', '2026-06-08 12:32:42.854658');
INSERT INTO public.item_catalog VALUES (40, 'Gula', 'stock_makanan', 'kg', '2026-06-08 12:31:50.917081');
INSERT INTO public.item_catalog VALUES (42, 'Kipas Angin', 'alat_elektronik', 'buah', '2026-06-08 12:36:19.636034');
INSERT INTO public.item_catalog VALUES (43, 'Charger Handphone', 'alat_elektronik', 'buah', '2026-06-08 12:37:08.445799');
INSERT INTO public.item_catalog VALUES (44, 'Charger Laptop', 'alat_elektronik', 'buah', '2026-06-08 12:37:17.012893');
INSERT INTO public.item_catalog VALUES (45, 'Terminal Listrik / Roll Cable', 'alat_elektronik', 'buah', '2026-06-08 12:38:00.329093');
INSERT INTO public.item_catalog VALUES (46, 'Sprei Kasur', 'tempat_tidur', 'buah', '2026-06-08 12:38:19.654176');
INSERT INTO public.item_catalog VALUES (47, 'Sarung Bantal', 'tempat_tidur', 'buah', '2026-06-08 12:38:32.838085');
INSERT INTO public.item_catalog VALUES (48, 'Sarung Guling', 'tempat_tidur', 'buah', '2026-06-08 12:38:50.988577');
INSERT INTO public.item_catalog VALUES (23, 'Lap Meja / Serbet', 'alat_kebersihan', 'buah', '2026-06-08 12:17:07.108665');
INSERT INTO public.item_catalog VALUES (49, 'Saus Sambal', 'stock_makanan', 'botol', '2026-06-08 12:40:11.141055');
INSERT INTO public.item_catalog VALUES (50, 'Kecap', 'alat_kebersihan', 'botol', '2026-06-08 12:40:17.32475');
INSERT INTO public.item_catalog VALUES (51, 'Tissue', 'alat_kebersihan', 'kotak', '2026-06-08 12:40:35.539683');
INSERT INTO public.item_catalog VALUES (53, 'Senter', 'darurat', 'buah', '2026-06-08 12:41:17.534456');
INSERT INTO public.item_catalog VALUES (54, 'Tali', 'darurat', 'buah', '2026-06-08 12:41:30.735373');
INSERT INTO public.item_catalog VALUES (56, 'Celana Panjang', 'pakaian', 'buah', '2026-06-08 12:42:00.303055');
INSERT INTO public.item_catalog VALUES (55, 'Celana Pendek', 'pakaian', 'buah', '2026-06-08 12:41:49.261461');
INSERT INTO public.item_catalog VALUES (57, 'Mukena', 'pakaian', 'buah', '2026-06-08 12:42:20.047167');
INSERT INTO public.item_catalog VALUES (58, 'Sarung', 'pakaian', 'buah', '2026-06-08 12:42:28.311702');
INSERT INTO public.item_catalog VALUES (59, 'Koko', 'pakaian', 'buah', '2026-06-08 12:42:39.520901');
INSERT INTO public.item_catalog VALUES (60, 'Kerudung / Hijab', 'pakaian', 'buah', '2026-06-08 12:42:52.219636');
INSERT INTO public.item_catalog VALUES (62, 'Peniti', 'darurat', 'pcs', '2026-06-08 12:43:13.213181');
INSERT INTO public.item_catalog VALUES (61, 'Jarum', 'darurat', 'pcs', '2026-06-08 12:43:07.340932');
INSERT INTO public.item_catalog VALUES (63, 'Tas Laundry', 'alat_kebersihan', 'buah', '2026-06-08 12:43:46.728233');
INSERT INTO public.item_catalog VALUES (64, 'Tas / Backpack', 'alat_tulis', 'buah', '2026-06-08 12:44:15.28699');
INSERT INTO public.item_catalog VALUES (65, 'Jacket / Hoodie / Jumper', 'pakaian', 'buah', '2026-06-08 12:45:25.986326');
INSERT INTO public.item_catalog VALUES (66, 'Sweatshirt', 'pakaian', 'buah', '2026-06-08 12:45:35.165629');
INSERT INTO public.item_catalog VALUES (67, 'Mouse', 'alat_elektronik', 'buah', '2026-06-08 12:45:42.443903');
INSERT INTO public.item_catalog VALUES (68, 'Earphone', 'alat_elektronik', 'buah', '2026-06-08 12:45:48.298498');
INSERT INTO public.item_catalog VALUES (69, 'Kemeja', 'pakaian', 'Buah', '2026-06-08 12:59:05.713339');
INSERT INTO public.item_catalog VALUES (70, 'Baju Santai', 'pakaian', 'buah', '2026-06-08 12:59:55.12998');
INSERT INTO public.item_catalog VALUES (71, 'Gamis', 'pakaian', 'buah', '2026-06-08 13:00:01.676524');
INSERT INTO public.item_catalog VALUES (72, 'Kaus Kaki', 'pakaian', 'pasang', '2026-06-08 13:00:07.964601');
INSERT INTO public.item_catalog VALUES (73, 'Botol Minum', 'alat_makan', 'buah', '2026-06-08 13:00:26.00532');
INSERT INTO public.item_catalog VALUES (74, 'Gelas', 'alat_makan', 'Buah', '2026-06-08 13:00:33.641971');
INSERT INTO public.item_catalog VALUES (75, 'Trash Bag', 'alat_kebersihan', 'Buah', '2026-06-08 13:01:03.123449');
INSERT INTO public.item_catalog VALUES (76, 'Parfum', 'pakaian', 'botol', '2026-06-08 13:01:17.605569');
INSERT INTO public.item_catalog VALUES (77, 'Deodorant', 'pakaian', 'buah', '2026-06-08 13:01:29.188425');
INSERT INTO public.item_catalog VALUES (78, 'Shampoo', 'alat_kebersihan', 'buah', '2026-06-08 13:02:06.402555');
INSERT INTO public.item_catalog VALUES (79, 'Sikat Gigi', 'alat_kebersihan', 'buah', '2026-06-08 13:02:17.275927');
INSERT INTO public.item_catalog VALUES (80, 'Sikat WC', 'alat_kebersihan', 'buah', '2026-06-08 13:02:29.09404');
INSERT INTO public.item_catalog VALUES (81, 'Buku Folio', 'alat_tulis', 'buah', '2026-06-08 13:21:43.744274');
INSERT INTO public.item_catalog VALUES (82, 'Kertas F4', 'alat_kebersihan', 'lembar', '2026-06-08 13:21:56.227301');
INSERT INTO public.item_catalog VALUES (83, 'Kertas A4', 'alat_kebersihan', 'lembar', '2026-06-08 13:22:08.007348');
INSERT INTO public.item_catalog VALUES (84, 'Wadah Container Kecil', 'alat_makan', 'Buah', '2026-06-08 13:22:28.719578');
INSERT INTO public.item_catalog VALUES (85, 'Sabut Stainless Steel', 'alat_kebersihan', 'buah', '2026-06-08 13:22:45.982783');
INSERT INTO public.item_catalog VALUES (86, 'Spone Cuci Piring', 'alat_kebersihan', 'buah', '2026-06-08 13:23:00.128768');
INSERT INTO public.item_catalog VALUES (87, 'Pel', 'alat_kebersihan', 'buah', '2026-06-08 17:31:27.473872');
INSERT INTO public.item_catalog VALUES (88, 'Ember', 'alat_kebersihan', 'buah', '2026-06-08 17:31:36.354838');
INSERT INTO public.item_catalog VALUES (89, 'Gayung', 'alat_kebersihan', 'buah', '2026-06-08 17:31:44.407477');
INSERT INTO public.item_catalog VALUES (91, 'Spatula', 'alat_kebersihan', 'buah', '2026-06-08 17:32:13.032329');
INSERT INTO public.item_catalog VALUES (90, 'Saringan Minyak', 'alat_masak', 'buah', '2026-06-08 17:32:01.166498');
INSERT INTO public.item_catalog VALUES (92, 'Saringan Mie', 'alat_masak', 'buah', '2026-06-08 17:32:41.734665');
INSERT INTO public.item_catalog VALUES (93, 'Thermos', 'alat_makan', 'buah', '2026-06-08 17:33:14.338012');
INSERT INTO public.item_catalog VALUES (94, 'Peci', 'pakaian', 'buah', '2026-06-08 17:33:44.680965');
INSERT INTO public.item_catalog VALUES (95, 'T Listrik', 'alat_elektronik', 'buah', '2026-06-08 17:34:06.599493');
INSERT INTO public.item_catalog VALUES (96, 'Mie Instant', 'alat_kebersihan', 'bungkus', '2026-06-08 18:02:10.542787');
INSERT INTO public.item_catalog VALUES (97, 'Sajadah', 'pakaian', 'buah', '2026-06-08 18:02:59.239611');
INSERT INTO public.item_catalog VALUES (98, 'Tikar', 'tempat_tidur', 'buah', '2026-06-08 18:03:18.949993');
INSERT INTO public.item_catalog VALUES (99, 'Galon Air', 'alat_makan', 'buah', '2026-06-08 18:04:15.344103');
INSERT INTO public.item_catalog VALUES (100, 'Kompor', 'alat_masak', 'buah', '2026-06-08 18:04:29.131909');
INSERT INTO public.item_catalog VALUES (101, 'Plester', 'darurat', 'buah', '2026-06-08 18:05:16.924098');
INSERT INTO public.item_catalog VALUES (102, 'Obat Gerd', 'darurat', 'butir', '2026-06-08 18:05:45.713041');
INSERT INTO public.item_catalog VALUES (52, 'Paracetamol', 'alat_kebersihan', 'butir', '2026-06-08 12:41:07.73913');
INSERT INTO public.item_catalog VALUES (103, 'Obat Alergi', 'darurat', 'butir', '2026-06-08 18:06:07.408349');
INSERT INTO public.item_catalog VALUES (104, 'Cabai', 'stock_makanan', 'pcs', '2026-06-09 05:05:10.684893');
INSERT INTO public.item_catalog VALUES (105, 'TestCabai', 'stock_makanan', 'pcs', '2026-06-09 05:17:27.381329');


--
-- Data for Name: kas; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: iuran_makan_payments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.iuran_makan_payments VALUES (12, 'Muhamad Naufal', '2026-W26', 100000, NULL, '2026-06-08 10:29:26.555781', NULL);


--
-- Data for Name: kas_config; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.kas_config VALUES ('weekly_food_amount', '100000');
INSERT INTO public.kas_config VALUES ('emergency_fund_target', '500000');


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

INSERT INTO public.member_conditions VALUES (1, 'Muhamad Naufal', 'alergi', 'Udang', '2026-06-08 03:14:46.348728');
INSERT INTO public.member_conditions VALUES (2, 'Muhamad Naufal', 'fobia', 'Ketinggian', '2026-06-08 03:32:48.009747');


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.members VALUES (6, 'Vrizcka Aullia Asmara', 'anggota', 'Humas', '$2b$10$btkzXpO6uKRaIGbcpoxGl.7lAPqQx3E85JhOz28VxyBaE3VorgPuG', NULL, '2026-06-08 01:06:58.147084');
INSERT INTO public.members VALUES (8, 'Dewi Anita Sari', 'anggota', 'PDD', '$2b$10$WoNK755JT4NK8WBP0VELT.liWW54mx.Vov8BtaCg8CS25r4bbnqpy', NULL, '2026-06-08 01:06:58.325608');
INSERT INTO public.members VALUES (9, 'Tiara Nuril Safitri', 'anggota', 'PDD', '$2b$10$MfDA29fCmozwg6p3VfrcfOqh7uVa44HWK39VZ.sQJEM3xZFqgkVqW', NULL, '2026-06-08 01:06:58.414904');
INSERT INTO public.members VALUES (4, 'Navida Fitria', 'anggota', 'Acara', '$2b$10$b3hWuklrVL/AYMJWT0beCObSj2OTAKkHoxmRIIuVogUfwVE5aIYGa', NULL, '2026-06-08 01:06:57.969403');
INSERT INTO public.members VALUES (1, 'Muhamad Naufal', 'ketua', 'Kormades', '$2b$10$L7jx/X.0UNcpS2onijk/nOnmLhGKavc5l6JvWyT3OYV6m1wSwYcl6', '/api/storage/objects/uploads/3b716dda-ecfd-485d-8d9e-84cd29ee4b7b', '2026-06-08 01:06:57.67779');
INSERT INTO public.members VALUES (2, 'Fadhilah Apta Nur Safitri', 'sekretaris', 'Sekretaris', '$2b$10$7JbxE8CSCejWYy8x81cpdeegtlvI9rL6U09JUhnyTIiFE3Za8Tloq', NULL, '2026-06-08 01:06:57.790502');
INSERT INTO public.members VALUES (3, 'Lutfia Tri Rahmacahyani', 'bendahara', 'Bendahara', '$2b$10$GPZfOtP.HUukUz8aw/ct0umroIj1eKHkwQ6YjiaxQuCP895jAiRp6', NULL, '2026-06-08 01:06:57.880062');
INSERT INTO public.members VALUES (5, 'Miftakhul Jannah', 'anggota', 'Acara', '$2b$10$oAy306PmALhdS3T6vlAm2OmXSMXN5iNyh/NXXZy6Xk3FcNMvOsXOW', NULL, '2026-06-08 01:06:58.05785');
INSERT INTO public.members VALUES (7, 'Quro''atul A''ini', 'anggota', 'Humas', '$2b$10$c4VyE17z3s4kIADinRo78.TaiK.3vm1Fqg2Z4pEd.xECqK5t5Xf5.', NULL, '2026-06-08 01:06:58.236711');


--
-- Data for Name: notulensi; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.permissions VALUES (29, 'Bendahara', 'pengumuman', false);
INSERT INTO public.permissions VALUES (30, 'Bendahara', 'deadline', false);
INSERT INTO public.permissions VALUES (31, 'Bendahara', 'our-life', false);
INSERT INTO public.permissions VALUES (32, 'Bendahara', 'our-work', false);
INSERT INTO public.permissions VALUES (35, 'Bendahara', 'notulensi', false);
INSERT INTO public.permissions VALUES (41, 'Acara', 'kas', false);
INSERT INTO public.permissions VALUES (42, 'Acara', 'notulensi', false);
INSERT INTO public.permissions VALUES (43, 'Humas', 'pengumuman', false);
INSERT INTO public.permissions VALUES (45, 'Humas', 'our-life', false);
INSERT INTO public.permissions VALUES (47, 'Humas', 'masalah', false);
INSERT INTO public.permissions VALUES (48, 'Humas', 'kas', false);
INSERT INTO public.permissions VALUES (49, 'Humas', 'notulensi', false);
INSERT INTO public.permissions VALUES (50, 'PDD', 'pengumuman', false);
INSERT INTO public.permissions VALUES (52, 'PDD', 'our-life', false);
INSERT INTO public.permissions VALUES (54, 'PDD', 'masalah', false);
INSERT INTO public.permissions VALUES (55, 'PDD', 'kas', false);
INSERT INTO public.permissions VALUES (56, 'PDD', 'notulensi', false);
INSERT INTO public.permissions VALUES (26, 'Sekretaris', 'masalah', true);
INSERT INTO public.permissions VALUES (15, 'Kormades', 'pengumuman', true);
INSERT INTO public.permissions VALUES (19, 'Kormades', 'masalah', true);
INSERT INTO public.permissions VALUES (17, 'Kormades', 'our-life', true);
INSERT INTO public.permissions VALUES (21, 'Kormades', 'notulensi', true);
INSERT INTO public.permissions VALUES (16, 'Kormades', 'deadline', true);
INSERT INTO public.permissions VALUES (20, 'Kormades', 'kas', true);
INSERT INTO public.permissions VALUES (18, 'Kormades', 'our-work', true);
INSERT INTO public.permissions VALUES (22, 'Sekretaris', 'pengumuman', true);
INSERT INTO public.permissions VALUES (24, 'Sekretaris', 'our-life', true);
INSERT INTO public.permissions VALUES (28, 'Sekretaris', 'notulensi', true);
INSERT INTO public.permissions VALUES (27, 'Sekretaris', 'kas', true);
INSERT INTO public.permissions VALUES (25, 'Sekretaris', 'our-work', true);
INSERT INTO public.permissions VALUES (23, 'Sekretaris', 'deadline', true);
INSERT INTO public.permissions VALUES (34, 'Bendahara', 'kas', true);
INSERT INTO public.permissions VALUES (33, 'Bendahara', 'masalah', true);
INSERT INTO public.permissions VALUES (38, 'Acara', 'our-life', false);
INSERT INTO public.permissions VALUES (37, 'Acara', 'deadline', true);
INSERT INTO public.permissions VALUES (39, 'Acara', 'our-work', true);
INSERT INTO public.permissions VALUES (40, 'Acara', 'masalah', true);
INSERT INTO public.permissions VALUES (36, 'Acara', 'pengumuman', false);
INSERT INTO public.permissions VALUES (44, 'Humas', 'deadline', true);
INSERT INTO public.permissions VALUES (46, 'Humas', 'our-work', true);
INSERT INTO public.permissions VALUES (51, 'PDD', 'deadline', true);
INSERT INTO public.permissions VALUES (53, 'PDD', 'our-work', true);


--
-- Data for Name: proker_funds; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.templates VALUES (1, 'Laporan Kegiatan Harian', 'laporan', 'LAPORAN KEGIATAN HARIAN

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
INSERT INTO public.templates VALUES (2, 'Notulen Rapat', 'administrasi', 'NOTULEN RAPAT

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
INSERT INTO public.templates VALUES (3, 'Surat Permohonan', 'surat', 'Kepada Yth.
_______________
di Tempat

Dengan hormat,
Kami Tim KKN Universitas ___ memohon izin untuk _______________.

Demikian permohonan ini kami sampaikan. Atas perkenan Bapak/Ibu, kami ucapkan terima kasih.

Hormat kami,
Tim KKN
Kormades,

Muhamad Naufal', '2026-06-06 17:51:45.573915');
INSERT INTO public.templates VALUES (4, 'Test Template', 'Test', 'Test content', '2026-06-08 05:23:32.812076');


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

SELECT pg_catalog.setval('public.attendance_id_seq', 51, true);


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

SELECT pg_catalog.setval('public.deadlines_id_seq', 4, true);


--
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_id_seq', 30, true);


--
-- Name: issues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.issues_id_seq', 3, true);


--
-- Name: item_catalog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.item_catalog_id_seq', 105, true);


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

SELECT pg_catalog.setval('public.member_conditions_id_seq', 2, true);


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

\unrestrict 3nanfBVribTW0VqiqTjJncxdB2q89cPDo9ZKgYoyS090f4fgeTYh7YCK5vJrAke

