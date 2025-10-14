-- ============================================
-- COMPREHENSIVE SEED DATA FOR GDS PUPPIES
-- ============================================
-- This script removes all existing data and seeds comprehensive test data
-- with proper relational integrity across all tables.

BEGIN;

-- Clean existing data (in reverse order of dependencies)
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.puppy_purchases CASCADE;
TRUNCATE TABLE public.puppies CASCADE;
TRUNCATE TABLE public.litters CASCADE;
TRUNCATE TABLE public.parents CASCADE;
TRUNCATE TABLE public.breed_templates CASCADE;
TRUNCATE TABLE public.stud_dogs CASCADE;
TRUNCATE TABLE public.testimonials CASCADE;
TRUNCATE TABLE public.form_submissions CASCADE;
TRUNCATE TABLE public.blog_posts CASCADE;
TRUNCATE TABLE public.site_contact_info CASCADE;
TRUNCATE TABLE public.analytics_settings CASCADE;
TRUNCATE TABLE public.seo_meta CASCADE;

-- ============================================
-- 1. BREED TEMPLATES
-- ============================================
INSERT INTO public.breed_templates (
  id,
  breed_name,
  description,
  size,
  average_weight_min,
  average_weight_max,
  life_expectancy_min,
  life_expectancy_max,
  temperament,
  common_traits,
  exercise_needs,
  grooming_needs,
  health_considerations,
  good_with_kids,
  good_with_pets,
  hypoallergenic,
  origin_country,
  akc_group,
  photo_url,
  care_instructions
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Golden Retriever',
  'Friendly, intelligent, and devoted companions. Golden Retrievers are among the most popular dog breeds, known for their gentle nature and beautiful golden coats.',
  'Large',
  55, 75,
  10, 12,
  ARRAY['Friendly', 'Intelligent', 'Devoted', 'Trustworthy', 'Gentle'],
  ARRAY['Highly trainable', 'Great family dogs', 'Love water', 'Patient with children'],
  'High - Needs 1-2 hours of daily exercise including walks, runs, and play',
  'Moderate - Weekly brushing, more during shedding season',
  ARRAY['Hip dysplasia', 'Elbow dysplasia', 'Heart disease', 'Eye conditions'],
  true,
  true,
  false,
  'Scotland',
  'Sporting',
  'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800',
  'Golden Retrievers need regular exercise, mental stimulation, and grooming. Feed high-quality dog food appropriate for their age and size. Regular vet check-ups are essential.'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Labrador Retriever',
  'Outgoing, active, and friendly. Labs are Americas most popular breed, known for their versatility as family pets, service dogs, and hunting companions.',
  'Large',
  55, 80,
  10, 12,
  ARRAY['Friendly', 'Active', 'Outgoing', 'Trusting', 'Gentle'],
  ARRAY['Excellent swimmers', 'Love to retrieve', 'Easy to train', 'Great with families'],
  'High - Needs substantial daily exercise including walks, swimming, and play',
  'Low - Weekly brushing, occasional baths',
  ARRAY['Hip dysplasia', 'Elbow dysplasia', 'Obesity', 'Eye conditions'],
  true,
  true,
  false,
  'Canada',
  'Sporting',
  'https://images.unsplash.com/photo-1579731342743-486fdf2e2b8d?w=800',
  'Labs are active dogs that require plenty of exercise and a balanced diet to prevent obesity. Regular training and socialization from puppyhood are important.'
),
(
  '33333333-3333-3333-3333-333333333333',
  'German Shepherd',
  'Confident, courageous, and smart. German Shepherds excel as working dogs and family guardians, known for their loyalty and versatility.',
  'Large',
  50, 90,
  9, 13,
  ARRAY['Confident', 'Courageous', 'Smart', 'Loyal', 'Protective'],
  ARRAY['Highly intelligent', 'Excellent guard dogs', 'Very trainable', 'Strong work ethic'],
  'High - Needs vigorous daily exercise including runs, training, and mental stimulation',
  'Moderate to High - Regular brushing, more during shedding season',
  ARRAY['Hip dysplasia', 'Elbow dysplasia', 'Degenerative myelopathy', 'Bloat'],
  true,
  true,
  false,
  'Germany',
  'Herding',
  'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800',
  'German Shepherds need consistent training, plenty of exercise, and mental stimulation. Early socialization is crucial. Regular grooming helps manage shedding.'
);

