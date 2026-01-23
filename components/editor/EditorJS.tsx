'use client'

import { useEffect, useRef, useState } from 'react'
import { OutputData } from '@editorjs/editorjs'

interface EditorJSProps {
  data?: OutputData
  onChange?: (data: OutputData) => void
  onReady?: (editor: any) => void
  holder: string
}

export default function EditorJSComponent({ data, onChange, onReady, holder }: EditorJSProps) {
  const editorRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [pluginWarnings, setPluginWarnings] = useState<string[]>([])

  const addWarning = (msg: string) => {
    setPluginWarnings((prev) => (prev.includes(msg) ? prev : [...prev, msg]))
  }

  useEffect(() => {
    let editor: any = null

    const initEditor = async () => {
      // Prevent multiple initializations
      if (isInitializing || isEditorReady) return
      
      setIsInitializing(true)

      try {
        // Wait for the container ref to be available
        const checkElement = () => {
          return containerRef.current
        }

        // Wait for the element to appear
        let attempts = 0
        const maxAttempts = 50
        while (!checkElement() && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }

        const element = checkElement()
        if (!element) {
          console.error(`Container ref not found after waiting`)
          throw new Error(`Container ref not found after waiting`)
        }

        // Dynamic import to avoid SSR issues
        const EditorJS = (await import('@editorjs/editorjs')).default
        const Header = (await import('@editorjs/header')).default
        const List = (await import('@editorjs/list')).default
        const Paragraph = (await import('@editorjs/paragraph')).default
        const Quote = (await import('@editorjs/quote')).default
        const Code = (await import('@editorjs/code')).default
        const Link = (await import('@editorjs/link')).default
        const Table = (await import('@editorjs/table')).default
        const Marker = (await import('@editorjs/marker')).default
        const InlineCode = (await import('@editorjs/inline-code')).default
        const Underline = (await import('@editorjs/underline')).default
        const Warning = (await import('@editorjs/warning')).default
        const Delimiter = (await import('@editorjs/delimiter')).default
        const Raw = (await import('@editorjs/raw')).default
        // Step 9.1: Embed plugin - video/audio embed functionality (YouTube, Vimeo, Twitter, etc.)
        const EmbedModule = await import('@editorjs/embed')
        const Embed = EmbedModule.default
        
        // Step 9.Bug.1.1: Initialize embed plugin with prepare() method to enable paste detection
        // prepare() must be called to initialize m.patterns for URL matching
        // Call before Editor.js initialization so pasteConfig is ready when Editor.js collects it
        if (Embed && Embed.prepare) {
          try {
            // Prepare embed plugin with config (empty object = all default services enabled)
            // This initializes m.services and m.patterns for paste detection
            Embed.prepare({ config: {} })
            console.log('Embed plugin initialized: paste detection enabled')
          } catch (error) {
            console.warn('Embed plugin prepare() error (non-fatal):', error)
            // Continue even if prepare fails - plugin might still work
          }
        }
        
        // Step 9.Bug.1.2: Patch embed plugin to fix 'setAttribute' error - ensure firstChild exists before setting attributes
        // The error occurs when plugin tries to set attributes on null firstChild element in template
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
                // Access the services through the module's internal state
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
                
                // Step 9.Bug.1.2: Add null check before setAttribute (FIXES THE ERROR)
                if (o.content && o.content.firstChild) {
                  const firstChildEl = o.content.firstChild as HTMLElement
                  firstChildEl.setAttribute("src", this.data.embed)
                  firstChildEl.classList.add(CSS.content)
                } else {
                  console.warn('Embed plugin: Template firstChild is null, creating fallback iframe')
                  // Create a fallback iframe if template content is invalid
                  const fallbackIframe = document.createElement("iframe")
                  fallbackIframe.setAttribute("src", this.data.embed)
                  fallbackIframe.classList.add(CSS.content)
                  fallbackIframe.style.width = "100%"
                  fallbackIframe.style.height = "320px"
                  fallbackIframe.style.border = "none"
                  o.content.appendChild(fallbackIframe)
                }
                
                const getSizeValue = (rawValue: unknown) => {
                  const value = Number(rawValue)
                  return Number.isFinite(value) && value > 0 ? value : null
                }

                let mediaEl: HTMLElement | null = null
                if (o.content && o.content.firstChild) {
                  mediaEl = o.content.firstChild as HTMLElement
                } else if (r.querySelector(`.${CSS.content}`)) {
                  mediaEl = r.querySelector(`.${CSS.content}`) as HTMLElement
                }

                const applySize = () => {
                  if (!mediaEl) return
                  const widthValue = getSizeValue(this.data?.width)
                  const heightValue = getSizeValue(this.data?.height)
                  if (widthValue) {
                    mediaEl.setAttribute('width', String(widthValue))
                    mediaEl.style.width = `${widthValue}px`
                  } else {
                    mediaEl.removeAttribute('width')
                    mediaEl.style.removeProperty('width')
                  }
                  if (heightValue) {
                    mediaEl.setAttribute('height', String(heightValue))
                    mediaEl.style.height = `${heightValue}px`
                  } else {
                    mediaEl.removeAttribute('height')
                    mediaEl.style.removeProperty('height')
                  }
                }

                // Handle embed ready state
                const embedIsReady = this.embedIsReady ? this.embedIsReady(r) : Promise.resolve()
                
                // Append elements (with null check)
                if (o.content && o.content.firstChild) {
                  r.appendChild(o.content.firstChild)
                }
                if (!this.readOnly) {
                  const controls = document.createElement('div')
                  controls.style.display = 'flex'
                  controls.style.gap = '8px'
                  controls.style.marginTop = '8px'
                  controls.style.marginBottom = '6px'
                  
                  const widthInput = document.createElement('input')
                  widthInput.type = 'text'
                  widthInput.inputMode = 'numeric'
                  widthInput.pattern = '[0-9]*'
                  widthInput.placeholder = 'Width (px)'
                  widthInput.value = this.data?.width ? String(this.data.width) : ''
                  widthInput.style.flex = '1'
                  widthInput.style.background = '#0f172a'
                  widthInput.style.border = '1px solid #1f2937'
                  widthInput.style.color = '#e5e7eb'
                  widthInput.style.borderRadius = '6px'
                  widthInput.style.padding = '6px 8px'
                  
                  const heightInput = document.createElement('input')
                  heightInput.type = 'text'
                  heightInput.inputMode = 'numeric'
                  heightInput.pattern = '[0-9]*'
                  heightInput.placeholder = 'Height (px)'
                  heightInput.value = this.data?.height ? String(this.data.height) : ''
                  heightInput.style.flex = '1'
                  heightInput.style.background = '#0f172a'
                  heightInput.style.border = '1px solid #1f2937'
                  heightInput.style.color = '#e5e7eb'
                  heightInput.style.borderRadius = '6px'
                  heightInput.style.padding = '6px 8px'

                  widthInput.addEventListener('input', () => {
                    const widthValue = getSizeValue(widthInput.value)
                    if (widthValue) {
                      this.data.width = widthValue
                    } else {
                      this.data.width = undefined
                    }
                    applySize()
                  })

                  heightInput.addEventListener('input', () => {
                    const heightValue = getSizeValue(heightInput.value)
                    if (heightValue) {
                      this.data.height = heightValue
                    } else {
                      this.data.height = undefined
                    }
                    applySize()
                  })

                  controls.appendChild(widthInput)
                  controls.appendChild(heightInput)
                  r.appendChild(controls)
                }
                r.appendChild(e)
                
                // Remove loading class when ready
                embedIsReady.then(() => {
                  r.classList.remove(CSS.containerLoading)
                }).catch(() => {
                  r.classList.remove(CSS.containerLoading)
                })
                
                applySize()
                this.element = r
                return r
              } catch (error) {
                console.warn('Embed plugin render error (non-fatal):', error)
                // Return fallback element
                const fallbackElement = document.createElement('div')
                fallbackElement.textContent = 'Embed failed to load'
                this.element = fallbackElement
                return fallbackElement
              }
            }
          }
        }

        // Step 12.3: Attaches plugin - file attachments (PDFs, docs, etc.)
        // Plugin: @editorjs/attaches (https://github.com/editor-js/attaches)
        let AttachesTool: any = null
        if (typeof window !== 'undefined') {
          try {
            const AttachesModule = await import('@editorjs/attaches')
            AttachesTool = AttachesModule.default || AttachesModule
          } catch (error) {
            console.warn('Attaches plugin failed to load:', error)
            AttachesTool = null
          }
        }
        
        // Step 8.1: Image plugin - single image uploads with Cloudinary integration
        const ImageToolModule = await import('@editorjs/image')
        let ImageTool = ImageToolModule.default
        
        // Step 8.Bug.1.1: Patch image plugin to fix 'setAttribute' error - ensure image element exists and add null checks
        // The error occurs when plugin tries to set attributes on null image element during upload
        // Patch onUpload method to ensure UI and nodes exist before calling fillImage
        if (ImageTool && ImageTool.prototype) {
          const originalOnUpload = ImageTool.prototype.onUpload
          if (originalOnUpload) {
            ImageTool.prototype.onUpload = function(response: any) {
              try {
                // Ensure response is valid
                if (!response || !response.success || !response.file) {
                  return originalOnUpload.call(this, response)
                }
                
                // Ensure UI instance exists
                if (!this.ui) {
                  console.warn('Image plugin: UI instance is null, cannot process upload')
                  return originalOnUpload.call(this, response)
                }
                
                // Patch fillImage method if it exists (patch per instance)
                if (this.ui.fillImage && !this.ui._fillImagePatched) {
                  const originalFillImage = this.ui.fillImage.bind(this.ui)
                  
                  this.ui.fillImage = function(url: string) {
                    try {
                      // Ensure nodes and imageContainer exist
                      if (!this.nodes) {
                        console.warn('Image plugin: nodes is null, cannot create image element')
                        return
                      }
                      
                      if (!this.nodes.imageContainer) {
                        console.warn('Image plugin: imageContainer is null, cannot create image element')
                        return
                      }
                      
                      // Remove existing image element if it exists (to prevent duplicates)
                      if (this.nodes.imageEl) {
                        try {
                          if (this.nodes.imageEl.parentNode === this.nodes.imageContainer) {
                            this.nodes.imageContainer.removeChild(this.nodes.imageEl)
                          }
                        } catch (removeError) {
                          // Element might already be removed, ignore
                        }
                        this.nodes.imageEl = undefined
                      }
                      
                      // Call original fillImage which creates the element
                      return originalFillImage.call(this, url)
                    } catch (error) {
                      console.warn('Image plugin fillImage error (non-fatal):', error)
                      // Try to recreate element if it failed
                      try {
                        if (this.nodes && this.nodes.imageContainer) {
                          return originalFillImage.call(this, url)
                        }
                      } catch (retryError) {
                        console.warn('Image plugin fillImage retry error (non-fatal):', retryError)
                      }
                    }
                  }
                  
                  // Mark as patched to avoid re-patching
                  this.ui._fillImagePatched = true
                }
                
                // Call original onUpload
                return originalOnUpload.call(this, response)
              } catch (error) {
                console.warn('Image plugin onUpload error (non-fatal):', error)
                // Try to call original method even if patching failed
                try {
                  return originalOnUpload.call(this, response)
                } catch (fallbackError) {
                  console.warn('Image plugin onUpload fallback error (non-fatal):', fallbackError)
                }
              }
            }
          }
        }

        // Step 8.Size.1: Add per-image width/height inputs in admin editor
        if (ImageTool && ImageTool.prototype) {
          const originalRender = ImageTool.prototype.render
          const originalSave = ImageTool.prototype.save
          const originalDataDescriptor = Object.getOwnPropertyDescriptor(ImageTool.prototype, 'data')
          if (originalRender) {
            ImageTool.prototype.render = function() {
              const wrapper = originalRender.call(this)
              if (this.readOnly) {
                return wrapper
              }

              const getSizeValue = (rawValue: unknown) => {
                const value = Number(rawValue)
                return Number.isFinite(value) && value > 0 ? value : null
              }

              const applySize = () => {
                const imageEl = this.ui?.nodes?.imageEl as HTMLElement | undefined
                const domImageEl = (this.ui?.nodes?.wrapper as HTMLElement | undefined)
                  ?.querySelector?.('.image-tool__image-picture') as HTMLElement | undefined
                const targetEl = domImageEl || imageEl
                if (!targetEl) return
                const widthValue = getSizeValue(this._data?.width)
                const heightValue = getSizeValue(this._data?.height)
                const wrapperEl = this.ui?.nodes?.wrapper as HTMLElement | undefined
                if (widthValue) {
                  targetEl.setAttribute('width', String(widthValue))
                  targetEl.style.setProperty('width', `${widthValue}px`, 'important')
                  if (wrapperEl) {
                    wrapperEl.dataset.imageWidth = String(widthValue)
                  }
                } else {
                  targetEl.removeAttribute('width')
                  targetEl.style.removeProperty('width')
                  if (wrapperEl) {
                    delete wrapperEl.dataset.imageWidth
                  }
                }
                if (heightValue) {
                  targetEl.setAttribute('height', String(heightValue))
                  targetEl.style.setProperty('height', `${heightValue}px`, 'important')
                  if (wrapperEl) {
                    wrapperEl.dataset.imageHeight = String(heightValue)
                  }
                } else {
                  targetEl.removeAttribute('height')
                  targetEl.style.removeProperty('height')
                  if (wrapperEl) {
                    delete wrapperEl.dataset.imageHeight
                  }
                }
                targetEl.style.setProperty('max-width', 'none', 'important')
                targetEl.style.setProperty('max-height', 'none', 'important')
                targetEl.style.setProperty('object-fit', 'fill', 'important')
                targetEl.style.setProperty('display', 'block', 'important')
              }

              const existingControls = wrapper?.querySelector?.('[data-image-size-controls="true"]')
              if (!existingControls && wrapper) {
                const controls = document.createElement('div')
                controls.setAttribute('data-image-size-controls', 'true')
                controls.style.display = 'flex'
                controls.style.gap = '8px'
                controls.style.marginTop = '8px'
                controls.style.marginBottom = '6px'

                const widthInput = document.createElement('input')
                widthInput.type = 'text'
                widthInput.inputMode = 'numeric'
                widthInput.pattern = '[0-9]*'
                widthInput.placeholder = 'Width (px)'
                widthInput.value = this._data?.width ? String(this._data.width) : ''
                widthInput.style.flex = '1'
                widthInput.style.background = '#0f172a'
                widthInput.style.border = '1px solid #1f2937'
                widthInput.style.color = '#e5e7eb'
                widthInput.style.borderRadius = '6px'
                widthInput.style.padding = '6px 8px'

                const heightInput = document.createElement('input')
                heightInput.type = 'text'
                heightInput.inputMode = 'numeric'
                heightInput.pattern = '[0-9]*'
                heightInput.placeholder = 'Height (px)'
                heightInput.value = this._data?.height ? String(this._data.height) : ''
                heightInput.style.flex = '1'
                heightInput.style.background = '#0f172a'
                heightInput.style.border = '1px solid #1f2937'
                heightInput.style.color = '#e5e7eb'
                heightInput.style.borderRadius = '6px'
                heightInput.style.padding = '6px 8px'

                widthInput.addEventListener('input', () => {
                  const widthValue = getSizeValue(widthInput.value)
                  if (widthValue) {
                    this._data.width = widthValue
                    this.data.width = widthValue
                  } else {
                    this._data.width = undefined
                    this.data.width = undefined
                  }
                  applySize()
                  if (this.block && typeof this.block.dispatchChange === 'function') {
                    this.block.dispatchChange()
                  }
                })

                heightInput.addEventListener('input', () => {
                  const heightValue = getSizeValue(heightInput.value)
                  if (heightValue) {
                    this._data.height = heightValue
                    this.data.height = heightValue
                  } else {
                    this._data.height = undefined
                    this.data.height = undefined
                  }
                  applySize()
                  if (this.block && typeof this.block.dispatchChange === 'function') {
                    this.block.dispatchChange()
                  }
                })

                controls.appendChild(widthInput)
                controls.appendChild(heightInput)
                wrapper.appendChild(controls)
              }

              applySize()
              return wrapper
            }
          }

          if (originalSave) {
            ImageTool.prototype.save = function() {
              const data = originalSave.call(this) || {}
              if (this._data?.width) {
                data.width = this._data.width
              }
              if (this._data?.height) {
                data.height = this._data.height
              }
              const wrapperEl = this.ui?.nodes?.wrapper as HTMLElement | undefined
              if (wrapperEl?.dataset?.imageWidth) {
                data.width = Number(wrapperEl.dataset.imageWidth)
              }
              if (wrapperEl?.dataset?.imageHeight) {
                data.height = Number(wrapperEl.dataset.imageHeight)
              }
              return data
            }
          }

          if (originalDataDescriptor && originalDataDescriptor.set) {
            Object.defineProperty(ImageTool.prototype, 'data', {
              ...originalDataDescriptor,
              set: function(value: any) {
                originalDataDescriptor.set?.call(this, value)
                if (value?.width) {
                  this._data.width = value.width
                }
                if (value?.height) {
                  this._data.height = value.height
                }
                const wrapper = this.ui?.nodes?.wrapper as HTMLElement | undefined
                const targetEl = wrapper?.querySelector?.('.image-tool__image-picture') as HTMLElement | undefined
                if (targetEl) {
                  if (this._data?.width) {
                    targetEl.setAttribute('width', String(this._data.width))
                    targetEl.style.setProperty('width', `${this._data.width}px`, 'important')
                  }
                  if (this._data?.height) {
                    targetEl.setAttribute('height', String(this._data.height))
                    targetEl.style.setProperty('height', `${this._data.height}px`, 'important')
                  }
                  targetEl.style.setProperty('max-width', 'none', 'important')
                  targetEl.style.setProperty('max-height', 'none', 'important')
                  targetEl.style.setProperty('object-fit', 'fill', 'important')
                  targetEl.style.setProperty('display', 'block', 'important')
                }
              }
            })
          }
        }
        // Step 11.1: Columns plugin - multi-column layout functionality
        // Plugin provides 2-column and 3-column layouts with nested Editor.js instances
        // Source: https://github.com/calumk/editorjs-columns
        // Plugin requires EditorJs library class and separate column_tools configuration
        let EditorjsColumns: any = null
        if (typeof window !== 'undefined') {
          try {
            const ColumnsModule = await import('@calumk/editorjs-columns')
            const ColumnsModuleAny = ColumnsModule as unknown as { default?: any; EditorjsColumns?: any }
            EditorjsColumns = ColumnsModuleAny.default || ColumnsModuleAny.EditorjsColumns || ColumnsModuleAny
            
            // Step 11.Bug.1.1: Patch columns plugin to fix 'setAttribute' error
            // The error occurs when plugin tries to set attributes on null DOM elements
            // This can happen during render or rerender when elements don't exist yet
            if (EditorjsColumns && EditorjsColumns.prototype) {
              // Patch render method to ensure colWrapper exists before operations
              const originalRender = EditorjsColumns.prototype.render
              if (originalRender) {
                EditorjsColumns.prototype.render = function() {
                  try {
                    // Ensure colWrapper exists before proceeding
                    if (!this.colWrapper) {
                      this.colWrapper = document.createElement("div")
                      this.colWrapper.classList.add("ce-editorjsColumns_wrapper")
                    }
                    
                    // Call original render method
                    const result = originalRender.call(this)
                    
                    // Ensure result is valid
                    if (!result && this.colWrapper) {
                      return this.colWrapper
                    }
                    
                    return result
                  } catch (error) {
                    console.warn('Columns plugin render error (non-fatal):', error)
                    // Return fallback element if render fails
                    if (!this.colWrapper) {
                      this.colWrapper = document.createElement("div")
                      this.colWrapper.classList.add("ce-editorjsColumns_wrapper")
                    }
                    return this.colWrapper
                  }
                }
              }
              
              // Patch _rerender method to ensure colWrapper exists before operations
              const originalRerender = EditorjsColumns.prototype._rerender
              if (originalRerender) {
                EditorjsColumns.prototype._rerender = async function() {
                  try {
                    // Ensure colWrapper exists before proceeding
                    if (!this.colWrapper) {
                      console.warn('Columns plugin: colWrapper is null in _rerender, creating new one')
                      this.colWrapper = document.createElement("div")
                      this.colWrapper.classList.add("ce-editorjsColumns_wrapper")
                    }
                    
                    // Call original _rerender method
                    return await originalRerender.call(this)
                  } catch (error) {
                    console.warn('Columns plugin _rerender error (non-fatal):', error)
                    // If error is about setAttribute on null, try to recover
                    if (error instanceof TypeError && error.message.includes('setAttribute')) {
                      // Ensure colWrapper exists
                      if (!this.colWrapper) {
                        this.colWrapper = document.createElement("div")
                        this.colWrapper.classList.add("ce-editorjsColumns_wrapper")
                      }
                    }
                    throw error // Re-throw to maintain original behavior
                  }
                }
              }
            }
            
            // Note: Plugin requires EditorJS library class to be passed in config
            // Plugin requires separate column_tools configuration for nested editors
          } catch (error) {
            console.warn('Columns plugin failed to load:', error)
            addWarning('Columns failed to load; column blocks may not work')
            EditorjsColumns = null
          }
        }

        // Step 10.4: Image Gallery plugin - image gallery block with multiple images and layouts
        // Plugin provides gallery functionality with customizable layouts (default, horizontal, square, etc.)
        // Source: https://gitlab.com/rodrigoodhin/editorjs-image-gallery
        let ImageGallery: any = null
        if (typeof window !== 'undefined') {
          try {
            const ImageGalleryModule = await import('@rodrigoodhin/editorjs-image-gallery')
            const ImageGalleryModuleAny = ImageGalleryModule as unknown as { default?: any; ImageGallery?: any }
            ImageGallery = ImageGalleryModuleAny.default || ImageGalleryModuleAny.ImageGallery || ImageGalleryModuleAny
            
            // Step 10.Bug.4.1: Patch _acceptTuneView to handle missing textarea for existing galleries
            // When editing an existing gallery, textarea doesn't exist, causing classList error
            // This patch creates textarea dynamically when needed
            if (ImageGallery && ImageGallery.prototype) {
              const originalAcceptTuneView = ImageGallery.prototype._acceptTuneView
              if (originalAcceptTuneView) {
                ImageGallery.prototype._acceptTuneView = function() {
                  try {
                    // Get textarea element
                    let n = document.querySelector("textarea.image-gallery-"+this.blockIndex) as HTMLTextAreaElement | null
                    
                    // If textarea doesn't exist and editImages is being enabled, create it
                    if (!n && this.data.editImages) {
                      // Create textarea similar to render() method
                      n = document.createElement("textarea")
                      n.className = "image-gallery-"+this.blockIndex
                      n.placeholder = "Paste your photos URL ..."
                      
                      // Add event listeners (matching plugin's render() method)
                      let e
                      ["paste","change","keyup"].forEach((a) => {
                        n?.addEventListener(a, (r) => {
                          const event = r as ClipboardEvent
                          e = "paste" === a
                            ? (event.clipboardData?.getData("text") || "").split("\n")
                            : (n?.value || "").split("\n")
                          if (this._imageGallery) {
                            this._imageGallery(e)
                          }
                        }, false)
                      })
                      
                      // Set initial value from current URLs
                      if (this.data && this.data.urls && n) {
                        if (Array.isArray(this.data.urls)) {
                          n.value = this.data.urls.join("\n")
                        } else if (typeof this.data.urls === 'string') {
                          n.value = this.data.urls
                        }
                      }
                      
                      // Insert textarea into wrapper (before gallery container if it exists)
                      if (this.wrapper) {
                        // Find gallery container or insert at beginning
                        const galleryContainer = this.wrapper.querySelector("#image-gallery-"+this.blockIndex)
                        if (galleryContainer) {
                          if (n) {
                            this.wrapper.insertBefore(n, galleryContainer)
                          }
                        } else {
                          // If no container, append to wrapper
                          if (n) {
                            this.wrapper.appendChild(n)
                          }
                        }
                      }
                    }
                    
                    // Call original method (it will handle classList operations)
                    return originalAcceptTuneView.call(this)
                  } catch (error) {
                    console.warn('Image Gallery _acceptTuneView error (non-fatal):', error)
                    // Try to call original method even if textarea creation fails
                    try {
                      return originalAcceptTuneView.call(this)
                    } catch (fallbackError) {
                      console.warn('Image Gallery _acceptTuneView fallback error:', fallbackError)
                      // Return undefined to prevent further errors
                      return
                    }
                  }
                }
              }
            }
            
            // Note: Plugin uses image URLs (doesn't require server-side uploader)
            // For Cloudinary integration, would need to pass Cloudinary URLs
          } catch (error) {
            console.warn('Image Gallery plugin failed to load:', error)
            addWarning('Image Gallery failed to load; gallery blocks may not work')
            ImageGallery = null
          }
        }

        // Step 14.2: AudioBlock - custom Editor.js block tool for audio content with wavesurfer.js
        // Custom block tool for embedding audio with waveform visualization in article content
        let AudioBlock: any = null
        if (typeof window !== 'undefined') {
          try {
            const AudioBlockModule = await import('@/components/editor/blocks/AudioBlock')
            AudioBlock = AudioBlockModule.default
          } catch (error) {
            console.warn('AudioBlock failed to load:', error)
            AudioBlock = null
          }
        }

        // Step 12.1: Strikethrough plugin - strikethrough text formatting inline tool
        // Plugin: @sotaproject/strikethrough (https://github.com/sotaproject/strikethrough)
        // Plugin provides strikethrough text formatting inline tool
        let Strikethrough: any = null
        if (typeof window !== 'undefined') {
          try {
            const StrikethroughModule = await import('@sotaproject/strikethrough')
            const StrikethroughModuleAny = StrikethroughModule as unknown as { default?: any; Strikethrough?: any }
            Strikethrough = StrikethroughModuleAny.default || StrikethroughModuleAny.Strikethrough || StrikethroughModuleAny
            
            // Step 12.Bug.1.1: Patch strikethrough plugin to fix 'setAttribute' error
            // The error occurs when plugin tries to access button element before it's created
            // Similar to Button plugin (Step 5.Bug.1.1) - checkState() may be called before render()
            if (Strikethrough && Strikethrough.prototype) {
              // Patch checkState method to ensure button exists before accessing it
              const originalCheckState = Strikethrough.prototype.checkState
              if (originalCheckState) {
                Strikethrough.prototype.checkState = function() {
                  try {
                    // Ensure button exists before accessing it
                    if (!this.button) {
                      // Button not created yet, try to create it
                      if (this.render) {
                        this.button = this.render()
                      } else {
                        // Can't create button, return early
                        return
                      }
                    }
                    
                    // Call original checkState method
                    return originalCheckState.call(this)
                  } catch (error) {
                    console.warn('Strikethrough plugin checkState error (non-fatal):', error)
                    // Don't break editor if checkState fails
                  }
                }
              }
              
              // Patch render method to ensure button is properly created
              const originalRender = Strikethrough.prototype.render
              if (originalRender) {
                Strikethrough.prototype.render = function() {
                  try {
                    // Call original render method
                    const button = originalRender.call(this)
                    
                    // Ensure button is valid and store it
                    if (button) {
                      this.button = button
                      return button
                    }
                    
                    // If render returned null, create fallback button
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
                    // Create fallback button if render fails
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
            console.warn('Strikethrough plugin failed to load:', error)
            Strikethrough = null
          }
        }

        // Step 4.1: Toggle block plugin - REMOVED
        // Plugin was removed due to persistent bugs (setAttribute, querySelector errors)
        // All patches and integration code removed

        // Step 5.1: Button plugin - call-to-action buttons with links
        // Plugin: editorjs-button (https://github.com/kaaaaaaaaaaai/editorjs-button)
        // Step 5.Bug.1.1: Patch plugin to fix click error - ensure anyButton exists and add null check
        let AnyButton: any = null
        if (typeof window !== 'undefined') {
          try {
            const ButtonModule = await import('editorjs-button')
            const ButtonModuleAny = ButtonModule as unknown as { default?: any; AnyButton?: any }
            // Plugin exports as default or named export
            AnyButton = ButtonModuleAny.default || ButtonModuleAny.AnyButton || ButtonModuleAny
            
            // Step 5.Bug.1.1 Solution 1 & 2: Patch show method to fix "Cannot read properties of null (reading 'setAttribute')" error
            // Fixes error when clicking button by ensuring anyButton exists and adding null check
            if (AnyButton && AnyButton.prototype) {
              const originalShow = AnyButton.prototype.show
              if (originalShow) {
                AnyButton.prototype.show = function(state: any) {
                  try {
                    // Solution 2: Ensure anyButton exists - recreate if null
                    if (!this.nodes.anyButton) {
                      // Try to find existing button in DOM first
                      if (this.nodes.container) {
                        const existingButton = this.nodes.container.querySelector('.anyButton__btn') as HTMLAnchorElement
                        if (existingButton) {
                          // Found existing button, update reference
                          this.nodes.anyButton = existingButton
                          // Also update anyButtonHolder reference if needed
                          if (!this.nodes.anyButtonHolder) {
                            this.nodes.anyButtonHolder = existingButton.closest('.anyButtonContainer__anyButtonHolder') as HTMLElement
                          }
                        } else {
                          // Button doesn't exist, recreate using plugin's method
                          if (this.nodes.anyButtonHolder) {
                            // Holder exists but button is missing, recreate button
                            this.nodes.anyButton = this.make('a', [this.CSS.btn, this.CSS.btnColor], {
                              target: '_blank',
                              rel: 'nofollow noindex noreferrer'
                            })
                            this.nodes.anyButtonHolder.appendChild(this.nodes.anyButton)
                          } else if (this.makeAnyButtonHolder) {
                            // Recreate entire holder using plugin's method
                            this.nodes.anyButtonHolder = this.makeAnyButtonHolder()
                            if (this.nodes.container && this.nodes.anyButtonHolder) {
                              this.nodes.container.appendChild(this.nodes.anyButtonHolder)
                            }
                          }
                        }
                      }
                    }
                    
                    // Solution 1: Add null check before setAttribute (safety net)
                    if (this.nodes.anyButton) {
                      // Update button text and href
                      this.nodes.anyButton.textContent = this._data.text
                      this.nodes.anyButton.setAttribute("href", this._data.link)
                    } else {
                      // Log warning if anyButton still doesn't exist after recreation attempt
                      console.warn('Button plugin: anyButton is null after recreation attempt, skipping setAttribute')
                    }
                    
                    // Call changeState regardless (it handles visibility, not button attributes)
                    this.changeState(state)
                  } catch (error) {
                    // Log error but don't break functionality
                    console.warn('Button plugin show method error (non-fatal):', error)
                    // Try to call changeState even if button update failed
                    try {
                      this.changeState(state)
                    } catch (stateError) {
                      console.warn('Button plugin changeState error (non-fatal):', stateError)
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.warn('Button plugin failed to load:', error)
            AnyButton = null
          }
        }

        // Step 6.1: Drag & Drop plugin - enable block reordering
        // Plugin: editorjs-drag-drop (https://github.com/kommitters/editorjs-drag-drop)
        // Plugin is initialized in onReady callback, not as a tool
        let DragDrop: any = null
        if (typeof window !== 'undefined') {
          try {
            const DragDropModule = await import('editorjs-drag-drop')
            const DragDropModuleAny = DragDropModule as unknown as { default?: any; DragDrop?: any }
            // Plugin exports as default
            DragDrop = DragDropModuleAny.default || DragDropModuleAny.DragDrop || DragDropModuleAny
          } catch (error) {
            console.warn('Drag-drop plugin failed to load:', error)
            DragDrop = null
          }
        }

        // Step 7.1: Undo/Redo plugin - enable undo/redo functionality
        // Plugin: editorjs-undo (https://github.com/kommitters/editorjs-undo)
        // Plugin is initialized in onReady callback, not as a tool
        let Undo: any = null
        if (typeof window !== 'undefined') {
          try {
            const UndoModule = await import('editorjs-undo')
            const UndoModuleAny = UndoModule as unknown as { default?: any; Undo?: any }
            // Plugin exports as default
            Undo = UndoModuleAny.default || UndoModuleAny.Undo || UndoModuleAny
          } catch (error) {
            console.warn('Undo plugin failed to load:', error)
            Undo = null
          }
        }

        // Step 8.1: Custom uploader methods for image plugin using Cloudinary
        // Reuses existing Cloudinary upload pattern from app/admin/content/new/page.tsx
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

        const cloudinaryUploader = {
          /**
           * Upload file to Cloudinary and return image data
           * @param {File} file - file selected from device, drag-drop, or clipboard
           * @return {Promise.<{success, file: {url}}>}
           */
          async uploadByFile(file: File): Promise<{ success: number; file: { url: string } }> {
            try {
              if (!cloudName || !uploadPreset) {
                throw new Error('Cloudinary config missing: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET')
              }

              const formData = new FormData()
              formData.append('file', file)
              formData.append('upload_preset', uploadPreset)
              
              const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                { method: 'POST', body: formData }
              )
              
              if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`)
              }
              
              const data = await response.json()
              
              return {
                success: 1,
                file: {
                  url: data.secure_url
                }
              }
            } catch (error) {
              console.error('Image upload error:', error)
              return {
                success: 0,
                file: {
                  url: ''
                }
              }
            }
          },

          /**
           * Download image from URL and upload to Cloudinary
           * @param {string} url - pasted image URL
           * @return {Promise.<{success, file: {url}}>}
           */
          async uploadByUrl(url: string): Promise<{ success: number; file: { url: string } }> {
            try {
              if (!cloudName || !uploadPreset) {
                throw new Error('Cloudinary config missing: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET')
              }

              // Fetch image from URL
              const response = await fetch(url)
              if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`)
              }
              
              const blob = await response.blob()
              const file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' })
              
              // Use uploadByFile to upload to Cloudinary
              return await this.uploadByFile(file)
            } catch (error) {
              console.error('Image URL upload error:', error)
              return {
                success: 0,
                file: {
                  url: ''
                }
              }
            }
          }
        }

        const cloudinaryRawUploader = {
          /**
           * Upload file to Cloudinary (raw) and return file data
           * @param {File} file - file selected from device
           * @return {Promise.<{success, file: {url, size, name, extension}}>}
           */
          async uploadByFile(file: File): Promise<{ success: number; file: { url: string; size?: number; name?: string; extension?: string } }> {
            try {
              if (!cloudName || !uploadPreset) {
                throw new Error('Cloudinary config missing: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET')
              }

              const formData = new FormData()
              formData.append('file', file)
              formData.append('upload_preset', uploadPreset)

              const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
                { method: 'POST', body: formData }
              )

              if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`)
              }

              const data = await response.json()

              return {
                success: 1,
                file: {
                  url: data.secure_url,
                  size: data.bytes,
                  name: data.original_filename,
                  extension: data.format
                }
              }
            } catch (error) {
              console.error('Attaches upload error:', error)
              return {
                success: 0,
                file: {
                  url: ''
                }
              }
            }
          }
        }

        // Step 11.1: Define column_tools - tools available inside columns (subset of main tools)
        // These tools are used in nested Editor.js instances within columns
        // Important: Don't include columns plugin in column_tools to avoid circular reference
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

        const injectImageSizes = (outputData: OutputData) => {
          if (!outputData?.blocks || !editor?.blocks?.getBlockByIndex) {
            return outputData
          }

          const parseSize = (raw?: string | null) => {
            if (!raw) return undefined
            const value = Number(String(raw).replace('px', ''))
            return Number.isFinite(value) && value > 0 ? value : undefined
          }

          const updatedBlocks = outputData.blocks.map((block, index) => {
            if (block.type !== 'image') {
              return block
            }

            const blockApi = editor.blocks.getBlockByIndex(index) as { holder?: HTMLElement } | null
            const holderEl = blockApi?.holder
            const wrapperEl = holderEl?.querySelector('.image-tool') as HTMLElement | null
            const imageEl = holderEl?.querySelector('.image-tool__image-picture') as HTMLImageElement | null

            const widthValue =
              parseSize(wrapperEl?.dataset?.imageWidth) ??
              parseSize(imageEl?.getAttribute('width')) ??
              parseSize(imageEl?.style?.width)
            const heightValue =
              parseSize(wrapperEl?.dataset?.imageHeight) ??
              parseSize(imageEl?.getAttribute('height')) ??
              parseSize(imageEl?.style?.height)

            if (!widthValue && !heightValue) {
              return block
            }

            return {
              ...block,
              data: {
                ...(block.data || {}),
                ...(widthValue ? { width: widthValue } : {}),
                ...(heightValue ? { height: heightValue } : {})
              }
            }
          })

          return {
            ...outputData,
            blocks: updatedBlocks
          }
        }

        editor = new EditorJS({
          holder: element,
          data: data || {
            blocks: [
              {
                type: 'paragraph',
                data: {
                  text: ''
                }
              }
            ]
          },
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
              shortcut: 'CMD+SHIFT+O',
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
            linkTool: {
              class: Link as any,
              config: {
                endpoint: '/api/link-preview'
              }
            },
            table: {
              class: Table as any,
              inlineToolbar: true,
              config: {
                rows: 2,
                cols: 3
              }
            },
            marker: {
              class: Marker as any,
              shortcut: 'CMD+SHIFT+M'
            },
            inlineCode: {
              class: InlineCode as any,
              shortcut: 'CMD+SHIFT+C'
            },
            underline: {
              class: Underline as any,
              shortcut: 'CMD+U'
            },
            warning: {
              class: Warning as any,
              inlineToolbar: true,
              shortcut: 'CMD+SHIFT+W',
              config: {
                titlePlaceholder: 'Title',
                messagePlaceholder: 'Message'
              }
            },
            delimiter: Delimiter as any,
            raw: {
              class: Raw as any,
              config: {
                placeholder: 'Enter HTML code'
              }
            },
            // Step 11.1: Conditionally register columns plugin only if loaded successfully
            // Plugin provides 2-column and 3-column layouts with nested Editor.js instances
            ...(EditorjsColumns && {
              columns: {
                class: EditorjsColumns as any,
                config: {
                  EditorJsLibrary: EditorJS, // Pass Editor.js library class (required)
                  tools: column_tools // Tools available inside columns (required, separate from main tools)
                }
              }
            }),
            // Step 10.4: Conditionally register image gallery plugin only if loaded successfully
            // Plugin provides image gallery block with customizable layouts
            ...(ImageGallery && {
              gallery: {
                class: ImageGallery as any
                // Note: Plugin uses image URLs (doesn't require server-side uploader)
                // For Cloudinary integration, would need to pass Cloudinary URLs
              }
            }),
            // Step 12.1: Conditionally register strikethrough plugin only if loaded successfully
            // Plugin provides strikethrough text formatting inline tool
            ...(Strikethrough && {
              strikethrough: {
                class: Strikethrough as any
              }
            }),
            // Step 4.1: Toggle block plugin - REMOVED
            // Step 5.1: Conditionally register button plugin only if loaded successfully
            ...(AnyButton && {
              AnyButton: {
                class: AnyButton as any,
                inlineToolbar: false,
                config: {
                  css: {
                    btnColor: 'btn--gray'
                  }
                }
              }
            }),
            // Step 8.1: Image plugin - single image uploads with Cloudinary integration
            image: {
              class: ImageTool as any,
              config: {
                // Use custom uploader methods instead of endpoints
                uploader: cloudinaryUploader,
                // Enable all features
                features: {
                  border: true,
                  caption: true,
                  stretch: true,
                  background: true
                },
                captionPlaceholder: 'Enter image caption'
              }
            },
            ...(AttachesTool && {
              attaches: {
                class: AttachesTool as any,
                config: {
                  uploader: cloudinaryRawUploader,
                  buttonText: 'Select file',
                  errorMessage: 'File upload failed'
                }
              }
            }),
            // Step 9.1: Embed plugin - video/audio embed functionality
            // Supports: YouTube, Vimeo, Twitter/X, Instagram, Facebook, Twitch, CodePen, etc.
            // No special configuration needed - plugin handles URL detection automatically
            embed: {
              class: Embed as any,
              inlineToolbar: true // Allow inline formatting in captions
            },
            // Step 14.2: Conditionally register AudioBlock only if loaded successfully
            // Custom block tool for embedding audio with wavesurfer.js waveform visualization
            ...(AudioBlock && {
              audio: {
                class: AudioBlock as any,
                inlineToolbar: false // Audio blocks don't need inline formatting
              }
            })
          },
          onChange: (api: any) => {
            if (onChange) {
              api.saver.save().then((outputData: OutputData) => {
                const enrichedData = injectImageSizes(outputData)
                onChange(enrichedData)
              })
            }
          },
          // Step 6.1 & 7.1: Initialize drag-drop and undo plugins in onReady callback
          onReady: () => {
            // Initialize undo plugin first (if available)
            // Step 16.Bug.1.1: Patch undo plugin initialization to prevent setAttribute errors
            if (Undo && editor) {
              try {
                // Step 16.Bug.1.1: Patch Undo plugin constructor/initialization to add null checks
                // The plugin might try to set attributes on DOM elements (buttons, containers) during initialization
                // Wrap initialization in try-catch and add defensive checks
                
                // Store original Undo constructor if it exists
                const OriginalUndo = Undo
                
                // Patch Undo constructor to add null checks before any setAttribute calls
                if (OriginalUndo && OriginalUndo.prototype) {
                  // Patch any methods that might use setAttribute
                  // Common methods: render, initialize, createButtons, etc.
                  const originalInitialize = OriginalUndo.prototype.initialize
                  if (originalInitialize) {
                    OriginalUndo.prototype.initialize = function(data: any) {
                      try {
                        // Ensure editor instance exists
                        if (!this.editor) {
                          console.warn('Undo plugin: editor instance is null, skipping initialization')
                          return
                        }
                        
                        // Call original initialize with null checks
                        return originalInitialize.call(this, data)
                      } catch (error) {
                        console.warn('Undo plugin initialize error (non-fatal):', error)
                        // Don't break editor if undo initialization fails
                      }
                    }
                  }
                  
                  // Patch render method if it exists (for UI elements)
                  const originalRender = OriginalUndo.prototype.render
                  if (originalRender) {
                    OriginalUndo.prototype.render = function() {
                      try {
                        const element = originalRender.call(this)
                        // Ensure element exists before any setAttribute operations
                        if (!element) {
                          console.warn('Undo plugin: render() returned null')
                          return document.createElement('div')
                        }
                        return element
                      } catch (error) {
                        console.warn('Undo plugin render error (non-fatal):', error)
                        return document.createElement('div')
                      }
                    }
                  }
                }
                
                // Initialize undo plugin with editor instance
                // Default shortcuts: Ctrl+Z (undo), Ctrl+Y (redo)
                const undoInstance = new Undo({ editor })
                
                // Initialize undo with current editor data if available
                // This ensures undo history starts from the current state
                if (data && data.blocks && data.blocks.length > 0) {
                  undoInstance.initialize(data)
                }
              } catch (error) {
                console.warn('Undo plugin initialization error (non-fatal):', error)
                // Don't break editor if undo fails to initialize
              }
            }
            
            // Initialize drag-drop plugin (if available)
            if (DragDrop && editor) {
              try {
                // Initialize drag-drop with custom border style for dark theme
                // Default is "1px dashed #aaa", using lighter color for dark theme visibility
                new DragDrop(editor, "2px dashed #60a5fa")
              } catch (error) {
                console.warn('Drag-drop plugin initialization error (non-fatal):', error)
                // Don't break editor if drag-drop fails to initialize
              }
            }
          },
          placeholder: 'Start writing...',
          readOnly: false,
          minHeight: 200
        })

        const collectImageSizeMap = async () => {
          if (!editor?.saver?.save || !editor?.blocks?.getBlockByIndex) {
            return {}
          }

          const outputData = await editor.saver.save()
          if (!outputData?.blocks) {
            return {}
          }

          const parseSize = (raw?: string | null) => {
            if (!raw) return undefined
            const value = Number(String(raw).replace('px', ''))
            return Number.isFinite(value) && value > 0 ? value : undefined
          }

          const sizes: Record<string, { width?: number; height?: number }> = {}

          outputData.blocks.forEach((block, index) => {
            if (block.type !== 'image') {
              return
            }

            const imageUrl = block?.data?.file?.url || block?.data?.url
            if (!imageUrl) {
              return
            }

            const blockApi = editor.blocks.getBlockByIndex(index) as { holder?: HTMLElement } | null
            const holderEl = blockApi?.holder
            const wrapperEl = holderEl?.querySelector('.image-tool') as HTMLElement | null
            const imageEl = holderEl?.querySelector('.image-tool__image-picture') as HTMLImageElement | null

            const widthValue =
              parseSize(wrapperEl?.dataset?.imageWidth) ??
              parseSize(imageEl?.getAttribute('width')) ??
              parseSize(imageEl?.style?.width)
            const heightValue =
              parseSize(wrapperEl?.dataset?.imageHeight) ??
              parseSize(imageEl?.getAttribute('height')) ??
              parseSize(imageEl?.style?.height)

            if (!widthValue && !heightValue) {
              return
            }

            sizes[imageUrl] = {
              ...(widthValue ? { width: widthValue } : {}),
              ...(heightValue ? { height: heightValue } : {})
            }
          })

          return sizes
        }

        editorRef.current = editor
        editor.getEnrichedData = async () => {
          const outputData = await editor.saver.save()
          return injectImageSizes(outputData)
        }
        editor.getImageSizeMap = collectImageSizeMap
        if (onReady) {
          onReady(editor)
        }
        setIsEditorReady(true)
      } catch (error) {
        console.error('Error initializing EditorJS:', error)
        setIsEditorReady(false)
      } finally {
        setIsInitializing(false)
      }
    }

    // Initialize when component mounts and ref is available
    const timeoutId = setTimeout(initEditor, 100)

    return () => {
      clearTimeout(timeoutId)
      if (editorRef.current) {
        try {
          // EditorJS cleanup - check if destroy method exists
          if (typeof editorRef.current.destroy === 'function') {
            editorRef.current.destroy()
          }
        } catch (error) {
          console.warn('Error cleaning up EditorJS:', error)
        } finally {
          editorRef.current = null
        }
      }
    }
  }, [holder, onChange, data, isInitializing, isEditorReady])

  return (
    <div className="w-full">
      {pluginWarnings.length > 0 && (
        <div className="mb-2 rounded-md border border-yellow-700 bg-yellow-900/30 px-3 py-2 text-sm text-yellow-200">
          {pluginWarnings.map((msg) => (
            <div key={msg}>{msg}</div>
          ))}
        </div>
      )}
      {/* Always render the container div */}
      <div 
        ref={containerRef}
        className="min-h-[200px] bg-gray-800 rounded-lg border border-gray-700"
        style={{ minHeight: '200px' }}
      />
      
      {/* Show loading overlay while initializing */}
      {isInitializing && (
        <div className="absolute inset-0 bg-gray-800/80 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-2"></div>
            <div className="text-gray-400 text-sm">Loading rich text editor...</div>
          </div>
        </div>
      )}
    </div>
  )
}