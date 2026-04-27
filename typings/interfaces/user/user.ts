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
  user: IUserDetail;
}

// user list
export interface User extends BaseInterface<string> {
  id: string;
  code: string;
  name: string;
  email: string;

  phone: string | null;
  birthday: string | null;

  avatar: string | null;
  gender: number | null; // nếu backend trả 0/1/2 thì để number

  address: string | null;

  status: boolean;
  type: number;

  cccd: string | null;

  role: number;
  account_status: number;

  email_verified_at: string | null;
  rejection_reason: string | null;

  last_login_at: string | null;

  created_at: string;
  created_by: string;

  updated_at: string;
  updated_by: string;
}
