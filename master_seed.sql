-- master_seed.sql

-- Seed data for breeds
INSERT OR IGNORE INTO breeds (id, name, description, temperament, size, lifespan, care_instructions, common_traits, average_weight_min, average_weight_max, photo_url, created_at, updated_at)
VALUES
  ('breed-001', 'Labrador Retriever', 'A friendly, outgoing, and high-spirited companion that is consistently one of the most popular breeds.', 'Friendly, Active, Outgoing, Gentle, Intelligent', 'Large', '10-12 years', 'Regular exercise is crucial. Requires weekly grooming, more during shedding season. Generally healthy but watch for hip/elbow dysplasia and obesity.', '["Loyal", "Even Tempered", "Agile", "Good with Children"]', 55, 80, 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('breed-002', 'Golden Retriever', 'An intelligent, friendly, and devoted sporting dog that is eager to please and highly trainable.', 'Intelligent, Friendly, Devoted, Confident, Kind', 'Large', '10-12 years', 'Needs daily exercise. Regular brushing to maintain coat. Prone to certain cancers and hip dysplasia.', '["Reliable", "Trustworthy", "Patient", "Good with families"]', 55, 75, 'https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?ixlib=rb-4.0.3', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('breed-003', 'French Bulldog', 'A playful, smart, and adaptable companion, easily recognized by its bat-like ears and sturdy build.', 'Playful, Smart, Adaptable, Affectionate, Sociable', 'Small', '10-12 years', 'Minimal exercise needed, but daily walks are good. Keep facial wrinkles clean. Prone to breathing problems and skin allergies.', '["Easygoing", "Lively", "Alert", "Patient with kids"]', 16, 28, 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('breed-004', 'German Shepherd', 'A confident, courageous, and intelligent working dog known for its loyalty and versatility.', 'Confident, Courageous, Intelligent, Loyal, Watchful', 'Large', '9-13 years', 'Requires significant daily exercise and mental stimulation. Regular grooming. Prone to hip/elbow dysplasia.', '["Versatile", "Protective", "Obedient", "Eager to learn"]', 50, 90, 'https://images.unsplash.com/photo-1589924799737-03957613849e?ixlib=rb-4.0.3', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now'));

-- Seed data for litters
INSERT OR IGNORE INTO litters (id, name, breed_id, dam_name, sire_name, born_date, available_date, description, price, status, image_urls, created_at, updated_at)
VALUES
  ('litter-001', 'Summer 2025 Labrador Litter', 'breed-001', 'Bella', 'Max', '2025-06-15', '2025-08-10', 'A beautiful litter of yellow and black Labrador Retriever puppies. Both parents have excellent pedigrees and health clearances.', 2500.00, 'available', '["https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3","https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3"]', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('litter-002', 'Spring 2025 Golden Retriever Litter', 'breed-002', 'Luna', 'Charlie', '2025-03-20', '2025-05-15', 'Gorgeous Golden Retriever puppies with excellent temperaments. Parents are OFA certified.', 2700.00, 'upcoming', '["https://images.unsplash.com/photo-1633722715463-d30f4f325e24?ixlib=rb-4.0.3","https://images.unsplash.com/photo-1611250282006-4484dd3fba6b?ixlib=rb-4.0.3"]', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('litter-003', 'Frenchie Fun Times', 'breed-003', 'Gigi', 'Pierre', '2025-07-01', '2025-08-26', 'Adorable and playful French Bulldog puppies. Great for apartment living.', 3500.00, 'available', '["https://images.unsplash.com/photo-1597633425046-08f5110420b5?ixlib=rb-4.0.3"]', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now'));


-- Seed data for puppies
INSERT OR IGNORE INTO puppies (id, name, litter_id, gender, color, birth_date, weight, price, status, microchip_id, description, temperament_notes, health_notes, image_urls, created_at, updated_at)
VALUES
  ('puppy-001', 'Buddy', 'litter-001', 'Male', 'Yellow', '2025-06-15', 3.2, 2500.00, 'available', 'mc001', 'Playful and energetic yellow lab puppy, loves to fetch.', 'Very outgoing, curious.', 'First shots complete, dewormed.', '["https://images.unsplash.com/photo-1587764379873-97837921fd44?ixlib=rb-4.0.3"]', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('puppy-002', 'Lucy', 'litter-001', 'Female', 'Black', '2025-06-15', 2.9, 2500.00, 'available', 'mc002', 'Sweet and calm black lab puppy, loves cuddles.', 'Gentle, observant.', 'First shots complete, dewormed.', '["https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-4.0.3"]', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('puppy-003', 'Rex', 'litter-001', 'Male', 'Black', '2025-06-15', 3.5, 2600.00, 'reserved', 'mc003', 'Confident and curious black lab puppy, very intelligent.', 'Bold, quick learner.', 'First shots complete, dewormed. Vet check clear.', '["https://images.unsplash.com/photo-1505628346881-b72b27e84530?ixlib=rb-4.0.3"]', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('puppy-004', 'Goldie', 'litter-002', 'Female', 'Golden', '2025-03-20', 3.0, 2700.00, 'available', 'mc004', 'Classic golden retriever charm, very affectionate.', 'Sweet-natured, loves people.', 'Vet checked, first vaccinations.', '["https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?ixlib=rb-4.0.3"]', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now'));

-- Seed data for users (password for all is "Password123$Puppies")
-- Hash: $2a$10$s76.T9AT3qW3lJ5L9Dvck.DK3HbMAFt2CkTtE3pLEJ.QQRguKQKsu
INSERT OR IGNORE INTO users (id, email, name, password, roles, created_at, updated_at)
VALUES
  ('user-admin-001', 'admin@example.com', 'Admin User', '$2a$10$s76.T9AT3qW3lJ5L9Dvck.DK3HbMAFt2CkTtE3pLEJ.QQRguKQKsu', '["admin", "super-admin"]', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('user-editor-001', 'editor@example.com', 'Blog Editor', '$2a$10$s76.T9AT3qW3lJ5L9Dvck.DK3HbMAFt2CkTtE3pLEJ.QQRguKQKsu', '["editor", "user"]', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('user-customer-001', 'customer@example.com', 'John Smith', '$2a$10$s76.T9AT3qW3lJ5L9Dvck.DK3HbMAFt2CkTtE3pLEJ.QQRguKQKsu', '["user"]', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now'));

-- Seed data for blog_categories
INSERT OR IGNORE INTO blog_categories (id, name, slug, description, created_at, updated_at)
VALUES
  ('cat-care', 'Puppy Care', 'puppy-care', 'Tips and advice for taking care of your new puppy', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('cat-health', 'Health & Wellness', 'health-wellness', 'Information about puppy health, vaccinations, and wellness', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('cat-training', 'Training Tips', 'training-tips', 'Guidance on training your puppy effectively', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now'));

-- Seed data for blog_tags
INSERT OR IGNORE INTO blog_tags (id, name, slug)
VALUES
  ('tag-new-puppy', 'New Puppy', 'new-puppy'),
  ('tag-vaccinations', 'Vaccinations', 'vaccinations'),
  ('tag-house-training', 'House Training', 'house-training'),
  ('tag-socialization', 'Socialization', 'socialization');

-- Seed data for blog_posts
INSERT OR IGNORE INTO blog_posts (id, title, slug, excerpt, content, author_id, category_id, status, published_at, featured_image_url, seo_title, seo_description, created_at, updated_at)
VALUES
  ('post-001', 'Essential Care for Your New Puppy', 'essential-puppy-care',
   'Bringing home a new puppy is exciting! Here''s a guide to the first 30 days.',
   '<p>Content for essential puppy care...</p><h2>Feeding</h2><p>Details about feeding...</p><h2>House Training</h2><p>Tips for house training...</p>',
   'user-editor-001', 'cat-care', 'published', STRFTIME('%Y-%m-%d %H:%M:%f', 'now', '-20 days'), 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3',
   'Essential Puppy Care Guide | GDS Puppies', 'Learn to care for your new puppy during the first 30 days.', STRFTIME('%Y-%m-%d %H:%M:%f', 'now', '-20 days'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now', '-20 days')),
  ('post-002', 'Understanding Puppy Vaccinations', 'puppy-vaccinations',
   'A guide to necessary vaccinations for your puppy''s health.',
   '<p>Vaccinations are key to a healthy puppy...</p>',
   'user-editor-001', 'cat-health', 'published', STRFTIME('%Y-%m-%d %H:%M:%f', 'now', '-10 days'), 'https://images.unsplash.com/photo-1611173622330-1c731c6d970e?ixlib=rb-4.0.3',
   'Puppy Vaccination Schedule | GDS Puppies', 'Complete guide to puppy vaccinations.', STRFTIME('%Y-%m-%d %H:%M:%f', 'now', '-10 days'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now', '-10 days')),
  ('post-003', 'Top 5 Training Tips for Puppies', 'top-5-training-tips',
   'Get started with training your new puppy with these essential tips.',
   '<p>Training builds a strong bond...</p>',
   'user-editor-001', 'cat-training', 'draft', NULL, 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3',
   'Top 5 Puppy Training Tips | GDS Puppies', 'Easy and effective training tips for your new puppy.', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now'));

-- Seed data for blog_post_tags
INSERT OR IGNORE INTO blog_post_tags (post_id, tag_id)
VALUES
  ('post-001', 'tag-new-puppy'),
  ('post-001', 'tag-house-training'),
  ('post-002', 'tag-new-puppy'),
  ('post-002', 'tag-vaccinations'),
  ('post-003', 'tag-new-puppy'),
  ('post-003', 'tag-socialization');

-- Seed data for affiliates
INSERT OR IGNORE INTO affiliates (id, name, email, referral_code, commission_rate, total_visits, total_conversions, total_sales_amount, is_active, created_at, updated_at)
VALUES
  ('aff-001', 'Sarah Johnson', 'sarah.j@example.com', 'SARAH20', 10.0, 152, 8, 4232.00, TRUE, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('aff-002', 'Dog Lovers Blog', 'contact@dogloversblog.com', 'DOGBLOG15', 15.0, 376, 14, 9876.00, TRUE, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('aff-003', 'Mike Peterson', 'mike.p@example.net', 'MIKEPET10', 10.0, 80, 2, 1500.00, FALSE, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now'));

-- Seed data for promo_codes
INSERT OR IGNORE INTO promo_codes (id, code, discount_type, discount_value, uses_count, max_uses, start_date, end_date, is_active, min_purchase_amount, created_at, updated_at)
VALUES
  ('promo-spring10', 'SPRING10', 'percentage', 10.0, 24, 100, STRFTIME('%Y-%m-%d', 'now', '-30 days'), STRFTIME('%Y-%m-%d', 'now', '+60 days'), TRUE, 50.00, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('promo-summer50', 'SUMMER50OFF', 'fixed_amount', 50.0, 12, 50, STRFTIME('%Y-%m-%d', 'now', '+30 days'), STRFTIME('%Y-%m-%d', 'now', '+120 days'), TRUE, 200.00, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('promo-welcome5', 'WELCOME5P', 'percentage', 5.0, 56, NULL, STRFTIME('%Y-%m-%d', 'now', '-100 days'), NULL, TRUE, 0.00, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now'));

-- Seed data for seo_page_metadata
INSERT OR IGNORE INTO seo_page_metadata (page_path, title, description, keywords, og_image_url, seo_score, created_at, updated_at)
VALUES
  ('/', 'GDS Puppies | Premium Ethically Bred Puppies', 'Find your perfect, healthy, and happy puppy from GDS Puppies, responsible and ethical breeders. Lifetime support guaranteed.', 'puppies for sale, ethical dog breeder, quality puppies, Labrador puppies, Golden Retriever puppies', 'https://example.com/images/og-home.jpg', 85, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('/litters', 'Available Puppy Litters | GDS Puppies', 'View our current and upcoming litters of well-socialized puppies. Reserve your new family member today.', 'puppy litters, available puppies, new puppies, reserve a puppy', 'https://example.com/images/og-litters.jpg', 78, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('/about', 'About GDS Puppies Breeding Program', 'Learn about our commitment to ethical breeding practices, our state-of-the-art facilities, and our dedication to puppy health and well-being.', 'ethical dog breeding, responsible puppy breeders, about us, our mission', 'https://example.com/images/og-about.jpg', 70, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now'));

-- Seed data for site_settings
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, updated_at)
VALUES
  ('siteName', 'GDS Puppies Deluxe', STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('contactEmail', 'contact@gdspuppiesdeluxe.com', STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('maintenanceMode', 'false', STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('logoUrl', '/assets/images/logo_deluxe.png', STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('currency', 'USD', STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('socialMediaLinks', '{"facebook": "https://facebook.com/gdspuppies", "instagram": "https://instagram.com/gdspuppies"}', STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('seoDefaults', '{"titleSuffix": " | GDS Puppies", "defaultDescription": "Find your next best friend at GDS Puppies."}', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'));

-- Seed data for email_templates
INSERT OR IGNORE INTO email_templates (id, template_name, subject_template, html_body_template, is_system_template, created_at, updated_at)
VALUES
  ('welcome_tpl', 'welcome_email', 'Welcome to GDS Puppies Deluxe!', '<p>Hi {{name}},</p><p>Welcome to GDS Puppies Deluxe! We are thrilled to have you.</p><p>Thanks,<br>The GDS Puppies Team</p>', TRUE, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('receipt_tpl', 'payment_receipt', 'Your GDS Puppies Payment Receipt - Order {{order_id}}', '<p>Hi {{name}},</p><p>Thank you for your payment for order {{order_id}}.</p><p>Amount: {{amount}} {{currency}}</p><p>View your order details here: {{order_link}}</p><p>Thanks,<br>The GDS Puppies Team</p>', TRUE, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('pwd_reset_tpl', 'password_reset', 'Reset Your GDS Puppies Password', '<p>Hi {{name}},</p><p>Please click the link below to reset your password:</p><p><a href="{{reset_link}}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p><p>Thanks,<br>The GDS Puppies Team</p>', TRUE, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('custom_promo_1', 'custom_promo_valentines', 'A Special Valentine Treat For Your Pup!', '<p>Dear {{name}},</p><p>Show your furry friend some love this Valentine''s Day with our special offers!</p><p>Warm Wags,<br>The GDS Puppies Team</p>', FALSE, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now'));

-- Seed data for third_party_integrations
INSERT OR IGNORE INTO third_party_integrations (id, service_name, encrypted_api_key, other_config, is_active, created_at, updated_at)
VALUES
  ('integ-square', 'Square', NULL, '{"location_id": "YOUR_SQUARE_LOCATION_ID_HERE", "webhook_signature_key_env": "SQUARE_WEBHOOK_SIGNATURE_KEY"}', FALSE, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('integ-sendgrid', 'SendGrid', NULL, '{"from_email": "noreply@gdspuppiesdeluxe.com"}', FALSE, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('integ-tawkto', 'TawkTo', NULL, '{"property_id": "YOUR_TAWKTO_PROPERTY_ID", "widget_id": "default"}', FALSE, STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now'));

-- Seed data for stud_dogs
INSERT OR IGNORE INTO stud_dogs (id, name, breed_id, date_of_birth, description, temperament, health_certifications, stud_fee, image_urls, is_available, owner_user_id, contact_info, location, created_at, updated_at)
VALUES
  ('stud-001', 'Champion Max', 'breed-001', '2021-04-10', 'AKC Champion Labrador Retriever with excellent lineage and proven temperament. Gentle giant, great with kids.', 'Calm, Intelligent, Eager to Please', '["OFA Hips: Excellent", "OFA Elbows: Normal", "PRA: Clear", "EIC: Clear"]', 1500.00, '["https://images.unsplash.com/photo-1537151608828-3a29792d6f13?ixlib=rb-4.0.3"]', TRUE, 'user-admin-001', 'admin@example.com or call 555-1234', 'Springfield, IL', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now')),
  ('stud-002', 'Sir Reginald "Reggie" Fluffbutt III', 'breed-003', '2022-01-20', 'Show-quality French Bulldog, compact and muscular with a charming personality. Carries blue and chocolate.', 'Playful, Affectionate, Stubborn at times', '["HC: Clear", "DM: Clear", "Patellas: Normal"]', 2000.00, '["https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-4.0.3"]', TRUE, 'user-admin-001', 'admin@example.com or call 555-1234', 'Chicago, IL', STRFTIME('%Y-%m-%d %H:%M:%f', 'now'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now'));

-- Example adoption record
INSERT OR IGNORE INTO adoptions (id, puppy_id, user_id, adoption_date, price, payment_status, payment_method, notes, created_at, updated_at)
VALUES
  ('adopt-001', 'puppy-003', 'user-customer-001', STRFTIME('%Y-%m-%d', 'now', '-5 days'), 2600.00, 'deposit_paid', 'Credit Card via Square', 'Customer excited, pickup scheduled for next week.', STRFTIME('%Y-%m-%d %H:%M:%f', 'now', '-5 days'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now', '-5 days'));

-- Example transaction
INSERT OR IGNORE INTO transactions (id, user_id, related_entity_id, entity_type, square_payment_id, amount_cents, currency, payment_method_details, status, notes, created_at, updated_at)
VALUES
  ('txn-001', 'user-customer-001', 'puppy-003', 'litter_deposit', 'sq_payment_id_example_123', 50000, 'USD', '{"brand": "Visa", "last4": "4242"}', 'succeeded', 'Deposit for Rex the black lab.', STRFTIME('%Y-%m-%d %H:%M:%f', 'now', '-5 days'), STRFTIME('%Y-%m-%d %H:%M:%f', 'now', '-5 days'));
