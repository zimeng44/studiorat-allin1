"use client";

import { FC } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  pageCount: number;
  totalEntries: number;
}

const PaginationControls: FC<PaginationControlsProps> = ({
  pageCount,
  totalEntries,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pageIndex = searchParams.get("page") ?? "1";
  const pageSize = searchParams.get("pageSize") ?? "10";
  const numRowsSelected = searchParams.get("numRowsSelected") ?? "0";

  const pageSizeInt =  parseInt(pageSize);

  const displayNumRows =
    pageCount === 1
      ? totalEntries
      : parseInt(pageIndex) === pageCount
        ? parseInt(`${totalEntries % pageSizeInt}`)
        : parseInt(pageSize);

  const createPageURL = (
    pageNumber: number | string,
    newPageSize: number | string,
  ) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    params.set("pageSize", newPageSize.toString());
    return `${pathname}?${params.toString()}`;
  };

  // console.log(pageCount);

  return (
    <div className="flex items-center justify-between px-2">
      <div className="mr-3 flex-1 text-sm text-muted-foreground">
        {numRowsSelected} of {displayNumRows} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => router.push(createPageURL(1, value))}
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
            onClick={() =>
              router.push(createPageURL(1, pageSize), { scroll: false })
            }
            disabled={parseInt(pageIndex) < 2}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() =>
              router.push(createPageURL(parseInt(pageIndex) - 1, pageSize), {
                scroll: false,
              })
            }
            disabled={parseInt(pageIndex) < 2}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() =>
              router.push(createPageURL(parseInt(pageIndex) + 1, pageSize), {
                scroll: false,
              })
            }
            disabled={parseInt(pageIndex) > pageCount - 1}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() =>
              router.push(createPageURL(pageCount, pageSize), { scroll: false })
            }
            disabled={parseInt(pageIndex) > pageCount - 1}
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
