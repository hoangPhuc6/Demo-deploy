const labRoomService = require("../services/labRoomService");
const { ok } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");

const listLabRooms = asyncHandler(async (req, res) => {
  const { search, status, date, startTime, endTime, minCapacity } = req.query;
  const rooms = await labRoomService.list({
    search,
    status,
    date,
    startTime,
    endTime,
    minCapacity,
  });
  return ok(res, rooms);
});

const getLabRoom = asyncHandler(async (req, res) => {
  const room = await labRoomService.getById(parseInt(req.params.id, 10));
  return ok(res, room);
});

const createLabRoom = asyncHandler(async (req, res) => {
  const { roomCode, name, location, capacity, description } = req.body;
  const room = await labRoomService.create({
    roomCode,
    name,
    location,
    capacity,
    description,
  });
  return ok(res, room, 201);
});

const updateLabRoom = asyncHandler(async (req, res) => {
  const { name, location, capacity, description, status } = req.body;
  const room = await labRoomService.update(parseInt(req.params.id, 10), {
    name,
    location,
    capacity,
    description,
    status,
  });
  return ok(res, room);
});

const deleteLabRoom = asyncHandler(async (req, res) => {
  await labRoomService.remove(parseInt(req.params.id, 10));
  return ok(res, { message: "Lab room deleted successfully." });
});

module.exports = {
  listLabRooms,
  getLabRoom,
  createLabRoom,
  updateLabRoom,
  deleteLabRoom,
};
