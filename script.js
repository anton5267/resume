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

let printLayoutRoot = null;
let pdfLibrariesPromise = null;

function isResumePage() {
  return Boolean(
    document.body.classList.contains("resume-page") &&
      document.querySelector(".resume-sheet .sidebar") &&
      document.querySelector(".resume-sheet .content")
  );
}

function sanitizeClone(node) {
  const clone = node.cloneNode(true);

  [clone, ...clone.querySelectorAll("[id]")].forEach((element) => {
    if (element.removeAttribute) {
      element.removeAttribute("id");
    }
  });

  clone.querySelectorAll(".no-print").forEach((element) => {
    element.classList.remove("no-print");
  });

  clone.querySelectorAll("[aria-pressed]").forEach((element) => {
    element.removeAttribute("aria-pressed");
  });

  return clone;
}

function teardownPrintLayout() {
  document.body.classList.remove("has-print-layout");

  if (printLayoutRoot) {
    printLayoutRoot.remove();
    printLayoutRoot = null;
  }
}

function createPrintPage(kind, toolbarTemplate, sidebarTemplate) {
  const page = document.createElement("section");
  page.className = `print-page print-page--${kind}`;

  const surface = document.createElement("div");
  surface.className = "print-page__surface";

  if (kind === "cover") {
    const toolbarWrap = document.createElement("div");
    toolbarWrap.className = "print-page__toolbar";
    toolbarWrap.appendChild(toolbarTemplate.cloneNode(true));
    surface.appendChild(toolbarWrap);
  }

  const sheet = document.createElement("div");
  sheet.className = `print-page__sheet print-page__sheet--${kind}`;

  if (kind === "cover") {
    const sidebarWrap = document.createElement("div");
    sidebarWrap.className = "print-page__sidebar";
    sidebarWrap.appendChild(sidebarTemplate.cloneNode(true));
    sheet.appendChild(sidebarWrap);
  }

  const content = document.createElement("div");
  content.className = `print-page__content print-page__content--${kind}`;
  sheet.appendChild(content);

  surface.appendChild(sheet);
  page.appendChild(surface);
  return { page, content, kind };
}

function createSectionShell(sectionClassName, headingTemplate, listClassName) {
  const section = document.createElement("section");
  section.className = sectionClassName || "content-section";

  if (headingTemplate) {
    section.appendChild(headingTemplate.cloneNode(true));
  }

  const container = document.createElement("div");
  container.className = listClassName;
  section.appendChild(container);

  return { section, container };
}

function collectPrintBlocks() {
  const content = document.querySelector(".resume-sheet .content");
  if (!content) {
    return [];
  }

  return [...content.children]
    .map((child) => {
      if (child.classList.contains("hero-block")) {
        return {
          type: "single",
          node: sanitizeClone(child),
        };
      }

      if (!child.classList.contains("content-section")) {
        return null;
      }

      const heading = child.querySelector(".section-heading");
      const lead = child.querySelector(".lead-copy");
      const entryList = child.querySelector(".entry-list");
      const skillsGrid = child.querySelector(".skills-grid");

      if (lead) {
        const section = document.createElement("section");
        section.className = child.className;

        if (heading) {
          section.appendChild(sanitizeClone(heading));
        }

        section.appendChild(sanitizeClone(lead));
        return {
          type: "single",
          node: section,
        };
      }

      if (entryList || skillsGrid) {
        const list = entryList || skillsGrid;
        return {
          type: "collection",
          sectionClassName: child.className,
          listClassName: list.className,
          headingTemplate: heading ? sanitizeClone(heading) : null,
          itemTemplates: [...list.children].map((item) => sanitizeClone(item)),
        };
      }

      return {
        type: "single",
        node: sanitizeClone(child),
      };
    })
    .filter(Boolean);
}

function contentOverflows(pageContent) {
  return pageContent.scrollHeight > pageContent.clientHeight + 1;
}

