/*

// SPA Router without URL spam + active link
document.addEventListener("click", async (e) => {
  const link = e.target.closest("[data-link]");
  if (!link) return;

  e.preventDefault();
  const url = link.getAttribute("href");

  setActiveLink(link);
  loadPage(url);
});



async function loadPage(page) {
  try {
    const res = await fetch(page);
    const html = await res.text();
     const content = document.querySelector("#content");
     content.innerHTML = html;
  
  } catch (err) {
    document.querySelector("#content").innerHTML = `<p class="text-red-500">Error loading ${page}</p>`;
  }
}

// highlight active link
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
