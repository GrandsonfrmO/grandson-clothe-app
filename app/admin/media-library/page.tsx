'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdvancedMediaUploader } from '@/components/admin/advanced-media-uploader'
import { Copy, Download, Trash2, Image as ImageIcon, Video, Search, Grid, List } from 'lucide-react'
import { toast } from 'sonner'

interface MediaFile {
  public_id: string
  secure_url: string
  resource_type: 'image' | 'video'
  width?: number
  height?: number
  bytes: number
  created_at: string
  format: string
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all')

  useEffect(() => {
    fetchMediaFiles()
  }, [])

  const fetchMediaFiles = async () => {
    try {
      const response = await fetch('/api/admin/media-library')
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Error fetching media files:', error)
      toast.error('Erreur lors du chargement des fichiers')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (file: any) => {
    fetchMediaFiles()
  }

  const deleteFile = async (publicId: string) => {
    try {
      const response = await fetch('/api/admin/media-library', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      })

      if (!response.ok) throw new Error('Delete failed')

      setFiles((prev) => prev.filter((f) => f.public_id !== publicId))
      toast.success('Fichier supprimé')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copiée')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.public_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || file.resource_type === filterType
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded-lg animate-pulse" />
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Bibliothèque Média
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">Gérez vos images et vidéos Cloudinary</p>
      </div>

      {/* Upload Section */}
      <Card className="border-border bg-gradient-to-br from-card to-secondary/20 hover:shadow-lg transition-shadow">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-lg sm:text-xl" style={{ fontFamily: 'var(--font-display)' }}>
            Uploader des fichiers
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Glissez-déposez ou cliquez pour sélectionner</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <AdvancedMediaUploader
            onFileSelect={handleFileSelect}
            acceptedTypes={['image', 'video']}
            maxSize={100}
            multiple={true}
          />
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm">Tous</TabsTrigger>
              <TabsTrigger value="image" className="text-xs sm:text-sm">Images</TabsTrigger>
              <TabsTrigger value="video" className="text-xs sm:text-sm">Vidéos</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-1 border border-border rounded-lg p-1 w-fit">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <Card className="border-border bg-gradient-to-br from-card to-secondary/20">
          <CardContent className="p-6 sm:p-12 text-center">
            <ImageIcon className="h-8 sm:h-12 w-8 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4 opacity-50" />
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Aucun fichier</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Commencez par uploader vos premiers fichiers</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {filteredFiles.map((file) => (
            <Card key={file.public_id} className="border-border bg-gradient-to-br from-card to-secondary/20 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-square bg-muted overflow-hidden">
                {file.resource_type === 'image' ? (
                  <img
                    src={file.secure_url}
                    alt={file.public_id}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={file.secure_url}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-1 sm:gap-2 opacity-0 hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => copyToClipboard(file.secure_url)}
                    className="rounded-lg h-8 w-8 p-0"
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => deleteFile(file.public_id)}
                    className="rounded-lg h-8 w-8 p-0"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-2 sm:p-3">
                <p className="text-xs sm:text-sm font-medium truncate mb-1">{file.public_id.split('/').pop()}</p>
                <div className="flex items-center justify-between gap-1 sm:gap-2">
                  <Badge variant="outline" className="text-xs">
                    {file.resource_type === 'image' ? '🖼️' : '🎬'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatFileSize(file.bytes)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <Card key={file.public_id} className="border-border bg-gradient-to-br from-card to-secondary/20 hover:shadow-md transition-all duration-300">
              <CardContent className="p-2 sm:p-4 flex items-center gap-2 sm:gap-4">
                <div className="flex-shrink-0">
                  {file.resource_type === 'image' ? (
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  ) : (
                    <Video className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">{file.public_id}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.bytes)} • {file.format.toUpperCase()}
                  </p>
                </div>
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(file.secure_url)}
                    className="rounded-lg h-8 w-8 p-0 hover:bg-accent/20"
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteFile(file.public_id)}
                    className="rounded-lg text-destructive hover:text-destructive h-8 w-8 p-0 hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <Card className="border-border bg-gradient-to-br from-accent/10 to-accent/5 hover:shadow-lg transition-shadow">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            📊 Statistiques
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-card to-secondary/20 border border-border">
              <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-accent mt-1">{files.length}</p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-card to-secondary/20 border border-border">
              <p className="text-xs sm:text-sm text-muted-foreground">Images</p>
              <p className="text-xl sm:text-2xl font-bold text-accent mt-1">{files.filter((f) => f.resource_type === 'image').length}</p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-card to-secondary/20 border border-border">
              <p className="text-xs sm:text-sm text-muted-foreground">Vidéos</p>
              <p className="text-xl sm:text-2xl font-bold text-accent mt-1">{files.filter((f) => f.resource_type === 'video').length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