-- ============================================
-- 2. PARENTS (Sires and Dams)
-- ============================================
INSERT INTO public.parents (
  id,
  name,
  breed,
  gender,
  description,
  image_urls,
  certifications,
  bloodline_info,
  health_clearances,
  is_active
) VALUES
-- Golden Retriever Parents
(
  'a1111111-1111-1111-1111-111111111111',
  'Champion Duke of Sunshine',
  'Golden Retriever',
  'Male',
  'Duke is a stunning champion Golden Retriever with an exceptional temperament and structure. His lineage includes multiple Best in Show winners.',
  ARRAY['https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800'],
  ARRAY['AKC Champion', 'OFA Hips Excellent', 'OFA Elbows Normal', 'CERF Clear'],
  'Descendant of BISS GCHB CH Summits Dakota Goldtrails, multiple Best in Show winner',
  ARRAY['OFA Hips Excellent', 'OFA Elbows Normal', 'Heart Clear', 'Eyes CERF Clear', 'PRA Clear by Parentage'],
  true
),
(
  'a2222222-2222-2222-2222-222222222222',
  'Lady Belle Golden',
  'Golden Retriever',
  'Female',
  'Belle is a beautiful, sweet-natured Golden Retriever with excellent health clearances. She is a loving mother and produces puppies with wonderful temperaments.',
  ARRAY['https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800', 'https://images.unsplash.com/photo-1612536980551-ba7f9d6e0e1e?w=800'],
  ARRAY['OFA Hips Good', 'OFA Elbows Normal', 'CERF Clear'],
  'From the prestigious Copper Creek line, known for exceptional family companions',
  ARRAY['OFA Hips Good', 'OFA Elbows Normal', 'Heart Clear', 'Eyes CERF Clear'],
  true
),
-- Labrador Retriever Parents
(
  'b1111111-1111-1111-1111-111111111111',
  'Admiral Blue of Yorkshire',
  'Labrador Retriever',
  'Male',
  'Admiral is a stunning chocolate Lab with field champion heritage. Known for his intelligence, athletic ability, and gentle nature.',
  ARRAY['https://images.unsplash.com/photo-1579731342743-486fdf2e2b8d?w=800'],
  ARRAY['AKC Champion', 'Field Champion', 'OFA Hips Excellent', 'OFA Elbows Normal'],
  'Son of FC-AFC Candlewoods Something Royal, multiple field trial winner',
  ARRAY['OFA Hips Excellent', 'OFA Elbows Normal', 'EIC Clear', 'CNM Clear'],
  true
),
(
  'b2222222-2222-2222-2222-222222222222',
  'Duchess Willow Woods',
  'Labrador Retriever',
  'Female',
  'Willow is a yellow Lab with an exceptional temperament and show-quality conformation. She is a loving mother and excellent family companion.',
  ARRAY['https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=800'],
  ARRAY['OFA Hips Good', 'OFA Elbows Normal', 'CERF Clear'],
  'From the Wildwind Kennels line, known for dual-purpose excellence',
  ARRAY['OFA Hips Good', 'OFA Elbows Normal', 'EIC Clear', 'PRA Clear'],
  true
),
-- German Shepherd Parents
(
  'c1111111-1111-1111-1111-111111111111',
  'Baron von Schwarzwald',
  'German Shepherd',
  'Male',
  'Baron is an exceptional German Shepherd with West German show lines. His temperament is stable, confident, and gentle with family.',
  ARRAY['https://images.unsplash.com/photo-1568572933382-74d440642117?w=800'],
  ARRAY['SV Rated VA', 'SchH3', 'OFA Hips Good', 'OFA Elbows Normal'],
  'Import from Germany, VA1 Sieger heritage with impeccable structure and temperament',
  ARRAY['OFA Hips Good', 'OFA Elbows Normal', 'DM Clear', 'Cardiac Normal'],
  true
),
(
  'c2222222-2222-2222-2222-222222222222',
  'Freya von Edelweiss',
  'German Shepherd',
  'Female',
  'Freya is a stunning black and red German Shepherd with excellent temperament and show-quality structure. She is protective yet gentle with children.',
  ARRAY['https://images.unsplash.com/photo-1611003228941-98852ba62227?w=800'],
  ARRAY['OFA Hips Good', 'OFA Elbows Normal'],
  'From prestigious German show lines, daughter of V-rated sire',
  ARRAY['OFA Hips Good', 'OFA Elbows Normal', 'DM Clear'],
  true
);

