/*
  # Add storage policies for articles bucket

  1. Security
    - Enable storage access for authenticated users
    - Add policies for bucket and object management
*/

-- Créer le bucket articles s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('articles', 'articles', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre aux utilisateurs authentifiés de créer des buckets
CREATE POLICY "Authenticated users can create buckets"
ON storage.buckets
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Politique pour permettre aux utilisateurs authentifiés de lire les objets
CREATE POLICY "Authenticated users can view objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'articles');

-- Politique pour permettre aux utilisateurs authentifiés d'uploader des objets
CREATE POLICY "Authenticated users can upload objects"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'articles');

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour les objets
CREATE POLICY "Authenticated users can update objects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'articles');

-- Politique pour permettre aux utilisateurs authentifiés de supprimer des objets
CREATE POLICY "Authenticated users can delete objects"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'articles');