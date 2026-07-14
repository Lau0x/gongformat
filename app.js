const STORAGE_KEY = "gongformat:v1";
const DRAFTS_KEY = "gongformat:drafts:v1";
const sampleMarkdown = `## 本期标题备选

① 给宜家小灯换脑子：ESP32-C3 + WLED 就够了
② 一台能放进口袋的开源离网通讯设备
③ 这个开源鼠标，连心率血氧都能测

社区公众号记录每周值得分享的创客相关内容，每周五发布。

欢迎投稿或推荐相关内容。

投稿邮箱：\`MakerCommunity@outlook.com\`

### 给宜家小灯换脑子：ESP32-C3 + WLED 就够了

宜家的 SKAFTSÄRV 是一盏便宜的 LED 氛围灯，自带灯罩和底座，外观没什么问题，问题是控制能力太弱。这个改造项目的思路很朴素：把原来的控制板拆掉，换成一块 ESP32-C3 SuperMini，让它直接跑 WLED。

改造后的接线非常简单：灯里的三根线分别接到 GND、5V 和 ESP32 的一个数据脚。WLED 里把 LED 数量设成 30，颜色顺序设成 GRB，灯就能接入 Wi-Fi，手机 App、网页控制、Home Assistant 自动化都能用。

![图片待添加](https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80)

图注：示例图片会在公众号里显示为灰色小字

来源：\`https://example.com/project\`

### 一台能放进口袋的开源离网通讯设备

Trail Mate 把 GPS、LoRa mesh 和小屏幕塞进了一台手持设备里，目标不是替代手机，而是在没有蜂窝网络的环境里保留基本的定位和短消息能力。

这种项目有意思的地方不在“又做了一台 LoRa 设备”，而是它把外壳、供电、交互和定位都考虑进去了。对于想做户外通讯、赛事定位或者应急设备的人，这类完成度比单纯的开发板 Demo 更值得参考。

来源：\`https://example.com/trail-mate\``;

const themes = {
  weekly: {
    name: "DF 周刊",
    note: "公众号",
    swatch: "linear-gradient(135deg, #fc5b1f 0 48%, #ffffff 48% 100%)",
    accent: "#fc5b1f",
    accentSoft: "#fff3ee",
    accentLine: "#fa5c2e",
    ink: "rgba(0,0,0,0.9)",
    body: "rgba(0,0,0,0.9)",
    muted: "rgba(0,0,0,0.45)",
    soft: "#dfe2e5",
    codeBg: "#f8f3f0",
    quoteBg: "#fff6f2",
    mode: "weekly"
  },
  editorial: {
    name: "清爽正文",
    note: "长文",
    swatch: "linear-gradient(135deg, #0f7a5f 0 48%, #ffffff 48% 100%)",
    accent: "#0f7a5f",
    ink: "#1d2a26",
    soft: "#eef7f2",
    codeBg: "#f4f7f5",
    quoteBg: "#f2f7f5"
  },
  launch: {
    name: "新品发布",
    note: "产品",
    swatch: "linear-gradient(135deg, #e45c3f 0 48%, #122f45 48% 100%)",
    accent: "#e45c3f",
    ink: "#1f252c",
    soft: "#fff1ed",
    codeBg: "#f6f3f0",
    quoteBg: "#fff6f3"
  },
  maker: {
    name: "创客项目",
    note: "教程",
    swatch: "linear-gradient(135deg, #286a9b 0 48%, #f2c14e 48% 100%)",
    accent: "#286a9b",
    ink: "#172738",
    soft: "#eef6fb",
    codeBg: "#eef3f7",
    quoteBg: "#f5f9fc"
  },
  report: {
    name: "活动复盘",
    note: "展会",
    swatch: "linear-gradient(135deg, #273b34 0 48%, #8bb174 48% 100%)",
    accent: "#5c7f3a",
    ink: "#263129",
    soft: "#f2f7ee",
    codeBg: "#f0f4ee",
    quoteBg: "#f7faf5"
  }
};

const refs = {
  newDraftButton: document.getElementById("newDraftButton"),
  draftList: document.getElementById("draftList"),
  toggleDrafts: document.getElementById("toggleDrafts"),
  toggleControls: document.getElementById("toggleControls"),
  titleInput: document.getElementById("titleInput"),
  markdownInput: document.getElementById("markdownInput"),
  wechatPreview: document.getElementById("wechatPreview"),
  phoneStage: document.getElementById("phoneStage"),
  mobilePreview: document.getElementById("mobilePreview"),
  desktopPreview: document.getElementById("desktopPreview"),
  themeList: document.getElementById("themeList"),
  indentToggle: document.getElementById("indentToggle"),
  centerImageToggle: document.getElementById("centerImageToggle"),
  darkCodeToggle: document.getElementById("darkCodeToggle"),
  captionPlaceholderToggle: document.getElementById("captionPlaceholderToggle"),
  copyRich: document.getElementById("copyRich"),
  copyHtml: document.getElementById("copyHtml"),
  copyMarkdown: document.getElementById("copyMarkdown"),
  formatMarkdown: document.getElementById("formatMarkdown"),
  resetButton: document.getElementById("resetButton"),
  browseImages: document.getElementById("browseImages"),
  imageInput: document.getElementById("imageInput"),
  imageDropzone: document.getElementById("imageDropzone"),
  uploadEndpoint: document.getElementById("uploadEndpoint"),
  uploadToken: document.getElementById("uploadToken"),
  rememberUploadToken: document.getElementById("rememberUploadToken"),
  uploadFieldName: document.getElementById("uploadFieldName"),
  responsePath: document.getElementById("responsePath"),
  uploadAll: document.getElementById("uploadAll"),
  imageQueue: document.getElementById("imageQueue"),
  wordCount: document.getElementById("wordCount"),
  readTime: document.getElementById("readTime"),
  imageCount: document.getElementById("imageCount"),
  linkCount: document.getElementById("linkCount"),
  saveState: document.getElementById("saveState"),
  toast: document.getElementById("toast")
};

let state = loadState();
let drafts = loadDrafts(state);
let toastTimer;
let saveTimer;
let renderTimer;
let uploadQueue = [];
let imageCorsCache = new Map();
let syncingScroll = false;

state = applyActiveDraftToState(state);

init();

function init() {
  normalizeUploadConfig();
  renderDraftList();
  renderDraftsVisibility();
  renderControlsVisibility();
  renderPreviewMode();
  renderThemeButtons();
  refs.titleInput.value = state.title;
  refs.markdownInput.value = state.markdown;
  refs.indentToggle.checked = state.options.indent;
  refs.centerImageToggle.checked = state.options.centerImages;
  refs.darkCodeToggle.checked = state.options.darkCode;
  refs.captionPlaceholderToggle.checked = state.options.captionPlaceholder;
  refs.uploadEndpoint.value = state.upload.endpoint;
  refs.uploadToken.value = state.upload.token;
  refs.rememberUploadToken.checked = state.upload.rememberToken;
  refs.uploadFieldName.value = state.upload.fieldName;
  refs.responsePath.value = state.upload.responsePath;
  bindEvents();
  render();
  renderImageQueue();
}

function normalizeUploadConfig() {
  state.upload.fieldName = state.upload.fieldName || "image";
  state.upload.responsePath = state.upload.responsePath || "url";
  state.upload.rememberToken = Boolean(state.upload.rememberToken);
}

