import { Prisma } from "@prisma/client";

export type BookingWithUserAndItems = Prisma.bookingsGetPayload<{
  include: {
    user: { include: { user_role: true } };
    created_by: true;
    inventory_items: true;
    // user_role: true;
  };
}>;

export type UserWithRole = Prisma.UserGetPayload<{
  include: { user_role: true };
}>;

export type CheckoutWithUserAndItems = Prisma.checkout_sessionsGetPayload<{
  include: {
    user: { include: { user_role: true } };
    created_by: true;
    inventory_items: true;
    // user_role: true;
  };
}>;

export type RosterWithPermission = Prisma.rostersGetPayload<{
  include: { permissions: true };
}>;

export type InventoryReportWithCreatorAndItems =
  Prisma.inventory_reportsGetPayload<{
    include: {
      // user: { include: { user_role: true } };
      created_by: true;
      inventory_items: true;
      // user_role: true;
    };
  }>;

export type InventoryItem = {
  id?: number;
  m_tech_barcode?: string;
  make?: string;
  model?: string;
  category?: string;
  description?: string;
  accessories?: string;
  storage_location?: string;
  comments?: string;
  out?: boolean;
  broken?: boolean;
};

export type CheckoutSessionType = {
  id?: number;
  creationTime?: Date | string;
  stuIDCheckout?: string;
  stuIDCheckin?: string;
  studio?: string;
  otherLocation?: string;
  creationMonitor?: string;
  finishTime?: Date | string;
  finishMonitor?: string;
  finished?: boolean;
  notes?: string;
  inventory_items?:
    | InventoryItem[]
    | number[]
    | undefined
    | { data: InventoryItem[] };
  noTagItems?: string[];
  user?: UserType;
};

export type CheckoutSessionTypePost = {
  id?: number;
  creationTime: Date | string;
  stuIDCheckout: string;
  stuIDCheckin?: string;
  studio: string;
  otherLocation?: string;
  creationMonitor: string;
  finishTime?: Date | string;
  finishMonitor?: string;
  finished: boolean;
  notes?: string;
  inventory_items?: (number | undefined)[];
  noTagItems?: string[];
  user: number;
};

export interface RetrievedItems {
  data: InventoryItem[];
}

export type BookingType = {
  id?: number;
  startTime?: Date | string;
  endTime?: Date | string;
  // studio?: string;
  user?: UserType;
  useLocation?: string;
  type?: string;
  bookingCreator?: UserType;
  notes?: string;
  inventory_items?: InventoryItem[] | number[] | undefined | RetrievedItems;
};

export interface BookingTypePost {
  startTime: Date | string;
  endTime: Date | string;
  user: number;
  useLocation: string;
  type: string;
  bookingCreator: number;
  notes?: string;
  inventory_items?: (number | undefined)[];
}

export type UserType = {
  id?: number;
  username?: string;
  stuId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  lastUse?: string;
  bio?: string;
  academicLevel?: string;
  blocked?: boolean;
  role?: UserRole;
};

export type UserTypePost = {
  username?: string;
  stuId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  lastUse?: string;
  bio?: string;
  academicLevel?: string;
  blocked?: boolean;
  role?: string | number;
};

export type UserRole = {
  id?: number;
  name?: string;
};

export type InventoryReportType = {
  id?: number;
  createdAt?: string;
  notes?: string;
  isFinished?: boolean;
  inventorySize?: number;
  itemsChecked?: { data: InventoryItem[] };
  creator?: UserType;
};

export type InventoryReportTypePost = {
  createdAt?: string;
  notes?: string;
  isFinished?: boolean;
  inventorySize?: number;
  itemsChecked?: (number | undefined)[];
  creator?: number;
};

export interface RosterRecordType {
  id?: number;
  stu_n?: string;
  net_id?: string;
  stu_name?: string;
  academic_level?: string;
  academic_program?: string;
  roster_permissions?: { data: RosterPermissionType[] };
  permissions?: number[];
  permission_code?: string;
  agreement?: boolean;
  excused_abs?: number;
  excused_late?: number;
  unexcused_abs?: number;
  unexcused_late?: number;
  late_return?: number;
}

export interface RosterRecordTypePost {
  stu_n?: string;
  net_id?: string;
  stu_name?: string;
  academic_level?: string;
  academic_program?: string;
  permissions?: (number | undefined)[];
  // roster_permissions?: { data: RosterPermissionType[] };
  permission_code?: string;
  agreement?: boolean;
  excused_abs?: number;
  excused_late?: number;
  unexcused_abs?: number;
  unexcused_late?: number;
  late_return?: number;
}

export interface RosterPermissionType {
  id?: number;
  permission_code?: string;
  permission_title?: string;
  instructor?: string;
  permission_details?: string;
  permitted_studios?: string[];
  start_date?: string;
  end_date?: string;
}

export interface RosterPermissionTypePost {
  permission_code?: string;
  permission_title?: string;
  instructor?: string;
  permission_details?: string;
  permitted_studios?: string[];
  start_date?: string | null;
  end_date?: string | null;
}

export interface RetrievedRosterPermission {
  data: RosterPermissionType[];
}

export const studioList = [
  "Other",
  "Floor 8 General",
  "Studio A",
  "Studio B",
  "Studio C",
  "Studio D",
  "Studio D1",
  "Studio E",
  "Studio F",
  "Dolan",
  "RLab",
];

export const bookingLocationList: string[] = [
  "Outside",
  "Studio A",
  "Studio B",
  "Studio C",
  "Studio D",
  "Studio D1",
  "Studio E",
  "Studio F",
  "Dolan",
  "RLab",
  "Paulson",
];

export const bookingTypeList = [
  "Same Day",
  "Overnight",
  "Weekend",
  "Exception",
];

export const bookingTimeList = [
  "08:00 AM",
  "08:15 AM",
  "08:30 AM",
  "08:45 AM",
  "09:00 AM",
  "09:15 AM",
  "09:30 AM",
  "09:45 AM",
  "10:00 AM",
  "10:15 AM",
  "10:30 AM",
  "10:45 AM",
  "11:00 AM",
  "11:15 AM",
  "11:30 AM",
  "11:45 AM",
  "12:00 PM",
  "12:15 PM",
  "12:30 PM",
  "12:45 PM",
  "01:00 PM",
  "01:15 PM",
  "01:30 PM",
  "01:45 PM",
  "02:00 PM",
  "02:15 PM",
  "02:30 PM",
  "02:45 PM",
  "03:00 PM",
  "03:15 PM",
  "03:30 PM",
  "03:45 PM",
  "04:00 PM",
  "04:15 PM",
  "04:30 PM",
  "04:45 PM",
  "05:00 PM",
  "05:15 PM",
  "05:30 PM",
  "05:45 PM",
  "06:00 PM",
  "06:15 PM",
  "06:30 PM",
  "06:45 PM",
  "07:00 PM",
  "07:15 PM",
  "07:30 PM",
  "07:45 PM",
  "08:00 PM",
  "08:15 PM",
  "08:30 PM",
  "08:45 PM",
  "09:00 PM",
  "09:15 PM",
  "09:30 PM",
  "09:45 PM",
  "10:00 PM",
  "10:15 PM",
  "10:30 PM",
  "10:45 PM",
];
