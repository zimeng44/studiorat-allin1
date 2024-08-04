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

export interface TableFieldStatus {
  header: string;
  visible: boolean;
}
export interface TableColumnStatus {
  creationTime: TableFieldStatus;
  stuIDCheckout: TableFieldStatus;
  stuIDCheckin: TableFieldStatus;
  userName: TableFieldStatus;
  studio: TableFieldStatus;
  otherLocation: TableFieldStatus;
  creationMonitor: TableFieldStatus;
  finishMonitor: TableFieldStatus;
  finishTime: TableFieldStatus;
  notes: TableFieldStatus;
  finished: TableFieldStatus;
}
export type ColumnKeys = keyof TableColumnStatus;

export const checkoutColumns = [
  {
    accessorKey: "creationTime",
    header: "Creation Time",
    visible: true,
  },
  {
    accessorKey: "stuIDCheckout",
    header: "Checkout ID",
    visible: false,
  },
  {
    accessorKey: "stuIDCheckin",
    header: "Checkin ID",
    visible: false,
  },
  {
    accessorKey: "userName",
    header: "User Name",
    visible: true,
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

export const checkoutColumnsDefault = {
  creationTime: {
    header: "Creation Time",
    visible: true,
  },
  stuIDCheckout: {
    header: "Checkout ID",
    visible: false,
  },
  stuIDCheckin: {
    header: "Checkin ID",
    visible: false,
  },
  userName: {
    header: "User Name",
    visible: true,
  },
  studio: {
    header: "Studio",
    visible: true,
  },
  otherLocation: {
    header: "Other Location",
    visible: false,
  },
  creationMonitor: {
    header: "Creation Monitor",
    visible: false,
  },
  finishMonitor: {
    header: "Finish Monitor",
    visible: false,
  },
  finishTime: {
    header: "Finish Time",
    visible: false,
  },
  notes: {
    header: "Notes",
    visible: false,
  },
  finished: {
    header: "Status",
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
};

export default checkoutColumns;
