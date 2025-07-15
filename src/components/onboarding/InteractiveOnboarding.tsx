/**
 * Enhanced Interactive Onboarding Components
 * Features document upload, website analysis, and AI-powered setup
 */

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Upload, 
  Globe, 
  FileText, 
  Image, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Download,
  Eye,
  Trash2,
  ExternalLink,
  Sparkles,
  Building,
  Phone,
  Mail,
  MapPin
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useDropzone } from "react-dropzone"

// Document types for contractor onboarding
const DOCUMENT_TYPES = [
  { id: 'license', name: 'Business License', required: true, icon: FileText },
  { id: 'insurance', name: 'Liability Insurance', required: true, icon: FileText },
  { id: 'portfolio', name: 'Portfolio/Past Work', required: false, icon: Image },
  { id: 'certifications', name: 'Certifications', required: false, icon: FileText },
  { id: 'references', name: 'References', required: false, icon: FileText }
]

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  status: 'uploading' | 'uploaded' | 'error'
  analysis?: {
    confidence: number
    extractedData: Record<string, string | number | boolean | null>
    suggestions: string[]
  }
}

interface WebsiteAnalysis {
  url: string
  status: 'analyzing' | 'completed' | 'error'
  data?: {
    title: string
    description: string
    services: string[]
    contact: {
      phone?: string
      email?: string
      address?: string
    }
    socialMedia: string[]
    portfolio: string[]
    suggestions: string[]
  }
}

