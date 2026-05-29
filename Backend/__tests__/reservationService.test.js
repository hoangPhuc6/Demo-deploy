/**
 * Jest Unit/Integration Tests for Reservation Service
 * Module: TCS-G03 - Quản lý đặt phòng/máy
 * 
 * Test Cases: TC-G03-001 → TC-G03-027e
 */

const ApiError = require("../src/utils/ApiError");

// Create a new mock prisma instance
const mockPrismaInstance = {
  reservation: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  labRoom: {
    findUnique: jest.fn(),
  },
  workstation: {
    findUnique: jest.fn(),
  },
};

// Setup $transaction to execute callback directly with the mock instance
const setupTransaction = () => {
  mockPrismaInstance.$transaction.mockImplementation(async (arg) => {
    if (typeof arg === 'function') {
      return arg(mockPrismaInstance);
    } else if (Array.isArray(arg)) {
      // Handle array of queries (e.g., [query1, query2])
      return Promise.all(arg.map(q => q));
    }
    return arg;
  });
};

jest.mock("../src/config/prisma", () => mockPrismaInstance);

const reservationService = require("../src/services/reservationService");

// Helper functions
const mockReservation = (overrides = {}) => ({
  id: 1,
  user_id: 1,
  resource_type: "lab_room",
  lab_room_id: 1,
  workstation_id: null,
  start_time: new Date("2026-06-01T09:00:00"),
  end_time: new Date("2026-06-01T11:00:00"),
  purpose: "Study",
  expected_users: 5,
  status: "pending",
  reject_reason: null,
  processed_by: null,
  processed_at: null,
  created_at: new Date(),
  user: { id: 1, username: "testuser", email: "test@example.com", full_name: "Test User" },
  lab_room: { id: 1, room_code: "LAB-101", name: "Computer Lab 101" },
  workstation: null,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  // Setup default transaction mock
  mockPrismaInstance.$transaction = jest.fn();
});

