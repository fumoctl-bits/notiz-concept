/* Storage Manager & Realistic Seed Data for Apple Notes */

const STORAGE_KEYS = {
  NOTES: 'apple_notes_data_v1',
  FOLDERS: 'apple_notes_folders_v1',
  SETTINGS: 'apple_notes_settings_v1',
  ACTIVITY: 'apple_notes_activity_v1'
};

const DEFAULT_COLLABORATORS = [
  { id: 'user-0', name: 'You (Alex Rivera)', email: 'alex@icloud.com', role: 'Owner', color: '#E3A008', status: 'online' },
  { id: 'user-1', name: 'Sarah Chen', email: 'sarah.c@apple.com', role: 'Editor', color: '#8B5CF6', status: 'online' },
  { id: 'user-2', name: 'Elena Rostova', email: 'elena.r@design.co', role: 'Editor', color: '#EC4899', status: 'away' },
  { id: 'user-3', name: 'Marcus Vance', email: 'marcus.v@product.io', role: 'Viewer', color: '#10B981', status: 'offline' }
];

const DEFAULT_FOLDERS = [
  { id: 'quick', name: 'Quick Notes', icon: 'sparkle', count: 15, system: true },
  { id: 'shared', name: 'Shared', icon: 'people', count: 16, system: true },
  { id: 'all-icloud', name: 'All iCloud', icon: 'folder', count: 974, system: false, section: 'icloud' },
  { id: 'notes', name: 'Notes', icon: 'folder', count: 974, system: false, section: 'icloud' },
  { id: 'inbox', name: 'Inbox', icon: 'gear', count: 60, system: false, section: 'icloud' },
  { id: 'today', name: 'Today', icon: 'gear', count: 2, system: false, section: 'icloud' },
  { id: 'pdfs', name: 'PDFs', icon: 'gear', count: 251, system: false, section: 'icloud' }
];

const DEFAULT_TAGS = [
  '#All Tags', '#advice', '#apps', '#baseball', '#biblestudy', '#blog', '#books',
  '#business', '#camping', '#church', '#clothes', '#finance', '#fitness', '#food',
  '#games', '#gear', '#highlights'
];

const DEFAULT_NOTES = [
  {
    id: 'note-1',
    title: 'Highlight in Notes',
    folder: 'notes',
    folderName: 'Notes',
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    pinned: true,
    tags: ['#highlights', '#apps'],
    shared: true,
    collaborators: [
      DEFAULT_COLLABORATORS[0],
      DEFAULT_COLLABORATORS[1],
      DEFAULT_COLLABORATORS[2]
    ],
    contentHtml: `
      <p><span class="hl-purple">Body text can be highlighted</span></p>
      <p><span class="hl-pink">You can also highlight text as you type</span></p>
      <p>You can then write regular text</p>
      <div class="checklist-item checked">
        <div class="checklist-checkbox checked"></div>
        <div class="checklist-text">Support multi-color Apple highlights (pink, purple, yellow, mint, blue)</div>
      </div>
      <div class="checklist-item checked">
        <div class="checklist-checkbox checked"></div>
        <div class="checklist-text">Interactive checkmarks with strike-through styling</div>
      </div>
      <div class="checklist-item">
        <div class="checklist-checkbox"></div>
        <div class="checklist-text">PWA Add-to-Home-Screen installable on mobile devices</div>
      </div>
      <p><span class="hl-yellow">Pro tip:</span> Tap the Share button at top to invite collaborators and view live updates.</p>
    `
  },
  {
    id: 'note-2',
    title: 'Product Launch & Mobile PWA Specs',
    folder: 'shared',
    folderName: 'Shared',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hrs ago
    pinned: true,
    tags: ['#business', '#apps'],
    shared: true,
    collaborators: [
      DEFAULT_COLLABORATORS[0],
      DEFAULT_COLLABORATORS[1],
      DEFAULT_COLLABORATORS[2],
      DEFAULT_COLLABORATORS[3]
    ],
    contentHtml: `
      <p>Shared collaborative space for coordinating launch deliverables across design, engineering, and product.</p>
      <div class="checklist-item checked">
        <div class="checklist-checkbox checked"></div>
        <div class="checklist-text">Offline service worker caching for instant phone launch</div>
      </div>
      <div class="checklist-item checked">
        <div class="checklist-checkbox checked"></div>
        <div class="checklist-text">Real-time simulation of peer edits and activity feed</div>
      </div>
      <div class="checklist-item">
        <div class="checklist-checkbox"></div>
        <div class="checklist-text">Test dark mode contrast on OLED screens</div>
      </div>
      <div class="checklist-item">
        <div class="checklist-checkbox"></div>
        <div class="checklist-text">Send review link to beta testers</div>
      </div>
      <div class="note-table-wrapper">
        <table class="note-table">
          <thead>
            <tr><th>Task</th><th>Owner</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr><td>iOS UI Polish</td><td>Sarah Chen</td><td>Done</td></tr>
            <tr><td>Collab Sync</td><td>Alex Rivera</td><td>In Progress</td></tr>
            <tr><td>App Store Assets</td><td>Marcus Vance</td><td>Review</td></tr>
          </tbody>
        </table>
      </div>
    `
  },
  {
    id: 'note-3',
    title: 'Design Review & Feedback Notes',
    folder: 'shared',
    folderName: 'Shared',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    pinned: false,
    tags: ['#apps', '#advice'],
    shared: true,
    collaborators: [
      DEFAULT_COLLABORATORS[0],
      DEFAULT_COLLABORATORS[1]
    ],
    contentHtml: `
      <p>Elena and Sarah reviewed the latest typography tokens. The SF Pro Text scale matches iOS 18 accurately.</p>
      <p><span class="hl-mint">Highlight style tested on both Safari and Android Chrome</span> - works super smoothly.</p>
      <div class="checklist-item checked">
        <div class="checklist-checkbox checked"></div>
        <div class="checklist-text">Verify yellow accent color (#E3A008)</div>
      </div>
      <div class="checklist-item">
        <div class="checklist-checkbox"></div>
        <div class="checklist-text">Add handwriting / sketch pad canvas</div>
      </div>
    `
  },
  {
    id: 'note-4',
    title: 'Weekend Camping Gear Checklist',
    folder: 'quick',
    folderName: 'Quick Notes',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    pinned: false,
    tags: ['#camping', '#gear'],
    shared: false,
    collaborators: [DEFAULT_COLLABORATORS[0]],
    contentHtml: `
      <p>Packing list for the upcoming trip up the coast:</p>
      <div class="checklist-item checked">
        <div class="checklist-checkbox checked"></div>
        <div class="checklist-text">2-person ultralight tent</div>
      </div>
      <div class="checklist-item checked">
        <div class="checklist-checkbox checked"></div>
        <div class="checklist-text">Sleeping bag (rated 20°F)</div>
      </div>
      <div class="checklist-item">
        <div class="checklist-checkbox"></div>
        <div class="checklist-text">Portable gas stove & titanium cup</div>
      </div>
      <div class="checklist-item">
        <div class="checklist-checkbox"></div>
        <div class="checklist-text">Water filtration pump</div>
      </div>
      <div class="checklist-item">
        <div class="checklist-checkbox"></div>
        <div class="checklist-text">First aid kit & headlamp</div>
      </div>
    `
  },
  {
    id: 'note-5',
    title: 'Books to Read & Study in 2026',
    folder: 'notes',
    folderName: 'Notes',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    pinned: false,
    tags: ['#books', '#advice'],
    shared: false,
    collaborators: [DEFAULT_COLLABORATORS[0]],
    contentHtml: `
      <p><span class="hl-blue">Reading list recommendation from team:</span></p>
      <p>1. <em>Designing Data-Intensive Applications</em> by Martin Kleppmann</p>
      <p>2. <em>The Design of Everyday Things</em> by Don Norman</p>
      <p>3. <em>Creative Selection: Inside Apple's Design Process</em> by Ken Kocienda</p>
    `
  },
  {
    id: 'note-6',
    title: 'Morning Fitness & Stretch Routine',
    folder: 'today',
    folderName: 'Today',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    pinned: false,
    tags: ['#fitness'],
    shared: false,
    collaborators: [DEFAULT_COLLABORATORS[0]],
    contentHtml: `
      <p>Daily morning 15-minute mobility circuit:</p>
      <div class="checklist-item checked">
        <div class="checklist-checkbox checked"></div>
        <div class="checklist-text">Cat-cow spinal stretches (10 reps)</div>
      </div>
      <div class="checklist-item checked">
        <div class="checklist-checkbox checked"></div>
        <div class="checklist-text">Deep goblet squat hold (60s)</div>
      </div>
      <div class="checklist-item">
        <div class="checklist-checkbox"></div>
        <div class="checklist-text">Shoulder dislocates with resistance band</div>
      </div>
    `
  }
];

