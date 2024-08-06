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
  agreement: TableFieldStatus;
  excusedAbs: TableFieldStatus;
  excusedLate: TableFieldStatus;
  unexcusedAbs: TableFieldStatus;
  unexcusedLate: TableFieldStatus;
  lateReturn: TableFieldStatus;
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
  agreement: {
    header: "Agreement",
    visible: true,
  },
  excusedAbs: {
    header: "Excused Absentce",
    visible: false,
  },
  excusedLate: {
    header: "Excused Late",
    visible: false,
  },
  unexcusedAbs: {
    header: "Unexcused Absence",
    visible: false,
  },
  unexcusedLate: {
    header: "Unexcused Lte",
    visible: false,
  },
  lateReturn: {
    header: "Late Return",
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
  {
    accessorKey: "agreement",
    header: "Agreement",
    visible: true,
  },
  { accessorKey: "excusedAbs", header: "Excused Absentce", visible: false },
  { accessorKey: "excusedLate", header: "Excused Late", visible: false },
  { accessorKey: "unexcusedAbs", header: "Unexcused Absence", visible: false },
  { accessorKey: "unexcusedLate", header: "Unexcused Lte", visible: false },
  { accessorKey: "lateReturn", header: "Late Return", visible: false },
];
