import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { buildCaseStudyChapters } from './caseStudyChapters.mjs';
import { CHAPTER_MOTION_MS, createChapterWheelHandler } from './caseStudyMotion.mjs';
import { desktopSlideWindow, getCaseStudyImageProps } from './caseStudyMedia.mjs';
import CaseStudyIndexRows from './CaseStudyIndexRows';
import CaseStudyStats from './CaseStudyStats';
import styles from './CaseStudy.css?inline';

const narrowViewport = '(max-width: 760px)';
const relatedChapter = { id: 'related-studies', title: 'More case studies', label: 'More case studies', related: true };

function chapterName(chapter) {
  const title = chapter.indexTitle || chapter.label;
  return chapter.visualCount > 1 ? `${title} · ${chapter.visualIndex + 1}` : title;
}

function ChapterNavigation({ chapters, index, goTo, onFinish, indexOpen, setIndexOpen, navigationRef, triggerRef }) {
  const last = index === chapters.length - 1;
  const currentName = chapterName(chapters[index]);

  const chooseSlide = id => {
    triggerRef.current?.focus({ preventScroll: true });
    goTo(chapters.findIndex(chapter => chapter.id === id));
  };

  return (
    <div className="cs-navigation-dock" ref={navigationRef}>
      <div className="cs-chapter-navigation">
        <nav className="cs-chapter-controls" aria-label="Slide navigation">
          <button className="cs-step" type="button" onClick={() => goTo(index - 1)} disabled={index === 0}>Previous</button>
          <button
            ref={triggerRef}
            className="cs-index bl-index-copper"
            type="button"
            aria-label={`Slide index: ${currentName}`}
            aria-expanded={indexOpen}
            aria-controls="case-study-slide-index"
            onClick={() => setIndexOpen(!indexOpen)}
          >
            <span className="bl-index-sheen" aria-hidden="true" />
            <span className="bl-index-pit" data-lit="true" aria-hidden="true" />
            <span className="cs-index-name">{currentName}</span>
          </button>
          <button className="cs-step" type="button" onClick={last ? onFinish : () => goTo(index + 1)}>{last ? 'Finish' : 'Next'}</button>
        </nav>
        <progress className="cs-chapter-progress" value={index + 1} max={chapters.length} aria-label="Case study progress" />
        {indexOpen && (
          <nav className="cs-index-panel bl-index-copper" id="case-study-slide-index" aria-label="Slide index">
            <span className="bl-index-sheen" aria-hidden="true" />
            <div className="bl-float-index-label">Index</div>
            <CaseStudyIndexRows
              items={chapters.map(chapter => ({ id: chapter.id, name: chapterName(chapter) }))}
              activeId={chapters[index].id}
              onSelect={chooseSlide}
              vertical
            />
          </nav>
        )}
      </div>
    </div>
  );
}

const RelatedStudies = memo(function RelatedStudies({ studies, onOpen }) {
  return (
    <div className="cs-related-grid">
      {studies.map(({ project, image }) => (
        <button type="button" className="cs-study-tile" key={project.id} onClick={() => onOpen(project)}
          style={{ '--study-accent': project.accent }}>
          {image && <img {...getCaseStudyImageProps(image)} alt="" loading="lazy" decoding="async" />}
          <span className="cs-study-name">{project.title}</span>
          {project.role && <span className="cs-study-role">{project.role}</span>}
        </button>
      ))}
    </div>
  );
});

function ChapterBlock({ block }) {
  if (block.type === 'list') {
    const List = block.ordered ? 'ol' : 'ul';
    return <List className="cs-outcomes">{block.items.map((item, index) => <li key={index}>{item}</li>)}</List>;
  }
  if (block.type === 'quote') return <blockquote className="cs-quote">{block.text}</blockquote>;
  if (block.type === 'h') return <h3 className="cs-subtitle">{block.text}</h3>;
  return block.text ? <p>{block.text}</p> : null;
}

