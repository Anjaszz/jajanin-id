import GuestOrdersClient from "./guest-orders-client"

export default async function GuestOrdersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  return <GuestOrdersClient shopSlug={slug} />
}
