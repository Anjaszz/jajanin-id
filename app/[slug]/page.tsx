
import { getShopBySlug, getShopProductsByCategory } from '@/app/actions/public-shop'
import { notFound } from 'next/navigation'
import ShopClient from './shop-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ShopPage({ params }: PageProps) {
  const { slug } = await params
  const shop = await getShopBySlug(slug)

  if (!shop) {
    notFound()
  }

  const categories = await getShopProductsByCategory(shop.id)

  return (
    <ShopClient shop={shop as any} categories={categories as any} />
  )
}