function loadState() {
  const defaults = {
    title: "DF 创客周刊发布稿",
    markdown: sampleMarkdown,
    theme: "weekly",
    activeDraftId: "",
    draftsOpen: false,
    settingsOpen: false,
    previewMode: "mobile",
    options: {
      indent: false,
      centerImages: true,
      darkCode: false,
      captionPlaceholder: false
    },
    upload: {
      endpoint: "",
      token: "",
      rememberToken: false,
      fieldName: "image",
      responsePath: "url"
    }
  };

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const storedUpload = stored && stored.upload ? stored.upload : {};
    const rememberToken = Boolean(storedUpload.rememberToken);
    const merged = {
      ...defaults,
      ...stored,
      options: {
        ...defaults.options,
        ...(stored && stored.options ? stored.options : {})
      },
      upload: {
        ...defaults.upload,
        ...storedUpload,
        rememberToken,
        token: rememberToken ? (storedUpload.token || "") : ""
      }
    };
    if (!stored || stored.theme === "editorial") merged.theme = "weekly";
    if (!["mobile", "desktop"].includes(merged.previewMode)) merged.previewMode = "mobile";
    return {
      ...merged,
      draftsOpen: false,
      settingsOpen: false
    };
  } catch {
    return defaults;
  }
}

function loadDrafts(currentState) {
  try {
    const stored = JSON.parse(localStorage.getItem(DRAFTS_KEY));
    if (Array.isArray(stored) && stored.length) {
      const normalized = stored.map(normalizeDraft).filter(Boolean);
      if (normalized.length) return normalized;
    }
  } catch {
  }

  return [createDraftFromState(currentState)];
}

function normalizeDraft(draft) {
  if (!draft || typeof draft !== "object") return null;

  const createdAt = draft.createdAt || Date.now();
  return {
    id: draft.id || createDraftId(),
    title: draft.title || "未命名文章",
    markdown: typeof draft.markdown === "string" ? draft.markdown : sampleMarkdown,
    theme: themes[draft.theme] ? draft.theme : "weekly",
    options: {
      indent: false,
      centerImages: true,
      darkCode: false,
      captionPlaceholder: false,
      ...(draft.options || {})
    },
    createdAt,
    updatedAt: draft.updatedAt || createdAt
  };
}

function createDraftFromState(source) {
  const now = Date.now();
  return {
    id: createDraftId(),
    title: source.title || "未命名文章",
    markdown: source.markdown || sampleMarkdown,
    theme: themes[source.theme] ? source.theme : "weekly",
    options: {
      indent: false,
      centerImages: true,
      darkCode: false,
      captionPlaceholder: false,
      ...(source.options || {})
    },
    createdAt: now,
    updatedAt: now
  };
}

function createDraftId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function applyActiveDraftToState(currentState) {
  const active = drafts.find((draft) => draft.id === currentState.activeDraftId) || drafts[0];
  currentState.activeDraftId = active.id;
  return {
    ...currentState,
    title: active.title,
    markdown: active.markdown,
    theme: active.theme,
    options: {
      ...currentState.options,
      ...active.options
    }
  };
}

function bindEvents() {
  refs.titleInput.addEventListener("input", () => {
    state.title = refs.titleInput.value;
    persistState();
  });

  refs.markdownInput.addEventListener("input", () => {
    state.markdown = refs.markdownInput.value;
    scheduleRender();
  });

  refs.indentToggle.addEventListener("change", () => updateOption("indent", refs.indentToggle.checked));
  refs.centerImageToggle.addEventListener("change", () => updateOption("centerImages", refs.centerImageToggle.checked));
  refs.darkCodeToggle.addEventListener("change", () => updateOption("darkCode", refs.darkCodeToggle.checked));
  refs.captionPlaceholderToggle.addEventListener("change", () => updateOption("captionPlaceholder", refs.captionPlaceholderToggle.checked));
  refs.copyRich.addEventListener("click", copyRichText);
  refs.copyHtml.addEventListener("click", copyHtml);
  refs.copyMarkdown.addEventListener("click", copyMarkdown);
  refs.formatMarkdown.addEventListener("click", formatCurrentMarkdown);
  refs.toggleDrafts.addEventListener("click", toggleDrafts);
  refs.toggleControls.addEventListener("click", toggleControls);
  refs.mobilePreview.addEventListener("click", () => setPreviewMode("mobile"));
  refs.desktopPreview.addEventListener("click", () => setPreviewMode("desktop"));
  refs.resetButton.addEventListener("click", resetDraft);
  refs.newDraftButton.addEventListener("click", createNewDraft);
  refs.browseImages.addEventListener("click", () => refs.imageInput.click());
  refs.imageInput.addEventListener("change", () => {
    handleImageFiles([...refs.imageInput.files]);
    refs.imageInput.value = "";
  });
  refs.uploadEndpoint.addEventListener("input", () => updateUploadConfig("endpoint", refs.uploadEndpoint.value));
  refs.uploadToken.addEventListener("input", () => updateUploadConfig("token", refs.uploadToken.value));
  refs.rememberUploadToken.addEventListener("change", () => updateUploadConfig("rememberToken", refs.rememberUploadToken.checked));
  refs.uploadFieldName.addEventListener("input", () => updateUploadConfig("fieldName", refs.uploadFieldName.value));
  refs.responsePath.addEventListener("input", () => updateUploadConfig("responsePath", refs.responsePath.value));
  refs.uploadAll.addEventListener("click", uploadAllImages);
  refs.markdownInput.addEventListener("paste", handlePasteImages);
  refs.markdownInput.addEventListener("drop", handleDropImages);
  refs.markdownInput.addEventListener("dragover", handleDragOver);
  refs.markdownInput.addEventListener("scroll", () => syncScroll(refs.markdownInput, refs.phoneStage));
  refs.phoneStage.addEventListener("scroll", () => syncScroll(refs.phoneStage, refs.markdownInput));
  refs.imageDropzone.addEventListener("drop", handleDropImages);
  refs.imageDropzone.addEventListener("dragover", handleDragOver);
  refs.imageDropzone.addEventListener("dragleave", () => refs.imageDropzone.classList.remove("is-active"));
}

function renderDraftList() {
  refs.draftList.innerHTML = "";

  drafts
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((draft) => {
      const item = document.createElement("div");
      item.className = `draft-item${draft.id === state.activeDraftId ? " is-active" : ""}`;

      const selectButton = document.createElement("button");
      selectButton.type = "button";
      selectButton.className = "draft-select";
      selectButton.innerHTML = `
        <strong>${escapeHtml(draft.title || "未命名文章")}</strong>
        <span>${formatDraftTime(draft.updatedAt)}</span>
      `;
      selectButton.addEventListener("click", () => selectDraft(draft.id));

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "draft-delete";
      deleteButton.textContent = "删";
      deleteButton.title = "删除草稿";
      deleteButton.setAttribute("aria-label", `删除${draft.title || "未命名文章"}`);
      deleteButton.addEventListener("click", () => deleteDraft(draft.id));

      item.appendChild(selectButton);
      item.appendChild(deleteButton);
      refs.draftList.appendChild(item);
    });
}

function renderDraftsVisibility() {
  document.body.classList.toggle("drafts-open", Boolean(state.draftsOpen));
  refs.toggleDrafts.textContent = state.draftsOpen ? "收起草稿" : "草稿";
  refs.toggleDrafts.classList.toggle("is-active", Boolean(state.draftsOpen));
  refs.toggleDrafts.setAttribute("aria-expanded", String(Boolean(state.draftsOpen)));
}

