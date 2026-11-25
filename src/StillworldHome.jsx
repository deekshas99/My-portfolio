import StillworldApp from "./stillworld/App";
import worldStyles from "./stillworld/styles.css?inline";

/* The garden's stylesheet targets bare elements (button, input, :root), so it
   rides with the component instead of being imported globally: React drops the
   style tag on unmount and the dashboard is never touched by it. */
export default function StillworldHome() {
  return (
    <>
      <style>{worldStyles}</style>
      <StillworldApp />
    </>
  );
}
