// MasterFormRow.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { MasterComponentItem } from "@/typings/types/form.types";
import MasterFormItem from "./MasterFormItem";

interface MasterFormRowProps {
  fields: MasterComponentItem[];
  values: { [key: string]: any };
  onChange: (model: string, value: any) => void;
  onBlur: (model: string) => void;
  errors: { [key: string]: string | null };
  touched: { [key: string]: boolean };
  formValues: any;
}

const MasterFormRow: React.FC<MasterFormRowProps> = ({
  fields,
  values,
  onChange,
  onBlur,
  errors,
  touched,
  formValues,
}) => {
  // Nhóm các field theo row (tổng column = 12)
  const groupFieldsByRow = () => {
    const rows: MasterComponentItem[][] = [];
    let currentRow: MasterComponentItem[] = [];
    let currentColumnSum = 0;

    fields.forEach((field) => {
      const column = field.column || 12;

      if (currentColumnSum + column > 12 && currentRow.length > 0) {
        // Bắt đầu row mới
        rows.push([...currentRow]);
        currentRow = [field];
        currentColumnSum = column;
      } else {
        currentRow.push(field);
        currentColumnSum += column;
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  };

  const rows = groupFieldsByRow();

  return (
    <View>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((field) => (
            <MasterFormItem
              key={`${field.model}-${rowIndex}`}
              field={field}
              value={values[field.model]}
              onChange={onChange}
              onBlur={onBlur}
              errors={errors}
              touched={touched}
              formValues={formValues}
            />
          ))}
          {/* Thêm View trống để fill các column còn thiếu trong row */}
          {getRemainingColumns(row) > 0 && (
            <View
              style={{ width: `${(getRemainingColumns(row) / 12) * 100}%` }}
            />
          )}
        </View>
      ))}
    </View>
  );
};

const getRemainingColumns = (row: MasterComponentItem[]): number => {
  const totalColumns = row.reduce(
    (sum, field) => sum + (field.column || 12),
    0,
  );
  return Math.max(0, 12 - totalColumns);
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
});

export default MasterFormRow;
