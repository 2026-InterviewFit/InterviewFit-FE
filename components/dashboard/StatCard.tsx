interface StatCardProps {
  title: string;
  value: string;
}

export default function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">

      <p className="text-sm text-neutral-500">
        {title}
      </p>

      <h3 className="mt-4 text-5xl font-semibold tracking-tight">
        {value}
      </h3>

    </div>
  );
}