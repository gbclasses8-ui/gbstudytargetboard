/**
 * Target Board Free Courses - InfinityFree Hosting Client App
 * Pure Vanilla JavaScript - Zero build tools required
 */

(function () {
  'use strict';

  // State
  let allCourses = [];
  let currentCourse = null;
  let savedCourses = JSON.parse(localStorage.getItem('tb_inf_saved') || '[]');
  let currentCategory = 'all';
  let thumbnailMap = new Map();

  const LOGO_URL = 'https://i.postimg.cc/g0Qw2MvP/loo.png';
  const TB_JSON_URL = 'https://raw.githubusercontent.com/studyapkmod1/jaimatadi/refs/heads/main/tb.json';

  // 1. Initial Splash Screen (Shown on every refresh for 2.5 seconds)
  function initSplash() {
    const splash = document.getElementById('splash-screen');
    const fill = document.getElementById('splash-progress-fill');
    const pct = document.getElementById('splash-pct-text');
    if (!splash || !fill || !pct) return;

    let progress = 0;
    const duration = 2500;
    const intervalTime = 30;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      progress = Math.min(100, progress + step);
      fill.style.width = Math.round(progress) + '%';
      pct.textContent = Math.round(progress) + '%';

      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          splash.classList.add('hidden');
        }, 300);
      }
    }, intervalTime);
  }

  // 2. Fetch Thumbnails from tb.json
  async function loadThumbnails() {
    try {
      const res = await fetch(TB_JSON_URL);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.new)) {
          data.new.forEach((item) => {
            if (item.id && item.thumbnail) {
              thumbnailMap.set(item.id, encodeURI(item.thumbnail));
            }
          });
        }
      }
    } catch (e) {
      console.warn('Could not load remote tb.json:', e);
    }
  }

  // 3. API Calls
  async function apiGetCourses() {
    await loadThumbnails();
    try {
      const res = await fetch('api.php?courses');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.courses)) {
          data.courses.forEach((c) => {
            if (!c.thumbnail && thumbnailMap.has(c.id)) {
              c.thumbnail = thumbnailMap.get(c.id);
            }
          });
          return data.courses;
        }
      }
    } catch (e) {
      console.warn('api.php?courses error:', e);
    }
    return [];
  }

  async function apiGetCourseDetail(courseId) {
    const res = await fetch('api.php?courseid=' + encodeURIComponent(courseId));
    if (!res.ok) throw new Error('Failed to load course details');
    const data = await res.json();
    if (data && data.course && !data.course.thumbnail && thumbnailMap.has(data.course.id)) {
      data.course.thumbnail = thumbnailMap.get(data.course.id);
    }
    return data;
  }

  async function apiGetVideo(assetId) {
    const res = await fetch('api.php?video=' + encodeURIComponent(assetId));
    if (!res.ok) throw new Error('Failed to load video stream');
    return await res.json();
  }

  // 4. Render Courses Catalog
  function renderCourses(courses) {
    const container = document.getElementById('courses-container');
    if (!container) return;

    if (!courses || courses.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <p>No courses found for this filter.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = courses
      .map((c) => {
        const isSaved = savedCourses.some((sc) => sc.id === c.id);
        const thumb = c.thumbnail || LOGO_URL;

        return `
        <div class="glass-card" onclick="window.openCourse('${c.id}')" style="cursor: pointer;">
          <div class="course-card-thumb">
            <img src="${thumb}" alt="${c.name}" loading="lazy" onerror="this.src='${LOGO_URL}'">
            <span class="free-pill">100% FREE</span>
            <button class="save-heart-btn ${isSaved ? 'active' : ''}" onclick="window.toggleSaveCourse(event, '${c.id}')" title="Save course">
              ${isSaved ? '❤️' : '🤍'}
            </button>
          </div>
          <div class="course-card-body">
            <div>
              <div style="display:flex; justify-content:space-between; font-size:11px; color:#06b6d4; font-weight:700; margin-bottom:4px;">
                <span>${c.group ? 'Class ' + c.group : 'Board Batch'}</span>
                <span style="color:#94a3b8;">${(c.enrollments / 1000).toFixed(1)}k students</span>
              </div>
              <h3 class="font-heading" style="font-size:15px; font-weight:700; color:white; line-height:1.3;">
                ${c.name}
              </h3>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; background:rgba(255,255,255,0.04); padding:8px; border-radius:12px; font-size:11px; text-align:center;">
              <div><strong>${c.total_videos}</strong><br><span style="color:#94a3b8; font-size:9px;">VIDEOS</span></div>
              <div style="border-left:1px solid rgba(255,255,255,0.08); border-right:1px solid rgba(255,255,255,0.08);"><strong>${c.total_pdfs}</strong><br><span style="color:#94a3b8; font-size:9px;">PDFS</span></div>
              <div><strong>${c.total_folders}</strong><br><span style="color:#94a3b8; font-size:9px;">FOLDERS</span></div>
            </div>

            <button style="width:100%; padding:10px; border-radius:12px; background:linear-gradient(135deg, #2563EB, #06B6D4); color:white; font-weight:700; font-size:12px; box-shadow:0 4px 15px rgba(37,99,235,0.3);">
              Open Full Course →
            </button>
          </div>
        </div>
      `;
      })
      .join('');
  }

  // 5. Open Course with Splash Loader Animation (NO FOOTER during loading)
  window.openCourse = async function (courseId) {
    const splashLoader = document.getElementById('course-splash-loader');
    const siteFooter = document.getElementById('site-footer');
    const homeView = document.getElementById('home-view');
    const detailView = document.getElementById('course-detail-view');
    const savedView = document.getElementById('saved-view');
    const splashFill = document.getElementById('course-splash-progress-fill');
    const splashPct = document.getElementById('course-splash-pct');
    const splashTitle = document.getElementById('course-splash-title');

    // Find course name if available
    const matched = allCourses.find((c) => c.id === courseId);
    if (splashTitle && matched) {
      splashTitle.textContent = matched.name;
    }

    // Show splash loader and HIDE FOOTER
    if (splashLoader) splashLoader.classList.remove('hidden');
    if (siteFooter) siteFooter.style.display = 'none';

    // Start animated progress bar for splash
    let progress = 0;
    if (splashFill) splashFill.style.width = '0%';
    if (splashPct) splashPct.textContent = '0%';

    const progressTimer = setInterval(() => {
      progress = Math.min(95, progress + 4);
      if (splashFill) splashFill.style.width = progress + '%';
      if (splashPct) splashPct.textContent = progress + '%';
    }, 40);

    // Minimum delay of 1.5 seconds so user experiences the splash screen
    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 1500));
    const dataPromise = apiGetCourseDetail(courseId);

    try {
      const [_, data] = await Promise.all([minDelayPromise, dataPromise]);
      clearInterval(progressTimer);

      if (splashFill) splashFill.style.width = '100%';
      if (splashPct) splashPct.textContent = '100%';

      currentCourse = data;

      // Small moment before switching views
      await new Promise((r) => setTimeout(r, 200));

      // Render Course Banner
      const c = data.course || {};
      const banner = document.getElementById('course-banner-card');
      if (banner) {
        banner.innerHTML = `
          <div style="display:flex; flex-direction:column; md:flex-row; gap:20px; align-items:center; justify-content:space-between;">
            <div style="flex:1;">
              <span style="font-size:11px; background:rgba(34,197,94,0.2); color:#4ade80; border:1px solid rgba(34,197,94,0.3); padding:3px 10px; border-radius:9999px; font-weight:800;">100% FREE BATCH</span>
              <h1 class="font-heading" style="font-size:26px; font-weight:900; color:white; margin:10px 0 6px 0;">${c.name || ''}</h1>
              <div style="display:flex; gap:16px; font-size:12px; color:#cbd5e1; font-family:monospace; margin-top:8px;">
                <span>📹 ${c.total_videos || 0} Lectures</span>
                <span>📄 ${c.total_pdfs || 0} Notes</span>
                <span>👥 ${(c.enrollments || 0).toLocaleString()} Enrolled</span>
              </div>
            </div>
            ${
              c.thumbnail
                ? `<div style="width:240px; aspect-ratio:16/9; border-radius:14px; overflow:hidden; border:1px solid rgba(255,255,255,0.2); box-shadow:0 10px 25px rgba(0,0,0,0.5);"><img src="${c.thumbnail}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='${LOGO_URL}'"></div>`
                : ''
            }
          </div>
        `;
      }

      // Render Recursive Folder Tree with Video & PDF Tabs
      renderFolderTree(data.tree || []);

      // Switch views
      if (homeView) homeView.style.display = 'none';
      if (savedView) savedView.style.display = 'none';
      if (detailView) detailView.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      clearInterval(progressTimer);
      alert('Could not open course: ' + e.message);
    } finally {
      // Hide splash loader and restore footer
      if (splashLoader) splashLoader.classList.add('hidden');
      if (siteFooter) siteFooter.style.display = 'block';
    }
  };

  // 6. Render Recursive Folder Tree with Video Tab & PDF Tab (Folder inside folder)
  function renderFolderTree(tree) {
    const container = document.getElementById('course-folder-tree');
    if (!container) return;

    if (!tree || tree.length === 0) {
      container.innerHTML = '<p style="color:var(--text-muted); padding:20px;">No folders found in this course.</p>';
      return;
    }

    // Clean curriculum header without Expand All / Collapse All buttons
    const headerInfo = `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid var(--border-glass); border-radius:14px; padding:12px 18px; margin-bottom:14px;">
        <span style="font-size:12px; color:#06b6d4; font-weight:700; display:flex; align-items:center; gap:8px;">
          📂 Course Syllabus & Chapters
        </span>
        <span style="font-size:11px; color:#94a3b8; font-family:monospace;">
          Click any folder to open its subfolders & contents
        </span>
      </div>
    `;

    container.innerHTML = headerInfo + tree.map((node, idx) => buildFolderHtml(node, `f_${idx}`, idx === 0, 0)).join('');
  }

  function buildFolderHtml(node, id, isOpenByDefault, level = 0) {
    const hasChildren = node.children && node.children.length > 0;
    const hasVideos = node.videos && node.videos.length > 0;
    const hasPdfs = node.pdfs && node.pdfs.length > 0;
    const totalVideos = node.videos?.length || 0;
    const totalPdfs = node.pdfs?.length || 0;
    const totalSubfolders = node.children?.length || 0;

    // Subfolders recursively rendered
    const childrenHtml = hasChildren
      ? node.children.map((ch, cIdx) => buildFolderHtml(ch, `${id}_${cIdx}`, false, level + 1)).join('')
      : '';

    // Render Tabs for Videos and PDFs
    let contentHtml = '';
    if (hasVideos || hasPdfs) {
      const defaultTab = hasVideos ? 'videos' : 'pdfs';

      const videosListHtml = (node.videos || [])
        .map((v, vIdx) => {
          return `
          <div class="lecture-row" onclick="window.playVideo('${v.asset}', '${escapeHtml(v.title)}')" title="Open lecture in new tab">
            <div style="display:flex; align-items:center; gap:12px; overflow:hidden;">
              <span style="background:rgba(37,99,235,0.2); color:#60a5fa; padding:8px 10px; border-radius:10px; font-size:14px; shrink-0;">▶</span>
              <div style="overflow:hidden;">
                <p style="font-weight:600; font-size:13px; color:white; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${v.title}</p>
                <span style="font-size:10px; color:#06b6d4; font-family:monospace;">Lecture #${vIdx + 1} • Opens in New Tab ↗</span>
              </div>
            </div>
            <button style="padding:6px 14px; border-radius:8px; background:linear-gradient(135deg, #2563EB, #06B6D4); color:white; font-size:11px; font-weight:700; shrink-0; display:flex; align-items:center; gap:4px;">Play ↗</button>
          </div>
        `;
        })
        .join('');

      const pdfsListHtml = (node.pdfs || [])
        .map((p, pIdx) => {
          return `
          <div class="lecture-row" onclick="window.viewPdf('${escapeHtml(p.title)}')">
            <div style="display:flex; align-items:center; gap:12px; overflow:hidden;">
              <span style="background:rgba(6,182,212,0.2); color:#22d3ee; padding:8px 10px; border-radius:10px; font-size:14px; shrink-0;">📄</span>
              <div style="overflow:hidden;">
                <p style="font-weight:600; font-size:13px; color:white; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${p.title}</p>
                <span style="font-size:10px; color:#4ade80; font-family:monospace;">Panel Note #${pIdx + 1}</span>
              </div>
            </div>
            <button style="padding:6px 12px; border-radius:8px; background:#06B6D4; color:white; font-size:11px; font-weight:700; shrink-0;">Read Notes →</button>
          </div>
        `;
        })
        .join('');

      contentHtml = `
        <div style="padding:14px; background:rgba(0,0,0,0.55); border-top:1px solid var(--border-glass); border-radius: 0 0 16px 16px;">
          <!-- Dedicated Tabs Header -->
          <div class="folder-tabs">
            ${
              hasVideos
                ? `<button class="f-tab-btn video ${defaultTab === 'videos' ? 'active' : ''}" onclick="window.switchTab(event, '${id}', 'videos')">🎥 Video Lectures (${totalVideos})</button>`
                : ''
            }
            ${
              hasPdfs
                ? `<button class="f-tab-btn pdf ${defaultTab === 'pdfs' ? 'active' : ''}" onclick="window.switchTab(event, '${id}', 'pdfs')">📄 PDF Notes (${totalPdfs})</button>`
                : ''
            }
          </div>

          <!-- Video Tab Panel -->
          ${
            hasVideos
              ? `<div id="${id}_tab_videos" class="item-list" style="display:${defaultTab === 'videos' ? 'flex' : 'none'};">${videosListHtml}</div>`
              : ''
          }

          <!-- PDF Tab Panel -->
          ${
            hasPdfs
              ? `<div id="${id}_tab_pdfs" class="item-list" style="display:${defaultTab === 'pdfs' ? 'flex' : 'none'};">${pdfsListHtml}</div>`
              : ''
          }
        </div>
      `;
    }

    const isNested = level > 0;

    return `
      <div class="folder-item ${isNested ? 'folder-nested-item' : ''}" id="${id}_wrapper" style="${isNested ? 'margin-left: 10px; margin-top: 8px; margin-bottom: 8px; border-left: 2px solid rgba(59,130,246,0.35);' : ''}">
        <div class="folder-header ${isOpenByDefault ? 'folder-active' : ''}" id="${id}_header" onclick="window.toggleFolderItem('${id}', event)">
          <div class="folder-title">
            <span id="${id}_icon" style="color:#06B6D4; font-size:16px;">${isOpenByDefault ? '📂' : '📁'}</span>
            <span style="font-size: ${level === 0 ? '14px' : '13px'}; font-weight: ${level === 0 ? '700' : '600'}; color: white;">${node.name}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            ${hasChildren ? `<span style="font-size:10px; background:rgba(255,255,255,0.08); color:#cbd5e1; padding:2px 8px; border-radius:6px; font-weight:700;">📁 ${totalSubfolders} ${totalSubfolders === 1 ? 'Folder' : 'Folders'}</span>` : ''}
            ${hasVideos ? `<span style="font-size:10px; background:rgba(37,99,235,0.2); color:#93c5fd; padding:2px 8px; border-radius:6px; font-weight:700;">🎥 ${totalVideos} Videos</span>` : ''}
            ${hasPdfs ? `<span style="font-size:10px; background:rgba(6,182,212,0.2); color:#67e8f9; padding:2px 8px; border-radius:6px; font-weight:700;">📄 ${totalPdfs} PDFs</span>` : ''}
            <span id="${id}_chevron" style="color:#94a3b8; font-size:12px; transform:${isOpenByDefault ? 'rotate(90deg)' : 'rotate(0deg)'}; transition:transform 0.2s;">▶</span>
          </div>
        </div>

        <div id="${id}_body" style="display:${isOpenByDefault ? 'block' : 'none'}; padding:${hasChildren ? '8px 10px 10px 8px' : '0'};">
          ${childrenHtml}
          ${contentHtml}
        </div>
      </div>
    `;
  }

  // Folder UI interactions: Folder inside folder opens on click
  window.toggleFolderItem = function (id, event) {
    if (event) {
      event.stopPropagation();
    }
    const body = document.getElementById(id + '_body');
    const chevron = document.getElementById(id + '_chevron');
    const icon = document.getElementById(id + '_icon');
    const header = document.getElementById(id + '_header');
    if (!body) return;
    const isHidden = (body.style.display === 'none' || getComputedStyle(body).display === 'none');
    if (isHidden) {
      body.style.display = 'block';
      if (chevron) chevron.style.transform = 'rotate(90deg)';
      if (icon) icon.textContent = '📂';
      if (header) header.classList.add('folder-active');
    } else {
      body.style.display = 'none';
      if (chevron) chevron.style.transform = 'rotate(0deg)';
      if (icon) icon.textContent = '📁';
      if (header) header.classList.remove('folder-active');
    }
  };

  window.switchTab = function (e, folderId, tabName) {
    e.stopPropagation();
    const parent = e.target.parentElement;
    parent.querySelectorAll('.f-tab-btn').forEach((b) => b.classList.remove('active'));
    e.target.classList.add('active');

    const vTab = document.getElementById(`${folderId}_tab_videos`);
    const pTab = document.getElementById(`${folderId}_tab_pdfs`);

    if (vTab) vTab.style.display = tabName === 'videos' ? 'flex' : 'none';
    if (pTab) pTab.style.display = tabName === 'pdfs' ? 'flex' : 'none';
  };

  // 7. Video Direct Play in New Tab (Frame me nahi, New Tab me direct open)
  window.playVideo = async function (assetId, title) {
    // Open loading tab immediately on click to prevent popup blockers
    const win = window.open('', '_blank');
    if (win) {
      try {
        win.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${title || 'Target Board Lecture'}</title>
              <style>
                body { margin: 0; background: #09090b; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; }
                .spinner { width: 44px; height: 44px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #06b6d4; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 20px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                h2 { font-size: 20px; font-weight: 800; margin: 0 0 10px; background: linear-gradient(135deg, #60a5fa, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                p { font-size: 13px; color: #94a3b8; font-family: monospace; max-width: 400px; line-height: 1.5; }
              </style>
            </head>
            <body>
              <div class="spinner"></div>
              <h2>Target Board Official Stream</h2>
              <p>Opening lecture: ${title || 'Video'} in new tab...</p>
            </body>
          </html>
        `);
      } catch (err) {}
    }

    try {
      const data = await apiGetVideo(assetId);
      if (data && data.video_url) {
        if (win && !win.closed) {
          win.location.href = data.video_url;
        } else {
          const a = document.createElement('a');
          a.href = data.video_url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } else {
        if (win) win.close();
        alert('Could not retrieve video link.');
      }
    } catch (e) {
      if (win) win.close();
      alert('Could not open video stream: ' + e.message);
    }
  };

  window.closeVideoModal = function () {
    const modal = document.getElementById('video-modal');
    const frame = document.getElementById('video-frame');
    if (frame) frame.src = '';
    if (modal) modal.classList.add('hidden');
  };

  // 8. PDF Viewer Modal
  window.viewPdf = function (title) {
    const modal = document.getElementById('pdf-modal');
    const titleEl = document.getElementById('pdf-modal-title');
    const docTitleEl = document.getElementById('pdf-doc-title');
    if (titleEl) titleEl.textContent = title;
    if (docTitleEl) docTitleEl.textContent = title;
    if (modal) modal.classList.remove('hidden');
  };

  window.closePdfModal = function () {
    const modal = document.getElementById('pdf-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.printPdf = function () {
    window.print();
  };

  // 9. View Switching & Filters
  window.showHomeView = function () {
    const homeView = document.getElementById('home-view');
    const detailView = document.getElementById('course-detail-view');
    const savedView = document.getElementById('saved-view');
    if (homeView) homeView.style.display = 'block';
    if (detailView) detailView.style.display = 'none';
    if (savedView) savedView.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.showSavedView = function () {
    const homeView = document.getElementById('home-view');
    const detailView = document.getElementById('course-detail-view');
    const savedView = document.getElementById('saved-view');
    const savedContainer = document.getElementById('saved-courses-container');

    if (homeView) homeView.style.display = 'none';
    if (detailView) detailView.style.display = 'none';
    if (savedView) savedView.style.display = 'block';

    const savedList = allCourses.filter((c) => savedCourses.some((sc) => sc.id === c.id));
    if (savedContainer) {
      if (savedList.length === 0) {
        savedContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
            <div style="font-size: 40px; margin-bottom: 12px;">❤️</div>
            <h3 style="color: white; font-size: 18px; font-weight: 700;">No saved courses yet</h3>
            <p style="font-size: 13px; margin-top: 6px;">Tap the heart icon on any batch to save it here.</p>
          </div>
        `;
      } else {
        savedContainer.innerHTML = savedList
          .map((c) => {
            return `
            <div class="glass-card" onclick="window.openCourse('${c.id}')" style="cursor: pointer;">
              <div class="course-card-thumb">
                <img src="${c.thumbnail || LOGO_URL}" alt="${c.name}">
                <span class="free-pill">FREE</span>
              </div>
              <div class="course-card-body">
                <h3 class="font-heading" style="font-size:15px; font-weight:700; color:white;">${c.name}</h3>
                <button style="width:100%; padding:8px; border-radius:10px; background:#2563EB; color:white; font-size:12px; font-weight:700;">Open Batch →</button>
              </div>
            </div>
          `;
          })
          .join('');
      }
    }
  };

  window.filterCategory = function (cat, btn) {
    currentCategory = cat;
    document.querySelectorAll('.cat-pill').forEach((b) => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const filtered = allCourses.filter((c) => {
      if (cat === 'all') return true;
      const text = (c.name + ' ' + (c.group || '')).toLowerCase();
      if (cat === '12th') return text.includes('12th');
      if (cat === '10th') return text.includes('10th') || text.includes('topper');
      if (cat === '11th') return text.includes('11th');
      if (cat === 'polytechnic') return text.includes('polytechnic') || text.includes('सार्थक');
      return true;
    });

    renderCourses(filtered);
  };

  window.handleSearch = function (q) {
    const query = q.trim().toLowerCase();
    if (!query) {
      window.filterCategory(currentCategory);
      return;
    }
    const results = allCourses.filter((c) => c.name.toLowerCase().includes(query));
    renderCourses(results);
  };

  // 10. Save Course Toggle
  window.toggleSaveCourse = function (e, id) {
    e.stopPropagation();
    const idx = savedCourses.findIndex((c) => c.id === id);
    if (idx > -1) {
      savedCourses.splice(idx, 1);
    } else {
      const course = allCourses.find((c) => c.id === id);
      if (course) savedCourses.push(course);
    }
    localStorage.setItem('tb_inf_saved', JSON.stringify(savedCourses));
    updateSavedBadge();
    window.filterCategory(currentCategory);
  };

  function updateSavedBadge() {
    const badge = document.getElementById('saved-badge');
    if (!badge) return;
    if (savedCourses.length > 0) {
      badge.style.display = 'flex';
      badge.textContent = savedCourses.length;
    } else {
      badge.style.display = 'none';
    }
  }

  // 11. Dark/Light Theme Toggle
  window.toggleTheme = function () {
    const isLight = document.body.classList.toggle('light');
    localStorage.setItem('tb_inf_theme', isLight ? 'light' : 'dark');
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.textContent = isLight ? '☀️' : '🌙';
  };

  function initTheme() {
    const theme = localStorage.getItem('tb_inf_theme') || 'dark';
    if (theme === 'light') {
      document.body.classList.add('light');
      const btn = document.getElementById('theme-toggle-btn');
      if (btn) btn.textContent = '☀️';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  // Boot Application
  async function init() {
    initSplash();
    initTheme();
    updateSavedBadge();

    const courses = await apiGetCourses();
    allCourses = courses;
    renderCourses(courses);

    const totalEl = document.getElementById('stat-total-courses');
    if (totalEl && courses.length > 0) {
      totalEl.textContent = courses.length + '+';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
