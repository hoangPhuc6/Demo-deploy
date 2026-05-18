-- Demo data. Only run when the users table is empty (handled by index.js).
-- Passwords:
--   admin / Admin@1234
--   staff*, user* / Test@1234

INSERT INTO users (username, email, password, full_name, phone, role, status, is_verified) VALUES
('admin',    'admin@clms.local',    '$2a$10$qGS9kDAfFdEA1vRidbUTKe9VlDbCgnpbSTFtwCyvveUMehVAWn20e', 'System Administrator', '',           'system_admin', 'active', TRUE),
('staff1',   'staff1@clms.local',   '$2a$10$PeFN20X4htdZvw5XEMZqLelV0VNyJtW69vQmU2C.WkGL5btP763p6', 'Lab Staff One',        '0901234567', 'lab_staff',    'active', TRUE),
('staff2',   'staff2@clms.local',   '$2a$10$PeFN20X4htdZvw5XEMZqLelV0VNyJtW69vQmU2C.WkGL5btP763p6', 'Lab Staff Two',        '0901234568', 'lab_staff',    'active', TRUE),
('user1',    'user1@clms.local',    '$2a$10$PeFN20X4htdZvw5XEMZqLelV0VNyJtW69vQmU2C.WkGL5btP763p6', 'Nguyen Van A',         '0912345678', 'customer',     'active', TRUE),
('user2',    'user2@clms.local',    '$2a$10$PeFN20X4htdZvw5XEMZqLelV0VNyJtW69vQmU2C.WkGL5btP763p6', 'Tran Thi B',           '0912345679', 'customer',     'active', TRUE),
('staff3',   'staff3@clms.local',   '$2a$10$PeFN20X4htdZvw5XEMZqLelV0VNyJtW69vQmU2C.WkGL5btP763p6', 'Lab Staff Three',      '0901234569', 'lab_staff',    'active', TRUE),
('staff4',   'staff4@clms.local',   '$2a$10$PeFN20X4htdZvw5XEMZqLelV0VNyJtW69vQmU2C.WkGL5btP763p6', 'Lab Staff Four',       '0901234570', 'lab_staff',    'active', TRUE),
('user3',    'user3@clms.local',    '$2a$10$PeFN20X4htdZvw5XEMZqLelV0VNyJtW69vQmU2C.WkGL5btP763p6', 'Le Van C',             '0912345680', 'customer',     'active', TRUE),
('user4',    'user4@clms.local',    '$2a$10$PeFN20X4htdZvw5XEMZqLelV0VNyJtW69vQmU2C.WkGL5btP763p6', 'Pham Thi D',           '0912345681', 'customer',     'active', TRUE),
('user5',    'user5@clms.local',    '$2a$10$PeFN20X4htdZvw5XEMZqLelV0VNyJtW69vQmU2C.WkGL5btP763p6', 'Hoang Van E',          '0912345682', 'customer',     'active', TRUE),
('user6',    'user6@clms.local',    '$2a$10$PeFN20X4htdZvw5XEMZqLelV0VNyJtW69vQmU2C.WkGL5btP763p6', 'Do Thi F',             '0912345683', 'customer',     'pending', FALSE),
('user7',    'user7@clms.local',    '$2a$10$PeFN20X4htdZvw5XEMZqLelV0VNyJtW69vQmU2C.WkGL5btP763p6', 'Bui Van G',            '0912345684', 'customer',     'active', TRUE),
('user8',    'user8@clms.local',    '$2a$10$PeFN20X4htdZvw5XEMZqLelV0VNyJtW69vQmU2C.WkGL5btP763p6', 'Mai Thi H',            '0912345685', 'customer',     'blocked', TRUE),
('user9',    'user9@clms.local',    '$2a$10$PeFN20X4htdZvw5XEMZqLelV0VNyJtW69vQmU2C.WkGL5btP763p6', 'Vu Van I',             '0912345686', 'customer',     'active', TRUE),
('user10',   'user10@clms.local',   '$2a$10$PeFN20X4htdZvw5XEMZqLelV0VNyJtW69vQmU2C.WkGL5btP763p6', 'Ly Thi K',             '0912345687', 'customer',     'active', TRUE);