function toggleDrafts() {
  state.draftsOpen = !state.draftsOpen;
  renderDraftsVisibility();
}

function renderControlsVisibility() {
  document.body.classList.toggle("controls-open", Boolean(state.settingsOpen));
  refs.toggleControls.textContent = state.settingsOpen ? "收起设置" : "设置";
}

function toggleControls() {
  state.settingsOpen = !state.settingsOpen;
  renderControlsVisibility();
}

function renderPreviewMode() {
  const isDesktop = state.previewMode === "desktop";
  refs.phoneStage.classList.toggle("is-desktop", isDesktop);
  refs.mobilePreview.classList.toggle("is-active", !isDesktop);
  refs.desktopPreview.classList.toggle("is-active", isDesktop);
  refs.mobilePreview.setAttribute("aria-pressed", String(!isDesktop));
  refs.desktopPreview.setAttribute("aria-pressed", String(isDesktop));
}

function setPreviewMode(mode) {
  if (!["mobile", "desktop"].includes(mode) || state.previewMode === mode) return;
  state.previewMode = mode;
  renderPreviewMode();
  syncScroll(refs.markdownInput, refs.phoneStage);
  persistState();
}

function selectDraft(id) {
  if (id === state.activeDraftId) return;

  clearTimeout(saveTimer);
  persistNow();
  const draft = drafts.find((item) => item.id === id);
  if (!draft) return;

  state = {
    ...state,
    activeDraftId: draft.id,
    title: draft.title,
    markdown: draft.markdown,
    theme: draft.theme,
    options: {
      ...state.options,
      ...draft.options
    }
  };

  syncInputsFromState();
  refs.markdownInput.scrollTop = 0;
  refs.phoneStage.scrollTop = 0;
  renderThemeButtons();
  renderDraftList();
  render();
}

function deleteDraft(id) {
  const draft = drafts.find((item) => item.id === id);
  if (!draft) return;
  if (drafts.length === 1) {
    showToast("至少保留一篇草稿");
    return;
  }
  if (!window.confirm(`确定删除“${draft.title || "未命名文章"}”吗？`)) return;

  clearTimeout(saveTimer);
  persistNow();
  drafts = drafts.filter((item) => item.id !== id);

  if (id === state.activeDraftId) {
    const next = drafts.slice().sort((a, b) => b.updatedAt - a.updatedAt)[0];
    state = {
      ...state,
      activeDraftId: next.id,
      title: next.title,
      markdown: next.markdown,
      theme: next.theme,
      options: {
        ...state.options,
        ...next.options
      }
    };
    syncInputsFromState();
    refs.markdownInput.scrollTop = 0;
    refs.phoneStage.scrollTop = 0;
    renderThemeButtons();
    render();
  } else {
    renderDraftList();
  }

  clearTimeout(saveTimer);
  persistNow();
  showToast("草稿已删除");
}

function createNewDraft() {
  clearTimeout(saveTimer);
  persistNow();

  const draft = createDraftFromState({
    title: `DF 创客周刊草稿 ${drafts.length + 1}`,
    markdown: sampleMarkdown,
    theme: "weekly",
    options: {
      indent: false,
      centerImages: true,
      darkCode: false,
      captionPlaceholder: false
    }
  });
  drafts.unshift(draft);

  state = {
    ...state,
    activeDraftId: draft.id,
    title: draft.title,
    markdown: draft.markdown,
    theme: draft.theme,
    options: draft.options
  };

  syncInputsFromState();
  refs.markdownInput.scrollTop = 0;
  refs.phoneStage.scrollTop = 0;
  renderThemeButtons();
  renderDraftList();
  render();
  showToast("已新增草稿");
}

function syncInputsFromState() {
  refs.titleInput.value = state.title;
  refs.markdownInput.value = state.markdown;
  refs.indentToggle.checked = state.options.indent;
  refs.centerImageToggle.checked = state.options.centerImages;
  refs.darkCodeToggle.checked = state.options.darkCode;
  refs.captionPlaceholderToggle.checked = state.options.captionPlaceholder;
}

function formatDraftTime(value) {
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function renderThemeButtons() {
  refs.themeList.innerHTML = "";

  Object.entries(themes).forEach(([id, theme]) => {
    const button = document.createElement("button");
    button.className = `theme-card${state.theme === id ? " is-active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <span class="theme-swatch" style="background:${theme.swatch}"></span>
      <span class="theme-meta">
        <strong>${theme.name}</strong>
        <span>${theme.note}</span>
      </span>
    `;
    button.addEventListener("click", () => {
      state.theme = id;
      renderThemeButtons();
      render();
    });
    refs.themeList.appendChild(button);
  });
}

function updateOption(key, value) {
  state.options[key] = value;
  render();
}

function updateUploadConfig(key, value) {
  state.upload[key] = value;
  normalizeUploadConfig();
  refs.rememberUploadToken.checked = state.upload.rememberToken;
  refs.uploadFieldName.value = state.upload.fieldName;
  refs.responsePath.value = state.upload.responsePath;
  persistState();
}

function formatCurrentMarkdown() {
  const formatted = formatMarkdownSpacing(state.markdown);
  if (formatted === state.markdown) {
    showToast("已是整理后的格式");
    return;
  }

  state.markdown = formatted;
  refs.markdownInput.value = formatted;
  render();
  showToast("已整理中英文空格");
}

function formatMarkdownSpacing(markdown) {
  return markdown
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g)
    .map((segment, index) => index % 2 ? segment : formatMarkdownTextSegment(segment))
    .join("");
}

