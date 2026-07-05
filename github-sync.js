const githubRepoOwner = "CapriBlu";
const githubRepoName = "Turni-Capri-Blu-Sorrento";
const githubBranch = "main";
const githubOfficialSavePath = "save/turni-attuali.json";
const githubTokenSessionKey = "capriBluGithubTokenSessionV1";
const githubOfficialLoadedAtKey = "capriBluOfficialSaveLoadedAt";
const githubLocalChangesKey = "capriBluLocalChangesAfterOfficial";

const saveToGithubBtn = document.getElementById("saveToGithubBtn");

function utf8ToBase64(value) {
  return btoa(unescape(encodeURIComponent(value)));
}

function getGithubToken() {
  const savedToken = sessionStorage.getItem(githubTokenSessionKey);
  if (savedToken) return savedToken;

  const token = prompt(
    "Inserisci il token GitHub per salvare i turni nella repo. Il token resta solo in questa sessione del browser."
  );

  if (!token) return "";
  sessionStorage.setItem(githubTokenSessionKey, token.trim());
  return token.trim();
}

function forgetGithubToken() {
  sessionStorage.removeItem(githubTokenSessionKey);
}

async function githubApi(path, options = {}) {
  const token = getGithubToken();
  if (!token) throw new Error("Token mancante");

  const response = await fetch(`https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}${path}`, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || `Errore GitHub ${response.status}`;
    throw new Error(message);
  }

  return data;
}

async function getOfficialSaveSha() {
  const data = await githubApi(`/contents/${githubOfficialSavePath}?ref=${githubBranch}`);
  return data.sha;
}

async function saveCurrentSessionToGithub() {
  if (typeof getSessionSnapshot !== "function") {
    alert("Funzione di backup non disponibile. Ricarica la pagina e riprova.");
    return;
  }

  try {
    setAutosaveStatus("Salvo su GitHub...");

    autoSaveSession?.();
    const snapshot = getSessionSnapshot();
    const content = JSON.stringify(snapshot, null, 2);
    const sha = await getOfficialSaveSha();

    await githubApi(`/contents/${githubOfficialSavePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Aggiorna turni ufficiali ${snapshot.currentWeek || ""}`.trim(),
        content: utf8ToBase64(content),
        sha,
        branch: githubBranch
      })
    });

    localStorage.setItem(githubOfficialLoadedAtKey, new Date().toISOString());
    localStorage.removeItem(githubLocalChangesKey);
    if (typeof updateSaveSourceStatus === "function") updateSaveSourceStatus();
    setAutosaveStatus("Turni salvati su GitHub");
    alert("Turni salvati su GitHub. Ora telefono e tablet possono caricare da GitHub.");
  } catch (error) {
    console.error(error);
    setAutosaveStatus("Errore salvataggio GitHub");

    if (String(error.message || "").toLowerCase().includes("bad credentials")) {
      forgetGithubToken();
      alert("Token GitHub non valido. Riprova inserendo un token corretto.");
      return;
    }

    alert("Non riesco a salvare su GitHub: " + (error.message || "errore sconosciuto"));
  }
}

saveToGithubBtn?.addEventListener("click", saveCurrentSessionToGithub);
