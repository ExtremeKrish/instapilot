

// SPA Router without URL spam + active link
document.addEventListener("click", async (e) => {
  const link = e.target.closest("[data-link]");
  if (!link) return;
  
  e.preventDefault();
  
  const content = document.querySelector("#content");
content.innerHTML = '<div class="loader"></div>';

  const url = link.getAttribute("href");
  
  setActiveLink(link);
  await loadPage(url);
});

// Load page and perform DOM manipulations
async function loadPage(page) {
  try {
    const res = await fetch(page);
    const html = await res.text();
    const content = document.querySelector("#content");
    content.innerHTML = html;
    
    // Perform DOM manipulations based on the loaded page
  //  await handlePageSpecificLogic(page);
    await handleLocalPage(page);

    
  } catch (err) {
    document.querySelector("#content").innerHTML = `<p class="text-red-500">Error loading ${page}</p>`;
  }
}

// Page-specific DOM manipulations and database operations



// Highlight active link
function setActiveLink(activeLink) {
  document.querySelectorAll("a[data-link]").forEach(link => {
    link.classList.remove("bg-indigo-600", "text-white", "font-semibold");
    link.classList.add("hover:text-slate-900", "hover:bg-gray-200");
  });
  activeLink.classList.add("bg-indigo-600", "text-white", "font-semibold");
  activeLink.classList.remove("hover:text-slate-900", "hover:bg-gray-200");
}


 
 
// On first load → dashboard
const firstLink = document.querySelector('a[href="dashboard.html"][data-link]');
if (firstLink) {
  setActiveLink(firstLink);
  loadPage("dashboard.html");
  
}

// DARK MODE
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + value + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
  return document.cookie.split('; ').reduce((r, c) => {
    const [key, v] = c.split('=');
    return key === name ? v : r;
  }, '');
}

function applyDarkMode(mode) {
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('bg-gray-900', 'text-gray-100');
    document.getElementById('logo').src = "/web/img/three.svg";
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('bg-gray-900', 'text-gray-100');
    document.getElementById('logo').src = "/web/img/one.svg";

  }
}

// Load saved mode from cookie on page load
const savedMode = getCookie('darkMode') || 'light';
applyDarkMode(savedMode);

// Toggle button
const darkToggle = document.getElementById('darkModeToggle');
darkToggle.addEventListener('click', () => {
  const currentMode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const newMode = currentMode === 'dark' ? 'light' : 'dark';
  applyDarkMode(newMode);
  setCookie('darkMode', newMode, 365);
});

