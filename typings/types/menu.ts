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
  House,
  CalendarCheck2,
  User,
  Settings,
  FileText,
  Users,
  BarChart,
} from "lucide-react-native";

export const menuItems: MenuItem[] = [
  {
    name: "HomeScreen",
    label: "Trang chủ",
    icon: House,
    route: "/HomeScreen",
  },
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
