import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockLimit,
  mockWhere,
  mockFrom,
  mockSelect,
  mockValues,
  mockInsert,
} = vi.hoisted(() => {
  const mockLimit = vi.fn();
  const mockWhere = vi.fn(() => ({ limit: mockLimit }));
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  const mockValues = vi.fn();
  const mockInsert = vi.fn(() => ({ values: mockValues }));
  return { mockLimit, mockWhere, mockFrom, mockSelect, mockValues, mockInsert };
});

vi.mock("@/db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
  },
}));

vi.mock("@/auth", () => ({
  signIn: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password_xyz"),
    compare: vi.fn(),
  },
}));

import { register } from "../actions";

describe("register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimit.mockResolvedValue([]);
  });

  it("returns error for invalid email", async () => {
    const formData = new FormData();
    formData.set("name", "Test User");
    formData.set("email", "not-an-email");
    formData.set("password", "password123");

    const result = await register({}, formData);

    expect(result.error).toBeDefined();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns error for password shorter than 8 characters", async () => {
    const formData = new FormData();
    formData.set("name", "Test User");
    formData.set("email", "test@example.com");
    formData.set("password", "short");

    const result = await register({}, formData);

    expect(result.error).toBe("Password must be at least 8 characters");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("returns error for duplicate email", async () => {
    mockLimit.mockResolvedValue([{ id: "existing-id" }]);

    const formData = new FormData();
    formData.set("name", "Test User");
    formData.set("email", "existing@example.com");
    formData.set("password", "password123");

    const result = await register({}, formData);

    expect(result.error).toBe("An account with this email already exists");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("stores bcrypt hash, not plaintext password", async () => {
    const bcrypt = await import("bcryptjs");

    const formData = new FormData();
    formData.set("name", "Test User");
    formData.set("email", "new@example.com");
    formData.set("password", "password123");

    await register({}, formData).catch(() => {
      // signIn throws a redirect — expected
    });

    expect(bcrypt.default.hash).toHaveBeenCalledWith("password123", 12);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: "hashed_password_xyz" })
    );
    expect(mockValues).not.toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: "password123" })
    );
  });
});
