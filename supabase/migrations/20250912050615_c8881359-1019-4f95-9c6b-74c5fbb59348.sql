-- Phase 2: Fix Database Relationships & Add Breed Templates

-- First, let's associate existing puppies with appropriate litters based on breed
UPDATE puppies 
SET litter_id = (
  SELECT id FROM litters 
  WHERE litters.breed = puppies.breed 
  LIMIT 1
)
WHERE litter_id IS NULL;

-- Add comprehensive breed template data for the breeds we have
INSERT INTO breed_templates (
  breed_name, description, size, temperament, 
  average_weight_min, average_weight_max, 
  life_expectancy_min, life_expectancy_max,
  good_with_kids, good_with_pets, hypoallergenic,
  exercise_needs, grooming_needs, health_considerations,
  care_instructions, common_traits
) VALUES 
(
  'Golden Retriever',
  'Golden Retrievers are friendly, intelligent, and devoted dogs. They are among America''s most popular dog breeds. Goldens are outgoing, trustworthy, and eager-to-please family dogs.',
  'Large',
  ARRAY['Friendly', 'Intelligent', 'Devoted', 'Trustworthy', 'Eager to Please', 'Outgoing'],
  55, 75, 10, 12,
  true, true, false,
  'High - needs daily exercise and mental stimulation',
  'High - requires regular brushing, especially during shedding seasons',
  ARRAY['Hip Dysplasia', 'Elbow Dysplasia', 'Heart Disease', 'Eye Conditions', 'Cancer'],
  'Regular exercise, mental stimulation, consistent grooming, and routine veterinary care.',
  ARRAY['Water-loving', 'Gentle mouth', 'Excellent family dog', 'Easy to train', 'Social']
),
(
  'German Shepherd',
  'German Shepherds are large, athletic dogs known for their loyalty, courage, and versatility. They are extremely versatile, serving as family companions, guard dogs, and service dogs.',
  'Large',
  ARRAY['Confident', 'Courageous', 'Smart', 'Loyal', 'Versatile', 'Alert'],
  50, 90, 9, 13,
  true, true, false,
  'High - needs substantial daily exercise and mental challenges',
  'High - double coat requires regular brushing, heavy seasonal shedding',
  ARRAY['Hip Dysplasia', 'Elbow Dysplasia', 'Bloat', 'Degenerative Myelopathy'],
  'Needs firm, consistent training, early socialization, and plenty of exercise and mental stimulation.',
  ARRAY['Highly trainable', 'Protective instinct', 'Working dog', 'Athletic', 'Intelligent']
),
(
  'Labrador Retriever',
  'Labrador Retrievers are friendly, outgoing, and active companions. They are famously friendly and outgoing, and Labs'' typical response to most people is a happy tail wag.',
  'Large',
  ARRAY['Friendly', 'Outgoing', 'Active', 'Happy', 'Gentle', 'Intelligent'],
  55, 80, 10, 12,
  true, true, false,
  'High - needs daily vigorous exercise',
  'Low to Moderate - weekly brushing, seasonal shedding',
  ARRAY['Hip Dysplasia', 'Elbow Dysplasia', 'Heart Disease', 'Eye Conditions', 'Exercise Induced Collapse'],
  'Requires daily exercise, consistent training, and regular grooming during shedding seasons.',
  ARRAY['Water retriever', 'Food motivated', 'Excellent family pet', 'Easy to train', 'Gentle mouth']
),
(
  'Poodle',
  'Poodles come in three sizes and are exceptional athletes and companions. They are highly intelligent, athletic, and versatile dogs. Their hypoallergenic coat makes them popular with allergy sufferers.',
  'Medium',
  ARRAY['Intelligent', 'Athletic', 'Alert', 'Trainable', 'Active', 'Proud'],
  45, 70, 12, 15,
  true, true, true,
  'High - needs daily exercise and mental stimulation',
  'High - requires professional grooming every 6-8 weeks',
  ARRAY['Hip Dysplasia', 'Progressive Retinal Atrophy', 'Epilepsy', 'Addison''s Disease'],
  'Regular professional grooming, daily exercise, mental stimulation, and consistent training.',
  ARRAY['Hypoallergenic coat', 'Highly intelligent', 'Excellent swimmer', 'Non-shedding', 'Versatile size options']
);

-- Update existing puppies to link to breed templates where appropriate
UPDATE puppies 
SET breed_template_id = (
  SELECT id FROM breed_templates 
  WHERE breed_templates.breed_name = puppies.breed 
  LIMIT 1
)
WHERE breed_template_id IS NULL;