function Overview({ project, chapter }) {
  const lead = project.tagline || project.brief;
  const facts = [
    ['Role', project.role],
    ['Timeline', project.timeline],
    ['Team', project.team],
    ['Scope', project.deliverables],
    ['Client', project.client !== project.title && !project.hideOverviewClient && project.client],
    ['Year', project.year && !project.timeline?.includes(String(project.year)) && project.year],
  ].filter(([, value]) => value);

  return <>
    <div className="cs-overview-intro">
      <h1 id={`${chapter.id}-title`} className="cs-title cs-title-cover">{project.title}</h1>
      {lead && <p className="cs-lead">{lead}</p>}
      {project.tagline && project.brief && <p>{project.brief}</p>}
    </div>
    {(project.figures?.length > 0 || facts.length > 0) && <div className="cs-overview-details">
      {project.figures?.length > 0 && <CaseStudyStats figures={project.figures} className="bl-case-stats cs-stats" />}
      {facts.length > 0 && <dl className="cs-facts">
        {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>}
    </div>}
  </>;
}

const ChapterVisual = memo(function ChapterVisual({ project, chapter, eager, priority, onExpand }) {
  const caption = chapter.visualCount > 1 ? `${chapter.label}, visual ${chapter.visualIndex + 1}` : chapter.label;

  return (
    <figure className={`cs-visual${chapter.overview ? ' cs-visual-cover' : ''}${!chapter.image ? ' cs-visual-empty' : ''}`}>
      {chapter.image && <>
        <img {...getCaseStudyImageProps(chapter.image)} alt={`${project.title} — ${caption}`} loading={eager ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority} />
        <button type="button" className="cs-expand" onClick={event => onExpand(event, chapter)} aria-label={`Enlarge ${caption} image`}>View image</button>
      </>}
      <figcaption><span>{chapter.label}</span><span>{project.title}</span></figcaption>
    </figure>
  );
});

export default function CaseStudy({ project, onClose, onOpen, relatedStudies, renderActions }) {
  const chapters = useMemo(() => [...buildCaseStudyChapters(project), relatedChapter], [project]);
  const [active, setActive] = useState(0);
  const [continuous, setContinuous] = useState(() => window.matchMedia(narrowViewport).matches);
  const [motion, setMotion] = useState(null);
  const [settled, setSettled] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const scrollRef = useRef(null), rootRef = useRef(null), activeRef = useRef(0);
  const closeRef = useRef(null), imageTrigger = useRef(null);
  const navigationRef = useRef(null), indexTriggerRef = useRef(null);
  const movingRef = useRef(false), pendingRef = useRef(null), timerRef = useRef(null);
  const navigateRef = useRef(null);
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compositorMotion = typeof Element.prototype.animate === 'function';

  const showChapter = useCallback(index => {
    activeRef.current = index;
    setActive(index);
  }, []);

  const finishMotion = useCallback(() => {
    if (!movingRef.current) return;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    movingRef.current = false;
    const queued = pendingRef.current;
    pendingRef.current = null;
    if (queued !== null && queued !== activeRef.current) navigateRef.current?.(queued);
    else {
      setMotion(null);
      setSettled(activeRef.current);
    }
  }, []);

  // On desktop both physical panels remain in the same grid cells. A request
  // swaps just their contents, rather than scrolling a series of full frames.
  // Keep one pending intentional step so wheel detents and fast clicks are
  // responsive without interrupting an animation or jumping past content.
  const goTo = useCallback(function navigate(index) {
    const destination = Math.max(0, Math.min(chapters.length - 1, index));
    setIndexOpen(false);

    if (continuous) {
      const scroller = scrollRef.current;
      const target = scroller?.children[destination];
      if (target) scroller.scrollTo({ top: target.offsetTop, behavior: reduced() ? 'instant' : 'smooth' });
      return;
    }

    if (movingRef.current) {
      pendingRef.current = destination === activeRef.current ? null : destination;
      return;
    }
    const previous = activeRef.current;
    if (destination === previous) return;
    // Keeping focus in the stationary stage avoids losing keyboard access
    // when the slide holding the previously focused element becomes inert.
    if (document.activeElement?.closest('.cs-slide')) {
      rootRef.current?.querySelector('.cs-copy-stage')?.focus({ preventScroll: true });
    }
    if (reduced()) {
      setMotion(null);
      setSettled(destination);
      showChapter(destination);
      return;
    }

    movingRef.current = true;
    const direction = destination > previous ? 1 : -1;
    setMotion({ previous, direction });
    showChapter(destination);

  }, [chapters.length, continuous, showChapter]);

  useLayoutEffect(() => { navigateRef.current = goTo; }, [goTo]);

  // Finish from animation completion; the timer is only a safety net and
  // starts after commit. Move just four compositor layers in the fixed panels.
  useLayoutEffect(() => {
    if (!motion || continuous) return;
    const root = rootRef.current;
    let cancelled = false;
    const complete = () => { if (!cancelled) finishMotion(); };
    const animations = [];
    const incoming = root?.querySelector('.cs-visual-slide[data-state="active"]');
    const onEnd = event => {
      if (event.target === incoming && event.animationName === 'cs-content-enter') complete();
    };
    if (compositorMotion && root) {
      for (const slide of root.querySelectorAll('.cs-slide[data-state="active"], .cs-slide[data-state="outgoing"]')) {
        const entering = slide.dataset.state === 'active', distance = motion.direction * 100;
        animations.push(slide.animate([
          { transform: `translate3d(0,${entering ? distance : 0}%,0)` },
          { transform: `translate3d(0,${entering ? 0 : -distance}%,0)` },
        ], { duration: CHAPTER_MOTION_MS, easing: 'cubic-bezier(.22,.72,.2,1)', fill: 'both' }));
      }
      if (animations.length) Promise.allSettled(animations.map(animation => animation.finished)).then(complete);
    } else incoming?.addEventListener('animationend', onEnd);
    const timer = window.setTimeout(complete, CHAPTER_MOTION_MS + 35);
    timerRef.current = timer;
    return () => {
      cancelled = true;
      incoming?.removeEventListener('animationend', onEnd);
      for (const animation of animations) animation.cancel();
      window.clearTimeout(timer);
      if (timerRef.current === timer) timerRef.current = null;
    };
  }, [motion, continuous, finishMotion, compositorMotion]);

  const desktopIndices = useMemo(() => desktopSlideWindow(chapters.length, active, settled, motion?.previous ?? null),
    [chapters.length, active, settled, motion]);
  // Warm nearby panel-sized images while stationary, not mid-transition.
  useEffect(() => {
    if (continuous || motion) return;
    let cancelled = false;
    const root = rootRef.current;
    const images = [...(root?.querySelectorAll('.cs-image-panel .cs-visual-slide img') || [])];
    const warm = async () => {
      for (const image of images) {
        if (cancelled || root?.dataset.motion === 'moving') return;
        if (typeof image.decode === 'function') await image.decode().catch(() => {});
      }
    };
    const idle = typeof window.requestIdleCallback === 'function';
    const work = idle ? window.requestIdleCallback(warm, { timeout: 100 }) : window.setTimeout(warm, 24);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(work);
      else window.clearTimeout(work);
    };
  }, [active, continuous, motion, settled]);

  useEffect(() => {
    const root = rootRef.current;
    // Listen across both stationary panels; narrow screens scroll natively.
    if (!root || continuous || expanded || indexOpen) return;
    const onWheel = createChapterWheelHandler({
      getViewportHeight: () => root.clientHeight,
      isTurning: () => movingRef.current,
      advance: direction => goTo(activeRef.current + direction),
    });
    let touch = null;
    const onTouchStart = event => {
      if (event.touches.length !== 1) { touch = null; return; }
      const point = event.touches[0];
      const pane = event.target.closest?.('.cs-copy-scroll');
      touch = { x: point.clientX, y: point.clientY, pane, scrollTop: pane?.scrollTop || 0 };
    };
    const onTouchEnd = event => {
      const start = touch;
      touch = null;
      if (!start || event.touches.length) return;
      const point = event.changedTouches[0];
      if (!point) return;
      const dy = start.y - point.clientY;
      if (Math.abs(dy) < 55 || Math.abs(dy) < Math.abs(start.x - point.clientX)) return;
      // A swipe that was actually reading long text is not a page turn.
      if (start.pane && (Math.abs(start.pane.scrollTop - start.scrollTop) > 2 ||
        (dy > 0 ? start.pane.scrollHeight - start.pane.clientHeight - start.scrollTop > 1 : start.scrollTop > 1))) return;
      goTo(activeRef.current + Math.sign(dy));
    };
    const cancelTouch = () => { touch = null; };
    root.addEventListener('wheel', onWheel, { passive: false });
    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchend', onTouchEnd, { passive: true });
    root.addEventListener('touchcancel', cancelTouch, { passive: true });
    return () => {
      root.removeEventListener('wheel', onWheel);
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchend', onTouchEnd);
      root.removeEventListener('touchcancel', cancelTouch);
    };
  }, [continuous, expanded, indexOpen, goTo]);

  useEffect(() => {
    if (!indexOpen) return;
    const currentSlide = navigationRef.current?.querySelector('[aria-current="step"]');
    currentSlide?.focus({ preventScroll: true });
    currentSlide?.scrollIntoView({ block: 'nearest' });
    const dismiss = event => {
      if (!navigationRef.current?.contains(event.target)) {
        if (navigationRef.current?.contains(document.activeElement)) {
          indexTriggerRef.current?.focus({ preventScroll: true });
        }
        setIndexOpen(false);
      }
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [indexOpen]);
  const expandChapter = useCallback((event, chapter) => {
    imageTrigger.current = event.currentTarget;
    setExpanded(chapter);
  }, []);
  const closeImage = () => {
    setExpanded(null);
    imageTrigger.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    const media = window.matchMedia(narrowViewport);
    const cancelMotion = () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = null;
      movingRef.current = false;
      pendingRef.current = null;
    };
    const sync = () => {
      cancelMotion();
      setMotion(null);
      setSettled(activeRef.current);
      setContinuous(media.matches);
    };
    media.addEventListener('change', sync);
    if (media.matches !== continuous) sync();
    return () => {
      media.removeEventListener('change', sync);
      cancelMotion();
    };
  }, []);

  useLayoutEffect(() => {
    const previousFocus = document.activeElement;
    const app = document.getElementById('root'), wasInert = app?.inert;
    const previousFlag = app?.getAttribute('data-case-study-active');
    if (app) {
      app.inert = true;
      app.setAttribute('data-case-study-active', 'true');
    }
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      if (app) {
        app.inert = wasInert;
        if (previousFlag === null) app.removeAttribute('data-case-study-active');
        else app.setAttribute('data-case-study-active', previousFlag);
      }
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    // Mobile/tablet: retain natural, continuous reading with the chapter
    // name following the actual scroll position.
    const scroller = scrollRef.current;
    if (!continuous || !scroller) return;
    const sections = [...scroller.children];
    const current = sections[activeRef.current];
    if (current) scroller.scrollTop = current.offsetTop;
    const syncChapter = () => {
      const { scrollTop, clientHeight, scrollHeight } = scroller;
      const atEnd = scrollTop > 0 && scrollHeight - scrollTop - clientHeight <= 1;
      const readingLine = scrollTop + Math.min(clientHeight * .25, 120);
      const index = atEnd
        ? sections.length - 1
        : Math.max(0, sections.findLastIndex(section => section.offsetTop <= readingLine));
      if (index !== activeRef.current) showChapter(index);
    };
    const resize = new ResizeObserver(syncChapter);
    resize.observe(scroller);
    sections.forEach(section => resize.observe(section));
    scroller.addEventListener('scroll', syncChapter, { passive: true });
    syncChapter();
    return () => {
      resize.disconnect();
      scroller.removeEventListener('scroll', syncChapter);
    };
  }, [chapters, continuous, showChapter]);

  const onKeyDown = event => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (expanded) closeImage();
      else if (indexOpen) {
        setIndexOpen(false);
        indexTriggerRef.current?.focus({ preventScroll: true });
      } else onClose();
      return;
    }
    if (event.key === 'Tab') {
      const scope = expanded ? rootRef.current.querySelector('.cs-lightbox') : rootRef.current;
      const controls = [...scope.querySelectorAll('button:not(:disabled), select, [tabindex="0"]')]
        .filter(el => el.getClientRects().length && !el.closest('[inert]'));
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      return;
    }
    if (continuous || expanded || indexOpen || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const next = ['ArrowDown', 'PageDown', ' '].includes(event.key), previous = ['ArrowUp', 'PageUp'].includes(event.key);
    if (event.key === ' ' && event.target.closest('button')) return;
    if (next || previous || event.key === 'Home' || event.key === 'End') {
      const direction = previous || event.shiftKey ? -1 : 1;
      const pane = event.target.closest('.cs-copy-scroll');
      const canRead = pane && (direction > 0 ? pane.scrollHeight - pane.clientHeight - pane.scrollTop > 1 : pane.scrollTop > 1);
      if (canRead && (next || previous)) return;
      event.preventDefault();
      goTo(event.key === 'Home' ? 0 : event.key === 'End' ? chapters.length - 1 : activeRef.current + direction);
    }
  };

  const slideState = index => active === index ? 'active' : motion?.previous === index ? 'outgoing' : 'inactive';

  const header = (
    <header className="cs-topbar">
      {renderActions(closeRef)}
      <span className="cs-wordmark">
        <span className="cs-wordmark-name">{project.wordmark || project.title}</span>
        <span className="cs-star" aria-hidden="true">✳</span>
      </span>
    </header>
  );

  const navigation = (
    <ChapterNavigation
      chapters={chapters}
      index={active}
      goTo={goTo}
      onFinish={onClose}
      indexOpen={indexOpen}
      setIndexOpen={setIndexOpen}
      navigationRef={navigationRef}
      triggerRef={indexTriggerRef}
    />
  );

  const renderCopy = (chapter, index, desktop) => (
    <div
      className={`cs-copy${chapter.overview ? ' cs-copy-overview' : ''}${desktop ? ' cs-slide' : ''}`}
      key={chapter.id}
      data-state={desktop ? slideState(index) : undefined}
      inert={desktop && active !== index ? true : undefined}
      role={desktop ? 'region' : undefined}
      aria-labelledby={desktop ? `${chapter.id}-title` : undefined}
    >
      <div className="cs-copy-scroll" tabIndex={desktop && active === index ? 0 : undefined}>
        {chapter.overview ? <Overview project={project} chapter={chapter} /> : <>
          <h2 id={`${chapter.id}-title`} className="cs-title">{chapter.title}</h2>
          {chapter.blocks?.map((block, i) => <ChapterBlock block={block} key={i} />)}
        </>}
      </div>
    </div>
  );

  const renderVisual = (chapter, index) => chapter.related
    ? <RelatedStudies studies={relatedStudies} onOpen={onOpen} />
    : <ChapterVisual
      project={project}
      chapter={chapter}
      eager={!continuous || Math.abs(index - active) <= 1}
      priority={index === active ? 'high' : 'low'}
      onExpand={expandChapter}
    />;

  return createPortal(<div
    className={`cs-case ${continuous ? 'cs-continuous' : 'cs-paged'}`}
    ref={rootRef}
    role="dialog"
    aria-modal="true"
    aria-label={`${project.title} case study`}
    data-open="true"
    data-motion={motion ? 'moving' : 'idle'}
    data-motion-engine={compositorMotion ? 'compositor' : 'css'}
    style={{ '--case-accent': project.accent, '--cs-motion-ms': `${CHAPTER_MOTION_MS}ms`, '--cs-motion-offset': `${(motion?.direction || 1) * 100}%` }}
    onKeyDown={onKeyDown}
  >
    <style>{styles}</style>
    {continuous ? <>
      {header}
      <div className="cs-scroll" ref={scrollRef} tabIndex={0} aria-label="Case study chapters">
        {chapters.map((chapter, index) => <section className="cs-chapter" key={chapter.id} aria-labelledby={`${chapter.id}-title`}>
          <div className="cs-frame">
            {renderCopy(chapter, index, false)}
            {renderVisual(chapter, index)}
          </div>
        </section>)}
      </div>
      {navigation}
    </> : (
      <div className="cs-desktop-shell">
        <section className="cs-writing-panel" aria-label="Case study writing">
          {header}
          <div className="cs-copy-stage" tabIndex={0} aria-label="Case study chapters">
            {desktopIndices.map(index => renderCopy(chapters[index], index, true))}
          </div>
          {navigation}
        </section>
        <section className="cs-image-panel" aria-label="Case study images">
          {desktopIndices.map(index => <div
            className="cs-visual-slide cs-slide"
            key={chapters[index].id}
            data-state={slideState(index)}
            inert={active !== index ? true : undefined}
          >
            {renderVisual(chapters[index], index)}
          </div>)}
        </section>
      </div>
    )}
    {expanded && <div className="cs-lightbox" role="dialog" aria-modal="true" aria-label={`${expanded.label} image`}>
      <button autoFocus onClick={closeImage}>Close image</button><img src={expanded.image} alt={`${project.title} — ${expanded.title}`}/>
    </div>}
  </div>, document.body);
}
