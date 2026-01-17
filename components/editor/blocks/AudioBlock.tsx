/**
 * Editor.js Audio Block Tool
 * Custom block tool for embedding audio with wavesurfer.js waveform visualization
 * 
 * Implements Editor.js Block Tool API:
 * - static get toolbox() - Block icon and title
 * - constructor({ data, api, readOnly }) - Initialize block
 * - render() - Render block in edit mode
 * - save(blockContent) - Extract and return block data
 * - static get sanitize() - Define allowed HTML
 * - static get isReadOnlySupported() - Enable read-only mode
 * - destroy() - Cleanup wavesurfer instance
 */

// Step 14.1: AudioBlock - Custom Editor.js block tool for audio content

export default class AudioBlock {
  private data: {
    url: string
    caption: string
  }
  private api: any
  private readOnly: boolean
  private wrapper: HTMLElement | null = null
  private wavesurferInstance: any = null
  private waveformContainer: HTMLElement | null = null
  private urlInput: HTMLInputElement | null = null
  private captionInput: HTMLInputElement | null = null
  private fileInput: HTMLInputElement | null = null
  private uploadButton: HTMLButtonElement | null = null
  private playButton: HTMLButtonElement | null = null
  private stopButton: HTMLButtonElement | null = null
  private isPlaying: boolean = false

  static get toolbox() {
    return {
      title: 'Audio',
      icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2C8.9 2 8 2.9 8 4V12C8 13.1 8.9 14 10 14C11.1 14 12 13.1 12 12V4C12 2.9 11.1 2 10 2Z" fill="currentColor"/><path d="M15 6C14.4 6 14 6.4 14 7V13C14 13.6 14.4 14 15 14C15.6 14 16 13.6 16 13V7C16 6.4 15.6 6 15 6Z" fill="currentColor"/><path d="M5 8C4.4 8 4 8.4 4 9V11C4 11.6 4.4 12 5 12C5.6 12 6 11.6 6 11V9C6 8.4 5.6 8 5 8Z" fill="currentColor"/></svg>'
    }
  }

  static get isReadOnlySupported() {
    return true
  }

  static get sanitize() {
    return {
      url: {},
      caption: {}
    }
  }

  constructor({ data, api, readOnly }: { data: any, api: any, readOnly: boolean }) {
    this.data = {
      url: data.url || '',
      caption: data.caption || ''
    }
    this.api = api
    this.readOnly = readOnly
  }

  render(): HTMLElement {
    // Create wrapper element
    this.wrapper = document.createElement('div')
    this.wrapper.classList.add('audio-block')
    this.wrapper.style.cssText = 'padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 10px 0;'

    if (this.readOnly) {
      // Read-only mode: just show waveform and controls
      this.renderReadOnly()
    } else {
      // Edit mode: show upload, URL input, caption, and waveform
      this.renderEdit()
    }

    return this.wrapper
  }

  private renderReadOnly(): void {
    if (!this.wrapper) return

    if (!this.data.url) {
      this.wrapper.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No audio URL provided</p>'
      return
    }

    // Create waveform container
    this.waveformContainer = document.createElement('div')
    this.waveformContainer.style.cssText = 'width: 100%; height: 100px; background: #1a1a1a; border-radius: 4px; margin-bottom: 10px;'

    // Create controls container
    const controlsContainer = document.createElement('div')
    controlsContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center; margin-top: 10px;'

    this.playButton = document.createElement('button')
    this.playButton.textContent = 'Play'
    this.playButton.style.cssText = 'padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;'
    this.playButton.onclick = () => this.handlePlayPause()

    this.stopButton = document.createElement('button')
    this.stopButton.textContent = 'Stop'
    this.stopButton.style.cssText = 'padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;'
    this.stopButton.onclick = () => this.handleStop()

    controlsContainer.appendChild(this.playButton)
    controlsContainer.appendChild(this.stopButton)

    // Caption
    if (this.data.caption) {
      const caption = document.createElement('p')
      caption.textContent = this.data.caption
      caption.style.cssText = 'text-align: center; color: #666; font-size: 14px; margin-top: 10px;'
      this.wrapper.appendChild(caption)
    }

    this.wrapper.appendChild(this.waveformContainer)
    this.wrapper.appendChild(controlsContainer)

    // Initialize wavesurfer in read-only mode
    this.initWaveform(this.data.url)
  }

