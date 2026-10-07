'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useNeuro } from '@/context/NeuroContext';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { MaterialItem } from '@/types/neuro';
import { getMaterialReaderUrl, downloadMaterialFile } from '@/utils/materialActions';

export default function GuiasPage() {
  const { materials, favorites, toggleFavorite } = useNeuro();

  const [search, setSearch] = useState('');
  const [activeMaterial, setActiveMaterial] = useState<MaterialItem | null>(null);

  // Filter materials of type guia_rapido
  const quickGuides = useMemo(() => {
    return materials.filter(m => m.type === 'guia_rapido').filter(m => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.subtitle?.toLowerCase().includes(q) ||
        m.authorReference?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q)
      );
    });
  }, [materials, search]);

  return (
    <PlatformShell 
      activePage="guias"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar guias de aplicação ou instrumentos..."
    >
      <header className="lib-head">
        <div>
          <span className="label">Consultas de Cabeceira</span>
          <h1>Guias Rápidos<span className="dot">.</span></h1>
          <p>
            Manuais de administração, fluxogramas de cabeceira e guias de aplicação e correção para download.
          </p>
        </div>
      </header>

      {/* Lista de Guias Práticos Cadastrados */}
      <section style={{ marginTop: '28px' }}>
        <div className="sec-rule">
          <span className="t">Guias de Aplicação e Correção para Download</span>
          <Link href="/biblioteca?tipo=guia_rapido">Ver no acervo →</Link>
        </div>

        {quickGuides.length > 0 ? (
          <div className="grid" style={{ marginTop: '16px' }}>
            {quickGuides.map(mat => (
              <article 
                key={mat.id} 
                className="mat"
                onClick={() => setActiveMaterial(mat)}
              >
                <div className="mat-top">
                  <span className="ctag c-guia">
                    <svg className="ico sm"><use href="#i-guia"/></svg>
                    <span>Guia Rápido</span>
                  </span>
                  <button 
                    type="button" 
                    className="save" 
                    aria-pressed={favorites.includes(mat.id)}
                    title="Favoritar"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(mat.id);
                    }}
                  >
                    <svg className="ico sm"><use href="#i-bookmark"/></svg>
                  </button>
                </div>

                <div className="body">
                  <h3>{mat.title}</h3>
                  {mat.subtitle && <p>{mat.subtitle}</p>}
                </div>

                <div className="meta">
                  {mat.authorReference && <span>{mat.authorReference}</span>}
                  {mat.downloadFormat && <span>{mat.downloadFormat}</span>}
                  {mat.downloadSize && <span>{mat.downloadSize}</span>}
                </div>

                <div className="mat-foot">
                  <span className="open">
                    Consultar guia
                    <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="ring">
              <svg className="ico" style={{ width: 26, height: 26 }}><use href="#i-guia"/></svg>
            </div>
            <h3>Nenhum guia de aplicação cadastrado ainda</h3>
            <p>
              Os manuais de cabeceira e fluxogramas práticos de administração de testes serão disponibilizados aqui assim que indexados ao acervo.
            </p>
            <Link href="/biblioteca" className="btn" style={{ marginTop: '12px' }}>
              Ver Todos os Materiais
              <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
            </Link>
          </div>
        )}
      </section>

      {/* Drawer */}
      <div 
        className={`scrim ${activeMaterial ? 'on' : ''}`} 
        onClick={() => setActiveMaterial(null)}
      />
      <aside className={`drawer ${activeMaterial ? 'on' : ''}`} aria-hidden={!activeMaterial}>
        {activeMaterial && (
          <>
            <div className="d-top">
              <span>Guia Rápido de Aplicação</span>
              <button 
                type="button" 
                className="d-close" 
                onClick={() => setActiveMaterial(null)}
              >
                ✕
              </button>
            </div>

            <div className="d-body">
              <div className="d-cover">
                <div className="mark bg-guia">
                  <svg className="ico"><use href="#i-guia"/></svg>
                </div>
              </div>

              <h2>{activeMaterial.title}</h2>
              {activeMaterial.subtitle && <p className="lead">{activeMaterial.subtitle}</p>}

              <dl className="dl">
                {activeMaterial.authorReference && (
                  <>
                    <dt>Autor / Ref.</dt>
                    <dd>{activeMaterial.authorReference}</dd>
                  </>
                )}
                {activeMaterial.downloadFormat && (
                  <>
                    <dt>Formato</dt>
                    <dd>{activeMaterial.downloadFormat}</dd>
                  </>
                )}
                {activeMaterial.downloadSize && (
                  <>
                    <dt>Tamanho</dt>
                    <dd>{activeMaterial.downloadSize}</dd>
                  </>
                )}
              </dl>

              {activeMaterial.description && (
                <div className="d-note" style={{ marginTop: '18px' }}>
                  <svg className="ico"><use href="#i-info"/></svg>
                  <span>{activeMaterial.description}</span>
                </div>
              )}
            </div>

            <div className="d-foot">
              <Link 
                className="btn" 
                href={getMaterialReaderUrl(activeMaterial)}
              >
                Abrir no Leitor <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
              </Link>
              <button 
                type="button" 
                className="btn-ghost"
                onClick={() => downloadMaterialFile(activeMaterial)}
              >
                Baixar {activeMaterial.downloadFormat || 'guia'}
              </button>
              <button 
                type="button" 
                className="save"
                aria-pressed={favorites.includes(activeMaterial.id)}
                aria-label={favorites.includes(activeMaterial.id) ? 'Remover da pasta' : 'Salvar na pasta'}
                style={{ width: '48px', height: '48px', flex: 'none' }}
                onClick={() => toggleFavorite(activeMaterial.id)}
              >
                <svg className="ico"><use href="#i-bookmark"/></svg>
              </button>
            </div>
          </>
        )}
      </aside>
    </PlatformShell>
  );
}
