/**
 * Runs in the page (pass it to `page.addInitScript`): every WebGL drawing call does nothing, while the rest of WebGL
 * (contexts, shaders, buffers) works as usual. Tests that don't look at a scene's pixels keep exercising its code
 * without drawing it, which in software on a runner without a GPU took most of a test's time.
 *
 * @example
 * await page.addInitScript(skipWebGlDrawing);
 */
export function skipWebGlDrawing(): void {
  for (const context of [WebGLRenderingContext, WebGL2RenderingContext])
    for (const name of ["drawArrays", "drawElements", "drawArraysInstanced", "drawElementsInstanced", "clear"])
      if (name in context.prototype) Object.defineProperty(context.prototype, name, { value: () => {} });
}
