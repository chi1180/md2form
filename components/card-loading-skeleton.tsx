import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CardLoadingSkeletonProps {
  rows?: number;
}

export function CardLoadingSkeleton({ rows = 3 }: CardLoadingSkeletonProps) {
  return (
    <Card>
      <CardContent className="space-y-3 py-6">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={`card-loading-row-${index + 1}`} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}
