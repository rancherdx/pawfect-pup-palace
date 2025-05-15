
-- Seed data for breeds
INSERT OR IGNORE INTO breeds (id, name, description, temperament, size, lifespan)
VALUES 
  ('breed-001', 'Labrador Retriever', 'A friendly, outgoing, and high-spirited companion', 'Friendly, Active, Outgoing', 'Large', '10-12 years'),
  ('breed-002', 'Golden Retriever', 'A intelligent, friendly, and devoted sporting dog', 'Intelligent, Friendly, Devoted', 'Large', '10-12 years'),
  ('breed-003', 'French Bulldog', 'A playful, smart, and adaptable companion', 'Playful, Smart, Adaptable', 'Small', '10-12 years'),
  ('breed-004', 'German Shepherd', 'A confident, courageous, and intelligent working dog', 'Confident, Courageous, Intelligent', 'Large', '10-13 years');

-- Seed data for litters
INSERT OR IGNORE INTO litters (id, name, breed_id, dam_name, sire_name, born_date, available_date, description, price, status, image_urls)
VALUES 
  ('litter-001', 'Summer 2025 Labrador Litter', 'breed-001', 'Bella', 'Max', '2025-06-15', '2025-08-10', 'A beautiful litter of yellow and black Labrador Retriever puppies', 2500.00, 'available', '["https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3","https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3"]'),
  ('litter-002', 'Spring 2025 Golden Retriever Litter', 'breed-002', 'Luna', 'Charlie', '2025-03-20', '2025-05-15', 'Gorgeous Golden Retriever puppies with excellent temperaments', 2700.00, 'upcoming', '["https://images.unsplash.com/photo-1633722715463-d30f4f325e24?ixlib=rb-4.0.3","https://images.unsplash.com/photo-1611250282006-4484dd3fba6b?ixlib=rb-4.0.3"]');

-- Seed data for puppies
INSERT OR IGNORE INTO puppies (id, name, litter_id, gender, color, birth_date, weight, price, status, description)
VALUES 
  ('puppy-001', 'Buddy', 'litter-001', 'Male', 'Yellow', '2025-06-15', 3.2, 2500.00, 'available', 'Playful and energetic yellow lab puppy'),
  ('puppy-002', 'Lucy', 'litter-001', 'Female', 'Black', '2025-06-15', 2.9, 2500.00, 'available', 'Sweet and calm black lab puppy'),
  ('puppy-003', 'Rex', 'litter-001', 'Male', 'Black', '2025-06-15', 3.5, 2500.00, 'reserved', 'Confident and curious black lab puppy');

-- Seed data for users (with password "Password123$Puppies")
INSERT OR IGNORE INTO users (id, email, name, password, roles)
VALUES 
  ('user-001', 'gsawyer@example.com', 'Gerald Sawyer', '$2a$10$s76.T9AT3qW3lJ5L9Dvck.DK3HbMAFt2CkTtE3pLEJ.QQRguKQKsu', '["admin", "super-admin"]'),
  ('user-002', 'drancher@example.com', 'David Rancher', '$2a$10$s76.T9AT3qW3lJ5L9Dvck.DK3HbMAFt2CkTtE3pLEJ.QQRguKQKsu', '["admin", "super-admin"]'),
  ('user-003', 'jsmith@example.com', 'John Smith', '$2a$10$s76.T9AT3qW3lJ5L9Dvck.DK3HbMAFt2CkTtE3pLEJ.QQRguKQKsu', '["user"]');

-- Seed data for blog categories
INSERT OR IGNORE INTO blog_categories (id, name, slug, description)
VALUES
  ('cat-001', 'Puppy Care', 'puppy-care', 'Tips and advice for taking care of your new puppy'),
  ('cat-002', 'Health & Wellness', 'health-wellness', 'Information about puppy health, vaccinations, and wellness'),
  ('cat-003', 'Training Tips', 'training-tips', 'Guidance on training your puppy effectively'),
  ('cat-004', 'Nutrition', 'nutrition', 'Advice on feeding and nutrition for puppies'),
  ('cat-005', 'Lifestyle', 'lifestyle', 'Living with puppies and integrating them into your family');

