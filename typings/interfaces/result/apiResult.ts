export interface ApiResult {
  code: number;
  message?: string;
  exception?: string;
}

export interface ApiResultGeneric<T> extends ApiResult {
  data?: T;
}

export interface ResultPaging<T> {
  current_page?: number;
  first_page_url?: string;
  from?: number;
  last_page?: number;
  last_page_url?: string;
  next_page_url?: string;
  path?: string;
  to?: number;
  total?: number;
  data?: T;
  per_page?: number;
}

// interface này dành cho CustomPaging
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    total: number;
}