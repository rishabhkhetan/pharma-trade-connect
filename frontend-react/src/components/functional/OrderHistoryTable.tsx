import GlassCard from "../ui/GlassCard";

export interface OrderItem {
  id: number;
  user: string;
  status: string;
}

interface OrderHistoryTableProps {
  items?: OrderItem[]; // Optional data from API
}

export default function OrderHistoryTable({ items = [] }: OrderHistoryTableProps) {
  return (
    <GlassCard>
      <h3 className="text-xl font-semibold mb-4">Order History</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="py-2">Order ID</th>
              <th>User</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-3 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-gray-800">
                  <td className="py-3">{item.id}</td>
                  <td>{item.user}</td>
                  <td>
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-400 text-black">
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
