'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  size: number;
}

interface DocumentUploaderProps {
  contractorId?: string;
}

export default function DocumentUploader({ contractorId }: DocumentUploaderProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Simulate upload
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
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast.success('Document removed');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required Documents */}
        <div className="space-y-4">
          {requiredDocuments.map((reqDoc) => {
            const uploadedDoc = documents.find(doc => doc.type === reqDoc.type);
            
            return (
              <div key={reqDoc.type} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {reqDoc.label}
                      {reqDoc.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {reqDoc.required ? 'This document is required for verification' : 'Optional but recommended'}
                    </p>
                  </div>

                  {uploadedDoc ? (
                    <Badge className={getStatusColor(uploadedDoc.status)} variant="outline">
                      {getStatusIcon(uploadedDoc.status)}
                      <span className="ml-1 capitalize">{uploadedDoc.status}</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      Not uploaded
                    </Badge>
                  )}
                </div>

                {uploadedDoc ? (
                  <div className="flex items-center justify-between bg-gray-50 rounded p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">{uploadedDoc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadedDoc.size)} • Uploaded {uploadedDoc.uploadedAt}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Download
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRemoveDocument(uploadedDoc.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      PDF, JPG, PNG up to 10MB
                    </p>
                    <label className="cursor-pointer">
                      <Button size="sm" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Choose File'}
                      </Button>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, reqDoc.type)}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-800">Uploading document...</span>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Document Requirements</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• All documents must be current and valid</li>
            <li>• Files should be clear and legible</li>
            <li>• Maximum file size: 10MB</li>
            <li>• Accepted formats: PDF, JPG, PNG</li>
            <li>• Documents typically reviewed within 24-48 hours</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
