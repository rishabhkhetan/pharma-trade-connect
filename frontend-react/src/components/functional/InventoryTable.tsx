import GlassCard from "../ui/GlassCard";

// Define type for each inventory item
export interface InventoryItem {
  id: number;
  name: string;
  stock: number;
  status: string; // e.g., "LOW STOCK", "IN STOCK", "OUT OF STOCK"
}

interface InventoryTableProps {
  items: InventoryItem[]; // List of items coming from AdminInventory
}

export default function InventoryTable({ items }: InventoryTableProps) {
  return (
    <GlassCard>
      <h3 className="text-xl font-semibold mb-4">Inventory Items</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="py-2">Item</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  No inventory items found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-gray-800">
                  <td className="py-3">{item.name}</td>
                  <td>{item.stock}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold text-black 
                        ${
                          item.status === "LOW STOCK"
                            ? "bg-yellow-400"
                            : item.status === "OUT OF STOCK"
                            ? "bg-red-400"
                            : "bg-green-400"
                        }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
