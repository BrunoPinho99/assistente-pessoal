import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Pin, 
  Trash2, 
  Tag, 
  Folder, 
  Search,
  Check,
  Edit3
} from 'lucide-react';
import { Note, Project, StudySubject } from '../../types';

interface NotesViewProps {
  notes: Note[];
  projects: Project[];
  subjects: StudySubject[];
  onAddNote: (noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  projects,
  subjects,
  onAddNote,
  onUpdateNote,
  onDeleteNote
}) => {
  const [searchTag, setSearchTag] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0] || null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [projectId, setProjectId] = useState<string>('');

  const filteredNotes = notes.filter(n => {
    if (!searchTag.trim()) return true;
    const matchTag = n.tags.some(t => t.toLowerCase().includes(searchTag.toLowerCase()));
    const matchTitle = n.title.toLowerCase().includes(searchTag.toLowerCase());
    const matchContent = n.content.toLowerCase().includes(searchTag.toLowerCase());
    return matchTag || matchTitle || matchContent;
  });

  const handleCreateNew = () => {
    const newNote = onAddNote({
      title: 'Nota sem título',
      content: 'Escreva seus pensamentos ou referências aqui...',
      tags: ['geral'],
      pinned: false
    });
    setSelectedNote(newNote as any);
    setIsEditing(true);
    setTitle('Nota sem título');
    setContent('Escreva seus pensamentos ou referências aqui...');
    setTagInput('geral');
  };

  const handleSaveEdit = () => {
    if (!selectedNote) return;
    const parsedTags = tagInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onUpdateNote(selectedNote.id, {
      title: title.trim() || 'Nota sem título',
      content,
      tags: parsedTags,
      project_id: projectId || null
    });

    setIsEditing(false);
  };

  const handleSelectNote = (n: Note) => {
    setSelectedNote(n);
    setTitle(n.title);
    setContent(n.content);
    setTagInput(n.tags.join(', '));
    setProjectId(n.project_id || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-5 text-left" data-purpose="notes-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            Notas & Segundo Cérebro
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Externalize sua memória: anote ideias, regras de conduta, resumos e links importantes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Nota</span>
        </button>
      </div>

      {/* Grid 2 Colunas: Lista à esquerda, Visualizador/Editor à direita */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Coluna Esquerda: Lista de Notas */}
        <div className="md:col-span-5 space-y-3">
          {/* Barra de Filtro de Tags */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por tag, título ou palavra..."
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredNotes.map(n => {
              const isSelected = selectedNote?.id === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => handleSelectNote(n)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-800 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {n.title}
                    </h4>
                    {n.pinned && (
                      <Pin className="w-3 h-3 text-amber-500 fill-current flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {n.content}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {n.tags.map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna Direita: Editor & Leitura */}
        <div className="md:col-span-7 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          {selectedNote ? (
            isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da Nota"
                  className="w-full text-base font-bold bg-transparent border-b border-zinc-200 dark:border-zinc-700 pb-1.5 focus:outline-none"
                />

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tags separadas por vírgula (ex: foco, neuro, estudos)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                  />
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
                  >
                    <option value="">Sem projeto vinculado</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  rows={14}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva livremente..."
                  className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-mono focus:outline-none resize-none leading-relaxed"
                />

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs text-zinc-500 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  >
                    Salvar Nota
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {selectedNote.title}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateNote(selectedNote.id, { pinned: !selectedNote.pinned })}
                      className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer ${selectedNote.pinned ? 'text-amber-500' : 'text-zinc-400'}`}
                      title={selectedNote.pinned ? 'Desafixar' : 'Fixar no topo'}
                    >
                      <Pin className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTitle(selectedNote.title);
                        setContent(selectedNote.content);
                        setTagInput(selectedNote.tags.join(', '));
                        setProjectId(selectedNote.project_id || '');
                        setIsEditing(true);
                      }}
                      className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteNote(selectedNote.id);
                        setSelectedNote(null);
                      }}
                      className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedNote.tags.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans pt-2">
                  {selectedNote.content}
                </div>
              </div>
            )
          ) : (
            <div className="py-20 text-center text-xs text-zinc-400">
              Selecione uma nota à esquerda ou crie uma nova.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

