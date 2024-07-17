"use client";

import { FC } from "react";
// import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationControlsProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalEntries: number;
  numRowSelected: number;
  setPageIndex: Function;
  setPageSize: Function;
}

const PaginationControls: FC<PaginationControlsProps> = ({
  pageIndex,
  pageSize,
  pageCount,
  totalEntries,
  numRowSelected,
  setPageIndex,
  setPageSize,
}) => {
  // const router = useRouter();
  // const searchParams = useSearchParams();

  // const page = searchParams.get('page') ?? '1';
  // const per_page = searchParams.get('per_page') ?? '5';
  const displayNumRows =
    pageIndex === pageCount ? parseInt(totalEntries % pageSize) : pageSize;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="mr-3 flex-1 text-sm text-muted-foreground">
        {numRowSelected} of {displayNumRows} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPageIndex(1);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((prePageSize) => (
                <SelectItem key={prePageSize} value={`${prePageSize}`}>
                  {prePageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {pageIndex} of {pageCount}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setPageIndex(1)}
            disabled={pageIndex < 2}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPageIndex(pageIndex - 1)}
            disabled={pageIndex < 2}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPageIndex(pageIndex + 1)}
            disabled={pageIndex > pageCount - 1}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setPageIndex(pageCount)}
            disabled={pageIndex > pageCount - 1}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;
