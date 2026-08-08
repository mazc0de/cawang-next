"use client";
import { useState } from 'react'
import { Plus, Tags, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardCard, DashboardCardContent } from '@/components/shared/DashboardCard'

import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import type { Category } from '@/types/domain'
import { CategoryIcon } from '@/components/shared/CategoryIcon'

const AVAILABLE_ICONS = [
  'ShoppingBag', 'ShoppingCart', 'Utensils', 'Coffee', 'Car', 'Plane', 'Train',
  'Home', 'Wrench', 'Lightbulb', 'Smartphone', 'Laptop', 'Gamepad2', 'Music',
  'Briefcase', 'BookOpen', 'GraduationCap', 'HeartPulse', 'Stethoscope',
  'PiggyBank', 'Wallet', 'CreditCard', 'Banknote', 'TrendingUp', 'TrendingDown',
  'ArrowRightLeft', 'Gift', 'Baby', 'Dog', 'Cat', 'Shirt', 'Camera', 'Smile'
]

export function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [showForm, setShowForm] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [activeTab, setActiveTab] = useState<'inflow' | 'outflow'>('outflow')
  
  const [formName, setFormName] = useState('')
  const [formIcon, setFormIcon] = useState('ShoppingBag')
  const [formType, setFormType] = useState<'inflow' | 'outflow'>('outflow')

  const inflowCategories = categories.filter(c => c.type === 'inflow')
  const outflowCategories = categories.filter(c => c.type === 'outflow')

  const handleOpenAdd = (type: 'inflow' | 'outflow') => {
    setEditCategory(null)
    setFormName('')
    setFormIcon(type === 'inflow' ? 'Wallet' : 'ShoppingBag')
    setFormType(type)
    setShowForm(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditCategory(category)
    setFormName(category.name)
    setFormIcon(category.icon ?? (category.type === 'inflow' ? 'Wallet' : 'ShoppingBag'))
    setFormType(category.type)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formName.trim()) return
    
    if (editCategory) {
      await updateCategory.mutateAsync({
        id: editCategory.id,
        name: formName.trim(),
        icon: formIcon.trim() || undefined,
        type: formType,
      })
    } else {
      await createCategory.mutateAsync({
        name: formName.trim(),
        icon: formIcon.trim() || undefined,
        type: formType,
      })
    }
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus kategori ini? Transaksi yang menggunakan kategori ini mungkin akan terpengaruh.')) {
      try {
        await deleteCategory.mutateAsync(id)
      } catch (error: any) {
        if (error?.code === '23503') {
          alert('Tidak dapat menghapus kategori ini karena sedang digunakan oleh transaksi atau budget. Silakan ubah atau hapus transaksi/budget terkait terlebih dahulu.')
        } else {
          alert(error?.message || 'Terjadi kesalahan saat menghapus kategori.')
        }
      }
    }
  }

  const renderCategoryList = (list: Category[], type: 'inflow' | 'outflow') => {
    if (isLoading) {
      return <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
    }
    
    if (list.length === 0) {
      return (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
          <Tags className="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-50" />
          <p className="text-sm font-medium text-muted-foreground">Belum ada kategori</p>
          <Button variant="link" size="sm" onClick={() => handleOpenAdd(type)} className="mt-1">
            Tambah kategori pertama →
          </Button>
        </div>
      )
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {list.map(category => (
          <DashboardCard key={category.id} className="group hover:border-slate-300 transition-colors cursor-pointer bg-white">
            <DashboardCardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  category.type === 'inflow' ? 'bg-[#f0fbf7] text-[#4cb791]' : 'bg-[#fff5f5] text-[#e65c5c]'
                }`}>
                  <CategoryIcon icon={category.icon} className="h-5 w-5" />
                </div>
                <p className="font-semibold text-sm truncate text-slate-800" title={category.name}>{category.name}</p>
              </div>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full" onClick={() => handleOpenEdit(category)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </DashboardCardContent>
          </DashboardCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-svh">


      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <DashboardHeader title="Manajemen Kategori" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Kategori Transaksi</h2>
            <p className="text-sm text-slate-500 mt-1">Kelola kategori untuk pemasukan dan pengeluaran Anda.</p>
          </div>
          <Button onClick={() => handleOpenAdd(activeTab)} className="gap-2 bg-[#8ab4f8] hover:bg-[#739ce3] text-white rounded-full px-5 shadow-none h-9">
            <Plus className="h-4 w-4" /> Tambah Kategori
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'inflow' | 'outflow')} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="outflow" className="px-6">Pengeluaran ({outflowCategories.length})</TabsTrigger>
            <TabsTrigger value="inflow" className="px-6">Pemasukan ({inflowCategories.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="outflow" className="mt-0">
            {renderCategoryList(outflowCategories, 'outflow')}
          </TabsContent>
          <TabsContent value="inflow" className="mt-0">
            {renderCategoryList(inflowCategories, 'inflow')}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editCategory ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
            <DialogDescription>
              Tentukan tipe, nama, dan ikon untuk kategori.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Tipe Kategori</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formType === 'outflow' ? 'default' : 'outline'}
                  className={formType === 'outflow' ? 'bg-[#e65c5c] text-white hover:bg-[#d44c4c]' : ''}
                  onClick={() => setFormType('outflow')}
                >
                  Pengeluaran
                </Button>
                <Button
                  type="button"
                  variant={formType === 'inflow' ? 'default' : 'outline'}
                  className={formType === 'inflow' ? 'bg-[#4cb791] text-white hover:bg-[#3da37e]' : ''}
                  onClick={() => setFormType('inflow')}
                >
                  Pemasukan
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ikon Kategori</Label>
              <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 border rounded-md">
                {AVAILABLE_ICONS.map(iconName => (
                  <Button
                    key={iconName}
                    type="button"
                    variant={formIcon === iconName ? 'default' : 'ghost'}
                    size="icon"
                    className={`rounded-md w-full h-10 ${formIcon === iconName ? 'bg-slate-800 text-white hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
                    onClick={() => setFormIcon(iconName)}
                  >
                    <CategoryIcon icon={iconName} className="h-5 w-5" />
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category-name">Nama Kategori</Label>
              <Input 
                id="category-name" 
                value={formName} 
                onChange={e => setFormName(e.target.value)} 
                placeholder="Misal: Makanan, Gaji, Transportasi" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={!formName.trim() || createCategory.isPending || updateCategory.isPending}>
              {createCategory.isPending || updateCategory.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
