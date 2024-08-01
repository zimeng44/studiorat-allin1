"use client";
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  deleteItemAction,
  updateItemAction,
} from "@/data/actions/inventory-actions";
import { InventoryItem } from "@/data/definitions";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SubmitButton } from "../custom/SubmitButton";

const INITIAL_STATE = {
  strapiErrors: null,
  data: null,
  message: null,
};

const mTechBarcode = z.union([
  z.string().min(12).and(z.string().max(13)),
  z.string().length(0),
]);

const formSchema = z.object({
  // username: z.string().min(2).max(50),
  mTechBarcode: z.string().min(12).and(z.string().max(13)),
  make: z.string().min(2),
  model: z.string().min(2),
  category: z.string(),
  description: z.string(),
  accessories: z.string(),
  storageLocation: z.string(),
  comments: z.string(),
  out: z.boolean(),
  broken: z.boolean(),
});

const EditItemForm = ({
  itemId,
  item,
}: {
  itemId: string;
  item: InventoryItem;
}) => {
  // console.log("Item Details Render!!");
  const router = useRouter();
  // const deleteSummaryById = deleteInventoryItemAction.bind(null, itemId);

  // const [deleteState, deleteAction] = useFormState(
  //   deleteSummaryById,
  //   INITIAL_STATE,
  // );

  // const [updateState, updateAction] = useFormState(
  //   updateInventoryItemAction,
  //   INITIAL_STATE,
  // );

  // const [data, setData] = useState(item);
  // const [currentRowId, setCurrentRowId] = useState(itemId);
  // const data = item;

  // console.log(itemId);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mTechBarcode: item.mTechBarcode,
      make: item.make,
      model: item.model,
      category: item.category,
      description: item.description,
      accessories: item.accessories,
      storageLocation: item.storageLocation,
      comments: item.comments,
      out: item.out,
      broken: item.broken,
    },
  });
  // if (isLoading) return <p>Loading...</p>;
  // if (!data) return <p>No profile data</p>;

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    // updateAction(updatedData);

    updateItemAction(values, itemId);
    router.refresh();
    toast.success("Item Saved.");

    // closeDetail();
    // console.log("Form Submitted!!");
    // setDialogOpen(false);
  }

  function handleDelete(e: any) {
    const confirm = window.confirm(
      "Are you sure you want to delete this item?",
    );

    if (!confirm) return;

    const res = deleteItemAction(itemId);

    if (!res) toast.success("Item Deleted");

    // if ((totalEntries - 1) % pageSize === 0) {
    //   setPageIndex((pageIndex) => pageIndex - 1);
    // }
    // console.log("Item Deleted!!!!!!!!!!!!!");
    // closeDetail();
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4"
        >
          <FormField
            control={form.control}
            name="mTechBarcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MTech Barcode</FormLabel>
                <FormControl>
                  <Input placeholder={"MTech Barcode Here"} {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accessories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accessories</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="storageLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Storage Location</FormLabel>
                {/* <FormControl>
                <Input {...field}></Input>
              </FormControl> */}
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select A Storage Location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Floor 8">Floor 8</SelectItem>
                    <SelectItem value="Floor 6">Floor 6</SelectItem>
                    <SelectItem value="Studio G">Studio G</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comments</FormLabel>
                <FormControl>
                  <Input {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-1 flex gap-10 bg-slate-300">
            <FormField
              control={form.control}
              name="out"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="ml-2 align-bottom">Out</FormLabel>
                  <FormControl>
                    <Checkbox
                      className="ml-2 align-middle"
                      disabled
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="broken"
              render={({ field }) => (
                <FormItem className="mb-1">
                  <FormLabel className="ml-1">Broken</FormLabel>
                  <FormControl>
                    {/* <Input placeholder={"Broken"} {...field}></Input> */}
                    <Checkbox
                      className="ml-2"
                      disabled
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-1 grid grid-cols-subgrid gap-4"></div>

          {/* <Button className="align-right" type="submit">
            Save
          </Button> */}
          <SubmitButton
            text="Save"
            loadingText="Saving"
            loading={form.formState.isSubmitting}
          />
          <div className="ml-10 flex space-x-5">
            <Button
              type="button"
              variant="destructive"
              onClick={(e) => handleDelete(e)}
            >
              Delete
            </Button>
            <Link href="/dashboard/master-inventory">
              <Button
                className="hover:bg-slate-200 active:bg-slate-300"
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditItemForm;
