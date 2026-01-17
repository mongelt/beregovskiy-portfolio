'use client'

import { useEffect, useRef, useState } from 'react'
import { OutputData } from '@editorjs/editorjs'

interface EditorJSProps {
  data?: OutputData
  onChange?: (data: OutputData) => void
  holder: string
}

export default function EditorJSComponent({ data, onChange, holder }: EditorJSProps) {
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
                  o.content.firstChild.setAttribute("src", this.data.embed)
                  o.content.firstChild.classList.add(CSS.content)
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
                
                // Handle embed ready state
                const embedIsReady = this.embedIsReady ? this.embedIsReady(r) : Promise.resolve()
                
                // Append elements (with null check)
                if (o.content && o.content.firstChild) {
                  r.appendChild(o.content.firstChild)
                }
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
        // Step 11.1: Columns plugin - multi-column layout functionality
        // Plugin provides 2-column and 3-column layouts with nested Editor.js instances
        // Source: https://github.com/calumk/editorjs-columns
        // Plugin requires EditorJs library class and separate column_tools configuration
        let EditorjsColumns: any = null
        if (typeof window !== 'undefined') {
          try {
            const ColumnsModule = await import('@calumk/editorjs-columns')
            EditorjsColumns = ColumnsModule.default || ColumnsModule.EditorjsColumns || ColumnsModule
            
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
            ImageGallery = ImageGalleryModule.default || ImageGalleryModule.ImageGallery || ImageGalleryModule
            
            // Step 10.Bug.4.1: Patch _acceptTuneView to handle missing textarea for existing galleries
            // When editing an existing gallery, textarea doesn't exist, causing classList error
            // This patch creates textarea dynamically when needed
            if (ImageGallery && ImageGallery.prototype) {
              const originalAcceptTuneView = ImageGallery.prototype._acceptTuneView
              if (originalAcceptTuneView) {
                ImageGallery.prototype._acceptTuneView = function() {
                  try {
                    // Get textarea element
                    let n = document.querySelector("textarea.image-gallery-"+this.blockIndex)
                    
                    // If textarea doesn't exist and editImages is being enabled, create it
                    if (!n && this.data.editImages) {
                      // Create textarea similar to render() method
                      n = document.createElement("textarea")
                      n.className = "image-gallery-"+this.blockIndex
                      n.placeholder = "Paste your photos URL ..."
                      
                      // Add event listeners (matching plugin's render() method)
                      let e
                      ["paste","change","keyup"].forEach((a) => {
                        n.addEventListener(a, (r) => {
                          e = "paste" === a ? r.clipboardData.getData("text").split("\n") : n.value.split("\n")
                          if (this._imageGallery) {
                            this._imageGallery(e)
                          }
                        }, false)
                      })
                      
                      // Set initial value from current URLs
                      if (this.data && this.data.urls) {
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
                          this.wrapper.insertBefore(n, galleryContainer)
                        } else {
                          // If no container, append to wrapper
                          this.wrapper.appendChild(n)
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
            Strikethrough = StrikethroughModule.default || StrikethroughModule.Strikethrough || StrikethroughModule
            
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
            // Plugin exports as default or named export
            AnyButton = ButtonModule.default || ButtonModule.AnyButton || ButtonModule
            
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
            // Plugin exports as default
            DragDrop = DragDropModule.default || DragDropModule.DragDrop || DragDropModule
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
            // Plugin exports as default
            Undo = UndoModule.default || UndoModule.Undo || UndoModule
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
                onChange(outputData)
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
            
            // Step 11.Bug.1.3: Drag-drop plugin DISABLED
            // Drag-drop plugin has fundamental incompatibility with columns plugin
            // Multiple patch attempts failed (Step 11.Bug.1.1, 11.Bug.1.2, 11.Bug.1.3)
            // Disabling drag-drop entirely to eliminate errors
            // Users can still reorder blocks using other methods (cut/paste, delete/recreate)
            // To re-enable: Uncomment the code below and remove this comment block
            /*
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
            */
          },
          placeholder: 'Start writing...',
          readOnly: false,
          minHeight: 200
        })

        editorRef.current = editor
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