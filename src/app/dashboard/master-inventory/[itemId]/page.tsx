import EditItemForm from "@/components/forms/EditItemForm";
import { getInventoryItemById } from "@/data/loaders";

interface ParamsProps {
  params: {
    itemId: string;
  };
}

export default async function SummaryCardRoute({
  params,
}: Readonly<ParamsProps>) {
  // console.log(params);
  const data = await getInventoryItemById(params.itemId);

  return (
    <div className="p-5">
      <h1 className="px-2 py-2 text-lg font-bold">Edit Item</h1>
      <div className="flex items-center px-4">
        <EditItemForm item={data} itemId={params.itemId} />
      </div>
    </div>
  );
}
