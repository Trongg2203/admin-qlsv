// utils/sessionFlow.ts
//
// Single source of truth for "where should an authenticated user land?".
//
// Onboarding chain (matches the Laravel backend's hard requirements):
//   1. No body profile        -> ProfileSetting  (POST /auth/register already
//                                 creates one, so this only hits admin/legacy
//                                 accounts that have no profile row).
//   2. Profile but no active goal -> setting-target (a goal + calorie calc are
//                                 required before a meal plan can be generated,
//                                 otherwise POST /meal-plans/generate returns 422).
//   3. Everything present      -> DailyScreen (meal plan).
//
// The `onboarding=1` param lets those setup screens chain forward to the next
// step instead of behaving like a normal "edit" screen reached from Profile.

import { API } from "@/constants/constants";
import { useAuthStore } from "@/store/authStore";
import { useSettingTargetStore } from "@/store/settingTargetStore";
import { useUserStore } from "@/store/userStore";
import type { Href } from "expo-router";

export async function resolveEntryRoute(): Promise<Href> {
  try {
    if (useAuthStore.getState().is_admin) {
      return "/ProductManagement";
    }

    const profile = await useUserStore.getState().getUserProfile();
    if (!profile) {
      return { pathname: "/Screen/ProfileSetting", params: { onboarding: "1" } };
    }

    const activeGoal = await useSettingTargetStore
      .getState()
      .getBySelf(API.GOAL.ACTIVE);
    if (!activeGoal) {
      return { pathname: "/Screen/setting-target", params: { onboarding: "1" } };
    }

    return "/(app)/DailyScreen";
  } catch (error) {
    console.log("resolveEntryRoute error:", error);
    // On any failure, fall back to the app shell; its own screens handle
    // missing data with empty states.
    return "/(app)/DailyScreen";
  }
}
