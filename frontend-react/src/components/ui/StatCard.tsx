type StatCardProps = {
  label: string;
  value: string | number;
};

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="glass rounded-xl p-5 shadow-md border border-white/10">
      <p className="text-gray-400 text-sm">{label}</p>
      <h2 className="text-2xl font-bold mt-1 text-white">{value}</h2>
    </div>
  );
}
