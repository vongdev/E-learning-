import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "./card"

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 bg-slate-100 dark:bg-slate-800">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="p-5">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-6" />
        
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between mb-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>

        <Skeleton className="h-10 w-full mt-5" />
      </CardContent>
    </Card>
  )
}