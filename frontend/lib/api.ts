/**
 * Central API client.
 * All calls go through Next.js rewrites → Flask backend.
 * The NEXT_PUBLIC_API_URL env var is used for direct calls (e.g. file uploads).
 */

import axios from "axios";

// Base URL for server-side calls – client-side uses relative /api path via rewrites
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export const api = axios.create({
  baseURL: typeof window === "undefined" ? `${BASE}/api` : "/api",
  headers: { "Content-Type": "application/json" },
});

// Automatically attach JWT token for admin calls
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vs_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401 &&
      window.location.pathname.startsWith("/admin") &&
      !window.location.pathname.startsWith("/admin/login")
    ) {
      localStorage.removeItem("vs_token");
      localStorage.removeItem("vs_username");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface House {
  id: number;
  name: string;
  description: string;
  amenities: string; // JSON string → parse with JSON.parse()
  base_price: number;
  cover_image: string | null;
  images: HouseImage[];
  availability?: AvailabilityRecord[];
}

export interface HouseImage {
  id: number;
  house_id: number;
  image_url: string;
  sort_order: number;
}

export interface AvailabilityRecord {
  id: number;
  house_id: number;
  date: string; // ISO date
  price: number | null;
  is_available: boolean;
}

export interface BookingRequest {
  id: number;
  house_id: number | null;
  house_name: string | null;
  name: string;
  email: string;
  phone: string | null;
  start_date: string | null;
  end_date: string | null;
  nights: number | null;
  total_price: number | null;
  message: string | null;
  status: "pending" | "contacted" | "accepted" | "rejected";
  created_at: string;
}

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------
export const getHouses = () => api.get<House[]>("/houses").then((r) => r.data);
export const getHouse = (id: number) =>
  api.get<House>(`/houses/${id}`).then((r) => r.data);
export const getHouseAvailability = (id: number, month?: string) =>
  api
    .get<AvailabilityRecord[]>(`/houses/${id}/availability`, {
      params: month ? { month } : {},
    })
    .then((r) => r.data);

export const submitBookingRequest = (data: {
  house_id?: number;
  name: string;
  email: string;
  phone?: string;
  start_date?: string;
  end_date?: string;
  message?: string;
}) => api.post("/booking-request", data).then((r) => r.data);

// ---------------------------------------------------------------------------
// Admin – auth
// ---------------------------------------------------------------------------
export const adminLogin = (username: string, password: string) =>
  api
    .post<{ token: string; user: { id: number; username: string } }>(
      "/admin/login",
      { username, password }
    )
    .then((r) => r.data);

// ---------------------------------------------------------------------------
// Admin – houses
// ---------------------------------------------------------------------------
export const adminGetHouses = () =>
  api.get<House[]>("/admin/houses").then((r) => r.data);

export const adminCreateHouse = (data: Partial<House>) =>
  api.post<House>("/admin/houses", data).then((r) => r.data);

export const adminUpdateHouse = (id: number, data: Partial<House>) =>
  api.put<House>(`/admin/houses/${id}`, data).then((r) => r.data);

export const adminDeleteHouse = (id: number) =>
  api.delete(`/admin/houses/${id}`).then((r) => r.data);

// ---------------------------------------------------------------------------
// Admin – availability
// ---------------------------------------------------------------------------
export const adminGetAvailability = (houseId: number) =>
  api
    .get<AvailabilityRecord[]>(`/admin/houses/${houseId}/availability`)
    .then((r) => r.data);

export const adminSetAvailability = (
  houseId: number,
  records: { date: string; price?: number | null; is_available: boolean }[]
) =>
  api
    .post<AvailabilityRecord[]>(`/admin/houses/${houseId}/availability`, records)
    .then((r) => r.data);

export const adminDeleteAvailability = (id: number) =>
  api.delete(`/admin/availability/${id}`).then((r) => r.data);

// ---------------------------------------------------------------------------
// Admin – images
// ---------------------------------------------------------------------------
export const adminUploadImage = (houseId: number, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api
    .post<HouseImage>(`/admin/houses/${houseId}/images`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const adminUploadTemp = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api
    .post<{ url: string }>("/admin/upload-temp", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const adminDeleteImage = (imageId: number) =>
  api.delete(`/admin/images/${imageId}`).then((r) => r.data);

export const adminReorderImages = (
  items: { id: number; sort_order: number }[]
) => api.put("/admin/images/reorder", items).then((r) => r.data);

// ---------------------------------------------------------------------------
// Admin – bookings
// ---------------------------------------------------------------------------
export const adminGetBookings = (status?: string) =>
  api
    .get<BookingRequest[]>("/admin/booking-requests", {
      params: status ? { status } : {},
    })
    .then((r) => r.data);

export const adminUpdateBookingStatus = (id: number, status: string) =>
  api
    .put<BookingRequest>(`/admin/booking-requests/${id}/status`, { status })
    .then((r) => r.data);

export const adminDeleteBooking = (id: number) =>
  api.delete(`/admin/booking-requests/${id}`)
    .then((r) => r.data);
