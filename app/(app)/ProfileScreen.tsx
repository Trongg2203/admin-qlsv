import { Image, Text, View } from "react-native";
import ButtonComponent from "../components/ButtonComponent";
import { useAuthStore } from "@/store/authStore";
import { profileCss } from "@/assets/css/profile.styles";
import { baseCss } from "@/assets/css/basecss.style";
import { useLoadingStore } from "@/store/loadingStore";
import { useUserStore } from "@/store/userStore";
import { DividerComponent } from "../components/DividerComponent";
import { formatHeight, formatWeight, shortName } from "@/utils/helpers";
import ChipComponent from "../components/ChipComponent";
import { GENDER } from "@/typings/types/UserType";
import { genderType, getActivityLabel } from "@/utils/formalHelpers";
import InfoListComponent from "../components/InfoListComponent";
import { LogOut } from "lucide-react-native";
import { ScrollView } from "react-native";
import { FieldItem } from "@/typings/types/FieldItem";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const loadingStore = useLoadingStore();

  async function onLogOut() {
    try {
      loadingStore.setLoading(true);
      await authStore.logout();
    } catch (error) {
      console.log(error);
    } finally {
      loadingStore.setLoading(false);
    }
  }

  const gender = genderType.find(
    (g) => g.value === userStore.userProfile?.gender,
  );

  const profileFields: FieldItem[] = [
    {
      label: "Sđt",
      value: userStore.userProfile?.user.phone,
    },
    {
      label: "Địa chỉ",
      value: shortName(userStore.userProfile?.user.address ?? "", 30),
    },
    {
      label: "Giới tính",
      render: () => gender && <ChipComponent label={gender.text} selected />,
    },
    {
      label: "Chiều cao",
      value: formatHeight(Number(userStore.userProfile?.height)),
    },
    {
      label: "Trọng lượng",
      value: formatWeight(Number(userStore.userProfile?.current_weight)),
    },
    {
      label: "Cấp độ h.động",
      value: getActivityLabel(userStore.userProfile?.activity_level),
    },
    {
      label: "Mục tiêu",
      isIconExpanse: true,
      children: [
        {
          label: "Thiết lập mục tiêu",
          onPress: () => {
            router.push("/Screen/setting-target");
          },
        },
        {
          label: "Chi tiết",
          expand: () => <Text>Chi tiết sâu hơn...</Text>,
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={baseCss.base_padding}>
        {/* header profile */}
        <View style={profileCss.header_profile}>
          <Text style={profileCss.name}>
            {shortName(userStore.userProfile?.user.name ?? "Name", 30)}
          </Text>
          <Image
            source={require("@/assets/images/no-user.jpg")}
            style={profileCss.avatar}
          />
        </View>
        <DividerComponent />

        {/* info profile */}
        <View>
          <InfoListComponent data={profileFields} />
        </View>
        <ButtonComponent
          title="Đăng xuất"
          icon={LogOut}
          iconPosition="left"
          onPress={onLogOut}
        />
      </View>
    </ScrollView>
  );
}
