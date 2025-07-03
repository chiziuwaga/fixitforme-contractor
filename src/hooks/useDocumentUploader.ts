'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  size: number;
}

export const useDocumentUploader = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Contractor License.pdf',
      type: 'license',
      status: 'approved',
      uploadedAt: '2024-01-15',
      size: 245760
    },
    {
      id: '2',
      name: 'Insurance Certificate.pdf',
      type: 'insurance',
      status: 'pending',
      uploadedAt: '2024-01-20',
      size: 189440
    }
  ]);
  const [uploading, setUploading] = useState(false);

  const requiredDocuments = [
    { type: 'license', label: 'Contractor License', required: true },
    { type: 'insurance', label: 'General Liability Insurance', required: true },
    { type: 'bond', label: 'Surety Bond', required: false },
    { type: 'certifications', label: 'Professional Certifications', required: false }
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusClasses = (status: 'approved' | 'pending' | 'rejected') => {
    switch (status) {
      case 'approved': return 'bg-success/10 text-success-foreground border-success/20';
      case 'pending': return 'bg-warning/10 text-warning-foreground border-warning/20';
      case 'rejected': return 'bg-destructive/10 text-destructive-foreground border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return 'Check';
      case 'pending': return 'AlertCircle';
      case 'rejected': return 'X';
      default: return null;
    }
  };

  const handleFileUpload = async (file: File, docType: string) => {
    if (!file) return;

    setUploading(true);

    try {
      // Simulate upload - in real app, this would upload to Supabase Storage
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newDocument: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: docType,
        status: 'pending',
        uploadedAt: new Date().toISOString().split('T')[0],
        size: file.size
      };

      setDocuments(prev => [...prev, newDocument]);
      toast.success('Document uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast.success('Document removed');
  };

  const getUploadedDocument = (docType: string) => {
    return documents.find(doc => doc.type === docType);
  };

  return {
    documents,
    uploading,
    requiredDocuments,
    formatFileSize,
    getStatusClasses,
    getStatusIcon,
    handleFileUpload,
    handleRemoveDocument,
    getUploadedDocument
  };
};