  private renderEdit(): void {
    if (!this.wrapper) return

    // File upload section
    const uploadSection = document.createElement('div')
    uploadSection.style.cssText = 'margin-bottom: 15px;'

    const uploadLabel = document.createElement('label')
    uploadLabel.textContent = 'Upload Audio File:'
    uploadLabel.style.cssText = 'display: block; margin-bottom: 5px; font-weight: 500;'

    const uploadContainer = document.createElement('div')
    uploadContainer.style.cssText = 'display: flex; gap: 10px; align-items: center;'

    this.fileInput = document.createElement('input')
    this.fileInput.type = 'file'
    this.fileInput.accept = 'audio/*'
    this.fileInput.style.cssText = 'flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;'
    this.fileInput.onchange = (e) => this.handleFileSelect(e)

    this.uploadButton = document.createElement('button')
    this.uploadButton.textContent = 'Upload'
    this.uploadButton.style.cssText = 'padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;'
    this.uploadButton.onclick = () => this.handleUpload()
    this.uploadButton.disabled = true

    uploadContainer.appendChild(this.fileInput)
    uploadContainer.appendChild(this.uploadButton)
    uploadSection.appendChild(uploadLabel)
    uploadSection.appendChild(uploadContainer)

    // URL input section
    const urlSection = document.createElement('div')
    urlSection.style.cssText = 'margin-bottom: 15px;'

    const urlLabel = document.createElement('label')
    urlLabel.textContent = 'Or Enter Audio URL:'
    urlLabel.style.cssText = 'display: block; margin-bottom: 5px; font-weight: 500;'

    this.urlInput = document.createElement('input')
    this.urlInput.type = 'url'
    this.urlInput.value = this.data.url
    this.urlInput.placeholder = 'https://example.com/audio.mp3'
    this.urlInput.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;'
    this.urlInput.oninput = () => this.handleUrlChange()

    urlSection.appendChild(urlLabel)
    urlSection.appendChild(this.urlInput)

    // Caption input section
    const captionSection = document.createElement('div')
    captionSection.style.cssText = 'margin-bottom: 15px;'

    const captionLabel = document.createElement('label')
    captionLabel.textContent = 'Caption (optional):'
    captionLabel.style.cssText = 'display: block; margin-bottom: 5px; font-weight: 500;'

    this.captionInput = document.createElement('input')
    this.captionInput.type = 'text'
    this.captionInput.value = this.data.caption
    this.captionInput.placeholder = 'Enter caption for audio'
    this.captionInput.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;'
    this.captionInput.oninput = () => this.handleCaptionChange()

    captionSection.appendChild(captionLabel)
    captionSection.appendChild(this.captionInput)

    // Waveform container
    this.waveformContainer = document.createElement('div')
    this.waveformContainer.style.cssText = 'width: 100%; height: 100px; background: #1a1a1a; border-radius: 4px; margin-bottom: 10px; min-height: 100px;'

    // Controls container
    const controlsContainer = document.createElement('div')
    controlsContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center; margin-top: 10px;'

    this.playButton = document.createElement('button')
    this.playButton.textContent = 'Play'
    this.playButton.style.cssText = 'padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;'
    this.playButton.onclick = () => this.handlePlayPause()
    this.playButton.disabled = !this.data.url

    this.stopButton = document.createElement('button')
    this.stopButton.textContent = 'Stop'
    this.stopButton.style.cssText = 'padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;'
    this.stopButton.onclick = () => this.handleStop()
    this.stopButton.disabled = !this.data.url

    controlsContainer.appendChild(this.playButton)
    controlsContainer.appendChild(this.stopButton)

    // Assemble wrapper
    this.wrapper.appendChild(uploadSection)
    this.wrapper.appendChild(urlSection)
    this.wrapper.appendChild(captionSection)
    this.wrapper.appendChild(this.waveformContainer)
    this.wrapper.appendChild(controlsContainer)

    // Initialize waveform if URL exists
    if (this.data.url) {
      this.initWaveform(this.data.url)
    }
  }

