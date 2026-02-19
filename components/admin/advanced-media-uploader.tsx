'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Video, Loader2, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface UploadedFile {
  id: string
  name: string
  url: string
  type: 'image' | 'video'
  size: number
  uploadedAt: string
  status: 'uploading' | 'success' | 'error'
  progress: number
}

interface AdvancedMediaUploaderProps {
  onFileSelect: (file: UploadedFile) => void
  acceptedTypes?: ('image' | 'video')[]
  maxSize?: number // in MB
  multiple?: boolean
}

export function AdvancedMediaUploader({
  onFileSelect,
  acceptedTypes = ['image', 'video'],
  maxSize = 100,
  multiple = false,
}: AdvancedMediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileType = (file: File): 'image' | 'video' | null => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    return null
  }

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const fileType = getFileType(file)
    
    if (!fileType) {
      return { valid: false, error: 'Type de fichier non supporté' }
    }

    if (!acceptedTypes.includes(fileType)) {
      return { valid: false, error: `${fileType} non accepté` }
    }

    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      return { valid: false, error: `Fichier trop volumineux (max ${maxSize}MB)` }
    }

    return { valid: true }
  }

  const uploadFile = async (file: File) => {
    const fileType = getFileType(file)
    if (!fileType) return

    const fileId = `${Date.now()}-${Math.random()}`
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      url: '',
      type: fileType,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'uploading',
      progress: 0,
    }

    setUploadedFiles((prev) => [...prev, newFile])
    setIsUploading(true)

    try {
      console.log('🔵 Starting upload:', file.name)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('resourceType', fileType)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          console.log(`📊 Upload progress: ${Math.round(progress)}%`)
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress: Math.round(progress) } : f
            )
          )
        }
      })

      xhr.addEventListener('load', () => {
        console.log('📥 Upload response status:', xhr.status)
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          console.log('✅ Upload successful:', response.url)
          const uploadedFile: UploadedFile = {
            ...newFile,
            url: response.url,
            status: 'success',
            progress: 100,
          }
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? uploadedFile : f))
          )
          onFileSelect(uploadedFile)
          toast.success(`${file.name} uploadé avec succès`)
        } else {
          console.error('❌ Upload failed with status:', xhr.status)
          console.error('Response:', xhr.responseText)
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, status: 'error', progress: 0 } : f
            )
          )
          toast.error(`Erreur lors de l'upload de ${file.name}`)
        }
      })

      xhr.addEventListener('error', () => {
        console.error('❌ XHR error during upload')
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: 'error', progress: 0 } : f
          )
        )
        toast.error(`Erreur lors de l'upload de ${file.name}`)
      })

      xhr.open('POST', '/api/admin/upload')
      
      // Add auth token if available
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }
      
      console.log('📤 Sending upload request...')
      xhr.send(formData)
    } catch (error) {
      console.error('❌ Upload error:', error)
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: 'error', progress: 0 } : f
        )
      )
      toast.error('Erreur lors de l\'upload')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFiles = async (files: FileList) => {
    const filesToUpload = multiple ? Array.from(files) : [files[0]]

    for (const file of filesToUpload) {
      const validation = validateFile(file)
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`)
        continue
      }
      await uploadFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-4 sm:p-6 md:p-8 transition-all duration-300',
          isDragging
            ? 'border-accent bg-gradient-to-br from-accent/20 to-accent/10 scale-105 shadow-lg'
            : 'border-accent/30 bg-gradient-to-br from-card to-secondary/20 hover:border-accent/60 hover:shadow-md'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={handleFileInput}
          accept={acceptedTypes.includes('image') && acceptedTypes.includes('video') ? 'image/*,video/*' : acceptedTypes.includes('image') ? 'image/*' : 'video/*'}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent/30 to-accent/10 rounded-full flex items-center justify-center border border-accent/20">
            <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm sm:text-base text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              Glissez-déposez vos fichiers
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              ou{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-accent hover:text-accent/80 underline font-semibold transition-colors"
              >
                cliquez ici
              </button>
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Max {maxSize}MB • {acceptedTypes.join(', ')}
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-semibold">Fichiers uploadés</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {file.type === 'image' ? (
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  ) : (
                    <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Progress/Status */}
                <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                  {file.status === 'uploading' && (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Progress value={file.progress} className="w-12 sm:w-20" />
                      <span className="text-xs font-medium w-6 sm:w-8 text-right">
                        {file.progress}%
                      </span>
                    </div>
                  )}
                  {file.status === 'success' && (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  )}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0 p-1 hover:bg-destructive/10 rounded transition-colors"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
