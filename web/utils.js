import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAd2OGLKidT5eZOeAlN_3yqlT7OKxTHafg",
  authDomain: "instapilot1.firebaseapp.com",
  databaseURL: "https://instapilot1-default-rtdb.firebaseio.com",
  projectId: "instapilot1",
  storageBucket: "instapilot1.firebasestorage.app",
  messagingSenderId: "1014623273056",
  appId: "1:1014623273056:web:937a438b9501d0b9e58305"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// SPA Router without URL spam + active link
document.addEventListener("click", async (e) => {
  const link = e.target.closest("[data-link]");
  if (!link) return;
  
  e.preventDefault();
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
async function handlePageSpecificLogic(page) {
  if (page === "dashboard.html") {
    // Example: Update a counter display
    const counterElement = document.querySelector("#total-jobs");
    const activeJobs = document.querySelector("#active-jobs");
    if (counterElement) {
        // Fetch counter value from Firebase
        const jobsRef = ref(db, 'jobs');
        
        // Use onValue to listen for changes to the data at the jobsRef
        onValue(jobsRef, (snapshot) => {
          const jobs = snapshot.val();
          let activeJobsCount = 0;
          
          if (jobs) {
            // Check if the data exists before proceeding
            
            // Get an array of the keys (job IDs)
            const jobKeys = Object.keys(jobs);
            
            counterElement.innerText = jobKeys.length;
            
            // Iterate over each job key
            jobKeys.forEach(jobId => {
              const job = jobs[jobId];
              // Check if the 'status' key exists and if its value is 'active'
              if (job && job.status === 'active') {
                activeJobsCount++;
              }
            });
          }
          activeJobs.innerText = activeJobsCount;
        });
      
    }
  
  } else if (page === "jobs.html") {
    
       const jobsTableBody = document.getElementById('jobs-table-body');
 
       // Get a reference to the 'jobs' node in your database
       const jobsRef = ref(db, 'jobs');
      
      const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
          case 'active':
            return 'bg-green-100 text-green-800';
          case 'paused':
            return 'bg-yellow-100 text-yellow-800';
          case 'testing':
            return 'bg-blue-100 text-blue-800';
          case 'completed':
            return 'bg-indigo-100 text-indigo-800';
          default:
            return 'bg-gray-100 text-gray-800';
        }
      };

      onValue(jobsRef, (snapshot) => {
            try {
              // Clear any existing table rows
              jobsTableBody.innerHTML = '';
              
              const jobs = snapshot.val();
              
             

              if (jobs) {
                // Iterate over each job using its key
                Object.keys(jobs).forEach(jobId => {
                  const job = jobs[jobId];
                 
                  // Create a new table row element
                  const row = document.createElement('tr');
                  row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200';
                  
                  // Use slug as the name
                  const nameCell = document.createElement('td');
                  nameCell.className = 'px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white';
                  nameCell.textContent = job.slug || 'N/A';
                  
                  // Create cells for theme, caption, database, and status
                  const themeCell = document.createElement('td');
                  themeCell.className = 'px-6 py-4 whitespace-nowrap';
                  themeCell.innerHTML = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">${job.theme || 'N/A'}</span>`;
                  
                  const captionCell = document.createElement('td');
                  captionCell.className = 'px-6 py-4 whitespace-nowrap';
                  captionCell.innerHTML = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">${job.caption_file || 'N/A'}</span>`;
                  
                  const dbCell = document.createElement('td');
                  dbCell.className = 'px-6 py-4 whitespace-nowrap';
                  dbCell.innerHTML = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">${job.db_table || 'N/A'}</span>`;
                  
                  const statusCell = document.createElement('td');
                  statusCell.className = 'px-6 py-4 whitespace-nowrap';
                  const statusClass = getStatusColor(job.status || 'N/A');
                  statusCell.innerHTML = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${job.status || 'N/A'}</span>`;
                  
                  // Create cell for actions with buttons
                  const actionsCell = document.createElement('td');
                  actionsCell.className = 'px-6 py-4 whitespace-nowrap text-center text-sm font-medium';
                  actionsCell.innerHTML = `
                                  <div class="flex justify-center gap-2">
                                      <button class="text-blue-500 hover:text-blue-700 transition-colors" title="Edit">
                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.3"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></g></svg>
                                      </button>
                                      <button class="text-yellow-500 hover:text-yellow-700 transition-colors" title="View">
                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24"><g fill="currentColor"><path d="M16 12a4 4 0 1 1-8 0a4 4 0 0 1 8 0"/><path fill-rule="evenodd" d="M12 19a7 7 0 1 0 0-14a7 7 0 0 0 0 14m0 2a9 9 0 1 0 0-18a9 9 0 0 0 0 18" clip-rule="evenodd"/></g></svg>
                                      </button>
                                      <button class="text-red-500 hover:text-red-700 transition-colors" title="Delete">
                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 12 12"><path fill="currentColor" d="M5 3h2a1 1 0 0 0-2 0M4 3a2 2 0 1 1 4 0h2.5a.5.5 0 0 1 0 1h-.441l-.443 5.17A2 2 0 0 1 7.623 11H4.377a2 2 0 0 1-1.993-1.83L1.941 4H1.5a.5.5 0 0 1 0-1zm3.5 3a.5.5 0 0 0-1 0v2a.5.5 0 0 0 1 0zM5 5.5a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0V6a.5.5 0 0 0-.5-.5"/></svg>
                                      </button>
                                  </div>
                              `;
                  
                  // Append cells to the row
                  row.appendChild(nameCell);
                  row.appendChild(themeCell);
                  row.appendChild(captionCell);
                  row.appendChild(dbCell);
                  row.appendChild(statusCell);
                  row.appendChild(actionsCell);
                  
                  // Append the completed row to the table body
                  jobsTableBody.appendChild(row);
                });
              } else {
                // If there are no jobs, display a message
                jobsTableBody.innerHTML = `
                              <tr>
                                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center" colspan="6">
                                      No jobs found.
                                  </td>
                              </tr>
                          `;
              }
            } catch (error) {
              console.error("Error fetching or rendering jobs:", error);
              jobsTableBody.innerHTML = `
                          <tr>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-red-500 text-center" colspan="6">
                                  Failed to load jobs. Please check your Firebase configuration and network connection.
                              </td>
                          </tr>
                      `;
            }
        });


  }
}



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
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('bg-gray-900', 'text-gray-100');
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
  if (page === "captions.html") {
    loadCaptions();
    // Placeholder functions
var reloadBtn = document.getElementById("caption-reload").addEventListener('click', loadCaptions);
}
if (page === "images.html") {
  loadImages();
}
if (page === "quotes.html") {
  loadQuotes();
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
  <img src="${imageUrl}" alt="${file}" class="w-full object-cover">
  <div class="p-2 flex justify-between items-center">
    <span class="text-sm font-medium text-gray-700">${file}</span>
    <div class="flex gap-2">
      <button class="text-blue-500 hover:text-blue-700" title="Edit" onclick="renameImage(${file})">

        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M18.41 5.8L17.2 4.59c-.78-.78-2.05-.78-2.83 0l-2.68 2.68L3 15.96V20h4.04l8.74-8.74l2.63-2.63c.79-.78.79-2.05 0-2.83M6.21 18H5v-1.21l8.66-8.66l1.21 1.21zM11 20l4-4h6v4z"/></svg>
      </button>
      <button class="text-red-500 hover:text-red-700" title="Delete" onclick="deleteImage(${file})">

        
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
        <td class="p-3 text-center">
          ${row.used ? '<span class="text-green-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#00b015" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8z" stroke-width="0.2" stroke="#00b015"/></svg></span>' : '<span class="text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16"><path fill="#b5b5b5" d="m8.746 8l3.1-3.1a.527.527 0 1 0-.746-.746L8 7.254l-3.1-3.1a.527.527 0 1 0-.746.746l3.1 3.1l-3.1 3.1a.527.527 0 1 0 .746.746l3.1-3.1l3.1 3.1a.527.527 0 1 0 .746-.746zM8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16" stroke-width="0.2" stroke="#b5b5b5"/></svg></span>'}
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


