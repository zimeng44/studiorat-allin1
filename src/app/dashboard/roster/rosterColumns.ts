// export type InventoryColumnFields = {
//   stuN?: string;
//   netId?: string;
//   stuName?: string;
//   academicLevel?: string;
//   academicProgram?: string;
// };

export interface TableFieldStatus {
  header: string;
  visible: boolean;
}
export interface TableColumnStatus {
  stuN: TableFieldStatus;
  netId: TableFieldStatus;
  stuName: TableFieldStatus;
  academicLevel: TableFieldStatus;
  academicProgram: TableFieldStatus;
}

export type ColumnKey = keyof TableColumnStatus;

export const rosterColumnsDefault = {
  stuN: {
    header: "Student Number",
    visible: true,
  },
  netId: {
    header: "NetID",
    visible: true,
  },
  stuName: {
    header: "Student Name",
    visible: true,
  },
  academicLevel: {
    header: "Level",
    visible: true,
  },
  academicProgram: {
    header: "Program",
    visible: false,
  },
};

export const inventoryColumns = [
  {
    accessorKey: "stuN",
    header: "Student Number",
    visible: true,
  },
  {
    accessorKey: "netId",
    header: "NetID",
    visible: true,
  },
  {
    accessorKey: "stuName",
    header: "Name",
    visible: true,
  },
  {
    accessorKey: "academicLevel",
    header: "Level",
    visible: true,
  },
  {
    accessorKey: "academicProgram",
    header: "Program",
    visible: false,
  },
];
