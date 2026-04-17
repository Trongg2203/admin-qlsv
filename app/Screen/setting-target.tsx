import {
  API,
  GOALSTATUS,
  STATUS,
  STATUS_COMPLETED,
} from "@/constants/constants";
import { useLoadingStore } from "@/store/loadingStore";
import { useSettingTargetStore } from "@/store/settingTargetStore";
import { CreateSettingTarget } from "@/typings/interfaces/settingTarget/settingTarget";
import { DateFormat } from "@/typings/types/DateType";
import { MasterComponentItem } from "@/typings/types/form.types";
import { GOALTYPE } from "@/typings/types/GoalType";
import { scale } from "@/utils/responsive";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import FromComponent from "../components/form/FormComponent";
import { getCurrentDate } from "@/utils/dateHelpers";
import settingTargetService from "@/services/settingTargetService";
import { useErrorStore } from "@/store/errorStore";
import ErrorDialog from "../components/UI/ErrorDialog";
import { Toast } from "toastify-react-native";
import { POSITION_TOAST } from "@/typings/types/PostionToast";

export default function SettingTarget() {
  const loadingStore = useLoadingStore();
  const router = useRouter();
  const settingTargetStore = useSettingTargetStore();

  const { hasError, clearError } = useErrorStore();
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const [isAdd, setIsAdd] = useState(false);

  const initialValue: CreateSettingTarget = {
    user_id: "",
    goal_type: GOALTYPE.GAIN_WEIGHT,
    target_date: getCurrentDate(),
    status: GOALSTATUS.ACTIVE,
    is_completed: STATUS_COMPLETED.INCOMPLETE,
    is_active: STATUS.ACTIVE,
    start_weight: 70,
    target_weight: 65,
    start_date: getCurrentDate(),
  };

  const formFields: MasterComponentItem[] = [
    {
      type: "CheckBoxComponent",
      column: 12,
      model: "goal_type",
      info: {
        label: "Loại mục tiêu",
        required: true,
        direction: "row",
        returnType: "single",
        options: [
          { label: "Giảm cân", value: GOALTYPE.LOSE_WEIGHT },
          { label: "Tăng cân", value: GOALTYPE.GAIN_WEIGHT },
          { label: "Duy trì", value: GOALTYPE.MAINTAIN_WEIGHT },
        ],
      },
    },
    {
      type: "InputDecimalComponent",
      column: 6,
      model: "start_weight",
      info: {
        label: "Cân nặng ban đầu",
        required: true,
        decimalPlaces: 2,
        prefix: "kg",
        min: 1,
        max: 999999.99,
      },
    },
    {
      type: "InputDecimalComponent",
      column: 6,
      model: "target_weight",
      info: {
        label: "Cân nặng mục tiêu",
        required: true,
        decimalPlaces: 2,
        prefix: "kg",
        min: 1,
        max: 999999.99,
      },
    },
    {
      type: "DatePickerComponent",
      column: 6,
      model: "start_date",
      info: {
        label: "Ngày bắt đầu",
        required: true,
        mode: "date",
        format: DateFormat.DATE,
        placeholder: "Chọn ngày bắt đầu",
        minDate: new Date(2020, 0, 1),
        maxDate: new Date(2025, 11, 31),
      },
    },
    {
      type: "DatePickerComponent",
      column: 6,
      model: "target_date",
      info: {
        label: "Ngày mục tiêu",
        required: true,
        mode: "date",
        format: DateFormat.DATE,
        placeholder: "Chọn ngày mục tiêu",
      },
    },
    {
      type: "CheckBoxComponent",
      column: 6,
      model: "is_active",
      info: {
        label: "Mục tiêu theo dõi",
        required: false,
        direction: "row",
        returnType: "single",
        options: [{ label: "Đang hoạt động", value: STATUS.ACTIVE }],
      },
    },
    {
      type: "CheckBoxComponent",
      column: 6,
      model: "is_completed",
      info: {
        label: "Đã đạt mục tiêu",
        required: false,
        direction: "row",
        returnType: "single",
        options: [{ label: "Chưa đạt", value: STATUS_COMPLETED.INCOMPLETE }],
      },
    },
    {
      type: "CheckBoxComponent",
      column: 12,
      model: "status",
      info: {
        label: "Trạng thái mục tiêu",
        required: false,
        direction: "row",
        returnType: "single",
        options: [
          { label: "Chưa đạt", value: GOALSTATUS.ACTIVE },
          { label: "Tạm dừng", value: GOALSTATUS.PAUSED },
          { label: "Đã đạt", value: GOALSTATUS.COMPLETED },
          { label: "Bị hủy", value: GOALSTATUS.ANBANDONED },
        ],
      },
    },
  ];

  const handleSubmit = async (values: any) => {
    loadingStore.setLoading(true);
    console.log("Form submitted:", values);
    try {
      const response = isAdd
        ? await settingTargetService.post(API.USER_GOAL.CREATE, values)
        : await settingTargetService.post(API.USER_GOAL.UPDATE, values);

      if (response) {
        Toast.success(
          isAdd ? "Thêm mới thành công" : "Cập nhật thành công",
          POSITION_TOAST.TOP,
          "checkmark-circle-outline",
        );
        setTimeout(() => {
          handleCancel();
        }, 1000);
        // handleCancel();
      }
    } catch (error) {
      console.log(error);
    }
    loadingStore.setLoading(false);
    // Gọi API ở đây
  };

  const handleCancel = () => {
    router.back();
  };

  useEffect(() => {
    const testAPI = async () => {
      loadingStore.setLoading(true);
      const response = await settingTargetStore.getBySelf(
        API.USER_GOAL.GET_BY_SELF,
      );
      loadingStore.setLoading(false);
      return response ? setIsAdd(false) : setIsAdd(true);
    };

    testAPI();
  }, []);

  const handleCloseError = () => {
    clearError();
    setShowErrorDialog(false);
  };

  useEffect(() => {
    if (hasError) {
      setShowErrorDialog(true);
    }
  }, [hasError]);

  return (
    <View
      style={{
        flex: 1,
        marginHorizontal: scale(8),
        marginVertical: scale(30),
      }}
    >
      <View
        style={{
          backgroundColor: "red",
          padding: scale(8),
          borderRadius: scale(4),
          marginVertical: scale(16),
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          {isAdd ? "Thêm mới mục tiêu" : "Cập nhật mục tiêu"}
        </Text>
      </View>
      <FromComponent
        fields={formFields}
        initialValues={initialValue}
        onSubmit={handleSubmit}
        // onChange={handleChange}
        onCancel={handleCancel}
      />

      {/* Error Dialog */}
      <ErrorDialog
        visible={showErrorDialog}
        onClose={handleCloseError}
        buttonText="Đóng"
      />
    </View>
  );
}
