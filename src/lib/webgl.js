// Three.js requires WebGL 2. Probe before mounting a renderer so an unavailable
// GPU never prevents the rest of the portfolio from opening.
export function supportsWebGL2() {
  if (typeof document === "undefined") return false;
  let context;
  try {
    context = document.createElement("canvas").getContext("webgl2");
    return Boolean(context && !context.isContextLost());
  } catch {
    return false;
  } finally {
    // The probe is not a scene: release its GPU resources immediately.
    try { context?.getExtension("WEBGL_lose_context")?.loseContext(); } catch {}
  }
}
