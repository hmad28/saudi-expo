import React, { useEffect, useRef } from "react";
import { Icon } from "./Icons";

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const segment = (progress, start, end) => clamp((progress - start) / (end - start));

export function CinematicHero({ onTicketClick }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(0);
  const progressRef = useRef(-1);
  const pointerRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const visibleRef = useRef(true);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth <= 760) {
      stage.style.setProperty("--cinematic-progress", "0");
      return undefined;
    }
    const introElement = stage.querySelector(".cinematic-intro");
    const settleElement = stage.querySelector(".cinematic-settle");
    settleElement.inert = true;

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
      pointer.x += (pointer.tx - pointer.x) * 0.1;
      pointer.y += (pointer.ty - pointer.y) * 0.1;
      const pointerDelta = Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y);

      if (Math.abs(progress - progressRef.current) > 0.0005 || pointerDelta > 0.05) {
        progressRef.current = progress;
        stage.style.setProperty("--cinematic-progress", progress.toFixed(4));
        stage.style.setProperty("--gateway-open", segment(progress, 0.6, 0.85).toFixed(4));
        const introOut = segment(progress, 0.86, 1);
        const settleIn = segment(progress, 0.85, 0.98);
        stage.style.setProperty("--intro-out", introOut.toFixed(4));
        stage.style.setProperty("--settle-visibility", settleIn.toFixed(4));
        stage.style.setProperty("--pointer-x", `${pointer.x.toFixed(2)}px`);
        stage.style.setProperty("--pointer-y", `${pointer.y.toFixed(2)}px`);
        introElement.inert = introOut > 0.72;
        settleElement.inert = settleIn < 0.62;
      }
      if (pointerDelta > 0.05) frameRef.current = requestAnimationFrame(render);
    };
    const requestRender = () => {
      if (!frameRef.current) frameRef.current = requestAnimationFrame(render);
    };
    const onPointerMove = (event) => {
      pointerRef.current.tx = (event.clientX / window.innerWidth - 0.5) * 10;
      pointerRef.current.ty = (event.clientY / window.innerHeight - 0.5) * 6;
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
      introElement.inert = false;
      settleElement.inert = false;
    };
  }, []);

  return (
    <section className="cinematic official-hero" id="top" ref={sectionRef}>
      <div className="cinematic-stage" ref={stageRef}>
        <div className="scene-layer scene-background" />
        <div className="scene-frame scene-frame-left" />
        <div className="scene-frame scene-frame-right" />
        <div className="scene-haze" />
        <div className="scene-vignette" />

        <div className="cinematic-intro shell">
          <div className="event-kicker">Agenda Tahunan <span /> Saudi Education Expo 2026</div>
          <h1>Temukan jalan studimu ke Arab Saudi.</h1>
          <p>Dapatkan informasi kampus, beasiswa, pendaftaran, dan kehidupan pelajar di Arab Saudi langsung dari mahasiswa, alumni, pakar, dan institusi terkait.</p>
          <div className="event-chips" aria-label="Informasi acara">
            <span><Icon name="calendar" size={18} />31 Juli–2 Agustus 2026</span>
            <span><Icon name="pin" size={18} />SMESCO Indonesia, Jakarta</span>
          </div>
          <div className="hero-actions">
            <button className="btn btn-primary btn-large" onClick={onTicketClick}>Lihat Informasi Tiket <Icon name="arrow" size={19} /></button>
            <a className="btn btn-secondary btn-large" href="#tentang">Tentang Saudi Expo</a>
          </div>
        </div>

        <div className="cinematic-settle shell">
          <article className="cinematic-profile">
            <span className="logo-mark" aria-hidden="true">SEE<span>26</span></span>
            <div className="cinematic-profile-main">
              <small>Agenda tahunan pendidikan Saudi</small>
              <strong>Saudi Education Expo 2026</strong>
            </div>
            <div className="cinematic-profile-facts">
              <span><Icon name="calendar" size={17} />31 Juli–2 Agustus 2026</span>
              <span><Icon name="pin" size={17} />SMESCO Indonesia, Jakarta</span>
            </div>
            <button className="btn btn-primary" onClick={onTicketClick}>Info Tiket</button>
          </article>
        </div>
      </div>
    </section>
  );
}
