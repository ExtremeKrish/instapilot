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
    document.querySelector("#content").innerHTML = html;
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
