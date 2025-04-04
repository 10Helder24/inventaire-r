/*
  # Fix storage policies for articles bucket

  1. Security Changes
    - Enable public access to the bucket
    - Add policies for authenticated users
    - Fix RLS policies for storage
*/

-- Activer RLS pour les buckets et objets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Authenticated users can create buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Authenticated users can view objects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload objects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update objects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete objects" ON storage.objects;

-- Créer le bucket articles avec accès public
INSERT INTO storage.buckets (id, name, public)
VALUES ('articles', 'articles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Politique pour permettre l'accès public au bucket
CREATE POLICY "Give users access to bucket"
ON storage.buckets FOR SELECT
TO public
USING (true);

-- Politique pour permettre aux utilisateurs authentifiés de lire les objets
CREATE POLICY "Give users access to objects"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'articles');

-- Politique pour permettre aux utilisateurs authentifiés d'uploader des objets
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'articles');

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour leurs objets
CREATE POLICY "Allow authenticated users to update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'articles');

-- Politique pour permettre aux utilisateurs authentifiés de supprimer leurs objets
CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'articles');