/*
  # Update storage policies for articles bucket

  1. Changes
    - Drop existing policies
    - Create new policies with proper permissions
    - Enable public access for viewing objects
*/

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Give users access to bucket" ON storage.buckets;
DROP POLICY IF EXISTS "Give users access to objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;

-- Mettre à jour le bucket pour être public
UPDATE storage.buckets
SET public = true
WHERE id = 'articles';

-- Politique pour permettre l'accès public au bucket
CREATE POLICY "Public bucket access"
ON storage.buckets FOR SELECT
TO public
USING (id = 'articles');

-- Politique pour permettre l'accès public aux objets
CREATE POLICY "Public object access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'articles');

-- Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'articles');

-- Politique pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'articles');

-- Politique pour permettre la suppression aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'articles');