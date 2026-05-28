const jwt = require("jsonwebtoken");

// Mock environment variables before importing auth module
process.env.JWT_ACCESS_SECRET = "test_access_secret";

const { auth, requireRole } = require("../src/middlewares/auth");
const ApiError = require("../src/utils/ApiError");

// Helper to create mock request
const mockRequest = (authHeader = "") => ({
  header: jest.fn().mockReturnValue(authHeader),
});

// Helper to create mock response
const mockResponse = () => ({});

describe("auth middleware", () => {
  test("TC1: should call next with 401 error when header returns empty string", () => {
    const req = mockRequest("");
    const res = mockResponse();
    const next = jest.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Missing access token");
  });

  describe("TC2: Authorization header without Bearer prefix", () => {
    test("should call next with 401 error for Basic auth", () => {
      const req = mockRequest("Basic dXNlcjpwYXNz");
      const res = mockResponse();
      const next = jest.fn();

      auth(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Missing access token");
    });

    test("should call next with 401 error for any non-Bearer auth", () => {
      const req = mockRequest("Digest username=...");
      const res = mockResponse();
      const next = jest.fn();

      auth(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });
  });

  describe("TC3: Valid JWT token", () => {
    test("should attach user to req and call next() without error", () => {
      const payload = { sub: 1, role: "customer", username: "testuser" };
      const token = jwt.sign(payload, "test_access_secret", {
        expiresIn: "15m",
      });

      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      const next = jest.fn();

      auth(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toEqual({
        id: 1,
        role: "customer",
        username: "testuser",
      });
      expect(req.token).toBe(token);
    });
  });

  describe("TC4: Expired JWT token", () => {
    test("should call next with TokenExpiredError", () => {
      const payload = { sub: 1, role: "customer", username: "testuser" };
      const token = jwt.sign(payload, "test_access_secret", {
        expiresIn: "-1s",
      });

      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      const next = jest.fn();

      auth(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.name).toBe("TokenExpiredError");
    });
  });

  describe("TC5: Invalid/tampered JWT token", () => {
    test("should call next with JsonWebTokenError for wrong signature", () => {
      const payload = { sub: 1, role: "customer", username: "testuser" };
      const token = jwt.sign(payload, "wrong_secret", {
        expiresIn: "15m",
      });

      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      const next = jest.fn();

      auth(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.name).toBe("JsonWebTokenError");
    });

    test("should call next with JsonWebTokenError for malformed token", () => {
      const req = mockRequest("Bearer invalid.token.here");
      const res = mockResponse();
      const next = jest.fn();

      auth(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.name).toBe("JsonWebTokenError");
    });
  });
});

describe("requireRole middleware", () => {
  test("should return 401 when req.user is not set", () => {
    const req = {};
    const res = mockResponse();
    const next = jest.fn();

    requireRole("admin")(req, res, next);

    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(401);
  });

  test("should return 403 when user role is not in allowed roles", () => {
    const req = { user: { id: 1, role: "customer", username: "test" } };
    const res = mockResponse();
    const next = jest.fn();

    requireRole("admin", "system_admin")(req, res, next);

    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe("Insufficient permission");
  });

  test("should call next() when user has allowed role", () => {
    const req = { user: { id: 1, role: "admin", username: "test" } };
    const res = mockResponse();
    const next = jest.fn();

    requireRole("admin", "system_admin")(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test("should call next() when user has matching role (single role)", () => {
    const req = { user: { id: 1, role: "lab_staff", username: "staff" } };
    const res = mockResponse();
    const next = jest.fn();

    requireRole("lab_staff")(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
