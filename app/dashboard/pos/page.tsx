import { getPosProducts } from "@/app/actions/pos"
import PosClient from "./pos-client"
import { getSystemSettings } from "@/app/actions/system-settings"

export default async function PosPage() {
    // Fetch all active products variants and addons
    const { data: products } = await getPosProducts(1, 1000)
    const settings = await getSystemSettings()
    
    // Filter only active products
    const activeProducts = products.filter((p: any) => p.is_active)

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] space-y-2">
             <div className="shrink-0">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Kasir <span className="text-primary italic">Cepat</span></h1>
                <p className="text-slate-500 text-xs font-medium">Mode point of sale untuk transaksi langsung.</p>
             </div>
             
             <div className="flex-1 min-h-0 pb-4">
                <PosClient products={activeProducts as any[]} settings={settings} />
             </div>
        </div>
    )
}