-- ============================================
-- 3. LITTERS
-- ============================================
INSERT INTO public.litters (
  id,
  name,
  breed,
  breed_template_id,
  sire_id,
  dam_id,
  sire_name,
  dam_name,
  date_of_birth,
  expected_date,
  puppy_count,
  status,
  description,
  cover_image_url,
  image_urls,
  slug
) VALUES
-- Current Golden Retriever Litter
(
  'l1111111-1111-1111-1111-111111111111',
  'Sunshine Golden Litter - Spring 2024',
  'Golden Retriever',
  '11111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'Champion Duke of Sunshine',
  'Lady Belle Golden',
  '2024-03-15',
  NULL,
  8,
  'Active',
  'Beautiful litter of Golden Retriever puppies from champion bloodlines. Duke and Belle have produced exceptional puppies with wonderful temperaments, perfect structure, and those classic golden coats. These puppies are being raised in our home with children and will make excellent family companions.',
  'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800',
  ARRAY[
    'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
    'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800'
  ],
  'sunshine-golden-litter-spring-2024'
),
-- Upcoming Golden Retriever Litter
(
  'l1111112-1111-1111-1111-111111111111',
  'Sunshine Golden Litter - Summer 2024',
  'Golden Retriever',
  '11111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'Champion Duke of Sunshine',
  'Lady Belle Golden',
  NULL,
  '2024-06-20',
  NULL,
  'Expected',
  'We are excited to announce an upcoming litter from Duke and Belle! Based on previous litters, we expect beautiful, healthy puppies with excellent temperaments. Reservations are now being accepted.',
  'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800',
  ARRAY['https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800'],
  'sunshine-golden-litter-summer-2024'
),
-- Current Lab Litter
(
  'l2222221-2222-2222-2222-222222222222',
  'Yorkshire Lab Litter - Spring 2024',
  'Labrador Retriever',
  '22222222-2222-2222-2222-222222222222',
  'b1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'Admiral Blue of Yorkshire',
  'Duchess Willow Woods',
  '2024-03-01',
  NULL,
  10,
  'Active',
  'Outstanding litter of Labrador Retriever puppies combining field champion and show lines. Admiral and Willow have produced puppies with exceptional retrieving instinct, intelligence, and family-friendly temperaments. Colors include yellow and chocolate.',
  'https://images.unsplash.com/photo-1579731342743-486fdf2e2b8d?w=800',
  ARRAY[
    'https://images.unsplash.com/photo-1579731342743-486fdf2e2b8d?w=800',
    'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=800'
  ],
  'yorkshire-lab-litter-spring-2024'
),
-- Current German Shepherd Litter
(
  'l3333331-3333-3333-3333-333333333333',
  'Schwarzwald Shepherd Litter - Winter 2024',
  'German Shepherd',
  '33333333-3333-3333-3333-333333333333',
  'c1111111-1111-1111-1111-111111111111',
  'c2222222-2222-2222-2222-222222222222',
  'Baron von Schwarzwald',
  'Freya von Edelweiss',
  '2024-01-20',
  NULL,
  7,
  'Active',
  'Exceptional litter of German Shepherd puppies from imported German show lines. Baron and Freya have produced puppies with excellent structure, stable temperaments, and strong working drive. Perfect for families seeking intelligent, loyal companions.',
  'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800',
  ARRAY[
    'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800',
    'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=800'
  ],
  'schwarzwald-shepherd-litter-winter-2024'
);

