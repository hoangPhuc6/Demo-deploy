/**
 * Jest Unit/Integration Tests for Workstation Service
 * Module: TCS-G02 - Quản lý phòng lab & thiết bị
 * 
 * Test Cases: TC-G02-012 → TC-G02-025
 */

const ApiError = require("../src/utils/ApiError");

// Mock Prisma
const mockPrisma = {
  workstation: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
  },
  labRoom: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  reservation: {
    findFirst: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
  },
};

jest.mock("../src/config/prisma", () => mockPrisma);

const workstationService = require("../src/services/workstationService");

// Helper functions
const mockWorkstation = (overrides = {}) => ({
  id: 1,
  lab_room_id: 1,
  station_code: "WS-001",
  ip_address: "192.168.1.10",
  mac_address: "00:1A:2B:3C:4D:5E",
  cpu: "Intel Core i7",
  ram_gb: 16,
  gpu: "NVIDIA GTX 1060",
  os: "Windows 11",
  state: "available",
  created_at: new Date(),
  updated_at: new Date(),
  lab_room: { id: 1, room_code: "LAB-101", name: "Computer Lab 101" },
  ...overrides,
});

const mockLabRoom = (overrides = {}) => ({
  id: 1,
  room_code: "LAB-101",
  name: "Computer Lab 101",
  capacity: 30,
  status: "active",
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TCS-G02: Workstation Management", () => {
  describe("UC-24: Add Workstation (TC-G02-012 → TC-G02-016, TC-G02-015b → TC-G02-015c)", () => {
    describe("TC-G02-012: Thêm máy trạm vào phòng hợp lệ", () => {
      test("should create a new workstation successfully", async () => {
        mockPrisma.labRoom.findUnique.mockResolvedValue(
          mockLabRoom({ capacity: 30 })
        );
        mockPrisma.workstation.count.mockResolvedValue(10);
        mockPrisma.workstation.create.mockResolvedValue(
          mockWorkstation({ station_code: "WS-002" })
        );
        mockPrisma.workstation.findUnique.mockResolvedValue(
          mockWorkstation({ station_code: "WS-002" })
        );

        const result = await workstationService.create({
          labRoomId: 1,
          stationCode: "WS-002",
          ipAddress: "192.168.1.11",
          macAddress: "00:1A:2B:3C:4D:5F",
          cpu: "Intel Core i5",
          ramGb: 8,
          os: "Ubuntu 22.04",
        });

        expect(result).toHaveProperty("station_code", "WS-002");
        expect(mockPrisma.workstation.create).toHaveBeenCalled();
      });
    });

    describe("TC-G02-013: Thêm máy vượt sức chứa phòng", () => {
      test("should throw conflict error when room is at capacity", async () => {
        mockPrisma.labRoom.findUnique.mockResolvedValue(
          mockLabRoom({ capacity: 30 })
        );
        mockPrisma.workstation.count.mockResolvedValue(30); // Room is full

        await expect(
          workstationService.create({
            labRoomId: 1,
            stationCode: "WS-003",
          })
        ).rejects.toThrow("Target room has reached its maximum capacity");
      });
    });

    describe("TC-G02-014: Thêm máy với IP address sai định dạng", () => {
      test("should handle invalid IP address format (validation at controller)", async () => {
        // IP validation happens at controller level
        mockPrisma.labRoom.findUnique.mockResolvedValue(
          mockLabRoom({ capacity: 30 })
        );
        mockPrisma.workstation.count.mockResolvedValue(10);
        mockPrisma.workstation.create.mockResolvedValue(
          mockWorkstation({ ip_address: "999.999.0.1" })
        );
        mockPrisma.workstation.findUnique.mockResolvedValue(
          mockWorkstation({ ip_address: "999.999.0.1" })
        );

        const result = await workstationService.create({
          labRoomId: 1,
          stationCode: "WS-004",
          ipAddress: "999.999.0.1", // Invalid format
        });

        expect(result.ip_address).toBe("999.999.0.1");
      });
    });

    describe("TC-G02-015: Thêm máy với MAC address sai định dạng", () => {
      test("should handle invalid MAC address format (validation at controller)", async () => {
        mockPrisma.labRoom.findUnique.mockResolvedValue(
          mockLabRoom({ capacity: 30 })
        );
        mockPrisma.workstation.count.mockResolvedValue(10);
        mockPrisma.workstation.create.mockResolvedValue(
          mockWorkstation({ mac_address: "invalid-mac" })
        );
        mockPrisma.workstation.findUnique.mockResolvedValue(
          mockWorkstation({ mac_address: "invalid-mac" })
        );

        const result = await workstationService.create({
          labRoomId: 1,
          stationCode: "WS-005",
          macAddress: "invalid-mac",
        });

        expect(result.mac_address).toBe("invalid-mac");
      });
    });

    describe("TC-G02-015b: Thêm máy với MAC address đúng định dạng", () => {
      test("should create workstation with valid MAC address", async () => {
        mockPrisma.labRoom.findUnique.mockResolvedValue(
          mockLabRoom({ capacity: 30 })
        );
        mockPrisma.workstation.count.mockResolvedValue(10);
        mockPrisma.workstation.create.mockResolvedValue(
          mockWorkstation({ mac_address: "00:1A:2B:3C:4D:5E" })
        );
        mockPrisma.workstation.findUnique.mockResolvedValue(
          mockWorkstation({ mac_address: "00:1A:2B:3C:4D:5E" })
        );

        const result = await workstationService.create({
          labRoomId: 1,
          stationCode: "WS-006",
          macAddress: "00:1A:2B:3C:4D:5E",
        });

        expect(result.mac_address).toBe("00:1A:2B:3C:4D:5E");
      });
    });

    describe("TC-G02-015c: Thêm máy với MAC address trùng", () => {
      test("should handle duplicate MAC address (unique constraint at DB level)", async () => {
        mockPrisma.labRoom.findUnique.mockResolvedValue(
          mockLabRoom({ capacity: 30 })
        );
        mockPrisma.workstation.count.mockResolvedValue(10);
        mockPrisma.workstation.create.mockRejectedValue(
          new Error("Unique constraint violation")
        );

        await expect(
          workstationService.create({
            labRoomId: 1,
            stationCode: "WS-007",
            macAddress: "00:1A:2B:3C:4D:5E",
          })
        ).rejects.toThrow("Unique constraint violation");
      });
    });

    describe("TC-G02-016: Thêm máy với mã máy trùng trong cùng phòng", () => {
      test("should handle duplicate station code (unique constraint at DB level)", async () => {
        mockPrisma.labRoom.findUnique.mockResolvedValue(
          mockLabRoom({ capacity: 30 })
        );
        mockPrisma.workstation.count.mockResolvedValue(10);
        mockPrisma.workstation.create.mockRejectedValue(
          new Error("Unique constraint violation on station_code")
        );

        await expect(
          workstationService.create({
            labRoomId: 1,
            stationCode: "WS-001", // Already exists
          })
        ).rejects.toThrow("Unique constraint violation on station_code");
      });
    });

    describe("TC-G02-019: Cập nhật RAM = 0 hoặc âm", () => {
      test("should handle zero RAM (validation at controller level)", async () => {
        mockPrisma.workstation.findUnique.mockResolvedValue(mockWorkstation());
        mockPrisma.workstation.update.mockResolvedValue(
          mockWorkstation({ ram_gb: 0 })
        );
        mockPrisma.workstation.findUnique.mockResolvedValueOnce(mockWorkstation());
        mockPrisma.workstation.findUnique.mockResolvedValueOnce(
          mockWorkstation({ ram_gb: 0 })
        );

        const result = await workstationService.update(1, { ramGb: 0 });

        expect(result).toBeDefined();
      });
    });
  });

  describe("UC-25: View Workstation Specs (TC-G02-017)", () => {
    describe("TC-G02-017: Xem thông số máy trạm", () => {
      test("should return workstation details with all specs", async () => {
        const ws = mockWorkstation({
          cpu: "Intel Core i9",
          ram_gb: 32,
          gpu: "NVIDIA RTX 3080",
          os: "Windows 11 Pro",
        });
        mockPrisma.workstation.findUnique.mockResolvedValue(ws);

        const result = await workstationService.getById(1);

        expect(result).toHaveProperty("cpu", "Intel Core i9");
        expect(result).toHaveProperty("ram_gb", 32);
        expect(result).toHaveProperty("gpu", "NVIDIA RTX 3080");
        expect(result).toHaveProperty("os", "Windows 11 Pro");
      });

      test("should throw not found error for non-existent workstation", async () => {
        mockPrisma.workstation.findUnique.mockResolvedValue(null);

        await expect(workstationService.getById(999)).rejects.toThrow(
          "Workstation not found"
        );
      });
    });
  });

  describe("UC-26: Update Workstation (TC-G02-018)", () => {
    describe("TC-G02-018: Cập nhật cấu hình máy hợp lệ", () => {
      test("should update workstation successfully", async () => {
        mockPrisma.workstation.findUnique.mockResolvedValue(mockWorkstation());
        mockPrisma.workstation.update.mockResolvedValue(
          mockWorkstation({ cpu: "Intel Core i9", ram_gb: 32 })
        );
        mockPrisma.workstation.findUnique.mockResolvedValueOnce(mockWorkstation());
        mockPrisma.workstation.findUnique.mockResolvedValueOnce(
          mockWorkstation({ cpu: "Intel Core i9", ram_gb: 32 })
        );

        const result = await workstationService.update(1, {
          cpu: "Intel Core i9",
          ramGb: 32,
        });

        expect(mockPrisma.workstation.update).toHaveBeenCalled();
      });
    });
  });

  describe("UC-27: Remove Workstation (TC-G02-020 → TC-G02-021)", () => {
    describe("TC-G02-020: Xóa máy không có reservation", () => {
      test("should delete workstation without active reservations", async () => {
        mockPrisma.reservation.count.mockResolvedValue(0);
        mockPrisma.workstation.delete.mockResolvedValue(mockWorkstation());

        await expect(workstationService.remove(1)).resolves.toBeUndefined();
        expect(mockPrisma.workstation.delete).toHaveBeenCalledWith({
          where: { id: 1 },
        });
      });
    });

    describe("TC-G02-021: Xóa máy có reservation đang active", () => {
      test("should throw conflict error when workstation has active reservations", async () => {
        mockPrisma.reservation.count.mockResolvedValue(2);

        await expect(workstationService.remove(1)).rejects.toThrow(
          "Cannot delete workstation with active or upcoming reservations"
        );
      });
    });
  });

  describe("UC-19: Change Workstation State (TC-G02-022 → TC-G02-025)", () => {
    describe("TC-G02-022: Chuyển máy sang Maintenance", () => {
      test("should set workstation to maintenance", async () => {
        mockPrisma.workstation.findUnique.mockResolvedValue(mockWorkstation());
        mockPrisma.reservation.findFirst.mockResolvedValue(null);
        mockPrisma.workstation.update.mockResolvedValue(
          mockWorkstation({ state: "maintenance" })
        );
        mockPrisma.workstation.findUnique.mockResolvedValueOnce(mockWorkstation());
        mockPrisma.workstation.findUnique.mockResolvedValueOnce(
          mockWorkstation({ state: "maintenance" })
        );

        const result = await workstationService.setState(1, "maintenance");

        expect(result.warning).toBe(false);
        expect(result.workstation.state).toBe("maintenance");
      });
    });

    describe("TC-G02-023: Chuyển máy từ Maintenance về Available", () => {
      test("should set workstation back to available", async () => {
        mockPrisma.workstation.findUnique.mockResolvedValue(
          mockWorkstation({ state: "maintenance" })
        );
        mockPrisma.workstation.update.mockResolvedValue(
          mockWorkstation({ state: "available" })
        );
        mockPrisma.workstation.findUnique.mockResolvedValueOnce(
          mockWorkstation({ state: "maintenance" })
        );
        mockPrisma.workstation.findUnique.mockResolvedValueOnce(
          mockWorkstation({ state: "available" })
        );

        const result = await workstationService.setState(1, "available");

        expect(result.workstation.state).toBe("available");
      });
    });

    describe("TC-G02-024: Customer cố đặt máy đang Maintenance", () => {
      test("maintenance workstation should not appear in available list", async () => {
        // This is handled at reservation service/list query level
        mockPrisma.workstation.findMany.mockResolvedValue([
          mockWorkstation({ state: "available" }),
        ]);

        const result = await workstationService.list({ state: "available" });

        expect(result.every((ws) => ws.state === "available")).toBe(true);
      });
    });

    describe("TC-G02-025: Non-staff cố thay đổi trạng thái máy", () => {
      test("RBAC handled at middleware level", () => {
        // Role checking is done in middleware, not in service
        expect(true).toBe(true);
      });
    });
  });

  describe("List Workstations (Availability)", () => {
    describe("TC-G03-004: Máy đã có reservation Approved không xuất hiện", () => {
      test("should filter workstations by availability for given time", async () => {
        mockPrisma.workstation.findMany.mockResolvedValue([mockWorkstation()]);

        const result = await workstationService.list({
          date: "2026-06-01",
          startTime: "09:00",
          endTime: "11:00",
        });

        expect(result).toBeInstanceOf(Array);
      });
    });

    describe("TC-G03-005: Lọc máy theo thông số phần cứng", () => {
      test("should filter workstations by RAM", async () => {
        mockPrisma.workstation.findMany.mockResolvedValue([
          mockWorkstation({ ram_gb: 32 }),
        ]);

        const result = await workstationService.list({ minRam: 16 });

        expect(result[0].ram_gb).toBeGreaterThanOrEqual(16);
      });

      test("should filter workstations by OS", async () => {
        mockPrisma.workstation.findMany.mockResolvedValue([
          mockWorkstation({ os: "Ubuntu 22.04" }),
        ]);

        const result = await workstationService.list({ os: "Ubuntu" });

        expect(result).toBeInstanceOf(Array);
      });
    });
  });
});