function formatMarkdownTextSegment(text) {
  const protectedValues = [];
  const protect = (match) => {
    const token = `\u0000${protectedValues.length}\u0000`;
    protectedValues.push(match);
    return token;
  };

  let output = text
    .replace(/`[^`\n]*`/g, protect)
    .replace(/https?:\/\/[^\s)>"']+/g, protect);

  output = output
    .replace(/([\u2e80-\u9fff])([A-Za-z0-9])/g, "$1 $2")
    .replace(/([A-Za-z0-9])([\u2e80-\u9fff])/g, "$1 $2")
    .replace(/([\u2e80-\u9fff])([&%@#][A-Za-z0-9])/g, "$1 $2")
    .replace(/([A-Za-z0-9][&%@#]?)([\u2e80-\u9fff])/g, "$1 $2")
    .replace(/[ \t]+$/gm, "");

  return output.replace(/\u0000(\d+)\u0000/g, (match, index) => protectedValues[Number(index)] || match);
}

function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => {
    renderTimer = null;
    render();
  }, 80);
}

function flushScheduledRender() {
  if (!renderTimer) return;
  clearTimeout(renderTimer);
  renderTimer = null;
  render();
}

function render() {
  if (renderTimer) {
    clearTimeout(renderTimer);
    renderTimer = null;
  }

  const imageQueueChanged = pruneUnusedImageItems();
  const source = markdownToHtml(getRenderableMarkdown(state.markdown));
  const cleaned = sanitizeHtml(source);
  const theme = themes[state.theme];
  applyImageCaptions(cleaned);
  applyWechatStyles(cleaned, theme, state.options);
  wrapWechatContent(cleaned, theme);
  refs.wechatPreview.innerHTML = cleaned.innerHTML;
  renderStats();
  persistState();
  syncScroll(refs.markdownInput, refs.phoneStage);
  if (imageQueueChanged) renderImageQueue();
}

function wrapWechatContent(root, theme) {
  const wrapper = root.ownerDocument.createElement("section");
  wrapper.setAttribute("data-wechat-content-frame", "true");
  wrapper.style.cssText = toStyle({
    margin: "0",
    padding: theme.mode === "weekly" ? "0 12px" : "0",
    boxSizing: "border-box"
  });

  while (root.firstChild) {
    wrapper.appendChild(root.firstChild);
  }

  root.appendChild(wrapper);
}

function syncScroll(source, target) {
  if (syncingScroll) return;

  const sourceMax = source.scrollHeight - source.clientHeight;
  const targetMax = target.scrollHeight - target.clientHeight;
  if (sourceMax <= 0 || targetMax <= 0) return;

  syncingScroll = true;
  target.scrollTop = (source.scrollTop / sourceMax) * targetMax;
  requestAnimationFrame(() => {
    syncingScroll = false;
  });
}

function getRenderableMarkdown(markdown) {
  return markdown.replace(/!\[([^\]]*)]\(uploading:\/\/([^\s)]+)([^)]*)\)/g, (match, alt, id, suffix) => {
    const item = uploadQueue.find((entry) => entry.id === id);
    const url = item && (item.remoteUrl || item.previewUrl);
    return url ? `![${alt}](${url}${suffix})` : match;
  });
}

function markdownToHtml(markdown) {
  if (window.marked) {
    marked.use({ gfm: true, breaks: false });
    return marked.parse(markdown);
  }

  return fallbackMarkdown(markdown);
}

function fallbackMarkdown(markdown) {
  const blocks = markdown.split(/\n{2,}/);
  return blocks.map((block) => {
    const text = block.trim();
    if (!text) return "";
    if (/^```/.test(text)) return renderCodeBlock(text);
    if (isMarkdownTable(text)) return renderMarkdownTable(text);
    if (/^### /.test(text)) return `<h3>${inlineMarkdown(text.slice(4))}</h3>`;
    if (/^## /.test(text)) return `<h2>${inlineMarkdown(text.slice(3))}</h2>`;
    if (/^# /.test(text)) return `<h1>${inlineMarkdown(text.slice(2))}</h1>`;
    if (/^> /.test(text)) return `<blockquote>${inlineMarkdown(text.replace(/^> /gm, ""))}</blockquote>`;
    if (/^[-*] /.test(text)) {
      return `<ul>${text.split("\n").map((line) => `<li>${inlineMarkdown(line.replace(/^[-*] /, ""))}</li>`).join("")}</ul>`;
    }
    if (/^\d+[.)] /.test(text)) {
      return `<ol>${text.split("\n").map((line) => `<li>${inlineMarkdown(line.replace(/^\d+[.)] /, ""))}</li>`).join("")}</ol>`;
    }
    return `<p>${inlineMarkdown(text)}</p>`;
  }).join("");
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, target) => {
      const url = extractInlineMarkdownUrl(target);
      return url ? `<img alt="${alt}" src="${url}">` : match;
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, target) => {
      const url = extractInlineMarkdownUrl(target);
      return url ? `<a href="${url}">${label}</a>` : match;
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function extractInlineMarkdownUrl(target) {
  const trimmed = target.trim();
  const bracketed = trimmed.match(/^&lt;(.+?)&gt;/);
  if (bracketed) return bracketed[1];

  const match = trimmed.match(/^(\S+)/);
  return match ? match[1] : "";
}

function renderCodeBlock(text) {
  const match = text.match(/^```([^\n]*)\n?([\s\S]*?)\n?```$/);
  const lang = match && match[1] ? match[1].trim().replace(/[^\w-]/g, "") : "";
  const code = match ? match[2] : text.replace(/^```[^\n]*\n?|\n?```$/g, "");
  return `<pre><code${lang ? ` class="language-${lang}"` : ""}>${escapeHtml(code)}</code></pre>`;
}

function isMarkdownTable(text) {
  const lines = text.split("\n");
  return lines.length > 2 && lines[0].includes("|") && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[1]);
}

function renderMarkdownTable(text) {
  const lines = text.split("\n").filter((line) => line.trim());
  const headers = splitTableRow(lines[0]);
  const rows = lines.slice(2).map(splitTableRow);
  return `<table><thead><tr>${headers.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function splitTableRow(line) {
  return line.replace(/^\s*\|?|\|?\s*$/g, "").split("|").map((cell) => cell.trim());
}

function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, iframe, object, embed").forEach((node) => node.remove());

  doc.body.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();

      if (name.startsWith("on")) node.removeAttribute(attr.name);
      if ((name === "href" || name === "src") && !/^(https?:|mailto:|#|\/|blob:|data:image\/)/i.test(value)) {
        node.removeAttribute(attr.name);
      }
    });
  });

  return doc.body;
}

function applyImageCaptions(root) {
  [...root.querySelectorAll("p")].forEach((paragraph) => {
    if (!paragraph.isConnected) return;

    const images = paragraph.querySelectorAll("img");
    if (images.length !== 1) return;

    const image = images[0];
    const inlineCaption = parseCaptionText(textWithoutImages(paragraph));

    if (inlineCaption) {
      paragraph.replaceWith(createImageFigure(root, image, inlineCaption));
      return;
    }

    if (textWithoutImages(paragraph)) return;

    const next = paragraph.nextElementSibling;
    if (!next || next.tagName !== "P") return;

    const nextCaption = parseCaptionText(next.textContent || "");
    if (!nextCaption) return;

    paragraph.replaceWith(createImageFigure(root, image, nextCaption));
    next.remove();
  });
}

function textWithoutImages(node) {
  const clone = node.cloneNode(true);
  clone.querySelectorAll("img").forEach((image) => image.remove());
  return normalizeCaptionText(clone.textContent || "");
}

function parseCaptionText(text) {
  const match = normalizeCaptionText(text).match(/^(?:图注|图片说明|说明|caption)\s*[：:]\s*(.+)$/i);
  return match ? match[1].trim() : "";
}

function normalizeCaptionText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function createImageFigure(root, image, caption) {
  const figure = root.ownerDocument.createElement("figure");
  const figcaption = root.ownerDocument.createElement("figcaption");

  figcaption.textContent = caption;
  figure.appendChild(image);
  figure.appendChild(figcaption);
  return figure;
}

function handlePasteImages(event) {
  const items = event.clipboardData ? [...event.clipboardData.items] : [];
  const files = items
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter(Boolean);

  if (hasImageFiles(files)) {
    event.preventDefault();
    handleImageFiles(files);
    return;
  }

  const pastedMarkdown = event.clipboardData ? event.clipboardData.getData("text/plain") : "";
  const remoteImages = queueRemoteImagesFromMarkdown(pastedMarkdown);
  if (remoteImages.count) {
    event.preventDefault();
    insertAtCursor(remoteImages.markdown);
    render();
    renderImageQueue();

    if (state.upload.endpoint.trim()) {
      uploadAllImages();
    } else {
      showToast(`已识别 ${remoteImages.count} 张远程图`);
    }
  }
}

function queueRemoteImagesFromMarkdown(markdown) {
  if (!markdown) return { markdown, count: 0 };

  const queuedByUrl = new Map();
  let count = 0;
  const transformed = markdown.replace(/!\[([^\]]*)]\(([^)\n]+)\)/g, (match, alt, target) => {
    const url = extractRemoteMarkdownImageUrl(target);
    if (!url || isImageFromUploadHost(url)) return match;

    let item = queuedByUrl.get(url);
    if (!item) {
      item = queueRemoteImageUrl(url, alt);
      queuedByUrl.set(url, item);
      count += 1;
    }

    return match.replace(url, `uploading://${item.id}`);
  });

  return { markdown: transformed, count };
}

