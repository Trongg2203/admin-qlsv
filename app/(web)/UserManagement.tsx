// screens/UserManagementScreen.tsx
import { Download, Eye } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import TableComponent, {
  Action,
  Column,
} from "../components/webComponent/TableComponent";
import { useUserStore } from "@/store/userStore";
import { usePaginationStore } from "@/store/paginationStore";
import ToastManager from "toastify-react-native/components/ToastManager";
import userService from "@/services/userService";
import { API } from "@/constants/constants";
import AddOrEditUser from "./addOrEditUser";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function UserManagementScreen() {
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [isAdd, setIsAdd] = useState(true);

  const userStore = useUserStore();
  const { currentPage, pageSize } = usePaginationStore();

  useEffect(() => {
    const fetchUserList = async () => {
      setLoading(true);
      try {
        await userStore.getList({
          page: currentPage,
          per_page: pageSize,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserList();
  }, [currentPage, pageSize]);

  const columns: Column[] = [
    {
      key: "id",
      title: "ID",
      width: "3%",
      sortable: true,
    },
    {
      key: "name",
      width: "10%",
      title: "Họ tên",
      sortable: true,
      isSearch: true,
    },
    {
      key: "email",
      title: "Email",
      width: "10%",
      isSearch: true,
      searchType: "email",
    },
    {
      key: "role",
      title: "Vai trò",
      width: "10%",
      isSearch: true,
      searchType: "select",
      searchOptions: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
        { label: "Manager", value: "manager" },
      ],
    },
    {
      key: "status",
      title: "Trạng thái",
      width: 100,
      render: (value) => (
        <View
          style={{
            backgroundColor: value === "active" ? "#dcfce7" : "#fee2e2",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            alignSelf: "flex-start",
          }}
        >
          <Text
            style={{
              color: value === "active" ? "#16a34a" : "#dc2626",
              fontSize: 12,
              fontWeight: "500",
            }}
          >
            {value === "active" ? "Hoạt động" : "Khóa"}
          </Text>
        </View>
      ),
    },
  ];

  const customActions: Action[] = [
    {
      key: "view",
      label: "Xem",
      icon: Eye,
      color: "#3b82f6",
      onPress: (user) => {
        Alert.alert("Thông tin", `Xem chi tiết: ${user.name}`);
      },
    },
    {
      key: "export",
      label: "Export",
      icon: Download,
      color: "#10b981",
      onPress: (user) => {
        console.log("Export user:", user);
      },
      show: (user) => user.role === "admin",
    },
  ];

  const handleAdd = () => {
    setIsAdd(true);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setIsAdd(false);
    setShowForm(true);
  };

  const handleDelete = async (user: User) => {
    console.log("Delete user:", user);
    let ids = [];
    ids.push(user.id);
    try {
      const response = await userService.delete(API.USER.DELETE, ids);
      if (response) {
        ToastManager.success("Xóa người dùng thành công");
      }
    } catch (error) {
      ToastManager.show({
        type: "error",
        text1: `Đã có lỗi xảy ra khi xóa người dùng ${user.name}`,
      });
    }
  };

  const handleRefresh = async () => {
    await userStore.getList({
      page: currentPage,
      per_page: pageSize,
    });
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f3f4f6" }}>
      <TableComponent
        data={userStore.UsersList}
        columns={columns}
        title="Quản lý người dùng"
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
        selectionMode="multiple"
        tableWidth="100%"
        actions={customActions}
        showDefaultActions={true}
        actionButtonSize="medium"
        actionPosition="end"
        globalSearch={true}
        searchable={true}
        emptyMessage="Không có người dùng nào"
        actionDirection="horizontal"
      />

      {showForm && <AddOrEditUser isAdd={isAdd} />}
    </View>
  );
}
