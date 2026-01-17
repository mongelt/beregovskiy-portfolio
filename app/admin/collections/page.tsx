'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'
import type { OutputData } from '@editorjs/editorjs'

const EditorJS = dynamic(() => import('@/components/editor/EditorJS'), {
  ssr: false,
})

type Collection = {
  id: string
  name: string
  description: any
  slug: string
  order_index: number
  featured: boolean
}

export default function CollectionsManagement() {
  const supabase = createClient()
  const [collections, setCollections] = useState<Collection[]>([])
  const [newName, setNewName] = useState('')
  const [newDescriptionData, setNewDescriptionData] = useState<OutputData | undefined>()
  const [newFeatured, setNewFeatured] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescriptionData, setEditDescriptionData] = useState<OutputData | undefined>()
  const [editFeatured, setEditFeatured] = useState(false)
  const [editingCollectionOrder, setEditingCollectionOrder] = useState<string | null>(null)
  const [editCollectionOrder, setEditCollectionOrder] = useState('')

  useEffect(() => {
    loadCollections()
  }, [])

  async function loadCollections() {
    const { data } = await supabase
      .from('collections')
      .select('*')
      .order('order_index')
    
    setCollections(data || [])
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async function createCollection() {
    if (!newName.trim()) return
    
    // Validate: empty collections cannot be featured
    if (newFeatured) {
      // Note: New collections are always empty (0 content) at creation
      // Therefore, featured cannot be true for new collections
      alert('Empty collections cannot be featured. Create the collection first, add content to it, then mark it as featured.')
      return
    }
    
    const slug = generateSlug(newName)
    
    const { error } = await supabase
      .from('collections')
      .insert({ 
        name: newName,
        description: newDescriptionData || null,
        slug: slug,
        order_index: collections.length,
        featured: newFeatured
      })
    
    if (error) {
      alert('Error creating collection: ' + error.message)
    } else {
      setNewName('')
      setNewDescriptionData(undefined)
      setNewFeatured(false)
      loadCollections()
    }
  }

  async function deleteCollection(id: string) {
    if (!confirm('Delete collection? Content will not be deleted, just removed from this collection.')) return
    
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Error: ' + error.message)
    } else {
      loadCollections()
    }
  }

  async function updateCollection() {
    if (!editName.trim() || !editingId) return
    
    // Validate: empty collections cannot be featured
    if (editFeatured) {
      const { count, error: countError } = await supabase
        .from('content_collections')
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', editingId)
      
      if (countError) {
        alert('Error checking collection content: ' + countError.message)
        return
      }
      
      if (count === 0) {
        alert('Cannot mark empty collection as featured. Add content to this collection first.')
        return
      }
    }
    
    const slug = generateSlug(editName)
    
    const { error } = await supabase
      .from('collections')
      .update({ 
        name: editName,
        description: editDescriptionData || null,
        slug: slug,
        featured: editFeatured
      })
      .eq('id', editingId)
    
    if (error) {
      alert('Error: ' + error.message)
    } else {
      setEditingId(null)
      setEditName('')
      setEditDescriptionData(undefined)
      setEditFeatured(false)
      loadCollections()
    }
  }

  function startEdit(collection: Collection) {
    setEditingId(collection.id)
    setEditName(collection.name)
    setEditDescriptionData(collection.description)
    setEditFeatured(collection.featured)
  }

  async function updateCollectionOrder(id: string, newOrder: string) {
    const orderValue = newOrder.trim() === '' ? 0 : parseInt(newOrder, 10)
    
    if (isNaN(orderValue)) {
      setEditingCollectionOrder(null)
      setEditCollectionOrder('')
      return
    }
    
    const { error } = await supabase
      .from('collections')
      .update({ order_index: orderValue })
      .eq('id', id)
    
    if (error) {
      alert('Error updating order: ' + error.message)
    } else {
      setEditingCollectionOrder(null)
      setEditCollectionOrder('')
      loadCollections()
    }
  }

  function startEditCollectionOrder(collection: Collection) {
    setEditingCollectionOrder(collection.id)
    setEditCollectionOrder(collection.order_index.toString())
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Collections Management</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Create New Collection</h2>
        <p className="text-gray-400 text-sm mb-4">
          Collections are curated groups of content, like "Featured Work" or "B2B Marketing"
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Collection Name *
            </label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Featured Work, B2B Marketing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <p className="text-xs text-gray-500 mb-2">Detailed description (shows when "More Info" is expanded)</p>
            <EditorJS 
              holder="new-collection-description"
              data={newDescriptionData}
              onChange={setNewDescriptionData}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="new-featured"
              checked={newFeatured}
              onChange={(e) => setNewFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-950 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="new-featured" className="text-sm text-gray-300">
              Featured Collection
            </label>
          </div>
          <p className="text-xs text-gray-500 -mt-2">
            Featured collections appear in the Collections Menu on the Portfolio tab
          </p>

          <Button onClick={createCollection}>Create Collection</Button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Existing Collections</h2>
        
        <div className="space-y-3">
          {collections.map(collection => (
            <div 
              key={collection.id}
              className="bg-gray-800 rounded-lg p-4"
            >
              {editingId === collection.id ? (
                <div className="space-y-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Collection name"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <EditorJS 
                      holder={`edit-collection-description-${collection.id}`}
                      data={editDescriptionData}
                      onChange={setEditDescriptionData}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`edit-featured-${collection.id}`}
                      checked={editFeatured}
                      onChange={(e) => setEditFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-700 bg-gray-950 text-emerald-500 focus:ring-emerald-500"
                    />
                    <label htmlFor={`edit-featured-${collection.id}`} className="text-sm text-gray-300">
                      Featured Collection
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Featured collections appear in the Collections Menu on the Portfolio tab
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={updateCollection}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {editingCollectionOrder === collection.id ? (
                        <Input
                          type="number"
                          value={editCollectionOrder}
                          onChange={(e) => setEditCollectionOrder(e.target.value)}
                          className="w-16"
                          onBlur={() => updateCollectionOrder(collection.id, editCollectionOrder)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateCollectionOrder(collection.id, editCollectionOrder)
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <span 
                          className="text-xs text-gray-500 cursor-pointer hover:text-gray-400"
                          onClick={() => startEditCollectionOrder(collection)}
                        >
                          [{collection.order_index}]
                        </span>
                      )}
                      <h3 className="text-white font-semibold">{collection.name}</h3>
                    </div>
                    {collection.description && (
                      <p className="text-gray-400 text-sm mb-2">
                        {collection.description.blocks?.[0]?.data?.text || 'Has description'}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">Slug: {collection.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startEdit(collection)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteCollection(collection.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {collections.length === 0 && (
            <p className="text-gray-500 text-center py-8">No collections yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

