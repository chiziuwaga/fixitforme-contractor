"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "./useUser"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

interface UploadedFile {
  name: string
  url: string
}

export function useDocumentUploader() {
  const { user } = useUser()
  const supabase = createClientComponentClient()
  const [files, setFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return
      setLoading(true)
      try {
        const { data, error } = await supabase.storage.from("contractor_documents").list(user.id, {
          limit: 100,
        })

        if (error) throw error

        const publicUrls = data.map((file) => {
          const { data: publicUrlData } = supabase.storage
            .from("contractor_documents")
            .getPublicUrl(`${user.id}/${file.name}`)
          return { name: file.name, url: publicUrlData.publicUrl }
        })

        setUploadedFiles(publicUrls)
      } catch (error) {
        toast.error("Failed to load documents.", {
          description: error instanceof Error ? error.message : "Please refresh the page.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [user, supabase])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files))
    }
  }

  const handleUpload = async () => {
    if (!user || files.length === 0) return

    setUploading(true)
    const uploadPromises = files.map((file) => {
      const filePath = `${user.id}/${file.name}`
      return supabase.storage.from("contractor_documents").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Overwrite existing files
      })
    })

    try {
      const results = await Promise.all(uploadPromises)
      const failedUploads = results.filter((result) => result.error)

      if (failedUploads.length > 0) {
        throw new Error(`Failed to upload ${failedUploads.length} file(s).`)
      }

      toast.success(`${files.length} file(s) uploaded successfully!`)
      // Refresh the list of uploaded files
      const { data: publicUrlData } = supabase.storage
        .from("contractor_documents")
        .getPublicUrl(`${user.id}/${files[0].name}`)
      setUploadedFiles((prev) => [...prev, { name: files[0].name, url: publicUrlData.publicUrl }])
      setFiles([])
    } catch (error) {
      toast.error("Upload failed.", {
        description: error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setUploading(false)
    }
  }

  // Enhanced error handling with retry logic
  const handleUploadWithRetry = async (retryCount = 0) => {
    if (!user || files.length === 0) return

    setUploading(true)
    
    try {
      const MAX_RETRIES = 2
      const uploadPromises = files.map(async (file) => {
        const filePath = `${user.id}/${file.name}`
        
        // NEW: Handle file type validation
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword']
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File type ${file.type} not supported`)
        }
        
        // NEW: Handle file size validation  
        const maxSize = 20 * 1024 * 1024 // 20MB
        if (file.size > maxSize) {
          throw new Error(`File "${file.name}" exceeds 20MB limit`)
        }
        
        return supabase.storage.from("contractor_documents").upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        })
      })

      const results = await Promise.all(uploadPromises)
      const failedUploads = results.filter((result) => result.error)

      // NEW: Retry logic for failed uploads
      if (failedUploads.length > 0 && retryCount < MAX_RETRIES) {
        toast.warning(`${failedUploads.length} files failed. Retrying...`)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        return handleUploadWithRetry(retryCount + 1)
      }

      if (failedUploads.length > 0) {
        throw new Error(`Failed to upload ${failedUploads.length} file(s) after ${MAX_RETRIES} retries.`)
      }

      toast.success(`${files.length} file(s) uploaded successfully!`)
      // Refresh the list of uploaded files
      const { data: publicUrlData } = supabase.storage
        .from("contractor_documents")
        .getPublicUrl(`${user.id}/${files[0].name}`)
      setUploadedFiles((prev) => [...prev, { name: files[0].name, url: publicUrlData.publicUrl }])
      setFiles([])
    } catch (error) {
      // NEW: Enhanced error categorization
      if (error instanceof Error) {
        if (error.message.includes('not supported')) {
          toast.error("File Type Error", {
            description: error.message + ". Supported: PDF, DOC, DOCX, JPG, PNG",
          })
        } else if (error.message.includes('exceeds')) {
          toast.error("File Size Error", {
            description: error.message,
          })
        } else if (error.message.includes('Failed to upload')) {
          toast.error("Upload Failed", {
            description: error.message + " Please try again.",
          })
        } else {
          toast.error("Upload Error", {
            description: "An unexpected error occurred. Please try again.",
          })
        }
      }
    } finally {
      setUploading(false)
    }
  }

  return {
    files,
    uploadedFiles,
    loading,
    uploading,
    handleFileChange,
    handleUpload,
  }
}
