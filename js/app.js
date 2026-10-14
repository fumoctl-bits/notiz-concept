/* Main Application Controller for Apple Notes PWA */

class AppleNotesApp {
  constructor() {
    this.currentView = 'folders';
    this.activeFolderId = 'notes';
    this.activeTagName = null;
    this.searchQuery = '';
    this.notes = [];
    this.folders = [];
    this.settings = {};

    this.init();
  }

  init() {
    this.notes = StorageManager.getNotes();
    this.folders = StorageManager.getFolders();
    this.settings = StorageManager.getSettings();

    // Initialize Submodules
    this.editor = new NoteEditor(this);
    this.collab = new CollabManager(this);
    this.pwa = new PWAManager(this);

    this.initDOM();
    this.applyTheme(this.settings.theme || 'auto');
    this.renderAll();
    this.handleUrlParams();
  }

  initDOM() {
    // Navigation Views
    this.foldersView = document.getElementById('folders-view');
    this.notesListView = document.getElementById('notes-list-view');
    this.editorView = document.getElementById('note-editor-view');
    this.sharedTabView = document.getElementById('shared-tab-view');

    // Folders View Events
    document.querySelectorAll('[data-folder-id]').forEach(el => {
      el.addEventListener('click', () => {
        const folderId = el.dataset.folderId;
        this.openFolder(folderId);
      });
    });

    // Tag pills click
    document.querySelectorAll('.tag-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const tag = pill.dataset.tag;
        this.openTag(tag);
      });
    });

    // Back to folders button
    const backToFoldersBtn = document.getElementById('back-to-folders-btn');
    if (backToFoldersBtn) {
      backToFoldersBtn.addEventListener('click', () => this.showView('folders'));
    }

    // Back to notes list button
    const backToNotesBtn = document.getElementById('back-to-notes-btn');
    if (backToNotesBtn) {
      backToNotesBtn.addEventListener('click', () => this.showView('notes-list'));
    }

    // New Note Buttons
    document.querySelectorAll('.btn-new-note').forEach(btn => {
      btn.addEventListener('click', () => this.createNewNote());
    });

    // New Folder Button
    const newFolderBtn = document.getElementById('btn-new-folder');
    if (newFolderBtn) {
      newFolderBtn.addEventListener('click', () => this.promptNewFolder());
    }

    // Search inputs
    const foldersSearch = document.getElementById('folders-search-input');
    if (foldersSearch) {
      foldersSearch.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.handleSearch();
      });
    }

    const notesSearch = document.getElementById('notes-search-input');
    if (notesSearch) {
      notesSearch.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderNotesList();
      });
    }

    // Done editing button
    const doneEditingBtn = document.getElementById('editor-done-btn');
    if (doneEditingBtn) {
      doneEditingBtn.addEventListener('click', () => {
        this.saveCurrentNote();
        this.showView('notes-list');
      });
    }

    // Undo / Redo in Editor
    const undoBtn = document.getElementById('editor-undo-btn');
    if (undoBtn) undoBtn.addEventListener('click', () => this.editor.undo());

    const redoBtn = document.getElementById('editor-redo-btn');
    if (redoBtn) redoBtn.addEventListener('click', () => this.editor.redo());

    // Share / Collab button in editor nav
    const shareNavBtn = document.getElementById('editor-share-btn');
    if (shareNavBtn) {
      shareNavBtn.addEventListener('click', () => this.collab.openCollabModal());
    }

    // Format Sheet (Aa button)
    const formatBtn = document.getElementById('tool-format-btn');
    const formatOverlay = document.getElementById('format-overlay');
    if (formatBtn && formatOverlay) {
      formatBtn.addEventListener('click', () => {
        formatOverlay.classList.toggle('active');
      });
      formatOverlay.addEventListener('click', (e) => {
        if (e.target === formatOverlay) formatOverlay.classList.remove('active');
      });
    }

    // Format Sheet style buttons
    document.querySelectorAll('[data-style-block]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-style-block]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.editor.applyStyleBlock(btn.dataset.styleBlock);
      });
    });

    // Inline format buttons (B, I, U, S)
    document.querySelectorAll('[data-exec-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        this.editor.formatText(btn.dataset.execCmd);
      });
    });

    // Highlight color dots
    document.querySelectorAll('[data-hl-color]').forEach(dot => {
      dot.addEventListener('click', () => {
        this.editor.applyHighlight(dot.dataset.hlColor);
      });
    });

    // Checklist button
    const checklistToolBtn = document.getElementById('tool-checklist-btn');
    if (checklistToolBtn) {
      checklistToolBtn.addEventListener('click', () => this.editor.insertChecklist());
    }

    // Table button
    const tableToolBtn = document.getElementById('tool-table-btn');
    if (tableToolBtn) {
      tableToolBtn.addEventListener('click', () => this.editor.insertTable());
    }

    // Sketch / Pen button
    const penToolBtn = document.getElementById('tool-pen-btn');
    if (penToolBtn) {
      penToolBtn.addEventListener('click', () => this.editor.openDrawingModal());
    }

    // Attachment / Camera button
    const cameraToolBtn = document.getElementById('tool-camera-btn');
    if (cameraToolBtn) {
      cameraToolBtn.addEventListener('click', () => this.insertSampleAttachment());
    }

    // Delete note button
    const deleteToolBtn = document.getElementById('tool-delete-btn');
    if (deleteToolBtn) {
      deleteToolBtn.addEventListener('click', () => this.deleteCurrentNote());
    }

    // Bottom Navigation Switcher (All Notes vs Shared & Collab vs Settings)
    document.querySelectorAll('[data-tab-switch]').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tabSwitch;
        if (targetTab === 'shared') {
          this.openFolder('shared');
        } else if (targetTab === 'folders') {
          this.showView('folders');
        } else if (targetTab === 'settings') {
          this.openSettingsModal();
        }
      });
    });

    // Theme toggle button
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Reset data button
    const resetDataBtn = document.getElementById('btn-reset-demo-data');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('Reset Notes to default Apple demo state?')) {
          StorageManager.resetToDefault();
          location.reload();
        }
      });
    }

    // Settings Modal close
    const settingsClose = document.getElementById('settings-close-btn');
    if (settingsClose) {
      settingsClose.addEventListener('click', () => {
        document.getElementById('settings-modal').classList.remove('active');
      });
    }
  }

  showView(viewName) {
    this.currentView = viewName;
    const views = [this.foldersView, this.notesListView, this.editorView];

    views.forEach(v => {
      if (!v) return;
      v.classList.remove('view-active', 'view-back', 'hidden');
    });

    if (viewName === 'folders') {
      this.foldersView.classList.add('view-active');
      this.notesListView.classList.add('hidden');
      this.editorView.classList.add('hidden');
      this.updateFolderCounts();
    } else if (viewName === 'notes-list') {
      this.foldersView.classList.add('view-back');
      this.notesListView.classList.add('view-active');
      this.editorView.classList.add('hidden');
      this.renderNotesList();
    } else if (viewName === 'editor') {
      this.notesListView.classList.add('view-back');
      this.editorView.classList.add('view-active');
    }
  }

  openFolder(folderId) {
    this.activeFolderId = folderId;
    this.activeTagName = null;
    this.searchQuery = '';

    const folder = this.folders.find(f => f.id === folderId) || { name: 'Notes' };
    const titleEl = document.getElementById('notes-list-title');
    if (titleEl) titleEl.textContent = folder.name;

    this.showView('notes-list');
  }

  openTag(tagName) {
    this.activeTagName = tagName === '#All Tags' ? null : tagName;
    const titleEl = document.getElementById('notes-list-title');
    if (titleEl) titleEl.textContent = tagName;

    // Highlight active pill
    document.querySelectorAll('.tag-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.tag === tagName);
    });

    this.showView('notes-list');
  }

  renderAll() {
    this.updateFolderCounts();
    this.renderNotesList();
  }

  updateFolderCounts() {
    this.folders.forEach(folder => {
      let count = 0;
      if (folder.id === 'all-icloud') {
        count = this.notes.length;
      } else if (folder.id === 'shared') {
        count = this.notes.filter(n => n.shared).length;
      } else {
        count = this.notes.filter(n => n.folder === folder.id).length;
      }

      const countEl = document.getElementById(`count-${folder.id}`);
      if (countEl) countEl.textContent = count;
    });

    const totalCounter = document.getElementById('folders-total-counter');
    if (totalCounter) totalCounter.textContent = `${this.notes.length} Notes`;
  }

  renderNotesList() {
    const container = document.getElementById('notes-cards-container');
    const counterEl = document.getElementById('notes-list-counter');
    if (!container) return;

    let filtered = [...this.notes];

    // Filter by Folder
    if (this.activeFolderId === 'shared') {
      filtered = filtered.filter(n => n.shared);
    } else if (this.activeFolderId !== 'all-icloud' && !this.activeTagName) {
      filtered = filtered.filter(n => n.folder === this.activeFolderId);
    }

    // Filter by Tag
    if (this.activeTagName) {
      filtered = filtered.filter(n => n.tags && n.tags.includes(this.activeTagName));
    }

    // Filter by Search
    if (this.searchQuery) {
      const q = this.searchQuery;
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(q) ||
        (n.contentHtml && n.contentHtml.toLowerCase().includes(q))
      );
    }

    if (counterEl) counterEl.textContent = `${filtered.length} Notes`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
          <p style="font-size: 17px; font-weight: 500;">No Notes Found</p>
          <p style="font-size: 14px; margin-top: 4px;">Tap the compose icon to create one.</p>
        </div>
      `;
      return;
    }

    // Separate pinned vs normal
    const pinned = filtered.filter(n => n.pinned);
    const regular = filtered.filter(n => !n.pinned);

    let html = '';

    if (pinned.length > 0) {
      html += `<div class="notes-section-title">Pinned</div><div class="inset-card">`;
      html += pinned.map(n => this.renderNoteCardHtml(n)).join('');
      html += `</div>`;
    }

    if (regular.length > 0) {
      html += `<div class="notes-section-title">Notes</div><div class="inset-card">`;
      html += regular.map(n => this.renderNoteCardHtml(n)).join('');
      html += `</div>`;
    }

    container.innerHTML = html;

    // Attach click listeners to cards
    container.querySelectorAll('[data-note-id]').forEach(card => {
      card.addEventListener('click', () => {
        const noteId = card.dataset.noteId;
        this.openNote(noteId);
      });
    });
  }

  renderNoteCardHtml(note) {
    const dateStr = this.formatShortDate(new Date(note.updatedAt || Date.now()));
    const plainText = this.stripHtml(note.contentHtml || '').replace(/\s+/g, ' ').trim();
    const snippet = plainText ? plainText.slice(0, 90) : 'No additional text';

    // Collaborator avatars stack
    let collabStack = '';
    if (note.shared && note.collaborators && note.collaborators.length > 0) {
      collabStack = `
        <div class="collab-avatar-stack" title="Collaborators: ${note.collaborators.map(c => c.name).join(', ')}">
          ${note.collaborators.slice(0, 3).map(c => {
            const initial = c.name ? c.name[0] : 'U';
            return `<div class="collab-avatar" style="background-color: ${c.color || '#E3A008'}">${initial}</div>`;
          }).join('')}
          ${note.collaborators.length > 3 ? `<div class="collab-avatar" style="background-color: #6B7280">+${note.collaborators.length - 3}</div>` : ''}
        </div>
      `;
    }

    return `
      <div class="note-card-item" data-note-id="${note.id}">
        <div class="note-card-header">
          <span class="note-card-title">${note.title || 'Untitled Note'}</span>
          ${note.pinned ? `<svg class="note-card-pin" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4H17V2H7V4H8V12L5 15V17H11V22L12 23L13 22V17H19V15L16 12Z"/></svg>` : ''}
        </div>
        <div class="note-card-snippet">
          <span class="note-card-date">${dateStr}</span>
          <span class="note-card-text">${snippet}</span>
        </div>
        <div class="note-card-footer">
          <div class="note-folder-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            ${note.folderName || 'Notes'}
          </div>
          ${collabStack}
        </div>
      </div>
    `;
  }

  openNote(noteId) {
    const note = this.notes.find(n => n.id === noteId);
    if (!note) return;

    this.editor.loadNote(note);

    // Update presence indicator in editor
    const presenceEl = document.getElementById('editor-collab-presence');
    if (presenceEl) {
      if (note.shared && note.collaborators && note.collaborators.length > 1) {
        presenceEl.style.display = 'flex';
        presenceEl.innerHTML = `<span class="live-pulse-dot"></span> ${note.collaborators.length} Collaborators`;
      } else {
        presenceEl.style.display = 'none';
      }
    }

    this.showView('editor');
  }

  createNewNote() {
    const newNote = {
      id: 'note-' + Date.now(),
      title: 'New Note',
      folder: this.activeFolderId === 'shared' ? 'shared' : (this.activeFolderId || 'notes'),
      folderName: this.getFolderName(this.activeFolderId),
      updatedAt: new Date().toISOString(),
      pinned: false,
      tags: this.activeTagName ? [this.activeTagName] : ['#highlights'],
      shared: this.activeFolderId === 'shared',
      collaborators: this.activeFolderId === 'shared' ? [DEFAULT_COLLABORATORS[0], DEFAULT_COLLABORATORS[1]] : [DEFAULT_COLLABORATORS[0]],
      contentHtml: '<p><br></p>'
    };

    this.notes.unshift(newNote);
    StorageManager.saveNotes(this.notes);
    this.openNote(newNote.id);
    this.showToast('Created new note');
  }

  saveCurrentNote() {
    if (!this.editor.currentNote) return;
    const index = this.notes.findIndex(n => n.id === this.editor.currentNote.id);
    if (index !== -1) {
      this.notes[index] = { ...this.editor.currentNote };
      StorageManager.saveNotes(this.notes);
    }
  }

  deleteCurrentNote() {
    if (!this.editor.currentNote) return;
    if (confirm('Are you sure you want to delete this note?')) {
      this.notes = this.notes.filter(n => n.id !== this.editor.currentNote.id);
      StorageManager.saveNotes(this.notes);
      this.showToast('Note deleted');
      this.showView('notes-list');
    }
  }

  insertSampleAttachment() {
    const sampleImages = [
      'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80'
    ];
    const imgUrl = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    const imgHtml = `
      <div class="sketch-embed-card">
        <img class="sketch-embed-img" src="${imgUrl}" alt="Attachment" />
        <button class="sketch-delete-btn" onclick="this.closest('.sketch-embed-card').remove(); window.app.saveCurrentNote();">✕</button>
      </div>
      <p><br></p>
    `;
    this.editor.restoreSelection();
    document.execCommand('insertHTML', false, imgHtml);
    this.saveCurrentNote();
    this.showToast('Attachment inserted');
  }

  promptNewFolder() {
    const name = prompt('New Folder Name:');
    if (!name || !name.trim()) return;

    const newFolder = {
      id: 'folder-' + Date.now(),
      name: name.trim(),
      icon: 'folder',
      count: 0,
      system: false,
      section: 'icloud'
    };

    this.folders.push(newFolder);
    StorageManager.saveFolders(this.folders);
    this.renderAll();
    this.showToast(`Created folder "${name.trim()}"`);
  }

  getFolderName(folderId) {
    const f = this.folders.find(fold => fold.id === folderId);
    return f ? f.name : 'Notes';
  }

  handleSearch() {
    if (this.searchQuery) {
      this.activeFolderId = 'all-icloud';
      this.activeTagName = null;
      this.showView('notes-list');
    }
  }

  handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      this.createNewNote();
    } else if (params.get('view') === 'shared') {
      this.openFolder('shared');
    } else if (params.get('collab')) {
      const noteId = params.get('collab');
      this.openNote(noteId);
      setTimeout(() => this.collab.openCollabModal(), 300);
    }
  }

  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.add('active');
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
  }

  applyTheme(theme) {
    if (theme === 'auto') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    this.settings.theme = theme;
    StorageManager.saveSettings(this.settings);
  }

  showToast(message, duration = 2500) {
    const toast = document.getElementById('ios-toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('active');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('active');
    }, duration);
  }

  formatShortDate(date) {
    const now = new Date();
    const isToday = now.toDateString() === date.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
  }

  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}

// Global bootstrap
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AppleNotesApp();
});
