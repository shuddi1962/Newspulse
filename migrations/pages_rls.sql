-- Enable RLS on pages table
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "public_read" ON pages FOR SELECT USING (true);

-- Allow admin/editor write access
CREATE POLICY "admin_write" ON pages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'editor')
  )
);
