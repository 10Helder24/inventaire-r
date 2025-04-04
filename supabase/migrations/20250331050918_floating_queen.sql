/*
  # Fix storage policies for articles bucket

  1. Changes
    - Drop existing storage policies
    - Create new policies with proper authentication checks
    - Enable public access for viewing objects
    - Add proper RLS for authenticated users
*/

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Allow public bucket access" ON storage.buckets;
DROP POLICY IF EXISTS "Allow public object access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public bucket access" ON storage.buckets;
DROP POLICY IF EXISTS "Public object access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- S'assurer que RLS est activé
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Mettre à jour le bucket pour être public
UPDATE storage.buckets
SET public = true
WHERE id = 'articles';

-- Politique pour permettre l'accès au bucket
CREATE POLICY "Enable read access for all users"
ON storage.buckets FOR SELECT
TO public
USING (true);

-- Politique pour permettre la création de bucket aux utilisateurs authentifiés
CREATE POLICY "Enable insert access for authenticated users only"
ON storage.buckets FOR INSERT
TO authenticated
WITH CHECK (true);

-- Politique pour permettre la lecture des objets à tous
CREATE POLICY "Enable read access for all users"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'articles');

-- Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Enable upload access for authenticated users"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'articles' AND
  auth.role() = 'authenticated'
);

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Enable update access for authenticated users"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'articles' AND
  auth.role() = 'authenticated'
);

-- Politique pour permettre la suppression aux utilisateurs authentifiés
CREATE POLICY "Enable delete access for authenticated users"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'articles' AND
  auth.role() = 'authenticated'
);