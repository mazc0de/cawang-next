"use client";
import { useState } from 'react';
import { Plus, Tags, Pencil, Trash2, ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import type { Category } from '@/types/domain';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { useCategoriesContext } from '@/contexts/CategoriesContext';
import { cn } from '@/lib/utils';

const AVAILABLE_ICONS = [
  'ShoppingBag', 'ShoppingCart', 'Utensils', 'Coffee', 'Car', 'Plane', 'Train',
  'Home', 'Wrench', 'Lightbulb', 'Smartphone', 'Laptop', 'Gamepad2', 'Music',
  'Briefcase', 'BookOpen', 'GraduationCap', 'HeartPulse', 'Stethoscope',
  'PiggyBank', 'Wallet', 'CreditCard', 'Banknote', 'TrendingUp', 'TrendingDown',
  'ArrowRightLeft', 'Gift', 'Baby', 'Dog', 'Cat', 'Shirt', 'Camera', 'Smile'
];

export function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const categoriesContext = useCategoriesContext();
  const [localShowForm, setLocalShowForm] = useState(false);
  const [localEditCategory, setLocalEditCategory] = useState<Category | null>(null);

  const showForm = categoriesContext?.showForm ?? localShowForm;
  const setShowForm = categoriesContext?.setShowForm ?? setLocalShowForm;
  const editCategory = categoriesContext?.editCategory ?? localEditCategory;
  const setEditCategory = categoriesContext?.setEditCategory ?? setLocalEditCategory;

  const [activeTab, setActiveTab] = useState<'outflow' | 'inflow'>('outflow');
  
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('ShoppingBag');
  const [formType, setFormType] = useState<'inflow' | 'outflow'>('outflow');

  const inflowCategories = categories.filter((c) => c.type === 'inflow');
  const outflowCategories = categories.filter((c) => c.type === 'outflow');

  const handleOpenAdd = (type: 'inflow' | 'outflow' = activeTab) => {
    setEditCategory(null);
    setFormName('');
    setFormIcon(type === 'inflow' ? 'Wallet' : 'ShoppingBag');
    setFormType(type);
    setShowForm(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditCategory(category);
    setFormName(category.name);
    setFormIcon(category.icon ?? (category.type === 'inflow' ? 'Wallet' : 'ShoppingBag'));
    setFormType(category.type);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    
    if (editCategory) {
      await updateCategory.mutateAsync({
        id: editCategory.id,
        name: formName.trim(),
        icon: formIcon.trim() || undefined,
        type: formType,
      });
    } else {
      await createCategory.mutateAsync({
        name: formName.trim(),
        icon: formIcon.trim() || undefined,
        type: formType,
      });
    }
    setShowForm(false);
    setFormName('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus kategori ini? Transaksi yang menggunakan kategori ini mungkin akan terpengaruh.')) {
      try {
        await deleteCategory.mutateAsync(id);
      } catch (error: any) {
        if (error?.code === '23503') {
          alert('Tidak dapat menghapus kategori ini karena sedang digunakan oleh transaksi atau budget. Silakan ubah atau hapus transaksi/budget terkait terlebih dahulu.');
        } else {
          alert(error?.message || 'Terjadi kesalahan saat menghapus kategori.');
        }
      }
    }
  };

  const renderCategoryList = (list: Category[], type: 'inflow' | 'outflow') => {
    if (isLoading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-20 w-full bg-canvas animate-pulse rounded-[16px] border-2 border-ink/10" />
          ))}
        </div>
      );
    }
    
    if (list.length === 0) {
      return (
        <div className="text-center py-16 px-4 rounded-[18px] bg-canvas border-2 border-dashed border-ink/20 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-[14px] bg-canary border-2 border-ink shadow-hard-sm flex items-center justify-center mb-3">
            <Tags className="h-7 w-7 text-ink" strokeWidth={2.5} />
          </div>
          <p className="font-archivo-black text-base text-ink">Belum Ada Kategori {type === 'outflow' ? 'Pengeluaran' : 'Pemasukan'}</p>
          <p className="font-space-grotesk text-xs text-ink/70 mt-0.5 mb-5">Tambahkan kategori untuk mengelompokkan catatan transaksi Anda.</p>
          <button
            onClick={() => handleOpenAdd(type)}
            className="btn-neubrutalism bg-hot-pink text-white px-5 py-2 text-xs font-space-grotesk flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" strokeWidth={3} />
            Tambah Kategori {type === 'outflow' ? 'Pengeluaran' : 'Pemasukan'}
          </button>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {list.map((category) => (
          <div
            key={category.id}
            className="card-neubrutalism bg-white p-4 flex items-center justify-between group hover:-translate-y-1 transition-transform"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  'w-11 h-11 rounded-[14px] border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0 text-ink',
                  category.type === 'inflow' ? 'bg-mint' : 'bg-coral'
                )}
              >
                <CategoryIcon icon={category.icon} defaultEmoji="📦" className="h-5 w-5 text-ink" />
              </div>
              <div className="min-w-0">
                <p className="font-archivo-black text-sm text-ink truncate" title={category.name}>
                  {category.name}
                </p>
                <span className="font-space-mono text-[10px] font-bold text-ink/60 capitalize">
                  {category.type === 'inflow' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                className="w-7 h-7 rounded-full border border-ink hover:bg-canvas flex items-center justify-center text-ink transition-colors cursor-pointer shadow-[1px_1px_0px_0px_#111]"
                onClick={() => handleOpenEdit(category)}
                title="Edit Kategori"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
              <button
                className="w-7 h-7 rounded-full border border-ink hover:bg-coral hover:text-white flex items-center justify-center text-ink transition-colors cursor-pointer shadow-[1px_1px_0px_0px_#111]"
                onClick={() => handleDelete(category.id)}
                title="Hapus Kategori"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto w-full">
      {/* 1. TOP KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card-neubrutalism bg-white p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-[14px] bg-coral border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
            <ArrowDownRight className="h-6 w-6 text-ink" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">Kategori Pengeluaran</p>
            <p className="font-archivo-black text-2xl text-ink tracking-tight truncate mt-0.5">
              {outflowCategories.length} Kategori
            </p>
          </div>
        </div>

        <div className="card-neubrutalism bg-white p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-[14px] bg-mint border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
            <ArrowUpRight className="h-6 w-6 text-ink" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">Kategori Pemasukan</p>
            <p className="font-archivo-black text-2xl text-ink tracking-tight truncate mt-0.5">
              {inflowCategories.length} Kategori
            </p>
          </div>
        </div>

        <div className="card-neubrutalism bg-canary p-5 flex items-center gap-4 group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-[14px] bg-white border-2 border-ink shadow-hard-sm flex items-center justify-center shrink-0">
            <Tags className="h-6 w-6 text-ink" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="font-space-grotesk font-bold text-xs uppercase tracking-wider text-ink/70">Total Semua Kategori</p>
            <p className="font-archivo-black text-2xl text-ink tracking-tight truncate mt-0.5">
              {categories.length} Kategori
            </p>
          </div>
        </div>
      </div>

      {/* 2. CATEGORIES TABS & LIST */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'inflow' | 'outflow')} className="w-full space-y-6">
        <div className="flex items-center justify-start">
          <TabsList id="tab-categories-list">
            <TabsTrigger value="outflow" id="tab-outflow-categories">
              Pengeluaran ({outflowCategories.length})
            </TabsTrigger>
            <TabsTrigger value="inflow" id="tab-inflow-categories">
              Pemasukan ({inflowCategories.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="outflow" className="mt-0">
          {renderCategoryList(outflowCategories, 'outflow')}
        </TabsContent>
        <TabsContent value="inflow" className="mt-0">
          {renderCategoryList(inflowCategories, 'inflow')}
        </TabsContent>
      </Tabs>

      {/* 3. ADD / EDIT CATEGORY DIALOG */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md" id="category-form-dialog">
          <DialogHeader>
            <DialogTitle>{editCategory ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
            <DialogDescription>
              Tentukan tipe alokasi, nama kategori, dan ikon representatif.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink">Tipe Kategori</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={cn(
                    'h-10 rounded-[12px] border-2 border-ink font-space-grotesk font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_#111] cursor-pointer',
                    formType === 'outflow' ? 'bg-coral text-ink' : 'bg-white text-ink/70 hover:bg-canvas'
                  )}
                  onClick={() => setFormType('outflow')}
                >
                  <ArrowDownRight className="h-4 w-4" strokeWidth={2.5} />
                  Pengeluaran
                </button>
                <button
                  type="button"
                  className={cn(
                    'h-10 rounded-[12px] border-2 border-ink font-space-grotesk font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_#111] cursor-pointer',
                    formType === 'inflow' ? 'bg-mint text-ink' : 'bg-white text-ink/70 hover:bg-canvas'
                  )}
                  onClick={() => setFormType('inflow')}
                >
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                  Pemasukan
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink">Ikon Kategori</Label>
              <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-canvas rounded-[14px] border-2 border-ink shadow-hard-sm">
                {AVAILABLE_ICONS.map((iconName) => {
                  const isSelected = formIcon === iconName;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      className={cn(
                        'w-full h-10 rounded-[10px] border-2 border-ink flex items-center justify-center transition-all cursor-pointer shadow-[1px_1px_0px_0px_#111]',
                        isSelected ? 'bg-canary scale-105 ring-2 ring-ink' : 'bg-white hover:bg-canvas text-ink'
                      )}
                      onClick={() => setFormIcon(iconName)}
                    >
                      <CategoryIcon icon={iconName} className="h-5 w-5 text-ink" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-name" className="text-xs font-space-grotesk font-bold uppercase tracking-wider text-ink">
                Nama Kategori
              </Label>
              <Input
                id="category-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Misal: Makanan, Gaji, Transportasi, Hiburan"
                className="font-space-grotesk text-sm font-medium"
              />
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3">
              <button
                type="button"
                className="btn-neubrutalism bg-white text-ink px-5 py-2 text-xs font-space-grotesk flex-1 sm:flex-none"
                onClick={() => setShowForm(false)}
              >
                Batal
              </button>
              <button
                id="btn-save-category"
                className="btn-neubrutalism bg-hot-pink text-white px-5 py-2 text-xs font-space-grotesk flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formName.trim() || createCategory.isPending || updateCategory.isPending}
                onClick={handleSave}
              >
                {createCategory.isPending || updateCategory.isPending ? 'Menyimpan…' : 'Simpan Kategori'}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

