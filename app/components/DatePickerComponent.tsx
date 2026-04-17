// components/DatePickerComponent.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, X, ChevronDown, Check } from "lucide-react-native";
import { DateFormat } from "@/typings/types/DateType";

interface DatePickerComponentProps {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  info: {
    label?: string;
    placeholder?: string;
    required?: boolean;
    mode?: "date" | "time" | "datetime";
    format?: string;
    minDate?: Date;
    maxDate?: Date;
    readonly?: boolean;
    disabled?: boolean;
  };
  error?: string;
  touched?: boolean;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  value,
  onChange,
  onBlur,
  info,
  error,
  touched,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  // Format date theo mode và format
  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    if (isNaN(date.getTime())) return "";

    const mode = info.mode || "date";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    if (mode === "time") {
      return `${hours}:${minutes}`;
    }

    if (mode === "datetime") {
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    // mode === "date" - chỉ trả về ngày, không có giờ
    const format = info.format || "DD/MM/YYYY";
    switch (format) {
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      default:
        return `${day}/${month}/${year}`;
    }
  };

  // Lấy chỉ phần ngày (set giờ về 00:00:00)
  const getDateOnly = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Format date chỉ lấy ngày cho output (YYYY-MM-DD)
  const formatDateOnly = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Parse string thành Date
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    const mode = info.mode || "date";
    const format = info.format || "DD/MM/YYYY";

    if (mode === "time") {
      const parts = dateString.split(":");
      if (parts.length === 2) {
        const date = new Date();
        date.setHours(parseInt(parts[0]), parseInt(parts[1]), 0);
        return date;
      }
      return null;
    }

    if (mode === "datetime") {
      const [datePart, timePart] = dateString.split(" ");
      if (datePart && timePart) {
        const dateParts = datePart.split("/");
        const timeParts = timePart.split(":");
        if (dateParts.length === 3 && timeParts.length === 2) {
          return new Date(
            parseInt(dateParts[2]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[0]),
            parseInt(timeParts[0]),
            parseInt(timeParts[1]),
          );
        }
      }
      return null;
    }

