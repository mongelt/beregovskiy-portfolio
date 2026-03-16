import dynamic from 'next/dynamic'

// Dynamic import with SSR disabled for BlockNote renderer
const BlockNoteRenderer = dynamic(
  () => import('./BlockNoteRenderer'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[100px] bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400 mx-auto mb-2"></div>
          <div className="text-gray-400 text-sm">Loading content...</div>
        </div>
      </div>
    )
  }
)

export default BlockNoteRenderer
