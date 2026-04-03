import { View } from "react-native";
import { MasterComponentItem } from "@/typings/types/form.types";
import FromComponent from "../components/form/FormComponent";

export default function SettingTarget() {
  const formFields: MasterComponentItem[] = [
    {
      type: "InputComponent",
      column: 12,
      model: "fullName",
      info: {
        label: "Họ và tên",
        placeholder: "Nhập họ và tên",
        required: true,
        minLength: 2,
        maxLength: 50,
        validationRules: [
          {
            type: "minLength",
            value: 2,
            message: "Tên phải có ít nhất 2 ký tự",
          },
          {
            type: "maxLength",
            value: 50,
            message: "Tên không được quá 50 ký tự",
          },
        ],
      },
    },
    // {
    //   type: "InputComponent",
    //   column: 6,
    //   model: "email",
    //   info: {
    //     label: "Email",
    //     placeholder: "example@email.com",
    //     required: true,
    //     email: true,
    //     validationRules: [{ type: "email", message: "Email không hợp lệ" }],
    //   },
    // },
  ];

  const handleSubmit = (values: any) => {
    console.log("Form submitted:", values);
    // Gọi API ở đây
  };

  const handleChange = (values: any, isValid: boolean) => {
    console.log("Form changed:", values, "Valid:", isValid);
  };

  return (
    <View style={{ flex: 1 }}>
      <FromComponent
        fields={formFields}
        onSubmit={handleSubmit}
        onChange={handleChange}
      />
    </View>
  );
}
