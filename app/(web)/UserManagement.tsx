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
import { User } from "@/typings/interfaces/user/user";
import ToastManager from "toastify-react-native/components/ToastManager";
import AddOrEditUser from "./addOrEditUser";

export default function UserManagementScreen() {
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [isAdd, setIsAdd] = useState(true);
  const [selected, setSelected] = useState<User | null>(null);

  const usersList = useUserStore((state) => state.UsersList);
  const getList = useUserStore((state) => state.getList);
  const deleteUser = useUserStore((state) => state.deleteUser);
  const { currentPage, pageSize } = usePaginationStore();

  useEffect(() => {
    const fetchUserList = async () => {
      setLoading(true);
      try {
        await getList({
          page: currentPage,
          // Backend BaseRepository.get() reads `itemsPerPage` for page size.
          itemsPerPage: pageSize,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserList();
  }, [currentPage, pageSize, getList]);

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
        { label: "Admin", value: "1" },
        { label: "User", value: "0" },
      ],
      // Backend returns role as a number (0=user, 1=admin).
      render: (value) => <Text>{Number(value) === 1 ? "Admin" : "User"}</Text>,
    },
    {
      key: "account_status",
      title: "Trạng thái",
      width: 100,
      // Backend account_status: 0=pending, 1=active, 2=rejected.
      render: (value) => {
        const status = Number(value);
        const label =
          status === 1 ? "Hoạt động" : status === 2 ? "Bị từ chối" : "Chờ duyệt";
        const active = status === 1;
        return (
          <View
            style={{
              backgroundColor: active ? "#dcfce7" : "#fee2e2",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                color: active ? "#16a34a" : "#dc2626",
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              {label}
            </Text>
          </View>
        );
      },
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
      show: (user) => Number(user.role) === 1,
    },
  ];

  const handleAdd = () => {
    setIsAdd(true);
    setSelected(null);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setIsAdd(false);
    setSelected(user);
    setShowForm(true);
  };

  const handleDelete = async (user: User) => {
    Alert.alert("Xác nhận xoá", `Xoá người dùng "${user.name}"?`, [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          const ok = await deleteUser(user.id);
          ToastManager.show({
            type: ok ? "success" : "error",
            text1: ok ? "Đã xoá người dùng" : "Xoá người dùng thất bại",
          });
        },
      },
    ]);
  };

  const handleRefresh = async () => {
    await getList({
      page: currentPage,
      itemsPerPage: pageSize,
    });
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f3f4f6" }}>
      <TableComponent
        data={usersList}
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

      {showForm && (
        <AddOrEditUser
          isAdd={isAdd}
          user={selected}
          onClose={() => setShowForm(false)}
          onSaved={() => setShowForm(false)}
        />
      )}
    </View>
  );
}
