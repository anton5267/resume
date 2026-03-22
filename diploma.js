const appData = window.resumeData;

function byId(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const node = byId(id);
  if (node) {
    node.textContent = value || "";
  }
}

function createChip(text) {
  const chip = document.createElement("span");
  chip.className = "chip";
  chip.textContent = text;
  return chip;
}

function createContactItem(item) {
  const wrap = document.createElement("div");
  wrap.className = "contact-item";

  const title = document.createElement("dt");
  title.textContent = item.label;

  const value = document.createElement("dd");
  if (item.href) {
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.value;
    if (item.href.startsWith("http")) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    value.appendChild(link);
  } else {
    value.textContent = item.value;
  }

  wrap.append(title, value);
  return wrap;
}

function createEntryCard(item) {
  const card = document.createElement("article");
  card.className = "entry-card";

  const top = document.createElement("div");
  top.className = "entry-card__top";

  const titleWrap = document.createElement("div");
  const title = document.createElement("h4");
  title.className = "entry-card__title";
  title.textContent = item.title;

  const subtitle = document.createElement("p");
  subtitle.className = "entry-card__subtitle";
  subtitle.textContent = item.subtitle;

  titleWrap.append(title, subtitle);

  const period = document.createElement("p");
  period.className = "entry-card__period";
  period.textContent = item.period;

  top.append(titleWrap, period);

  const text = document.createElement("p");
  text.className = "entry-card__text";
  text.textContent = item.text;

  card.append(top, text);

  if (item.bullets?.length) {
    const list = document.createElement("ul");
    list.className = "entry-card__list";

    item.bullets.forEach((bullet) => {
      const li = document.createElement("li");
      li.textContent = bullet;
      list.appendChild(li);
    });

    card.appendChild(list);
  }

  if (item.link?.href) {
    const link = document.createElement("a");
    link.className = "entry-link";
    link.href = item.link.href;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = item.link.label || item.link.href;
    card.appendChild(link);
  }

  return card;
}

function createDocumentCard(item) {
  const asset = appData.assets.documents[item.asset];
  const card = document.createElement("article");
  card.className = "document-card";

  const top = document.createElement("div");
  top.className = "document-card__top";

  const badge = document.createElement("span");
  badge.className = "document-card__badge";
  badge.textContent = item.badge;

  const title = document.createElement("h4");
  title.className = "document-card__title";
  title.textContent = item.title;

  top.append(badge, title);

  const description = document.createElement("p");
  description.className = "document-card__text";
  description.textContent = item.description;

  const actions = document.createElement("div");
  actions.className = "document-card__actions";

  const open = document.createElement("a");
  open.className = "button button--ghost button--small";
  open.href = asset.src;
  open.target = "_blank";
  open.rel = "noreferrer";
  open.textContent = item.openLabel;

  const download = document.createElement("a");
  download.className = "button button--primary button--small";
  download.href = asset.src;
  download.download = "";
  download.textContent = item.downloadLabel;

  actions.append(open, download);

  const viewer = document.createElement("iframe");
  viewer.className = "document-card__viewer";
  viewer.src = `${asset.src}#toolbar=0&view=FitH`;
  viewer.title = item.title;
  viewer.loading = "lazy";

  card.append(top, description, actions, viewer);
  return card;
}

function renderList(id, items, factory) {
  const target = byId(id);
  if (!target) {
    return;
  }

  target.replaceChildren(...items.map(factory));
}

function renderSimpleList(id, items) {
  const target = byId(id);
  if (!target) {
    return;
  }

  target.replaceChildren(...items.map((item) => createChip(item)));
}

function getStoredLanguage() {
  const available = Object.keys(appData.translations);
  const fallback = appData.settings.defaultLanguage;

  try {
    const saved = window.localStorage.getItem(appData.settings.storageKey);
    if (saved && available.includes(saved)) {
      return saved;
    }
  } catch {
    // Ignore storage access issues.
  }

  return fallback;
}

function setStoredLanguage(language) {
  try {
    window.localStorage.setItem(appData.settings.storageKey, language);
  } catch {
    // Ignore storage access issues.
  }
}

function updateLanguageButtons(language) {
  document.querySelectorAll(".lang-switch__button").forEach((button) => {
    const isActive = button.dataset.lang === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function setupPhotoAndMonogram(name, photoAlt) {
  const photo = byId("profilePhoto");
  const fallback = byId("photoFallback");
  const initials = byId("photoInitials");
  const heroMonogram = byId("heroMonogram");
  const photoData = appData.assets.photo;
  const monogram =
    photoData?.initials ||
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() ||
    "CV";

  if (initials) {
    initials.textContent = monogram;
  }

  if (heroMonogram) {
    heroMonogram.textContent = monogram;
  }

  if (!photo || !photoData?.src) {
    return;
  }

  photo.alt = photoAlt || "Profile photo";
  photo.onload = () => {
    photo.style.display = "block";
    if (fallback) {
      fallback.style.display = "none";
    }
  };
  photo.onerror = () => {
    photo.style.display = "none";
    if (fallback) {
      fallback.style.display = "grid";
    }
  };
  if (photo.getAttribute("src") !== photoData.src) {
    photo.src = photoData.src;
  } else if (photo.complete && photo.naturalWidth > 0) {
    photo.style.display = "block";
    if (fallback) {
      fallback.style.display = "none";
    }
  }
}

function applyLanguage(language) {
  const translation = appData.translations[language] || appData.translations[appData.settings.defaultLanguage];
  const basics = translation.basics;
  const diploma = translation.diploma;
  const meta = translation.meta;

  document.documentElement.lang = meta.htmlLang || language;
  document.title = diploma.pageTitle || meta.pageTitle;

  setText("toolbarEyebrow", meta.toolbarEyebrow);
  setText("toolbarTitle", diploma.toolbarTitle);
  setText("navResume", meta.navResume);
  setText("navDiploma", meta.navDiploma);
  setText("diplomaSidebarRole", diploma.sidebarRole);
  setText("diplomaFactsLabel", diploma.factsLabel);
  setText("diplomaDocsLabel", diploma.docsLabel);
  setText("diplomaEyebrow", diploma.eyebrow);
  setText("diplomaTitle", diploma.title);
  setText("diplomaSummary", diploma.summary);
  setText("diplomaOverviewLabel", diploma.overviewLabel);
  setText("diplomaOverviewTitle", diploma.overviewTitle);
  setText("diplomaDocumentsLabel", diploma.documentsLabel);
  setText("diplomaDocumentsTitle", diploma.documentsTitle);

  renderList("diplomaFacts", diploma.facts, createContactItem);
  renderSimpleList("diplomaDocChips", diploma.docChips);
  renderList("diplomaOverviewCards", diploma.overviewCards, createEntryCard);
  renderList("diplomaDocuments", diploma.documents, createDocumentCard);

  const profileLink = byId("profileLink");
  if (profileLink) {
    profileLink.href = appData.assets.profileLink;
    profileLink.textContent = meta.profileLink;
  }

  setupPhotoAndMonogram(basics.name, basics.photoAlt);
  updateLanguageButtons(language);
}

function bindLanguageSwitcher() {
  document.querySelectorAll(".lang-switch__button").forEach((button) => {
    button.addEventListener("click", () => {
      const language = button.dataset.lang;
      if (!language || !appData.translations[language]) {
        return;
      }

      setStoredLanguage(language);
      applyLanguage(language);
    });
  });
}

function init() {
  if (!appData?.translations) {
    return;
  }

  bindLanguageSwitcher();
  applyLanguage(getStoredLanguage());
}

init();
