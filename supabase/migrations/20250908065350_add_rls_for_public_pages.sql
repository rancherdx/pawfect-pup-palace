-- Grant public read-only access to tables for public-facing pages
CREATE POLICY "Litters are publicly viewable" ON public.litters FOR SELECT USING (true);
CREATE POLICY "Studs are publicly viewable" ON public.studs FOR SELECT USING (true);
CREATE POLICY "Blog posts are publicly viewable" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Testimonials are publicly viewable" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "FAQs are publicly viewable" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Site settings are publicly viewable" ON public.site_settings FOR SELECT USING (true);