describe("TCS-G03: Reservation Management", () => {
  describe("UC-09, UC-10: Create Reservation", () => {
    describe("TC-G03-006: Đặt phòng lab thành công", () => {
      test("should create lab room reservation successfully", async () => {
        const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const futureEnd = new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);

        setupTransaction();
        mockPrismaInstance.labRoom.findUnique.mockResolvedValue({ id: 1, status: "active" });
        mockPrismaInstance.reservation.findFirst.mockResolvedValue(null);
        mockPrismaInstance.reservation.create.mockResolvedValue({ id: 1 });
        mockPrismaInstance.reservation.findUnique.mockResolvedValue(
          mockReservation({ start_time: futureStart, end_time: futureEnd })
        );

        const result = await reservationService.reserveLabRoom(1, {
          labRoomId: 1,
          startTime: futureStart.toISOString(),
          endTime: futureEnd.toISOString(),
          purpose: "Study session",
          expectedUsers: 5,
        });

        expect(result).toBeDefined();
        expect(mockPrismaInstance.reservation.create).toHaveBeenCalled();
      });
    });

    describe("TC-G03-007: Đặt máy trạm thành công", () => {
      test("should create workstation reservation successfully", async () => {
        const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const futureEnd = new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);

        setupTransaction();
        mockPrismaInstance.workstation.findUnique.mockResolvedValue({ id: 1, state: "available" });
        mockPrismaInstance.reservation.findFirst.mockResolvedValue(null);
        mockPrismaInstance.reservation.create.mockResolvedValue({ id: 2 });
        mockPrismaInstance.reservation.findUnique.mockResolvedValue(
          mockReservation({
            id: 2,
            resource_type: "workstation",
            lab_room_id: null,
            workstation_id: 1,
            start_time: futureStart,
            end_time: futureEnd,
          })
        );

        const result = await reservationService.reserveWorkstation(1, {
          workstationId: 1,
          startTime: futureStart.toISOString(),
          endTime: futureEnd.toISOString(),
        });

        expect(result).toBeDefined();
        expect(result.resource_type).toBe("workstation");
      });
    });

    describe("TC-G03-008: Đặt với giờ kết thúc trước giờ bắt đầu", () => {
      test("should throw error when end_time < start_time", async () => {
        const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const pastEnd = new Date(Date.now() + 23 * 60 * 60 * 1000);

        await expect(
          reservationService.reserveLabRoom(1, {
            labRoomId: 1,
            startTime: futureStart.toISOString(),
            endTime: pastEnd.toISOString(),
          })
        ).rejects.toThrow("End time must be after start time");
      });
    });

    describe("TC-G03-008b: Đặt với end_time = start_time", () => {
      test("should throw error when end_time equals start_time", async () => {
        const sameTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await expect(
          reservationService.reserveLabRoom(1, {
            labRoomId: 1,
            startTime: sameTime.toISOString(),
            endTime: sameTime.toISOString(),
          })
        ).rejects.toThrow("End time must be after start time");
      });
    });

    describe("TC-G03-009: Đặt với thời gian trong quá khứ", () => {
      test("should throw error when start_time is in the past", async () => {
        const pastTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const futureEnd = new Date(Date.now() - 23 * 60 * 60 * 1000);

        await expect(
          reservationService.reserveLabRoom(1, {
            labRoomId: 1,
            startTime: pastTime.toISOString(),
            endTime: futureEnd.toISOString(),
          })
        ).rejects.toThrow("Start time must be in the future");
      });
    });

    describe("TC-G03-010: Đặt phòng/máy đã có lịch Approved trùng giờ", () => {
      test("should throw conflict error for overlapping reservation", async () => {
        const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const futureEnd = new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);

        setupTransaction();
        mockPrismaInstance.labRoom.findUnique.mockResolvedValue({ id: 1, status: "active" });
        mockPrismaInstance.reservation.findFirst.mockResolvedValue({ id: 99 });

        await expect(
          reservationService.reserveLabRoom(1, {
            labRoomId: 1,
            startTime: futureStart.toISOString(),
            endTime: futureEnd.toISOString(),
          })
        ).rejects.toThrow("This time slot is already occupied");
      });
    });

    describe("TC-G03-024: Chuyển máy đang Maintenance", () => {
      test("should reject booking for maintenance workstation", async () => {
        const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const futureEnd = new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);

        setupTransaction();
        mockPrismaInstance.workstation.findUnique.mockResolvedValue({ id: 1, state: "maintenance" });

        await expect(
          reservationService.reserveWorkstation(1, {
            workstationId: 1,
            startTime: futureStart.toISOString(),
            endTime: futureEnd.toISOString(),
          })
        ).rejects.toThrow("Workstation is under maintenance");
      });
    });

    describe("TC-G03-027c: Đặt phòng với expected_users = 0", () => {
      test("should default expected_users to 1", async () => {
        const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const futureEnd = new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);

        setupTransaction();
        mockPrismaInstance.labRoom.findUnique.mockResolvedValue({ id: 1, status: "active" });
        mockPrismaInstance.reservation.findFirst.mockResolvedValue(null);
        mockPrismaInstance.reservation.create.mockResolvedValue({ id: 1 });
        mockPrismaInstance.reservation.findUnique.mockResolvedValue(
          mockReservation({ expected_users: 1 })
        );

        const result = await reservationService.reserveLabRoom(1, {
          labRoomId: 1,
          startTime: futureStart.toISOString(),
          endTime: futureEnd.toISOString(),
          expectedUsers: 0,
        });

        expect(result).toBeDefined();
        expect(mockPrismaInstance.reservation.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              expected_users: 1,
            }),
          })
        );
      });
    });
  });

  describe("UC-11: View Reservation History", () => {
    describe("TC-G03-013: Customer xem lịch sử của chính mình", () => {
      test("should return reservation history for user", async () => {
        const reservations = [
          mockReservation({ id: 1, status: "approved" }),
          mockReservation({ id: 2, status: "pending" }),
        ];

        setupTransaction();
        mockPrismaInstance.reservation.findMany.mockResolvedValue(reservations);
        mockPrismaInstance.reservation.count.mockResolvedValue(2);

        const result = await reservationService.getHistory(1, {});

        expect(result).toHaveProperty("items");
        expect(result.total).toBe(2);
      });
    });

    describe("TC-G03-015: Lịch sử trống", () => {
      test("should return empty list when user has no reservations", async () => {
        setupTransaction();
        mockPrismaInstance.reservation.findMany.mockResolvedValue([]);
        mockPrismaInstance.reservation.count.mockResolvedValue(0);

        const result = await reservationService.getHistory(999, {});

        expect(result.items).toHaveLength(0);
        expect(result.total).toBe(0);
      });
    });
  });

  describe("UC-12: Cancel Reservation", () => {
    describe("TC-G03-016: Huỷ reservation Pending thành công", () => {
      test("should cancel pending reservation", async () => {
        setupTransaction();
        mockPrismaInstance.reservation.findUnique.mockResolvedValue(
          mockReservation({ user_id: 1, status: "pending" })
        );
        mockPrismaInstance.reservation.update.mockResolvedValue(
          mockReservation({ status: "cancelled" })
        );

        await reservationService.cancelReservation(1, 1);

        expect(mockPrismaInstance.reservation.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: { status: "cancelled" },
        });
      });
    });

    describe("TC-G03-017: Huỷ reservation đã Approved", () => {
      test("should reject cancellation of non-pending reservation", async () => {
        setupTransaction();
        mockPrismaInstance.reservation.findUnique.mockResolvedValue(
          mockReservation({ user_id: 1, status: "approved" })
        );

        await expect(
          reservationService.cancelReservation(1, 1)
        ).rejects.toThrow("Cannot cancel a reservation with status 'approved'");
      });
    });

    describe("TC-G03-018: Customer huỷ reservation của người khác", () => {
      test("should reject cancellation by non-owner", async () => {
        setupTransaction();
        mockPrismaInstance.reservation.findUnique.mockResolvedValue(
          mockReservation({ user_id: 2, status: "pending" })
        );

        await expect(
          reservationService.cancelReservation(1, 1)
        ).rejects.toThrow("Access denied");
      });
    });
  });

  describe("UC-14, UC-15, UC-16: Staff Queue Management", () => {
    describe("TC-G03-020: Staff xem hàng đợi Pending", () => {
      test("should return pending reservations in FIFO order", async () => {
        const pendingReservations = [
          mockReservation({ id: 1, created_at: new Date("2026-06-01T08:00:00") }),
          mockReservation({ id: 2, created_at: new Date("2026-06-01T08:05:00") }),
        ];

        setupTransaction();
        mockPrismaInstance.reservation.findMany.mockResolvedValue(pendingReservations);
        mockPrismaInstance.reservation.count.mockResolvedValue(2);

        const result = await reservationService.getPendingQueue({});

        expect(result.items).toHaveLength(2);
        expect(result.total).toBe(2);
      });
    });

    describe("TC-G03-021: Hàng đợi trống", () => {
      test("should return empty queue when no pending reservations", async () => {
        setupTransaction();
        mockPrismaInstance.reservation.findMany.mockResolvedValue([]);
        mockPrismaInstance.reservation.count.mockResolvedValue(0);

        const result = await reservationService.getPendingQueue({});

        expect(result.items).toHaveLength(0);
        expect(result.total).toBe(0);
      });
    });

    describe("TC-G03-023: Approve reservation hợp lệ", () => {
      test("should approve pending reservation", async () => {
        setupTransaction();
        mockPrismaInstance.reservation.findUnique
          .mockResolvedValueOnce(mockReservation({ status: "pending" }))
          .mockResolvedValueOnce(mockReservation({ status: "pending" }));
        mockPrismaInstance.reservation.findFirst.mockResolvedValue(null);
        mockPrismaInstance.reservation.update.mockResolvedValue(
          mockReservation({ status: "approved" })
        );
        mockPrismaInstance.reservation.findUnique.mockResolvedValue(
          mockReservation({ status: "approved" })
        );

        await reservationService.approveReservation(2, 1);

        expect(mockPrismaInstance.reservation.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: expect.objectContaining({ status: "approved" }),
        });
      });
    });

    describe("TC-G03-024: Approve reservation đã có Approved khác overlap", () => {
      test("should reject approval with time conflict", async () => {
        setupTransaction();
        mockPrismaInstance.reservation.findUnique.mockResolvedValue(
          mockReservation({ status: "pending" })
        );
        mockPrismaInstance.reservation.findFirst.mockResolvedValue({ id: 99 });

        await expect(
          reservationService.approveReservation(2, 1)
        ).rejects.toThrow("Time slot conflict detected");
      });
    });

    describe("TC-G03-025: Reject reservation với lý do bắt buộc", () => {
      test("should reject with reason", async () => {
        setupTransaction();
        mockPrismaInstance.reservation.findUnique.mockResolvedValue(
          mockReservation({ status: "pending" })
        );
        mockPrismaInstance.reservation.update.mockResolvedValue(
          mockReservation({ status: "rejected", reject_reason: "Lab unavailable" })
        );

        await reservationService.rejectReservation(2, 1, "Lab unavailable");

        expect(mockPrismaInstance.reservation.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: expect.objectContaining({
            status: "rejected",
            reject_reason: "Lab unavailable",
          }),
        });
      });
    });

    describe("TC-G03-026: Reject reservation thiếu lý do", () => {
      test("should reject without reason", async () => {
        await expect(
          reservationService.rejectReservation(2, 1, "")
        ).rejects.toThrow("Rejection reason is required");
      });

      test("should reject with whitespace-only reason", async () => {
        await expect(
          reservationService.rejectReservation(2, 1, "   ")
        ).rejects.toThrow("Rejection reason is required");
      });
    });

    describe("TC-G03-027: Approve reservation đã bị Cancel", () => {
      test("should reject approval of cancelled reservation", async () => {
        setupTransaction();
        mockPrismaInstance.reservation.findUnique.mockResolvedValue(
          mockReservation({ status: "cancelled" })
        );

        await expect(
          reservationService.approveReservation(2, 1)
        ).rejects.toThrow("Reservation is no longer pending");
      });
    });
  });
});

