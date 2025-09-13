-- Phase 1: Add database indexes for performance optimization
-- These indexes will significantly improve query performance for frequently accessed data

-- Index for puppies table
CREATE INDEX IF NOT EXISTS idx_puppies_breed ON puppies(breed);
CREATE INDEX IF NOT EXISTS idx_puppies_status ON puppies(status);
CREATE INDEX IF NOT EXISTS idx_puppies_created_at ON puppies(created_at);
CREATE INDEX IF NOT EXISTS idx_puppies_litter_id ON puppies(litter_id);
CREATE INDEX IF NOT EXISTS idx_puppies_is_featured ON puppies(is_featured);

-- Index for litters table  
CREATE INDEX IF NOT EXISTS idx_litters_breed ON litters(breed);
CREATE INDEX IF NOT EXISTS idx_litters_status ON litters(status);
CREATE INDEX IF NOT EXISTS idx_litters_date_of_birth ON litters(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_litters_created_at ON litters(created_at);

-- Index for blog_posts table
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);

-- Index for testimonials table
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_admin_approved ON testimonials(admin_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_source ON testimonials(source);

-- Index for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_square_payment_id ON transactions(square_payment_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_puppies_status_breed ON puppies(status, breed);
CREATE INDEX IF NOT EXISTS idx_puppies_status_featured ON puppies(status, is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved_featured ON testimonials(admin_approved, is_featured);