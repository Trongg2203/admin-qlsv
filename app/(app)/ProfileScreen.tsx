import { baseCss } from "@/assets/css/basecss.style";
import { profileCss } from "@/assets/css/profile.styles";
import { useAuthStore } from "@/store/authStore";
import { useLoadingStore } from "@/store/loadingStore";
import { themeTokens, useThemeStore } from "@/store/themeStore";
import { useUserStore } from "@/store/userStore";
import { genderType, getActivityLabel } from "@/utils/formalHelpers";
import { formatHeight, formatWeight, shortName } from "@/utils/helpers";
import { tabBarScrollY } from "@/utils/tabBarScroll";
import { LogOut, Settings } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import ButtonComponent from "../components/ButtonComponent";
import ChipComponent from "../components/ChipComponent";
import InfoListComponent from "../components/InfoListComponent";

import { FieldItem } from "@/typings/types/FieldItem";
import { useRouter } from "expo-router";
import DividerComponent from "../components/DividerComponent";

export default function ProfileScreen() {
  const router = useRouter();
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const loadingStore = useLoadingStore();
  const { resolvedTheme } = useThemeStore();
  const tokens = themeTokens[resolvedTheme];

  const styles = useMemo(() => createStyles(tokens), [tokens]);

  // Refresh profile whenever the tab mounts (app resume via splash doesn't
  // fetch it otherwise, leaving the screen with placeholder data).
  useEffect(() => {
    useUserStore.getState().getUserProfile();
    useUserStore.getState().fetchUserDetail();
  }, []);

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
    // {
    //   label: "Sđt",
    //   value: userStore.userProfile?.user.phone,
    // },
    // {
    //   label: "Địa chỉ",
    //   value: shortName(userStore.userProfile?.user.address ?? "", 30),
    // },
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
          value: <Settings size={16} color={tokens.accent} />,
          onPress: () => {
            router.push("/Screen/setting-target");
          },
        },
        {
          label: "Thông tin cá nhân",
          value: <Settings size={16} color={tokens.accent} />,
          onPress: () => {
            router.push("/Screen/ProfileSetting");
          },
        },
      ],
    },
    {
      label: "Ứng dụng",
      isIconExpanse: true,
      children: [
        {
          label: "Cài đặt giao diện",
          value: <Settings size={16} color={tokens.accent} />,
          onPress: () => {
            router.push("/Screen/AppSetting");
          },
        },
      ],
    },
  ];

  return (
    <Animated.ScrollView
      style={[{ flex: 1, backgroundColor: tokens.background }]}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: tabBarScrollY } } }],
        { useNativeDriver: true },
      )}
    >
      <View style={baseCss.base_padding}>
        {/* header profile */}
        <View style={profileCss.header_profile}>
          <Text style={[profileCss.name, { color: tokens.text }]}>
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
    </Animated.ScrollView>
  );
}

const createStyles = (tokens: typeof themeTokens.dark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.background,
    },
  });
