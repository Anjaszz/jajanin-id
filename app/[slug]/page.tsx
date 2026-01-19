import { getShopBySlug, getShopProductsByCategory } from '@/app/actions/public-shop'
import { notFound } from 'next/navigation'
import ShopClient from './shop-client'
import { createClient } from '@/utils/supabase/server'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ShopPage({ params }: PageProps) {
  const { slug } = await params
  const contentType = "shop" // Just a dummy var to maintain structure if needed, or simply proceed.
  const shop = await getShopBySlug(slug)

  if (!shop) {
    notFound()
  }

  const categories = await getShopProductsByCategory(shop.id)
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ShopClient shop={shop as any} categories={categories as any} isLoggedIn={!!user} />
  )
}