-- ============================================
-- 4. PUPPIES
-- ============================================
INSERT INTO public.puppies (
  id,
  name,
  breed,
  breed_template_id,
  litter_id,
  gender,
  birth_date,
  color,
  description,
  price,
  status,
  weight,
  temperament,
  photo_url,
  image_urls,
  is_featured,
  banner_text,
  banner_color,
  slug
) VALUES
-- Golden Retriever Puppies from Spring Litter
(
  'p1111111-1111-1111-1111-111111111111',
  'Sunny',
  'Golden Retriever',
  '11111111-1111-1111-1111-111111111111',
  'l1111111-1111-1111-1111-111111111111',
  'Male',
  '2024-03-15',
  'Golden',
  'Sunny is an absolutely gorgeous male Golden Retriever with a beautiful golden coat and the sweetest personality. He loves to play fetch, cuddle, and is already showing signs of being highly trainable. Sunny comes from champion bloodlines and will make an excellent family companion.',
  2500.00,
  'Available',
  18.5,
  ARRAY['Playful', 'Affectionate', 'Intelligent', 'Gentle'],
  'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800',
  ARRAY[
    'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
    'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800'
  ],
  true,
  'Featured Puppy',
  '#ef4444',
  'sunny-golden-retriever-male'
),
(
  'p1111112-1111-1111-1111-111111111111',
  'Daisy',
  'Golden Retriever',
  '11111111-1111-1111-1111-111111111111',
  'l1111111-1111-1111-1111-111111111111',
  'Female',
  '2024-03-15',
  'Golden',
  'Daisy is a beautiful female Golden Retriever with a sweet, gentle nature. She is very affectionate and loves everyone she meets. Daisy is the perfect combination of playful and calm, making her an ideal family pet.',
  2500.00,
  'Available',
  17.2,
  ARRAY['Sweet', 'Gentle', 'Friendly', 'Calm'],
  'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800',
  ARRAY[
    'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800',
    'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800'
  ],
  true,
  NULL,
  NULL,
  'daisy-golden-retriever-female'
),
(
  'p1111113-1111-1111-1111-111111111111',
  'Max',
  'Golden Retriever',
  '11111111-1111-1111-1111-111111111111',
  'l1111111-1111-1111-1111-111111111111',
  'Male',
  '2024-03-15',
  'Golden',
  'Max is an energetic and intelligent male Golden Retriever. He is the most adventurous of the litter and loves to explore. Max would be perfect for an active family who enjoys outdoor activities.',
  2500.00,
  'Reserved',
  19.1,
  ARRAY['Energetic', 'Adventurous', 'Smart', 'Loyal'],
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
  ARRAY['https://images.unsplash.com/photo-1552053831-71594a27632d?w=800'],
  false,
  NULL,
  NULL,
  'max-golden-retriever-male'
),
-- Labrador Retriever Puppies
(
  'p2222221-2222-2222-2222-222222222222',
  'Charlie',
  'Labrador Retriever',
  '22222222-2222-2222-2222-222222222222',
  'l2222221-2222-2222-2222-222222222222',
  'Male',
  '2024-03-01',
  'Yellow',
  'Charlie is a handsome yellow Lab male with an outstanding temperament. He combines the best traits of both field and show lines - intelligent, athletic, and friendly. Charlie loves water and already shows natural retrieving instinct.',
  2200.00,
  'Available',
  22.5,
  ARRAY['Friendly', 'Athletic', 'Intelligent', 'Loyal'],
  'https://images.unsplash.com/photo-1579731342743-486fdf2e2b8d?w=800',
  ARRAY[
    'https://images.unsplash.com/photo-1579731342743-486fdf2e2b8d?w=800',
    'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=800'
  ],
  true,
  'Champion Bloodline',
  '#3b82f6',
  'charlie-labrador-retriever-male'
),
(
  'p2222222-2222-2222-2222-222222222222',
  'Luna',
  'Labrador Retriever',
  '22222222-2222-2222-2222-222222222222',
  'l2222221-2222-2222-2222-222222222222',
  'Female',
  '2024-03-01',
  'Chocolate',
  'Luna is a stunning chocolate Lab female with a sweet and gentle personality. She is very food-motivated which makes training easy, and she absolutely loves to cuddle. Luna will make a wonderful family companion.',
  2200.00,
  'Available',
  20.8,
  ARRAY['Sweet', 'Gentle', 'Food-motivated', 'Affectionate'],
  'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=800',
  ARRAY['https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=800'],
  false,
  NULL,
  NULL,
  'luna-labrador-retriever-female'
),
(
  'p2222223-2222-2222-2222-222222222222',
  'Cooper',
  'Labrador Retriever',
  '22222222-2222-2222-2222-222222222222',
  'l2222221-2222-2222-2222-222222222222',
  'Male',
  '2024-03-01',
  'Chocolate',
  'Cooper is a chocolate Lab male with tons of personality. He is playful, smart, and always ready for adventure. Cooper would be perfect for an active family who wants a dog for hiking, swimming, and outdoor fun.',
  2200.00,
  'Sold',
  21.9,
  ARRAY['Playful', 'Smart', 'Energetic', 'Adventurous'],
  'https://images.unsplash.com/photo-1579731342743-486fdf2e2b8d?w=800',
  ARRAY['https://images.unsplash.com/photo-1579731342743-486fdf2e2b8d?w=800'],
  false,
  NULL,
  NULL,
  'cooper-labrador-retriever-male'
),
-- German Shepherd Puppies
(
  'p3333331-3333-3333-3333-333333333333',
  'Rex',
  'German Shepherd',
  '33333333-3333-3333-3333-333333333333',
  'l3333331-3333-3333-3333-333333333333',
  'Male',
  '2024-01-20',
  'Black and Tan',
  'Rex is an exceptional German Shepherd male with show-quality structure and a stable, confident temperament. He is intelligent, trainable, and protective while remaining gentle with family. From imported German bloodlines.',
  2800.00,
  'Available',
  35.2,
  ARRAY['Confident', 'Intelligent', 'Protective', 'Loyal'],
  'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800',
  ARRAY[
    'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800',
    'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=800'
  ],
  true,
  'Import Lines',
  '#7c3aed',
  'rex-german-shepherd-male'
),
(
  'p3333332-3333-3333-3333-333333333333',
  'Sasha',
  'German Shepherd',
  '33333333-3333-3333-3333-333333333333',
  'l3333331-3333-3333-3333-333333333333',
  'Female',
  '2024-01-20',
  'Black and Red',
  'Sasha is a beautiful German Shepherd female with rich black and red coloring. She is alert, intelligent, and has a wonderful temperament. Sasha is gentle with children while maintaining her natural protective instincts.',
  2800.00,
  'Available',
  32.5,
  ARRAY['Alert', 'Intelligent', 'Gentle', 'Protective'],
  'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=800',
  ARRAY['https://images.unsplash.com/photo-1611003228941-98852ba62227?w=800'],
  false,
  NULL,
  NULL,
  'sasha-german-shepherd-female'
);