function extractRemoteMarkdownImageUrl(target) {
  const match = target.trim().match(/^<?(https?:\/\/[^\s>]+)>?/i);
  return match ? match[1] : "";
}

function isImageFromUploadHost(url) {
  const endpoint = state.upload.endpoint.trim();
  if (!endpoint) return false;

  try {
    return new URL(url).hostname === new URL(endpoint).hostname;
  } catch {
    return false;
  }
}

function queueRemoteImageUrl(url, alt) {
  const id = createId();
  const item = {
    id,
    file: null,
    name: alt.trim() ? cleanAltText(alt) : getRemoteImageName(url),
    sourceUrl: url,
    previewUrl: url,
    remoteUrl: "",
    status: "queued",
    error: "",
    progress: 0
  };

  uploadQueue.push(item);
  return item;
}

function handleDropImages(event) {
  const files = event.dataTransfer ? [...event.dataTransfer.files] : [];

  if (hasImageFiles(files)) {
    event.preventDefault();
    refs.imageDropzone.classList.remove("is-active");
    handleImageFiles(files);
  }
}

function handleDragOver(event) {
  event.preventDefault();
  refs.imageDropzone.classList.add("is-active");
}

function hasImageFiles(files) {
  return files.some((file) => file && file.type && file.type.startsWith("image/"));
}

function handleImageFiles(files) {
  const images = files.filter((file) => file && file.type && file.type.startsWith("image/"));
  if (!images.length) return;

  images.forEach(queueImageFile);
  render();
  renderImageQueue();

  if (state.upload.endpoint.trim()) {
    uploadAllImages();
  } else {
    showToast("已加入待上传");
  }
}

function queueImageFile(file) {
  const id = createId();
  const previewUrl = URL.createObjectURL(file);
  const item = {
    id,
    file,
    sourceUrl: "",
    previewUrl,
    remoteUrl: "",
    status: "queued",
    error: "",
    progress: 0
  };

  uploadQueue.push(item);
  insertAtCursor(buildInsertedImageMarkdown(cleanAltText(file.name), `uploading://${id}`));
}

function releaseImagePreview(item) {
  if (!item.previewUrl || !item.previewUrl.startsWith("blob:")) return;
  URL.revokeObjectURL(item.previewUrl);
  item.previewUrl = "";
}

function pruneUnusedImageItems() {
  const otherDraftMarkdown = drafts
    .filter((draft) => draft.id !== state.activeDraftId)
    .map((draft) => draft.markdown);
  const markdownSources = [state.markdown, ...otherDraftMarkdown];
  const previousLength = uploadQueue.length;

  uploadQueue = uploadQueue.filter((item) => {
    const placeholder = `uploading://${item.id}`;
    const referenced = markdownSources.some((markdown) => markdown.includes(placeholder));
    const active = item.status === "fetching" || item.status === "uploading";

    if (referenced || active || item.status === "done") return true;
    releaseImagePreview(item);
    return false;
  });

  return uploadQueue.length !== previousLength;
}

function buildInsertedImageMarkdown(alt, url) {
  const caption = state.options.captionPlaceholder ? "\n\n*图注待补*" : "";
  return `\n\n![${alt}](${url})${caption}\n\n`;
}

function insertAtCursor(text) {
  const input = refs.markdownInput;
  const start = input.selectionStart;
  const end = input.selectionEnd;

  state.markdown = `${state.markdown.slice(0, start)}${text}${state.markdown.slice(end)}`;
  input.value = state.markdown;
  input.focus();
  input.selectionStart = start + text.length;
  input.selectionEnd = start + text.length;
}

async function uploadAllImages() {
  const pending = uploadQueue.filter((item) => {
    return item.status !== "done" && state.markdown.includes(`uploading://${item.id}`);
  });

  if (!pending.length) {
    showToast("没有待上传图片");
    return true;
  }

  if (!state.upload.endpoint.trim()) {
    showToast("先填上传接口");
    return false;
  }

  for (const item of pending) {
    await uploadImageItem(item);
  }

  return pending.every((item) => item.status === "done");
}

async function uploadImageItem(item) {
  try {
    if (!item.file && item.sourceUrl) {
      await fetchRemoteImageItem(item);
    }

    item.status = "uploading";
    item.error = "";
    item.progress = 0;
    renderImageQueue();

    const form = new FormData();
    form.append(state.upload.fieldName.trim() || "image", item.file, getImageName(item));

    const headers = {};
    const token = state.upload.token.trim();
    if (token) {
      form.append("token", token);
      headers.Authorization = /^(bearer|basic|token)\s/i.test(token) ? token : `Bearer ${token}`;
    }

    const response = await sendUploadRequest(form, headers, (progress) => {
      item.progress = progress;
      renderImageQueue();
    });
    const payload = parseUploadResponse(response.text);

    if (response.status < 200 || response.status >= 300) {
      throw new Error(typeof payload === "string" ? payload : response.statusText);
    }

    const uploadedUrl = resolveUploadUrl(extractUploadedUrl(payload), state.upload.endpoint.trim());
    if (!/^https?:\/\//i.test(uploadedUrl)) {
      throw new Error("上传响应里没有公网图片地址");
    }

    item.name = getImageName(item);
    item.remoteUrl = uploadedUrl;
    releaseImagePreview(item);
    item.file = null;
    item.status = "done";
    item.progress = 100;
    item.corsOk = await testImageCors(uploadedUrl);
    replaceImagePlaceholder(item.id, uploadedUrl);
    render();
    showToast(item.corsOk ? "图片已上传" : "图床缺少跨域头");
  } catch (error) {
    item.status = "error";
    item.error = error.message || "上传失败";
    item.progress = 0;
    showToast("图片上传失败");
  }

  renderImageQueue();
}

async function fetchRemoteImageItem(item) {
  item.status = "fetching";
  item.error = "";
  item.progress = 0;
  renderImageQueue();

  try {
    const response = await fetch(item.sourceUrl);
    if (!response.ok) throw new Error(response.statusText || "远程图片读取失败");

    const blob = await response.blob();
    if (blob.type && !blob.type.startsWith("image/")) {
      throw new Error("远程地址不是图片");
    }

    const name = ensureImageExtension(getImageName(item), blob.type);
    item.file = new File([blob], name, { type: blob.type || "image/jpeg" });
    item.name = name;
  } catch (error) {
    item.status = "error";
    item.error = error.message === "Failed to fetch"
      ? "远程图片无法读取，可能限制跨域"
      : (error.message || "远程图片读取失败");
    renderImageQueue();
    throw new Error(item.error);
  }
}

function sendUploadRequest(form, headers, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", state.upload.endpoint.trim());

    Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.min(98, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      onProgress(100);
      resolve({
        status: xhr.status,
        statusText: xhr.statusText,
        text: xhr.responseText
      });
    };
    xhr.onerror = () => reject(new Error("上传请求失败"));
    xhr.send(form);
  });
}

