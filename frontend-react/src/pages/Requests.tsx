import React from "react";

interface RequestItem {
  id: number;
  name: string;
  licenseNumber: string;
  status?: string;
}

export default function Requests() {
  // Later this will come from backend API
  const pendingRequests: RequestItem[] = [
    { id: 1, name: "DATA FROM API", licenseNumber: "DATA FROM API", status: "PENDING" },
    { id: 2, name: "DATA FROM API", licenseNumber: "DATA FROM API", status: "PENDING" },
    { id: 3, name: "DATA FROM API", licenseNumber: "DATA FROM API", status: "PENDING" },
  ];

  const approvedRequests: RequestItem[] = [
    { id: 4, name: "DATA FROM API", licenseNumber: "DATA FROM API" },
    { id: 5, name: "DATA FROM API", licenseNumber: "DATA FROM API" },
    { id: 6, name: "DATA FROM API", licenseNumber: "DATA FROM API" },
  ];

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Requests</h1>

      {/* ------------- Pending Requests ------------- */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-purple-500 mb-4">Pending Requests</h2>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">License Number</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {pendingRequests.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">{item.licenseNumber}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs bg-red-400 font-bold text-black">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------- Approved Requests ------------- */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-purple-500 mb-4">Approved Requests</h2>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">License Number</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {approvedRequests.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">{item.licenseNumber}</td>
                  <td className="px-6 py-4">
                    <button className="px-4 py-2 text-sm font-bold bg-red-500 text-white rounded-md hover:bg-red-600 active:scale-95 transition">
                      REVOKE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
