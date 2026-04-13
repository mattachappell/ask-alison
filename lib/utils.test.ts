import { describe, expect, it, vi } from "vitest";
import { fetcher } from "./utils";

describe("fetcher", () => {
  it("returns parsed JSON for successful responses", async () => {
    const mockData = { messages: [{ id: "1", role: "user" }] };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      })
    );

    const result = await fetcher("/api/messages?chatId=123");
    expect(result).toEqual(mockData);

    vi.unstubAllGlobals();
  });

  it("throws ChatbotError when response has JSON error body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        json: () =>
          Promise.resolve({ code: "rate_limit:chat", cause: "rate limited" }),
      })
    );

    await expect(fetcher("/api/chat")).rejects.toThrow(
      "You've reached the message limit"
    );

    vi.unstubAllGlobals();
  });

  it("throws generic error when error response is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: () => Promise.reject(new SyntaxError("Unexpected end of JSON")),
      })
    );

    await expect(fetcher("/api/nonexistent")).rejects.toThrow(
      "Request failed: 404 Not Found"
    );

    vi.unstubAllGlobals();
  });

  it("throws generic error when error response body is empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.reject(new TypeError("Failed to execute 'json'")),
      })
    );

    await expect(fetcher("/api/broken")).rejects.toThrow(
      "Request failed: 500 Internal Server Error"
    );

    vi.unstubAllGlobals();
  });
});
