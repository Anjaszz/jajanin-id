import { getShopBySlug, getShopProductsByCategory } from '@/app/actions/public-shop'
import { notFound } from 'next/navigation'
import ShopClient from './shop-client'
import { createClient } from '@/utils/supabase/server'
import { getShopRating, getProductRating, getShopReviews, getProductReviews } from '@/app/actions/ratings'

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
  
  // Fetch Shop Rating and Reviews
  const shopRating = await getShopRating(shop.id)
  const shopReviews = await getShopReviews(shop.id)

  // Fetch Product Ratings and Reviews in parallel
  const categoriesWithRatings = await Promise.all(
    categories.map(async (cat: any) => ({
      ...cat,
      products: await Promise.all(cat.products.map(async (prod: any) => {
        const rating = await getProductRating(prod.id)
        const reviews = await getProductReviews(prod.id)
        return {
          ...prod,
          rating: { ...rating, reviews }
        }
      }))
    }))
  )
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ShopClient 
      shop={shop as any} 
      categories={categoriesWithRatings as any} 
      isLoggedIn={!!user} 
      shopRating={{ ...shopRating, reviews: shopReviews }}
    />
  )
}
