"use client";
import {
  updateSummaryAction,
  deleteSummaryAction,
} from "@/data/actions/summary-actions";
import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SubmitButton } from "@/components/custom/SubmitButton";
import { DeleteButton } from "@/components/custom/DeleteButton";
import { StrapiErrors } from "../custom/StrapiErrors";

const INITIAL_STATE = {
  strapiErrors: null,
  data: null,
  message: null,
};

export function SummaryCardForm({
  item,
  className,
}: {
  readonly item: any;
  readonly className?: string;
}) {
  const deleteSummaryById = deleteSummaryAction.bind(null, item.id);

  const [deleteState, deleteAction] = useFormState(
    deleteSummaryById,
    INITIAL_STATE,
  );

  const [updateState, updateAction] = useFormState(
    updateSummaryAction,
    INITIAL_STATE,
  );

  return (
    <Card className={cn("relative mb-8 h-auto", className)}>
      <CardHeader>
        <CardTitle>Video Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <form action={updateAction}>
            <Input
              id="title"
              name="title"
              placeholder="Update your title"
              required
              className="mb-4"
              defaultValue={item.title}
            />
            <Textarea
              name="summary"
              className="mb-4 flex h-[calc(100vh-245px)] w-full rounded-md bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 "
              defaultValue={item.summary}
            />
            <input type="hidden" name="id" value={item.id} />
            <SubmitButton
              text="Update Summary"
              loadingText="Updating Summary"
            />
          </form>
          <form action={deleteAction}>
            <DeleteButton className="absolute right-4 top-4 bg-red-700 hover:bg-red-600" />
          </form>
        </div>
      </CardContent>
      <CardFooter>
        <StrapiErrors
          error={deleteState?.strapiErrors || updateState?.strapiErrors}
        />
      </CardFooter>
    </Card>
  );
}
