
import Link from 'next/link'
import { getCategories } from '@/app/actions/categories'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import ProductForm from './product-form'

export default async function CreateProductPage() {
  const categories = await getCategories()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <Button variant="ghost" asChild className="pl-0">
          <Link href="/dashboard/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Produk
          </Link>
       </Button>

       <ProductForm categories={categories} />
    </div>
  )
}
