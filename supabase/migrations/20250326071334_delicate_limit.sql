/*
  # Fix RLS policies for articles and storage

  1. Changes
    - Update RLS policies for articles table
    - Fix storage policies
    - Enable proper authentication checks
*/

-- Supprimer les politiques existantes pour articles
DROP POLICY IF EXISTS "Users can read articles" ON articles;
DROP POLICY IF EXISTS "Users can insert articles" ON articles;
DROP POLICY IF EXISTS "Users can update articles" ON articles;
DROP POLICY IF EXISTS "Users can delete articles" ON articles;

-- Créer de nouvelles politiques pour articles
CREATE POLICY "Enable read access for authenticated users"
ON articles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON articles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON articles FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
ON articles FOR DELETE
TO authenticated
USING (true);

-- Mettre à jour les politiques de stockage
DROP POLICY IF EXISTS "Public bucket access" ON storage.buckets;
DROP POLICY IF EXISTS "Public object access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- S'assurer que le bucket existe et est public
INSERT INTO storage.buckets (id, name, public)
VALUES ('articles', 'articles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Politiques pour le bucket
CREATE POLICY "Allow public bucket access"
ON storage.buckets FOR SELECT
TO public
USING (true);

-- Politiques pour les objets
CREATE POLICY "Allow public object access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'articles');

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'articles');

CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'articles');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'articles');