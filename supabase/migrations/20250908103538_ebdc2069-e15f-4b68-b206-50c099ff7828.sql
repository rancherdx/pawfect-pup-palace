-- Add sample data for testing
-- Sample puppies
INSERT INTO public.puppies (
  name, breed, birth_date, price, status, description, gender, color, weight
) VALUES 
  ('Bella', 'Golden Retriever', '2024-01-15', 1200, 'Available', 'Beautiful golden retriever puppy with loving temperament', 'Female', 'Golden', 8.5),
  ('Max', 'German Shepherd', '2024-02-20', 1500, 'Available', 'Strong and intelligent German Shepherd puppy', 'Male', 'Black and Tan', 12.0),
  ('Luna', 'Labrador Retriever', '2024-01-10', 1000, 'Reserved', 'Sweet chocolate lab puppy, very playful', 'Female', 'Chocolate', 7.2),
  ('Cooper', 'Golden Retriever', '2024-03-05', 1200, 'Available', 'Friendly golden retriever with great personality', 'Male', 'Light Golden', 9.8),
  ('Ruby', 'Poodle', '2024-02-28', 1800, 'Available', 'Hypoallergenic poodle puppy, very smart', 'Female', 'Red', 5.5);

-- Sample litters
INSERT INTO public.litters (
  name, breed, dam_name, sire_name, date_of_birth, status, description, puppy_count, expected_date
) VALUES 
  ('Spring 2024 Goldens', 'Golden Retriever', 'Honey', 'Duke', '2024-01-15', 'Active', 'Beautiful litter of golden retriever puppies', 6, NULL),
  ('Winter 2024 Labs', 'Labrador Retriever', 'Bella', 'Rex', '2024-01-10', 'Active', 'Hardy labrador retriever litter', 8, NULL),
  ('Summer 2024 Shepherds', 'German Shepherd', 'Luna', 'Zeus', '2024-02-20', 'Active', 'Strong German Shepherd litter', 5, NULL);

-- Sample blog posts
INSERT INTO public.blog_posts (
  title, slug, content, excerpt, status, author_name, category, tags
) VALUES 
  ('Choosing the Right Puppy for Your Family', 'choosing-right-puppy-family', 'When selecting a new puppy for your family, there are many important factors to consider...', 'Learn how to choose the perfect puppy that matches your family''s lifestyle and needs.', 'published', 'Breeder Admin', 'Puppy Care', ARRAY['puppies', 'family', 'selection']),
  ('Puppy Training Basics: Getting Started', 'puppy-training-basics', 'Training your new puppy is one of the most important things you can do...', 'Essential puppy training tips for new pet owners.', 'published', 'Breeder Admin', 'Training', ARRAY['training', 'puppies', 'basics']),
  ('Health Care for Your New Puppy', 'puppy-health-care', 'Proper health care is essential for your puppy''s development...', 'Complete guide to keeping your puppy healthy and happy.', 'published', 'Breeder Admin', 'Health', ARRAY['health', 'veterinary', 'puppies']);

-- Sample testimonials
INSERT INTO public.testimonials (
  name, content, rating, puppy_name, location, admin_approved, is_featured
) VALUES 
  ('Sarah Johnson', 'We absolutely love our Golden Retriever puppy from this breeder! She is healthy, well-socialized, and has the sweetest temperament.', 5, 'Bella', 'Austin, TX', true, true),
  ('Mike Williams', 'Outstanding breeder with beautiful puppies. Our German Shepherd is everything we hoped for and more.', 5, 'Max', 'Dallas, TX', true, false),
  ('Emily Davis', 'The best experience getting our lab puppy. Professional, caring, and the puppy came with excellent health records.', 5, 'Luna', 'Houston, TX', true, true);

-- Sample stud dogs
INSERT INTO public.stud_dogs (
  name, breed_id, age, stud_fee, description, is_available, certifications
) VALUES 
  ('Champion Duke', 'Golden Retriever', 4, 800, 'AKC Champion Golden Retriever with excellent bloodlines', true, ARRAY['AKC Champion', 'Health Tested']),
  ('Zeus the Great', 'German Shepherd', 5, 1000, 'Stunning German Shepherd with working dog lineage', true, ARRAY['Schutzhund III', 'Hip Certified']),
  ('Rex Royal', 'Labrador Retriever', 3, 600, 'Beautiful chocolate lab with hunting dog background', true, ARRAY['Hunt Test Qualified', 'Eye Cleared']);