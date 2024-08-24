export type UserFields = {
  net_id: string;
  stu_id: string;
  full_name: string;
  academic_level: string;
  email: string;
  bio: string;
  blocked: boolean;
};

export interface TableFieldStatus {
  header: string;
  visible: boolean;
}
export interface TableColumnStatus {
  net_id: TableFieldStatus;
  stu_id: TableFieldStatus;
  full_name: TableFieldStatus;
  academic_level: TableFieldStatus;
  email: TableFieldStatus;
  bio: TableFieldStatus;
  blocked: TableFieldStatus;
}

export type ColumnKey = keyof TableColumnStatus;

export const userColumns = [
  {
    accessorKey: "net_id",
    header: "NetID",
    visible: true,
  },
  {
    accessorKey: "stu_id",
    header: "ID Barcode",
    visible: true,
  },
  {
    accessorKey: "full_name",
    header: "Name",
    visible: true,
  },
  {
    accessorKey: "academic_level",
    header: "Academic Level",
    visible: false,
  },
  {
    accessorKey: "eamil",
    header: "Email",
    visible: false,
  },
  {
    accessorKey: "last_login",
    header: "Last Login",
    visible: false,
  },
  {
    accessorKey: "bio",
    header: "User Bio",
    visible: false,
  },
  {
    accessorKey: "blocked",
    header: "Blocked",
    visible: false,
  },
];

export const userColumnsDefault = {
  net_id: {
    header: "NetID",
    visible: true,
  },
  stu_id: {
    header: "ID Barcode",
    visible: false,
  },
  full_name: {
    header: "Name",
    visible: true,
  },
  academic_level: {
    header: "Academic Level",
    visible: true,
  },
  email: {
    header: "Email",
    visible: false,
  },
  last_login: {
    header: "Last Login",
    visible: false,
  },
  bio: {
    header: "User Bio",
    visible: false,
  },
  blocked: {
    header: "Blocked",
    visible: true,
  },
};

// export default inventoryColumns;
