'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useNeuro } from '@/context/NeuroContext';
import { PlatformShell } from '@/components/layout/PlatformShell';
import { MaterialItem, MaterialType } from '@/types/neuro';

const TIPO_LABEL: Record<MaterialType, string> = {
  instrumento_rastreio: 'Instrumento',
  guia_rapido: 'Guia Rápido',
  modelo_laudo: 'Modelo de Laudo',
  entrevista_anamnese: 'Anamnese',
  compendio_estudo: 'Compêndio',
  tabela_normativa: 'Tabela Normativa'
};

const TIPO_COR: Record<MaterialType, string> = {
  instrumento_rastreio: 'c-instrumento',
  guia_rapido: 'c-guia',
  modelo_laudo: 'c-laudo',
  entrevista_anamnese: 'c-anamnese',
  compendio_estudo: 'c-compendio',
  tabela_normativa: 'c-guia'
};

const TIPO_BG: Record<MaterialType, string> = {
  instrumento_rastreio: 'bg-instrumento',
  guia_rapido: 'bg-guia',
  modelo_laudo: 'bg-laudo',
  entrevista_anamnese: 'bg-anamnese',
  compendio_estudo: 'bg-compendio',
  tabela_normativa: 'bg-guia'
};

const TIPO_ICON: Record<MaterialType, string> = {
  instrumento_rastreio: '#i-instrumento',
  guia_rapido: '#i-guia',
  modelo_laudo: '#i-laudo',
  entrevista_anamnese: '#i-anamnese',
  compendio_estudo: '#i-compendio',
  tabela_normativa: '#i-guia'
};