INSERT INTO lab_rooms (room_code, name, location, capacity, description, status) VALUES
('LAB-A101', 'Computer Lab A101', 'Building A - Floor 1', 40, 'Main lab with high-end PCs',     'active'),
('LAB-A102', 'Computer Lab A102', 'Building A - Floor 1', 35, 'General purpose computer lab',   'active'),
('LAB-B201', 'Computer Lab B201', 'Building B - Floor 2', 30, 'Programming lab',                'active'),
('LAB-B202', 'Computer Lab B202', 'Building B - Floor 2', 25, 'Network and security lab',       'active'),
('LAB-C301', 'Computer Lab C301', 'Building C - Floor 3', 20, 'Multimedia lab',                 'maintenance'),
('LAB-D401', 'Computer Lab D401', 'Building D - Floor 4', 28, 'Data science lab',               'active'),
('LAB-E501', 'Computer Lab E501', 'Building E - Floor 5', 18, 'AI research lab',                'active');

-- Workstations (5 per lab)
INSERT INTO workstations (lab_room_id, station_code, ip_address, mac_address, cpu, ram_gb, gpu, os, state) VALUES
(1, 'PC-A101-01', '192.168.1.101', 'AA:BB:CC:01:EE:01', 'Intel Core i7-12700', 16, 'NVIDIA GTX 1650',    'Windows 11 Pro',     'available'),
(1, 'PC-A101-02', '192.168.1.102', 'AA:BB:CC:01:EE:02', 'Intel Core i7-12700', 16, 'NVIDIA GTX 1650',    'Windows 11 Pro',     'available'),
(1, 'PC-A101-03', '192.168.1.103', 'AA:BB:CC:01:EE:03', 'Intel Core i7-12700', 16, 'NVIDIA GTX 1650',    'Windows 11 Pro',     'available'),
(1, 'PC-A101-04', '192.168.1.104', 'AA:BB:CC:01:EE:04', 'Intel Core i7-12700', 16, 'NVIDIA GTX 1650',    'Windows 11 Pro',     'maintenance'),
(1, 'PC-A101-05', '192.168.1.105', 'AA:BB:CC:01:EE:05', 'Intel Core i7-12700', 16, 'NVIDIA GTX 1650',    'Windows 11 Pro',     'available'),
(2, 'PC-A102-01', '192.168.2.101', 'AA:BB:CC:02:EE:01', 'Intel Core i5-12400',  8, 'Intel UHD Graphics', 'Windows 11 Pro',     'available'),
(2, 'PC-A102-02', '192.168.2.102', 'AA:BB:CC:02:EE:02', 'Intel Core i5-12400',  8, 'Intel UHD Graphics', 'Windows 11 Pro',     'available'),
(2, 'PC-A102-03', '192.168.2.103', 'AA:BB:CC:02:EE:03', 'Intel Core i5-12400',  8, 'Intel UHD Graphics', 'Windows 11 Pro',     'available'),
(2, 'PC-A102-04', '192.168.2.104', 'AA:BB:CC:02:EE:04', 'Intel Core i5-12400',  8, 'Intel UHD Graphics', 'Windows 11 Pro',     'available'),
(2, 'PC-A102-05', '192.168.2.105', 'AA:BB:CC:02:EE:05', 'Intel Core i5-12400',  8, 'Intel UHD Graphics', 'Windows 11 Pro',     'available'),
(3, 'PC-B201-01', '192.168.3.101', 'AA:BB:CC:03:EE:01', 'AMD Ryzen 7 5800X',   32, 'NVIDIA RTX 3060',    'Ubuntu 22.04 LTS',   'available'),
(3, 'PC-B201-02', '192.168.3.102', 'AA:BB:CC:03:EE:02', 'AMD Ryzen 7 5800X',   32, 'NVIDIA RTX 3060',    'Ubuntu 22.04 LTS',   'available'),
(3, 'PC-B201-03', '192.168.3.103', 'AA:BB:CC:03:EE:03', 'AMD Ryzen 7 5800X',   32, 'NVIDIA RTX 3060',    'Ubuntu 22.04 LTS',   'available'),
(3, 'PC-B201-04', '192.168.3.104', 'AA:BB:CC:03:EE:04', 'AMD Ryzen 7 5800X',   32, 'NVIDIA RTX 3060',    'Ubuntu 22.04 LTS',   'available'),
(3, 'PC-B201-05', '192.168.3.105', 'AA:BB:CC:03:EE:05', 'AMD Ryzen 7 5800X',   32, 'NVIDIA RTX 3060',    'Ubuntu 22.04 LTS',   'available'),
(4, 'PC-B202-01', '192.168.4.101', 'AA:BB:CC:04:EE:01', 'Intel Core i5-11400', 16, 'Intel UHD Graphics', 'Windows 11 Pro',     'available'),
(4, 'PC-B202-02', '192.168.4.102', 'AA:BB:CC:04:EE:02', 'Intel Core i5-11400', 16, 'Intel UHD Graphics', 'Windows 11 Pro',     'available'),
(4, 'PC-B202-03', '192.168.4.103', 'AA:BB:CC:04:EE:03', 'Intel Core i5-11400', 16, 'Intel UHD Graphics', 'Windows 11 Pro',     'available'),
(4, 'PC-B202-04', '192.168.4.104', 'AA:BB:CC:04:EE:04', 'Intel Core i5-11400', 16, 'Intel UHD Graphics', 'Windows 11 Pro',     'available'),
(4, 'PC-B202-05', '192.168.4.105', 'AA:BB:CC:04:EE:05', 'Intel Core i5-11400', 16, 'Intel UHD Graphics', 'Windows 11 Pro',     'available'),
(5, 'PC-C301-01', '192.168.5.101', 'AA:BB:CC:05:EE:01', 'Intel Core i9-12900K',64, 'NVIDIA RTX 3080',    'Windows 11 Pro',     'available'),
(5, 'PC-C301-02', '192.168.5.102', 'AA:BB:CC:05:EE:02', 'Intel Core i9-12900K',64, 'NVIDIA RTX 3080',    'Windows 11 Pro',     'available'),
(5, 'PC-C301-03', '192.168.5.103', 'AA:BB:CC:05:EE:03', 'Intel Core i9-12900K',64, 'NVIDIA RTX 3080',    'Windows 11 Pro',     'available'),
(5, 'PC-C301-04', '192.168.5.104', 'AA:BB:CC:05:EE:04', 'Intel Core i9-12900K',64, 'NVIDIA RTX 3080',    'Windows 11 Pro',     'available'),
(5, 'PC-C301-05', '192.168.5.105', 'AA:BB:CC:05:EE:05', 'Intel Core i9-12900K',64, 'NVIDIA RTX 3080',    'Windows 11 Pro',     'available');

