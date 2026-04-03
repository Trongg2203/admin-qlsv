// utils/validatePresets.ts
import { ValidateRule } from "./validate";

// Preset cho các field thông dụng
export const validatePresets = {
  // Username: 3-20 ký tự, chỉ chữ, số, dấu gạch dưới
  username: {
    required: "Vui lòng nhập tên đăng nhập",
    minLength: [3, "Tên đăng nhập phải có ít nhất 3 ký tự"],
    maxLength: [20, "Tên đăng nhập không được quá 20 ký tự"],
    pattern: [
      /^[a-zA-Z0-9_]+$/,
      "Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới",
    ],
  } as ValidateRule,

  // Email
  email: {
    required: "Vui lòng nhập email",
    email: "Email không hợp lệ",
  } as ValidateRule,

  // Password: 6-50 ký tự
  password: {
    required: "Vui lòng nhập mật khẩu",
    minLength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    maxLength: [50, "Mật khẩu không được quá 50 ký tự"],
  } as ValidateRule,

  // Phone Việt Nam
  phone: {
    required: "Vui lòng nhập số điện thoại",
    phone: "Số điện thoại không hợp lệ",
  } as ValidateRule,

  // Full name
  fullName: {
    required: "Vui lòng nhập họ tên",
    minLength: [2, "Họ tên phải có ít nhất 2 ký tự"],
    maxLength: [100, "Họ tên không được quá 100 ký tự"],
  } as ValidateRule,

  // Age: 0-120
  age: {
    number: "Tuổi phải là số",
    integer: "Tuổi phải là số nguyên",
    min: [0, "Tuổi không hợp lệ"],
    max: [120, "Tuổi không hợp lệ"],
  } as ValidateRule,

  // URL
  url: {
    url: "URL không hợp lệ",
  } as ValidateRule,

  // Confirm password (cần truyền password để so sánh)
  confirmPassword: (password: string): ValidateRule => ({
    required: "Vui lòng xác nhận mật khẩu",
    match: [password, "Mật khẩu xác nhận không khớp"],
  }),

  // ID card (CMND/CCCD)
  idCard: {
    required: "Vui lòng nhập số CMND/CCCD",
    pattern: [/^[0-9]{9,12}$/, "CMND/CCCD phải có 9-12 số"],
  } as ValidateRule,

  // Date (YYYY-MM-DD)
  date: {
    pattern: [
      /^\d{4}-\d{2}-\d{2}$/,
      "Ngày tháng không đúng định dạng (YYYY-MM-DD)",
    ],
  } as ValidateRule,
};
