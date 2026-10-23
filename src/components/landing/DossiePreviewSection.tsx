'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Chapter {
  id: string;
  n: string;
  title: string;
  start: number;
  end: number;
}

const CHAPTERS: Chapter[] = [
  { id: 'c1', n: '01', title: 'Pacientes', start: 0, end: 9.8 },
  { id: 'c2', n: '02', title: 'Linha do tempo', start: 9.8, end: 17.8 },
  { id: 'c3', n: '03', title: 'Dramatização', start: 17.8, end: 26.0 },
  { id: 'c4', n: '04', title: 'Evolução', start: 26.0, end: 30.2 },
  { id: 'c5', n: '05', title: 'Registro', start: 30.2, end: 47.0 }
];

export function DossiePreviewSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  const chRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const updateBars = useCallback((t: number) => {
    CHAPTERS.forEach((ch, idx) => {
      const btn = chRefs.current[idx];
      const bar = barRefs.current[idx];
      const on = t >= ch.start && t < ch.end;

      if (btn) {
        if (on) {
          btn.classList.add('is-on');
          btn.setAttribute('aria-current', 'step');
        } else {
          btn.classList.remove('is-on');
          btn.removeAttribute('aria-current');
        }
      }

      if (bar) {
        let pct = 0;
        if (t >= ch.end) {
          pct = 100;
        } else if (t >= ch.start) {
          pct = ((t - ch.start) / (ch.end - ch.start)) * 100;
        } else {
          pct = 0;
        }
        bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
      }
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      video.removeAttribute('autoplay');
      video.pause();
      setIsPaused(true);
    } else {
      video.play().catch(() => {});
    }

    let rafId: number;
    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;
      if (video) {
        updateBars(video.currentTime);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (video.dataset.manuallyPaused === 'true') return;
            if (entry.isIntersecting) {
              video.play().catch(() => {});
              setIsPaused(false);
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(video);
    }

    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
    };
  }, [updateBars]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      video.dataset.manuallyPaused = 'false';
      setIsPaused(false);
    } else {
      video.pause();
      video.dataset.manuallyPaused = 'true';
      setIsPaused(true);
    }
  };

  const jumpToChapter = (start: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = start + 0.01;
    updateBars(start + 0.01);
    if (video.paused) {
      video.play();
      video.dataset.manuallyPaused = 'false';
      setIsPaused(false);
    }
  };

  return (
    <section className="dx" aria-labelledby="dx-title">
      <div className="dx-wrap">
        {/* Faixa superior */}
        <div className="dx-top">
          <div className="dx-crumb">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.3l7.1-.7z" />
            </svg>
            <span className="hide-sm">Recursos interativos</span>
            <span className="sep hide-sm">·</span>
            <span>Dossiê clínico do paciente</span>
          </div>
          <span className="dx-badge">Novo recurso</span>
        </div>

        {/* Grade principal lado a lado */}
        <div className="dx-grid">
          {/* Coluna de texto */}
          <div className="dx-copy">
            <p className="dx-eyebrow">Prontuário &amp; linha do tempo</p>
            <h2 className="dx-title" id="dx-title">
              O prontuário vivo das suas <em>sessões</em> e <em>intervenções</em>.
            </h2>
            <p className="dx-lead">
              Acompanhe cada paciente numa linha do tempo única. Sessões, dramatizações e histórias clínicas ficam interligadas, com os indicadores salvos automaticamente.
            </p>

            <ul className="dx-list">
              <li className="dx-item">
                <span className="dx-ic" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M4 6h16M4 12h10M4 18h7" />
                    <circle cx="19" cy="18" r="2" />
                  </svg>
                </span>
                <div>
                  <b>Linha do tempo unificada</b>
                  <span>Sessões, dramatizações e histórias clínicas na ordem em que aconteceram.</span>
                </div>
              </li>
              <li className="dx-item">
                <span className="dx-ic" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 17l5-5 4 3 8-8" />
                    <path d="M15 7h5v5" />
                  </svg>
                </span>
                <div>
                  <b>Evolução à vista</b>
                  <span>Humor e crença acompanhados sessão a sessão, em gráficos.</span>
                </div>
              </li>
              <li className="dx-item">
                <span className="dx-ic" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                  </svg>
                </span>
                <div>
                  <b>Registro sem retrabalho</b>
                  <span>A sessão anterior sempre ao lado e o rascunho salvo enquanto você escreve.</span>
                </div>
              </li>
              <li className="dx-item">
                <span className="dx-ic" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                </span>
                <div>
                  <b>Sigilo em primeiro lugar</b>
                  <span>Pacientes identificados por código ou iniciais.</span>
                </div>
              </li>
            </ul>

            <div className="dx-ctas">
              <Link className="dx-btn dx-btn-primary" href="/recursos-interativos">
                Explorar recursos interativos
                <span className="arr" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 17L17 7M8 7h9v9" />
                  </svg>
                </span>
              </Link>
              <a className="dx-btn dx-btn-ghost" href="#planos">
                Ver os planos
                <span className="arr" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </a>
            </div>
          </div>

          {/* Coluna do vídeo ao lado */}
          <div className="dx-media">
            <div className="dx-frame">
              <video
                ref={videoRef}
                id="dx-video"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/videos/dossie/dossie-loop-tela-poster.jpg"
                onTimeUpdate={() => {
                  if (videoRef.current) updateBars(videoRef.current.currentTime);
                }}
                aria-label="Demonstração do Dossiê clínico: lista de pacientes, linha do tempo, dramatização, evolução e registro da sessão"
              >
                <source src="/videos/dossie/dossie-loop-tela.webm" type="video/webm" />
                <source src="/videos/dossie/dossie-loop-tela.mp4" type="video/mp4" />
                <source src="/videos/dossie/dossie-clinico-loop-1080p.webm" type="video/webm" />
                <source src="/videos/dossie/dossie-clinico-loop-1080p.mp4" type="video/mp4" />
              </video>
              <button
                className="dx-toggle"
                type="button"
                aria-pressed={isPaused}
                aria-label={isPaused ? 'Reproduzir demonstração' : 'Pausar demonstração'}
                onClick={togglePlay}
              >
                <svg className="i-pause" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
                <svg className="i-play" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>

            {/* Barra de capítulos sincronizada */}
            <div className="dx-chapters" role="group" aria-label="Partes da demonstração">
              {CHAPTERS.map((ch, idx) => (
                <button
                  key={ch.id}
                  ref={(el) => { chRefs.current[idx] = el; }}
                  className="dx-ch"
                  type="button"
                  data-s={ch.start}
                  data-e={ch.end}
                  onClick={() => jumpToChapter(ch.start)}
                >
                  <span className="bar">
                    <i ref={(el) => { barRefs.current[idx] = el; }} />
                  </span>
                  <span className="n">{ch.n}</span>
                  <span className="t">{ch.title}</span>
                </button>
              ))}
            </div>
            <p className="dx-note">Demonstração com dados fictícios</p>
          </div>
        </div>
      </div>
    </section>
  );
}