-- Workstations (labs D401, E501)
INSERT INTO workstations (lab_room_id, station_code, ip_address, mac_address, cpu, ram_gb, gpu, os, state) VALUES
(6, 'PC-D401-01', '192.168.6.101', 'AA:BB:CC:06:EE:01', 'Intel Core i7-12700', 16, 'NVIDIA RTX 2060',    'Windows 11 Pro',     'available'),
(6, 'PC-D401-02', '192.168.6.102', 'AA:BB:CC:06:EE:02', 'Intel Core i7-12700', 16, 'NVIDIA RTX 2060',    'Windows 11 Pro',     'available'),
(6, 'PC-D401-03', '192.168.6.103', 'AA:BB:CC:06:EE:03', 'Intel Core i7-12700', 16, 'NVIDIA RTX 2060',    'Windows 11 Pro',     'available'),
(6, 'PC-D401-04', '192.168.6.104', 'AA:BB:CC:06:EE:04', 'Intel Core i7-12700', 16, 'NVIDIA RTX 2060',    'Windows 11 Pro',     'available'),
(6, 'PC-D401-05', '192.168.6.105', 'AA:BB:CC:06:EE:05', 'Intel Core i7-12700', 16, 'NVIDIA RTX 2060',    'Windows 11 Pro',     'available'),
(6, 'PC-D401-06', '192.168.6.106', 'AA:BB:CC:06:EE:06', 'Intel Core i7-12700', 16, 'NVIDIA RTX 2060',    'Windows 11 Pro',     'maintenance'),
(7, 'PC-E501-01', '192.168.7.101', 'AA:BB:CC:07:EE:01', 'AMD Ryzen 9 5900X',   32, 'NVIDIA RTX 3070',    'Ubuntu 22.04 LTS',   'available'),
(7, 'PC-E501-02', '192.168.7.102', 'AA:BB:CC:07:EE:02', 'AMD Ryzen 9 5900X',   32, 'NVIDIA RTX 3070',    'Ubuntu 22.04 LTS',   'available'),
(7, 'PC-E501-03', '192.168.7.103', 'AA:BB:CC:07:EE:03', 'AMD Ryzen 9 5900X',   32, 'NVIDIA RTX 3070',    'Ubuntu 22.04 LTS',   'available'),
(7, 'PC-E501-04', '192.168.7.104', 'AA:BB:CC:07:EE:04', 'AMD Ryzen 9 5900X',   32, 'NVIDIA RTX 3070',    'Ubuntu 22.04 LTS',   'available'),
(7, 'PC-E501-05', '192.168.7.105', 'AA:BB:CC:07:EE:05', 'AMD Ryzen 9 5900X',   32, 'NVIDIA RTX 3070',    'Ubuntu 22.04 LTS',   'available');

