// src/types/common.ts
export interface PaginationInfo {
  total?: number;
  total_items?: number; // Alternative common name
  count?: number;
  per_page?: number;
  current_page?: number;
  total_pages?: number;
  limit?: number; // From existing uses
  offset?: number; // From existing uses
  page?: number; // From existing uses
  // Add any other common pagination fields observed
}
