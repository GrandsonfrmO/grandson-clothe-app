import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface PerformanceMetrics {
  bundleSize: number
  largestChunks: Array<{ name: string; size: number }>
  timestamp: string
}

async function analyzePerformance() {
  console.log('🔍 Analyzing performance...\n')

  try {
    // Build the project
    console.log('📦 Building project...')
    execSync('npm run build', { stdio: 'inherit' })

    // Analyze bundle size
    console.log('\n📊 Analyzing bundle size...')
    const buildDir = path.join(process.cwd(), '.next')
    const staticDir = path.join(buildDir, 'static')

    if (!fs.existsSync(staticDir)) {
      console.error('Build directory not found')
      process.exit(1)
    }

    const chunks = analyzeChunks(staticDir)
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)

    console.log('\n📈 Bundle Analysis:')
    console.log(`Total size: ${formatBytes(totalSize)}`)
    console.log('\nLargest chunks:')
    chunks.slice(0, 10).forEach(chunk => {
      console.log(`  ${chunk.name}: ${formatBytes(chunk.size)}`)
    })

    // Performance recommendations
    console.log('\n💡 Recommendations:')
    if (totalSize > 500000) {
      console.log('  ⚠️  Bundle size is large (>500KB). Consider:')
      console.log('     - Code splitting')
      console.log('     - Removing unused dependencies')
      console.log('     - Lazy loading components')
    }

    const largeChunks = chunks.filter(c => c.size > 100000)
    if (largeChunks.length > 0) {
      console.log('  ⚠️  Large chunks detected:')
      largeChunks.forEach(chunk => {
        console.log(`     - ${chunk.name} (${formatBytes(chunk.size)})`)
      })
    }

    // Save metrics
    const metrics: PerformanceMetrics = {
      bundleSize: totalSize,
      largestChunks: chunks.slice(0, 10),
      timestamp: new Date().toISOString(),
    }

    const metricsFile = path.join(process.cwd(), 'performance-metrics.json')
    fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2))
    console.log(`\n✅ Metrics saved to ${metricsFile}`)
  } catch (error) {
    console.error('Error analyzing performance:', error)
    process.exit(1)
  }
}

function analyzeChunks(dir: string): Array<{ name: string; size: number }> {
  const chunks: Array<{ name: string; size: number }> = []

  const walkDir = (currentPath: string) => {
    const files = fs.readdirSync(currentPath)

    files.forEach(file => {
      const filePath = path.join(currentPath, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        walkDir(filePath)
      } else if (file.endsWith('.js')) {
        chunks.push({
          name: file,
          size: stat.size,
        })
      }
    })
  }

  walkDir(dir)
  return chunks.sort((a, b) => b.size - a.size)
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

analyzePerformance()