-- ============================================
-- 5. STUD DOGS
-- ============================================
INSERT INTO public.stud_dogs (
  id,
  name,
  breed_id,
  age,
  description,
  temperament,
  stud_fee,
  certifications,
  image_urls,
  is_available
) VALUES
(
  's1111111-1111-1111-1111-111111111111',
  'Champion Duke of Sunshine',
  'Golden Retriever',
  4,
  'Duke is a stunning AKC Champion Golden Retriever available for stud service. He has an exceptional temperament, excellent health clearances, and comes from a line of Best in Show winners. Duke consistently produces puppies with wonderful temperaments and beautiful structure.',
  'Friendly, intelligent, gentle, and eager to please',
  1500.00,
  ARRAY['AKC Champion', 'OFA Hips Excellent', 'OFA Elbows Normal', 'CERF Clear', 'PRA Clear by Parentage'],
  ARRAY[
    'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800'
  ],
  true
),
(
  's2222221-2222-2222-2222-222222222222',
  'Admiral Blue of Yorkshire',
  'Labrador Retriever',
  5,
  'Admiral is a chocolate Labrador with Field Champion heritage. He is an outstanding stud dog with proven genetics, producing puppies with excellent retrieving instinct, intelligence, and family-friendly temperaments. All health clearances are outstanding.',
  'Intelligent, athletic, friendly, and trainable',
  1200.00,
  ARRAY['AKC Champion', 'Field Champion', 'OFA Hips Excellent', 'OFA Elbows Normal', 'EIC Clear', 'CNM Clear'],
  ARRAY['https://images.unsplash.com/photo-1579731342743-486fdf2e2b8d?w=800'],
  true
),
(
  's3333331-3333-3333-3333-333333333333',
  'Baron von Schwarzwald',
  'German Shepherd',
  3,
  'Baron is an exceptional German Shepherd import with West German show lines rated VA (Excellent Select) by the SV. He has a stable, confident temperament and excellent working ability. Baron is SchH3 titled and produces puppies with outstanding structure and temperament.',
  'Confident, courageous, stable, and protective yet gentle with family',
  2000.00,
  ARRAY['SV Rated VA', 'SchH3', 'OFA Hips Good', 'OFA Elbows Normal', 'DM Clear', 'Cardiac Normal'],
  ARRAY['https://images.unsplash.com/photo-1568572933382-74d440642117?w=800'],
  true
);

