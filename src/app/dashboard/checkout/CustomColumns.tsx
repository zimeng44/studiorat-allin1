export type ColumnFields = {
  creationTime: string;
  stuIDCheckout: string;
  stuIDCheckin: string;
  studio: string;
  otherLocation: string;
  creationMonitor: string;
  finishMonitor: string;
  finishTime: string;
  notes: string;
  finished: boolean;
  // inventory_items: {};
  // studio_user: {};
};

// const CustomColumns = () => {
//   return (
//     <div>CustomColumns</div>
//   )
// }

export const CustomColumns = [
  {
    accessorKey: "creationTime",
    header: "Creation Time",
    visible: true,
  },
  {
    accessorKey: "stuIDCheckout",
    header: "Checkout ID",
    visible: true,
  },
  {
    accessorKey: "stuIDCheckin",
    header: "Checkin ID",
    visible: false,
  },
  {
    accessorKey: "studio",
    header: "Studio",
    visible: true,
  },
  {
    accessorKey: "otherLocation",
    header: "Other Location",
    visible: false,
  },
  {
    accessorKey: "creationMonitor",
    header: "Creation Monitor",
    visible: false,
  },
  {
    accessorKey: "finishMonitor",
    header: "Finish Monitor",
    visible: false,
  },
  {
    accessorKey: "finishTime",
    header: "Finish Time",
    visible: false,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    visible: false,
  },
  {
    accessorKey: "finished",
    header: "Finished",
    visible: true,
  },
  // {
  //   accessorKey: "inventory_items",
  //   header: "Inventory Items",
  //   visible: true,
  // },
  // {
  //   accessorKey: "studio_user",
  //   header: "Studio User",
  //   visible: true,
  // },
];

export default CustomColumns;
