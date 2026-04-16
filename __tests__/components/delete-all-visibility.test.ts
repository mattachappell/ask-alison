import { describe, expect, it } from "vitest";

type ChatHistory = { chats: { id: string }[]; hasMore: boolean };

/** Mirrors the hasChats logic in app-sidebar.tsx */
function hasChats(paginatedHistory: ChatHistory[] | undefined): boolean {
  return paginatedHistory
    ? paginatedHistory.some((page) => page.chats.length > 0)
    : false;
}

describe("hasChats (Delete All visibility)", () => {
  it("returns false when data is undefined (loading)", () => {
    expect(hasChats(undefined)).toBe(false);
  });

  it("returns false when all pages have empty chats", () => {
    expect(hasChats([{ chats: [], hasMore: false }])).toBe(false);
  });

  it("returns false when multiple pages all empty", () => {
    expect(
      hasChats([
        { chats: [], hasMore: true },
        { chats: [], hasMore: false },
      ])
    ).toBe(false);
  });

  it("returns true when first page has chats", () => {
    expect(hasChats([{ chats: [{ id: "1" }], hasMore: false }])).toBe(true);
  });

  it("returns true when only later page has chats", () => {
    expect(
      hasChats([
        { chats: [], hasMore: true },
        { chats: [{ id: "1" }], hasMore: false },
      ])
    ).toBe(true);
  });

  it("returns false for empty array (no pages loaded)", () => {
    expect(hasChats([])).toBe(false);
  });
});
