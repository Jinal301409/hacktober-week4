import React, { useState, useEffect } from 'react';
import { ActiveTab, SavedStory, StoryAtmosphere } from '../types';
import { aiService, soundFx } from '../services/aiService';
import {
  BookOpen,
  Search,
  Download,
  Trash2,
  Edit3,
  Check,
  X,
  FileText,
  Clock,
  Sparkles,
  ArrowLeft,
  Upload,
} from 'lucide-react';

interface ArchiveViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ setActiveTab }) => {
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAtmosphere, setFilterAtmosphere] = useState<string>('all');
  const [activeStory, setActiveStory] = useState<SavedStory | null>(null);

  // Edit modal / inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load stories on mount
  useEffect(() => {
    setStories(aiService.getSavedStories());
  }, []);

  // Filter stories
  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.setting.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.character.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (story.notes && story.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAtmosphere =
      filterAtmosphere === 'all' || story.atmosphere === filterAtmosphere;

    return matchesSearch && matchesAtmosphere;
  });

  const handleStartEdit = (story: SavedStory, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(story.id);
    setEditTitle(story.title);
    setEditNotes(story.notes || '');
  };

  const handleSaveEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = aiService.updateStory(id, {
      title: editTitle.trim(),
      notes: editNotes.trim() || undefined,
    });
    if (updated) {
      setStories(aiService.getSavedStories());
      if (activeStory?.id === id) {
        setActiveStory(updated);
      }
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    aiService.deleteStory(id);
    const updated = aiService.getSavedStories();
    setStories(updated);
    if (activeStory?.id === id) {
      setActiveStory(null);
    }
    setDeleteConfirmId(null);
  };

  // Import JSON backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = aiService.importArchiveBackup(content);
      if (res.success) {
        setStories(aiService.getSavedStories());
        soundFx.playSpectralChime();
      } else {
        alert(res.error || 'Failed to parse JSON backup');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d4a359]/20 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#d4a359] tracking-wider uppercase">
            <span>PORTAL 03</span>
            <span>·</span>
            <span>CLIENT-SIDE STORAGE</span>
          </div>
          <h1 className="font-cinzel text-3xl lg:text-4xl font-bold text-[#f7f2e7] mt-1">
            The Memory Archive
          </h1>
          <p className="text-xs sm:text-sm text-[#aba395] max-w-xl font-lora mt-1">
            Chronicles transcribed by the open-weight model, preserved privately in your browser's local memory.
          </p>
        </div>

        {/* Global archive export & backup */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="px-3 py-1.5 bg-[#171a22] hover:bg-[#202430] text-[#c4bcac] border border-[#d4a359]/20 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Restore JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
          <button
            onClick={() => aiService.exportArchiveBackup()}
            className="px-3 py-1.5 bg-[#171a22] hover:bg-[#202430] text-[#c4bcac] border border-[#d4a359]/20 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download full JSON archive backup"
          >
            <Download className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Backup Archive</span>
          </button>
        </div>
      </div>

      {/* Reading Modal View */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-[#08090b]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f1118] border border-[#d4a359]/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#d4a359]/20">
              <button
                onClick={() => setActiveStory(null)}
                className="text-xs text-[#9c9384] hover:text-[#f5eedc] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Archive</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => aiService.exportStory(activeStory, 'markdown')}
                  className="px-2.5 py-1 text-xs bg-[#171a24] hover:bg-[#202432] text-[#d4a359] border border-[#d4a359]/30 rounded"
                >
                  Export .MD
                </button>
                <button
                  onClick={() => aiService.exportStory(activeStory, 'text')}
                  className="px-2.5 py-1 text-xs bg-[#171a24] hover:bg-[#202432] text-[#d4a359] border border-[#d4a359]/30 rounded"
                >
                  Export .TXT
                </button>
                <button
                  onClick={() => setActiveStory(null)}
                  className="p-1 text-[#8a8172] hover:text-[#f5eedc] rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reading View Header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#9e9585]">
                <span className="uppercase text-[#d4a359] font-mono">{activeStory.atmosphere}</span>
                <span aria-hidden="true">·</span>
                <span>{activeStory.date}</span>
                <span aria-hidden="true">·</span>
                <span>{activeStory.wordCount} words</span>
                <span aria-hidden="true">·</span>
                <span>~{Math.max(1, Math.ceil(activeStory.wordCount / 200))} min read</span>
              </div>
              <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-[#f7f2e7] tracking-tight">
                {activeStory.title}
              </h2>
              <div className="text-xs text-[#8a8172] font-mono">
                Preserved from: {activeStory.modelUsed} · Setting: {activeStory.setting}
              </div>
            </div>

            {/* Reading View Body with Drop Cap */}
            <div className="text-[#e2dbcd] font-lora text-base sm:text-lg leading-relaxed whitespace-pre-line space-y-4 max-w-prose border-t border-b border-[#d4a359]/15 py-6">
              {activeStory.content}
            </div>

            {/* Archivist Notes */}
            {activeStory.notes && (
              <div className="p-4 rounded bg-[#14161f] border border-[#d4a359]/15 text-xs text-[#aba395] space-y-1">
                <span className="font-mono text-[#d4a359] block uppercase tracking-wider text-[11px]">
                  Archivist's Field Note:
                </span>
                <p>{activeStory.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#11131a] p-4 rounded-xl border border-[#d4a359]/20">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8a8172] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archived chronicles by title, character, setting, keywords..."
            className="w-full bg-[#161822] border border-[#d4a359]/25 rounded-md pl-9 pr-3 py-2 text-xs text-[#f5eedc] placeholder-[#6e685c] focus:outline-none focus:border-[#d4a359]"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['all', 'eerie', 'mysterious', 'melancholic', 'suspenseful'].map((atm) => (
            <button
              key={atm}
              onClick={() => setFilterAtmosphere(atm)}
              className={`px-3 py-1.5 rounded capitalize whitespace-nowrap transition-colors font-medium ${
                filterAtmosphere === atm
                  ? 'bg-[#d4a359] text-[#090b0e]'
                  : 'bg-[#161822] text-[#9c9384] hover:text-[#d5cbb8]'
              }`}
            >
              {atm}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="group bg-[#0f1118] border border-[#d4a359]/20 hover:border-[#d4a359]/50 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-lg hover:shadow-[#d4a359]/5 cursor-pointer relative"
            >
              <div className="space-y-3">
                {/* Metadata Row */}
                <div className="flex items-center justify-between text-[11px] text-[#8e8574]">
                  <span className="uppercase text-[#d4a359] font-mono">{story.atmosphere}</span>
                  <span className="font-mono">{story.date}</span>
                </div>

                {/* Title */}
                {editingId === story.id ? (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-[#161822] border border-[#d4a359] rounded px-2 py-1 text-sm text-[#f5eedc]"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editNotes}
                      placeholder="Archivist note..."
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full bg-[#161822] border border-[#d4a359]/50 rounded px-2 py-1 text-xs text-[#aba395]"
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={(e) => handleSaveEdit(story.id, e)}
                        className="px-2 py-0.5 bg-[#d4a359] text-[#090b0e] text-xs font-semibold rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(null);
                        }}
                        className="px-2 py-0.5 bg-[#202430] text-[#c4bcac] text-xs rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <h3 className="font-cinzel text-lg font-bold text-[#f5eedc] group-hover:text-[#d4a359] transition-colors line-clamp-2">
                    {story.title}
                  </h3>
                )}

                {/* Excerpt */}
                <p className="text-xs text-[#a39b8c] font-lora line-clamp-3 leading-relaxed">
                  {story.content}
                </p>

                {/* Note preview if any */}
                {story.notes && (
                  <div className="text-[11px] text-[#8a8172] italic bg-[#141620] px-2 py-1 rounded truncate">
                    Note: {story.notes}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#d4a359]/10 flex items-center justify-between text-xs text-[#8a8172]">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span>{story.wordCount} words</span>
                  {story.isDemo && <span className="text-[#d4a359]">[Demo]</span>}
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleStartEdit(story, e)}
                    title="Edit title & notes"
                    className="p-1 text-[#8a8172] hover:text-[#d4a359] rounded"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => aiService.exportStory(story, 'markdown')}
                    title="Export as Markdown"
                    className="p-1 text-[#8a8172] hover:text-[#d4a359] rounded"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  {deleteConfirmId === story.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDelete(story.id, e)}
                        className="px-1.5 py-0.5 bg-red-600 text-white rounded text-[10px]"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-1 py-0.5 text-stone-400 text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(story.id)}
                      title="Delete story"
                      className="p-1 text-[#8a8172] hover:text-red-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#0e1016] border border-[#d4a359]/20 rounded-2xl p-10 lg:p-16 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#d4a359]/10 border border-[#d4a359]/30 flex items-center justify-center text-[#d4a359]">
            <BookOpen className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-cinzel text-xl font-bold text-[#f5eedc]">
              The Archive Shelves Are Quiet
            </h3>
            <p className="text-xs sm:text-sm text-[#9c9384] font-lora leading-relaxed">
              No supernatural stories matched your search filters. Generate new tales in the Story Forge or restore an existing archive backup.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('story')}
              className="px-4 py-2 bg-[#d4a359] hover:bg-[#e5b869] text-[#090b0e] font-cinzel font-bold text-xs rounded transition-colors"
            >
              Summon First Story
            </button>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterAtmosphere('all');
              }}
              className="px-4 py-2 bg-[#171a22] text-[#c4bcac] hover:text-[#f5eedc] text-xs rounded"
            >
              Clear Search Filters
            </button>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-4 rounded-xl bg-[#101217] border border-[#d4a359]/15 text-xs text-[#8a8172] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[#c4bcac] font-medium">Archival Privacy Guarantee: </span>
          All preserved chronicles reside strictly in your browser's LocalStorage. They are never sent to third-party clouds or telemetry databases.
        </div>
        <button
          onClick={() => aiService.exportArchiveBackup()}
          className="text-xs font-mono text-[#d4a359] hover:underline whitespace-nowrap"
        >
          Download JSON Snapshot →
        </button>
      </div>
    </div>
  );
};
