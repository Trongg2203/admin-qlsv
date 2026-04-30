export interface CreateSettingTarget {
  id?:string;
  user_id: string;
  goal_type: number;
  start_weight: number;
  target_weight: number;
  start_date: string;
  target_date: string;
  is_active:number;
  is_completed:number;
  status:number;
  weekly_change_rate: number; // Tỷ lệ thay đổi cân nặng hàng tuần (kg/tuần)
}
