"use client"

import { useState, useEffect } from "react"
import { Play, ChevronRight } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Link from "next/link"
import { getVideoThumbnailUrl } from "@/lib/image-optimizer"

interface Video {
  id: number
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  duration: string
}

export function VideosSection() {
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchVideos()
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleResize = () => {
    if (typeof window === 'undefined') return
    const width = window.innerWidth
    if (width < 640) setScreenSize('mobile')
    else if (width < 1024) setScreenSize('tablet')
    else setScreenSize('desktop')
  }

  const fetchVideos = async () => {
    try {
      const { cachedFetch } = await import('@/lib/request-cache')
      const data: any = await cachedFetch('/api/admin/videos', {}, 30 * 60 * 1000) // 30 min cache
      console.log('Fetched videos:', data)
      setVideos(data.videos || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || loading || videos.length === 0) {
    return null
  }

  return (
    <section className="py-6">
      <div className="flex items-center justify-between px-4 mb-4">
        <h3 className="text-xl font-bold">Nos Vidéos</h3>
        <Link
          href="#"
          className="flex items-center gap-1 text-sm text-accent hover:underline"
        >
          Voir tout
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x snap-mandatory">
        {videos.map((video) => (
          <div
            key={video.id}
            className="group cursor-pointer flex-shrink-0 w-56 rounded-xl overflow-hidden bg-card snap-start"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative aspect-video overflow-hidden bg-muted">
              <img
                src={getVideoThumbnailUrl(video.thumbnail_url, screenSize)}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="bg-accent rounded-full p-3 group-hover:scale-125 transition-transform duration-300 shadow-lg">
                  <Play className="w-6 h-6 text-accent-foreground fill-accent-foreground" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium">
                {video.duration}
              </span>
            </div>
            <div className="p-3">
              <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-accent transition-colors">
                {video.title}
              </h4>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl w-full">
          {selectedVideo && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">{selectedVideo.title}</h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedVideo.video_url}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
