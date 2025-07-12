"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Paperclip, X, FileText, Image, FileX } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ChatFile {
  id: string
  file: File
  preview?: string
  type: 'image' | 'document' | 'other'
}

interface ChatFileUploadProps {
  onFilesChange: (files: ChatFile[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  className?: string
}

export function ChatFileUpload({ 
  onFilesChange, 
  maxFiles = 3, 
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  className 
}: ChatFileUploadProps) {
  const [attachedFiles, setAttachedFiles] = useState<ChatFile[]>([])

  const processFile = useCallback((file: File): ChatFile => {
    const id = Math.random().toString(36).substring(7)
    let type: ChatFile['type'] = 'other'
    let preview: string | undefined

    if (file.type.startsWith('image/')) {
      type = 'image'
      preview = URL.createObjectURL(file)
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      type = 'document'
    } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      type = 'document'
    }

    return { id, file, preview, type }
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: ChatFile[] = []

    for (const file of acceptedFiles) {
      if (attachedFiles.length + newFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`)
        break
      }

      if (file.size > maxSize) {
        toast.error(`File "${file.name}" is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`)
        continue
      }

      newFiles.push(processFile(file))
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...attachedFiles, ...newFiles]
      setAttachedFiles(updatedFiles)
      onFilesChange(updatedFiles)
    }
  }, [attachedFiles, maxFiles, maxSize, processFile, onFilesChange])

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = attachedFiles.filter(f => f.id !== fileId)
    setAttachedFiles(updatedFiles)
    onFilesChange(updatedFiles)

    // Clean up preview URLs to prevent memory leaks
    const removedFile = attachedFiles.find(f => f.id === fileId)
    if (removedFile?.preview) {
      URL.revokeObjectURL(removedFile.preview)
    }
  }, [attachedFiles, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize,
    noClick: true,
    noKeyboard: true
  })

  const getFileIcon = (type: ChatFile['type']) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4 text-blue-500" />
      case 'document': return <FileText className="w-4 h-4 text-red-500" />
      default: return <FileX className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Attached Files Display */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-md">
          {attachedFiles.map((chatFile) => (
            <div 
              key={chatFile.id}
              className="flex items-center gap-2 p-2 bg-background border rounded-md text-sm"
            >
              {getFileIcon(chatFile.type)}
              <span className="truncate max-w-[120px]" title={chatFile.file.name}>
                {chatFile.file.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 hover:bg-destructive/10"
                onClick={() => removeFile(chatFile.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button & Drop Zone */}
      <div 
        {...getRootProps()}
        className={cn(
          "relative",
          isDragActive && "bg-primary/5 border-primary border-dashed rounded-md p-2"
        )}
      >
        <input {...getInputProps()} />
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation()
            const input = document.querySelector('input[type="file"]') as HTMLInputElement
            input?.click()
          }}
          disabled={attachedFiles.length >= maxFiles}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/5 border-2 border-primary border-dashed rounded-md">
            <p className="text-sm text-primary font-medium">Drop files here...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export type { ChatFile }