function buildPrintLayout() {
  if (!isResumePage()) {
    return null;
  }

  teardownPrintLayout();

  const toolbarSource = document.querySelector(".site-frame > .toolbar");
  const sidebarSource = document.querySelector(".resume-sheet > .sidebar");
  if (!toolbarSource || !sidebarSource) {
    return null;
  }

  const toolbarTemplate = sanitizeClone(toolbarSource);
  const sidebarTemplate = sanitizeClone(sidebarSource);
  const blocks = collectPrintBlocks();

  const root = document.createElement("div");
  root.className = "print-resume is-measuring";
  root.setAttribute("aria-hidden", "true");
  document.body.appendChild(root);

  const pages = [];
  const createPage = (kind = "flow") => {
    const page = createPrintPage(kind, toolbarTemplate, sidebarTemplate);
    pages.push(page);
    root.appendChild(page.page);
    return page;
  };

  let currentPage = createPage("cover");

  blocks.forEach((block) => {
    if (block.type === "single") {
      const node = block.node.cloneNode(true);
      currentPage.content.appendChild(node);

      if (contentOverflows(currentPage.content) && currentPage.content.childElementCount > 1) {
        node.remove();
        currentPage = createPage("flow");
        currentPage.content.appendChild(node);
      }

      return;
    }

    let shell = createSectionShell(
      block.sectionClassName,
      block.headingTemplate,
      block.listClassName
    );
    currentPage.content.appendChild(shell.section);

    block.itemTemplates.forEach((itemTemplate) => {
      const item = itemTemplate.cloneNode(true);
      shell.container.appendChild(item);

      if (!contentOverflows(currentPage.content)) {
        return;
      }

      item.remove();

      const sectionHasItems = shell.container.childElementCount > 0;
      const isSectionAloneOnPage = currentPage.content.childElementCount === 1;

      if (!sectionHasItems && isSectionAloneOnPage) {
        shell.container.appendChild(item);
        return;
      }

      if (!sectionHasItems) {
        shell.section.remove();
      }

      currentPage = createPage("flow");
      shell = createSectionShell(
        block.sectionClassName,
        block.headingTemplate,
        block.listClassName
      );
      currentPage.content.appendChild(shell.section);
      shell.container.appendChild(item);
    });
  });

  root.classList.remove("is-measuring");
  printLayoutRoot = root;
  document.body.classList.add("has-print-layout");
  return printLayoutRoot;
}

function getCurrentTranslation() {
  const language = getStoredLanguage();
  return appData.translations[language] || appData.translations[appData.settings.defaultLanguage];
}

function buildPdfFileName() {
  const translation = getCurrentTranslation();
  const parts = [translation.basics?.name || "resume", translation.basics?.title || "cv"];
  return `${parts.join(" - ").replace(/[\\/:*?"<>|]+/g, "").trim() || "resume"}.pdf`;
}

async function waitForFonts() {
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font readiness issues.
    }
  }
}

async function waitForImages(root) {
  const images = [...root.querySelectorAll("img")];
  await Promise.all(
    images.map(
      async (image) => {
        if (!image.complete) {
          await new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          });
        }

        if (typeof image.decode === "function") {
          try {
            await image.decode();
          } catch {
            // Ignore decode failures and continue with the loaded bitmap.
          }
        }
      }
    )
  );
}

async function settleLayout() {
  await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
}

async function waitForPrintAssets(root) {
  await waitForFonts();
  await waitForImages(root);
  await settleLayout();
}

async function waitForSourceAssets() {
  await waitForFonts();
  await waitForImages(document);
  await settleLayout();
}

async function loadPdfLibraries() {
  if (!pdfLibrariesPromise) {
    pdfLibrariesPromise = Promise.all([
      import("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm"),
      import("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm"),
    ]).then(([html2canvasModule, jsPdfModule]) => ({
      html2canvas: html2canvasModule.default || html2canvasModule,
      jsPDF: jsPdfModule.jsPDF || jsPdfModule.default?.jsPDF,
    }));
  }

  return pdfLibrariesPromise;
}

async function exportResumePdf() {
  const button = byId("downloadPdf");
  const originalText = button?.textContent || "";
  const translation = getCurrentTranslation();

  if (button) {
    button.disabled = true;
    button.textContent = translation.meta.pdfButtonBusy || "PDF wird erstellt...";
  }

  try {
    await waitForSourceAssets();
    const root = buildPrintLayout();

    if (!root) {
      window.print();
      return;
    }

    await waitForPrintAssets(root);
    const { html2canvas, jsPDF } = await loadPdfLibraries();

    if (!html2canvas || !jsPDF) {
      throw new Error("PDF libraries unavailable");
    }

    const pages = [...root.querySelectorAll(".print-page")];
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    for (const [index, pageNode] of pages.entries()) {
      const canvas = await html2canvas(pageNode, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      if (index > 0) {
        pdf.addPage("a4", "portrait");
      }

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297, undefined, "FAST");
    }

    pdf.save(buildPdfFileName());
  } catch {
    window.print();
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalText;
    }

    teardownPrintLayout();
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
  teardownPrintLayout();

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

  const params = new URLSearchParams(window.location.search);

  bindLanguageSwitcher();

  const downloadPdf = byId("downloadPdf");
  if (downloadPdf) {
    downloadPdf.addEventListener("click", () => {
      void exportResumePdf();
    });
  }

  window.addEventListener("beforeprint", buildPrintLayout);
  window.addEventListener("afterprint", teardownPrintLayout);

  applyLanguage(getStoredLanguage());

  if (params.get("printLayout") === "1") {
    void waitForSourceAssets().then(buildPrintLayout);
  }
}

init();
