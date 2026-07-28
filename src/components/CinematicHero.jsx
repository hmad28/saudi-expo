import React, { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const segment = (progress, start, end) => clamp((progress - start) / (end - start));

export function CinematicHero({ onBuyClick }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(0);
  const progressRef = useRef(-1);
  const pointerRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const visibleRef = useRef(true);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      stage.style.setProperty("--cinematic-progress", "1");
      return undefined;
    }

    let sectionTop = 0;
    let scrollRange = 1;
    const measure = () => {
      const rect = section.getBoundingClientRect();
      sectionTop = window.scrollY + rect.top;
      scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
    };

    const render = () => {
      frameRef.current = 0;
      if (!visibleRef.current) return;

      const progress = clamp((window.scrollY - sectionTop) / scrollRange);
      const pointer = pointerRef.current;
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;

      const pointerDelta = Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y);
      if (Math.abs(progress - progressRef.current) > 0.0005 || pointerDelta > 0.05) {
        progressRef.current = progress;
        const introOut = segment(progress, 0.15, 0.35);
        const storyIn = segment(progress, 0.31, 0.43);
        const storyOut = segment(progress, 0.53, 0.61);
        const mediaIn = segment(progress, 0.58, 0.72);
        const mediaOut = segment(progress, 0.82, 0.94);
        const settleIn = segment(progress, 0.84, 1);

        stage.style.setProperty("--cinematic-progress", progress.toFixed(4));
        stage.style.setProperty("--intro-out", introOut.toFixed(4));
        stage.style.setProperty("--story-visibility", (storyIn * (1 - storyOut)).toFixed(4));
        stage.style.setProperty("--media-visibility", (mediaIn * (1 - mediaOut * 0.7)).toFixed(4));
        stage.style.setProperty("--settle-visibility", settleIn.toFixed(4));
        stage.style.setProperty("--pointer-x", `${pointer.x.toFixed(2)}px`);
        stage.style.setProperty("--pointer-y", `${pointer.y.toFixed(2)}px`);
      }

      if (pointerDelta > 0.05) frameRef.current = requestAnimationFrame(render);
    };

    const requestRender = () => {
      if (!frameRef.current) frameRef.current = requestAnimationFrame(render);
    };

    const onPointerMove = (event) => {
      if (window.innerWidth < 900) return;
      pointerRef.current.tx = ((event.clientX / window.innerWidth) - 0.5) * 16;
      pointerRef.current.ty = ((event.clientY / window.innerHeight) - 0.5) * 10;
      requestRender();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) {
        measure();
        requestRender();
      }
    });

    measure();
    observer.observe(section);
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    requestRender();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("pointermove", onPointerMove);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <>
      <section className="cinematic" id="top" ref={sectionRef}>
        <div className="cinematic-stage" ref={stageRef}>
          <div className="scene-layer scene-background" />
          <div className="scene-layer scene-midground" />
          <div className="scene-haze" />
          <div className="scene-frame scene-frame-left" />
          <div className="scene-frame scene-frame-right" />
          <div className="scene-vignette" />

          <div className="cinematic-intro shell">
            <div className="event-kicker">Saudi Education Expo 2026</div>
            <h1>Temukan jalur studimu di Arab Saudi.</h1>
            <p>
              Temui universitas, penyedia beasiswa, alumni, dan komunitas pelajar Indonesia dalam satu event.
            </p>
            <div className="event-chips" aria-label="Informasi acara">
              <span><Icon name="calendar" size={18} />31 Juli–2 Agustus 2026</span>
              <span><Icon name="pin" size={18} />SMESCO Indonesia, Jakarta</span>
            </div>
            <div className="hero-actions">
              <button className="btn btn-primary btn-large" onClick={onBuyClick}>
                Beli Tiket <Icon name="arrow" size={19} />
              </button>
              <a className="btn btn-secondary btn-large" href="#tentang">Lihat Event</a>
            </div>
          </div>

          <div className="cinematic-story shell">
            <div className="story-card">
              <span className="section-label">Lebih dari sebuah expo</span>
              <h2>Kenali kampus. Pahami beasiswa. Temukan komunitasmu.</h2>
              <p>
                Dapatkan informasi langsung dari universitas, alumni, dan pelajar Indonesia yang sedang menempuh studi di Arab Saudi.
              </p>
              <div className="story-stats">
                <div><strong>20+</strong><span>Institusi</span></div>
                <div><strong>30+</strong><span>Pembicara & alumni</span></div>
                <div><strong>3</strong><span>Hari event</span></div>
              </div>
            </div>
          </div>

          <div className="cinematic-media shell">
            <button className="cinematic-preview" onClick={() => setVideoOpen(true)}>
              <span className="preview-play"><Icon name="play" size={22} /></span>
              <span>
                <small>Suasana expo sebelumnya</small>
                <strong>Putar video event</strong>
              </span>
              <span className="preview-duration">02:18</span>
            </button>
          </div>

          <div className="cinematic-settle shell" aria-hidden="true">
            <span>Scroll untuk melihat detail event</span>
            <span className="settle-line" />
          </div>
        </div>
      </section>

      {videoOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setVideoOpen(false)}>
          <div className="video-modal" role="dialog" aria-modal="true" aria-label="Video event sebelumnya" onMouseDown={(event) => event.stopPropagation()}>
            <button className="icon-button modal-close" onClick={() => setVideoOpen(false)} aria-label="Tutup video">
              <Icon name="close" />
            </button>
            <div className="video-frame">
              <iframe
                src="https://www.youtube.com/embed/cnDHi7xlipU?autoplay=1"
                title="Saudi Education Expo event video"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

