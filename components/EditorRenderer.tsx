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
  const lastDataSerializedRef = useRef<string | null>(null)

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

  const applyLazyMedia = () => {
    const holder = holderRef.current
    if (!holder) return
    const images = holder.querySelectorAll('img')
    images.forEach((node) => {
      const img = node as HTMLImageElement
      if (!img.getAttribute('loading')) {
        img.setAttribute('loading', 'lazy')
      }
      if (!img.getAttribute('decoding')) {
        img.setAttribute('decoding', 'async')
      }
    })
    const iframes = holder.querySelectorAll('iframe')
    iframes.forEach((node) => {
      const iframe = node as HTMLIFrameElement
      if (!iframe.getAttribute('loading')) {
        iframe.setAttribute('loading', 'lazy')
      }
    })
  }

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    imageSizesRef.current = imageSizes || null
  }, [imageSizes])

  useEffect(() => {
    let isMounted = true

    // Suppress Editor.js EventDispatcher warnings for "editor mobile layout toggled" event
    // This is a known library quirk in read-only mode - the event is never registered but cleanup still tries to unsubscribe
    const suppressEditorJSWarning = () => {
      if (typeof window === 'undefined' || !console.warn) return null
      
      const originalWarn = console.warn
      const warningFilter = (...args: any[]) => {
        const message = args[0]?.toString() || ''
        // Suppress the specific EventDispatcher warning about mobile layout toggle
        if (message.includes('EventDispatcher') && message.includes('editor mobile layout toggled')) {
          return // Suppress this warning
        }
        // Allow all other warnings through
        originalWarn.apply(console, args)
      }
      
      console.warn = warningFilter
      return originalWarn
    }

    const restoreConsoleWarn = (originalWarn: typeof console.warn | null) => {
      if (originalWarn && typeof window !== 'undefined') {
        console.warn = originalWarn
      }
    }

    // Serialize data to JSON string for comparison (avoids reinitializing on object reference changes)
    // Only compare if we have data and an existing editor instance
    if (editorRef.current && data) {
      const dataSerialized = JSON.stringify(data)
      // Skip reinitialization if data content hasn't actually changed
      if (dataSerialized === lastDataSerializedRef.current) {
        return
      }
      // Update the stored serialized data
      lastDataSerializedRef.current = dataSerialized
    } else if (data) {
      // First initialization or editor doesn't exist yet - store serialized data
      lastDataSerializedRef.current = JSON.stringify(data)
    } else {
      // No data - clear stored value
      lastDataSerializedRef.current = null
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    debounceTimerRef.current = setTimeout(() => {
      // Suppress warnings during Editor.js initialization
      const originalWarn = suppressEditorJSWarning()
      
      try {
        const holderEl = holderRef.current
        if (!holderEl || !data) {
          restoreConsoleWarn(originalWarn)
          return
        }

        if (typeof window === 'undefined') {
          console.error('❌ SSR ISSUE: Trying to initialize Editor.js on server')
          setInitStatus('error')
          restoreConsoleWarn(originalWarn)
          return
        }

        if (isInitializingRef.current) {
          restoreConsoleWarn(originalWarn)
          return
        }

      if (editorRef.current && editorRef.current.destroy) {
        // Suppress warnings during cleanup
        const originalWarnBeforeInit = suppressEditorJSWarning()
        try {
          editorRef.current.destroy()
          editorRef.current = null
        } catch (error) {
          console.error('❌ Error destroying existing EditorRenderer:', error)
        } finally {
          // Restore console.warn after cleanup
          restoreConsoleWarn(originalWarnBeforeInit)
        }
      }

      if (holderRef.current) {
        holderRef.current.innerHTML = ''
      }

      setInitStatus('loading')
      isInitializingRef.current = true

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
      if (!isMounted || !holderEl || !holderEl.isConnected) {
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


      let AnyButton: any = null
      if (typeof window !== 'undefined') {
        try {
          const ButtonModule = await import('editorjs-button')
          const ButtonModuleAny = ButtonModule as unknown as { default?: any; AnyButton?: any }
          AnyButton = ButtonModuleAny.default || ButtonModuleAny.AnyButton || ButtonModuleAny
          if (AnyButton && !AnyButton.isReadOnlySupported) {
            AnyButton.isReadOnlySupported = true
          }
        } catch (error) {
          console.warn('Button plugin failed to load in EditorRenderer:', error)
          AnyButton = null
        }
      }

      let ImageTool: any = null
      if (typeof window !== 'undefined') {
        try {
          const ImageToolModule = await import('@editorjs/image')
          ImageTool = ImageToolModule.default
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

      let ImageGallery: any = null
      if (typeof window !== 'undefined') {
        try {
          const ImageGalleryModule = await import('@rodrigoodhin/editorjs-image-gallery')
          const ImageGalleryModuleAny = ImageGalleryModule as unknown as { default?: any; ImageGallery?: any }
          ImageGallery = ImageGalleryModuleAny.default || ImageGalleryModuleAny.ImageGallery || ImageGalleryModuleAny
          
          if (ImageGallery && !ImageGallery.isReadOnlySupported) {
            ImageGallery.isReadOnlySupported = true
          }
          
        } catch (error) {
          console.warn('Image Gallery plugin failed to load in EditorRenderer:', error)
          addWarning('Image Gallery failed to load; galleries may not display')
          ImageGallery = null
        }
      }

      let Strikethrough: any = null
      if (typeof window !== 'undefined') {
        try {
          const StrikethroughModule = await import('@sotaproject/strikethrough')
          const StrikethroughModuleAny = StrikethroughModule as unknown as { default?: any; Strikethrough?: any }
          Strikethrough = StrikethroughModuleAny.default || StrikethroughModuleAny.Strikethrough || StrikethroughModuleAny

          if (Strikethrough && Strikethrough.prototype) {
            const originalCheckState = Strikethrough.prototype.checkState
            if (originalCheckState) {
              Strikethrough.prototype.checkState = function() {
                try {
                  if (!this.button) {
                    if (this.render) {
                      this.button = this.render()
                    } else {
                      return
                    }
                  }

                  return originalCheckState.call(this)
                } catch (error) {
                  console.warn('Strikethrough plugin checkState error (non-fatal):', error)
                }
              }
            }

            const originalRender = Strikethrough.prototype.render
            if (originalRender) {
              Strikethrough.prototype.render = function() {
                try {
                  const button = originalRender.call(this)

                  if (button) {
                    this.button = button
                    return button
                  }

                  if (!this.button) {
                    this.button = document.createElement("button")
                    this.button.type = "button"
                    if (this.iconClasses && this.iconClasses.base) {
                      this.button.classList.add(this.iconClasses.base)
                    }
                    if (this.toolboxIcon) {
                      this.button.innerHTML = this.toolboxIcon
                    }
                  }

                  return this.button
                } catch (error) {
                  console.warn('Strikethrough plugin render error (non-fatal):', error)
                  if (!this.button) {
                    this.button = document.createElement("button")
                    this.button.type = "button"
                    if (this.iconClasses && this.iconClasses.base) {
                      this.button.classList.add(this.iconClasses.base)
                    }
                    if (this.toolboxIcon) {
                      this.button.innerHTML = this.toolboxIcon
                    }
                  }
                  return this.button
                }
              }
            }
          }
        } catch (error) {
          console.warn('Strikethrough plugin failed to load in EditorRenderer:', error)
          Strikethrough = null
        }
      }

      let Embed: any = null
      if (typeof window !== 'undefined') {
        try {
          const EmbedModule = await import('@editorjs/embed')
          Embed = EmbedModule.default
          
          if (Embed && Embed.prepare) {
            try {
              Embed.prepare({ config: {} })
            } catch (error) {
              console.warn('Embed plugin prepare() error in EditorRenderer (non-fatal):', error)
            }
          }
          
          if (Embed && Embed.prototype) {
            const originalRender = Embed.prototype.render
            if (originalRender) {
              Embed.prototype.render = function() {
                try {
                  if (!this.data || !this.data.service) {
                    const a = document.createElement("div")
                    this.element = a
                    return a
                  }
                  
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
                  
                  o.innerHTML = html

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
                  
                  const embedIsReady = this.embedIsReady ? this.embedIsReady(r) : Promise.resolve()
                  
                  r.appendChild(responsiveWrapper)
                  r.appendChild(e)
                  
                  embedIsReady.then(() => {
                    r.classList.remove(CSS.containerLoading)
                  }).catch(() => {
                    r.classList.remove(CSS.containerLoading)
                  })
                  
                  this.element = r
                  return r
                } catch (error) {
                  console.warn('Embed plugin render error in EditorRenderer (non-fatal):', error)
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

      let EditorjsColumns: any = null
      if (typeof window !== 'undefined') {
        try {
          const ColumnsModule = await import('@calumk/editorjs-columns')
          const ColumnsModuleAny = ColumnsModule as unknown as { default?: any; EditorjsColumns?: any }
          EditorjsColumns = ColumnsModuleAny.default || ColumnsModuleAny.EditorjsColumns || ColumnsModuleAny

          if (EditorjsColumns && EditorjsColumns.prototype) {
            const originalRender = EditorjsColumns.prototype.render
            if (originalRender) {
              EditorjsColumns.prototype.render = function() {
                try {
                  if (!this.colWrapper) {
                    this.colWrapper = document.createElement("div")
                    this.colWrapper.classList.add("ce-editorjsColumns_wrapper")
                  }

                  const result = originalRender.call(this)

                  if (!result && this.colWrapper) {
                    return this.colWrapper
                  }

                  return result
                } catch (error) {
                  console.warn('Columns plugin render error (non-fatal):', error)
                  if (!this.colWrapper) {
                    this.colWrapper = document.createElement("div")
                    this.colWrapper.classList.add("ce-editorjsColumns_wrapper")
                  }
                  return this.colWrapper
                }
              }
            }

            const originalRerender = EditorjsColumns.prototype._rerender
            if (originalRerender) {
              EditorjsColumns.prototype._rerender = async function() {
                try {
                  if (!this.colWrapper) {
                    console.warn('Columns plugin: colWrapper is null in _rerender, creating new one')
                    this.colWrapper = document.createElement("div")
                    this.colWrapper.classList.add("ce-editorjsColumns_wrapper")
                  }

                  return await originalRerender.call(this)
                } catch (error) {
                  console.warn('Columns plugin _rerender error (non-fatal):', error)
                  if (error instanceof TypeError && error.message.includes('setAttribute')) {
                    if (!this.colWrapper) {
                      this.colWrapper = document.createElement("div")
                      this.colWrapper.classList.add("ce-editorjsColumns_wrapper")
                    }
                  }
                  throw error
                }
              }
            }
          }
          
        } catch (error) {
          console.warn('Columns plugin failed to load in EditorRenderer:', error)
          addWarning('Columns failed to load; column blocks may not display')
          EditorjsColumns = null
        }
      }

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

      let AudioBlock: any = null
      if (typeof window !== 'undefined') {
        try {
          const AudioBlockModule = await import('@/components/editor/blocks/AudioBlock')
          AudioBlock = AudioBlockModule.default
          
        } catch (error) {
          console.warn('AudioBlock failed to load in EditorRenderer:', error)
          AudioBlock = null
        }
      }

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
          inlineToolbar: true
        },
        list: {
          class: List as any,
          inlineToolbar: true,
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
            },
            warning: {
              class: Warning as any,
              inlineToolbar: true,
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
              inlineToolbar: true,
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
            ...(AnyButton && {
              AnyButton: {
                class: AnyButton as any
              }
            }),
            ...(ImageTool && {
              image: {
                class: ImageTool as any
              }
            }),
            ...(ImageGallery && {
              gallery: {
                class: ImageGallery as any
              }
            }),
            ...(Embed && {
              embed: {
                class: Embed as any,
                inlineToolbar: true
              }
            }),
            ...(EditorjsColumns && {
              columns: {
                class: EditorjsColumns as any,
                config: {
                  EditorJsLibrary: EditorJSClass, // Pass Editor.js library class (required)
                  tools: column_tools // Tools available inside columns (required, separate from main tools)
                }
              }
            }),
            marker: {
              class: Marker as any
            },
            inlineCode: {
              class: InlineCode as any
            },
            underline: {
              class: Underline as any
            },
            ...(Strikethrough && {
              strikethrough: {
                class: Strikethrough as any
              }
            }),
            linkTool: {
              class: LinkTool as any,
              config: {
                endpoint: '/api/link-preview',
                headers: {}
              }
            },
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

        editorRef.current = editor

        editor.isReady
          .then(() => {
            // Restore console.warn after initialization
            restoreConsoleWarn(originalWarn)
            
            if (isMounted) {
              setInitStatus('ready')
              isInitializingRef.current = false
              
              if (onReadyRef.current) {
                onReadyRef.current()
              }
            } else {
              isInitializingRef.current = false
              if (editor && editor.destroy) {
                try {
                  editor.destroy()
                } catch (error) {
                }
              }
            }
          })
          .catch((error: Error) => {
            // Restore console.warn on error
            restoreConsoleWarn(originalWarn)
            
            console.error('❌ EditorRenderer initialization failed:', error)
            isInitializingRef.current = false
            if (isMounted) {
              setInitStatus('error')
            }
          })
      } catch (error) {
        // Restore console.warn on editor creation error
        restoreConsoleWarn(originalWarn)
        
        console.error('❌ EditorRenderer creation error:', error)
        isInitializingRef.current = false
        if (isMounted) {
          setInitStatus('error')
        }
      }
      })
      .catch((error) => {
        // Restore console.warn on Promise.all error
        restoreConsoleWarn(originalWarn)
        
        console.error('❌ EditorRenderer import error:', error)
        isInitializingRef.current = false
        if (isMounted) {
          setInitStatus('error')
        }
      })
    } catch (error) {
      // Restore console.warn on catch (try block error)
      restoreConsoleWarn(originalWarn)
      
      console.error('❌ EditorRenderer creation error:', error)
      isInitializingRef.current = false
      if (isMounted) {
        setInitStatus('error')
      }
    }
    }, 150)

    return () => {
      isMounted = false
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      isInitializingRef.current = false
      
      if (editorRef.current && editorRef.current.destroy) {
        // Suppress warnings during cleanup
        const originalWarn = suppressEditorJSWarning()
        try {
          editorRef.current.destroy()
        } catch (error) {
          console.error('❌ Error destroying EditorRenderer:', error)
        } finally {
          // Restore console.warn after cleanup
          restoreConsoleWarn(originalWarn)
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

  useEffect(() => {
    if (initStatus !== 'ready') return
    if (typeof window === 'undefined') return
    const holder = holderRef.current
    if (!holder) return
    const apply = () => applyLazyMedia()
    const timer = window.setTimeout(apply, 0)
    const raf = window.requestAnimationFrame(apply)
    const delayed = window.setTimeout(apply, 80)
    const observer = new MutationObserver(() => applyLazyMedia())
    observer.observe(holder, { childList: true, subtree: true })
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(delayed)
      window.cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [initStatus, data])

            return (
    <div className="w-full">
      <style>
        {`
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
          .ce-block {
            content-visibility: auto;
            contain-intrinsic-size: 1px 300px;
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
          .cdx-image.image-tool--stretched img {
            width: 100%;
            height: auto;
          }

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
      {initStatus === 'loading' && (
        <div className="text-gray-400 text-sm py-2">
          Loading content...
              </div>
      )}
      
      {initStatus === 'error' && (
        <div className="text-red-400 text-sm py-2">
          Error loading content
              </div>
      )}
      
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
