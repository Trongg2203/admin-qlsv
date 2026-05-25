// components/core/TableComponent.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  Mail,
  Phone,
  RefreshCw,
} from "lucide-react-native";
import { usePaginationStore } from "@/store/paginationStore";

export type SearchType =
  | "text"
  | "number"
  | "date"
  | "email"
  | "phone"
  | "select";

export interface Column {
  key: string;
  title: string;
  width?: number | string;
  render?: (value: any, item: any, index: number) => React.ReactNode;
  sortable?: boolean;
  isSearch?: boolean;
  searchType?: SearchType;
  searchOptions?: { label: string; value: string }[];
  placeholder?: string;
}

export interface Action {
  key: string;
  label: string;
  icon?: any;
  color?: string;
  onPress: (item: any) => void;
  show?: (item: any) => boolean;
}

interface TableComponentProps {
  data: any[];
  columns: Column[];
  actions?: Action[];
  title?: string;
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => Promise<void> | void;
  onRefresh?: () => Promise<void>;
  searchable?: boolean;
  globalSearch?: boolean;
  pagination?: boolean;
  pageSize?: number;
  rowsPerPageOptions?: number[];
  selectionMode?: "single" | "multiple" | "none";
  onSelectionChange?: (selectedItems: any[]) => void;
  emptyMessage?: string;
  customStyles?: any;
  tableWidth?: number | string;
  showDefaultActions?: boolean;
  actionButtonSize?: "small" | "medium" | "large";
  actionPosition?: "start" | "end";
  actionDirection?: "horizontal" | "vertical";
  // Props để sync với store
  useStorePagination?: boolean;
  storeKey?: string; // Nếu có nhiều bảng khác nhau
  onPaginationChange?: (pagination: { page: number; perPage: number }) => void;
}

