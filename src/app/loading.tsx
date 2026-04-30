import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-navy-500" />
        <span className="text-sm text-navy-500">불러오는 중...</span>
      </div>
    </div>
  );
}
