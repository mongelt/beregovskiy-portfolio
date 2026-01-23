'use client'

import { useState, useEffect, useRef } from 'react'

type ImageSizeMap = Record<string, { width?: number; height?: number }>

type EditorRendererProps = {
  data: any // EditorJS OutputData JSON
  imageSizes?: ImageSizeMap
  onReady?: () => void // Optional callback when editor is ready
}

export default function EditorRenderer({ data, imageSizes, onReady }: EditorRendererProps) {
  const [initStatus, setInitStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [pluginWarnings, setPluginWarnings] = useState<string[]>([])
  const editorRef = useRef<any>(null)
  const holderRef = useRef<HTMLDivElement>(null)
  const isInitializingRef = useRef(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const onReadyRef = useRef(onReady)
  const imageSizesRef = useRef<ImageSizeMap | null>(imageSizes || null)

  const addWarning = (msg: string) => {
    setPluginWarnings((prev) => (prev.includes(msg) ? prev : [...prev, msg]))
  }

  const hideEmptyCaptions = () => {
    const holder = holderRef.current
    if (!holder) return
    const captions = holder.querySelectorAll('.image-tool__caption, .embed-tool__caption')
    captions.forEach((caption) => {
      const el = caption as HTMLElement
      const text = (el.textContent || '')
        .replace(/\u00a0/g, ' ')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
      const placeholder = (el.dataset.placeholder || '').replace(/\u00a0/g, ' ').trim()
      const normalizedText = text.replace(/\s+/g, ' ').trim()
      const normalizedPlaceholder = placeholder.replace(/\s+/g, ' ').trim()
      const html = (el.innerHTML || '')
        .replace(/<br\s*\/?>/gi, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
      const isEmpty = text.length === 0 && html.length === 0
      const isPlaceholder = normalizedPlaceholder.length > 0 && normalizedText === normalizedPlaceholder
      const shouldHide = isEmpty || isPlaceholder
      if (shouldHide) {
        el.style.display = 'none'
        el.setAttribute('data-empty-caption', 'true')
        el.setAttribute('data-has-text', 'false')
      } else if (el.getAttribute('data-empty-caption') === 'true') {
        el.style.removeProperty('display')
        el.removeAttribute('data-empty-caption')
        el.setAttribute('data-has-text', 'true')
      }
    })
  }

  const applyImageSizesFromMap = () => {
    const holder = holderRef.current
    const sizes = imageSizesRef.current
    if (!holder || !sizes) return
    const images = holder.querySelectorAll('img.image-tool__image-picture')
    images.forEach((node) => {
      const img = node as HTMLImageElement
      const src = img.getAttribute('src') || ''
      if (!src) return
      const size = sizes[src]
      if (!size) return
      img.setAttribute('data-has-custom-size', 'true')
      if (size.width) {
        img.setAttribute('width', String(size.width))
        img.style.width = `${size.width}px`
      }
      if (size.height) {
        img.setAttribute('height', String(size.height))
        img.style.height = `${size.height}px`
      }
    })
  }

  // Keep onReady callback ref up to date
  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    imageSizesRef.current = imageSizes || null
  }, [imageSizes])

  // Initialize Editor.js when component mounts
  useEffect(() => {
    let isMounted = true

    // Debounce to reduce flicker on rapid content changes
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    debounceTimerRef.current = setTimeout(() => {
      const holderEl = holderRef.current
      if (!holderEl || !data) {
        return
      }

      // Check if we're in browser environment (SSR prevention)
      if (typeof window === 'undefined') {
        console.error('❌ SSR ISSUE: Trying to initialize Editor.js on server')
        setInitStatus('error')
        return
      }

      // Prevent multiple simultaneous initializations
      if (isInitializingRef.current) {
        console.log('⚠️ EditorRenderer already initializing, skipping...')
        return
      }

      // Clean up any existing editor instance before initializing
      if (editorRef.current && editorRef.current.destroy) {
        console.log('🧹 Cleaning up existing EditorRenderer before re-init...')
        try {
          editorRef.current.destroy()
          editorRef.current = null
        } catch (error) {
          console.error('❌ Error destroying existing EditorRenderer:', error)
        }
      }

      // Clear the holder element to ensure clean slate
      if (holderRef.current) {
        holderRef.current.innerHTML = ''
      }

      console.log('🔧 Initializing EditorRenderer...')
      setInitStatus('loading')
      isInitializingRef.current = true

      // Dynamically import Editor.js and all necessary tools (SSR prevention)
      Promise.all([
      import('@editorjs/editorjs'),
      import('@editorjs/header'),
      import('@editorjs/list'),
      import('@editorjs/paragraph'),
      import('@editorjs/quote'),
      import('@editorjs/code'),
      import('@editorjs/link'),
      import('@editorjs/table'),
      import('@editorjs/marker'),
      import('@editorjs/inline-code'),
      import('@editorjs/underline'),
      import('@editorjs/warning'),
      import('@editorjs/delimiter'),
      import('@editorjs/raw'),
      ]).then(async ([
      EditorJSModule, 
      HeaderModule, 
      ListModule, 
      ParagraphModule, 
      QuoteModule, 
      CodeModule,
      LinkModule,
      TableModule,
      MarkerModule,
      InlineCodeModule,
      UnderlineModule,
      WarningModule,
      DelimiterModule,
      RawModule
    ]) => {
      // Check if component was unmounted during import
      if (!isMounted || !holderEl || !holderEl.isConnected) {
        console.log('⚠️ Component unmounted during import, aborting initialization')
        isInitializingRef.current = false
        return
      }

      const EditorJSClass = EditorJSModule.default
      const Header = HeaderModule.default
      const List = ListModule.default
      const Paragraph = ParagraphModule.default
      const Quote = QuoteModule.default
      const Code = CodeModule.default
      const LinkTool = LinkModule.default
      const Table = TableModule.default
      const Marker = MarkerModule.default
      const InlineCode = InlineCodeModule.default
      const Underline = UnderlineModule.default
      const Warning = WarningModule.default
      const Delimiter = DelimiterModule.default
      const Raw = RawModule.default

      // Step 4.2: Toggle block plugin - REMOVED
      // Plugin was removed due to persistent bugs (setAttribute, querySelector errors)

      // Step 5.2: Button plugin - call-to-action buttons with links for public display
      let AnyButton: any = null
      if (typeof window !== 'undefined') {
        try {
          const ButtonModule = await import('editorjs-button')
          const ButtonModuleAny = ButtonModule as unknown as { default?: any; AnyButton?: any }
          // Plugin exports as default or named export
          AnyButton = ButtonModuleAny.default || ButtonModuleAny.AnyButton || ButtonModuleAny
          // Read-only safety: declare support to prevent renderer errors
          if (AnyButton && !AnyButton.isReadOnlySupported) {
            AnyButton.isReadOnlySupported = true
          }
        } catch (error) {
          console.warn('Button plugin failed to load in EditorRenderer:', error)
          AnyButton = null
        }
      }

      // Step 8.2: Image plugin - single image display for public pages (read-only mode)
      let ImageTool: any = null
      if (typeof window !== 'undefined') {
        try {
          const ImageToolModule = await import('@editorjs/image')
          ImageTool = ImageToolModule.default
          // Note: Image plugin supports read-only mode (isReadOnlySupported: true)
          // No uploader needed in renderer - images are already uploaded and stored
          if (ImageTool && ImageTool.prototype && ImageTool.prototype.render) {
            const originalRender = ImageTool.prototype.render
            ImageTool.prototype.render = function() {
              const wrapper = originalRender.call(this)
              const widthValue = Number(this.data?.width ?? this._data?.width)
              const heightValue = Number(this.data?.height ?? this._data?.height)
              const applySize = (targetEl: HTMLElement) => {
                if (Number.isFinite(widthValue) && widthValue > 0) {
                  targetEl.setAttribute('width', String(widthValue))
                  targetEl.style.setProperty('width', `${widthValue}px`, 'important')
                }
                if (Number.isFinite(heightValue) && heightValue > 0) {
                  targetEl.setAttribute('height', String(heightValue))
                  targetEl.style.setProperty('height', `${heightValue}px`, 'important')
                }
                if ((Number.isFinite(widthValue) && widthValue > 0) || (Number.isFinite(heightValue) && heightValue > 0)) {
                  targetEl.setAttribute('data-has-custom-size', 'true')
                } else {
                  targetEl.removeAttribute('data-has-custom-size')
                }
                targetEl.style.setProperty('max-width', 'none', 'important')
                targetEl.style.setProperty('max-height', 'none', 'important')
                targetEl.style.setProperty('object-fit', 'fill', 'important')
                targetEl.style.setProperty('display', 'block', 'important')
              }

              const imageEl = this.ui?.nodes?.imageEl as HTMLElement | undefined
              const domImageEl = (this.ui?.nodes?.wrapper as HTMLElement | undefined)
                ?.querySelector?.('.image-tool__image-picture') as HTMLElement | undefined
              const targetEl = domImageEl || imageEl
              if (targetEl) {
                applySize(targetEl)
              } else if (wrapper && wrapper.querySelector) {
                const observer = new MutationObserver(() => {
                  const found = wrapper.querySelector('.image-tool__image-picture') as HTMLElement | null
                  if (found) {
                    applySize(found)
                    observer.disconnect()
                  }
                })
                observer.observe(wrapper, { childList: true, subtree: true })
              }
              return wrapper
            }
          }
        } catch (error) {
          console.warn('Image plugin failed to load in EditorRenderer:', error)
          ImageTool = null
        }
      }

      // Step 10.4: Image Gallery plugin - image gallery display for public pages (read-only mode)
      let ImageGallery: any = null
      if (typeof window !== 'undefined') {
        try {
          const ImageGalleryModule = await import('@rodrigoodhin/editorjs-image-gallery')
          const ImageGalleryModuleAny = ImageGalleryModule as unknown as { default?: any; ImageGallery?: any }
          ImageGallery = ImageGalleryModuleAny.default || ImageGalleryModuleAny.ImageGallery || ImageGalleryModuleAny
          
          // Step 10.Bug.3.1: Add isReadOnlySupported property if missing (plugin doesn't declare it)
          // Editor.js requires all tools to have isReadOnlySupported: true when readOnly: true is set
          if (ImageGallery && !ImageGallery.isReadOnlySupported) {
            ImageGallery.isReadOnlySupported = true
          }
          
          // Note: Plugin uses image URLs (doesn't require server-side uploader)
          // Images are already uploaded and stored, URLs are in block data
        } catch (error) {
          console.warn('Image Gallery plugin failed to load in EditorRenderer:', error)
          addWarning('Image Gallery failed to load; galleries may not display')
          ImageGallery = null
        }
      }

      // Step 9.2: Embed plugin - video/audio embed display for public pages (read-only mode)
      let Embed: any = null
      if (typeof window !== 'undefined') {
        try {
          const EmbedModule = await import('@editorjs/embed')
          Embed = EmbedModule.default
          
          // Step 9.2: Initialize embed plugin with prepare() method (same as admin)
          // prepare() must be called to initialize m.patterns for URL matching
          // Note: Plugin supports read-only mode (isReadOnlySupported: true)
          if (Embed && Embed.prepare) {
            try {
              // Prepare embed plugin with config (empty object = all default services enabled)
              Embed.prepare({ config: {} })
            } catch (error) {
              console.warn('Embed plugin prepare() error in EditorRenderer (non-fatal):', error)
            }
          }
          
          // Step 9.2: Apply same patch as admin to prevent setAttribute errors
          // Patch render method to add null check before setAttribute call
          if (Embed && Embed.prototype) {
            const originalRender = Embed.prototype.render
            if (originalRender) {
              Embed.prototype.render = function() {
                try {
                  // Early return if no service (matches original behavior)
                  if (!this.data || !this.data.service) {
                    const a = document.createElement("div")
                    this.element = a
                    return a
                  }
                  
                  // Get service config from plugin's services object
                  const services = (Embed as any).services || {}
                  const serviceConfig = services[this.data.service]
                  if (!serviceConfig || !serviceConfig.html) {
                    console.warn('Embed plugin: Service config not found for', this.data.service)
                    const a = document.createElement("div")
                    this.element = a
                    return a
                  }
                  
                  const { html } = serviceConfig
                  const r = document.createElement("div")
                  const e = document.createElement("div")
                  const o = document.createElement("template")
                  const l = this.createPreloader ? this.createPreloader() : document.createElement("div")
                  
                  // Apply CSS classes and setup (matching original plugin behavior)
                  const CSS = this.CSS || {
                    baseClass: "embed-tool",
                    container: "embed-tool__container",
                    containerLoading: "embed-tool--loading",
                    input: "embed-tool__input",
                    caption: "embed-tool__caption",
                    content: "embed-tool__content"
                  }
                  
                  r.classList.add(CSS.baseClass, CSS.container, CSS.containerLoading)
                  e.classList.add(CSS.input, CSS.caption)
                  r.appendChild(l)
                  e.contentEditable = (!this.readOnly).toString()
                  e.dataset.placeholder = this.api?.i18n?.t?.("Enter a caption") || "Enter a caption"
                  e.innerHTML = this.data.caption || ""
                  
                  // Set template HTML
                  o.innerHTML = html

                  // Responsive wrapper with dynamic aspect ratio (defaults to 16:9)
                  const responsiveWrapper = document.createElement('div')
                  responsiveWrapper.classList.add('embed-responsive')
                  const widthValue = Number(this.data?.width)
                  const heightValue = Number(this.data?.height)
                  const hasCustomSize = Number.isFinite(widthValue) && widthValue > 0 &&
                    Number.isFinite(heightValue) && heightValue > 0
                  const ratio = hasCustomSize
                    ? (heightValue / widthValue) * 100
                    : 56.25
                  if (hasCustomSize) {
                    responsiveWrapper.style.paddingTop = '0'
                    responsiveWrapper.style.width = `${widthValue}px`
                    responsiveWrapper.style.height = `${heightValue}px`
                    responsiveWrapper.style.margin = '0 auto'
                  } else {
                    responsiveWrapper.style.paddingTop = `${ratio}%`
                    responsiveWrapper.style.width = '100%'
                  }
                  
                  // Prepare media element (template child or fallback)
                  let mediaEl: HTMLElement | null = null
                  if (o.content && o.content.firstChild) {
                    mediaEl = o.content.firstChild as HTMLElement
                    mediaEl.setAttribute("src", this.data.embed)
                    mediaEl.classList.add(CSS.content)
                    mediaEl.removeAttribute('width')
                    mediaEl.removeAttribute('height')
                  } else {
                    console.warn('Embed plugin: Template firstChild is null, creating fallback iframe')
                    const fallbackIframe = document.createElement("iframe")
                    fallbackIframe.setAttribute("src", this.data.embed)
                    fallbackIframe.classList.add(CSS.content)
                    fallbackIframe.style.width = "100%"
                    fallbackIframe.style.height = "100%"
                    fallbackIframe.style.border = "none"
                    mediaEl = fallbackIframe
                  }
                  
                  if (mediaEl) {
                    responsiveWrapper.appendChild(mediaEl)
                  }
                  
                  // Handle embed ready state
                  const embedIsReady = this.embedIsReady ? this.embedIsReady(r) : Promise.resolve()
                  
                  // Append elements (with responsive wrapper)
                  r.appendChild(responsiveWrapper)
                  r.appendChild(e)
                  
                  // Remove loading class when ready
                  embedIsReady.then(() => {
                    r.classList.remove(CSS.containerLoading)
                  }).catch(() => {
                    r.classList.remove(CSS.containerLoading)
                  })
                  
                  this.element = r
                  return r
                } catch (error) {
                  console.warn('Embed plugin render error in EditorRenderer (non-fatal):', error)
                  // Return fallback element
                  const fallbackElement = document.createElement('div')
                  fallbackElement.textContent = 'Embed failed to load'
                  this.element = fallbackElement
                  return fallbackElement
                }
              }
            }
          }
        } catch (error) {
          console.warn('Embed plugin failed to load in EditorRenderer:', error)
          Embed = null
        }
      }

      // Step 11.3: Columns plugin - multi-column layout display for public pages (read-only mode)
      let EditorjsColumns: any = null
      if (typeof window !== 'undefined') {
        try {
          const ColumnsModule = await import('@calumk/editorjs-columns')
          const ColumnsModuleAny = ColumnsModule as unknown as { default?: any; EditorjsColumns?: any }
          EditorjsColumns = ColumnsModuleAny.default || ColumnsModuleAny.EditorjsColumns || ColumnsModuleAny
          
          // Note: Plugin supports read-only mode (isReadOnlySupported: true - declared in plugin source)
          // Plugin requires EditorJs library class and separate column_tools configuration
        } catch (error) {
          console.warn('Columns plugin failed to load in EditorRenderer:', error)
          addWarning('Columns failed to load; column blocks may not display')
          EditorjsColumns = null
        }
      }

      // Step 12.3: Attaches plugin - file attachments display (read-only mode)
      let AttachesTool: any = null
      if (typeof window !== 'undefined') {
        try {
          const AttachesModule = await import('@editorjs/attaches')
          AttachesTool = AttachesModule.default || AttachesModule
          if (AttachesTool && !AttachesTool.isReadOnlySupported) {
            AttachesTool.isReadOnlySupported = true
          }
        } catch (error) {
          console.warn('Attaches plugin failed to load in EditorRenderer:', error)
          AttachesTool = null
        }
      }

      // Step 14.3: AudioBlock - custom Editor.js block tool for audio content with wavesurfer.js (read-only mode)
      // Custom block tool for embedding audio with waveform visualization in article content
      let AudioBlock: any = null
      if (typeof window !== 'undefined') {
        try {
          const AudioBlockModule = await import('@/components/editor/blocks/AudioBlock')
          AudioBlock = AudioBlockModule.default
          
          // Note: AudioBlock already declares isReadOnlySupported: true (static get isReadOnlySupported())
          // No additional configuration needed for read-only mode
        } catch (error) {
          console.warn('AudioBlock failed to load in EditorRenderer:', error)
          AudioBlock = null
        }
      }

      // Step 11.3: Define column_tools for nested editors in columns (read-only mode)
      // These tools are used in nested Editor.js instances within columns
      // Important: Don't include columns plugin in column_tools to avoid circular reference
      const columnToolsInlineBase = ['link', 'marker', 'inlineCode', 'underline', 'bold', 'italic']
      const column_tools: any = {
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
          inlineToolbar: columnToolsInlineBase
        },
        list: {
          class: List as any,
          config: {
            defaultStyle: 'unordered'
          }
        }
      }

      try {
        const inlineBase = ['link', 'marker', 'inlineCode', 'underline', 'bold', 'italic']

        const editor = new EditorJSClass({
          holder: holderEl,
          data: data,
          readOnly: true, // Read-only mode for frontend display
          minHeight: 0,
          tools: {
            // Block tools
            header: {
              class: Header as any,
              config: {
                placeholder: 'Enter a header',
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2
              },
              inlineToolbar: inlineBase
            },
            paragraph: {
              class: Paragraph as any,
              inlineToolbar: inlineBase
            },
            list: {
              class: List as any,
              config: {
                defaultStyle: 'unordered'
              }
            },
            quote: {
              class: Quote as any,
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
            },
            warning: {
              class: Warning as any,
              config: {
                titlePlaceholder: 'Title',
                messagePlaceholder: 'Message'
              }
            },
            delimiter: {
              class: Delimiter as any
            },
            table: {
              class: Table as any,
              config: {
                rows: 2,
                cols: 3
              }
            },
            raw: {
              class: Raw as any,
              config: {
                placeholder: 'Enter raw HTML'
              }
            },
            // Step 4.2: Toggle block plugin - REMOVED
            // Step 5.2: Conditionally register button plugin only if loaded successfully
            ...(AnyButton && {
              AnyButton: {
                class: AnyButton as any
              }
            }),
            // Step 8.2: Conditionally register image plugin only if loaded successfully
            // Image plugin supports read-only mode, no uploader config needed
            ...(ImageTool && {
              image: {
                class: ImageTool as any
              }
            }),
            // Step 10.4: Conditionally register image gallery plugin only if loaded successfully
            // Plugin uses image URLs (doesn't require server-side uploader)
            ...(ImageGallery && {
              gallery: {
                class: ImageGallery as any
                // Note: No special configuration needed for read-only rendering
              }
            }),
            // Step 9.2: Conditionally register embed plugin only if loaded successfully
            // Embed plugin supports read-only mode (isReadOnlySupported: true)
            ...(Embed && {
              embed: {
                class: Embed as any
                // Note: No special configuration needed for read-only rendering
              }
            }),
            // Step 11.3: Conditionally register columns plugin only if loaded successfully
            // Plugin provides 2-column and 3-column layouts with nested Editor.js instances
            // Plugin supports read-only mode (isReadOnlySupported: true)
            ...(EditorjsColumns && {
              columns: {
                class: EditorjsColumns as any,
                config: {
                  EditorJsLibrary: EditorJSClass, // Pass Editor.js library class (required)
                  tools: column_tools // Tools available inside columns (required, separate from main tools)
                }
              }
            }),
            // Inline tools
            marker: {
              class: Marker as any
            },
            inlineCode: {
              class: InlineCode as any
            },
            underline: {
              class: Underline as any
            },
            linkTool: {
              class: LinkTool as any,
              config: {
                endpoint: '/api/link-preview',
                headers: {}
              }
            },
            // Step 14.3: Conditionally register AudioBlock only if loaded successfully
            // Custom block tool for embedding audio with wavesurfer.js waveform visualization
            ...(AudioBlock && {
              audio: {
                class: AudioBlock as any,
                inlineToolbar: false // Audio blocks don't need inline formatting
              }
            }),
            ...(AttachesTool && {
              attaches: {
                class: AttachesTool as any,
                inlineToolbar: false
              }
            })
          }
        })

        // Store editor instance
        editorRef.current = editor

        // Wait for editor to be ready
        editor.isReady
          .then(() => {
            if (isMounted) {
              console.log('✅ EditorRenderer ready')
              setInitStatus('ready')
              isInitializingRef.current = false
              
              // Call onReady callback if provided
              if (onReadyRef.current) {
                onReadyRef.current()
              }
            } else {
              // Component unmounted before ready, clean up
              isInitializingRef.current = false
              if (editor && editor.destroy) {
                try {
                  editor.destroy()
                } catch (error) {
                  // Ignore cleanup errors
                }
              }
            }
          })
          .catch((error: Error) => {
            console.error('❌ EditorRenderer initialization failed:', error)
            isInitializingRef.current = false
            if (isMounted) {
              setInitStatus('error')
            }
          })

      } catch (error) {
        console.error('❌ EditorRenderer creation error:', error)
        isInitializingRef.current = false
        if (isMounted) {
          setInitStatus('error')
        }
      }
    }).catch((error) => {
      console.error('❌ EditorRenderer import error:', error)
      isInitializingRef.current = false
      if (isMounted) {
        setInitStatus('error')
      }
      })
    }, 150)

    // Cleanup function (memory leak prevention)
    return () => {
      isMounted = false
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      isInitializingRef.current = false
      
      if (editorRef.current && editorRef.current.destroy) {
        console.log('🧹 Cleaning up EditorRenderer...')
        try {
          editorRef.current.destroy()
          console.log('✅ EditorRenderer destroyed')
        } catch (error) {
          console.error('❌ Error destroying EditorRenderer:', error)
        }
        editorRef.current = null
      }
    }
  }, [data])

  useEffect(() => {
    if (initStatus !== 'ready') return
    if (typeof window === 'undefined') return
    const holder = holderRef.current
    if (!holder) return
    const timer = window.setTimeout(hideEmptyCaptions, 0)
    const raf = window.requestAnimationFrame(hideEmptyCaptions)
    const delayed = window.setTimeout(hideEmptyCaptions, 80)
    const observer = new MutationObserver(() => hideEmptyCaptions())
    observer.observe(holder, { childList: true, subtree: true, characterData: true })
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(delayed)
      window.cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [initStatus, data])

  useEffect(() => {
    if (initStatus !== 'ready') return
    if (typeof window === 'undefined') return
    const holder = holderRef.current
    if (!holder) return
    const apply = () => applyImageSizesFromMap()
    const timer = window.setTimeout(apply, 0)
    const raf = window.requestAnimationFrame(apply)
    const delayed = window.setTimeout(apply, 80)
    const observer = new MutationObserver(() => applyImageSizesFromMap())
    observer.observe(holder, { childList: true, subtree: true })
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(delayed)
      window.cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [initStatus, data, imageSizes])

            return (
    <div className="w-full">
      {/* Minimal styles to align image/embed display with admin expectations */}
      <style>
        {`
          /* Image tool tweaks */
          .ce-block .cdx-image {
            margin: 1rem 0;
          }
          .image-tool__caption {
            margin-top: 0.5rem;
            color: #d1d5db;
            font-size: 0.9rem;
            line-height: 1.4;
          }
          .image-tool__caption:empty,
          .embed-tool__caption:empty,
          .image-tool__caption[data-empty-caption="true"],
          .embed-tool__caption[data-empty-caption="true"],
          .image-tool__caption[data-has-text="false"],
          .embed-tool__caption[data-has-text="false"] {
            display: none;
          }
          .cdx-image.image-tool--withBackground {
            background: #0f172a;
            padding: 1rem;
            border-radius: 0.5rem;
          }
          .cdx-image.image-tool--withBorder img {
            border: 1px solid #1f2937;
            border-radius: 0.5rem;
          }
          /* Keep stretched images full width; non-stretched use plugin defaults */
          .cdx-image.image-tool--stretched img {
            width: 100%;
            height: auto;
          }

          /* Embed responsiveness */
          .embed-responsive {
            position: relative;
            width: 100%;
            padding-top: 56.25%; /* 16:9 default */
          }
          .embed-responsive iframe,
          .embed-responsive video,
          .embed-responsive embed {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 0;
            border-radius: 0.5rem;
          }
          /* Embed caption styling */
          .embed-tool__caption {
            margin-top: 0.5rem;
            color: #d1d5db;
            font-size: 0.9rem;
            line-height: 1.4;
          }
        `}
      </style>
      {pluginWarnings.length > 0 && (
        <div className="mb-2 rounded-md border border-yellow-700 bg-yellow-900/30 px-3 py-2 text-sm text-yellow-200">
          {pluginWarnings.map((msg) => (
            <div key={msg}>{msg}</div>
          ))}
        </div>
      )}
      {/* Loading state */}
      {initStatus === 'loading' && (
        <div className="text-gray-400 text-sm py-2">
          Loading content...
              </div>
      )}
      
      {/* Error state */}
      {initStatus === 'error' && (
        <div className="text-red-400 text-sm py-2">
          Error loading content
              </div>
      )}
      
      {/* Editor holder - EditorJS renders into this div */}
      <div 
        ref={holderRef}
        className="editor-renderer"
        style={{
          opacity: initStatus === 'ready' ? 1 : 0,
          transition: 'opacity 200ms ease-in'
        }}
      />
    </div>
  )
}
