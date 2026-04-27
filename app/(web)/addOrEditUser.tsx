import { Text, View } from "react-native";
import FormComponent from "../components/form/FormComponent";
import { MasterComponentItem } from "@/typings/types/form.types";

export interface AddOrEditUserProps {
  isAdd: boolean;
  models: any;
}

function AddOrEditUser(props: AddOrEditUserProps) {
  const fields: MasterComponentItem[] = [
    {
      type: "InputComponent",
      column: 6,
      model: "name",
      info: {
        label: "Họ tên",
        required: true,
      },
    },
    {
      type: "InputComponent",
      column: 6,
      model: "email",
      info: {
        label: "Email",
        required: true,
      },
    },
    {
      type: "PasswordComponent",
      column: 6,
      model: "password",
      info: {
        label: "Mật khẩu",
        required: true,
      },
    },
    // confirm pass
    {
      type: "PasswordComponent",
      column: 6,
      model: "confirm_password",
      info: {
        label: "Xác nhận mật khẩu",
        required: true,
        same: "password",
      },
    },
  ];

  return (
    <View
      style={{
        position: "fixed",
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
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
          {props.isAdd ? "Thêm người dùng" : "Chỉnh sửa người dùng"}
        </Text>
        <FormComponent fields={fields} />
      </View>
    </View>
  );
}

export default AddOrEditUser;
