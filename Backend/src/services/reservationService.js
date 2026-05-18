const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

const checkLabRoomOverlap = async (
  conn,
  labRoomId,
  startTime,
  endTime,
  excludeId = null,
) => {
  const row = await conn.reservation.findFirst({
    where: {
      resource_type: "lab_room",
      lab_room_id: labRoomId,
      status: "approved",
      start_time: { lt: endTime },
      end_time: { gt: startTime },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return !!row;
};

const checkWorkstationOverlap = async (
  conn,
  workstationId,
  startTime,
  endTime,
  excludeId = null,
) => {
  const row = await conn.reservation.findFirst({
    where: {
      resource_type: "workstation",
      workstation_id: workstationId,
      status: "approved",
      start_time: { lt: endTime },
      end_time: { gt: startTime },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return !!row;
};

const reserveLabRoom = async (
  userId,
  { labRoomId, startTime, endTime, purpose, expectedUsers },
) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (start >= end) {
    throw ApiError.badRequest("End time must be after start time");
  }
  if (start <= new Date()) {
    throw ApiError.badRequest("Start time must be in the future");
  }

  const insertedId = await prisma.$transaction(async (conn) => {
    const room = await conn.labRoom.findUnique({
      where: { id: labRoomId },
      select: { status: true },
    });
    if (!room) throw ApiError.notFound("Lab room not found");
    if (room.status !== "active")
      throw ApiError.conflict("Lab room is not available");

    const overlap = await checkLabRoomOverlap(conn, labRoomId, start, end);
    if (overlap) throw ApiError.conflict("This time slot is already occupied");

    const created = await conn.reservation.create({
      data: {
        user_id: userId,
        resource_type: "lab_room",
        lab_room_id: labRoomId,
        start_time: start,
        end_time: end,
        purpose: purpose || "",
        expected_users: parseInt(expectedUsers, 10) || 1,
        status: "pending",
      },
      select: { id: true },
    });
    return created.id;
  });
  return getById(insertedId);
};

const reserveWorkstation = async (
  userId,
  { workstationId, startTime, endTime },
) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (start >= end) {
    throw ApiError.badRequest("End time must be after start time");
  }
  if (start <= new Date()) {
    throw ApiError.badRequest("Start time must be in the future");
  }

  const insertedId = await prisma.$transaction(async (conn) => {
    const ws = await conn.workstation.findUnique({
      where: { id: workstationId },
      select: { state: true },
    });
    if (!ws) throw ApiError.notFound("Workstation not found");
    if (ws.state === "maintenance") {
      throw ApiError.conflict("Workstation is under maintenance");
    }

    const overlap = await checkWorkstationOverlap(
      conn,
      workstationId,
      start,
      end,
    );
    if (overlap)
      throw ApiError.conflict(
        "Workstation is already booked for this time slot",
      );

    const created = await conn.reservation.create({
      data: {
        user_id: userId,
        resource_type: "workstation",
        workstation_id: workstationId,
        start_time: start,
        end_time: end,
        status: "pending",
      },
      select: { id: true },
    });
    return created.id;
  });
  return getById(insertedId);
};

const getHistory = async (userId, { status, page = 1, pageSize = 20 }) => {
  const where = {
    user_id: userId,
    ...(status ? { status } : {}),
  };

  const limit = Math.min(parseInt(pageSize, 10) || 20, 100);
  const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.reservation.findMany({
      where,
      include: {
        lab_room: { select: { room_code: true, name: true } },
        workstation: { select: { station_code: true, lab_room_id: true } },
      },
      orderBy: { created_at: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.reservation.count({ where }),
  ]);

  const mapped = items.map((r) => ({
    ...r,
    room_code: r.lab_room?.room_code || null,
    room_name: r.lab_room?.name || null,
    station_code: r.workstation?.station_code || null,
    ws_lab_room_id: r.workstation?.lab_room_id || null,
    lab_room: undefined,
    workstation: undefined,
  }));

  return {
    items: mapped,
    total,
    page: Number(page),
    pageSize: limit,
  };
};

const cancelReservation = async (userId, reservationId) => {
  await prisma.$transaction(async (conn) => {
    const r = await conn.reservation.findUnique({
      where: { id: reservationId },
      select: { user_id: true, status: true },
    });
    if (!r) throw ApiError.notFound("Reservation not found");
    if (r.user_id !== userId) throw ApiError.forbidden("Access denied");
    if (r.status !== "pending") {
      throw ApiError.conflict(
        `Cannot cancel a reservation with status '${r.status}'`,
      );
    }
    await conn.reservation.update({
      where: { id: reservationId },
      data: { status: "cancelled" },
    });
  });
};

const getPendingQueue = async ({ page = 1, pageSize = 20 }) => {
  const limit = Math.min(parseInt(pageSize, 10) || 20, 100);
  const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.reservation.findMany({
      where: { status: "pending" },
      include: {
        user: { select: { username: true, email: true, full_name: true } },
        lab_room: { select: { room_code: true, name: true } },
        workstation: { select: { station_code: true } },
      },
      orderBy: { created_at: "asc" },
      skip: offset,
      take: limit,
    }),
    prisma.reservation.count({ where: { status: "pending" } }),
  ]);

  const mapped = items.map((r) => ({
    ...r,
    username: r.user?.username || null,
    email: r.user?.email || null,
    full_name: r.user?.full_name || null,
    room_code: r.lab_room?.room_code || null,
    room_name: r.lab_room?.name || null,
    station_code: r.workstation?.station_code || null,
    user: undefined,
    lab_room: undefined,
    workstation: undefined,
  }));

  return {
    items: mapped,
    total,
    page: Number(page),
    pageSize: limit,
  };
};

const approveReservation = async (staffId, reservationId) => {
  await prisma.$transaction(async (conn) => {
    const r = await conn.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!r) throw ApiError.notFound("Reservation not found");
    if (r.status !== "pending") {
      throw ApiError.conflict(
        `Reservation is no longer pending (current: ${r.status})`,
      );
    }

    if (r.resource_type === "lab_room") {
      const overlap = await checkLabRoomOverlap(
        conn,
        r.lab_room_id,
        r.start_time,
        r.end_time,
        r.id,
      );
      if (overlap) throw ApiError.conflict("Time slot conflict detected");
    } else {
      const overlap = await checkWorkstationOverlap(
        conn,
        r.workstation_id,
        r.start_time,
        r.end_time,
        r.id,
      );
      if (overlap)
        throw ApiError.conflict("Workstation booking conflict detected");
    }

    await conn.reservation.update({
      where: { id: reservationId },
      data: {
        status: "approved",
        processed_by: staffId,
        processed_at: new Date(),
      },
    });
  });
  return getById(reservationId);
};

const rejectReservation = async (staffId, reservationId, reason) => {
  if (!reason || !reason.trim()) {
    throw ApiError.badRequest("Rejection reason is required");
  }
  await prisma.$transaction(async (conn) => {
    const r = await conn.reservation.findUnique({
      where: { id: reservationId },
      select: { status: true },
    });
    if (!r) throw ApiError.notFound("Reservation not found");
    if (r.status !== "pending") {
      throw ApiError.conflict(
        `Reservation is no longer pending (current: ${r.status})`,
      );
    }
    await conn.reservation.update({
      where: { id: reservationId },
      data: {
        status: "rejected",
        reject_reason: reason.trim(),
        processed_by: staffId,
        processed_at: new Date(),
      },
    });
  });
};

const getById = async (id) => {
  const row = await prisma.reservation.findUnique({
    where: { id },
    include: {
      user: { select: { username: true, email: true, full_name: true } },
      lab_room: { select: { room_code: true, name: true } },
      workstation: { select: { station_code: true } },
    },
  });
  if (!row) throw ApiError.notFound("Reservation not found");
  return {
    ...row,
    username: row.user?.username || null,
    email: row.user?.email || null,
    full_name: row.user?.full_name || null,
    room_code: row.lab_room?.room_code || null,
    room_name: row.lab_room?.name || null,
    station_code: row.workstation?.station_code || null,
    user: undefined,
    lab_room: undefined,
    workstation: undefined,
  };
};

module.exports = {
  reserveLabRoom,
  reserveWorkstation,
  getHistory,
  cancelReservation,
  getPendingQueue,
  approveReservation,
  rejectReservation,
  getById,
};
