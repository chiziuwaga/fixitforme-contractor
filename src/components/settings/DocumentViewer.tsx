"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Download, Eye, Shield, Calendar, Upload } from "lucide-react"
import { motion } from "framer-motion"
import { useUser } from "@/hooks/useUser"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { TYPOGRAPHY, SPACING } from "@/lib/design-system"

interface ContractorDocument {
  id: string
  document_type: string
  file_url: string
  file_name: string
  file_size: number
  verified: boolean
  uploaded_at: string
  expires_at?: string
}

export function DocumentViewer() {
  const { user } = useUser()
  const supabase = createClientComponentClient()
  const [documents, setDocuments] = useState<ContractorDocument[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return
      
      try {
        // Get contractor profile first
        const { data: profile } = await supabase
          .from('contractor_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (!profile) return
        
        // Fetch documents from database
        const { data: dbDocuments, error } = await supabase
          .from('contractor_documents')
          .select('*')
          .eq('contractor_id', profile.id)
          .order('uploaded_at', { ascending: false })
        
        if (error) throw error
        
        setDocuments(dbDocuments || [])
      } catch (error) {
        console.error('Error fetching documents:', error)
        toast.error('Failed to load documents')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDocuments()
  }, [user, supabase])
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const getDocumentIcon = (documentType: string) => {
    switch (documentType.toLowerCase()) {
      case 'license':
        return <Shield className="h-5 w-5 text-blue-500" />
      case 'insurance':
        return <Shield className="h-5 w-5 text-green-500" />
      case 'certification':
        return <FileText className="h-5 w-5 text-orange-500" />
      default:
        return <FileText className="h-5 w-5 text-slate-500" />
    }
  }
  
  const handleViewDocument = (doc: ContractorDocument) => {
    window.open(doc.file_url, '_blank')
  }
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }
  
  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">No documents uploaded yet</h3>
              <p className="text-sm text-muted-foreground">
                Upload your license, insurance, and certifications to improve your profile
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Uploaded Documents ({documents.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          These documents are accessible by Alex and Rex for improved bidding and lead analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {documents.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors"
          >
            <div className="flex-shrink-0">
              {getDocumentIcon(doc.document_type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{doc.file_name}</h4>
                <Badge variant={doc.verified ? "default" : "secondary"} className={`text-xs ${doc.verified ? "bg-green-100 text-green-800" : ""}`}>
                  {doc.verified ? "Verified" : "Pending"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="capitalize">{doc.document_type}</span>
                <span>•</span>
                <span>{formatFileSize(doc.file_size)}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(doc.uploaded_at)}
                </div>
              </div>
              
              {doc.expires_at && (
                <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                  <Calendar className="h-3 w-3" />
                  Expires: {formatDate(doc.expires_at)}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDocument(doc)}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex items-center gap-1"
              >
                <a href={doc.file_url} download={doc.file_name}>
                  <Download className="h-3 w-3" />
                  Download
                </a>
              </Button>
            </div>
          </motion.div>
        ))}
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">AI Agent Access</h4>
              <p className="text-sm text-blue-700 mt-1">
                Alex uses your credentials for accurate bid calculations, while Rex analyzes your 
                qualifications to find better-matched leads. All data is processed securely and 
                remains confidential.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
