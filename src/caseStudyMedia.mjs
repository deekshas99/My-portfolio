import { CASE_STUDY_PREVIEWS } from './caseStudyImagePreviews.mjs';
export function getCaseStudyImageProps(source) {
  const candidates = CASE_STUDY_PREVIEWS[source];
  if (!candidates?.length) return { src: source };
  return {
    src: candidates[0].src,
    srcSet: candidates.map(candidate => `${candidate.src} ${candidate.width}w`).join(', '),
    sizes: '(max-width: 760px) 100vw, 50vw',
  };
}
export function desktopSlideWindow(count, active, settled, outgoing = null) {
  const indices = new Set([active, outgoing]);
  for (let index = settled - 2; index <= settled + 2; index++) indices.add(index);
  return [...indices].filter(index => Number.isInteger(index) && index >= 0 && index < count).sort((a,b) => a-b);
}
