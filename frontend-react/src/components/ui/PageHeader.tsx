type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
        {title}
      </h1>

      {subtitle && (
        <p className="text-gray-400 mt-1 text-sm">
          {subtitle}
        </p>
      )}
    </div>
  );
}
