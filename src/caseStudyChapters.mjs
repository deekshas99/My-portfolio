export function caseStudyCover(project) {
  return project.hero || project.widget || project.story?.find(block => block.type === 'image' && block.src)?.src;
}

function proseChapter(label, text, image) {
  return { label, title: label, blocks: [{ type: 'p', text }], images: image ? [image] : [] };
}

export function buildCaseStudyChapters(project) {
  const cover = caseStudyCover(project);
  const chapters = [{ label: 'Overview', title: project.title, overview: true, images: cover ? [cover] : [] }];

  if (project.story?.length) {
    let chapter;
    let group = '';
    for (const block of project.story) {
      if (block.type === 'label' || block.type === 'sub') {
        if (block.type === 'label') group = block.text;
        chapter = {
          label: group || block.text,
          title: block.heading || block.text,
          indexTitle: block.type === 'sub' ? block.text : undefined,
          blocks: [],
          images: [],
        };
        chapters.push(chapter);
        continue;
      }
      if (!chapter) {
        chapter = { label: 'Introduction', title: 'Introduction', blocks: [], images: [] };
        chapters.push(chapter);
      }
      if (block.type === 'image') {
        if (block.src) chapter.images.push(block.src);
      } else if (block.type === 'h' && !chapter.blocks.length && chapter.title === chapter.label) {
        chapter.title = block.text;
      } else {
        chapter.blocks.push(block);
      }
    }
  } else {
    if (project.approach) chapters.push(proseChapter('Approach', project.approach));
    if (project.outcome) chapters.push(proseChapter('Outcome', project.outcome));
  }

  for (const chapter of project.chapters || []) {
    if (chapter.text || chapter.image) chapters.push(proseChapter(chapter.name, chapter.text, chapter.image));
  }

  let previousImage = cover;
  return chapters
    .filter(chapter => chapter.overview || chapter.blocks.length || chapter.images.length || (
      chapter.title !== chapter.label && !chapter.indexTitle
    ))
    .flatMap((chapter, index) => {
      let fallback = previousImage;
      if (chapter.label === 'Outcomes' && project.widget) fallback = project.widget;
      if (chapter.label === "What I'd do differently") fallback = cover;
      const images = chapter.images.length ? chapter.images : [fallback];
      if (chapter.images.length) previousImage = chapter.images[0];
      return images.map((image, visualIndex) => ({
        ...chapter, image, visualIndex, visualCount: images.length,
        id: `${project.id}-chapter-${index}-${visualIndex}`,
      }));
    });
}
