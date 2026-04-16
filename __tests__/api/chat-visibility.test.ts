import { describe, expect, it } from "vitest";

type Chat = { user_id: string; visibility: string };

/** Mirrors the access control logic in messages/route.ts */
function canAccessChat(
  chat: Chat,
  requestingUserId: string
): { allowed: boolean; isReadonly: boolean } {
  const isOwner = chat.user_id === requestingUserId;
  const visibility = chat.visibility ?? "private";

  if (!isOwner && visibility === "private") {
    return { allowed: false, isReadonly: false };
  }

  return { allowed: true, isReadonly: !isOwner };
}

describe("canAccessChat (visibility enforcement)", () => {
  it("allows owner to access private chat", () => {
    const result = canAccessChat(
      { user_id: "user-1", visibility: "private" },
      "user-1"
    );
    expect(result).toEqual({ allowed: true, isReadonly: false });
  });

  it("allows owner to access public chat", () => {
    const result = canAccessChat(
      { user_id: "user-1", visibility: "public" },
      "user-1"
    );
    expect(result).toEqual({ allowed: true, isReadonly: false });
  });

  it("blocks non-owner from private chat", () => {
    const result = canAccessChat(
      { user_id: "user-1", visibility: "private" },
      "user-2"
    );
    expect(result).toEqual({ allowed: false, isReadonly: false });
  });

  it("allows non-owner to access public chat as readonly", () => {
    const result = canAccessChat(
      { user_id: "user-1", visibility: "public" },
      "user-2"
    );
    expect(result).toEqual({ allowed: true, isReadonly: true });
  });

  it("defaults to private when visibility is missing", () => {
    const result = canAccessChat(
      { user_id: "user-1", visibility: undefined as unknown as string },
      "user-2"
    );
    expect(result).toEqual({ allowed: false, isReadonly: false });
  });
});
