"use client"

import { useDocumentUploader } from "@/hooks/useDocumentUploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, File, CheckCircle, ExternalLink } from "lucide-react"
import { SPACING } from "@/lib/design-system"

export default function DocumentUploader() {
  const { files, uploadedFiles, loading, uploading, handleFileChange, handleUpload } = useDocumentUploader()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Documents</CardTitle>
        <CardDescription>Upload your business license, insurance, or other relevant documents.</CardDescription>
      </CardHeader>
      <CardContent className={SPACING.component.md}>
        <div className={SPACING.component.xs}>
          <Label htmlFor="document-upload">Select Files to Upload</Label>
          <Input id="document-upload" type="file" multiple onChange={handleFileChange} disabled={uploading} />
          {files.length > 0 && (
            <div className="text-sm text-muted-foreground pt-2">Selected: {files.map((f) => f.name).join(", ")}</div>
          )}
        </div>
        <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Upload {files.length > 0 ? files.length : ""} file(s)
            </>
          )}
        </Button>

        <div className={`${SPACING.component.md} pt-4`}>
          <h3 className="text-lg font-medium">Uploaded Documents</h3>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading documents...</span>
            </div>
          ) : uploadedFiles.length > 0 ? (
            <ul className={SPACING.component.sm}>
              {uploadedFiles.map((file) => (
                <li key={file.name} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-primary" />
                    <span className="font-medium">{file.name}</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      View <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No documents have been uploaded yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
