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

function createTagList(items) {
  const wrap = document.createElement("div");
  wrap.className = "tag-list";

  items.forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item;
    wrap.appendChild(tag);
  });

  return wrap;
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
  pill.className = "meta-pill";

  const value = document.createElement("span");
  value.className = "meta-pill__value";
  value.textContent = item.value;

  const label = document.createElement("span");
  label.className = "meta-pill__label";
  label.textContent = item.label;

  pill.append(value, label);
  return pill;
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

  if (item.tags?.length) {
    card.appendChild(createTagList(item.tags));
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

function createSkillCard(group) {
  const card = document.createElement("section");
  card.className = "skill-card";

  const title = document.createElement("h4");
  title.textContent = group.title;

  card.append(title, createTagList(group.items));
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
  const { meta, basics } = translation;

  updateSeo(meta.pageTitle, meta.pageDescription, "", meta.htmlLang || language);

  setText("toolbarEyebrow", meta.toolbarEyebrow);
  setText("toolbarTitle", meta.toolbarTitle);
  setText("navResume", meta.navResume);
  setText("navShortCv", meta.navShortCv);
  setText("navDiploma", meta.navDiploma);
  setText("labelContact", meta.sidebarContact);
  setText("labelLanguages", meta.sidebarLanguages);
  setText("labelStrengths", meta.sidebarStrengths);
  setText("labelInterests", meta.sidebarInterests);
  setText("objectiveLabel", meta.objectiveLabel);
  setText("objectiveTitle", meta.objectiveTitle);
  setText("educationLabel", meta.educationLabel);
  setText("educationTitle", meta.educationTitle);
  setText("projectsLabel", meta.projectsLabel);
  setText("projectsTitle", meta.projectsTitle);
  setText("skillsLabel", meta.skillsLabel);
  setText("skillsTitle", meta.skillsTitle);

  setText("eyebrow", basics.eyebrow);
  setText("name", basics.name);
  setText("title", basics.title);
  setText("summary", basics.summary);
  setText("objective", basics.objective);
  setText("sidebarRole", basics.sidebarRole);
  setHtml("footerNoteText", meta.footerNoteHtml);

  renderList("contacts", basics.contacts, createContactItem);
  renderSimpleList("languages", translation.languages);
  renderBullets("strengths", translation.strengths);
  renderSimpleList("interests", translation.interests);
  renderList("highlights", translation.highlights, createMetaPill);
  renderList("education", translation.education, createEntryCard);
  renderList("projects", translation.projects, createEntryCard);
  renderList("skills", translation.skills, createSkillCard);

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
