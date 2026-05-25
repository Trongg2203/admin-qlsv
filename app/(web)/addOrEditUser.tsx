import { useUserStore } from "@/store/userStore";
import { User } from "@/typings/interfaces/user/user";
import { MasterComponentItem } from "@/typings/types/form.types";
import { X } from "lucide-react-native";
import { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import ToastManager from "toastify-react-native/components/ToastManager";
import FormComponent from "../components/form/FormComponent";

export interface AddOrEditUserProps {
  isAdd: boolean;
  onClose?: () => void;
  user?: User | null;
  onSaved?: () => void;
}

function AddOrEditUser({ isAdd, onClose, user, onSaved }: AddOrEditUserProps) {
  const { createUser, updateUser } = useUserStore();

  const initialValues = useMemo(
    () => ({
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      role: user?.role ?? 0,
      account_status: user?.account_status ?? 1,
      password: "",
      confirm_password: "",
    }),
    [user],
  );

  const fields: MasterComponentItem[] = [
    {
      type: "InputComponent",
      column: 6,
      model: "name",
      info: { label: "Họ tên", required: true },
    },
    {
      type: "InputComponent",
      column: 6,
      model: "email",
      info: {
        label: "Email",
        required: true,
        validationRules: [{ type: "email", message: "Email không hợp lệ" }],
      },
    },
    {
      type: "PasswordComponent",
      column: 6,
      model: "password",
      info: { label: "Mật khẩu", required: isAdd },
    },
    {
      type: "PasswordComponent",
      column: 6,
      model: "confirm_password",
      info: {
        label: "Xác nhận mật khẩu",
        required: isAdd,
        validationRules: [
          {
            type: "same",
            value: "password",
            message: "Mật khẩu xác nhận không khớp",
          },
        ],
      },
    },
    {
      type: "InputComponent",
      column: 6,
      model: "phone",
      info: { label: "Số điện thoại" },
    },
    {
      type: "CheckBoxComponent",
      column: 6,
      model: "role",
      info: {
        label: "Vai trò",
        direction: "row",
        returnType: "single",
        options: [
          { label: "User", value: 0 },
          { label: "Admin", value: 1 },
        ],
      },
    },
    {
      type: "CheckBoxComponent",
      column: 6,
      model: "account_status",
      info: {
        label: "Trạng thái",
        direction: "row",
        returnType: "single",
        options: [
          { label: "Chờ duyệt", value: 0 },
          { label: "Hoạt động", value: 1 },
          { label: "Bị từ chối", value: 2 },
        ],
      },
    },
  ];

  const handleSubmit = async (values: any) => {
    const payload: any = {
      name: values.name,
      email: values.email,
      phone: values.phone || null,
      role: Number(values.role ?? 0),
      account_status: Number(values.account_status ?? 1),
    };

    if (values.password) {
      payload.password = values.password;
    }

    const ok = isAdd
      ? await createUser(payload)
      : await updateUser(user?.id as string, payload);

    ToastManager.show({
      type: ok ? "success" : "error",
      text1: ok
        ? isAdd
          ? "Đã thêm người dùng"
          : "Đã cập nhật người dùng"
        : "Lưu người dùng thất bại",
    });

    if (ok) {
      onSaved?.();
      onClose?.();
    }
  };

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <View
        style={{
          width: 800,
          maxWidth: "95%",
          maxHeight: "92%",
          backgroundColor: "#fff",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            {isAdd ? "Thêm người dùng" : "Chỉnh sửa người dùng"}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color="#111" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ maxHeight: 640 }}>
          <FormComponent
            fields={fields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </ScrollView>
      </View>
    </View>
  );
}

export default AddOrEditUser;
