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
          <button onclick="editFile('${file}')" class="flex items-center gap-1 hover:text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536M4 20h4l10-10-4-4L4 16v4z" />
            </svg>
            Edit
          </button>

          <button onclick="renameFile('${file}')" class="flex items-center gap-1 hover:text-yellow-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4" />
            </svg>
            Rename
          </button>

          <button onclick="deleteFile('${file}')" class="flex items-center gap-1 hover:text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4" />
            </svg>
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

// Placeholder functions
function editFile(filename) {
  console.log("Edit:", filename);
  // TODO: implement edit logic
}

function renameFile(filename) {
  console.log("Rename:", filename);
  // TODO: implement rename logic
}

function deleteFile(filename) {
  console.log("Delete:", filename);
  // TODO: implement delete logic
}