    // mode === "date" - parse YYYY-MM-DD
    if (format === DateFormat.DATE || format === "YYYY-MM-DD") {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        return new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2]),
        );
      }
    } else if (format === "DD/MM/YYYY") {
      const parts = dateString.split("/");
      if (parts.length === 3) {
        return new Date(
          parseInt(parts[2]),
          parseInt(parts[1]) - 1,
          parseInt(parts[0]),
        );
      }
    } else if (format === "MM/DD/YYYY") {
      const parts = dateString.split("/");
      if (parts.length === 3) {
        return new Date(
          parseInt(parts[2]),
          parseInt(parts[0]) - 1,
          parseInt(parts[1]),
        );
      }
    }

    return null;
  };

  // Sync value từ props vào state
  useEffect(() => {
    if (value) {
      let date: Date | null = null;

      if (value instanceof Date) {
        date = value;
      } else if (typeof value === "string") {
        date = parseDate(value);
      }

      if (date && !isNaN(date.getTime())) {
        // Nếu là mode date, chỉ lấy phần ngày
        if (info.mode === "date") {
          date = getDateOnly(date);
        }
        setSelectedDate(date);
        setTempDate(date);
      } else {
        setSelectedDate(null);
        setTempDate(new Date());
      }
    } else {
      setSelectedDate(null);
      setTempDate(new Date());
    }
  }, [value, info.mode]);

  // Xử lý khi chọn ngày trên Android
  const handleDateChangeAndroid = (event: any, date?: Date) => {
    setShowPicker(false);
    if (date && !isNaN(date.getTime())) {
      let finalDate = date;
      
      // Nếu là mode date, chỉ lấy phần ngày
      if (info.mode === "date") {
        finalDate = getDateOnly(date);
      }
      
      setSelectedDate(finalDate);
      
      // Output format: YYYY-MM-DD cho date mode
      let outputValue;
      if (info.mode === "date") {
        outputValue = formatDateOnly(finalDate);
      } else {
        outputValue = formatDate(finalDate);
      }
      
      onChange(outputValue);
    }
    if (onBlur) onBlur();
  };

  // Xử lý khi chọn ngày trên iOS (tạm thời)
  const handleDateChangeIOS = (event: any, date?: Date) => {
    if (date && !isNaN(date.getTime())) {
      let finalDate = date;
      
      // Nếu là mode date, chỉ lấy phần ngày
      if (info.mode === "date") {
        finalDate = getDateOnly(date);
      }
      
      setTempDate(finalDate);
    }
  };

  // iOS: confirm
  const handleConfirmIOS = () => {
    setShowPicker(false);
    
    let finalDate = tempDate;
    
    // Nếu là mode date, chỉ lấy phần ngày
    if (info.mode === "date") {
      finalDate = getDateOnly(tempDate);
    }
    
    setSelectedDate(finalDate);
    
    // Output format: YYYY-MM-DD cho date mode
    let outputValue;
    if (info.mode === "date") {
      outputValue = formatDateOnly(finalDate);
    } else {
      outputValue = formatDate(finalDate);
    }
    
    onChange(outputValue);
    if (onBlur) onBlur();
  };

  // iOS: cancel
  const handleCancelIOS = () => {
    setShowPicker(false);
    setTempDate(selectedDate || new Date());
  };

  // Xóa ngày đã chọn
  const handleClear = () => {
    setSelectedDate(null);
    onChange(null);
    if (onBlur) onBlur();
  };

  // Mở date picker
  const showDatePicker = () => {
    if (!info.disabled && !info.readonly) {
      setShowPicker(true);
    }
  };

  const displayText = formatDate(selectedDate);
  const placeholder = info.placeholder || "Chọn ngày";

  // Hàm render nội dung modal cho iOS
  const renderIOSPicker = () => {
    const modeText = info.mode === "date" ? "Chọn ngày" : info.mode === "time" ? "Chọn giờ" : "Chọn ngày và giờ";
    
    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={showPicker}
        onRequestClose={handleCancelIOS}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={handleCancelIOS}>
            <View style={styles.modalBackground} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContent}>
            {/* Header với thanh trượt indicator */}
            <View style={styles.modalDragBar}>
              <View style={styles.dragBar} />
            </View>
            
            {/* Title và buttons */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancelIOS} style={styles.modalButton}>
                <Text style={styles.modalCancelButton}>Hủy</Text>
              </TouchableOpacity>
              
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{modeText}</Text>
                {selectedDate && (
                  <Text style={styles.modalSubtitle}>
                    Đã chọn: {formatDate(selectedDate)}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity onPress={handleConfirmIOS} style={[styles.modalButton, styles.confirmButton]}>
                <Check size={20} color="#6B4EFF" />
                <Text style={styles.modalConfirmButton}>Xong</Text>
              </TouchableOpacity>
            </View>
            
            {/* Divider */}
            <View style={styles.divider} />
            
            {/* Date Picker */}
            <DateTimePicker
              value={tempDate}
              mode={info.mode || "date"}
              display="spinner"
              onChange={handleDateChangeIOS}
              minimumDate={info.minDate}
              maximumDate={info.maxDate}
              locale="vi_VN"
              style={styles.iosPicker}
              themeVariant="light"
              textColor="#333"
            />
            
            {/* Nút chọn nhanh hôm nay (chỉ cho mode date) */}
            {info.mode === "date" && (
              <TouchableOpacity 
                style={styles.todayButton}
                onPress={() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  setTempDate(today);
                }}
              >
                <Text style={styles.todayButtonText}>Hôm nay</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      {info.label && (
        <Text style={styles.label}>
          {info.label}
          {info.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Input field */}
      <TouchableOpacity
        style={[
          styles.inputContainer,
          touched && error && styles.inputError,
          (info.disabled || info.readonly) && styles.inputDisabled,
        ]}
        onPress={showDatePicker}
        disabled={info.disabled || info.readonly}
        activeOpacity={0.7}
      >
        <View style={styles.inputWrapper}>
          <Calendar size={20} color="#6B4EFF" style={styles.calendarIcon} />
          <Text
            style={[styles.inputText, !selectedDate && styles.placeholderText]}
          >
            {displayText || placeholder}
          </Text>
          {selectedDate && !info.disabled && !info.readonly && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <X size={16} color="#999" />
            </TouchableOpacity>
          )}
          <ChevronDown size={16} color="#999" style={styles.dropdownIcon} />
        </View>
      </TouchableOpacity>

      {/* Error message */}
      {touched && error && <Text style={styles.errorText}>{error}</Text>}

      {/* Android DatePicker */}
      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode={info.mode || "date"}
          display="default"
          onChange={handleDateChangeAndroid}
          minimumDate={info.minDate}
          maximumDate={info.maxDate}
        />
      )}

      {/* iOS DatePicker với Modal đẹp */}
      {showPicker && Platform.OS === "ios" && renderIOSPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  required: {
    color: "#ff3b30",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#fff",
    minHeight: 50,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  calendarIcon: {
    marginRight: 10,
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 12,
  },
  placeholderText: {
    color: "#999",
  },
  clearButton: {
    padding: 4,
  },
  inputError: {
    borderColor: "#ff3b30",
    borderWidth: 1.5,
  },
  inputDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  // iOS Modal styles - cải thiện
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalDragBar: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragBar: {
    width: 36,
    height: 5,
    backgroundColor: "#C4C4C4",
    borderRadius: 3,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
    alignItems: "center",
  },
  confirmButton: {
    flexDirection: "row",
    gap: 4,
  },
  modalTitleContainer: {
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  modalCancelButton: {
    fontSize: 17,
    color: "#FF3B30",
    fontWeight: "500",
  },
  modalConfirmButton: {
    fontSize: 17,
    color: "#6B4EFF",
    fontWeight: "600",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginHorizontal: 0,
  },
  iosPicker: {
    height: 216,
    backgroundColor: "#fff",
  },
  todayButton: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  todayButtonText: {
    fontSize: 16,
    color: "#6B4EFF",
    fontWeight: "600",
  },

});

export default DatePickerComponent;