export default function MinhaPastaPage() {
  const { materials, favorites, toggleFavorite } = useNeuro();

  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeMaterial, setActiveMaterial] = useState<MaterialItem | null>(null);

  // Filter only favorited materials
  const savedMaterials = useMemo(() => {
    return materials.filter(m => favorites.includes(m.id));
  }, [materials, favorites]);

  // Apply search & category filters within favorites
  const filtered = useMemo(() => {
    return savedMaterials.filter(m => {
      if (filterTipo !== 'todos' && m.type !== filterTipo) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches = 
          m.title.toLowerCase().includes(q) ||
          m.subtitle?.toLowerCase().includes(q) ||
          m.authorReference?.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [savedMaterials, filterTipo, search]);

  return (
    <PlatformShell 
      activePage="pasta"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Filtrar em meus itens salvos..."
    >
      <header className="lib-head">
        <div>
          <span className="label">Coleção Pessoal</span>
          <h1>Minha <em>Pasta</em><span className="dot">.</span></h1>
          <p>
            Materiais, laudos e guias de cabeceira arquivados para acesso imediato durante suas avaliações e sessões clínicas.
          </p>
        </div>
        <div className="stats">
          <div className="stat">
            <b>{savedMaterials.length}</b>
            <span>Itens salvos</span>
          </div>
          <div className="stat">
            <b>{savedMaterials.filter(m => m.type === 'modelo_laudo').length}</b>
            <span>Laudos</span>
          </div>
          <div className="stat">
            <b>{savedMaterials.filter(m => m.type === 'guia_rapido').length}</b>
            <span>Guias</span>
          </div>
        </div>
      </header>

      {/* Barra de Filtros */}
      <div className="filters" style={{ marginTop: '24px' }}>
        <div className="sel">
          <select 
            value={filterTipo} 
            onChange={(e) => setFilterTipo(e.target.value)}
            aria-label="Filtrar por tipo"
          >
            <option value="todos">Todos os tipos ({savedMaterials.length})</option>
            <option value="instrumento_rastreio">Instrumentos</option>
            <option value="guia_rapido">Guias Rápidos</option>
            <option value="modelo_laudo">Modelos de Laudo</option>
            <option value="entrevista_anamnese">Anamnese</option>
            <option value="compendio_estudo">Compêndios</option>
          </select>
        </div>

        {search && (
          <div className="chip">
            <span>Busca: &ldquo;{search}&rdquo;</span>
            <button type="button" onClick={() => setSearch('')} aria-label="Limpar busca">×</button>
          </div>
        )}

        {filterTipo !== 'todos' && (
          <button type="button" className="clear" onClick={() => setFilterTipo('todos')}>
            Limpar filtros
          </button>
        )}

        <div className="f-right">
          <div className="view" role="group" aria-label="Modo de exibição">
            <button 
              type="button" 
              aria-pressed={viewMode === 'grid'} 
              onClick={() => setViewMode('grid')}
              title="Exibir em grade"
            >
              <svg className="ico sm"><use href="#i-cards"/></svg>
            </button>
            <button 
              type="button" 
              aria-pressed={viewMode === 'list'} 
              onClick={() => setViewMode('list')}
              title="Exibir em lista"
            >
              <svg className="ico sm"><use href="#i-lib"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Materiais ou Empty State */}
      {filtered.length > 0 ? (
        <div className={`grid ${viewMode === 'list' ? 'as-list' : ''}`}>
          {filtered.map(mat => {
            const isFav = favorites.includes(mat.id);
            return (
              <article 
                key={mat.id} 
                className="mat"
                onClick={() => setActiveMaterial(mat)}
              >
                <div className="mat-top">
                  <span className={`ctag ${TIPO_COR[mat.type] || 'c-instrumento'}`}>
                    <svg className="ico sm"><use href={TIPO_ICON[mat.type] || '#i-instrumento'}/></svg>
                    <span>{TIPO_LABEL[mat.type] || mat.type}</span>
                  </span>
                  <button 
                    type="button" 
                    className="save" 
                    aria-pressed={isFav}
                    title="Remover dos salvos"
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
                    Abrir material
                    <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="ring">
            <svg className="ico" style={{ width: 26, height: 26 }}><use href="#i-folder"/></svg>
          </div>
          <h3>{savedMaterials.length === 0 ? 'Sua pasta ainda está vazia' : 'Nenhum item corresponde ao filtro'}</h3>
          <p>
            {savedMaterials.length === 0 
              ? 'Você pode favoritar testes, laudos, compêndios e roteiros de anamnese clicando no ícone de marcador na Biblioteca.' 
              : 'Tente limpar os termos de busca ou alterar o filtro de categoria selecionado.'}
          </p>
          {savedMaterials.length === 0 ? (
            <Link href="/biblioteca" className="btn" style={{ marginTop: '12px' }}>
              Explorar a Biblioteca
              <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
            </Link>
          ) : (
            <button 
              type="button" 
              className="btn-ghost" 
              style={{ marginTop: '12px' }}
              onClick={() => { setSearch(''); setFilterTipo('todos'); }}
            >
              Resetar Filtros
            </button>
          )}
        </div>
      )}

      {/* Drawer de Detalhes do Material */}
      <div 
        className={`scrim ${activeMaterial ? 'on' : ''}`} 
        onClick={() => setActiveMaterial(null)}
      />
      <aside className={`drawer ${activeMaterial ? 'on' : ''}`} aria-hidden={!activeMaterial}>
        {activeMaterial && (
          <>
            <div className="d-top">
              <span>{TIPO_LABEL[activeMaterial.type] || activeMaterial.type}</span>
              <button 
                type="button" 
                className="d-close" 
                onClick={() => setActiveMaterial(null)}
                aria-label="Fechar gaveta"
              >
                ✕
              </button>
            </div>

            <div className="d-body">
              <div className="d-cover">
                <div className={`mark ${TIPO_BG[activeMaterial.type] || 'bg-instrumento'}`}>
                  <svg className="ico"><use href={TIPO_ICON[activeMaterial.type] || '#i-instrumento'}/></svg>
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
                {activeMaterial.targetPopulation && (
                  <>
                    <dt>Público</dt>
                    <dd>{activeMaterial.targetPopulation}</dd>
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
              <button 
                type="button" 
                className="btn-ghost"
                onClick={() => toggleFavorite(activeMaterial.id)}
              >
                {favorites.includes(activeMaterial.id) ? 'Remover da pasta' : 'Salvar na pasta'}
              </button>
              <button 
                type="button" 
                className="btn"
                onClick={() => alert(`Iniciando download de "${activeMaterial.title}" (${activeMaterial.downloadFormat}).`)}
              >
                Baixar material ({activeMaterial.downloadFormat})
                <span><svg className="ico sm"><use href="#i-arrow"/></svg></span>
              </button>
            </div>
          </>
        )}
      </aside>
    </PlatformShell>
  );
}
