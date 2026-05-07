import { useErrorStore } from "@/store/errorStore";
import { useLoadingStore } from "@/store/loadingStore";
import { themeTokens, useThemeStore } from "@/store/themeStore";
import { useUserStore } from "@/store/userStore";
import { IUserProfile } from "@/typings/interfaces/user/user";
import { DateFormat } from "@/typings/types/DateType";
import { MasterComponentItem } from "@/typings/types/form.types";
import { POSITION_TOAST } from "@/typings/types/PostionToast";
import { getCurrentDate, minusYear } from "@/utils/dateHelpers";
import { scale } from "@/utils/responsive";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import ToastManager from "toastify-react-native/components/ToastManager";
import FormComponent from "../components/form/FormComponent";
import ErrorDialog from "../components/UI/ErrorDialog";

type ProfileFormValues = {
  date_of_birth: string;
  gender: number | null;
  height: number | null;
  current_weight: number | null;
  activity_level: number | null;
  user_id: string;
};

const initialValue: ProfileFormValues = {
  date_of_birth: minusYear(getCurrentDate(), 10),
  gender: 0,
  height: null,
  current_weight: null,
  activity_level: 0,
  user_id: "",
};

export default function ProfileSetting() {
  const { resolvedTheme } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const loadingStore = useLoadingStore();
  const { hasError, clearError } = useErrorStore();
  const { userProfile, getUserProfile, createUserProfile, updateUserProfile } =
    useUserStore();

  const [formData, setFormData] = useState<ProfileFormValues>(initialValue);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  const normalizeProfile = (profile: IUserProfile): ProfileFormValues => {
    return {
      date_of_birth: profile.date_of_birth ?? "",
      gender: profile.gender ?? 0,
      height:
        profile.height !== null && profile.height !== undefined
          ? Number(profile.height)
          : null,
      current_weight:
        profile.current_weight !== null && profile.current_weight !== undefined
          ? Number(profile.current_weight)
          : null,
      activity_level: profile.activity_level ?? 0,
      user_id: profile.user_id ?? "",
    };
  };

  const fields: MasterComponentItem[] = useMemo(
    () => [
      {
        type: "DatePickerComponent",
        column: 6,
        model: "date_of_birth",
        info: {
          label: "Ngày sinh",
          mode: "date",
          format: DateFormat.DATE,
        },
      },
      {
        type: "CheckBoxComponent",
        column: 6,
        model: "gender",
        info: {
          label: "Giới tính",
          direction: "row",
          returnType: "single",
          options: [
            { label: "Nam", value: 0 },
            { label: "Nữ", value: 1 },
            { label: "Khác", value: 2 },
          ],
        },
      },
      {
        type: "InputDecimalComponent",
        column: 6,
        model: "height",
        info: {
          label: "Chiều cao",
          decimalPlaces: 0,
          prefix: "cm",
          min: 100,
          max: 250,
        },
      },
      {
        type: "InputDecimalComponent",
        column: 6,
        model: "current_weight",
        info: {
          label: "Cân nặng hiện tại",
          decimalPlaces: 2,
          prefix: "kg",
          min: 30,
          max: 300,
        },
      },
      {
        type: "CheckBoxComponent",
        column: 12,
        model: "activity_level",
        info: {
          label: "Mức độ vận động",
          direction: "row",
          returnType: "single",
          options: [
            { label: "Ít vận động", value: 0 },
            { label: "Nhẹ nhàng", value: 1 },
            { label: "Vừa phải", value: 2 },
            { label: "Năng động", value: 3 },
            { label: "Cực kỳ năng động", value: 4 },
          ],
        },
      },
    ],
    [],
  );

  const handleSubmit = async (values: ProfileFormValues) => {
    const payload: Partial<IUserProfile> = {};

    if (values.date_of_birth) payload.date_of_birth = values.date_of_birth;
    if (values.gender !== null && values.gender !== undefined)
      payload.gender = values.gender;
    if (values.height !== null && values.height !== undefined)
      payload.height = values.height;
    if (values.current_weight !== null && values.current_weight !== undefined)
      payload.current_weight = values.current_weight;
    if (values.activity_level !== null && values.activity_level !== undefined)
      payload.activity_level = values.activity_level;
    if (values.user_id) payload.user_id = userProfile?.user_id;

    if (Object.keys(payload).length === 0) {
      ToastManager.show({
        type: "error",
        text1: "Không có thay đổi để cập nhật",
      });
      return;
    }

    if (hasProfile === null) {
      ToastManager.show({
        type: "error",
        text1: "Chưa tải xong hồ sơ",
        position: POSITION_TOAST.TOP,
        icon: "close-circle-outline",
      });
      return;
    }

    loadingStore.setLoading(true);

    console.log("payload", payload);

    try {
      const success = hasProfile
        ? await updateUserProfile(payload)
        : await createUserProfile(payload);

      console.log("sus", success);
      if (success) {
        ToastManager.show({
          type: "success",
          text1: hasProfile
            ? "Cập nhật hồ sơ thành công"
            : "Tạo hồ sơ thành công",
        });
        const latestProfile = await getUserProfile();
        setHasProfile(!!latestProfile);
      }
    } catch (error) {
      console.log(error);
      ToastManager.show({
        type: "error",
        text1: hasProfile ? "Cập nhật hồ sơ thất bại" : "Tạo hồ sơ thất bại",
      });
    } finally {
      loadingStore.setLoading(false);
    }
  };

  const handleCloseError = () => {
    clearError();
    setShowErrorDialog(false);
  };

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile();
      setHasProfile(!!profile);
    };

    loadProfile();
  }, [getUserProfile]);

  useEffect(() => {
    if (userProfile) {
      setFormData(normalizeProfile(userProfile));
    } else {
      setFormData(initialValue);
    }
  }, [userProfile]);

  useEffect(() => {
    if (hasError) setShowErrorDialog(true);
  }, [hasError]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chỉnh sửa hồ sơ cá nhân</Text>
      </View>

      <FormComponent
        fields={fields}
        initialValues={formData}
        onSubmit={handleSubmit}
      />

      <ErrorDialog
        visible={showErrorDialog}
        onClose={handleCloseError}
        buttonText="Đóng"
      />
    </View>
  );
}

const createStyles = (tokens: typeof themeTokens.dark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: scale(16),
      paddingBottom: scale(16),
      backgroundColor: tokens.background,
    },
    header: {
      backgroundColor: tokens.surface,
      borderColor: tokens.border,
      borderWidth: 1,
      padding: scale(12),
      borderRadius: scale(8),
      margin: scale(16),
    },
    headerText: {
      color: tokens.text,
      fontWeight: "700",
    },
  });
