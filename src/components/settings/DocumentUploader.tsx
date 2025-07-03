'use client';

import { useDocumentUploader } from '@/hooks/useDocumentUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Check, X, AlertCircle } from 'lucide-react';

// This is the new, re-skinned DocumentUploader component.
// It is now a purely presentational component.
// All logic has been moved to the `useDocumentUploader` hook.

interface DocumentUploaderProps {
  contractorId?: string;
}

export default function DocumentUploader({ contractorId }: DocumentUploaderProps) {
  const {
    documents,
    uploading,
    requiredDocuments,
    formatFileSize,
    getStatusClasses,
    getStatusIcon,
    handleFileUpload,
    handleRemoveDocument,
    getUploadedDocument
  } = useDocumentUploader();

  const renderStatusIcon = (status: string) => {
    const iconName = getStatusIcon(status);
    switch (iconName) {
      case 'Check': return <Check className="h-4 w-4" />;
      case 'AlertCircle': return <AlertCircle className="h-4 w-4" />;
      case 'X': return <X className="h-4 w-4" />;
      default: return null;
    }
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
            const uploadedDoc = getUploadedDocument(reqDoc.type);
            
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
                    <Badge className={getStatusClasses(uploadedDoc.status)} variant="outline">
                      {renderStatusIcon(uploadedDoc.status)}
                      <span className="ml-1 capitalize">{uploadedDoc.status}</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Not uploaded
                    </Badge>
                  )}
                </div>

                {uploadedDoc ? (
                  <div className="flex items-center justify-between bg-muted rounded p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-info" />
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
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
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
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, reqDoc.type);
                          }
                        }}
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
          <div className="bg-info/10 border border-info/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-info"></div>
              <span className="text-sm text-info-foreground">Uploading document...</span>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-muted rounded-lg p-4">
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