export default function TableComponent({
  data = [],
  columns,
  actions = [],
  title,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  searchable = true,
  globalSearch = true,
  pagination = true,
  pageSize: initialPageSize = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  selectionMode = "none",
  onSelectionChange,
  emptyMessage = "Không có dữ liệu",
  customStyles = {},
  tableWidth = "100%",
  showDefaultActions = true,
  actionButtonSize = "medium",
  actionPosition = "end",
  actionDirection = "horizontal",
  useStorePagination = true, // Sử dụng store thay vì local state
  storeKey = "default",
  onPaginationChange,
}: TableComponentProps) {
  const tableDimension = tableWidth as any;
  // Sử dụng store
  const {
    currentPage: storeCurrentPage,
    pageSize: storePageSize,
    totalPages: storeTotalPages,
    totalItems: storeTotalItems,
    searchTerm: storeSearchTerm,
    sortBy: storeSortBy,
    sortOrder: storeSortOrder,
    setCurrentPage,
    setPageSize,
    setSearchTerm,
    setSortBy,
    setSortOrder,
  } = usePaginationStore();

  // State local (chỉ dùng khi useStorePagination = false)
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(initialPageSize);
  const [localTotalPages, setLocalTotalPages] = useState(1);
  const [localTotalItems, setLocalTotalItems] = useState(0);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localSortColumn, setLocalSortColumn] = useState<string>("");
  const [localSortDirection, setLocalSortDirection] = useState<"asc" | "desc">(
    "asc",
  );

  // Chọn dùng store hay local
  const currentPage = useStorePagination ? storeCurrentPage : localCurrentPage;
  const pageSize = useStorePagination ? storePageSize : localPageSize;
  const totalPages = useStorePagination ? storeTotalPages : localTotalPages;
  const totalItems = useStorePagination ? storeTotalItems : localTotalItems;
  const searchTerm = useStorePagination ? storeSearchTerm : localSearchTerm;
  const sortColumn = useStorePagination ? storeSortBy : localSortColumn;
  const sortDirection = useStorePagination
    ? storeSortOrder
    : localSortDirection;

  // Actions
  const handleSetCurrentPage = useCallback(
    (page: number) => {
      if (useStorePagination) {
        setCurrentPage(page);
      } else {
        setLocalCurrentPage(page);
      }
    },
    [useStorePagination, setCurrentPage],
  );

  const handleSetPageSize = useCallback(
    (size: number) => {
      if (useStorePagination) {
        setPageSize(size);
      } else {
        setLocalPageSize(size);
        setLocalCurrentPage(1);
      }
    },
    [useStorePagination, setPageSize],
  );

  const handleSetSearchTerm = useCallback(
    (term: string) => {
      if (useStorePagination) {
        setSearchTerm(term);
      } else {
        setLocalSearchTerm(term);
        setLocalCurrentPage(1);
      }
    },
    [useStorePagination, setSearchTerm],
  );

  const handleSetSort = useCallback(
    (column: string, order: "asc" | "desc") => {
      if (useStorePagination) {
        setSortBy(column);
        setSortOrder(order);
      } else {
        setLocalSortColumn(column);
        setLocalSortDirection(order);
      }
    },
    [useStorePagination, setSortBy, setSortOrder],
  );

  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {},
  );
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showColumnFilters, setShowColumnFilters] = useState(false);

  const searchableColumns = columns.filter((col) => col.isSearch);
  const hasCustomActions = actions.length > 0;
  const hasDefaultActions = (onEdit || onDelete) && showDefaultActions;
  const showActionsColumn = hasCustomActions || hasDefaultActions;

  // Chỉ sync pageSize từ prop khi dùng local pagination.
  // Với store pagination, pageSize phải giữ theo state/API để tránh bị reset.
  useEffect(() => {
    if (!useStorePagination && initialPageSize !== pageSize) {
      handleSetPageSize(initialPageSize);
    }
  }, [useStorePagination, initialPageSize, pageSize, handleSetPageSize]);

  const getActionButtonSize = () => {
    switch (actionButtonSize) {
      case "small":
        return { padding: 4, fontSize: 11, gap: 3 };
      case "large":
        return { padding: 8, fontSize: 13, gap: 6 };
      default:
        return { padding: 6, fontSize: 12, gap: 4 };
    }
  };

  const buttonSize = getActionButtonSize();

  const columnWidths = useMemo(() => {
    const widths: Record<string, number | string> = {};
    let percentSum = 0;

    columns.forEach((col) => {
      if (col.width) {
        if (typeof col.width === "number") {
          widths[col.key] = col.width;
        } else if (typeof col.width === "string" && col.width.includes("%")) {
          const percent = parseFloat(col.width);
          percentSum += percent;
          widths[col.key] = col.width;
        }
      }
    });

    const hasSelection = selectionMode !== "none";
    const remainingPercent = 100 - percentSum;
    const autoColumnsCount = columns.filter((col) => !col.width).length;
    const autoColumnPercent =
      autoColumnsCount > 0 ? remainingPercent / autoColumnsCount : 0;

    columns.forEach((col) => {
      if (!col.width) {
        widths[col.key] = `${autoColumnPercent}%`;
      }
    });

    if (hasSelection) {
      widths["_selection"] = 50;
    }

    if (showActionsColumn) {
      widths["_actions"] =
        actionDirection === "vertical"
          ? actionButtonSize === "small"
            ? 80
            : 100
          : actionButtonSize === "small"
            ? 120
            : "auto";
    }

    return widths;
  }, [
    columns,
    selectionMode,
    showActionsColumn,
    actionButtonSize,
    actionDirection,
  ]);

  const getColumnWidthStyle = (columnKey: string): any => {
    const width = columnWidths[columnKey];
    if (!width) return { flex: 1, minWidth: 100 };
    if (typeof width === "number") {
      return { width, minWidth: width };
    }
    return { width, minWidth: 80 };
  };

  // Filter và sort data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (globalSearch && searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesGlobalSearch = searchableColumns.some((column) => {
          const value = item[column.key];
          return value && value.toString().toLowerCase().includes(searchLower);
        });
        if (!matchesGlobalSearch) return false;
      }

      for (const [key, filterValue] of Object.entries(columnFilters)) {
        if (filterValue) {
          const itemValue = item[key];
          if (
            !itemValue ||
            !itemValue
              .toString()
              .toLowerCase()
              .includes(filterValue.toLowerCase())
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchTerm, columnFilters, searchableColumns, globalSearch]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Cập nhật totalPages và totalItems từ dữ liệu đã lọc (khi không dùng API)
  useEffect(() => {
    if (!useStorePagination && pagination) {
      const newTotalPages = Math.ceil(sortedData.length / pageSize);
      if (newTotalPages !== totalPages) {
        setLocalTotalPages(newTotalPages);
      }
      if (sortedData.length !== totalItems) {
        setLocalTotalItems(sortedData.length);
      }
    }
  }, [sortedData, pageSize, pagination, useStorePagination, totalPages, totalItems]);

  const paginatedData = pagination
    ? useStorePagination
      ? sortedData
      : sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  // Khi dùng server-side pagination, parent sẽ call API lại theo page/perPage mới
  useEffect(() => {
    if (!pagination || !useStorePagination || !onPaginationChange) {
      return;
    }
    onPaginationChange({
      page: currentPage,
      perPage: pageSize,
    });
  }, [
    pagination,
    useStorePagination,
    currentPage,
    pageSize,
    onPaginationChange,
  ]);

  // Reset page khi search hoặc filter thay đổi
  useEffect(() => {
    if (currentPage !== 1) {
      handleSetCurrentPage(1);
    }
  }, [searchTerm, columnFilters, pageSize, currentPage, handleSetCurrentPage]);

  const handleSort = (column: Column) => {
    if (!column.sortable) return;
    if (sortColumn === column.key) {
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      handleSetSort(column.key, newDirection);
    } else {
      handleSetSort(column.key, "asc");
    }
  };

  const toggleSelection = (item: any) => {
    if (selectionMode === "none") return;
    let newSelected;
    if (selectedItems.find((i) => i.id === item.id)) {
      newSelected = selectedItems.filter((i) => i.id !== item.id);
    } else if (selectionMode === "single") {
      newSelected = [item];
    } else {
      newSelected = [...selectedItems, item];
    }
    setSelectedItems(newSelected);
    onSelectionChange?.(newSelected);
  };

  const toggleSelectAll = () => {
    let newSelected: any;
    if (selectedItems.length === paginatedData.length) {
      newSelected = [];
    } else {
      newSelected = [...paginatedData];
    }
    setSelectedItems(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleDeleteLocal = (item: any) => {
    setItemToDelete(item);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (onDelete && itemToDelete) {
      await onDelete(itemToDelete);
    }
    setDeleteConfirmVisible(false);
    setItemToDelete(null);
    if (selectedItems.find((i) => i.id === itemToDelete?.id)) {
      setSelectedItems((prev) => prev.filter((i) => i.id !== itemToDelete?.id));
    }
    if (onRefresh) {
      await onRefresh();
    }
  };

  const handleRefreshLocal = async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setRefreshing(false);
  };

  const clearFilters = () => {
    handleSetSearchTerm("");
    setColumnFilters({});
    if (useStorePagination) {
      setSortBy("");
      setSortOrder("asc");
    } else {
      setLocalSortColumn("");
      setLocalSortDirection("asc");
    }
  };

  const renderColumnSearch = (column: Column) => {
    const value = columnFilters[column.key] || "";
    const searchType = column.searchType || "text";

    const getIcon = () => {
      switch (searchType) {
        case "email":
          return <Mail size={14} color="#94a3b8" />;
        case "phone":
          return <Phone size={14} color="#94a3b8" />;
        case "date":
          return <Calendar size={14} color="#94a3b8" />;
        case "select":
          return <Filter size={14} color="#94a3b8" />;
        default:
          return <Search size={14} color="#94a3b8" />;
      }
    };

    if (searchType === "select" && column.searchOptions) {
      return (
        <View style={styles.columnFilterSelect}>
          <select
            value={value}
            onChange={(e) => {
              setColumnFilters((prev) => ({
                ...prev,
                [column.key]: e.target.value,
              }));
            }}
            style={styles.selectInput}
          >
            <option value="">Tất cả</option>
            {column.searchOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </View>
      );
    }

    return (
      <View style={styles.columnFilterInput}>
        {getIcon()}
        <TextInput
          style={styles.columnSearchInput}
          placeholder={column.placeholder || `Tìm ${column.title}...`}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={(text) => {
            setColumnFilters((prev) => ({
              ...prev,
              [column.key]: text,
            }));
          }}
        />
        {value ? (
          <TouchableOpacity
            onPress={() => {
              setColumnFilters((prev) => {
                const newFilters = { ...prev };
                delete newFilters[column.key];
                return newFilters;
              });
            }}
          >
            <X size={14} color="#94a3b8" />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderActionButtons = (item: any) => {
    const buttons = [];

    if (hasCustomActions) {
      actions.forEach((action) => {
        if (!action.show || action.show(item)) {
          buttons.push(
            <TouchableOpacity
              key={action.key}
              onPress={() => action.onPress(item)}
              style={[
                styles.actionButton,
                actionDirection === "vertical" && styles.actionButtonVertical,
                {
                  gap: buttonSize.gap,
                  paddingVertical: buttonSize.padding,
                  paddingHorizontal: buttonSize.padding * 2,
                  width: actionDirection === "vertical" ? "100%" : "auto",
                },
              ]}
            >
              {action.icon && (
                <action.icon size={16} color={action.color || "#6B4EFF"} />
              )}
              <Text
                style={[
                  styles.actionText,
                  {
                    color: action.color || "#6B4EFF",
                    fontSize: buttonSize.fontSize,
                  },
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>,
          );
        }
      });
    }

    if (showDefaultActions) {
      if (onEdit) {
        buttons.push(
          <TouchableOpacity
            key="default-edit"
            onPress={() => onEdit(item)}
            style={[
              styles.actionButton,
              actionDirection === "vertical" && styles.actionButtonVertical,
              {
                gap: buttonSize.gap,
                paddingVertical: buttonSize.padding,
                paddingHorizontal: buttonSize.padding * 2,
                width: actionDirection === "vertical" ? "100%" : "auto",
              },
            ]}
          >
            <Edit size={16} color="#3b82f6" />
            <Text
              style={[
                styles.actionText,
                { color: "#3b82f6", fontSize: buttonSize.fontSize },
              ]}
            >
              Sửa
            </Text>
          </TouchableOpacity>,
        );
      }

      if (onDelete) {
        buttons.push(
          <TouchableOpacity
            key="default-delete"
            onPress={() => handleDeleteLocal(item)}
            style={[
              styles.actionButton,
              actionDirection === "vertical" && styles.actionButtonVertical,
              {
                gap: buttonSize.gap,
                paddingVertical: buttonSize.padding,
                paddingHorizontal: buttonSize.padding * 2,
                width: actionDirection === "vertical" ? "100%" : "auto",
              },
            ]}
          >
            <Trash2 size={16} color="#ef4444" />
            <Text
              style={[
                styles.actionText,
                { color: "#ef4444", fontSize: buttonSize.fontSize },
              ]}
            >
              Xóa
            </Text>
          </TouchableOpacity>,
        );
      }
    }

    return buttons;
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.headerActions}>
        {globalSearch && searchable && searchableColumns.length > 0 && (
          <View style={styles.searchContainer}>
            <Search size={18} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm toàn bộ..."
              placeholderTextColor="#94a3b8"
              value={searchTerm}
              onChangeText={handleSetSearchTerm}
            />
            {searchTerm ? (
              <TouchableOpacity onPress={() => handleSetSearchTerm("")}>
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {searchable && searchableColumns.length > 0 && (
          <TouchableOpacity
            style={[
              styles.filterButton,
              showColumnFilters && styles.filterButtonActive,
            ]}
            onPress={() => setShowColumnFilters(!showColumnFilters)}
          >
            <Filter
              size={18}
              color={showColumnFilters ? "#6B4EFF" : "#94a3b8"}
            />
            <Text
              style={[
                styles.filterButtonText,
                showColumnFilters && styles.filterButtonTextActive,
              ]}
            >
              Lọc
            </Text>
          </TouchableOpacity>
        )}

        {(searchTerm ||
          Object.keys(columnFilters).length > 0 ||
          sortColumn) && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <X size={16} color="#6b7280" />
            <Text style={styles.clearButtonText}>Xóa lọc</Text>
          </TouchableOpacity>
        )}

        {onRefresh && (
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <RefreshCw size={18} color="#fff" />
          </TouchableOpacity>
        )}
        {onAdd && (
          <TouchableOpacity style={styles.addButton} onPress={onAdd}>
            <Plus size={18} color="#fff" />
            <Text style={styles.addButtonText}>Thêm mới</Text>
          </TouchableOpacity>
        )}
      </View>

      {showColumnFilters && searchableColumns.length > 0 && (
        <View style={styles.columnFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.columnFiltersWrapper}>
              {searchableColumns.map((column) => (
                <View key={column.key} style={styles.columnFilterItem}>
                  <Text style={styles.columnFilterLabel}>{column.title}</Text>
                  {renderColumnSearch(column)}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderColumnHeaders = () => (
    <View style={styles.headerRow}>
      {selectionMode !== "none" && (
        <View
          style={[
            styles.cell,
            styles.checkboxCell,
            getColumnWidthStyle("_selection"),
          ]}
        >
          <TouchableOpacity onPress={toggleSelectAll}>
            <View
              style={[
                styles.checkbox,
                selectedItems.length === paginatedData.length &&
                  paginatedData.length > 0 &&
                  styles.checkboxChecked,
              ]}
            >
              {selectedItems.length === paginatedData.length &&
                paginatedData.length > 0 && <Check size={12} color="#fff" />}
            </View>
          </TouchableOpacity>
        </View>
      )}

      {columns.map((column) => (
        <TouchableOpacity
          key={column.key}
          style={[
            styles.cell,
            styles.headerCell,
            getColumnWidthStyle(column.key),
          ]}
          onPress={() => handleSort(column)}
          activeOpacity={column.sortable ? 0.7 : 1}
        >
          <Text style={styles.headerText}>
            {column.title}
            {column.sortable && sortColumn === column.key && (
              <Text style={styles.sortIcon}>
                {sortDirection === "asc" ? " ↑" : " ↓"}
              </Text>
            )}
          </Text>
        </TouchableOpacity>
      ))}

      {showActionsColumn && (
        <View
          style={[
            styles.cell,
            styles.actionCell,
            getColumnWidthStyle("_actions"),
          ]}
        >
          <Text style={styles.headerText}>Thao tác</Text>
        </View>
      )}
    </View>
  );

  const renderRow = (item: any, index: number) => {
    const actionButtons = renderActionButtons(item);
    const renderCellContent = (column: Column) => {
      const content = column.render
        ? column.render(item[column.key], item, index)
        : item[column.key];

      if (
        typeof content === "string" ||
        typeof content === "number" ||
        typeof content === "boolean"
      ) {
        return (
          <Text style={styles.cellText} numberOfLines={2}>
            {String(content)}
          </Text>
        );
      }

      if (content == null) {
        return <Text style={styles.cellText}>-</Text>;
      }

      return content;
    };

    return (
      <View
        key={item.id || index}
        style={[
          styles.row,
          selectedItems.find((i) => i.id === item.id) && styles.rowSelected,
          index % 2 === 0 ? styles.rowEven : styles.rowOdd,
        ]}
      >
        {selectionMode !== "none" && (
          <View
            style={[
              styles.cell,
              styles.checkboxCell,
              getColumnWidthStyle("_selection"),
            ]}
          >
            <TouchableOpacity onPress={() => toggleSelection(item)}>
              <View
                style={[
                  styles.checkbox,
                  selectedItems.find((i) => i.id === item.id) &&
                    styles.checkboxChecked,
                ]}
              >
                {selectedItems.find((i) => i.id === item.id) && (
                  <Check size={12} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {columns.map((column) => (
          <View
            key={column.key}
            style={[styles.cell, getColumnWidthStyle(column.key)]}
          >
            {renderCellContent(column)}
          </View>
        ))}

        {showActionsColumn && (
          <View
            style={[
              styles.cell,
              styles.actionCell,
              getColumnWidthStyle("_actions"),
            ]}
          >
            <View
              style={[
                styles.actionButtons,
                actionDirection === "vertical" && styles.actionButtonsVertical,
                { gap: buttonSize.gap },
              ]}
            >
              {actionButtons}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderPagination = () => {
    // Sử dụng totalPages và totalItems từ store
    const effectiveTotalPages = useStorePagination
      ? totalPages
      : Math.ceil(sortedData.length / pageSize);
    const effectiveTotalItems = useStorePagination
      ? totalItems
      : sortedData.length;

    if (!pagination) return null;
    if (effectiveTotalPages <= 1 && effectiveTotalItems <= pageSize)
      return null;
    if (effectiveTotalItems === 0) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, effectiveTotalItems);

    return (
      <View style={styles.paginationContainer}>
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Hiển thị {startItem} - {endItem} của {effectiveTotalItems} kết quả
          </Text>
          <View style={styles.rowsPerPage}>
            <Text style={styles.paginationText}>Hiển thị:</Text>
            <View style={styles.rowsPerPageSelect}>
              {rowsPerPageOptions.map((size) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => handleSetPageSize(size)}
                  style={[
                    styles.rowsPerPageOption,
                    pageSize === size && styles.rowsPerPageOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.rowsPerPageOptionText,
                      pageSize === size && styles.rowsPerPageOptionTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.paginationControls}>
          <TouchableOpacity
            onPress={() => handleSetCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={[
              styles.pageButton,
              currentPage === 1 && styles.pageButtonDisabled,
            ]}
          >
            <ChevronLeft
              size={16}
              color={currentPage === 1 ? "#94a3b8" : "#374151"}
            />
          </TouchableOpacity>

          {Array.from({ length: Math.min(5, effectiveTotalPages) }, (_, i) => {
            let pageNum;
            if (effectiveTotalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= effectiveTotalPages - 2) {
              pageNum = effectiveTotalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <TouchableOpacity
                key={pageNum}
                onPress={() => handleSetCurrentPage(pageNum)}
                style={[
                  styles.pageButton,
                  currentPage === pageNum && styles.pageButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.pageButtonText,
                    currentPage === pageNum && styles.pageButtonTextActive,
                  ]}
                >
                  {pageNum}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={() =>
              handleSetCurrentPage(
                Math.min(effectiveTotalPages, currentPage + 1),
              )
            }
            disabled={currentPage === effectiveTotalPages}
            style={[
              styles.pageButton,
              currentPage === effectiveTotalPages && styles.pageButtonDisabled,
            ]}
          >
            <ChevronRight
              size={16}
              color={
                currentPage === effectiveTotalPages ? "#94a3b8" : "#374151"
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const isWeb = Platform.OS === "web";

  return (
    <LinearGradient
      colors={["#ffffff", "#f8f9fa"]}
      style={[styles.container, customStyles.container]}
    >
      {renderHeader()}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={isWeb}
        style={styles.tableScrollView}
        contentContainerStyle={[
          styles.tableContentContainer,
          { minWidth: tableDimension },
        ]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefreshLocal}
            />
          ) : undefined
        }
      >
        <View style={[styles.tableContainer, { width: tableDimension }]}>
          {renderColumnHeaders()}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6B4EFF" />
              <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
          ) : paginatedData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          ) : (
            paginatedData.map((item, index) => renderRow(item, index))
          )}
        </View>
      </ScrollView>
      {renderPagination()}

      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Xác nhận xóa</Text>
            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn xóa mục này không?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setDeleteConfirmVisible(false)}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmDelete}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  Xóa
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// Styles giữ nguyên như cũ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    minWidth: 200,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: "#ede9fe",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#6b7280",
  },
  filterButtonTextActive: {
    color: "#6B4EFF",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  clearButtonText: {
    fontSize: 14,
    color: "#dc2626",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6B4EFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  refreshButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6B4EFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  columnFiltersContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  columnFiltersWrapper: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 4,
  },
  columnFilterItem: {
    minWidth: 180,
  },
  columnFilterLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 4,
  },
  columnFilterInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
  },
  columnFilterSelect: {
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    overflow: "hidden",
  },
  columnSearchInput: {
    flex: 1,
    fontSize: 13,
    color: "#1f2937",
    padding: 0,
  },
  selectInput: {
    padding: 6,
    fontSize: 13,
    color: "#1f2937",
    backgroundColor: "transparent",
    borderWidth: 0,
    width: "100%",
  },
  tableScrollView: {
    flex: 1,
  },
  tableContentContainer: {
    flexGrow: 1,
  },
  tableContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
    minHeight: 48,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    minHeight: 56,
  },
  rowEven: {
    backgroundColor: "#ffffff",
  },
  rowOdd: {
    backgroundColor: "#fafafa",
  },
  rowSelected: {
    backgroundColor: "#eef2ff",
  },
  cell: {
    padding: 12,
    justifyContent: "center",
  },
  headerCell: {
    justifyContent: "center",
  },
  checkboxCell: {
    alignItems: "center",
  },
  actionCell: {},
  headerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  cellText: {
    fontSize: 14,
    color: "#1f2937",
  },
  sortIcon: {
    fontSize: 12,
    color: "#6B4EFF",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#6B4EFF",
    borderColor: "#6B4EFF",
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  actionButtonsVertical: {
    flexDirection: "column",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
  },
  actionButtonVertical: {
    justifyContent: "center",
  },
  actionText: {
    fontWeight: "500",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexWrap: "wrap",
    gap: 12,
  },
  paginationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  paginationText: {
    fontSize: 13,
    color: "#6b7280",
  },
  rowsPerPage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowsPerPageSelect: {
    flexDirection: "row",
    gap: 4,
  },
  rowsPerPageOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
  },
  rowsPerPageOptionActive: {
    backgroundColor: "#6B4EFF",
  },
  rowsPerPageOptionText: {
    fontSize: 12,
    color: "#374151",
  },
  rowsPerPageOptionTextActive: {
    color: "#fff",
  },
  paginationControls: {
    flexDirection: "row",
    gap: 4,
  },
  pageButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  pageButtonActive: {
    backgroundColor: "#6B4EFF",
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 13,
    color: "#374151",
  },
  pageButtonTextActive: {
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalButtonCancel: {
    backgroundColor: "#f3f4f6",
  },
  modalButtonConfirm: {
    backgroundColor: "#ef4444",
  },
  modalButtonText: {
    fontSize: 14,
    color: "#374151",
  },
});
