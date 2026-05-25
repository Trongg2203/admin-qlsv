import { useProductStore } from "@/store/productStore";
import {
  Product,
  ProductImage,
  ProductPayload,
} from "@/typings/interfaces/product/product";
import { MasterComponentItem } from "@/typings/types/form.types";
import { resolveImageUrl } from "@/utils/image";
import { ImagePlus, Trash2, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ToastManager from "toastify-react-native/components/ToastManager";
import FormComponent from "../components/form/FormComponent";

interface Props {
  isAdd: boolean;
  product?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

const MEAL_TYPE_OPTIONS = [
  { label: "Bất kỳ", value: 0 },
  { label: "Sáng", value: 1 },
  { label: "Trưa", value: 2 },
  { label: "Tối", value: 3 },
  { label: "Phụ", value: 4 },
];

export default function AddOrEditProduct({
  isAdd,
  product,
  onClose,
  onSaved,
}: Props) {
  const {
    categories,
    createProduct,
    updateProduct,
    fetchImages,
    uploadImages,
    deleteImage,
  } = useProductStore();

  const [images, setImages] = useState<ProductImage[]>([]);
  const [imgBusy, setImgBusy] = useState(false);

  const foodId = product?.id;

  const initialValues = useMemo(
    () => ({
      name: product?.name ?? "",
      category_id: product?.category_id ?? categories[0]?.id ?? "",
      meal_type: product?.meal_type ?? 0,
      serving_size: product?.serving_size != null ? Number(product.serving_size) : 100,
      serving_unit: product?.serving_unit ?? "g",
      calories: product?.calories != null ? Number(product.calories) : 0,
      protein: product?.protein != null ? Number(product.protein) : 0,
      carbs: product?.carbs != null ? Number(product.carbs) : 0,
      fat: product?.fat != null ? Number(product.fat) : 0,
    }),
    [product, categories],
  );

  const fields: MasterComponentItem[] = useMemo(
    () => [
      {
        type: "InputComponent",
        column: 12,
        model: "name",
        info: { label: "Tên món ăn", required: true },
      },
      {
        type: "CheckBoxComponent",
        column: 12,
        model: "category_id",
        info: {
          label: "Danh mục",
          required: true,
          direction: "row",
          returnType: "single",
          options: categories.map((c) => ({ label: c.name, value: c.id })),
        },
      },
      {
        type: "CheckBoxComponent",
        column: 12,
        model: "meal_type",
        info: {
          label: "Loại bữa",
          direction: "row",
          returnType: "single",
          options: MEAL_TYPE_OPTIONS,
        },
      },
      {
        type: "InputDecimalComponent",
        column: 6,
        model: "serving_size",
        info: { label: "Khẩu phần", required: true, decimalPlaces: 0, suffix: "g", min: 1 },
      },
      {
        type: "InputComponent",
        column: 6,
        model: "serving_unit",
        info: { label: "Đơn vị" },
      },
      {
        type: "InputDecimalComponent",
        column: 6,
        model: "calories",
        info: { label: "Calo", required: true, decimalPlaces: 0, suffix: "kcal", min: 0 },
      },
      {
        type: "InputDecimalComponent",
        column: 6,
        model: "protein",
        info: { label: "Đạm", required: true, decimalPlaces: 1, suffix: "g", min: 0 },
      },
      {
        type: "InputDecimalComponent",
        column: 6,
        model: "carbs",
        info: { label: "Tinh bột", required: true, decimalPlaces: 1, suffix: "g", min: 0 },
      },
      {
        type: "InputDecimalComponent",
        column: 6,
        model: "fat",
        info: { label: "Chất béo", required: true, decimalPlaces: 1, suffix: "g", min: 0 },
      },
    ],
    [categories],
  );

  const loadImages = async () => {
    if (!foodId) return;
    setImages(await fetchImages(foodId));
  };

  useEffect(() => {
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodId]);

  const handleSubmit = async (values: any) => {
    const payload: ProductPayload = {
      name: values.name,
      category_id: values.category_id,
      meal_type: Number(values.meal_type),
      serving_size: Number(values.serving_size),
      serving_unit: values.serving_unit || "g",
      calories: Number(values.calories),
      protein: Number(values.protein),
      carbs: Number(values.carbs),
      fat: Number(values.fat),
    };

    const ok = isAdd
      ? !!(await createProduct(payload))
      : await updateProduct(foodId as string, payload);

    if (ok) {
      ToastManager.show({
        type: "success",
        text1: isAdd ? "Đã thêm món ăn" : "Đã cập nhật món ăn",
      });
      onSaved();
    } else {
      ToastManager.show({ type: "error", text1: "Lưu món ăn thất bại" });
    }
  };

  const handlePickImage = async () => {
    if (!foodId) return;
    let ImagePicker: any;
    try {
      // Lazy-require so the app still bundles if the dependency isn't installed.
      ImagePicker = require("expo-image-picker");
    } catch {
      ToastManager.show({
        type: "error",
        text1: "Thiếu thư viện chọn ảnh",
        text2: "Chạy: npx expo install expo-image-picker",
      });
      return;
    }

    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        ToastManager.show({ type: "error", text1: "Cần quyền truy cập thư viện ảnh" });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images ?? "images",
        quality: 0.8,
      });
      if (result.canceled) return;

      setImgBusy(true);
      const asset = result.assets[0];
      await uploadImages(foodId, [
        { uri: asset.uri, name: asset.fileName ?? undefined, type: asset.mimeType ?? undefined },
      ]);
      await loadImages();
      ToastManager.show({ type: "success", text1: "Tải ảnh thành công" });
    } catch (e) {
      console.log("upload image error", e);
      ToastManager.show({ type: "error", text1: "Tải ảnh thất bại" });
    } finally {
      setImgBusy(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!foodId) return;
    setImgBusy(true);
    try {
      const ok = await deleteImage(foodId, imageId);
      if (ok) await loadImages();
      ToastManager.show({
        type: ok ? "success" : "error",
        text1: ok ? "Đã xoá ảnh" : "Xoá ảnh thất bại",
      });
    } finally {
      setImgBusy(false);
    }
  };

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <View
        style={{
          width: 820,
          maxWidth: "95%",
          maxHeight: "92%",
          backgroundColor: "#fff",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {isAdd ? "Thêm món ăn" : "Chỉnh sửa món ăn"}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color="#111" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ maxHeight: 640 }}>
          <FormComponent
            fields={fields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />

          {/* Image management — only after the food exists */}
          <View style={{ padding: 16, paddingTop: 0 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600" }}>Hình ảnh</Text>
              {!isAdd && (
                <TouchableOpacity
                  onPress={handlePickImage}
                  disabled={imgBusy}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: "#2563eb",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    opacity: imgBusy ? 0.6 : 1,
                  }}
                >
                  {imgBusy ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <ImagePlus size={16} color="#fff" />
                  )}
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Thêm ảnh</Text>
                </TouchableOpacity>
              )}
            </View>

            {isAdd ? (
              <Text style={{ color: "#6b7280", fontSize: 12 }}>
                Lưu món ăn trước, sau đó mở lại để thêm hình ảnh.
              </Text>
            ) : images.length === 0 ? (
              <Text style={{ color: "#6b7280", fontSize: 12 }}>Chưa có ảnh.</Text>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {images.map((img) => (
                  <View key={img.id} style={{ width: 110 }}>
                    <Image
                      source={{ uri: resolveImageUrl(img.thumb_url || img.url) }}
                      style={{
                        width: 110,
                        height: 110,
                        borderRadius: 8,
                        backgroundColor: "#f3f4f6",
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => handleDeleteImage(img.id)}
                      disabled={imgBusy}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        marginTop: 6,
                      }}
                    >
                      <Trash2 size={14} color="#dc2626" />
                      <Text style={{ color: "#dc2626", fontSize: 12 }}>Xoá</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