function parseUploadResponse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractUploadedUrl(payload) {
  const path = state.upload.responsePath.trim();
  if (path && path !== "auto" && typeof payload === "object" && payload) {
    const value = path.split(".").reduce((current, key) => current && current[key], payload);
    if (typeof value === "string") return value;
  }

  if (typeof payload === "string") {
    const match = payload.match(/https?:\/\/[^\s"'<>]+/i);
    return match ? match[0] : "";
  }

  const knownPaths = ["url", "src", "href", "data.url", "data.src", "data.href", "image.url", "links.url"];
  for (const knownPath of knownPaths) {
    const value = knownPath.split(".").reduce((current, key) => current && current[key], payload);
    if (typeof value === "string" && value) return value;
  }

  return findFirstUrl(payload);
}

function findFirstUrl(value) {
  if (!value) return "";
  if (typeof value === "string" && /^https?:\/\//i.test(value)) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = findFirstUrl(item);
      if (url) return url;
    }
  }
  if (typeof value === "object") {
    for (const item of Object.values(value)) {
      const url = findFirstUrl(item);
      if (url) return url;
    }
  }
  return "";
}

function resolveUploadUrl(url, endpoint) {
  if (!url) return "";
  try {
    return new URL(url, endpoint).href;
  } catch {
    return url;
  }
}

function replaceImagePlaceholder(id, url) {
  state.markdown = state.markdown.split(`uploading://${id}`).join(url);
  refs.markdownInput.value = state.markdown;
}

function renderImageQueue() {
  refs.imageQueue.innerHTML = "";

  uploadQueue.slice().reverse().forEach((item) => {
    const row = document.createElement("div");
    row.className = `image-item is-${item.status}`;
    const image = document.createElement("img");
    image.src = item.remoteUrl || item.previewUrl;
    image.alt = "";
    row.innerHTML = `
      <span class="image-item-main">
        <strong>${escapeHtml(getImageName(item))}</strong>
        <span>${escapeHtml(getImageMeta(item))}</span>
        ${renderImageProgress(item)}
      </span>
      ${renderImageStatus(item)}
    `;
    row.prepend(image);
    refs.imageQueue.appendChild(row);
  });

  refs.imageQueue.querySelectorAll("[data-upload-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = uploadQueue.find((entry) => entry.id === button.dataset.uploadId);
      if (item) uploadImageItem(item);
    });
  });
}

function renderImageStatus(item) {
  if (item.status === "done" && item.corsOk === false) {
    return `<span class="image-status warning">跨域</span>`;
  }

  if (item.status === "done" && isWechatRiskyImageUrl(item.remoteUrl)) {
    return `<span class="image-status warning">WebP</span>`;
  }

  const labels = {
    queued: "待传",
    fetching: "读取中",
    uploading: "上传中",
    done: "完成",
    error: "重试"
  };

  if (item.status === "done" || item.status === "uploading" || item.status === "fetching") {
    return `<span class="image-status ${item.status}">${labels[item.status]}</span>`;
  }

  return `<button class="image-status ${item.status}" type="button" data-upload-id="${item.id}">${labels[item.status]}</button>`;
}

function renderImageProgress(item) {
  if (item.status !== "uploading" && item.status !== "fetching") return "";
  const progress = item.status === "fetching" ? 18 : Math.max(3, item.progress || 0);
  return `<span class="image-progress"><span style="width:${progress}%"></span></span>`;
}

function getImageMeta(item) {
  if (item.status === "error") return item.error;
  if (item.status === "fetching") return "读取远程图片";
  if (item.status === "uploading") return `上传 ${item.progress || 0}%`;
  if (item.remoteUrl) return item.remoteUrl;
  if (item.sourceUrl) return item.sourceUrl;
  return item.file ? formatBytes(item.file.size) : "待上传";
}

function formatBytes(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function cleanAltText(value) {
  return value.replace(/\.[^.]+$/, "").replace(/[[\]()\n\r]/g, " ").trim() || "image";
}

function getImageName(item) {
  if (item.name) return item.name;
  if (item.file && item.file.name) return item.file.name;
  if (item.sourceUrl) return getRemoteImageName(item.sourceUrl);
  return "image";
}

function getRemoteImageName(url) {
  try {
    const pathname = new URL(url).pathname;
    const filename = decodeURIComponent(pathname.split("/").pop() || "");
    return cleanFileName(filename) || "image";
  } catch {
    return "image";
  }
}

function cleanFileName(value) {
  return value.replace(/[\\/:*?"<>|\[\]\n\r]+/g, " ").trim();
}

function ensureImageExtension(name, type) {
  if (/\.[a-z0-9]{2,5}$/i.test(name)) return name;

  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg"
  };
  const extension = extensions[type] || "jpg";
  return `${name}.${extension}`;
}

function createId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function prepareImagesForCopy() {
  const pending = uploadQueue.some((item) => {
    return item.status !== "done" && state.markdown.includes(`uploading://${item.id}`);
  });

  if (pending) {
    const uploaded = await uploadAllImages();
    if (!uploaded) return false;
  }

  if (hasBlockingImageRefs()) {
    showToast("还有图片未上传");
    return false;
  }

  if (hasWechatRiskyImageRefs()) {
    showToast("WebP 图公众号会失败");
    return false;
  }

  if (await hasWechatCorsRiskImageRefs()) {
    showToast("图床缺少跨域头");
    return false;
  }

  return true;
}

function hasBlockingImageRefs() {
  return [...state.markdown.matchAll(/!\[[^\]]*]\(([^)]+)\)/g)].some((match) => {
    return !extractRemoteMarkdownImageUrl(match[1]);
  });
}

function hasWechatRiskyImageRefs() {
  return [...state.markdown.matchAll(/!\[[^\]]*]\(([^)]+)\)/g)].some((match) => {
    return isWechatRiskyImageUrl(extractRemoteMarkdownImageUrl(match[1]));
  });
}

