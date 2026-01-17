'use client'

import { useState, useEffect, useRef } from 'react'

// Test content with various EditorJS block types
const TEST_CONTENT = {
  time: 1635603431943,
  blocks: [
    {
      id: "test-header",
      type: "header",
      data: {
        text: "Editor.js Integration Test",
        level: 2
      }
    },
    {
      id: "test-paragraph-1",
      type: "paragraph",
      data: {
        text: "This is a test paragraph to verify Editor.js renders correctly in read-only mode."
      }
    },
    {
      id: "test-list",
      type: "list",
      data: {
        style: "unordered",
        items: [
          "First list item",
          "Second list item",
          "Third list item"
        ]
      }
    },
    {
      id: "test-paragraph-2",
      type: "paragraph",
      data: {
        text: "Another paragraph with <b>bold text</b> and <i>italic text</i> to test HTML rendering."
      }
    },
    {
      id: "test-header-2",
      type: "header",
      data: {
        text: "Section Header",
        level: 3
      }
    },
    {
      id: "test-paragraph-3",
      type: "paragraph",
      data: {
        text: "This tests multiple content types to ensure Editor.js handles various block types correctly."
      }
    }
  ],
  version: "2.22.2"
}

export default function EditorJsTest() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [initStatus, setInitStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const editorRef = useRef<any>(null)
  const holderRef = useRef<HTMLDivElement>(null)
  const [destroyCallCount, setDestroyCallCount] = useState(0)

  // Initialize Editor.js when expanded
  useEffect(() => {
    if (!isExpanded || !holderRef.current) {
      return
    }

    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.error('❌ SSR ISSUE: Trying to initialize Editor.js on server')
      setInitStatus('error')
      return
    }

    console.log('🔧 Initializing Editor.js...')
    setInitStatus('loading')

    let isMounted = true

    // Dynamically import Editor.js and all necessary tools
    Promise.all([
      import('@editorjs/editorjs'),
      import('@editorjs/header'),
      import('@editorjs/list'),
      import('@editorjs/paragraph'),
      import('@editorjs/quote'),
      import('@editorjs/code'),
    ]).then(([EditorJSModule, HeaderModule, ListModule, ParagraphModule, QuoteModule, CodeModule]) => {
      const EditorJSClass = EditorJSModule.default
      const Header = HeaderModule.default
      const List = ListModule.default
      const Paragraph = ParagraphModule.default
      const Quote = QuoteModule.default
      const Code = CodeModule.default

      if (!isMounted) return

      try {
        const editor = new EditorJSClass({
          holder: holderRef.current!,
          data: TEST_CONTENT,
          readOnly: true, // Read-only mode for frontend display
          minHeight: 0,
          tools: {
            header: {
              class: Header as any,
              config: {
                placeholder: 'Enter a header',
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2
              }
            },
            paragraph: {
              class: Paragraph as any,
              inlineToolbar: true
            },
            list: {
              class: List as any,
              inlineToolbar: true,
              config: {
                defaultStyle: 'unordered'
              }
            },
            quote: {
              class: Quote as any,
              inlineToolbar: true,
              config: {
                quotePlaceholder: 'Enter a quote',
                captionPlaceholder: 'Quote\'s author'
              }
            },
            code: {
              class: Code as any,
              config: {
                placeholder: 'Enter code'
              }
            }
          },
          onReady: () => {
            if (isMounted) {
              console.log('✅ Editor.js ready')
              setInitStatus('ready')
            }
          },
        })

        editorRef.current = editor

        // Wait for isReady promise
        editor.isReady
          .then(() => {
            console.log('✅ editor.isReady promise resolved')
          })
          .catch((error: Error) => {
            console.error('❌ editor.isReady promise rejected:', error)
            if (isMounted) setInitStatus('error')
          })
      } catch (error) {
        console.error('❌ Editor.js initialization error:', error)
        if (isMounted) setInitStatus('error')
      }
    }).catch((error) => {
      console.error('❌ Failed to import Editor.js:', error)
      if (isMounted) setInitStatus('error')
    })

    // Cleanup function - CRITICAL for memory leak prevention
    return () => {
      isMounted = false
      if (editorRef.current && editorRef.current.destroy) {
        console.log('🧹 Cleaning up Editor.js instance...')
        editorRef.current.destroy()
        editorRef.current = null
        setDestroyCallCount(prev => prev + 1)
        console.log('✅ Editor.js instance destroyed')
      }
    }
  }, [isExpanded])

  // Toggle expand/collapse
  const handleToggle = () => {
    console.log(`${isExpanded ? '⬆️ Collapsing' : '⬇️ Expanding'} editor...`)
    setIsExpanded(!isExpanded)
    if (isExpanded) {
      setInitStatus('idle')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Test Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Editor.js Integration Test</h1>
          <p className="text-gray-400 mb-2">
            This page tests Editor.js for SSR compatibility, memory leaks, initialization, and cleanup.
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>• Dynamic import with ssr: false ✓</p>
            <p>• Read-only mode configuration ✓</p>
            <p>• Cleanup with editor.destroy() ✓</p>
            <p>• isReady promise handling ✓</p>
          </div>
        </div>

        {/* Status Display */}
        <div className="mb-4 p-4 bg-gray-900 border border-gray-800 rounded">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Status:</span>
              <span className={`font-mono ${
                initStatus === 'ready' ? 'text-green-400' :
                initStatus === 'loading' ? 'text-yellow-400' :
                initStatus === 'error' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {initStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Expanded:</span>
              <span className="font-mono text-emerald-400">{isExpanded ? 'YES' : 'NO'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Destroy calls:</span>
              <span className="font-mono text-emerald-400">{destroyCallCount}</span>
            </div>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={handleToggle}
          className="mb-6 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded transition-colors"
        >
          {isExpanded ? 'Collapse ▲' : 'Expand ▼'} Editor
        </button>

        {/* Editor Container */}
        {isExpanded && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            {initStatus === 'loading' && (
              <p className="text-yellow-400">Loading Editor.js...</p>
            )}
            {initStatus === 'error' && (
              <p className="text-red-400">❌ Editor.js initialization failed. Check console for details.</p>
            )}
            <div 
              ref={holderRef} 
              id="editorjs-test-holder"
              className="prose prose-invert max-w-none"
            />
          </div>
        )}

        {/* Testing Instructions */}
        <div className="mt-8 p-6 bg-gray-900 border border-emerald-800 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-emerald-400">Testing Instructions</h2>
          <ol className="space-y-3 text-sm text-gray-300">
            <li>
              <strong className="text-white">SSR Test:</strong> Run <code className="bg-gray-800 px-2 py-1 rounded">npm run build</code> - should complete without "window is not defined" errors
            </li>
            <li>
              <strong className="text-white">Initialization Test:</strong> Click "Expand" - status should go Loading → Ready, content should render
            </li>
            <li>
              <strong className="text-white">Memory Leak Test:</strong> 
              <ul className="ml-4 mt-2 space-y-1">
                <li>• Open Chrome DevTools → Memory tab</li>
                <li>• Take heap snapshot (baseline)</li>
                <li>• Expand/collapse 10 times</li>
                <li>• Click "Collect garbage" icon</li>
                <li>• Take new heap snapshot</li>
                <li>• Compare: heap should return near baseline</li>
              </ul>
            </li>
            <li>
              <strong className="text-white">Cleanup Test:</strong> Watch console - should see "Editor.js instance destroyed" on each collapse, destroy count should increment
            </li>
          </ol>
        </div>

        {/* Console Log Reference */}
        <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded text-xs text-gray-500">
          <p className="font-mono">Check browser console for detailed logs:</p>
          <ul className="ml-4 mt-2 space-y-1">
            <li>✅ = Success</li>
            <li>❌ = Error</li>
            <li>🔧 = Initialization</li>
            <li>🧹 = Cleanup</li>
            <li>⬇️/⬆️ = Expand/Collapse</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