-- Seed data for blog posts
INSERT OR IGNORE INTO blog_posts (id, title, slug, excerpt, content, author, category_id, status, published_at, featured_image, seo_title, seo_description)
VALUES
  ('post-001', 'Essential Care for Your New Puppy: The First 30 Days', 'essential-puppy-care-first-30-days', 
   'Bringing home a new puppy is exciting! Here''s everything you need to know to get started on the right paw.',
   '<p>Bringing home a new puppy is one of life''s greatest joys. Those tiny paws, wet nose, and endless enthusiasm can melt even the sternest heart. But along with all that cuteness comes responsibility. The first month with your new puppy is crucial for establishing habits that will last a lifetime.</p><h2>Before Your Puppy Arrives</h2><p>Preparation is key to a smooth transition for both you and your puppy...</p>',
   'Dr. Sarah Johnson', 'cat-001', 'published', '2025-01-15 10:00:00', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3', 
   'Essential Puppy Care: First 30 Days Guide | GDS Puppies', 'Learn everything you need to know about caring for your new puppy during the crucial first 30 days to set them up for a happy, healthy life.'),
   
  ('post-002', 'Puppy Vaccination Schedule: What You Need to Know', 'puppy-vaccination-schedule', 
   'Keeping your puppy healthy starts with proper vaccinations. Learn about the recommended schedule and why each vaccine matters.',
   '<p>Proper vaccination is one of the most important ways to protect your puppy''s health. Vaccines help prevent many serious and potentially fatal diseases by stimulating the immune system to recognize and fight specific infections.</p><h2>Core Vaccines Every Puppy Needs</h2><p>Core vaccines are recommended for all dogs regardless of their lifestyle:</p>',
   'Dr. Michael Chang', 'cat-002', 'published', '2025-02-03 14:30:00', 'https://images.unsplash.com/photo-1611173622330-1c731c6d970e?ixlib=rb-4.0.3', 
   'Complete Puppy Vaccination Schedule Guide | GDS Puppies', 'Understanding your puppy''s vaccination schedule is crucial for their health. Learn which vaccines they need and when they need them.');

-- Seed data for blog related posts
INSERT OR IGNORE INTO blog_related_posts (post_id, related_post_id)
VALUES
  ('post-001', 'post-002'),
  ('post-002', 'post-001');

-- Seed data for affiliates
INSERT OR IGNORE INTO affiliates (id, name, email, code, commission, total_visits, total_conversions, total_sales)
VALUES
  ('aff-001', 'Sarah Johnson', 'sarah@example.com', 'SARAH20', 10.0, 152, 8, 4232.00),
  ('aff-002', 'Dog Lovers Blog', 'contact@doglovers.com', 'DOGBLOG', 15.0, 376, 14, 9876.00);

-- Seed data for promo codes
INSERT OR IGNORE INTO promo_codes (id, code, discount_type, discount_amount, uses, max_uses, start_date, end_date, active)
VALUES
  ('promo-001', 'SPRING2025', 'percentage', 10.0, 24, 100, '2025-03-01', '2025-05-31', TRUE),
  ('promo-002', 'SUMMER5', 'fixed', 50.0, 12, 50, '2025-06-01', '2025-08-31', TRUE),
  ('promo-003', 'WELCOME', 'percentage', 5.0, 56, NULL, '2025-01-01', NULL, TRUE);

-- Seed data for SEO metadata
INSERT OR IGNORE INTO seo_metadata (page_path, title, description, keywords, og_image, score)
VALUES
  ('/', 'GDS Puppies | Premium Puppy Breeder', 'Quality puppies from responsible breeders. Find your perfect companion with health guarantees and lifetime support.', 'puppies, dog breeder, responsible breeding', 'https://example.com/og-home.jpg', 82),
  ('/litters', 'Available Litters | GDS Puppies', 'View our current and upcoming litters of premium puppies. Reserve your new family member today.', 'puppy litters, available puppies, reserve puppy', 'https://example.com/og-litters.jpg', 76),
  ('/about', 'About Our Breeding Program | GDS Puppies', 'Learn about our ethical breeding practices, facilities, and our commitment to puppy health and wellbeing.', 'ethical breeding, quality puppies, breeding program', 'https://example.com/og-about.jpg', 63);
