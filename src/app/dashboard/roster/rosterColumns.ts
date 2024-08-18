// export type InventoryColumnFields = {
//   stu_n?: string;
//   net_id?: string;
//   stu_name?: string;
//   academic_level?: string;
//   academic_program?: string;
// };

export interface TableFieldStatus {
  header: string;
  visible: boolean;
}
export interface TableColumnStatus {
  stu_n: TableFieldStatus;
  net_id: TableFieldStatus;
  stu_name: TableFieldStatus;
  academic_level: TableFieldStatus;
  academic_program: TableFieldStatus;
  agreement: TableFieldStatus;
  excused_abs: TableFieldStatus;
  excused_late: TableFieldStatus;
  unexcused_abs: TableFieldStatus;
  unexcused_late: TableFieldStatus;
  late_return: TableFieldStatus;
}

export type ColumnKey = keyof TableColumnStatus;

export const rosterColumnsDefault = {
  stu_n: {
    header: "Student Number",
    visible: true,
  },
  net_id: {
    header: "NetID",
    visible: true,
  },
  stu_name: {
    header: "Student Name",
    visible: true,
  },
  academic_level: {
    header: "Level",
    visible: true,
  },
  academic_program: {
    header: "Program",
    visible: false,
  },
  agreement: {
    header: "Agreement",
    visible: true,
  },
  excused_abs: {
    header: "Excused Absentce",
    visible: false,
  },
  excused_late: {
    header: "Excused Late",
    visible: false,
  },
  unexcused_abs: {
    header: "Unexcused Absence",
    visible: false,
  },
  unexcused_late: {
    header: "Unexcused Lte",
    visible: false,
  },
  late_return: {
    header: "Late Return",
    visible: false,
  },
};

export const inventoryColumns = [
  {
    accessorKey: "stu_n",
    header: "Student Number",
    visible: true,
  },
  {
    accessorKey: "net_id",
    header: "NetID",
    visible: true,
  },
  {
    accessorKey: "stu_name",
    header: "Name",
    visible: true,
  },
  {
    accessorKey: "academic_level",
    header: "Level",
    visible: true,
  },
  {
    accessorKey: "academic_program",
    header: "Program",
    visible: false,
  },
  {
    accessorKey: "agreement",
    header: "Agreement",
    visible: true,
  },
  { accessorKey: "excused_abs", header: "Excused Absentce", visible: false },
  { accessorKey: "excused_late", header: "Excused Late", visible: false },
  { accessorKey: "unexcused_abs", header: "Unexcused Absence", visible: false },
  { accessorKey: "unexcused_late", header: "Unexcused Lte", visible: false },
  { accessorKey: "late_return", header: "Late Return", visible: false },
];
