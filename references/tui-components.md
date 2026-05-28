# Pi Coding Agent — TUI Components

**Source:** https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent/docs/tui.md

Extensions and custom tools can render custom TUI components for interactive user interfaces.

## Component Interface

```typescript
interface Component {
  render(width: number): string[];
  handleInput?(data: string): void;
  wantsKeyRelease?: boolean;
  invalidate(): void;
}
```

| Method | Description |
|--------|-------------|
| `render(width)` | Return array of strings (one per line). Each line **must not exceed `width`**. |
| `handleInput?(data)` | Receive keyboard input when component has focus. |
| `wantsKeyRelease?` | If true, receives key release events (Kitty protocol). |
| `invalidate()` | Clear cached render state. |

Styles do not carry across lines. Reapply per line or use `wrapTextWithAnsi()`.

## Focusable (IME Support)

Components with text cursors should implement `Focusable`:

```typescript
import { CURSOR_MARKER, type Component, type Focusable } from "@mariozechner/pi-tui";

class MyInput implements Component, Focusable {
  focused: boolean = false;
  render(width: number): string[] {
    const marker = this.focused ? CURSOR_MARKER : "";
    return [`> ${before}${marker}\x1b[7m${atCursor}\x1b[27m${after}`];
  }
}
```

When focused, TUI positions the hardware cursor at `CURSOR_MARKER` for IME input.

## Using Components

**In extensions:**
```typescript
const handle = ctx.ui.custom(myComponent);
handle.requestRender();  // trigger re-render
handle.close();          // restore normal UI
```

**In custom tools:**
```typescript
const handle = pi.ui.custom(myComponent);
```

## Overlays

Render on top of existing content without clearing:

```typescript
const result = await ctx.ui.custom<MyResult>(
  (tui, theme, keybindings, done) => new MyDialog({ onClose: done }),
  {
    overlay: true,
    overlayOptions: {
      width: "50%",          // number or percentage
      minWidth: 40,
      maxHeight: "80%",
      anchor: "right-center", // 9 positions: center, top-left, top-center, etc.
      offsetX: -2,
      offsetY: 0,
      row: "25%",            // percentage from top
      col: 10,               // absolute column
      margin: 2,             // or { top, right, bottom, left }
      visible: (w, h) => w >= 80,  // responsive hide
    }
  }
);
```

**Lifecycle:** Overlay components are disposed when closed. Create fresh instances each time.

## Built-in Components

Import from `@mariozechner/pi-tui`:

| Component | Purpose |
|-----------|---------|
| `Text` | Multi-line text with word wrapping |
| `Box` | Container with padding and background |
| `Container` | Groups children vertically |
| `Spacer` | Empty vertical space |
| `Markdown` | Renders markdown with syntax highlighting |
| `Image` | Renders images in supported terminals (Kitty, iTerm2, Ghostty, WezTerm) |
| `Input` | Single-line text input |
| `Editor` | Multi-line text editor |

## Keyboard Input

```typescript
import { matchesKey, Key } from "@mariozechner/pi-tui";

handleInput(data: string) {
  if (matchesKey(data, Key.up)) { /* ... */ }
  if (matchesKey(data, Key.ctrl("c"))) { /* ... */ }
  if (matchesKey(data, Key.shift("tab"))) { /* ... */ }
  if (matchesKey(data, Key.ctrlShift("p"))) { /* ... */ }
}
```

**Key identifiers:** `Key.enter`, `Key.escape`, `Key.tab`, `Key.space`, `Key.backspace`,
`Key.delete`, `Key.home`, `Key.end`, `Key.up`, `Key.down`, `Key.left`, `Key.right`,
`Key.ctrl("c")`, `Key.shift("tab")`, `Key.alt("left")`, `Key.ctrlShift("p")`.

## Line Width Utilities

```typescript
import { visibleWidth, truncateToWidth, wrapTextWithAnsi } from "@mariozechner/pi-tui";

render(width: number): string[] {
  return [truncateToWidth(this.text, width)];
}
```

- `visibleWidth(str)` — display width ignoring ANSI
- `truncateToWidth(str, width, ellipsis?)` — truncate with optional ellipsis
- `wrapTextWithAnsi(str, width)` — word wrap preserving ANSI codes

## Example: Interactive Selector

```typescript
import { matchesKey, Key, truncateToWidth } from "@mariozechner/pi-tui";

class MySelector {
  private items: string[];
  private selected = 0;
  private cachedWidth?: number;
  private cachedLines?: string[];

  handleInput(data: string): void {
    if (matchesKey(data, Key.up) && this.selected > 0) {
      this.selected--; this.invalidate();
    } else if (matchesKey(data, Key.down) && this.selected < this.items.length - 1) {
      this.selected++; this.invalidate();
    } else if (matchesKey(data, Key.enter)) {
      this.onSelect?.(this.items[this.selected]);
    } else if (matchesKey(data, Key.escape)) {
      this.onCancel?.();
    }
  }

  render(width: number): string[] {
    if (this.cachedLines && this.cachedWidth === width) return this.cachedLines;
    this.cachedLines = this.items.map((item, i) => {
      const prefix = i === this.selected ? "> " : "  ";
      return truncateToWidth(prefix + item, width);
    });
    this.cachedWidth = width;
    return this.cachedLines;
  }

  invalidate(): void {
    this.cachedWidth = undefined;
    this.cachedLines = undefined;
  }
}
```