export function EnhancedDocumentUpload({ 
  documentType, 
  onUploadComplete 
}: { 
  documentType: typeof DOCUMENT_TYPES[0], 
  onUploadComplete: (files: UploadedFile[]) => void 
}) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsAnalyzing(true)
    
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading'
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    // Simulate upload and AI analysis
    for (const file of newFiles) {
      try {
        // TODO: Implement actual upload to Supabase Storage
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // TODO: Implement AI document analysis
        const mockAnalysis = {
          confidence: Math.random() * 0.3 + 0.7, // 70-100%
          extractedData: {
            licenseNumber: documentType.id === 'license' ? 'LIC-' + Math.random().toString(36).substr(2, 6).toUpperCase() : null,
            expiryDate: documentType.id === 'license' ? '2025-12-31' : null,
            issuer: documentType.id === 'license' ? 'State of California' : null
          },
          suggestions: [
            'Document appears valid and properly formatted',
            'Consider scanning at higher resolution for better clarity',
            'Make sure all text is clearly visible'
          ]
        }
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === file.id ? { 
            ...f, 
            status: 'uploaded', 
            url: '/placeholder-document.pdf',
            analysis: mockAnalysis 
          } : f
        ))
      } catch {
        setUploadedFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'error' } : f
        ))
      }
    }
    
    setIsAnalyzing(false)
    onUploadComplete(uploadedFiles)
  }, [documentType, uploadedFiles, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <documentType.icon className="h-5 w-5" />
          {documentType.name}
          {documentType.required && <Badge variant="secondary">Required</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          {isDragActive ? (
            <p>Drop files here...</p>
          ) : (
            <div>
              <p className="font-medium">Upload {documentType.name}</p>
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to select files
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, Images, Word docs (max 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Uploaded Files */}
        <AnimatePresence>
          {uploadedFiles.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    file.status === 'uploaded' ? 'bg-green-100 text-green-600' :
                    file.status === 'uploading' ? 'bg-blue-100 text-blue-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {file.status === 'uploaded' && <CheckCircle className="h-4 w-4" />}
                    {file.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin" />}
                    {file.status === 'error' && <AlertCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {file.url && (
                    <>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => {
                    setUploadedFiles(prev => prev.filter(f => f.id !== file.id))
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* AI Analysis Results */}
              {file.analysis && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t bg-muted/20 rounded p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">AI Analysis</span>
                    <Badge variant="outline">
                      {Math.round(file.analysis.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  
                  {file.analysis.extractedData.licenseNumber && (
                    <div className="text-sm space-y-1">
                      <p><strong>License #:</strong> {file.analysis.extractedData.licenseNumber}</p>
                      <p><strong>Expires:</strong> {file.analysis.extractedData.expiryDate}</p>
                      <p><strong>Issuer:</strong> {file.analysis.extractedData.issuer}</p>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      💡 {file.analysis.suggestions[0]}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isAnalyzing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing documents with AI...
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function WebsiteAnalyzer({ onAnalysisComplete }: { 
  onAnalysisComplete: (analysis: WebsiteAnalysis) => void 
}) {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeWebsite = async () => {
    if (!websiteUrl) return
    
    setIsAnalyzing(true)
    const newAnalysis: WebsiteAnalysis = {
      url: websiteUrl,
      status: 'analyzing'
    }
    setAnalysis(newAnalysis)
    
    try {
      // TODO: Implement actual website analysis
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockData = {
        title: 'ABC Construction Company',
        description: 'Professional construction services in California',
        services: ['Roofing', 'Flooring', 'Kitchen Remodeling', 'Bathroom Renovation'],
        contact: {
          phone: '+1 (555) 123-4567',
          email: 'info@abcconstruction.com',
          address: '123 Main St, Los Angeles, CA 90210'
        },
        socialMedia: ['Facebook', 'Instagram'],
        portfolio: ['/project1.jpg', '/project2.jpg', '/project3.jpg'],
        suggestions: [
          'Add more before/after photos to portfolio section',
          'Include customer testimonials for credibility',
          'Consider adding service area map',
          'Update contact form with WhatsApp integration'
        ]
      }
      
      const completedAnalysis = {
        ...newAnalysis,
        status: 'completed' as const,
        data: mockData
      }
      
      setAnalysis(completedAnalysis)
      onAnalysisComplete(completedAnalysis)
    } catch {
      setAnalysis({
        ...newAnalysis,
        status: 'error'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Website Analysis
          <Badge variant="outline">AI-Powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="https://yourwebsite.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={analyzeWebsite} disabled={!websiteUrl || isAnalyzing}>
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Analyze
          </Button>
        </div>

        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Analysis Status */}
            <div className="flex items-center gap-2">
              {analysis.status === 'analyzing' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm">Analyzing website...</span>
                </>
              )}
              {analysis.status === 'completed' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Analysis complete</span>
                </>
              )}
              {analysis.status === 'error' && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Analysis failed</span>
                </>
              )}
            </div>

            {/* Analysis Results */}
            {analysis.status === 'completed' && analysis.data && (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Building className="h-4 w-4" />
                    Business Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Company:</strong> {analysis.data.title}</p>
                    <p><strong>Description:</strong> {analysis.data.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {analysis.data.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Phone className="h-4 w-4" />
                    Contact Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    {analysis.data.contact.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {analysis.data.contact.phone}
                      </p>
                    )}
                    {analysis.data.contact.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {analysis.data.contact.email}
                      </p>
                    )}
                    {analysis.data.contact.address && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {analysis.data.contact.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* AI Suggestions */}
                <div className="border rounded-lg p-4 bg-primary/5">
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Recommendations
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {analysis.data.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={analysis.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Website
                    </a>
                  </Button>
                  <Button variant="outline" size="sm">
                    Import Contact Info
                  </Button>
                  <Button variant="outline" size="sm">
                    Use Services List
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

export function InteractiveOnboardingDashboard() {
  const [completedDocuments, setCompletedDocuments] = useState<Record<string, UploadedFile[]>>({})
  const [websiteAnalysis, setWebsiteAnalysis] = useState<WebsiteAnalysis | null>(null)
  const [currentTab, setCurrentTab] = useState('documents')

  const totalDocuments = DOCUMENT_TYPES.length
  const uploadedDocs = Object.keys(completedDocuments).length
  const uploadedRequired = DOCUMENT_TYPES.filter(doc => 
    doc.required && completedDocuments[doc.id]?.length > 0
  ).length

  const progress = ((uploadedDocs / totalDocuments) * 50) + 
                   (websiteAnalysis?.status === 'completed' ? 50 : 0)

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="h-3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{uploadedDocs}</p>
                <p className="text-sm text-muted-foreground">Documents Uploaded</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">{uploadedRequired}</p>
                <p className="text-sm text-muted-foreground">Required Docs Complete</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {websiteAnalysis?.status === 'completed' ? '✓' : '○'}
                </p>
                <p className="text-sm text-muted-foreground">Website Analyzed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Setup */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents">
            Document Upload
            {uploadedDocs > 0 && (
              <Badge variant="secondary" className="ml-2">{uploadedDocs}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="website">
            Website Analysis
            {websiteAnalysis?.status === 'completed' && (
              <CheckCircle className="ml-2 h-4 w-4 text-green-600" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {DOCUMENT_TYPES.map((docType) => (
            <EnhancedDocumentUpload
              key={docType.id}
              documentType={docType}
              onUploadComplete={(files) => {
                setCompletedDocuments(prev => ({
                  ...prev,
                  [docType.id]: files
                }))
              }}
            />
          ))}
        </TabsContent>

        <TabsContent value="website">
          <WebsiteAnalyzer onAnalysisComplete={setWebsiteAnalysis} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