const DEFAULT_ACTIVITY = [
  {
    id: 'act-1',
    noteId: 'note-1',
    noteTitle: 'Highlight in Notes',
    userName: 'Sarah Chen',
    userColor: '#8B5CF6',
    text: 'checked off "Interactive checkmarks with strike-through styling"',
    time: '2m ago'
  },
  {
    id: 'act-2',
    noteId: 'note-1',
    noteTitle: 'Highlight in Notes',
    userName: 'Alex Rivera',
    userColor: '#E3A008',
    text: 'highlighted text in pink and purple',
    time: '15m ago'
  },
  {
    id: 'act-3',
    noteId: 'note-2',
    noteTitle: 'Product Launch & Mobile PWA Specs',
    userName: 'Elena Rostova',
    userColor: '#EC4899',
    text: 'updated task table and invited Marcus Vance',
    time: '1h ago'
  },
  {
    id: 'act-4',
    noteId: 'note-2',
    noteTitle: 'Product Launch & Mobile PWA Specs',
    userName: 'Marcus Vance',
    userColor: '#10B981',
    text: 'joined collaboration session as Viewer',
    time: '3h ago'
  }
];

class StorageManager {
  static getNotes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    this.saveNotes(DEFAULT_NOTES);
    return DEFAULT_NOTES;
  }

  static saveNotes(notes) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  static getFolders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    this.saveFolders(DEFAULT_FOLDERS);
    return DEFAULT_FOLDERS;
  }

  static saveFolders(folders) {
    try {
      localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  static getActivity() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    this.saveActivity(DEFAULT_ACTIVITY);
    return DEFAULT_ACTIVITY;
  }

  static saveActivity(activity) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activity));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  static addActivityItem(item) {
    const list = this.getActivity();
    list.unshift({
      id: 'act-' + Date.now(),
      time: 'Just now',
      ...item
    });
    this.saveActivity(list.slice(0, 50));
  }

  static getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return { theme: 'auto', haptics: true };
  }

  static saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.FOLDERS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY);
    return {
      notes: DEFAULT_NOTES,
      folders: DEFAULT_FOLDERS,
      activity: DEFAULT_ACTIVITY
    };
  }
}
