
import { getShopBySlug } from '@/app/actions/public-shop'
import { notFound } from 'next/navigation'
import CheckoutClient from './checkout-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

import Script from 'next/script'

export default async function CheckoutPage({ params }: PageProps) {
  const { slug } = await params
  const shop = await getShopBySlug(slug)

  if (!shop) {
    notFound()
  }

  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

  return (
    <>
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={clientKey}
        strategy="beforeInteractive"
      />
      <CheckoutClient shop={shop as any} />
    </>
  )
}
