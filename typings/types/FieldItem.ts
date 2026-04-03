export type FieldItem = {
  label: string;
  value?: any;
  render?: () => React.ReactNode;
  isIconExpanse?: boolean;
  expand?: () => React.ReactNode;
  children?: FieldItem[];
  onPress?: () => void;
};
