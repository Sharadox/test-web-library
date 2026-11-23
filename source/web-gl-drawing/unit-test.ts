import { afterEach, expect, test, vi } from "vitest";
import { skipWebGlDrawing } from "@sharadox/test-web-library/web-gl-drawing";

afterEach(() => vi.unstubAllGlobals());

test("makes every WebGL drawing call do nothing, leaving the rest of WebGL alone", () => {
  const drawn: string[] = [];
  const context = () =>
    class {
      drawArrays() {
        drawn.push("drawArrays");
      }
      drawElements() {
        drawn.push("drawElements");
      }
      clear() {
        drawn.push("clear");
      }
      compileShader() {
        drawn.push("compileShader");
      }
    };
  const first = context();
  const second = context();
  vi.stubGlobal("WebGLRenderingContext", first);
  vi.stubGlobal("WebGL2RenderingContext", second);
  skipWebGlDrawing();
  for (const Context of [first, second]) {
    const gl = new Context();
    gl.drawArrays();
    gl.drawElements();
    gl.clear();
    gl.compileShader();
  }
  expect(drawn).toEqual(["compileShader", "compileShader"]);
});
