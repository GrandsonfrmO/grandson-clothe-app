'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  maxFileSize?: number // in MB
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
  maxFileSize = 5
}: ImageUploaderProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images autorisées`)
      return
    }

    setLoading(true)
    setError('')

    try {
      const newImages: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file size
        if (file.size > maxFileSize * 1024 * 1024) {
          setError(`Fichier trop volumineux: ${file.name} (max ${maxFileSize}MB)`)
          continue
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError(`Format invalide: ${file.name}`)
          continue
        }

        // Convert to base64 or upload to server
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string)
            setUploadProgress(prev => ({
              ...prev,
              [i]: 100
            }))
          }
        }
        reader.readAsDataURL(file)
      }

      // Wait for all files to be read
      await new Promise(resolve => setTimeout(resolve, 500))
      onImagesChange([...images, ...newImages])
      setUploadProgress({})
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError('Erreur lors du téléchargement des images')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUrlAdd = () => {
    const url = urlInputRef.current?.value.trim()
    if (!url) {
      setError('Veuillez entrer une URL')
      return
    }

    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images autorisées`)
      return
    }

    // Basic URL validation
    try {
      new URL(url)
      onImagesChange([...images, url])
      if (urlInputRef.current) {
        urlInputRef.current.value = ''
      }
      setError('')
    } catch {
      setError('URL invalide')
    }
  }

  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (fileInputRef.current) {
      fileInputRef.current.files = files
      handleFileSelect({ currentTarget: fileInputRef.current } as any)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Upload */}
        <Card
          className="border-2 border-dashed border-border hover:border-accent transition-colors cursor-pointer p-6"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={loading || images.length >= maxImages}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || images.length >= maxImages}
            className="w-full text-center"
          >
            <div className="flex flex-col items-center gap-2">
              {loading ? (
                <Loader2 className="h-8 w-8 text-accent animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-sm">Glissez-déposez ou cliquez</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF jusqu'à {maxFileSize}MB
                </p>
              </div>
            </div>
          </button>
        </Card>

        {/* URL Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              ref={urlInputRef}
              type="url"
              placeholder="https://example.com/image.jpg"
              disabled={loading || images.length >= maxImages}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUrlAdd()
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleUrlAdd}
              disabled={loading || images.length >= maxImages}
              className="px-3"
            >
              Ajouter
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Ou collez l'URL d'une image
          </p>
        </div>
      </div>

      {/* Images Preview */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">
              Images ({images.length}/{maxImages})
            </h3>
            {images.length === maxImages && (
              <Badge variant="secondary" className="text-xs">
                Maximum atteint
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-secondary rounded-lg overflow-hidden border border-border">
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg'
                    }}
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge className="text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Principale
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>

                {/* Reorder Buttons */}
                <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="flex-1 h-6 text-xs"
                    onClick={() => {
                      if (index > 0) {
                        const newImages = [...images]
                        ;[newImages[index], newImages[index - 1]] = [
                          newImages[index - 1],
                          newImages[index]
                        ]
                        onImagesChange(newImages)
                      }
                    }}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="flex-1 h-6 text-xs"
                    onClick={() => {
                      if (index < images.length - 1) {
                        const newImages = [...images]
                        ;[newImages[index], newImages[index + 1]] = [
                          newImages[index + 1],
                          newImages[index]
                        ]
                        onImagesChange(newImages)
                      }
                    }}
                    disabled={index === images.length - 1}
                  >
                    ↓
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">
            Aucune image ajoutée. Commencez par en ajouter une.
          </p>
        </Card>
      )}
    </div>
  )
}