INSERT INTO reservations
  (user_id, resource_type, lab_room_id, start_time, end_time, purpose, expected_users, status, processed_by, processed_at)
VALUES
  (4, 'lab_room', 1, '2026-06-20 09:00:00', '2026-06-20 11:00:00', 'Software Engineering Lab Session', 35, 'approved', 2, NOW());

INSERT INTO reservations
  (user_id, resource_type, workstation_id, start_time, end_time, status)
VALUES
  (5, 'workstation', 6, '2026-06-22 14:00:00', '2026-06-22 16:00:00', 'pending');

INSERT INTO reservations
  (user_id, resource_type, lab_room_id, start_time, end_time, purpose, expected_users, status, reject_reason, processed_by, processed_at)
VALUES
  (8,  'lab_room', 2, '2026-06-21 13:00:00', '2026-06-21 15:00:00', 'Database workshop',     20, 'approved',  NULL,               3, NOW()),
  (9,  'lab_room', 3, '2026-06-23 08:00:00', '2026-06-23 10:00:00', 'OOP practice',          25, 'pending',   NULL,               NULL, NULL),
  (10, 'lab_room', 6, '2026-06-24 09:00:00', '2026-06-24 12:00:00', 'Data science bootcamp', 22, 'rejected',  'Schedule conflict', 6, NOW()),
  (12, 'lab_room', 7, '2026-06-25 14:00:00', '2026-06-25 17:00:00', 'AI seminar',            15, 'approved',  NULL,               7, NOW()),
  (13, 'lab_room', 1, '2026-06-26 09:00:00', '2026-06-26 10:00:00', 'Lab tour',              10, 'cancelled', NULL,               NULL, NULL),
  (14, 'lab_room', 4, '2026-06-27 08:00:00', '2026-06-27 11:00:00', 'Network lab practice',  18, 'approved',  NULL,               2, NOW());

INSERT INTO reservations
  (user_id, resource_type, workstation_id, start_time, end_time, purpose, status, processed_by, processed_at)
VALUES
  (8,  'workstation', 3,  '2026-06-21 09:00:00', '2026-06-21 11:00:00', 'Personal practice',   'approved', 2, NOW()),
  (9,  'workstation', 7,  '2026-06-21 10:00:00', '2026-06-21 12:00:00', 'Project work',        'pending',  NULL, NULL),
  (10, 'workstation', 11, '2026-06-22 09:00:00', '2026-06-22 11:00:00', 'Linux lab',           'approved', 3, NOW()),
  (11, 'workstation', 16, '2026-06-23 14:00:00', '2026-06-23 16:00:00', 'Network tools',       'cancelled',NULL, NULL),
  (12, 'workstation', 21, '2026-06-24 08:00:00', '2026-06-24 10:00:00', 'Multimedia editing',  'completed',3, NOW()),
  (15, 'workstation', 24, '2026-06-25 13:00:00', '2026-06-25 15:00:00', 'Graphics project',    'pending',  NULL, NULL);

INSERT INTO incident_tickets (reporter_id, workstation_id, category, description, status) VALUES
  (4, 4, 'hardware', 'Monitor not displaying anything', 'open');

INSERT INTO incident_tickets (reporter_id, workstation_id, category, description, status, assigned_to) VALUES
  (5, 8, 'software', 'VS Code not launching', 'under_review', 2);

INSERT INTO incident_tickets (reporter_id, workstation_id, category, description, status, assigned_to) VALUES
  (8, 12, 'software', 'Python interpreter missing on workstation', 'under_review', 6),
  (9, 15, 'network',  'Cannot access internet in the lab',         'open',         NULL);

INSERT INTO incident_tickets (reporter_id, lab_room_id, category, description, status) VALUES
  (10, 6, 'network', 'Switch in D401 keeps rebooting', 'open');

INSERT INTO incident_tickets (reporter_id, workstation_id, category, description, status, assigned_to, resolution_note, resolved_at) VALUES
  (11, 18, 'os',       'Blue screen on startup', 'resolved', 7, 'Reinstalled drivers and updated BIOS', NOW()),
  (12, 22, 'hardware', 'Keyboard not working',   'closed',   2, 'Replaced keyboard', NOW());
