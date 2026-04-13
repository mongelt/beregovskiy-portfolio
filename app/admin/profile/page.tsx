'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'
import type { PartialBlock } from '@blocknote/core'

const BlockNoteEditor = dynamic(() => import('@/components/editor/BlockNoteEditorDynamic'), {
  ssr: false,
})

type SkillRow = {
  id?: string
  skillName: string
  collectionId: string | null
}

type CollectionOption = {
  id: string
  name: string
}

export default function ProfileManagement() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [profileId, setProfileId] = useState('')
  
  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('')
  const [jobTitle1, setJobTitle1] = useState('')
  const [jobTitle2, setJobTitle2] = useState('')
  const [jobTitle3, setJobTitle3] = useState('')
  const [jobTitle4, setJobTitle4] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [shortBioData, setShortBioData] = useState<PartialBlock[] | undefined>()
  const [fullBioData, setFullBioData] = useState<PartialBlock[] | undefined>()
  const [collapsedProfileHeight, setCollapsedProfileHeight] = useState<string>('') // pixels
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [showEmail, setShowEmail] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [showSocialMedia, setShowSocialMedia] = useState(false)
  const [skills, setSkills] = useState<SkillRow[]>([])
  const [collections, setCollections] = useState<CollectionOption[]>([])
  const [languages, setLanguages] = useState('')
  const [education, setEducation] = useState('')
  const fullBioEditorRef = useRef<any>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    setLoading(true)
    try {
    const { data: profileData, error: profileError } = await supabase
        .from('profile')
        .select('*')
        .limit(1)
        .single()

      if (profileError || !profileData) {
        alert('Error loading profile')
        setLoading(false)
        return
      }

      setProfileId(profileData.id)
      setFullName(profileData.full_name || '')
      setLocation(profileData.location || '')
      setJobTitle1(profileData.job_title_1 || '')
      setJobTitle2(profileData.job_title_2 || '')
      setJobTitle3(profileData.job_title_3 || '')
      setJobTitle4(profileData.job_title_4 || '')
      setProfileImage(profileData.profile_image || '')
      setShortBioData(profileData.short_bio)
      setFullBioData(profileData.full_bio)
      setCollapsedProfileHeight(
        profileData.collapsed_profile_height !== null && profileData.collapsed_profile_height !== undefined
          ? String(profileData.collapsed_profile_height)
          : ''
      )
      setEmail(profileData.email || '')
      setPhone(profileData.phone || '')
      setLinkedin(profileData.linkedin || '')
      setShowEmail(profileData.show_email || false)
      setShowPhone(profileData.show_phone || false)
      setShowSocialMedia(profileData.show_social_media || false)
      setLanguages(profileData.languages?.join(', ') || '')
      setEducation(profileData.education || '')

      const [{ data: skillsData }, { data: collectionsData }] = await Promise.all([
        supabase
          .from('profile_skills')
          .select('id, skill_name, collection_id, order_index')
          .eq('profile_id', profileData.id)
          .order('order_index', { ascending: true }),
        supabase.from('collections').select('id, name').order('name')
      ])

      if (skillsData) {
        const mapped = skillsData.map((row) => ({
          id: row.id,
          skillName: row.skill_name ?? '',
          collectionId: row.collection_id ?? null
        }))
        setSkills(mapped)
      } else {
        setSkills([])
      }

      if (collectionsData) {
        setCollections(collectionsData)
      } else {
        setCollections([])
      }
    } catch (err) {
      alert('Error loading profile data')
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      
      const data = await response.json()
      setProfileImage(data.secure_url)
    } catch (error) {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!profileId) {
      alert('Profile not loaded yet.')
      return
    }

    const parsedHeight =
      collapsedProfileHeight.trim() === ''
        ? null
        : Math.floor(Number(collapsedProfileHeight))

    if (parsedHeight !== null) {
      if (Number.isNaN(parsedHeight)) {
        alert('Collapsed height must be a number (pixels).')
        return
      }
      if (parsedHeight < 20) {
        alert('Collapsed height must be at least 20px.')
        return
      }
    }

    // Extract image sizes from BlockNote image blocks in full_bio
    // BlockNote only stores previewWidth - let browser calculate height to preserve aspect ratio
    let fullBioImageSizes: Record<string, { width?: number; height?: number }> | null = null
    if (fullBioData) {
      fullBioImageSizes = {}
      fullBioData.forEach((block) => {
        if (block.type === 'image' && block.props?.url) {
          const url = block.props.url as string
          const width = block.props.previewWidth as number | undefined
          if (width) {
            // Only store width - browser will calculate height to maintain aspect ratio
            fullBioImageSizes![url] = { width }
          }
        }
      })
      // Set to null if no images found (matches original behavior)
      if (fullBioImageSizes && Object.keys(fullBioImageSizes).length === 0) {
        fullBioImageSizes = null
      }
    }

    const profileData = {
      full_name: fullName,
      location: location,
      job_title_1: jobTitle1,
      job_title_2: jobTitle2,
      job_title_3: jobTitle3,
      job_title_4: jobTitle4,
      profile_image: profileImage,
      short_bio: shortBioData,
      full_bio: fullBioData,
      full_bio_image_sizes: fullBioImageSizes,
      collapsed_profile_height: parsedHeight,
      email: email,
      phone: phone,
      linkedin: linkedin,
      show_email: showEmail,
      show_phone: showPhone,
      show_social_media: showSocialMedia,
      languages: languages.split(',').map(l => l.trim()).filter(Boolean),
      education: education,
    }

    const { error: profileError } = await supabase
      .from('profile')
      .update(profileData)
      .eq('id', profileId)

    if (profileError) {
      alert('Error updating profile: ' + profileError.message)
      return
    }

    const rowsToSave = skills
      .map((row, idx) => ({
        profile_id: profileId,
        skill_name: row.skillName.trim(),
        collection_id: row.collectionId || null,
        order_index: idx
      }))
      .filter(row => row.skill_name.length > 0)

    const { error: deleteError } = await supabase
      .from('profile_skills')
      .delete()
      .eq('profile_id', profileId)

    if (deleteError) {
      alert('Error updating skills: ' + deleteError.message)
      return
    }

    if (rowsToSave.length > 0) {
      const { error: insertError } = await supabase
        .from('profile_skills')
        .insert(rowsToSave)

      if (insertError) {
        alert('Error saving skills: ' + insertError.message)
        return
      }
    }

    alert('Profile updated successfully!')
  }

  const handleAddSkill = () => {
    setSkills(prev => [...prev, { skillName: '', collectionId: null }])
  }

  const handleSkillChange = (index: number, field: 'skillName' | 'collectionId', value: string) => {
    setSkills(prev =>
      prev.map((row, i) => {
        if (i !== index) return row
        return field === 'skillName'
          ? { ...row, skillName: value }
          : { ...row, collectionId: value || null }
      })
    )
  }

  const handleRemoveSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index))
  }

  if (loading) return <div className="text-white">Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Profile Management</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name *
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Collapsed Profile height (px)
            </label>
            <Input
              type="number"
              min={0}
              value={collapsedProfileHeight}
              onChange={(e) => setCollapsedProfileHeight(e.target.value)}
              placeholder="e.g., 200"
            />
            <p className="text-xs text-gray-500 mt-1">
              Sets the collapsed Profile card height in pixels; overflow is clipped.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., New York, USA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Title 1
            </label>
            <Input
              value={jobTitle1}
              onChange={(e) => setJobTitle1(e.target.value)}
              placeholder="e.g., Senior Journalist"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Title 2
            </label>
            <Input
              value={jobTitle2}
              onChange={(e) => setJobTitle2(e.target.value)}
              placeholder="e.g., Content Creator"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Title 3
            </label>
            <Input
              value={jobTitle3}
              onChange={(e) => setJobTitle3(e.target.value)}
              placeholder="Additional title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Title 4
            </label>
            <Input
              value={jobTitle4}
              onChange={(e) => setJobTitle4(e.target.value)}
              placeholder="Additional title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profile Image URL (Optional)
            </label>
            <Input
              type="url"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://example.com/your-photo.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload your photo to Cloudinary or another host, then paste the URL here
            </p>
            {profileImage && (
              <img src={profileImage} alt="Profile" className="mt-4 w-32 h-32 object-cover rounded-full" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Short Bio
            </label>
            <p className="text-xs text-gray-500 mb-2">Brief professional summary (shows on collapsed business card)</p>
            <div className="rounded-lg border border-gray-700 min-h-[300px] p-6" style={{ backgroundColor: '#1f1f1f', colorScheme: 'light' }}>
              <BlockNoteEditor 
                holder="short-bio-editor"
                data={shortBioData}
                onChange={(data) => setShortBioData(data as any)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Bio
            </label>
            <p className="text-xs text-gray-500 mb-2">Detailed bio (shows when business card is expanded)</p>
            <div className="rounded-lg border border-gray-700 min-h-[400px] p-6" style={{ backgroundColor: '#1f1f1f', colorScheme: 'light' }}>
              <BlockNoteEditor 
                holder="full-bio-editor"
                data={fullBioData}
                onChange={(data) => setFullBioData(data as any)}
                onReady={(editor) => {
                  fullBioEditorRef.current = editor
                }}
              />
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
            <label className="flex items-center gap-2 text-gray-300 mt-2">
              <input
                type="checkbox"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="rounded border-gray-700 bg-gray-950"
              />
              <span className="text-sm">Show email on public profile</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
            <label className="flex items-center gap-2 text-gray-300 mt-2">
              <input
                type="checkbox"
                checked={showPhone}
                onChange={(e) => setShowPhone(e.target.checked)}
                className="rounded border-gray-700 bg-gray-950"
              />
              <span className="text-sm">Show phone on public profile</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              LinkedIn URL
            </label>
            <Input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />
            <label className="flex items-center gap-2 text-gray-300 mt-2">
              <input
                type="checkbox"
                checked={showSocialMedia}
                onChange={(e) => setShowSocialMedia(e.target.checked)}
                className="rounded border-gray-700 bg-gray-950"
              />
              <span className="text-sm">Show social media on public profile</span>
            </label>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <h2 className="text-xl font-semibold text-white mb-4">Professional Details</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Skills
                </label>
                <p className="text-xs text-gray-500">Add skills one by one and optionally link a collection.</p>
              </div>
              <Button type="button" variant="outline" onClick={handleAddSkill}>
                + Add skill
              </Button>
            </div>

            {skills.length === 0 && (
              <p className="text-sm text-gray-400">No skills yet. Click “Add skill” to start.</p>
            )}

            <div className="space-y-3">
              {skills.map((row, idx) => (
                <div
                  key={row.id ?? idx}
                  className="border border-gray-800 rounded-lg p-3 space-y-2 bg-gray-950"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-400 mb-1">Skill name</label>
                      <Input
                        value={row.skillName}
                        onChange={(e) => handleSkillChange(idx, 'skillName', e.target.value)}
                        placeholder="e.g., JavaScript"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-400 mb-1">Linked collection (optional)</label>
                      <select
                        value={row.collectionId ?? ''}
                        onChange={(e) => handleSkillChange(idx, 'collectionId', e.target.value)}
                        className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                      >
                        <option value="">No collection link</option>
                        {collections.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRemoveSkill(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Languages
            </label>
            <Input
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="English, Spanish, French (comma-separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Separate languages with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Education
            </label>
            <Input
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g., BA in Journalism, University of Example"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit">Save Profile</Button>
          <Button type="button" variant="outline" onClick={() => loadProfile()}>
            Reset Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

