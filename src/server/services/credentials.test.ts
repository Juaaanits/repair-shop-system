import { beforeEach, describe, expect, it, vi } from "vitest";
import { hash } from "bcryptjs";
vi.mock("../db/users", () => ({ findOwner: vi.fn() }));
import { findOwner } from "../db/users";
import { verifyCredentials } from "./credentials";
beforeEach(() => vi.resetAllMocks());
describe("owner credentials", () => {
  it("rejects passwords exceeding bcrypt byte limits", async () => {
    expect(
      await verifyCredentials({
        email: "owner@example.com",
        password: "é".repeat(37),
      }),
    ).toBeNull();
    expect(findOwner).not.toHaveBeenCalled();
  });
  it("rejects invalid input without a query", async () => {
    expect(await verifyCredentials({ email: "bad", password: "" })).toBeNull();
    expect(findOwner).not.toHaveBeenCalled();
  });
  it("rejects unknown owners", async () => {
    vi.mocked(findOwner).mockResolvedValue(undefined);
    expect(
      await verifyCredentials({
        email: "owner@example.com",
        password: "wrong",
      }),
    ).toBeNull();
  });
  it("rejects wrong passwords and returns only safe identity for valid passwords", async () => {
    const owner = {
      id: "owner-id",
      name: "Owner",
      email: "owner@example.com",
      passwordHash: await hash("correct-password", 4),
      createdAt: new Date(),
    };
    vi.mocked(findOwner).mockResolvedValue(owner);
    expect(
      await verifyCredentials({ email: owner.email, password: "wrong" }),
    ).toBeNull();
    expect(
      await verifyCredentials({
        email: "OWNER@example.com",
        password: "correct-password",
      }),
    ).toEqual({ id: owner.id, name: owner.name, email: owner.email });
  });
});
