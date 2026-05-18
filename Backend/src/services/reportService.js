const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

const generate = async ({ startDate, endDate, labRoomId }) => {
  if (!startDate || !endDate) {
    throw ApiError.badRequest("startDate and endDate are required");
  }
  if (new Date(startDate) > new Date(endDate)) {
    throw ApiError.badRequest("startDate must be before endDate");
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59.999`);

  const reservationSummaryGroups = await prisma.reservation.groupBy({
    by: ["status"],
    where: {
      created_at: { gte: start, lte: end },
      ...(labRoomId ? { lab_room_id: labRoomId } : {}),
    },
    _count: { _all: true },
  });
  const reservationSummary = reservationSummaryGroups.map((r) => ({
    status: r.status,
    count: r._count._all,
  }));

  const rooms = await prisma.labRoom.findMany({
    where: labRoomId ? { id: labRoomId } : {},
    select: { id: true, room_code: true, name: true },
  });

  const reservationByRoomGroups = await prisma.reservation.groupBy({
    by: ["lab_room_id", "status"],
    where: {
      lab_room_id: { not: null },
      created_at: { gte: start, lte: end },
      ...(labRoomId ? { lab_room_id: labRoomId } : {}),
    },
    _count: { _all: true },
  });

  const byRoom = new Map();
  for (const room of rooms) {
    byRoom.set(room.id, {
      id: room.id,
      room_code: room.room_code,
      name: room.name,
      total_reservations: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    });
  }
  for (const grp of reservationByRoomGroups) {
    if (!grp.lab_room_id) continue;
    const entry = byRoom.get(grp.lab_room_id);
    if (!entry) continue;
    entry.total_reservations += grp._count._all;
    if (grp.status === "approved") entry.approved += grp._count._all;
    if (grp.status === "rejected") entry.rejected += grp._count._all;
    if (grp.status === "cancelled") entry.cancelled += grp._count._all;
  }
  const reservationsByRoom = Array.from(byRoom.values()).sort(
    (a, b) => b.total_reservations - a.total_reservations,
  );

  const incidentSummaryGroups = await prisma.incidentTicket.groupBy({
    by: ["status"],
    where: { created_at: { gte: start, lte: end } },
    _count: { _all: true },
  });
  const incidentSummary = incidentSummaryGroups.map((r) => ({
    status: r.status,
    count: r._count._all,
  }));

  const incidentsByCategoryGroups = await prisma.incidentTicket.groupBy({
    by: ["category"],
    where: { created_at: { gte: start, lte: end } },
    _count: { _all: true },
  });
  const incidentsByCategory = incidentsByCategoryGroups.map((r) => ({
    category: r.category,
    count: r._count._all,
  }));

  const approvedReservations = await prisma.reservation.findMany({
    where: {
      status: "approved",
      start_time: { gte: start, lte: end },
      ...(labRoomId ? { lab_room_id: labRoomId } : {}),
    },
    select: { start_time: true },
  });
  const peakMap = new Map();
  for (const r of approvedReservations) {
    const hour = new Date(r.start_time).getHours();
    peakMap.set(hour, (peakMap.get(hour) || 0) + 1);
  }
  const peakHours = Array.from(peakMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour - b.hour);

  const incidentCounts = await prisma.incidentTicket.groupBy({
    by: ["workstation_id"],
    where: {
      workstation_id: { not: null },
      created_at: { gte: start, lte: end },
      ...(labRoomId ? { workstation: { lab_room_id: labRoomId } } : {}),
    },
    _count: { _all: true },
  });
  const wsIds = incidentCounts
    .map((r) => r.workstation_id)
    .filter((id) => id !== null);
  const workstations = await prisma.workstation.findMany({
    where: { id: { in: wsIds } },
    include: { lab_room: { select: { room_code: true, name: true } } },
  });
  const wsMap = new Map(workstations.map((w) => [w.id, w]));
  const workstationFailures = incidentCounts
    .map((c) => {
      const ws = wsMap.get(c.workstation_id);
      if (!ws) return null;
      return {
        id: ws.id,
        station_code: ws.station_code,
        room_code: ws.lab_room?.room_code || null,
        room_name: ws.lab_room?.name || null,
        incident_count: c._count._all,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.incident_count - a.incident_count)
    .slice(0, 20);

  return {
    period: { startDate, endDate },
    reservationSummary,
    reservationsByRoom,
    incidentSummary,
    incidentsByCategory,
    peakHours,
    workstationFailures,
  };
};

module.exports = { generate };
