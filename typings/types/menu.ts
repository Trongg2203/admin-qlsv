// types/menu.ts
export interface MenuItem {
  name: string;
  label: string;
  icon: any;
  route?: string;
  children?: MenuItem[];
}

// constants/menu.ts
import {
  CalendarCheck2,
  User,
  Settings,
  FileText,
  Users,
  BarChart,
  Utensils,
} from "lucide-react-native";

export const menuItems: MenuItem[] = [
  {
    name: "DailyScreen",
    label: "Hàng ngày",
    icon: CalendarCheck2,
    route: "/DailyScreen",
  },
  {
    name: "ProfileScreen",
    label: "Hồ sơ",
    icon: User,
    route: "/ProfileScreen",
  },
  {
    name: "UserManagement",
    label: "Quản lý người dùng",
    icon: Users,
    route: "/UserManagement",
  },
  {
    name: "ProductManagement",
    label: "Quản lý món ăn",
    icon: Utensils,
    route: "/ProductManagement",
  },
  {
    name: "Management",
    label: "Quản lý",
    icon: Settings,
    children: [
      {
        name: "ReportManagement",
        label: "Quản lý báo cáo",
        icon: FileText,
        route: "/ReportManagement",
      },
      {
        name: "Statistics",
        label: "Thống kê",
        icon: BarChart,
        route: "/Statistics",
      },
    ],
  },
];
