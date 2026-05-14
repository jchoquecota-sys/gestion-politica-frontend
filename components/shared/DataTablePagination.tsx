import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationMeta } from "@/types/pagination";

interface DataTablePaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({
  meta,
  onPageChange,
}: DataTablePaginationProps) {
  const { current_page, last_page, total } = meta;

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex-1 text-sm text-slate-500 dark:text-slate-400">
        Total: <span className="font-medium text-slate-900 dark:text-slate-100">{total}</span> registros
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center justify-center text-sm font-medium dark:text-slate-100">
          Página {current_page} de {last_page}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex dark:border-slate-800 dark:hover:bg-slate-900"
            onClick={() => onPageChange(1)}
            disabled={current_page === 1}
          >
            <span className="sr-only">Ir a la primera página</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 dark:border-slate-800 dark:hover:bg-slate-900"
            onClick={() => onPageChange(current_page - 1)}
            disabled={current_page === 1}
          >
            <span className="sr-only">Ir a la página anterior</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 dark:border-slate-800 dark:hover:bg-slate-900"
            onClick={() => onPageChange(current_page + 1)}
            disabled={current_page === last_page}
          >
            <span className="sr-only">Ir a la página siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex dark:border-slate-800 dark:hover:bg-slate-900"
            onClick={() => onPageChange(last_page)}
            disabled={current_page === last_page}
          >
            <span className="sr-only">Ir a la última página</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
