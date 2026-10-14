/* Apple Notes Editor Engine: Rich Text, Highlighting, Checklists & Canvas */

class NoteEditor {
  constructor(app) {
    this.app = app;
    this.currentNote = null;
    this.savedRange = null;
    this.history = [];
    this.historyIndex = -1;
    this.isComposing = false;

    this.initDOMElements();
    this.initEvents();
  }

  initDOMElements() {
    this.editorView = document.getElementById('note-editor-view');
    this.titleInput = document.getElementById('editor-note-title');
    this.bodyEl = document.getElementById('editor-note-body');
    this.dateEl = document.getElementById('editor-note-date');
    this.formatSheet = document.getElementById('format-sheet');
    this.drawingModal = document.getElementById('drawing-modal');
    this.drawingCanvas = document.getElementById('sketch-canvas');
    this.ctx = this.drawingCanvas ? this.drawingCanvas.getContext('2d') : null;
  }

  initEvents() {
    // Title auto-save
    this.titleInput.addEventListener('input', () => {
      if (!this.currentNote) return;
      this.currentNote.title = this.titleInput.value.trim() || 'New Note';
      this.currentNote.updatedAt = new Date().toISOString();
      this.app.saveCurrentNote();
    });

    // Body changes auto-save & checklist handling
    this.bodyEl.addEventListener('input', () => {
      if (!this.currentNote) return;
      this.currentNote.contentHtml = this.bodyEl.innerHTML;
      this.currentNote.updatedAt = new Date().toISOString();
      this.pushHistory();
      this.app.saveCurrentNote();
    });

    // Checkbox click delegation
    this.bodyEl.addEventListener('click', (e) => {
      const checkbox = e.target.closest('.checklist-checkbox');
      if (checkbox) {
        e.preventDefault();
        e.stopPropagation();
        const item = checkbox.closest('.checklist-item');
        item.classList.toggle('checked');
        checkbox.classList.toggle('checked');

        // Optional haptic vibration on phones
        if (navigator.vibrate) {
          navigator.vibrate(15);
        }

        if (this.currentNote) {
          this.currentNote.contentHtml = this.bodyEl.innerHTML;
          this.currentNote.updatedAt = new Date().toISOString();
          this.app.saveCurrentNote();
        }
      }
    });

    // Keydown handlers (Enter in checklist creates new checklist item)
    this.bodyEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;
        const node = sel.anchorNode;
        const checklistItem = node.nodeType === 1 ? node.closest('.checklist-item') : node.parentElement.closest('.checklist-item');
        if (checklistItem) {
          e.preventDefault();
          const newItem = document.createElement('div');
          newItem.className = 'checklist-item';
          newItem.innerHTML = '<div class="checklist-checkbox"></div><div class="checklist-text"><br></div>';
          checklistItem.after(newItem);

          // Focus the text of the new checklist item
          const textEl = newItem.querySelector('.checklist-text');
          const range = document.createRange();
          range.setStart(textEl, 0);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          this.app.saveCurrentNote();
        }
      }
    });

    // Save selection range before blurring
    document.addEventListener('selectionchange', () => {
      const sel = window.getSelection();
      if (sel.rangeCount > 0 && this.bodyEl.contains(sel.anchorNode)) {
        this.savedRange = sel.getRangeAt(0);
      }
    });

    // Drawing canvas setup
    this.setupDrawingPad();
  }

  loadNote(note) {
    this.currentNote = note;
    this.titleInput.value = note.title;
    this.bodyEl.innerHTML = note.contentHtml || '<p><br></p>';
    this.dateEl.textContent = this.formatDate(new Date(note.updatedAt || Date.now()));
    this.history = [this.bodyEl.innerHTML];
    this.historyIndex = 0;
  }

  formatDate(date) {
    const options = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
  }

  pushHistory() {
    const html = this.bodyEl.innerHTML;
    if (this.historyIndex >= 0 && this.history[this.historyIndex] === html) return;
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(html);
    if (this.history.length > 50) this.history.shift();
    this.historyIndex = this.history.length - 1;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.bodyEl.innerHTML = this.history[this.historyIndex];
      this.currentNote.contentHtml = this.bodyEl.innerHTML;
      this.app.saveCurrentNote();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.bodyEl.innerHTML = this.history[this.historyIndex];
      this.currentNote.contentHtml = this.bodyEl.innerHTML;
      this.app.saveCurrentNote();
    }
  }

  restoreSelection() {
    if (this.savedRange) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(this.savedRange);
    }
  }

  // Formatting actions
  formatText(command, value = null) {
    this.restoreSelection();
    document.execCommand(command, false, value);
    this.currentNote.contentHtml = this.bodyEl.innerHTML;
    this.pushHistory();
    this.app.saveCurrentNote();
  }

  applyStyleBlock(styleType) {
    this.restoreSelection();
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    if (styleType === 'title') {
      document.execCommand('formatBlock', false, '<h1>');
    } else if (styleType === 'heading') {
      document.execCommand('formatBlock', false, '<h2>');
    } else if (styleType === 'subheading') {
      document.execCommand('formatBlock', false, '<h3>');
    } else if (styleType === 'body') {
      document.execCommand('formatBlock', false, '<p>');
    } else if (styleType === 'mono') {
      document.execCommand('formatBlock', false, '<pre>');
    }

    this.currentNote.contentHtml = this.bodyEl.innerHTML;
    this.pushHistory();
    this.app.saveCurrentNote();
  }

  applyHighlight(color) {
    this.restoreSelection();
    const sel = window.getSelection();
    if (!sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const span = document.createElement('span');
      span.className = `hl-${color}`;
      span.textContent = range.toString();
      range.deleteContents();
      range.insertNode(span);

      // Place cursor right after the span
      range.setStartAfter(span);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      // If no text selected, inform user or insert colored placeholder
      this.app.showToast(`Select text to highlight in ${color}`);
      return;
    }

    this.currentNote.contentHtml = this.bodyEl.innerHTML;
    this.pushHistory();
    this.app.saveCurrentNote();
  }

  insertChecklist() {
    this.restoreSelection();
    const sel = window.getSelection();
    const checklistHtml = `
      <div class="checklist-item">
        <div class="checklist-checkbox"></div>
        <div class="checklist-text">To do item</div>
      </div>
    `;
    document.execCommand('insertHTML', false, checklistHtml);
    this.currentNote.contentHtml = this.bodyEl.innerHTML;
    this.pushHistory();
    this.app.saveCurrentNote();
  }

  insertTable() {
    this.restoreSelection();
    const tableHtml = `
      <div class="note-table-wrapper">
        <table class="note-table">
          <thead>
            <tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr>
          </thead>
          <tbody>
            <tr><td>Item A</td><td>Data 1</td><td>Active</td></tr>
            <tr><td>Item B</td><td>Data 2</td><td>Pending</td></tr>
          </tbody>
        </table>
      </div>
      <p><br></p>
    `;
    document.execCommand('insertHTML', false, tableHtml);
    this.currentNote.contentHtml = this.bodyEl.innerHTML;
    this.pushHistory();
    this.app.saveCurrentNote();
  }

  // Drawing Pad Canvas
  setupDrawingPad() {
    if (!this.drawingCanvas) return;
    const canvas = this.drawingCanvas;
    const ctx = this.ctx;
    let isDrawing = false;
    let currentColor = '#1C1C1E';
    let currentLineWidth = 3;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 120;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    window.addEventListener('resize', resizeCanvas);

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDraw = (e) => {
      isDrawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const drawMove = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentLineWidth;
      ctx.stroke();
    };

    const endDraw = () => {
      isDrawing = false;
      ctx.closePath();
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', drawMove);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', drawMove, { passive: false });
    canvas.addEventListener('touchend', endDraw);

    // Color pickers on drawing modal
    document.querySelectorAll('.draw-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.draw-color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = btn.dataset.color;
      });
    });

    // Width buttons
    document.querySelectorAll('.draw-width-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.draw-width-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLineWidth = parseInt(btn.dataset.width, 10);
      });
    });

    // Clear canvas
    const clearBtn = document.getElementById('draw-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
    }

    // Cancel drawing
    const cancelBtn = document.getElementById('draw-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.drawingModal.style.display = 'none';
      });
    }

    // Done drawing: insert as image
    const doneBtn = document.getElementById('draw-done-btn');
    if (doneBtn) {
      doneBtn.addEventListener('click', () => {
        const dataUrl = canvas.toDataURL('image/png');
        const imgHtml = `
          <div class="sketch-embed-card">
            <img class="sketch-embed-img" src="${dataUrl}" alt="Sketch" />
            <button class="sketch-delete-btn" onclick="this.closest('.sketch-embed-card').remove(); window.app.saveCurrentNote();" title="Remove sketch">✕</button>
          </div>
          <p><br></p>
        `;
        this.drawingModal.style.display = 'none';
        this.restoreSelection();
        document.execCommand('insertHTML', false, imgHtml);
        this.currentNote.contentHtml = this.bodyEl.innerHTML;
        this.pushHistory();
        this.app.saveCurrentNote();
        this.app.showToast('Sketch added to note');
      });
    }
  }

  openDrawingModal() {
    if (!this.drawingModal) return;
    this.drawingModal.style.display = 'flex';
    const canvas = this.drawingCanvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 120;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }
}
