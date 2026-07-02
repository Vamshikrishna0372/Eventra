const SkeletonCard = () => (
  <div className="bg-card rounded-xl shadow-surface overflow-hidden">
    <div className="aspect-video skeleton" />
    <div className="p-5 space-y-3">
      <div className="h-4 skeleton w-3/4" />
      <div className="h-3 skeleton w-1/2" />
      <div className="h-3 skeleton w-2/3" />
      <div className="pt-3 border-t border-border flex justify-between">
        <div className="h-3 skeleton w-20" />
        <div className="h-8 skeleton w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-card rounded-xl shadow-surface overflow-hidden">
    <div className="p-4 border-b border-border">
      <div className="h-4 skeleton w-32" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
        <div className="h-3 skeleton w-1/4" />
        <div className="h-3 skeleton w-1/5" />
        <div className="h-3 skeleton w-1/6" />
        <div className="h-3 skeleton w-1/6" />
      </div>
    ))}
  </div>
);

const SkeletonStat = () => (
  <div className="bg-card rounded-xl shadow-surface p-6">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="h-3 skeleton w-24" />
        <div className="h-8 skeleton w-16" />
      </div>
      <div className="h-10 w-10 skeleton rounded-xl" />
    </div>
  </div>
);

export { SkeletonCard, SkeletonTable, SkeletonStat };
