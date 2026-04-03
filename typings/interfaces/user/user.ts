import { BaseInterface } from "../baseInterface";

export interface IUserDetail extends BaseInterface<string> {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: number;
  birthday: number;
  avatar: string;
  address: string;
  status: boolean;
  type: number;
  cccd: string;
}

export interface IUserProfile extends BaseInterface<string> {
  id: string;
  user_id: string;
  date_of_birth: string; // hoặc Date
  gender: number; // 0: male, 1: female, 2: other
  height: number | string; // có thể là number hoặc string từ API
  current_weight: number | string;
  bmi: number | null;
  bmi_category: string | null;
  activity_level: number; // 0-4
  user:IUserDetail
}