describe("Edge Cases & Error Handling", () => {
  describe("Resource Not Found", () => {
    test("should throw error when lab room not found", async () => {
      const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const futureEnd = new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);

      setupTransaction();
      mockPrismaInstance.labRoom.findUnique.mockResolvedValue(null);

      await expect(
        reservationService.reserveLabRoom(1, {
          labRoomId: 999,
          startTime: futureStart.toISOString(),
          endTime: futureEnd.toISOString(),
        })
      ).rejects.toThrow("Lab room not found");
    });

    test("should throw error when workstation not found", async () => {
      const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const futureEnd = new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);

      setupTransaction();
      mockPrismaInstance.workstation.findUnique.mockResolvedValue(null);

      await expect(
        reservationService.reserveWorkstation(1, {
          workstationId: 999,
          startTime: futureStart.toISOString(),
          endTime: futureEnd.toISOString(),
        })
      ).rejects.toThrow("Workstation not found");
    });
  });

  describe("Lab Room Status", () => {
    test("should reject booking for inactive lab room", async () => {
      const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const futureEnd = new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);

      setupTransaction();
      mockPrismaInstance.labRoom.findUnique.mockResolvedValue({ id: 1, status: "maintenance" });

      await expect(
        reservationService.reserveLabRoom(1, {
          labRoomId: 1,
          startTime: futureStart.toISOString(),
          endTime: futureEnd.toISOString(),
        })
      ).rejects.toThrow("Lab room is not available");
    });
  });
});
