'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, List, ThemeIcon, rem, Paper, Title, Text, Group, FileButton, LoadingOverlay, Alert } from '@mantine/core';
import { IconUpload, IconFile, IconTrash, IconAlertCircle } from '@tabler/icons-react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'contractor-documents';

// Define a type for the file objects from Supabase Storage to avoid using `any`
interface StorageFile {
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: Record<string, unknown>;
}

export default function DocumentUploader() {
  const { user, loading: userLoading } = useUser();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contractorId = user?.id;

  const MAX_FILE_SIZE_MB = 20;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const listUploadedFiles = useCallback(async () => {
    if (!contractorId) return;
    setLoadingFiles(true);
    setError(null);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(contractorId, { limit: 100 });

    if (error) {
      console.error('Error listing files:', error);
      setError('Failed to retrieve your documents. Please try again later.');
    } else {
      setFiles(data || []);
    }
    setLoadingFiles(false);
  }, [contractorId]);

  useEffect(() => {
    if (contractorId) {
      listUploadedFiles();
    }
  }, [contractorId, listUploadedFiles]);

  const handleUpload = async (file: File | null) => {
    if (!file || !contractorId) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size exceeds the ${MAX_FILE_SIZE_MB}MB limit. Please select a smaller file.`);
      return;
    }

    setUploading(true);
    setError(null);
    const filePath = `${contractorId}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      setError(`Failed to upload ${file.name}. Please try again.`);
    } else {
      await listUploadedFiles(); // Refresh the file list
    }
    setUploading(false);
  };

  const handleDelete = async (fileName: string) => {
    if (!contractorId) return;
    const filePath = `${contractorId}/${fileName}`;

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (deleteError) {
        console.error('Error deleting file:', deleteError);
        setError(`Failed to delete ${fileName}. Please try again.`);
    } else {
        setFiles(files.filter((file) => file.name !== fileName));
    }
  };

  return (
    <Paper shadow="md" p="lg" withBorder>
      <LoadingOverlay visible={userLoading || uploading || loadingFiles} />
      <Title order={3} mb="lg">Business Documents</Title>
      <Text c="dimmed" mb="md">
        Upload your business license, insurance certificates, and other relevant documents for verification.
      </Text>

      {error && (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" withCloseButton onClose={() => setError(null)} mb="md">
          {error}
        </Alert>
      )}

      <Group justify="flex-start" mb="lg">
        <FileButton onChange={handleUpload} accept="image/png,image/jpeg,application/pdf">
          {(props) => <Button {...props} leftSection={<IconUpload style={{ width: rem(18), height: rem(18) }} />}>Upload Document</Button>}
        </FileButton>
      </Group>

      <List spacing="sm" size="sm" center>
        {files.length > 0 ? (
          files.map((file) => (
            <List.Item
              key={file.id}
              icon={
                <ThemeIcon color="gray" size={24} radius="xl">
                  <IconFile style={{ width: rem(16), height: rem(16) }} />
                </ThemeIcon>
              }
            >
              <Group justify="space-between">
                <Text>{file.name}</Text>
                <Button variant="subtle" color="red" size="xs" onClick={() => handleDelete(file.name)}>
                    <IconTrash style={{ width: rem(16), height: rem(16) }} />
                </Button>
              </Group>
            </List.Item>
          ))
        ) : (
          <Text c="dimmed" fs="italic">No documents uploaded yet.</Text>
        )}
      </List>
    </Paper>
  );
}
