import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { buildCaseStudyChapters } from './caseStudyChapters.mjs';
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

function RelatedStudies({ studies, onOpen }) {
  return (
    <div className="cs-related-grid">
      {studies.map(({ project, image }) => (
        <button type="button" className="cs-study-tile" key={project.id} onClick={() => onOpen(project)}
          style={{ '--study-accent': project.accent }}>
          {image && <img src={image} alt="" loading="lazy" decoding="async" />}
          <span className="cs-study-name">{project.title}</span>
          {project.role && <span className="cs-study-role">{project.role}</span>}
        </button>
      ))}
    </div>
  );
}

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

function ChapterVisual({ project, chapter, eager, onExpand }) {
  const caption = chapter.visualCount > 1 ? `${chapter.label}, visual ${chapter.visualIndex + 1}` : chapter.label;

  return (
    <figure className={`cs-visual${chapter.overview ? ' cs-visual-cover' : ''}${!chapter.image ? ' cs-visual-empty' : ''}`}>
      {chapter.image && <>
        <img src={chapter.image} alt={`${project.title} — ${caption}`} loading={eager ? 'eager' : 'lazy'} decoding="async" />
        <button type="button" className="cs-expand" onClick={onExpand} aria-label={`Enlarge ${caption} image`}>View image</button>
      </>}
      <figcaption><span>{chapter.label}</span><span>{project.title}</span></figcaption>
    </figure>
  );
}

export default function CaseStudy({ project, onClose, onOpen, relatedStudies, renderActions }) {
  const chapters = useMemo(() => [...buildCaseStudyChapters(project), relatedChapter], [project]);
  const [active, setActive] = useState(0);
  const [continuous, setContinuous] = useState(() => window.matchMedia(narrowViewport).matches);
  const [expanded, setExpanded] = useState(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const scrollRef = useRef(null), rootRef = useRef(null), activeRef = useRef(0);
  const closeRef = useRef(null), imageTrigger = useRef(null);
  const navigationRef = useRef(null), indexTriggerRef = useRef(null);
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const goTo = index => {
    const scroller = scrollRef.current;
    const destination = Math.max(0, Math.min(chapters.length - 1, index));
    const target = scroller?.children[destination];
    setIndexOpen(false);
    if (target) scroller.scrollTo({ top: target.offsetTop, behavior: reduced() ? 'instant' : 'smooth' });
  };

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
  const closeImage = () => {
    setExpanded(null);
    imageTrigger.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    const media = window.matchMedia(narrowViewport);
    const sync = () => setContinuous(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const app = document.getElementById('root'), wasInert = app?.inert;
    if (app) app.inert = true;
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      if (app) app.inert = wasInert;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const scroller = scrollRef.current;
    const sections = [...scroller.children];
    const showChapter = index => {
      activeRef.current = index;
      setActive(index);
    };

    if (continuous) {
      // A chapter may be taller than the viewport, so track its top instead
      // of requiring a percentage of the card to be visible.
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
    }

    const observer = new IntersectionObserver(entries => {
      const visible = entries.find(entry => entry.intersectionRatio > .55);
      if (visible) showChapter(Number(visible.target.dataset.chapter));
    }, { root: scroller, threshold: [.55] });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [chapters, continuous]);

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
    if (continuous || expanded || indexOpen || event.target.closest('button, .cs-copy-scroll')) return;
    const next = ['ArrowDown', 'PageDown', ' '].includes(event.key), previous = ['ArrowUp', 'PageUp'].includes(event.key);
    if (next || previous || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      goTo(event.key === 'Home' ? 0 : event.key === 'End' ? chapters.length - 1 : activeRef.current + (previous || event.shiftKey ? -1 : 1));
    }
  };

  return createPortal(<div className="cs-case" ref={rootRef} role="dialog" aria-modal="true" aria-label={`${project.title} case study`} data-open="true" style={{ '--case-accent': project.accent }} onKeyDown={onKeyDown}>
    <style>{styles}</style><div className="cs-backdrop" aria-hidden="true" />
    <header className="cs-topbar">
      {renderActions(closeRef)}
      <span className="cs-wordmark">
        <span className="cs-wordmark-name">{project.wordmark || project.title}</span>
        <span className="cs-star" aria-hidden="true">✳</span>
      </span>
    </header>
    <div className="cs-scroll" ref={scrollRef} tabIndex={0} aria-label="Case study chapters">
      {chapters.map((chapter, index) => <section className="cs-chapter" key={chapter.id} data-chapter={index} aria-labelledby={`${chapter.id}-title`} inert={!continuous && active !== index ? true : undefined}>
        <div className={chapter.related ? 'cs-frame cs-frame-related' : 'cs-frame'}>
          <div className={chapter.overview ? 'cs-copy cs-copy-overview' : 'cs-copy'}>
            <div className="cs-copy-scroll" tabIndex={!continuous && active === index ? 0 : undefined}>
              {chapter.overview ? <Overview project={project} chapter={chapter} /> : <>
                <h2 id={`${chapter.id}-title`} className="cs-title">{chapter.title}</h2>
                {chapter.blocks?.map((block, i) => <ChapterBlock block={block} key={i} />)}
              </>}
            </div>
          </div>
          {chapter.related ? <RelatedStudies studies={relatedStudies} onOpen={onOpen} /> : <ChapterVisual
            project={project}
            chapter={chapter}
            eager={Math.abs(index - active) <= 1}
            onExpand={event => { imageTrigger.current = event.currentTarget; setExpanded(chapter); }}
          />}
        </div>
      </section>)}
    </div>
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
    {expanded && <div className="cs-lightbox" role="dialog" aria-modal="true" aria-label={`${expanded.label} image`}>
      <button autoFocus onClick={closeImage}>Close image</button><img src={expanded.image} alt={`${project.title} — ${expanded.title}`}/>
    </div>}
  </div>, document.body);
}