-- ============================================
-- 6. TESTIMONIALS
-- ============================================
INSERT INTO public.testimonials (
  id,
  name,
  title,
  content,
  rating,
  location,
  puppy_name,
  image,
  is_featured,
  admin_approved,
  review_date,
  source
) VALUES
(
  't1111111-1111-1111-1111-111111111111',
  'Sarah Johnson',
  'Amazing Experience!',
  'We got our Golden Retriever puppy, Buddy, from GDS Puppies and could not be happier! The entire process was professional and transparent. Duke (the sire) has an amazing temperament and our Buddy inherited all his best qualities. He is smart, gentle, and absolutely perfect for our family with young children. Highly recommend!',
  5,
  'Ann Arbor, Michigan',
  'Buddy',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  true,
  true,
  '2024-02-15',
  'local'
),
(
  't2222221-2222-2222-2222-222222222222',
  'Michael Chen',
  'Best Decision Ever',
  'After months of research, we chose GDS Puppies for our Lab, and it was the best decision! Charlie is everything we hoped for - smart, friendly, and healthy. The health clearances on both parents gave us peace of mind, and the ongoing support has been invaluable. Thank you!',
  5,
  'Grand Rapids, Michigan',
  'Charlie',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  true,
  true,
  '2024-03-20',
  'local'
),
(
  't3333331-3333-3333-3333-333333333333',
  'Jennifer Martinez',
  'Professional and Caring',
  'We purchased our German Shepherd puppy, Max, from GDS Puppies and the experience exceeded our expectations. The breeder was knowledgeable, answered all our questions, and provided excellent guidance on training and care. Max is now 6 months old and is the perfect family guardian and companion.',
  5,
  'Lansing, Michigan',
  'Max',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  true,
  true,
  '2023-12-10',
  'local'
),
(
  't4444441-4444-4444-4444-444444444444',
  'Robert Williams',
  'Healthy, Happy Puppy',
  'Our Golden Retriever puppy, Daisy, is absolutely wonderful! She came home healthy, well-socialized, and ready to be part of our family. The health guarantee provided extra peace of mind. GDS Puppies truly cares about their dogs and the families they go to.',
  5,
  'Detroit, Michigan',
  'Daisy',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  true,
  true,
  '2024-01-28',
  'local'
),
(
  't5555551-5555-5555-5555-555555555555',
  'Amanda Thompson',
  'Lifetime Support is Real',
  'What sets GDS Puppies apart is their lifetime support. Even after bringing our Lab puppy home, they have been available to answer questions and provide guidance. Our Luna is now 8 months old and thriving thanks to their continued support!',
  5,
  'Kalamazoo, Michigan',
  'Luna',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  false,
  true,
  '2023-11-05',
  'local'
);

-- ============================================
-- 7. BLOG POSTS
-- ============================================
INSERT INTO public.blog_posts (
  id,
  title,
  slug,
  excerpt,
  content,
  featured_image_url,
  author_name,
  category,
  tags,
  status,
  published_at
) VALUES
(
  'b1111111-1111-1111-1111-111111111111',
  'Preparing Your Home for a New Puppy',
  'preparing-home-for-new-puppy',
  'Essential tips and checklist for getting your home ready before bringing your new puppy home.',
  '# Preparing Your Home for a New Puppy

Bringing home a new puppy is exciting! Here are essential steps to prepare your home:

## Puppy-Proof Your Space
- Remove hazardous items from puppy''s reach
- Secure electrical cords and outlets
- Remove toxic plants
- Store cleaning supplies safely

## Essential Supplies
- Food and water bowls
- High-quality puppy food
- Comfortable bed
- Collar and leash
- ID tag
- Toys for play and teething
- Crate for training
- Cleaning supplies for accidents

## Create a Safe Space
Designate a puppy area where your new friend can feel secure and comfortable. This helps with training and gives them a safe haven.

## Schedule Your First Vet Visit
Book an appointment with your veterinarian within the first few days of bringing your puppy home.',
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=1200',
  'GDS Puppies Team',
  'Puppy Care',
  ARRAY['puppy care', 'new puppy', 'home preparation'],
  'published',
  '2024-03-01'
),
(
  'b2222221-2222-2222-2222-222222222222',
  'Understanding Puppy Socialization',
  'puppy-socialization-guide',
  'Why early socialization is crucial and how to properly socialize your puppy.',
  '# Understanding Puppy Socialization

Proper socialization during the critical period (3-16 weeks) is essential for raising a well-adjusted dog.

## Why Socialization Matters
- Prevents fear and anxiety
- Builds confidence
- Improves adaptability
- Creates positive associations

## Safe Socialization Tips
- Start early but go slowly
- Ensure positive experiences
- Avoid overwhelming your puppy
- Introduce various people, sounds, and environments
- Continue socialization throughout life

## What to Expose Your Puppy To
- Different types of people
- Various environments
- Other vaccinated, friendly dogs
- Different sounds and surfaces
- Car rides
- Grooming procedures',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200',
  'GDS Puppies Team',
  'Training',
  ARRAY['socialization', 'puppy training', 'behavior'],
  'published',
  '2024-02-15'
);

