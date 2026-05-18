const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

const PUBLIC_FIELDS = {
  id: true,
  username: true,
  email: true,
  full_name: true,
  phone: true,
  role: true,
  status: true,
  is_verified: true,
  created_at: true,
  updated_at: true,
};

const getById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: PUBLIC_FIELDS,
  });
  if (!user) throw ApiError.notFound("User not found");
  return user;
};

const updateProfile = async (id, { fullName, phone }) => {
  await prisma.user.update({
    where: { id },
    data: {
      full_name: fullName ?? undefined,
      phone: phone ?? undefined,
    },
  });
  return getById(id);
};

const list = async ({ search, status, role, page = 1, pageSize = 20 }) => {
  const where = {
    ...(status ? { status } : {}),
    ...(role ? { role } : {}),
  };
  if (search) {
    const like = search.trim();
    where.OR = [
      { username: { contains: like, mode: "insensitive" } },
      { email: { contains: like, mode: "insensitive" } },
      { full_name: { contains: like, mode: "insensitive" } },
    ];
  }

  const limit = Math.min(parseInt(pageSize, 10) || 20, 100);
  const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: PUBLIC_FIELDS,
      orderBy: { created_at: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page: Number(page), pageSize: limit };
};

const block = async (targetId, adminId, reason) => {
  if (targetId === adminId) {
    throw ApiError.badRequest("You cannot block your own account");
  }
  const user = await prisma.user.findUnique({
    where: { id: targetId },
    select: { status: true },
  });
  if (!user) throw ApiError.notFound("User not found");
  if (user.status === "blocked")
    throw ApiError.conflict("User is already blocked");

  await prisma.$transaction([
    prisma.user.update({
      where: { id: targetId },
      data: { status: "blocked", block_reason: reason || null },
    }),
    prisma.refreshToken.deleteMany({ where: { user_id: targetId } }),
  ]);
};

const unblock = async (targetId) => {
  const user = await prisma.user.findUnique({
    where: { id: targetId },
    select: { status: true },
  });
  if (!user) throw ApiError.notFound("User not found");
  if (user.status !== "blocked") throw ApiError.conflict("User is not blocked");

  await prisma.user.update({
    where: { id: targetId },
    data: {
      status: "active",
      block_reason: null,
      failed_login_attempts: 0,
      lock_until: null,
    },
  });
};

module.exports = { getById, updateProfile, list, block, unblock };
