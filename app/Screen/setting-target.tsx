import { GOALSTATUS, STATUS, STATUS_COMPLETED } from "@/constants/constants";
import settingTargetService from "@/services/settingTargetService";
import { useErrorStore } from "@/store/errorStore";
import { useLoadingStore } from "@/store/loadingStore";
import { useSettingTargetStore } from "@/store/settingTargetStore";
import { CreateSettingTarget } from "@/typings/interfaces/settingTarget/settingTarget";
import { DateFormat } from "@/typings/types/DateType";
import { MasterComponentItem } from "@/typings/types/form.types";
import { GOALTYPE } from "@/typings/types/GoalType";
import { POSITION_TOAST } from "@/typings/types/PostionToast";
import { addDays, getCurrentDate } from "@/utils/dateHelpers";
import { scale } from "@/utils/responsive";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";
import ButtonComponent from "../components/ButtonComponent";
import FromComponent from "../components/form/FormComponent";
import ErrorDialog from "../components/UI/ErrorDialog";
import { Ionicons } from "@expo/vector-icons";

export default function SettingTarget() {
  const loadingStore = useLoadingStore();
  const settingTargetStore = useSettingTargetStore();

  const { hasError, clearError } = useErrorStore();
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const [isAdd, setIsAdd] = useState(true);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [goals, setGoals] = useState<CreateSettingTarget[]>([]);

  const initialValue: CreateSettingTarget = {
    user_id: "",
    goal_type: GOALTYPE.GAIN_WEIGHT,
    target_date: addDays(getCurrentDate(), 1),
    status: GOALSTATUS.ACTIVE,
    is_completed: STATUS_COMPLETED.INCOMPLETE,
    is_active: STATUS.ACTIVE,
    start_weight: 70,
    target_weight: 65,
    start_date: getCurrentDate(),
    weekly_change_rate: 0.5,
  };

  const [formData, setFormData] = useState<CreateSettingTarget>(initialValue);

  const goalTypeLabel: Record<number, string> = {
    [GOALTYPE.LOSE_WEIGHT]: "Giảm cân",
    [GOALTYPE.GAIN_WEIGHT]: "Tăng cân",
    [GOALTYPE.MAINTAIN_WEIGHT]: "Duy trì",
  };

  const goalStatusLabel: Record<number, string> = {
    [GOALSTATUS.ACTIVE]: "Đang hoạt động",
    [GOALSTATUS.PAUSED]: "Tạm dừng",
    [GOALSTATUS.COMPLETED]: "Đã đạt",
    [GOALSTATUS.ANBANDONED]: "Bị hủy",
  };

  const formFields: MasterComponentItem[] = [
    {
      type: "CheckBoxComponent",
      column: 12,
      model: "goal_type",
      info: {
        label: "Loại mục tiêu",
        required: true,
        direction: "row",
        returnType: "single",
        options: [
          { label: "Giảm cân", value: GOALTYPE.LOSE_WEIGHT },
          { label: "Tăng cân", value: GOALTYPE.GAIN_WEIGHT },
          { label: "Duy trì", value: GOALTYPE.MAINTAIN_WEIGHT },
        ],
      },
    },
    {
      type: "InputDecimalComponent",
      column: 6,
      model: "start_weight",
      info: {
        label: "Cân nặng ban đầu",
        required: true,
        decimalPlaces: 2,
        prefix: "kg",
        min: 1,
        max: 999999.99,
      },
    },
    {
      type: "InputDecimalComponent",
      column: 6,
      model: "target_weight",
      info: {
        label: "Cân nặng mục tiêu",
        required: true,
        decimalPlaces: 2,
        prefix: "kg",
        min: 1,
        max: 999999.99,
      },
    },
    {
      type: "DatePickerComponent",
      column: 6,
      model: "start_date",
      info: {
        label: "Ngày bắt đầu",
        required: true,
        mode: "date",
        format: DateFormat.DATE,
      },
    },
    {
      type: "DatePickerComponent",
      column: 6,
      model: "target_date",
      info: {
        label: "Ngày mục tiêu",
        required: true,
        mode: "date",
        format: DateFormat.DATE,
      },
    },
    {
      type: "InputDecimalComponent",
      column: 12,
      model: "weekly_change_rate",
      info: {
        label: "Tốc độ thay đổi mỗi tuần (kg)",
        required: true,
        decimalPlaces: 2,
        min: 0.1,
        max: 1.0,
      },
    },
    {
      type: "CheckBoxComponent",
      column: 6,
      model: "is_active",
      info: {
        label: "Mục tiêu theo dõi",
        options: [{ label: "Đang hoạt động", value: STATUS.ACTIVE }],
      },
    },
    {
      type: "CheckBoxComponent",
      column: 6,
      model: "is_completed",
      info: {
        label: "Đã đạt mục tiêu",
        options: [{ label: "Chưa đạt", value: STATUS_COMPLETED.INCOMPLETE }],
      },
    },
    {
      type: "CheckBoxComponent",
      column: 12,
      model: "status",
      info: {
        label: "Trạng thái mục tiêu",
        options: [
          { label: "Chưa đạt", value: GOALSTATUS.ACTIVE },
          { label: "Tạm dừng", value: GOALSTATUS.PAUSED },
          { label: "Đã đạt", value: GOALSTATUS.COMPLETED },
          { label: "Bị hủy", value: GOALSTATUS.ANBANDONED },
        ],
      },
    },
  ];

  const normalizeGoal = (goal: CreateSettingTarget) => {
    return {
      ...initialValue,
      ...goal,
    };
  };

  const handleDeleteGoal = (goal: CreateSettingTarget) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa mục tiêu ${goal.start_weight}kg → ${goal.target_weight}kg?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            loadingStore.setLoading(true);
            try {
              const success = await settingTargetService.delete("/api/goals/", [
                goal.id as string,
              ]);
              if (success) {
                Toast.success(
                  "Xóa mục tiêu thành công",
                  POSITION_TOAST.TOP,
                  "checkmark-circle-outline",
                );
                await fetchGoals(); // Refresh danh sách sau khi xóa
              }
            } catch (error) {
              console.log(error);
              Toast.error(
                "Xóa mục tiêu thất bại",
                POSITION_TOAST.TOP,
                "close-circle-outline",
              );
            } finally {
              loadingStore.setLoading(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleSubmit = async (values: CreateSettingTarget) => {
    loadingStore.setLoading(true);

    const payload = {
      goal_type: values.goal_type,
      start_weight: values.start_weight,
      target_weight: values.target_weight,
      weekly_change_rate: values.weekly_change_rate,
      start_date: values.start_date,
      target_date: values.target_date,
    };

    try {
      let response;

      if (isAdd) {
        response = await settingTargetService.post("/api/goals/", payload);
      } else {
        response = await settingTargetService.update(
          `/api/goals/${goalId}`,
          payload,
        );
      }

      if (response) {
        Toast.success(
          isAdd ? "Thêm mới thành công" : "Cập nhật thành công",
          POSITION_TOAST.TOP,
          "checkmark-circle-outline",
        );

        setTimeout(() => {
          setShowForm(false);
          setGoalId(null);
          setIsAdd(true);
          fetchGoals();
        }, 1000);
      }
    } catch (error) {
      console.log(error);
    }

    loadingStore.setLoading(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleAdd = () => {
    setIsAdd(true);
    setGoalId(null);
    setFormData(initialValue);
    setShowForm(true);
  };

  const handleEdit = (goal: CreateSettingTarget) => {
    setIsAdd(false);
    setGoalId(goal.id ?? null);
    setFormData(normalizeGoal(goal));
    setShowForm(true);
  };

  const fetchGoals = useCallback(async () => {
    loadingStore.setLoading(true);

    const response = await settingTargetStore.getBySelf("/api/goals/active");
    loadingStore.setLoading(false);

    let list: CreateSettingTarget[] = [];

    if (response) {
      list = [response as CreateSettingTarget];
    } else {
      list = [];
    }

    setGoals(list);
  }, [loadingStore, settingTargetStore]);

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCloseError = () => {
    clearError();
    setShowErrorDialog(false);
  };

  useEffect(() => {
    if (hasError) setShowErrorDialog(true);
  }, [hasError]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {showForm
            ? isAdd
              ? "Thêm mới mục tiêu"
              : "Cập nhật mục tiêu"
            : "Danh sách mục tiêu"}
        </Text>
      </View>

      {showForm ? (
        <FromComponent
          fields={formFields}
          initialValues={formData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {goals.length ? (
            goals.map((goal, index) => (
              <View
                key={goal.id ?? `goal-${index}`}
                style={styles.goalCardWrapper}
              >
                <TouchableOpacity
                  style={styles.goalCard}
                  onPress={() => handleEdit(goal)}
                  activeOpacity={0.7}
                >
                  <View style={styles.goalHeader}>
                    <View style={styles.goalTitleWrapper}>
                      <View style={styles.goalIconContainer}>
                        {goal.goal_type === GOALTYPE.LOSE_WEIGHT && (
                          <Ionicons
                            name="trending-down"
                            size={20}
                            color="#EF4444"
                          />
                        )}
                        {goal.goal_type === GOALTYPE.GAIN_WEIGHT && (
                          <Ionicons
                            name="trending-up"
                            size={20}
                            color="#10B981"
                          />
                        )}
                        {goal.goal_type === GOALTYPE.MAINTAIN_WEIGHT && (
                          <Ionicons name="fitness" size={20} color="#3B82F6" />
                        )}
                      </View>
                      <Text style={styles.goalTitle}>
                        {goalTypeLabel[goal.goal_type] || "Mục tiêu"}
                      </Text>
                    </View>

                    <View style={styles.headerActions}>
                      {goal.status === GOALSTATUS.ACTIVE && (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>
                            Đang thực hiện
                          </Text>
                        </View>
                      )}
                      <Ionicons
                        name="pencil-outline"
                        size={20}
                        color="#3B82F6"
                      />
                    </View>
                  </View>

                  <View style={styles.weightContainer}>
                    <View style={styles.weightItem}>
                      <Text style={styles.weightLabel}>Cân nặng hiện tại</Text>
                      <Text style={styles.weightValue}>
                        {goal.start_weight}
                      </Text>
                      <Text style={styles.weightUnit}>kg</Text>
                    </View>

                    <View style={styles.weightArrow}>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#CBD5E1"
                      />
                    </View>

                    <View style={styles.weightItem}>
                      <Text style={styles.weightLabel}>Mục tiêu</Text>
                      <Text style={styles.weightValue}>
                        {goal.target_weight}
                      </Text>
                      <Text style={styles.weightUnit}>kg</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.goalMetaContainer}>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#94A3B8"
                      />
                      <Text style={styles.metaText}>
                        {goal.start_date} → {goal.target_date}
                      </Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Ionicons
                        name="speedometer-outline"
                        size={14}
                        color="#94A3B8"
                      />
                      <Text style={styles.metaText}>
                        {goal.weekly_change_rate} kg/tuần
                      </Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  {/* {goal.goal_type !== GOALTYPE.MAINTAIN_WEIGHT && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(
                                Math.abs(
                                  ((goal.start_weight - goal.target_weight) /
                                    goal.start_weight) *
                                    100,
                                ),
                                100,
                              )}%`,
                              backgroundColor:
                                goal.goal_type === GOALTYPE.LOSE_WEIGHT
                                  ? "#EF4444"
                                  : "#10B981",
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {Math.abs(
                          ((goal.start_weight - goal.target_weight) /
                            goal.start_weight) *
                            100,
                        ).toFixed(1)}
                        % hoàn thành
                      </Text>
                    </View>
                  )} */}
                </TouchableOpacity>

                {/* Nút xóa */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteGoal(goal)}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <Text style={styles.deleteButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có mục tiêu</Text>
          )}

          <View style={styles.addButtonWrapper}>
            <ButtonComponent
              title="Thêm mục tiêu"
              onPress={handleAdd}
              variant="primary"
            />
          </View>
        </ScrollView>
      )}

      <ErrorDialog
        visible={showErrorDialog}
        onClose={handleCloseError}
        buttonText="Đóng"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: scale(8),
    marginVertical: scale(30),
  },
  header: {
    backgroundColor: "#EF4444",
    padding: scale(12),
    borderRadius: scale(8),
    marginVertical: scale(16),
  },
  headerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: scale(16),
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: scale(30),
  },
  goalCardWrapper: {
    marginBottom: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "white",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalCard: {
    padding: scale(16),
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(16),
  },
  goalTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  goalIconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  goalTitle: {
    fontWeight: "700",
    fontSize: scale(16),
    color: "#1E293B",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  activeBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(12),
  },
  activeBadgeText: {
    color: "#D97706",
    fontSize: scale(10),
    fontWeight: "600",
  },
  weightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(16),
  },
  weightItem: {
    flex: 1,
    alignItems: "center",
  },
  weightLabel: {
    fontSize: scale(12),
    color: "#64748B",
    marginBottom: scale(4),
  },
  weightValue: {
    fontSize: scale(24),
    fontWeight: "700",
    color: "#1E293B",
  },
  weightUnit: {
    fontSize: scale(12),
    color: "#94A3B8",
    marginTop: scale(2),
  },
  weightArrow: {
    paddingHorizontal: scale(8),
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: scale(12),
  },
  goalMetaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(12),
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  metaText: {
    fontSize: scale(12),
    color: "#64748B",
  },
  progressContainer: {
    marginTop: scale(8),
  },
  progressBar: {
    height: scale(6),
    backgroundColor: "#F1F5F9",
    borderRadius: scale(3),
    overflow: "hidden",
    marginBottom: scale(6),
  },
  progressFill: {
    height: "100%",
    borderRadius: scale(3),
  },
  progressText: {
    fontSize: scale(11),
    color: "#94A3B8",
    textAlign: "center",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(12),
    backgroundColor: "#FEF2F2",
    borderTopWidth: 1,
    borderTopColor: "#FEE2E2",
    gap: scale(6),
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: scale(14),
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginVertical: scale(20),
    fontSize: scale(14),
  },
  addButtonWrapper: {
    marginTop: scale(10),
  },
});
