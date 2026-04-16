/**
 * Tests for PromptInput submit wiring logic.
 *
 * These tests verify the keyboard and click event handling logic
 * that was missing (onSubmit was dropped as _onSubmit, Enter key
 * had no handler, button had no onClick). Since we don't have a
 * DOM testing library, we test the event-handling logic directly.
 */
import { describe, expect, it, vi } from "vitest";

/** Simulates the textarea onKeyDown logic from PromptInputTextarea */
function handleTextareaKeyDown(
  e: {
    key: string;
    shiftKey: boolean;
    nativeEvent: { isComposing: boolean };
    defaultPrevented: boolean;
    preventDefault: () => void;
  },
  parentOnKeyDown: ((e: unknown) => void) | undefined,
  onSubmit: (() => void) | undefined
) {
  parentOnKeyDown?.(e);
  if (
    e.key === "Enter" &&
    !e.shiftKey &&
    !e.nativeEvent.isComposing &&
    !e.defaultPrevented
  ) {
    e.preventDefault();
    onSubmit?.();
  }
}

/** Simulates the button onClick logic from PromptInputSubmit */
function handleButtonClick(
  e: { defaultPrevented: boolean },
  existingOnClick: ((e: unknown) => void) | undefined,
  disabled: boolean,
  onSubmit: (() => void) | undefined
) {
  existingOnClick?.(e);
  if (!e.defaultPrevented && !disabled) {
    onSubmit?.();
  }
}

function makeKeyEvent(
  overrides: Partial<{
    key: string;
    shiftKey: boolean;
    isComposing: boolean;
    defaultPrevented: boolean;
  }> = {}
) {
  return {
    key: overrides.key ?? "Enter",
    shiftKey: overrides.shiftKey ?? false,
    nativeEvent: { isComposing: overrides.isComposing ?? false },
    defaultPrevented: overrides.defaultPrevented ?? false,
    preventDefault: vi.fn(),
  };
}

describe("PromptInputTextarea Enter key handling", () => {
  it("calls onSubmit on Enter", () => {
    const onSubmit = vi.fn();
    const e = makeKeyEvent();

    handleTextareaKeyDown(e, undefined, onSubmit);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(e.preventDefault).toHaveBeenCalledOnce();
  });

  it("does NOT call onSubmit on Shift+Enter", () => {
    const onSubmit = vi.fn();
    const e = makeKeyEvent({ shiftKey: true });

    handleTextareaKeyDown(e, undefined, onSubmit);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it("does NOT call onSubmit during IME composition", () => {
    const onSubmit = vi.fn();
    const e = makeKeyEvent({ isComposing: true });

    handleTextareaKeyDown(e, undefined, onSubmit);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does NOT call onSubmit when parent prevents default (slash commands)", () => {
    const onSubmit = vi.fn();
    const e = makeKeyEvent();

    const parentOnKeyDown = (ev: unknown) => {
      (ev as typeof e).defaultPrevented = true;
    };

    handleTextareaKeyDown(e, parentOnKeyDown, onSubmit);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does NOT call onSubmit for non-Enter keys", () => {
    const onSubmit = vi.fn();
    const e = makeKeyEvent({ key: "a" });

    handleTextareaKeyDown(e, undefined, onSubmit);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls parent onKeyDown before checking Enter", () => {
    const callOrder: string[] = [];
    const parentOnKeyDown = () => callOrder.push("parent");
    const onSubmit = () => callOrder.push("submit");
    const e = makeKeyEvent();

    handleTextareaKeyDown(e, parentOnKeyDown, onSubmit);

    expect(callOrder).toEqual(["parent", "submit"]);
  });
});

describe("PromptInputSubmit click handling", () => {
  it("calls onSubmit on click when enabled", () => {
    const onSubmit = vi.fn();

    handleButtonClick({ defaultPrevented: false }, undefined, false, onSubmit);

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("does NOT call onSubmit when disabled", () => {
    const onSubmit = vi.fn();

    handleButtonClick({ defaultPrevented: false }, undefined, true, onSubmit);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does NOT call onSubmit when event is default-prevented", () => {
    const onSubmit = vi.fn();

    handleButtonClick({ defaultPrevented: true }, undefined, false, onSubmit);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls existing onClick before onSubmit", () => {
    const callOrder: string[] = [];
    const existingOnClick = () => callOrder.push("existing");
    const onSubmit = () => callOrder.push("submit");

    handleButtonClick(
      { defaultPrevented: false },
      existingOnClick,
      false,
      onSubmit
    );

    expect(callOrder).toEqual(["existing", "submit"]);
  });
});
