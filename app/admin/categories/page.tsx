'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Category = {
  id: string
  name: string
  order_index: number
}

type Subcategory = {
  id: string
  category_id: string
  name: string
  order_index: number
}

export default function CategoriesManagement() {
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newSubcategoryName, setNewSubcategoryName] = useState('')
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null)
  const [editSubcategoryName, setEditSubcategoryName] = useState('')
  const [editingCategoryOrder, setEditingCategoryOrder] = useState<string | null>(null)
  const [editCategoryOrder, setEditCategoryOrder] = useState('')
  const [editingSubcategoryOrder, setEditingSubcategoryOrder] = useState<string | null>(null)
  const [editSubcategoryOrder, setEditSubcategoryOrder] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [catResult, subResult] = await Promise.all([
      supabase.from('categories').select('*').order('order_index'),
      supabase.from('subcategories').select('*').order('order_index')
    ])
    
    setCategories(catResult.data || [])
    setSubcategories(subResult.data || [])
  }

  async function createCategory() {
    if (!newCategoryName.trim()) return
    
    const { error } = await supabase
      .from('categories')
      .insert({ 
        name: newCategoryName,
        order_index: categories.length 
      })
    
    if (error) {
      alert('Error creating category: ' + error.message)
    } else {
      setNewCategoryName('')
      loadData()
    }
  }

  async function createSubcategory() {
    if (!newSubcategoryName.trim() || !selectedCategoryForSub) return
    
    const categorySubcategories = subcategories.filter(
      sub => sub.category_id === selectedCategoryForSub
    )
    
    const { error } = await supabase
      .from('subcategories')
      .insert({ 
        name: newSubcategoryName,
        category_id: selectedCategoryForSub,
        order_index: categorySubcategories.length
      })
    
    if (error) {
      alert('Error creating subcategory: ' + error.message)
    } else {
      setNewSubcategoryName('')
      loadData()
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete category? This will also delete all subcategories and content!')) return
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Error: ' + error.message)
    } else {
      loadData()
    }
  }

  async function deleteSubcategory(id: string) {
    if (!confirm('Delete subcategory? This will affect related content!')) return
    
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Error: ' + error.message)
    } else {
      loadData()
    }
  }

  async function updateCategory(id: string) {
    if (!editCategoryName.trim()) return
    
    const { error } = await supabase
      .from('categories')
      .update({ name: editCategoryName })
      .eq('id', id)
    
    if (error) {
      alert('Error: ' + error.message)
    } else {
      setEditingCategory(null)
      setEditCategoryName('')
      loadData()
    }
  }

  async function updateSubcategory(id: string) {
    if (!editSubcategoryName.trim()) return
    
    const { error } = await supabase
      .from('subcategories')
      .update({ name: editSubcategoryName })
      .eq('id', id)
    
    if (error) {
      alert('Error: ' + error.message)
    } else {
      setEditingSubcategory(null)
      setEditSubcategoryName('')
      loadData()
    }
  }

  function startEditCategory(category: Category) {
    setEditingCategory(category.id)
    setEditCategoryName(category.name)
  }

  function startEditSubcategory(subcategory: Subcategory) {
    setEditingSubcategory(subcategory.id)
    setEditSubcategoryName(subcategory.name)
  }

  async function updateCategoryOrder(id: string, newOrder: string) {
    const orderValue = newOrder.trim() === '' ? 0 : parseInt(newOrder, 10)
    
    if (isNaN(orderValue)) {
      setEditingCategoryOrder(null)
      setEditCategoryOrder('')
      return
    }
    
    const { error } = await supabase
      .from('categories')
      .update({ order_index: orderValue })
      .eq('id', id)
    
    if (error) {
      alert('Error updating order: ' + error.message)
    } else {
      setEditingCategoryOrder(null)
      setEditCategoryOrder('')
      loadData()
    }
  }

  function startEditCategoryOrder(category: Category) {
    setEditingCategoryOrder(category.id)
    setEditCategoryOrder(category.order_index.toString())
  }

  async function updateSubcategoryOrder(id: string, newOrder: string) {
    const orderValue = newOrder.trim() === '' ? 0 : parseInt(newOrder, 10)
    
    if (isNaN(orderValue)) {
      setEditingSubcategoryOrder(null)
      setEditSubcategoryOrder('')
      return
    }
    
    const { error } = await supabase
      .from('subcategories')
      .update({ order_index: orderValue })
      .eq('id', id)
    
    if (error) {
      alert('Error updating order: ' + error.message)
    } else {
      setEditingSubcategoryOrder(null)
      setEditSubcategoryOrder('')
      loadData()
    }
  }

  function startEditSubcategoryOrder(subcategory: Subcategory) {
    setEditingSubcategoryOrder(subcategory.id)
    setEditSubcategoryOrder(subcategory.order_index.toString())
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Categories & Subcategories</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Categories</h2>
            
            <div className="flex gap-2 mb-6">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                onKeyPress={(e) => e.key === 'Enter' && createCategory()}
              />
              <Button onClick={createCategory}>Add</Button>
            </div>

            <div className="space-y-2">
              {categories.map(category => (
                <div 
                  key={category.id} 
                  className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
                >
                  {editingCategory === category.id ? (
                    <div className="flex gap-2 flex-1">
                      <Input
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && updateCategory(category.id)}
                      />
                      <Button size="sm" onClick={() => updateCategory(category.id)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        {editingCategoryOrder === category.id ? (
                          <Input
                            type="number"
                            value={editCategoryOrder}
                            onChange={(e) => setEditCategoryOrder(e.target.value)}
                            className="w-16"
                            onBlur={() => updateCategoryOrder(category.id, editCategoryOrder)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                updateCategoryOrder(category.id, editCategoryOrder)
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="text-xs text-gray-500 cursor-pointer hover:text-gray-400"
                            onClick={() => startEditCategoryOrder(category)}
                          >
                            [{category.order_index}]
                          </span>
                        )}
                        <span className="text-white">{category.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-500">
                          {subcategories.filter(s => s.category_id === category.id).length} subs
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startEditCategory(category)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteCategory(category.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {categories.length === 0 && (
                <p className="text-gray-500 text-center py-8">No categories yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Subcategories Section */}
        <div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Subcategories</h2>
            
            <div className="space-y-2 mb-6">
              <select
                value={selectedCategoryForSub}
                onChange={(e) => setSelectedCategoryForSub(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white"
              >
                <option value="">Select parent category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              
              <div className="flex gap-2">
                <Input
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  placeholder="New subcategory name"
                  disabled={!selectedCategoryForSub}
                  onKeyPress={(e) => e.key === 'Enter' && createSubcategory()}
                />
                <Button 
                  onClick={createSubcategory}
                  disabled={!selectedCategoryForSub}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {categories.map(category => {
                const categorySubs = subcategories.filter(s => s.category_id === category.id)
                if (categorySubs.length === 0) return null
                
                return (
                  <div key={category.id} className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">{category.name}</h3>
                    {categorySubs.map(sub => (
                      <div 
                        key={sub.id}
                        className="flex items-center justify-between bg-gray-800 rounded-lg p-3 mb-2"
                      >
                        {editingSubcategory === sub.id ? (
                          <div className="flex gap-2 flex-1">
                            <Input
                              value={editSubcategoryName}
                              onChange={(e) => setEditSubcategoryName(e.target.value)}
                              className="flex-1"
                              onKeyPress={(e) => e.key === 'Enter' && updateSubcategory(sub.id)}
                            />
                            <Button size="sm" onClick={() => updateSubcategory(sub.id)}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingSubcategory(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 flex-1">
                              {editingSubcategoryOrder === sub.id ? (
                                <Input
                                  type="number"
                                  value={editSubcategoryOrder}
                                  onChange={(e) => setEditSubcategoryOrder(e.target.value)}
                                  className="w-16"
                                  onBlur={() => updateSubcategoryOrder(sub.id, editSubcategoryOrder)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      updateSubcategoryOrder(sub.id, editSubcategoryOrder)
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <span 
                                  className="text-xs text-gray-500 cursor-pointer hover:text-gray-400"
                                  onClick={() => startEditSubcategoryOrder(sub)}
                                >
                                  [{sub.order_index}]
                                </span>
                              )}
                              <span className="text-white text-sm">{sub.name}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => startEditSubcategory(sub)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deleteSubcategory(sub.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
              
              {subcategories.length === 0 && (
                <p className="text-gray-500 text-center py-8">No subcategories yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

