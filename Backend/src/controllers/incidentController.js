const incidentService = require("../services/incidentService");
const { ok } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");

const createTicket = asyncHandler(async (req, res) => {
  const { workstationId, labRoomId, category, description } = req.body;
  const ticket = await incidentService.create(req.user.id, {
    workstationId: workstationId ? parseInt(workstationId, 10) : null,
    labRoomId: labRoomId ? parseInt(labRoomId, 10) : null,
    category,
    description,
  });
  return ok(res, ticket, 201);
});

const listTickets = asyncHandler(async (req, res) => {
  const { status, category, workstationId, labRoomId, page, pageSize } =
    req.query;
  const result = await incidentService.list({
    status,
    category,
    workstationId,
    labRoomId,
    page,
    pageSize,
  });
  return ok(res, result);
});

const getTicket = asyncHandler(async (req, res) => {
  const ticket = await incidentService.getById(parseInt(req.params.id, 10));
  if (req.user.role === "customer" && ticket.reporter_id !== req.user.id) {
    const ApiError = require("../utils/ApiError");
    throw ApiError.forbidden("Access denied");
  }
  return ok(res, ticket);
});

const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status, resolutionNote } = req.body;
  const ticket = await incidentService.updateStatus(
    req.user.id,
    parseInt(req.params.id, 10),
    { status, resolutionNote },
  );
  return ok(res, ticket);
});

module.exports = { createTicket, listTickets, getTicket, updateTicketStatus };