async function handleLocalPage(page) {
  if (page === "dashboard.html") {
     const logContainer = document.getElementById("log-container");
     const reloadBtn = document.getElementById("reload-btn");
     const clearBtn = document.getElementById("clear-btn");
     const fullscreenBtn = document.getElementById("fullscreen-btn");

     fetchJobbs();
     function scrollToBottom() {
       const logContainer = document.getElementById("log-container");
    
       logContainer.scrollTop = logContainer.scrollHeight;
     }
 
     async function fetchLogs() {
      try {
        logContainer.innerHTML = '<div class="loader"></div>';
        const res = await fetch("https://instapilot.onrender.com/logs");
        if (!res.ok) throw new Error("Failed to fetch logs");
        const text = await res.text();
        logContainer.innerHTML = text || "No logs yet.";
        scrollToBottom();
      } catch (err) {
        logContainer.innerHTML = "⚠️ Error: " + err.message;
      }
    }
    
    async function fetchJobbs() {
      try {
        const totalJobs = document.getElementById("total-jobs");
        const activeJobs = document.getElementById("active-jobs");

        const res = await fetch("https://instapilot.onrender.com/jobs", { method: "GET" });
        const data = await res.json();
                activeJobs.innerHTML = "";
        totalJobs.innerHTML = "";

        activeJobs.innerHTML = data.active_jobs;
        totalJobs.innerHTML = data.total_jobs;

      } catch (e) {
        throw e
      }
    }
    async function clearLogs() {
      try {
        const res = await fetch("https://instapilot.onrender.com/logs/clear", { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to clear logs");
        logContainer.innerHTML = "";
        // Reload logs immediately after clearing
        fetchLogs();
      } catch (err) {
        logContainer.innerHTML = "⚠️ Error: " + err.message;
      }
    }
 
 // Run on load
     fetchLogs();
     
     // Observe content changes and auto-scroll
     const observer = new MutationObserver(scrollToBottom);
     observer.observe(logContainer, { childList: true, subtree: true });
     
     // Buttons
     reloadBtn.addEventListener("click", () => {
       fetchLogs();
       // Example: add new fake logs
     });
 
     clearBtn.addEventListener("click", () => {
       
       clearLogs();
       
     });
       
      fullscreenBtn.addEventListener("click", () => {
       if (!document.fullscreenElement) {
         logContainer.parentElement.requestFullscreen().catch(err => {
           console.error(`Error attempting fullscreen: ${err.message}`);
         });
       } else {
         document.exitFullscreen();
       }
      });
      scrollToBottom();
 
      const iframe = document.getElementById('status-iframe');
      const iframereloadBtn = document.getElementById('iframe-reload');
      const openBtn = document.getElementById('iframe-open');
      const fullBtn = document.getElementById('iframe-full');
      const iframeContainer = document.getElementById('iframe-container');
  
      // Reload iframe
      iframereloadBtn.addEventListener('click', () => {
        // force reload by resetting src (bypass some caching)
        const src = iframe.src;
        iframe.src = '';
        setTimeout(() => iframe.src = src, 50);
      });
  
      // Open in new tab
      openBtn.addEventListener('click', () => {
        window.open(iframe.src, '_blank', 'noopener');
      });

      // Fullscreen the whole iframe wrapper (header + iframe)
      fullBtn.addEventListener('click', async () => {
        const wrapper = document.getElementById('iframe-wrapper');
        if (!document.fullscreenElement) {
          try {
            await wrapper.requestFullscreen();
          } catch (err) {
            console.error('Fullscreen failed:', err);
          }
        } else {
          document.exitFullscreen();
        }
      });

      // Optional: show a friendly message if site blocks embedding
      iframe.addEventListener('load', () => {
        try {
          // try accessing iframe document; will throw if cross-origin or blocked
          const isAccessible = !!(iframe.contentDocument && iframe.contentDocument.body);
          // nothing to do if accessible
        } catch (e) {
          console.warn('Iframe appears to be cross-origin or blocked from embedding.');
          // You can show a visible notice if you want; for now just log.
        }
      });

  }
  if (page === "captions.html") {
    loadCaptions();
    // Placeholder functions
    var reloadBtn = document.getElementById("caption-reload").addEventListener('click', loadCaptions);
  }
  if (page === "images.html") {
    loadImages();
    
    var reloadBtn = document.getElementById("images-reload").addEventListener('click', loadImages);
  
  }
  if (page === "quotes.html") {
    loadQuotes();
  }
  if (page === "jobs.html") {
    loadJobs();
    // Placeholder functions
    var reloadBtn = document.getElementById("jobs-reload").addEventListener('click', loadJobs);
  }
}

async function loadImages() {
  try {
    const res = await fetch("https://instapilot.onrender.com/bg_images/list");
    const data = await res.json();

    const grid = document.getElementById('image-grid');
    grid.innerHTML = ""; // clear old stuff

    data.files.forEach((file, idx) => {
      const imageUrl = `https://instapilot.onrender.com/bg_images/${file}`;

      const card = document.createElement("div");
      card.className = "mb-4 break-inside-avoid bg-gray-50 rounded-lg overflow-hidden shadow hover:shadow-lg transition";

card.innerHTML = `
  <img data-src="${imageUrl}" alt="${file}" class="w-full object-cover lazyload" style="aspect-ratio:0.8;">
  <div class="p-2 flex justify-between items-center">
    <span class="text-sm font-medium text-gray-700">${file}</span>
    <div class="flex gap-2">
      <button class="text-blue-500 hover:text-blue-700" title="Edit" onclick="renameImage('${file}')">

        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M18.41 5.8L17.2 4.59c-.78-.78-2.05-.78-2.83 0l-2.68 2.68L3 15.96V20h4.04l8.74-8.74l2.63-2.63c.79-.78.79-2.05 0-2.83M6.21 18H5v-1.21l8.66-8.66l1.21 1.21zM11 20l4-4h6v4z"/></svg>
      </button>
      <button class="text-red-500 hover:text-red-700" title="Delete" onclick="deleteImage('${file}')">

        
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1zm1 2H6v12h12zm-9 3h2v6H9zm4 0h2v6h-2zM9 4v2h6V4z"/></svg>
        
      </button>
    </div>
  </div>
`;


      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading images:", err);
  }
}

async function loadCaptions() {
  try {
    const res = await fetch("https://instapilot.onrender.com/captions/list");
    const data = await res.json();

    const list = document.getElementById("caption-list");
    list.innerHTML = ""; // clear old items

    data.files.forEach(file => {
      const li = document.createElement("li");
      li.className = "flex items-center justify-between p-3 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-200";

      li.innerHTML = `
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 21h10a2 2 0 002-2V7l-5-5H7a2 2 0 00-2 2v15a2 2 0 002 2z" />
          </svg>
          <span class="font-medium">${file}</span>
        </div>

        <div class="flex items-center gap-4 text-gray-600 dark:text-slate-200">
          <button onclick="editCaption('${file}')" class="flex items-center gap-1 hover:text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536M4 20h4l10-10-4-4L4 16v4z" />
            </svg>
            Edit
          </button>

          <button onclick="renameCaption('${file}')" class="flex items-center gap-1 hover:text-yellow-600">
<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 16 16"><path fill="currentColor" d="M6.5 2a.5.5 0 0 0 0 1h1v10h-1a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-1V3h1a.5.5 0 0 0 0-1zM4 4h2.5v1H4a1 1 0 0 0-1 1v3.997a1 1 0 0 0 1 1h2.5v1H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m8 6.997H9.5v1H12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H9.5v1H12a1 1 0 0 1 1 1v3.997a1 1 0 0 1-1 1" stroke-width="0.2" stroke="currentColor"/></svg>
            Rename
          </button>

          <button onclick="deleteCaption('${file}')" class="flex items-center gap-1 hover:text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linejoin="round" d="M9.5 7v4M6 2.5h4m-8 2h12m-1.5 0v9h-9v-9m3 2.5v4" stroke-width="1"/></svg>
            Delete
          </button>
        </div>
      `;

      list.appendChild(li);
    });

  } catch (err) {
    console.error("Failed to load captions:", err);
  }
}

async function loadJobs() {
  try {
    const res = await fetch("https://instapilot.onrender.com/jobs/list");
    const data = await res.json();

    const list = document.getElementById("jobs-list");
    list.innerHTML = ""; // clear old items

    data.files.forEach(file => {
      const li = document.createElement("li");
      li.className = "flex items-center justify-between p-3 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-200";

      li.innerHTML = `
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-500" viewBox="0 0 24 24"><path fill="currentColor" d="M10.96 21q-.349 0-.605-.229q-.257-.229-.319-.571l-.263-2.092q-.479-.145-1.036-.454q-.556-.31-.947-.664l-1.915.824q-.317.14-.644.03t-.504-.415L3.648 15.57q-.177-.305-.104-.638t.348-.546l1.672-1.25q-.045-.272-.073-.559q-.03-.288-.03-.559q0-.252.03-.53q.028-.278.073-.626l-1.672-1.25q-.275-.213-.338-.555t.113-.648l1.06-1.8q.177-.287.504-.406t.644.021l1.896.804q.448-.373.97-.673q.52-.3 1.013-.464l.283-2.092q.061-.342.318-.571T10.96 3h2.08q.349 0 .605.229q.257.229.319.571l.263 2.112q.575.202 1.016.463t.909.654l1.992-.804q.318-.14.645-.021t.503.406l1.06 1.819q.177.306.104.638t-.348.547L18.36 10.92q.082.31.092.569t.01.51q0 .233-.02.491q-.019.259-.088.626l1.69 1.27q.275.213.358.546t-.094.638l-1.066 1.839q-.176.306-.513.415q-.337.11-.654-.03l-1.923-.824q-.467.393-.94.673t-.985.445l-.264 2.111q-.061.342-.318.571t-.605.23zm.04-1h1.956l.369-2.708q.756-.2 1.36-.549q.606-.349 1.232-.956l2.495 1.063l.994-1.7l-2.189-1.644q.125-.427.166-.786q.04-.358.04-.72q0-.38-.04-.72t-.166-.747l2.227-1.683l-.994-1.7l-2.552 1.07q-.454-.499-1.193-.935q-.74-.435-1.4-.577L13 4h-1.994l-.312 2.689q-.756.161-1.39.52q-.633.358-1.26.985L5.55 7.15l-.994 1.7l2.169 1.62q-.125.336-.175.73t-.05.82q0 .38.05.755t.156.73l-2.15 1.645l.994 1.7l2.475-1.05q.589.594 1.222.953q.634.359 1.428.559zm.973-5.5q1.046 0 1.773-.727T14.473 12t-.727-1.773t-1.773-.727q-1.052 0-1.776.727T9.473 12t.724 1.773t1.776.727M12 12" stroke-width="0.2" stroke="currentColor"/></svg>
          <span class="font-medium">${file}</span>
        </div>

        <div class="flex items-center gap-4 text-gray-600 dark:text-slate-200">
          <button onclick="editJob('${file}')" class="flex items-center gap-1 hover:text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536M4 20h4l10-10-4-4L4 16v4z" />
            </svg>
            Edit
          </button>

          <button onclick="renameJob('${file}')" class="flex items-center gap-1 hover:text-yellow-600">
<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 16 16"><path fill="currentColor" d="M6.5 2a.5.5 0 0 0 0 1h1v10h-1a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-1V3h1a.5.5 0 0 0 0-1zM4 4h2.5v1H4a1 1 0 0 0-1 1v3.997a1 1 0 0 0 1 1h2.5v1H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m8 6.997H9.5v1H12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H9.5v1H12a1 1 0 0 1 1 1v3.997a1 1 0 0 1-1 1" stroke-width="0.2" stroke="currentColor"/></svg>
            Rename
          </button>

          <button onclick="deleteJob('${file}')" class="flex items-center gap-1 hover:text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linejoin="round" d="M9.5 7v4M6 2.5h4m-8 2h12m-1.5 0v9h-9v-9m3 2.5v4" stroke-width="1"/></svg>
            Delete
          </button>
        </div>
      `;

      list.appendChild(li);
    });

  } catch (err) {
    console.error("Failed to load jobs:", err);
  }
}


async function loadQuotes() {

const baseUrl = "https://instapilot.onrender.com"; // change to your server URL

let currentTable = "";
let currentPage = 1;
let limit = 10; // rows per page

async function loadTables() {
  const res = await fetch(`${baseUrl}/db/tables`);
  const data = await res.json();
  const select = document.getElementById("dbTable");
  select.innerHTML = "";
  data.tables.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    select.appendChild(opt);
  });
}

async function loadTableData(table, page = 1) {
  currentTable = table;
  currentPage = page;

  const res = await fetch(`${baseUrl}/db/${table}?page=${page}&limit=${limit}`);
  const data = await res.json();

  const tbody = document.querySelector("#quotes-tbody");
  tbody.innerHTML = "";

  data.rows.forEach(row => {
    tbody.innerHTML += `
      <tr class="border-b border-gray-200 dark:border-gray-700">
        <td class="p-3 text-sm">${row.index}</td>
        <td class="p-3 text-sm">
          <p class="line-clamp-2 overflow-hidden text-ellipsis">${row.text}</p>
        </td>
        <td class="p-3 text-center" >
          ${row.used ? '<span class="text-center text-green-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#00b015" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8z" stroke-width="0.2" stroke="#00b015"/></svg></span>' : '<span class="text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16"><path fill="#b5b5b5" d="m8.746 8l3.1-3.1a.527.527 0 1 0-.746-.746L8 7.254l-3.1-3.1a.527.527 0 1 0-.746.746l3.1 3.1l-3.1 3.1a.527.527 0 1 0 .746.746l3.1-3.1l3.1 3.1a.527.527 0 1 0 .746-.746zM8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16" stroke-width="0.2" stroke="#b5b5b5"/></svg></span>'}
        </td>
      </tr>
    `;
  });

  renderPagination(data.total, data.page, data.limit);
}

function renderPagination(totalRows, page, limit) {
  const totalPages = Math.ceil(totalRows / limit);
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  // Prev button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.disabled = page === 1;
  prevBtn.className = "px-3 py-1 rounded border bg-gray-200 dark:bg-gray-700 disabled:opacity-50";
  prevBtn.onclick = () => loadTableData(currentTable, page - 1);
  container.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-3 py-1 rounded border ${i === page ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`;
    btn.onclick = () => loadTableData(currentTable, i);
    container.appendChild(btn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = page === totalPages;
  nextBtn.className = "px-3 py-1 rounded border bg-gray-200 dark:bg-gray-700 disabled:opacity-50";
  nextBtn.onclick = () => loadTableData(currentTable, page + 1);
  container.appendChild(nextBtn);
}

// Handle select change
document.getElementById("dbTable").addEventListener("change", (e) => {
  loadTableData(e.target.value, 1);
});

// Init
loadTables().then(() => {
  const first = document.getElementById("dbTable").value;
  loadTableData(first, 1);
});

}


