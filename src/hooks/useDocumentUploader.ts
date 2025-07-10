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

  return {
    files,
    uploadedFiles,
    loading,
    uploading,
    handleFileChange,
    handleUpload,
  }
}