function isWechatRiskyImageUrl(value) {
  if (!value) return false;

  let pathname;
  try {
    pathname = new URL(value).pathname;
  } catch {
    pathname = value.trim().split(/[?#]/)[0];
  }

  const normalized = pathname.toLowerCase();
  return normalized.endsWith(".webp") || normalized.endsWith(".svg");
}

async function hasWechatCorsRiskImageRefs() {
  const urls = [...state.markdown.matchAll(/!\[[^\]]*]\(([^)]+)\)/g)]
    .map((match) => extractRemoteMarkdownImageUrl(match[1]))
    .filter(Boolean);

  refs.wechatPreview.querySelectorAll("img").forEach((image) => {
    const url = image.currentSrc || image.src;
    if (/^https?:\/\//i.test(url)) urls.push(url);
  });

  for (const url of [...new Set(urls)]) {
    const queued = uploadQueue.find((item) => item.remoteUrl === url);
    if (queued && queued.corsOk === true) continue;
    const corsOk = await testImageCors(url);
    if (queued) {
      queued.corsOk = corsOk;
      renderImageQueue();
    }
    if (!corsOk) return true;
  }

  return false;
}

function testImageCors(url) {
  if (imageCorsCache.has(url)) return imageCorsCache.get(url);

  const result = fetch(url, {
    method: "HEAD",
    mode: "cors",
    cache: "no-store"
  })
    .then((response) => response.ok ? true : testImageElementCors(url))
    .catch(() => testImageElementCors(url));

  imageCorsCache.set(url, result);
  return result;
}

function testImageElementCors(url) {
  return new Promise((resolve) => {
    const image = new Image();
    const timer = setTimeout(() => resolve(false), 12000);

    image.crossOrigin = "anonymous";
    image.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    image.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    image.src = url;
  });
}

function applyWechatStyles(root, theme, options) {
  const isWeekly = theme.mode === "weekly";
  const baseFont = isWeekly
    ? "-apple-system-font, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif"
    : "-apple-system, system-ui, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif";
  const codeBg = options.darkCode ? "#1f252c" : theme.codeBg;
  const codeInk = options.darkCode ? "#f7faf8" : (isWeekly ? theme.accent : theme.ink);
  const bodyColor = theme.body || theme.ink;
  const mutedColor = theme.muted || "#8a8f8c";

  const styles = {
    h1: {
      margin: isWeekly ? "34px 0 22px" : "28px 0 18px",
      padding: isWeekly ? "0 0 9px" : "0",
      borderBottom: isWeekly ? `2px solid ${theme.accent}` : "0",
      color: theme.ink,
      fontSize: isWeekly ? "23px" : "24px",
      lineHeight: isWeekly ? "1.5" : "1.42",
      fontWeight: "700",
      textAlign: "left",
      fontFamily: baseFont
    },
    h2: {
      margin: isWeekly ? "32px 0 16px" : "30px 0 16px",
      padding: "0 0 0 9px",
      borderBottom: "0",
      borderLeft: `4px solid ${theme.accent}`,
      color: theme.ink,
      fontSize: isWeekly ? "20px" : "21px",
      lineHeight: isWeekly ? "1.42" : "1.42",
      fontWeight: "700",
      fontFamily: baseFont
    },
    h3: {
      margin: isWeekly ? "28px 0 14px" : "26px 0 12px",
      padding: "0",
      color: isWeekly ? theme.ink : theme.accent,
      fontSize: isWeekly ? "18px" : "18px",
      lineHeight: isWeekly ? "1.5" : "1.45",
      fontWeight: "700",
      display: "block",
      borderLeft: "0",
      borderBottom: "0",
      fontFamily: baseFont
    },
    p: {
      margin: isWeekly ? "0 0 14px" : "0 0 16px",
      color: bodyColor,
      fontSize: "16px",
      lineHeight: isWeekly ? "28px" : "1.82",
      textAlign: isWeekly ? "justify" : "left",
      textAlignLast: "left",
      letterSpacing: "0px",
      wordSpacing: "0px",
      textIndent: options.indent ? "2em" : "0",
      fontFamily: baseFont
    },
    blockquote: {
      margin: isWeekly ? "18px 0 20px" : "22px 0",
      padding: "14px 16px",
      borderLeft: `4px solid ${theme.accent}`,
      background: theme.quoteBg,
      color: isWeekly ? "rgba(0,0,0,0.75)" : "#4d5a55",
      fontSize: isWeekly ? "15px" : "15px",
      lineHeight: isWeekly ? "26px" : "1.75",
      fontFamily: baseFont
    },
    ul: {
      margin: isWeekly ? "0 0 16px" : "0 0 18px",
      padding: "0 0 0 22px",
      color: bodyColor,
      fontSize: "16px",
      lineHeight: isWeekly ? "28px" : "1.78",
      fontFamily: baseFont
    },
    ol: {
      margin: isWeekly ? "0 0 16px" : "0 0 18px",
      padding: "0 0 0 22px",
      color: bodyColor,
      fontSize: "16px",
      lineHeight: isWeekly ? "28px" : "1.78",
      fontFamily: baseFont
    },
    li: {
      margin: isWeekly ? "4px 0" : "7px 0",
      color: bodyColor,
      fontSize: "16px",
      lineHeight: isWeekly ? "28px" : "1.78",
      fontFamily: baseFont
    },
    a: {
      color: theme.accent,
      textDecoration: "none",
      borderBottom: `1px solid ${theme.accent}`
    },
    strong: {
      color: theme.accent,
      fontWeight: "700"
    },
    em: {
      color: isWeekly ? "rgba(0,0,0,0.75)" : "#4d5a55",
      fontStyle: "italic"
    },
    img: {
      display: "block",
      maxWidth: "100%",
      height: "auto",
      margin: options.centerImages ? "18px auto" : "18px 0",
      borderRadius: isWeekly ? "4px" : "6px"
    },
    figure: {
      margin: "0",
      padding: "0",
      textAlign: options.centerImages ? "center" : "left"
    },
    figcaption: {
      margin: "-6px 0 18px",
      color: mutedColor,
      fontSize: isWeekly ? "12px" : "13px",
      lineHeight: isWeekly ? "20px" : "22px",
      textAlign: "center",
      fontFamily: baseFont
    },
    pre: {
      margin: "22px 0",
      padding: "14px",
      borderRadius: "6px",
      background: codeBg,
      color: codeInk,
      overflowX: "auto",
      fontSize: "13px",
      lineHeight: "1.65",
      fontFamily: "Menlo, Monaco, Consolas, monospace"
    },
    code: {
      padding: isWeekly ? "0 2px" : "2px 5px",
      borderRadius: isWeekly ? "0" : "4px",
      background: isWeekly ? "transparent" : codeBg,
      color: codeInk,
      fontSize: "90%",
      fontFamily: "Menlo, Monaco, Consolas, monospace",
      letterSpacing: "0px",
      wordSpacing: "0px"
    },
    hr: {
      border: "0",
      borderTop: `1px solid ${theme.soft}`,
      margin: "28px 0"
    },
    table: {
      width: "100%",
      margin: "20px 0",
      borderCollapse: "collapse",
      fontSize: "14px",
      lineHeight: "1.6"
    },
    th: {
      border: `1px solid ${theme.soft}`,
      background: isWeekly ? theme.accentSoft : theme.soft,
      padding: "8px",
      color: theme.ink,
      fontWeight: "700"
    },
    td: {
      border: `1px solid ${theme.soft}`,
      padding: "8px",
      color: theme.ink
    }
  };

  root.style.cssText = toStyle({
    fontFamily: baseFont,
    color: bodyColor,
    fontSize: "16px",
    lineHeight: isWeekly ? "28px" : "1.78",
    letterSpacing: "0px",
    wordSpacing: "0px",
    wordBreak: "break-all"
  });

  Object.entries(styles).forEach(([selector, style]) => {
    root.querySelectorAll(selector).forEach((node) => {
      node.style.cssText = toStyle(style);
    });
  });

  if (isWeekly) {
    root.querySelectorAll("p").forEach((node) => {
      const text = node.innerText.trim();
      const shouldKeepLeft = /^(来源|项目地址|投稿邮箱|链接|网址)\s*[：:]/.test(text)
        || /https?:\/\//i.test(text)
        || node.querySelector("code, a");

      if (shouldKeepLeft) {
        node.style.textAlign = "left";
        node.style.textAlignLast = "left";
      }
    });
  }

  root.querySelectorAll("pre code").forEach((node) => {
    node.style.cssText = "padding:0;border-radius:0;background:transparent;color:inherit;font-size:inherit;font-family:inherit;";
  });

  decorateCodeBlocks(root);

  root.querySelectorAll("blockquote p").forEach((node) => {
    node.style.margin = "0";
    node.style.color = "inherit";
    node.style.fontSize = "inherit";
    node.style.lineHeight = "inherit";
    node.style.textIndent = "0";
  });

  styleCaptionPlaceholders(root, styles.figcaption);
}

function styleCaptionPlaceholders(root, captionStyle) {
  root.querySelectorAll("p").forEach((node) => {
    if (node.textContent.trim() !== "图注待补") return;
    if (!node.querySelector("em")) return;

    const previous = node.previousElementSibling;
    const followsImage = previous && (previous.matches("img") || previous.querySelector("img"));
    if (!followsImage) return;

    node.style.cssText = toStyle(captionStyle);
    node.querySelectorAll("em").forEach((em) => {
      em.style.cssText = "color:inherit;font-style:normal;";
    });
  });
}

function decorateCodeBlocks(root) {
  root.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code) return;

    const wrapper = root.ownerDocument.createElement("section");
    const bar = root.ownerDocument.createElement("section");

    wrapper.style.cssText = toStyle({
      margin: "24px 0",
      borderRadius: "8px",
      background: "#272c34",
      boxShadow: "0 14px 30px rgba(29, 42, 38, 0.26)",
      overflow: "hidden"
    });

    bar.style.cssText = toStyle({
      height: "34px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "0 14px",
      background: "#272c34"
    });

    ["#ff5f57", "#ffbd2e", "#28c840"].forEach((color) => {
      const dot = root.ownerDocument.createElement("span");
      dot.style.cssText = toStyle({
        width: "9px",
        height: "9px",
        borderRadius: "50%",
        background: color,
        display: "inline-block"
      });
      bar.appendChild(dot);
    });

    pre.style.cssText = toStyle({
      margin: "0",
      padding: "8px 22px 24px",
      background: "#272c34",
      color: "#bac2cc",
      overflowX: "auto",
      fontSize: "15px",
      lineHeight: "1.85",
      fontFamily: "Menlo, Monaco, Consolas, monospace",
      whiteSpace: "pre"
    });

    code.innerHTML = highlightCode(code.textContent);
    code.style.cssText = toStyle({
      padding: "0",
      borderRadius: "0",
      background: "transparent",
      color: "inherit",
      fontSize: "inherit",
      fontFamily: "inherit"
    });

    pre.parentNode.replaceChild(wrapper, pre);
    wrapper.appendChild(bar);
    wrapper.appendChild(pre);
  });
}

