
import Link from 'next/link'
import { getCategories } from '@/app/actions/categories'
import { getProduct } from '@/app/actions/seller-products'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import ProductForm from '../../create/product-form'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const [categories, product] = await Promise.all([
    getCategories(),
    getProduct(id)
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <Button variant="ghost" asChild className="pl-0">
          <Link href="/dashboard/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Produk
          </Link>
       </Button>

       <ProductForm categories={categories} initialData={product} />
    </div>
  )
}
