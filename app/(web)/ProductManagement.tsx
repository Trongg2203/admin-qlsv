import { usePaginationStore } from "@/store/paginationStore";
import { useProductStore } from "@/store/productStore";
import { Product } from "@/typings/interfaces/product/product";
import { resolveImageUrl } from "@/utils/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, View } from "react-native";
import ToastManager from "toastify-react-native/components/ToastManager";
import TableComponent, {
    Column,
} from "../components/webComponent/TableComponent";
import AddOrEditProduct from "./AddOrEditProduct";

const MEAL_TYPE_LABEL: Record<number, string> = {
  0: "Bất kỳ",
  1: "Sáng",
  2: "Trưa",
  3: "Tối",
  4: "Phụ",
};

export default function ProductManagementScreen() {
  const {
    products,
    categories,
    loading,
    fetchProducts,
    fetchCategories,
    deleteProduct,
  } = useProductStore();
  const {
    currentPage,
    pageSize,
    searchTerm,
    sortBy,
    sortOrder,
    resetPagination,
  } = usePaginationStore();

  const [showForm, setShowForm] = useState(false);
  const [isAdd, setIsAdd] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);

  const productQuery = useMemo(
    () => ({
      page: currentPage,
      itemsPerPage: pageSize,
      search: searchTerm || undefined,
      sortBy: sortBy || undefined,
      sortDesc: sortOrder,
    }),
    [currentPage, pageSize, searchTerm, sortBy, sortOrder],
  );

  useEffect(() => {
    resetPagination();
    fetchCategories();
  }, [fetchCategories, resetPagination]);

  const loadProducts = useCallback(async () => {
    await fetchProducts(productQuery);
  }, [fetchProducts, productQuery]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleRefresh = useCallback(async () => {
    await loadProducts();
  }, [loadProducts]);

  const columns: Column[] = [
    {
      key: "image_url",
      title: "Ảnh",
      width: 70,
      render: (value) => (
        <Image
          source={{ uri: resolveImageUrl(value) }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 6,
            backgroundColor: "#f3f4f6",
          }}
        />
      ),
    },
    {
      key: "name",
      title: "Tên món",
      width: "22%",
      isSearch: true,
      sortable: true,
    },
    {
      key: "category_id",
      title: "Danh mục",
      width: "16%",
      render: (_v, item) =>
        item.category?.name ??
        categories.find((c) => c.id === item.category_id)?.name ??
        "—",
    },
    {
      key: "calories",
      title: "Calo",
      width: 90,
      sortable: true,
      render: (v) => `${Math.round(Number(v) || 0)} kcal`,
    },
    {
      key: "meal_type",
      title: "Bữa",
      width: 90,
      render: (v) => MEAL_TYPE_LABEL[Number(v)] ?? "—",
    },
    {
      key: "popularity_score",
      title: "Phổ biến",
      width: 90,
      sortable: true,
    },
  ];

  const handleAdd = () => {
    setIsAdd(true);
    setSelected(null);
    setShowForm(true);
  };

  const handleEdit = (item: Product) => {
    setIsAdd(false);
    setSelected(item);
    setShowForm(true);
  };

  const handleDelete = (item: Product) => {
    Alert.alert("Xác nhận xoá", `Xoá món "${item.name}"?`, [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          const ok = await deleteProduct(item.id);
          ToastManager.show({
            type: ok ? "success" : "error",
            text1: ok ? "Đã xoá món ăn" : "Xoá thất bại",
          });
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f3f4f6" }}>
      <TableComponent
        data={products}
        columns={columns}
        title="Quản lý món ăn"
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={handleRefresh}
        tableWidth="100%"
        showDefaultActions={true}
        globalSearch={true}
        searchable={true}
        emptyMessage="Chưa có món ăn nào"
        actionDirection="horizontal"
      />

      {showForm && (
        <AddOrEditProduct
          isAdd={isAdd}
          product={selected}
          onClose={() => setShowForm(false)}
          onSaved={() => setShowForm(false)}
        />
      )}
    </View>
  );
}
