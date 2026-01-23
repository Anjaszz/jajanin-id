
import { getAllCategoriesAdmin } from '@/app/actions/categories'
import { Card, CardContent } from '@/components/ui/card'
import { Tag, Clock, Search } from 'lucide-react'
import { AddCategoryDialog } from '@/components/admin/categories/add-category-dialog'
import { EditCategoryDialog } from '@/components/admin/categories/edit-category-dialog'
import { DeleteCategoryButton } from '@/components/admin/categories/delete-category-button'

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesAdmin()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 capitalize">
             Master <span className="text-blue-600">Kategori</span>
          </h1>
          <p className="text-muted-foreground text-lg">Kelola daftar kategori produk global (berlaku untuk seluruh toko).</p>
        </div>

        <AddCategoryDialog />
      </div>

      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md rounded-[32px] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Kategori</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal Dibuat</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            <Tag className="h-5 w-5" />
                          </div>
                          <span className="font-bold text-slate-900 text-base">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-xs font-bold">{new Date(category.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <EditCategoryDialog category={category} />
                          <DeleteCategoryButton id={category.id} name={category.name} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-24 text-center">
                       <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                          <Tag className="h-10 w-10 text-slate-400" />
                       </div>
                       <h3 className="text-2xl font-bold text-slate-400">Belum Ada Kategori</h3>
                       <p className="text-muted-foreground mt-2 max-w-xs mx-auto text-sm">Belum ada kategori global yang dibuat oleh Admin.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 px-2 italic">
          <span>YukJajan Platform categories control</span>
          <span>{categories.length} global entries</span>
      </div>
    </div>
  )
}
