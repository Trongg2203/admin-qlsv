export type FieldItem = {
  label: string;
  value?: any;
  render?: () => React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  isIconExpanse?: boolean;
  expand?: () => React.ReactNode;
  children?: FieldItem[];
  onPress?: () => void;
};