function highlightCode(text) {
  const tokens = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*(?=\s*\()|\b(?:void|int|float|double|bool|char|const|return|if|else|for|while|switch|case|break|continue|class|struct|public|private|protected|static|unsigned|long|short|include|define)\b|[{}()[\];,.])/g;
  let html = "";
  let lastIndex = 0;
  let match;

  while ((match = tokens.exec(text))) {
    html += escapeHtml(text.slice(lastIndex, match.index));
    html += colorizeToken(match[0]);
    lastIndex = tokens.lastIndex;
  }

  return html + escapeHtml(text.slice(lastIndex));
}

function colorizeToken(token) {
  let color = "";
  if (/^(\/\/|\/\*)/.test(token)) color = "#7f8895";
  else if (/^["']/.test(token)) color = "#91c36b";
  else if (/^\d/.test(token)) color = "#d79a5f";
  else if (/^(void|int|float|double|bool|char|const|return|if|else|for|while|switch|case|break|continue|class|struct|public|private|protected|static|unsigned|long|short|include|define)$/.test(token)) color = "#c678dd";
  else if (/^[A-Za-z_]\w*$/.test(token)) color = "#61afef";
  else color = "#aeb7c4";

  return `<span style="color:${color};">${escapeHtml(token)}</span>`;
}

function toStyle(style) {
  return Object.entries(style).map(([key, value]) => `${toKebab(key)}:${value}`).join(";");
}

function toKebab(key) {
  return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function renderStats() {
  const text = state.markdown;
  const words = text.replace(/[#>*_`~\-\[\]()!|]/g, "").replace(/\s/g, "").length;
  const images = (text.match(/!\[[^\]]*]\([^)]+\)/g) || []).length;
  const links = (text.match(/(?<!!)\[[^\]]+]\([^)]+\)/g) || []).length;

  refs.wordCount.textContent = words;
  refs.readTime.textContent = Math.max(1, Math.ceil(words / 450));
  refs.imageCount.textContent = images;
  refs.linkCount.textContent = links;
}

function persistState() {
  refs.saveState.textContent = "保存中";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    persistNow();
  }, 160);
}

function persistNow() {
  saveActiveDraft();
  const { draftsOpen, settingsOpen, ...stateToSave } = state;
  const savedState = {
    ...stateToSave,
    upload: {
      ...state.upload,
      token: state.upload.rememberToken ? state.upload.token : ""
    }
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    renderDraftList();
    refs.saveState.textContent = "已保存";
  } catch {
    refs.saveState.textContent = "保存失败";
    showToast("浏览器存储空间不足");
  }
}

function saveActiveDraft() {
  const active = drafts.find((draft) => draft.id === state.activeDraftId);
  if (!active) return;

  active.title = state.title || "未命名文章";
  active.markdown = state.markdown;
  active.theme = state.theme;
  active.options = {
    ...state.options
  };
  active.updatedAt = Date.now();
}

async function copyRichText() {
  flushScheduledRender();
  if (!(await prepareImagesForCopy())) return;

  const html = `<section data-gongformat="body" style="margin:0;padding:0;background:#fff;background-color:#fff;">${refs.wechatPreview.innerHTML}</section>`;
  const plain = refs.wechatPreview.innerText.trim();

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" })
        })
      ]);
    } else {
      fallbackCopy(html, true);
    }
    showToast("已复制富文本");
  } catch {
    fallbackCopy(html, true);
    showToast("已复制富文本");
  }
}

async function copyHtml() {
  flushScheduledRender();
  if (!(await prepareImagesForCopy())) return;

  const html = refs.wechatPreview.innerHTML;
  await copyText(html);
  showToast("已复制 HTML");
}

async function copyMarkdown() {
  await copyText(state.markdown);
  showToast("已复制 Markdown");
}

async function copyText(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }
  fallbackCopy(text, false);
}

function fallbackCopy(content, asHtml) {
  const target = document.createElement(asHtml ? "div" : "textarea");
  target.style.position = "fixed";
  target.style.left = "-9999px";
  target.style.top = "0";
  target.style.width = "680px";
  target.style.margin = "0";
  target.style.padding = "0";
  target.style.background = "#fff";
  target.style.backgroundColor = "#fff";
  target.style.color = "#000";

  if (asHtml) {
    target.contentEditable = "true";
    target.innerHTML = content;
  } else {
    target.value = content;
  }

  document.body.appendChild(target);
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(target);
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand("copy");
  selection.removeAllRanges();
  target.remove();
}

function resetDraft() {
  const upload = state.upload;
  const activeDraftId = state.activeDraftId;
  const draftsOpen = state.draftsOpen;
  const settingsOpen = state.settingsOpen;
  const previewMode = state.previewMode;
  state = {
    activeDraftId,
    draftsOpen,
    settingsOpen,
    previewMode,
    title: "DF 创客周刊发布稿",
    markdown: sampleMarkdown,
    theme: "weekly",
    options: {
      indent: false,
      centerImages: true,
      darkCode: false,
      captionPlaceholder: false
    },
    upload
  };
  refs.titleInput.value = state.title;
  refs.markdownInput.value = state.markdown;
  refs.indentToggle.checked = state.options.indent;
  refs.centerImageToggle.checked = state.options.centerImages;
  refs.darkCodeToggle.checked = state.options.darkCode;
  refs.captionPlaceholderToggle.checked = state.options.captionPlaceholder;
  renderThemeButtons();
  render();
  showToast("已恢复示例稿");
}

function showToast(message) {
  clearTimeout(toastTimer);
  refs.toast.textContent = message;
  refs.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => refs.toast.classList.remove("is-visible"), 1800);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
