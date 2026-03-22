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

function setHtml(id, value) {
  const node = byId(id);
  if (node) {
    node.innerHTML = value || "";
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

function createMetaPill(item) {
  const pill = document.createElement("article");
  pill.className = "meta-pill meta-pill--short";

  const value = document.createElement("span");
  value.className = "meta-pill__value";
  value.textContent = item.value;

  const label = document.createElement("span");
  label.className = "meta-pill__label";
  label.textContent = item.label;

  pill.append(value, label);
  return pill;
}

function createCompactProject(item) {
  const card = document.createElement("article");
  card.className = "short-stack-item";

  const title = document.createElement("h4");
  title.className = "short-stack-item__title";
  title.textContent = item.title;

  const subtitle = document.createElement("p");
  subtitle.className = "short-stack-item__subtitle";
  subtitle.textContent = item.subtitle;

  const text = document.createElement("p");
  text.className = "short-stack-item__text";
  text.textContent = item.text;

  card.append(title, subtitle, text);
  return card;
}

function createCompactSkill(group) {
  const wrap = document.createElement("section");
  wrap.className = "short-tag-card";

  const title = document.createElement("h4");
  title.className = "short-tag-card__title";
  title.textContent = group.title;

  const tags = document.createElement("div");
  tags.className = "tag-list tag-list--compact";
  group.items.forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item;
    tags.appendChild(tag);
  });

  wrap.append(title, tags);
  return wrap;
}

function createCompactEducation(item) {
  const card = document.createElement("article");
  card.className = "short-timeline__item";

  const top = document.createElement("div");
  top.className = "short-timeline__top";

  const title = document.createElement("h4");
  title.className = "short-timeline__title";
  title.textContent = item.title;

  const period = document.createElement("span");
  period.className = "short-timeline__period";
  period.textContent = item.period;

  top.append(title, period);

  const text = document.createElement("p");
  text.className = "short-timeline__text";
  text.textContent = item.text;

  card.append(top, text);
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

function renderBullets(id, items) {
  const target = byId(id);
  if (!target) {
    return;
  }

  target.replaceChildren(
    ...items.map((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      return li;
    })
  );
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

function absolutePageUrl(path) {
  const normalizedBase = appData.site.baseUrl.endsWith("/")
    ? appData.site.baseUrl
    : `${appData.site.baseUrl}/`;
  return new URL(path || "", normalizedBase).toString();
}

function updateSeo(title, description, path, language) {
  document.title = title;
  document.documentElement.lang = language;

  const canonical = byId("canonicalLink");
  const metaDescription = byId("metaDescription");
  const ogTitle = byId("ogTitle");
  const ogDescription = byId("ogDescription");
  const ogUrl = byId("ogUrl");
  const ogImage = byId("ogImage");
  const twitterTitle = byId("twitterTitle");
  const twitterDescription = byId("twitterDescription");
  const twitterImage = byId("twitterImage");
  const pageUrl = absolutePageUrl(path);

  if (canonical) {
    canonical.href = pageUrl;
  }
  if (metaDescription) {
    metaDescription.content = description;
  }
  if (ogTitle) {
    ogTitle.content = title;
  }
  if (ogDescription) {
    ogDescription.content = description;
  }
  if (ogUrl) {
    ogUrl.content = pageUrl;
  }
  if (ogImage) {
    ogImage.content = appData.site.socialImage;
  }
  if (twitterTitle) {
    twitterTitle.content = title;
  }
  if (twitterDescription) {
    twitterDescription.content = description;
  }
  if (twitterImage) {
    twitterImage.content = appData.site.socialImage;
  }
}

function applyLanguage(language) {
  const translation = appData.translations[language] || appData.translations[appData.settings.defaultLanguage];
  const basics = translation.basics;
  const meta = translation.meta;
  const shortCv = translation.shortCv;

  updateSeo(shortCv.pageTitle, shortCv.pageDescription, "short-cv.html", meta.htmlLang || language);

  setText("toolbarEyebrow", meta.toolbarEyebrow);
  setText("toolbarTitle", shortCv.toolbarTitle);
  setText("navResume", meta.navResume);
  setText("navShortCv", meta.navShortCv);
  setText("navDiploma", meta.navDiploma);
  setText("shortEyebrow", shortCv.eyebrow);
  setText("shortName", basics.name);
  setText("shortTitle", shortCv.title);
  setText("shortSummary", shortCv.summary);
  setText("shortAvailability", shortCv.availability);
  setText("shortContactsLabel", shortCv.contactsLabel);
  setText("shortProfileLabel", shortCv.profileLabel);
  setText("shortProjectsLabel", shortCv.projectsLabel);
  setText("shortSkillsLabel", shortCv.skillsLabel);
  setText("shortEducationLabel", shortCv.educationLabel);
  setText("shortLanguagesLabel", shortCv.languagesLabel);
  setHtml("shortFooterNoteText", shortCv.footerNoteHtml);
  setText("shortPrintEducation", shortCv.printEducation);

  renderList("shortContacts", shortCv.contacts, createContactItem);
  renderList("shortHighlights", shortCv.highlights, createMetaPill);
  renderBullets("shortProfilePoints", shortCv.profilePoints);
  renderList("shortProjects", shortCv.projects, createCompactProject);
  renderList("shortSkills", shortCv.skills, createCompactSkill);
  renderList("shortEducation", shortCv.education, createCompactEducation);
  renderSimpleList("shortLanguages", shortCv.languages);

  const profileLink = byId("profileLink");
  if (profileLink) {
    profileLink.href = appData.assets.profileLink;
    profileLink.textContent = meta.profileLink;
  }

  const downloadPdf = byId("downloadPdf");
  if (downloadPdf) {
    downloadPdf.textContent = meta.pdfButton;
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

  const downloadPdf = byId("downloadPdf");
  if (downloadPdf) {
    downloadPdf.addEventListener("click", () => window.print());
  }

  applyLanguage(getStoredLanguage());
}

init();
