const THEME_STORAGE_KEY = "theme";

const root = document.documentElement;
const toggleBtn = document.getElementById("themeToggle");

function applyTheme(theme) {
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
}

function updateToggleLabel() {
  if (!toggleBtn) return;
  const isLight = root.getAttribute("data-theme") === "light";
  const iconClass = isLight ? "bi-moon-stars" : "bi-brightness-high-fill";
  const label = isLight ? "Dark mode" : "Light mode";
  toggleBtn.innerHTML = `<i class="bi ${iconClass}" aria-hidden="true"></i><span class="visually-hidden">${label}</span>`;
  toggleBtn.setAttribute("aria-label", label);
}

const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
if (savedTheme) {
  applyTheme(savedTheme);
}
updateToggleLabel();

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const isLight = root.getAttribute("data-theme") === "light";
    const nextTheme = isLight ? "dark" : "light";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    updateToggleLabel();
  });
}
