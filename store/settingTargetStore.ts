import settingTargetService from "@/services/settingTargetService";
import { CreateSettingTarget } from "@/typings/interfaces/settingTarget/settingTarget";
import { create } from "zustand";

interface LoadingState {
  create(_url: string, data: CreateSettingTarget): Promise<boolean | null>;
  update(_url: string, data: CreateSettingTarget): Promise<boolean | null>;
  getBySelf(_url: string): Promise<any>;
}

export const useSettingTargetStore = create<LoadingState>((set, get) => ({
  async create(
    _url: string,
    data: CreateSettingTarget,
  ): Promise<boolean | null> {
    const response = await settingTargetService.post<CreateSettingTarget>(
      _url,
      data,
    );
    return response;
  },

  async update(
    _url: string,
    data: CreateSettingTarget,
  ): Promise<boolean | null> {
    const response = await settingTargetService.post<CreateSettingTarget>(
      _url,
      data,
    );
    return response;
  },

  async getBySelf(_url: string) {
    const response = await settingTargetService.getSingleWithOutSlug(_url);
    return response;
  },
}));
