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
  const hasUpgradedRef = useRef(false)
  const isInitializingRef = useRef(false)
  const isEditorReadyRef = useRef(false)
  const onChangeRef = useRef(onChange)
  const onReadyRef = useRef(onReady)
  const lastSavedDataRef = useRef<string | null>(null)
  const lastAppliedDataRef = useRef<string | null>(null)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || !data || isInitializingRef.current) {
      return
    }

    const serialized = JSON.stringify(data)
    if (serialized === lastSavedDataRef.current || serialized === lastAppliedDataRef.current) {
      return
    }

    lastAppliedDataRef.current = serialized

    if (typeof editor.render === 'function') {
      void editor.render(data)
    }
  }, [data])

  const addWarning = (msg: string) => {
    setPluginWarnings((prev) => (prev.includes(msg) ? prev : [...prev, msg]))
  }

  useEffect(() => {
    let editor: any = null

    const initEditor = async () => {
      if (isInitializingRef.current || isEditorReadyRef.current) return
      
      setIsInitializing(true)
      isInitializingRef.current = true

      try {
        const checkElement = () => {
          return containerRef.current
        }

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
        const EmbedModule = await import('@editorjs/embed')
        const Embed = EmbedModule.default
        
        if (Embed && Embed.prepare) {
          try {
            Embed.prepare({ config: {} })
          } catch (error) {
            console.warn('Embed plugin prepare() error (non-fatal):', error)
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
                
                if (o.content && o.content.firstChild) {
                  const firstChildEl = o.content.firstChild as HTMLElement
                  firstChildEl.setAttribute("src", this.data.embed)
                  firstChildEl.classList.add(CSS.content)
                } else {
                  console.warn('Embed plugin: Template firstChild is null, creating fallback iframe')
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

                const embedIsReady = this.embedIsReady ? this.embedIsReady(r) : Promise.resolve()
                
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
                const fallbackElement = document.createElement('div')
                fallbackElement.textContent = 'Embed failed to load'
                this.element = fallbackElement
                return fallbackElement
              }
            }
          }
        }

        const ImageToolModule = await import('@editorjs/image')
        let ImageTool = ImageToolModule.default
        
        if (ImageTool && ImageTool.prototype) {
          const originalOnUpload = ImageTool.prototype.onUpload
          if (originalOnUpload) {
            ImageTool.prototype.onUpload = function(response: any) {
              try {
                if (!response || !response.success || !response.file) {
                  return originalOnUpload.call(this, response)
                }
                
                if (!this.ui) {
                  console.warn('Image plugin: UI instance is null, cannot process upload')
                  return originalOnUpload.call(this, response)
                }
                
                if (this.ui.fillImage && !this.ui._fillImagePatched) {
                  const originalFillImage = this.ui.fillImage.bind(this.ui)
                  
                  this.ui.fillImage = function(url: string) {
                    try {
                      if (!this.nodes) {
                        console.warn('Image plugin: nodes is null, cannot create image element')
                        return
                      }
                      
                      if (!this.nodes.imageContainer) {
                        console.warn('Image plugin: imageContainer is null, cannot create image element')
                        return
                      }
                      
                      if (this.nodes.imageEl) {
                        try {
                          if (this.nodes.imageEl.parentNode === this.nodes.imageContainer) {
                            this.nodes.imageContainer.removeChild(this.nodes.imageEl)
                          }
                        } catch (removeError) {
                        }
                        this.nodes.imageEl = undefined
                      }
                      
                      return originalFillImage.call(this, url)
                    } catch (error) {
                      console.warn('Image plugin fillImage error (non-fatal):', error)
                      try {
                        if (this.nodes && this.nodes.imageContainer) {
                          return originalFillImage.call(this, url)
                        }
                      } catch (retryError) {
                        console.warn('Image plugin fillImage retry error (non-fatal):', retryError)
                      }
                    }
                  }
                  
                  this.ui._fillImagePatched = true
                }
                
                return originalOnUpload.call(this, response)
              } catch (error) {
                console.warn('Image plugin onUpload error (non-fatal):', error)
                try {
                  return originalOnUpload.call(this, response)
                } catch (fallbackError) {
                  console.warn('Image plugin onUpload fallback error (non-fatal):', fallbackError)
                }
              }
            }
          }
        }

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
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

        const cloudinaryUploader = {
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

          async uploadByUrl(url: string): Promise<{ success: number; file: { url: string } }> {
            try {
              if (!cloudName || !uploadPreset) {
                throw new Error('Cloudinary config missing: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET')
              }

              const response = await fetch(url)
              if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`)
              }
              
              const blob = await response.blob()
              const file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' })
              
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

        const coreTools = {
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
          image: {
            class: ImageTool as any,
            config: {
              uploader: cloudinaryUploader,
              features: {
                border: true,
                caption: true,
                stretch: true,
                background: true
              },
              captionPlaceholder: 'Enter image caption'
            }
          },
          embed: {
            class: Embed as any,
            inlineToolbar: true // Allow inline formatting in captions
          }
        }

        function buildTools(extraTools: Record<string, any> = {}) {
          return { ...coreTools, ...extraTools }
        }

        const attachEnhancements = async (editorInstance: any, initialData?: OutputData | null) => {
          if (!editorInstance || typeof window === 'undefined') return
          try {
            const UndoModule = await import('editorjs-undo')
            const UndoModuleAny = UndoModule as unknown as { default?: any; Undo?: any }
            const Undo = UndoModuleAny.default || UndoModuleAny.Undo || UndoModuleAny

            if (Undo) {
              try {
                const OriginalUndo = Undo

                if (OriginalUndo && OriginalUndo.prototype) {
                  const originalInitialize = OriginalUndo.prototype.initialize
                  if (originalInitialize) {
                    OriginalUndo.prototype.initialize = function(data: any) {
                      try {
                        if (!this.editor) {
                          console.warn('Undo plugin: editor instance is null, skipping initialization')
                          return
                        }

                        return originalInitialize.call(this, data)
                      } catch (error) {
                        console.warn('Undo plugin initialize error (non-fatal):', error)
                      }
                    }
                  }

                  const originalRender = OriginalUndo.prototype.render
                  if (originalRender) {
                    OriginalUndo.prototype.render = function() {
                      try {
                        const element = originalRender.call(this)
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

                const undoInstance = new Undo({ editor: editorInstance })

                if (initialData && initialData.blocks && initialData.blocks.length > 0) {
                  undoInstance.initialize(initialData)
                }
              } catch (error) {
                console.warn('Undo plugin initialization error (non-fatal):', error)
              }
            }
          } catch (error) {
            console.warn('Undo plugin failed to load:', error)
          }

          try {
            const DragDropModule = await import('editorjs-drag-drop')
            const DragDropModuleAny = DragDropModule as unknown as { default?: any; DragDrop?: any }
            const DragDrop = DragDropModuleAny.default || DragDropModuleAny.DragDrop || DragDropModuleAny
            if (DragDrop) {
              new DragDrop(editorInstance, "2px dashed #60a5fa")
            }
          } catch (error) {
            console.warn('Drag-drop plugin initialization error (non-fatal):', error)
          }
        }

        function finalizeEditor(editorInstance: any) {
          const collectImageSizeMap = async () => {
            if (!editorInstance?.saver?.save || !editorInstance?.blocks?.getBlockByIndex) {
              return {}
            }

            const outputData = await editorInstance.saver.save()
            if (!outputData?.blocks) {
              return {}
            }

            const parseSize = (raw?: string | null) => {
              if (!raw) return undefined
              const value = Number(String(raw).replace('px', ''))
              return Number.isFinite(value) && value > 0 ? value : undefined
            }

            const sizes: Record<string, { width?: number; height?: number }> = {}

            outputData.blocks.forEach((block: OutputData['blocks'][number], index: number) => {
              if (block.type !== 'image') {
                return
              }

              const imageUrl = block?.data?.file?.url || block?.data?.url
              if (!imageUrl) {
                return
              }

              const blockApi = editorInstance.blocks.getBlockByIndex(index) as { holder?: HTMLElement } | null
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

          editorRef.current = editorInstance
          editorInstance.getEnrichedData = async () => {
            const outputData = await editorInstance.saver.save()
            return injectImageSizes(outputData)
          }
          editorInstance.getImageSizeMap = collectImageSizeMap
          if (onReadyRef.current) {
            onReadyRef.current(editorInstance)
          }
          isEditorReadyRef.current = true
          setIsEditorReady(true)
        }

        const loadOptionalTools = async (): Promise<Record<string, any>> => {
          const optionalTools: Record<string, any> = {}

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
              console.warn('Columns plugin failed to load:', error)
              addWarning('Columns failed to load; column blocks may not work')
              EditorjsColumns = null
            }
          }

          let ImageGallery: any = null
          if (typeof window !== 'undefined') {
            try {
              const ImageGalleryModule = await import('@rodrigoodhin/editorjs-image-gallery')
              const ImageGalleryModuleAny = ImageGalleryModule as unknown as { default?: any; ImageGallery?: any }
              ImageGallery = ImageGalleryModuleAny.default || ImageGalleryModuleAny.ImageGallery || ImageGalleryModuleAny

              if (ImageGallery && ImageGallery.prototype) {
                const originalAcceptTuneView = ImageGallery.prototype._acceptTuneView
                if (originalAcceptTuneView) {
                  ImageGallery.prototype._acceptTuneView = function() {
                    try {
                      let n = document.querySelector("textarea.image-gallery-"+this.blockIndex) as HTMLTextAreaElement | null

                      if (!n && this.data.editImages) {
                        n = document.createElement("textarea")
                        n.className = "image-gallery-"+this.blockIndex
                        n.placeholder = "Paste your photos URL ..."

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

                        if (this.data && this.data.urls && n) {
                          if (Array.isArray(this.data.urls)) {
                            n.value = this.data.urls.join("\n")
                          } else if (typeof this.data.urls === 'string') {
                            n.value = this.data.urls
                          }
                        }

                        if (this.wrapper) {
                          const galleryContainer = this.wrapper.querySelector("#image-gallery-"+this.blockIndex)
                          if (galleryContainer) {
                            if (n) {
                              this.wrapper.insertBefore(n, galleryContainer)
                            }
                          } else {
                            if (n) {
                              this.wrapper.appendChild(n)
                            }
                          }
                        }
                      }

                      return originalAcceptTuneView.call(this)
                    } catch (error) {
                      console.warn('Image Gallery _acceptTuneView error (non-fatal):', error)
                      try {
                        return originalAcceptTuneView.call(this)
                      } catch (fallbackError) {
                        console.warn('Image Gallery _acceptTuneView fallback error:', fallbackError)
                        return
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.warn('Image Gallery plugin failed to load:', error)
              addWarning('Image Gallery failed to load; gallery blocks may not work')
              ImageGallery = null
            }
          }

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
              console.warn('Strikethrough plugin failed to load:', error)
              Strikethrough = null
            }
          }

          let AnyButton: any = null
          if (typeof window !== 'undefined') {
            try {
              const ButtonModule = await import('editorjs-button')
              const ButtonModuleAny = ButtonModule as unknown as { default?: any; AnyButton?: any }
              AnyButton = ButtonModuleAny.default || ButtonModuleAny.AnyButton || ButtonModuleAny

              if (AnyButton && AnyButton.prototype) {
                const originalShow = AnyButton.prototype.show
                if (originalShow) {
                  AnyButton.prototype.show = function(state: any) {
                    try {
                      if (!this.nodes.anyButton) {
                        if (this.nodes.container) {
                          const existingButton = this.nodes.container.querySelector('.anyButton__btn') as HTMLAnchorElement
                          if (existingButton) {
                            this.nodes.anyButton = existingButton
                            if (!this.nodes.anyButtonHolder) {
                              this.nodes.anyButtonHolder = existingButton.closest('.anyButtonContainer__anyButtonHolder') as HTMLElement
                            }
                          } else {
                            if (this.nodes.anyButtonHolder) {
                              this.nodes.anyButton = this.make('a', [this.CSS.btn, this.CSS.btnColor], {
                                target: '_blank',
                                rel: 'nofollow noindex noreferrer'
                              })
                              this.nodes.anyButtonHolder.appendChild(this.nodes.anyButton)
                            } else if (this.makeAnyButtonHolder) {
                              this.nodes.anyButtonHolder = this.makeAnyButtonHolder()
                              if (this.nodes.container && this.nodes.anyButtonHolder) {
                                this.nodes.container.appendChild(this.nodes.anyButtonHolder)
                              }
                            }
                          }
                        }
                      }

                      if (this.nodes.anyButton) {
                        this.nodes.anyButton.textContent = this._data.text
                        this.nodes.anyButton.setAttribute("href", this._data.link)
                      } else {
                        console.warn('Button plugin: anyButton is null after recreation attempt, skipping setAttribute')
                      }

                      this.changeState(state)
                    } catch (error) {
                      console.warn('Button plugin show method error (non-fatal):', error)
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

          if (EditorjsColumns) {
            optionalTools.columns = {
              class: EditorjsColumns as any,
              config: {
                EditorJsLibrary: EditorJS,
                tools: column_tools
              }
            }
          }

          if (ImageGallery) {
            optionalTools.gallery = {
              class: ImageGallery as any
            }
          }

          if (Strikethrough) {
            optionalTools.strikethrough = {
              class: Strikethrough as any
            }
          }

          if (AnyButton) {
            optionalTools.AnyButton = {
              class: AnyButton as any,
              inlineToolbar: false,
              config: {
                css: {
                  btnColor: 'btn--gray'
                }
              }
            }
          }

          if (AttachesTool) {
            optionalTools.attaches = {
              class: AttachesTool as any,
              config: {
                uploader: cloudinaryRawUploader,
                buttonText: 'Select file',
                errorMessage: 'File upload failed'
              }
            }
          }

          if (AudioBlock) {
            optionalTools.audio = {
              class: AudioBlock as any,
              inlineToolbar: false
            }
          }

          return optionalTools
        }

        const upgradeEditorWithOptionalTools = async () => {
          if (hasUpgradedRef.current) return
          hasUpgradedRef.current = true

          try {
            const optionalTools = await loadOptionalTools()
            if (!editor || Object.keys(optionalTools).length === 0) {
              return
            }
            const savedData = await editor.saver.save()
            if (typeof editor.destroy === 'function') {
              editor.destroy()
            }
            editor = createEditorInstance(optionalTools, savedData)
            finalizeEditor(editor)
          } catch (error) {
            console.warn('Optional plugin upgrade failed:', error)
          }
        }

        function createEditorInstance(extraTools: Record<string, any> = {}, dataOverride?: OutputData) {
          const initialData = dataOverride || data || undefined
          editor = new EditorJS({
            holder: element!, // element is guaranteed to be non-null after the check above
            data: initialData || {
              blocks: [
                {
                  type: 'paragraph',
                  data: {
                    text: ''
                  }
                }
              ]
            },
            tools: buildTools(extraTools),
            onChange: (api: any) => {
              if (onChangeRef.current) {
                api.saver.save().then((outputData: OutputData) => {
                  const enrichedData = injectImageSizes(outputData)
                  lastSavedDataRef.current = JSON.stringify(enrichedData)
                  onChangeRef.current?.(enrichedData)
                })
              }
            },
            onReady: () => {
              void attachEnhancements(editor, initialData || null)
              if (!hasUpgradedRef.current) {
                void upgradeEditorWithOptionalTools()
              }
            },
            placeholder: 'Start writing...',
            readOnly: false,
            minHeight: 200
          })
          return editor
        }

        editor = createEditorInstance()

        finalizeEditor(editor)
      } catch (error) {
        console.error('Error initializing EditorJS:', error)
        setIsEditorReady(false)
      } finally {
        setIsInitializing(false)
        isInitializingRef.current = false
      }
    }

    const timeoutId = setTimeout(initEditor, 100)

    return () => {
      clearTimeout(timeoutId)
      if (editorRef.current) {
        try {
          if (typeof editorRef.current.destroy === 'function') {
            editorRef.current.destroy()
          }
        } catch (error) {
          console.warn('Error cleaning up EditorJS:', error)
        } finally {
          editorRef.current = null
          isEditorReadyRef.current = false
        }
      }
    }
  }, [holder])

  return (
    <div className="w-full">
      {pluginWarnings.length > 0 && (
        <div className="mb-2 rounded-md border border-yellow-700 bg-yellow-900/30 px-3 py-2 text-sm text-yellow-200">
          {pluginWarnings.map((msg) => (
            <div key={msg}>{msg}</div>
          ))}
        </div>
      )}
      <div 
        ref={containerRef}
        className="min-h-[200px] bg-gray-800 rounded-lg border border-gray-700"
        style={{ minHeight: '200px' }}
      />
      
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