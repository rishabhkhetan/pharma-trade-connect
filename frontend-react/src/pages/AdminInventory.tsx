import AnimatedContainer from "../components/ui/AnimatedContainer";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import InventoryTable from "../components/functional/InventoryTable";
import type { InventoryItem } from "../components/functional/InventoryTable";
import Skeleton from "../components/ui/Skeleton";

export default function AdminInventory() {
  const loading = false;

  // Mock inventory data (replace later with API)
  const items: InventoryItem[] = [
    { id: 1, name: "Paracetamol 650mg", stock: 120, status: "IN STOCK" },
    { id: 2, name: "Azithromycin 500mg", stock: 12, status: "LOW STOCK" },
    { id: 3, name: "Cough Syrup", stock: 0, status: "OUT OF STOCK" },
  ];

  return (
    <AnimatedContainer>
      <div className="max-w-6xl mx-auto p-8">
        <PageHeader
          title="Inventory Control"
          subtitle="Real-time stock monitoring system"
        />

        {loading ? (
          <Skeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatCard label="Total Items" value={items.length.toString()} />
              <StatCard label="Low Stock" value={items.filter(i => i.status === "LOW STOCK").length.toString()} />
              <StatCard label="Out of Stock" value={items.filter(i => i.status === "OUT OF STOCK").length.toString()} />
            </div>

            <InventoryTable items={items} />
          </>
        )}
      </div>
    </AnimatedContainer>
  );
}