  private async initWaveform(url: string): Promise<void> {
    if (!this.waveformContainer || typeof window === 'undefined') return

    try {
      // Clean up existing instance
      if (this.wavesurferInstance) {
        try {
          this.wavesurferInstance.destroy()
        } catch (error) {
          console.warn('Error destroying existing wavesurfer instance:', error)
        }
        this.wavesurferInstance = null
      }

      // Clear container
      this.waveformContainer.innerHTML = ''

      // Dynamically import wavesurfer.js (SSR safety)
      const WaveSurfer = (await import('wavesurfer.js')).default

      // Create new WaveSurfer instance
      this.wavesurferInstance = WaveSurfer.create({
        container: this.waveformContainer,
        waveColor: '#60a5fa',
        progressColor: '#3b82f6',
        cursorColor: '#ffffff',
        barWidth: 2,
        barRadius: 3,
        responsive: true,
        height: 100,
        normalize: true,
        backend: 'WebAudio',
        mediaControls: false,
      })

      // Load audio URL
      await this.wavesurferInstance.load(url)

      // Add event listeners
      this.wavesurferInstance.on('play', () => {
        this.isPlaying = true
        if (this.playButton) {
          this.playButton.textContent = 'Pause'
        }
      })

      this.wavesurferInstance.on('pause', () => {
        this.isPlaying = false
        if (this.playButton) {
          this.playButton.textContent = 'Play'
        }
      })

      this.wavesurferInstance.on('finish', () => {
        this.isPlaying = false
        if (this.playButton) {
          this.playButton.textContent = 'Play'
        }
      })
    } catch (error) {
      console.error('Failed to initialize waveform:', error)
      if (this.waveformContainer) {
        this.waveformContainer.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 20px;">Failed to load audio</p>'
      }
    }
  }

  private handleFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      if (this.uploadButton) {
        this.uploadButton.disabled = false
      }
    }
  }

  private async handleUpload(): Promise<void> {
    if (!this.fileInput || !this.fileInput.files || this.fileInput.files.length === 0) return

    const file = this.fileInput.files[0]
    
    if (this.uploadButton) {
      this.uploadButton.disabled = true
      this.uploadButton.textContent = 'Uploading...'
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
        { method: 'POST', body: formData }
      )

      const data = await response.json()
      
      if (data.secure_url) {
        this.data.url = data.secure_url
        if (this.urlInput) {
          this.urlInput.value = data.secure_url
        }
        await this.initWaveform(data.secure_url)
        if (this.playButton) this.playButton.disabled = false
        if (this.stopButton) this.stopButton.disabled = false
      }
    } catch (error) {
      console.error('Audio upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      if (this.uploadButton) {
        this.uploadButton.disabled = false
        this.uploadButton.textContent = 'Upload'
      }
    }
  }

  private handleUrlChange(): void {
    if (!this.urlInput) return
    
    const url = this.urlInput.value.trim()
    if (url && url !== this.data.url) {
      this.data.url = url
      this.initWaveform(url)
      if (this.playButton) this.playButton.disabled = false
      if (this.stopButton) this.stopButton.disabled = false
    } else if (!url) {
      this.data.url = ''
      if (this.wavesurferInstance) {
        try {
          this.wavesurferInstance.destroy()
        } catch (error) {
          console.warn('Error destroying wavesurfer:', error)
        }
        this.wavesurferInstance = null
      }
      if (this.waveformContainer) {
        this.waveformContainer.innerHTML = ''
      }
      if (this.playButton) this.playButton.disabled = true
      if (this.stopButton) this.stopButton.disabled = true
    }
  }

  private handleCaptionChange(): void {
    if (!this.captionInput) return
    this.data.caption = this.captionInput.value
  }

  private handlePlayPause(): void {
    if (!this.wavesurferInstance) return
    this.wavesurferInstance.playPause()
  }

  private handleStop(): void {
    if (!this.wavesurferInstance) return
    this.wavesurferInstance.stop()
    this.isPlaying = false
    if (this.playButton) {
      this.playButton.textContent = 'Play'
    }
  }

  save(blockContent: HTMLElement): { url: string, caption: string } {
    return {
      url: this.data.url,
      caption: this.data.caption
    }
  }

  destroy(): void {
    // Clean up wavesurfer instance
    if (this.wavesurferInstance) {
      try {
        this.wavesurferInstance.destroy()
      } catch (error) {
        console.warn('Error destroying wavesurfer in AudioBlock:', error)
      }
      this.wavesurferInstance = null
    }

    // Clear references
    this.wrapper = null
    this.waveformContainer = null
    this.urlInput = null
    this.captionInput = null
    this.fileInput = null
    this.uploadButton = null
    this.playButton = null
    this.stopButton = null
  }
}

