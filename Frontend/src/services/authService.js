import api from "../lib/api";

export const authApi = {
  login: (identifier, password) =>
    api.post("/auth/login", { identifier, password }).then((r) => r.data.data),
  register: (payload) =>
    api.post("/auth/register", payload).then((r) => r.data),
  verifyEmail: (email, otp) =>
    api.post("/auth/verify-email", { email, otp }).then((r) => r.data),
  resendVerification: (email) =>
    api.post("/auth/resend-verification", { email }).then((r) => r.data),
  forgotPassword: (email) =>
    api.post("/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword: (email, otp, password) =>
    api
      .post("/auth/reset-password", { email, otp, password })
      .then((r) => r.data),
  changePassword: (currentPassword, newPassword) =>
    api
      .put("/auth/change-password", { currentPassword, newPassword })
      .then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
};

export const userApi = {
  me: () => api.get("/users/me").then((r) => r.data.data),
  updateMe: (payload) => api.put("/users/me", payload).then((r) => r.data.data),
  list: (params) => api.get("/users", { params }).then((r) => r.data),
  getById: (id) => api.get(`/users/${id}`).then((r) => r.data.data),
  block: (id, reason) =>
    api.patch(`/users/${id}/block`, { reason }).then((r) => r.data),
  unblock: (id) => api.patch(`/users/${id}/unblock`).then((r) => r.data),
};

export const labRoomApi = {
  list: (params) => api.get("/lab-rooms", { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/lab-rooms/${id}`).then((r) => r.data.data),
  create: (payload) => api.post("/lab-rooms", payload).then((r) => r.data.data),
  update: (id, payload) =>
    api.put(`/lab-rooms/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/lab-rooms/${id}`).then((r) => r.data),
};

export const workstationApi = {
  list: (params) =>
    api.get("/workstations", { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/workstations/${id}`).then((r) => r.data.data),
  create: (payload) =>
    api.post("/workstations", payload).then((r) => r.data.data),
  update: (id, payload) =>
    api.put(`/workstations/${id}`, payload).then((r) => r.data.data),
  setState: (id, state, force = false) =>
    api
      .patch(`/workstations/${id}/state`, { state, force })
      .then((r) => r.data),
  remove: (id) => api.delete(`/workstations/${id}`).then((r) => r.data),
};

export const reservationApi = {
  reserveRoom: (payload) =>
    api.post("/reservations/lab-room", payload).then((r) => r.data.data),
  reserveWorkstation: (payload) =>
    api.post("/reservations/workstation", payload).then((r) => r.data.data),
  myReservations: (params) =>
    api.get("/reservations/my", { params }).then((r) => r.data),
  getById: (id) => api.get(`/reservations/${id}`).then((r) => r.data.data),
  cancel: (id) => api.patch(`/reservations/${id}/cancel`).then((r) => r.data),
  queue: (params) =>
    api.get("/reservations/queue", { params }).then((r) => r.data),
  approve: (id) =>
    api.patch(`/reservations/${id}/approve`).then((r) => r.data.data),
  reject: (id, reason) =>
    api
      .patch(`/reservations/${id}/reject`, { reason })
      .then((r) => r.data.data),
};

export const incidentApi = {
  create: (payload) => api.post("/incidents", payload).then((r) => r.data.data),
  list: (params) => api.get("/incidents", { params }).then((r) => r.data),
  getById: (id) => api.get(`/incidents/${id}`).then((r) => r.data.data),
  updateStatus: (id, payload) =>
    api.patch(`/incidents/${id}/status`, payload).then((r) => r.data.data),
};

export const reportApi = {
  generate: (params) =>
    api.get("/reports", { params }).then((r) => r.data.data),
};
