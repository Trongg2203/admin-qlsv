import { MasterComponentItem } from "@/typings/types/form.types";
import { X } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import ToastManager from "toastify-react-native/components/ToastManager";
import FormComponent from "../components/form/FormComponent";

export interface AddOrEditUserProps {
  isAdd: boolean;
  onClose?: () => void;
  models?: any;
}

function AddOrEditUser({ isAdd, onClose }: AddOrEditUserProps) {
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
      info: { label: "Mật khẩu", required: true },
    },
    {
      type: "PasswordComponent",
      column: 6,
      model: "confirm_password",
      info: {
        label: "Xác nhận mật khẩu",
        required: true,
        validationRules: [
          {
            type: "same",
            value: "password",
            message: "Mật khẩu xác nhận không khớp",
          },
        ],
      },
    },
  ];

  // The backend has no admin user create/update endpoint — users are created
  // only via public registration (POST /auth/register). Be explicit instead of
  // silently posting to a route that does not exist.
  const handleSubmit = () => {
    ToastManager.show({
      type: "info",
      text1: "Chưa được hỗ trợ",
      text2:
        "API chưa có route tạo/sửa người dùng cho admin. Hãy dùng màn hình Đăng ký.",
    });
    onClose?.();
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
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            {isAdd ? "Thêm người dùng" : "Chỉnh sửa người dùng"}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color="#111" />
          </TouchableOpacity>
        </View>

        <Text style={{ color: "#dc2626", fontSize: 12, marginBottom: 8 }}>
          Lưu ý: API hiện chỉ hỗ trợ tạo tài khoản qua đăng ký công khai.
        </Text>

        <FormComponent
          fields={fields}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </View>
    </View>
  );
}

export default AddOrEditUser;