-- ============================================
-- 8. CONTACT INFORMATION
-- ============================================
INSERT INTO public.site_contact_info (
  id,
  phone,
  email,
  address_city,
  address_state,
  hours_of_operation,
  holiday_hours
) VALUES
(
  'c1111111-1111-1111-1111-111111111111',
  '(555) 123-4567',
  'info@gdspuppies.com',
  'Detroit',
  'Michigan',
  jsonb_build_object(
    'monday', '9:00 AM - 6:00 PM',
    'tuesday', '9:00 AM - 6:00 PM',
    'wednesday', '9:00 AM - 6:00 PM',
    'thursday', '9:00 AM - 6:00 PM',
    'friday', '9:00 AM - 6:00 PM',
    'saturday', '10:00 AM - 4:00 PM',
    'sunday', 'By Appointment Only'
  ),
  jsonb_build_object(
    'Christmas Day', 'Closed',
    'New Years Day', 'Closed',
    'Thanksgiving', 'Closed',
    'Independence Day', '10:00 AM - 2:00 PM'
  )
);

-- ============================================
-- 9. ANALYTICS SETTINGS
-- ============================================
INSERT INTO public.analytics_settings (
  id,
  google_analytics_id,
  google_analytics_enabled,
  facebook_pixel_id,
  facebook_pixel_enabled,
  google_tag_manager_id,
  google_tag_manager_enabled,
  microsoft_clarity_id,
  microsoft_clarity_enabled,
  hotjar_site_id,
  hotjar_enabled
) VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  NULL,
  false,
  NULL,
  false,
  NULL,
  false,
  NULL,
  false,
  NULL,
  false
);

-- ============================================
-- 10. SEO META (for key pages)
-- ============================================
INSERT INTO public.seo_meta (
  id,
  page_type,
  page_slug,
  meta_title,
  meta_description,
  meta_keywords,
  og_title,
  og_description,
  og_image,
  canonical_url
) VALUES
(
  's1111111-1111-1111-1111-111111111111',
  'home',
  '/',
  'GDS Puppies - Premium Puppy Breeder in Michigan | Healthy, Happy Puppies',
  'Welcome to GDS Puppies, Michigans trusted puppy breeder. Champion bloodlines, health guarantees, and lifetime support. Browse our available Golden Retrievers, Labs, and German Shepherds.',
  ARRAY['puppy breeder', 'Michigan puppies', 'Golden Retriever puppies', 'Labrador puppies', 'German Shepherd puppies', 'champion bloodlines', 'healthy puppies'],
  'GDS Puppies - Premium Puppy Breeder in Michigan',
  'Champion bloodlines with health guarantees and lifetime support. Find your perfect puppy companion today.',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200',
  'https://gdspuppies.com/'
),
(
  's2222221-2222-2222-2222-222222222222',
  'puppies',
  '/puppies',
  'Available Puppies - Golden Retrievers, Labs & German Shepherds | GDS Puppies',
  'Browse our available puppies from champion bloodlines. All puppies come with health guarantees and lifetime support. Located in Detroit, Michigan.',
  ARRAY['puppies for sale', 'Golden Retriever puppies', 'Labrador puppies', 'German Shepherd puppies', 'Michigan'],
  'Available Puppies for Sale - GDS Puppies',
  'Find your perfect puppy from our available litters. Champion bloodlines with health guarantees.',
  'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=1200',
  'https://gdspuppies.com/puppies'
);

COMMIT;
