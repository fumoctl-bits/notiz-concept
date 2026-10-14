/* Apple Notes Collaboration & Sharing Hub */

class CollabManager {
  constructor(app) {
    this.app = app;
    this.modalEl = document.getElementById('collab-modal');
    this.isSimulating = false;
    this.simTimer = null;

    this.initEvents();
  }

  initEvents() {
    // Close collab sheet
    const closeBtn = document.getElementById('collab-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeCollabModal());
    }

    // Backdrop click
    if (this.modalEl) {
      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) this.closeCollabModal();
      });
    }

    // Share link button (Web Share API with fallback)
    const shareBtn = document.getElementById('collab-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.triggerShare());
    }

    // Copy collab link
    const copyLinkBtn = document.getElementById('collab-copy-btn');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => this.copyCollabLink());
    }

    // QR code toggle
    const qrBtn = document.getElementById('collab-qr-btn');
    if (qrBtn) {
      qrBtn.addEventListener('click', () => this.toggleQRCodeModal());
    }

    // Add Collaborator Form
    const addMemberBtn = document.getElementById('collab-add-member-btn');
    if (addMemberBtn) {
      addMemberBtn.addEventListener('click', () => this.promptAddCollaborator());
    }

    // Live Simulation Demo Trigger
    const simBtn = document.getElementById('collab-demo-sim-btn');
    if (simBtn) {
      simBtn.addEventListener('click', () => this.toggleLiveSimulation());
    }
  }

  openCollabModal(note = null) {
    const activeNote = note || this.app.editor.currentNote;
    if (!activeNote) return;

    this.renderCollabDetails(activeNote);
    if (this.modalEl) {
      this.modalEl.classList.add('active');
    }
  }

  closeCollabModal() {
    if (this.modalEl) {
      this.modalEl.classList.remove('active');
    }
  }

  renderCollabDetails(note) {
    const titleEl = document.getElementById('collab-sheet-note-title');
    const folderEl = document.getElementById('collab-sheet-note-folder');
    const membersListEl = document.getElementById('collab-members-list');
    const activityListEl = document.getElementById('collab-activity-list');

    if (titleEl) titleEl.textContent = note.title;
    if (folderEl) folderEl.textContent = `In ${note.folderName || 'Notes'} • ${note.collaborators ? note.collaborators.length : 1} Collaborators`;

    // Render Members
    if (membersListEl) {
      const collabs = note.collaborators || DEFAULT_COLLABORATORS.slice(0, 2);
      membersListEl.innerHTML = collabs.map((member, index) => {
        const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2);
        return `
          <div class="collab-member-row">
            <div class="collab-member-info">
              <div class="member-avatar" style="background-color: ${member.color || '#E3A008'}">
                ${initials}
                <span class="member-status-dot status-${member.status || 'online'}"></span>
              </div>
              <div class="member-details">
                <h5>${member.name}</h5>
                <p>${member.email || 'icloud.com'}</p>
              </div>
            </div>
            <div>
              ${index === 0 ? `
                <span style="font-size: 13px; font-weight: 600; color: var(--ios-yellow)">Owner</span>
              ` : `
                <select class="member-role-select" onchange="window.app.collab.changeMemberRole('${note.id}', '${member.id}', this.value)">
                  <option value="Editor" ${member.role === 'Editor' ? 'selected' : ''}>Can Edit</option>
                  <option value="Viewer" ${member.role === 'Viewer' ? 'selected' : ''}>View Only</option>
                  <option value="Remove">Remove</option>
                </select>
              `}
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Activity
    if (activityListEl) {
      const allActivity = StorageManager.getActivity();
      const noteActivity = allActivity.filter(a => a.noteId === note.id || !a.noteId).slice(0, 5);
      
      activityListEl.innerHTML = (noteActivity.length > 0 ? noteActivity : allActivity.slice(0, 4)).map(act => `
        <div class="activity-item">
          <div class="activity-dot" style="background-color: ${act.userColor || '#8B5CF6'}"></div>
          <div class="activity-text">
            <strong>${act.userName}</strong> ${act.text}
            <div class="activity-time">${act.time}</div>
          </div>
        </div>
      `).join('');
    }
  }

  async triggerShare() {
    const note = this.app.editor.currentNote;
    if (!note) return;

    const shareUrl = `${window.location.origin}${window.location.pathname}?collab=${note.id}`;
    const shareData = {
      title: `${note.title} (Apple Notes)`,
      text: `Collaborate with me on "${note.title}" in Notes`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        this.app.showToast('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          this.copyCollabLink();
        }
      }
    } else {
      this.copyCollabLink();
    }
  }

  copyCollabLink() {
    const note = this.app.editor.currentNote;
    const noteId = note ? note.id : 'note-1';
    const url = `${window.location.origin}${window.location.pathname}?collab=${noteId}`;

    navigator.clipboard.writeText(url).then(() => {
      this.app.showToast('Collaboration link copied to clipboard!');
      StorageManager.addActivityItem({
        noteId: noteId,
        userName: 'You',
        userColor: '#E3A008',
        text: 'copied collaboration invite link'
      });
      if (note) this.renderCollabDetails(note);
    }).catch(() => {
      prompt('Copy this collaboration link:', url);
    });
  }

  promptAddCollaborator() {
    const name = prompt('Enter collaborator name (e.g., Liam Scott):');
    if (!name || !name.trim()) return;

    const email = prompt(`Enter ${name}'s email / Apple ID:`, `${name.toLowerCase().replace(/\s+/g, '.')}@icloud.com`);
    const note = this.app.editor.currentNote;
    if (!note) return;

    const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    if (!note.collaborators) note.collaborators = [DEFAULT_COLLABORATORS[0]];
    note.collaborators.push({
      id: 'user-' + Date.now(),
      name: name.trim(),
      email: email || `${name.trim().toLowerCase()}@icloud.com`,
      role: 'Editor',
      color: randomColor,
      status: 'online'
    });
    note.shared = true;

    StorageManager.addActivityItem({
      noteId: note.id,
      userName: 'You',
      userColor: '#E3A008',
      text: `invited ${name.trim()} as Editor`
    });

    this.app.saveCurrentNote();
    this.renderCollabDetails(note);
    this.app.showToast(`Invited ${name.trim()} to collaborate!`);
  }

  changeMemberRole(noteId, memberId, newRole) {
    const note = this.app.editor.currentNote;
    if (!note || !note.collaborators) return;

    if (newRole === 'Remove') {
      const removed = note.collaborators.find(m => m.id === memberId);
      note.collaborators = note.collaborators.filter(m => m.id !== memberId);
      if (removed) {
        StorageManager.addActivityItem({
          noteId: note.id,
          userName: 'You',
          userColor: '#E3A008',
          text: `removed access for ${removed.name}`
        });
      }
    } else {
      const member = note.collaborators.find(m => m.id === memberId);
      if (member) {
        member.role = newRole;
        StorageManager.addActivityItem({
          noteId: note.id,
          userName: 'You',
          userColor: '#E3A008',
          text: `changed ${member.name}'s role to ${newRole}`
        });
      }
    }

    this.app.saveCurrentNote();
    this.renderCollabDetails(note);
    this.app.showToast('Collaborator permissions updated');
  }

  toggleQRCodeModal() {
    const modal = document.getElementById('qr-modal');
    if (!modal) return;
    modal.classList.toggle('active');
  }

  // Interactive Live Collaboration Simulation Demo
  toggleLiveSimulation() {
    this.closeCollabModal();
    if (this.isSimulating) {
      this.app.showToast('Simulation already active');
      return;
    }

    this.isSimulating = true;
    this.app.showToast('🟢 Sarah Chen joined the note!');

    // Show simulated presence in header
    const presenceEl = document.getElementById('editor-collab-presence');
    if (presenceEl) {
      presenceEl.style.display = 'flex';
      presenceEl.innerHTML = '<span class="live-pulse-dot"></span> Sarah Chen editing';
    }

    const bodyEl = document.getElementById('editor-note-body');
    if (!bodyEl) return;

    // Insert simulated cursor
    const cursor = document.createElement('span');
    cursor.className = 'simulated-cursor';
    cursor.innerHTML = '<span class="simulated-cursor-tag">Sarah Chen</span>';
    bodyEl.appendChild(cursor);

    // Simulate typing text character by character
    const phraseToType = " — Elena and I reviewed the mobile specs, looks super crisp on iPhone!";
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex < phraseToType.length) {
        const char = phraseToType[charIndex];
        const textNode = document.createTextNode(char);
        cursor.parentNode.insertBefore(textNode, cursor);
        charIndex++;
      } else {
        clearInterval(typeInterval);

        // Sarah Chen finishes and adds a purple highlight
        setTimeout(() => {
          cursor.remove();
          if (presenceEl) {
            presenceEl.innerHTML = '<span class="live-pulse-dot"></span> 2 Collaborators active';
          }

          StorageManager.addActivityItem({
            noteId: this.app.editor.currentNote ? this.app.editor.currentNote.id : 'note-1',
            userName: 'Sarah Chen',
            userColor: '#8B5CF6',
            text: 'added mobile specs review comments'
          });

          this.app.saveCurrentNote();
          this.app.showToast('Sarah Chen finished editing');
          this.isSimulating = false;
        }, 1500);
      }
    }, 45);
  }
}
