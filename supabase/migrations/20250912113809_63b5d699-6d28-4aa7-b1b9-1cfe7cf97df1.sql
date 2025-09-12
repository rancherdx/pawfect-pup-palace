-- Phase 2 Continuation: Update litter puppy counts and fix remaining data issues

-- Update puppy counts for each litter based on actual associated puppies
UPDATE litters 
SET puppy_count = (
  SELECT COUNT(*) 
  FROM puppies 
  WHERE puppies.litter_id = litters.id
);

-- Create a litter for Ruby the Poodle who doesn't have one
INSERT INTO litters (
  name, breed, dam_name, sire_name, date_of_birth, 
  status, description, puppy_count
) VALUES (
  'Spring 2024 Poodles',
  'Poodle', 
  'Coco',
  'Pierre',
  '2024-01-25',
  'Active',
  'Intelligent and athletic poodle litter',
  1
);

-- Associate Ruby with the new Poodle litter
UPDATE puppies 
SET litter_id = (
  SELECT id FROM litters 
  WHERE name = 'Spring 2024 Poodles' AND breed = 'Poodle'
  LIMIT 1
)
WHERE name = 'Ruby' AND breed = 'Poodle' AND litter_id IS NULL;