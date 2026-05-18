const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

const VALID_STATUSES = ["open", "under_review", "resolved", "closed"];

const mapTicket = (t) => ({
  ...t,
  reporter_username: t.reporter?.username || null,
  reporter_name: t.reporter?.full_name || null,
  station_code: t.workstation?.station_code || null,
  room_code: t.lab_room?.room_code || null,
  room_name: t.lab_room?.name || null,
  reporter: undefined,
  workstation: undefined,
  lab_room: undefined,
});

const create = async (
  reporterId,
  { workstationId, labRoomId, category, description },
) => {
  if (!description || !description.trim()) {
    throw ApiError.badRequest("Description is required");
  }

  const created = await prisma.incidentTicket.create({
    data: {
      reporter_id: reporterId,
      workstation_id: workstationId || null,
      lab_room_id: labRoomId || null,
      category,
      description: description.trim(),
      status: "open",
    },
  });
  return getById(created.id);
};

const list = async ({
  status,
  category,
  workstationId,
  labRoomId,
  page = 1,
  pageSize = 20,
}) => {
  const wsId = workstationId ? parseInt(workstationId, 10) : null;
  const roomId = labRoomId ? parseInt(labRoomId, 10) : null;
  const where = {
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(wsId ? { workstation_id: wsId } : {}),
    ...(roomId ? { lab_room_id: roomId } : {}),
  };

  const limit = Math.min(parseInt(pageSize, 10) || 20, 100);
  const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.incidentTicket.findMany({
      where,
      include: {
        reporter: { select: { username: true, full_name: true } },
        workstation: { select: { station_code: true } },
        lab_room: { select: { room_code: true, name: true } },
      },
      orderBy: [{ status: "asc" }, { created_at: "desc" }],
      skip: offset,
      take: limit,
    }),
    prisma.incidentTicket.count({ where }),
  ]);

  return {
    items: items.map(mapTicket),
    total,
    page: Number(page),
    pageSize: limit,
  };
};

const getById = async (id) => {
  const ticket = await prisma.incidentTicket.findUnique({
    where: { id },
    include: {
      reporter: { select: { username: true, full_name: true } },
      workstation: { select: { station_code: true } },
      lab_room: { select: { room_code: true, name: true } },
    },
  });
  if (!ticket) throw ApiError.notFound("Incident ticket not found");
  return mapTicket(ticket);
};

const updateStatus = async (staffId, ticketId, { status, resolutionNote }) => {
  if (!VALID_STATUSES.includes(status)) {
    throw ApiError.badRequest(
      `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    );
  }

  const ticket = await prisma.incidentTicket.findUnique({
    where: { id: ticketId },
    select: { status: true },
  });
  if (!ticket) throw ApiError.notFound("Incident ticket not found");
  if (ticket.status === "closed") {
    throw ApiError.conflict("Cannot update a closed ticket");
  }

  const resolvedAt = status === "resolved" ? new Date() : null;

  await prisma.incidentTicket.update({
    where: { id: ticketId },
    data: {
      status,
      resolution_note: resolutionNote ?? undefined,
      assigned_to: staffId || undefined,
      resolved_at: resolvedAt || undefined,
    },
  });
  return getById(ticketId);
};

module.exports = { create, list, getById, updateStatus };
