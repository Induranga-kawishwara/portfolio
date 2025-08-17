$(document).ready(function () {
  /* ---------------- NAV + SCROLL ---------------- */
  $(window).on("scroll", function () {
    if (this.scrollY > 20) $(".navbar").addClass("sticky");
    else $(".navbar").removeClass("sticky");

    if (this.scrollY > 500) $(".scroll-up-btn").addClass("show");
    else $(".scroll-up-btn").removeClass("show");
  });
  $(".scroll-up-btn").on("click", function () {
    $("html").animate({ scrollTop: 0 });
    $("html").css("scrollBehavior", "auto");
  });
  $(".navbar .menu li a").on("click", function () {
    $("html").css("scrollBehavior", "smooth");
  });
  $(".menu-btn").on("click", function () {
    $(".navbar .menu").toggleClass("active");
    $(".menu-btn i").toggleClass("active");
  });

  /* ---------------- Typed text ---------------- */
  function startTyping(roles) {
    const list =
      Array.isArray(roles) && roles.length ? roles : ["Software Engineer"];
    new Typed(".typing", {
      strings: list,
      typeSpeed: 100,
      backSpeed: 60,
      loop: true,
    });
    new Typed(".typing-2", {
      strings: list,
      typeSpeed: 100,
      backSpeed: 60,
      loop: true,
    });
  }

  /* ---------------- Consts ---------------- */
  const LOCAL_JSON = "assets/data/portfolio.json";
  const GH_USER = "Induranga-kawishwara";
  const MAX_REPOS = 10;
  const MAX_VISIBLE_CHIPS = 6;

  // OPTIONAL token (improves rate limit). Keep empty if you don't want it.
  const GITHUB_TOKEN = ""; // e.g. "ghp_xxx"

  const $carousel = $("#github-carousel");
  let owlInitialized = false;

  const BASE_HEADERS = {
    Accept:
      "application/vnd.github+json, application/vnd.github.mercy-preview+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
  };

  const NOISE_LANGS = new Set([
    "Makefile",
    "CMake",
    "QMake",
    "Batchfile",
    "Shell",
    "PowerShell",
    "Dockerfile",
    "Procfile",
    "GLSL",
    "ShaderLab",
  ]);

  const FW_MAP = {
    react: "React",
    reactjs: "React",
    nextjs: "Next.js",
    vue: "Vue",
    angular: "Angular",
    svelte: "Svelte",
    node: "Node.js",
    nodejs: "Node.js",
    express: "Express",
    spring: "Spring",
    "spring-boot": "Spring Boot",
    django: "Django",
    flask: "Flask",
    fastapi: "FastAPI",
    dotnet: ".NET",
    aspnet: "ASP.NET",
    aspnetcore: "ASP.NET Core",
    bootstrap: "Bootstrap",
    tailwind: "Tailwind CSS",
    tailwindcss: "Tailwind CSS",
    flutter: "Flutter",
    kivy: "Kivy",
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const jitter = (ms) => ms + Math.floor(Math.random() * 200);
  const truncate = (txt, n) =>
    !txt ? "" : txt.length > n ? txt.slice(0, n - 1) + "…" : txt;
  const displayName = (n) => (n || "").replace(/[_-]+/g, " ").trim();

  /* ----------- gradient banner fallback ----------- */
  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return h;
  }
  function escapeXML(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function gradientPlaceholder(title) {
    const palettes = [
      ["#ff5858", "#f09819"],
      ["#00c6ff", "#0072ff"],
      ["#8E2DE2", "#4A00E0"],
      ["#56ab2f", "#a8e063"],
      ["#f953c6", "#b91d73"],
      ["#11998e", "#38ef7d"],
      ["#fc466b", "#3f5efb"],
      ["#ee0979", "#ff6a00"],
    ];
    const i = Math.abs(hashCode(title)) % palettes.length;
    const [c1, c2] = palettes[i];
    const t = escapeXML(title).slice(0, 36);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs>
      <rect width='1200' height='630' fill='url(#g)'/>
      <text x='60' y='360' font-family='Poppins, Ubuntu, Arial' font-size='72' font-weight='700' fill='rgba(255,255,255,.92)'>${t}</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  /* ----------- chips ----------- */
  function badges(langs, fws) {
    const total = (langs?.length || 0) + (fws?.length || 0);
    const extra = total > MAX_VISIBLE_CHIPS ? " scrollbox" : "";
    const langBadges = (langs || [])
      .map((l) => `<span class="tag">${l}</span>`)
      .join("");
    const fwBadges = (fws || [])
      .map((f) => `<span class="tag tag-fw">${f}</span>`)
      .join("");
    return `<div class="tags${extra}">${langBadges}${fwBadges}</div>`;
  }

  /* ----------- Owl helpers ----------- */
  function initOwl() {
    $carousel.owlCarousel({
      margin: 20,
      loop: true,
      autoplay: true,
      autoplayTimeout: 2200,
      autoplayHoverPause: true,
      responsive: { 0: { items: 1 }, 600: { items: 2 }, 1000: { items: 3 } },
    });
    owlInitialized = true;
  }
  function mountCards(htmlArray) {
    if (owlInitialized) {
      $carousel.trigger("destroy.owl.carousel");
      $carousel.removeClass("owl-loaded");
      $carousel.find(".owl-stage-outer").children().unwrap();
      owlInitialized = false;
    }
    $carousel.empty();
    htmlArray.forEach((h) => $carousel.append(h));
    initOwl();
  }

  /* ----------- ICON map for skills ----------- */
  const ICONS = {
    java: "fab fa-java",
    python: "fab fa-python",
    php: "fab fa-php",
    mysql: "fas fa-database",
    sqlite: "fas fa-database",
    mongodb: "fas fa-database",
    r: "fas fa-chart-line",
    html: "fab fa-html5",
    html5: "fab fa-html5",
    css: "fab fa-css3-alt",
    css3: "fab fa-css3-alt",
    javascript: "fab fa-js-square",
    js: "fab fa-js-square",
    typescript: "fab fa-js",
    react: "fab fa-react",
    bootstrap: "fab fa-bootstrap",
    "tailwind css": "fas fa-wind",
    tailwind: "fas fa-wind",
    "node.js": "fab fa-node",
    node: "fab fa-node",
    express: "fas fa-route",
    "spring boot": "fas fa-leaf",
    spring: "fas fa-seedling",
    django: "fas fa-leaf",
    flask: "fas fa-flask",
    git: "fab fa-git-alt",
    github: "fab fa-github",
    docker: "fab fa-docker",
    figma: "fab fa-figma",
    swift: "fab fa-swift",
    kotlin: "fas fa-mobile-alt",
    "next.js": "fas fa-code-branch",
    fastapi: "fas fa-bolt",
  };
  const pickIcon = (name) => {
    const k = String(name || "")
      .toLowerCase()
      .trim();
    return ICONS[k] || (k.includes("db") ? "fas fa-database" : "fas fa-code");
  };

  /* ----------- Skills from JSON ----------- */
  function renderSkills(skillsObj) {
    if (!skillsObj || typeof skillsObj !== "object") return;
    const $root = $(".js-skills").empty();

    const $columns = $('<div class="columns"></div>');
    Object.entries(skillsObj).forEach(([category, items]) => {
      const title = category.charAt(0).toUpperCase() + category.slice(1);
      const $col = $('<div class="column"></div>');
      const $header = $(`
        <div class="skill-header">
          <i class="fas fa-check-circle"></i>
          <h3>${title}</h3>
        </div>
      `);
      const $items = $('<div class="skill-items"></div>');
      (items || []).forEach((name) => {
        const icon = pickIcon(name);
        $items.append(`
          <div class="skill-item">
            <i class="${icon}"></i>
            <span>${name}</span>
          </div>
        `);
      });
      $col.append($header).append($items);
      $columns.append($col);
    });

    $root.append($columns);
  }

  /* ----------- About from JSON ----------- */
  function applyProfileAndAbout(data) {
    if (!data) return;

    if (data.profile?.name) {
      $(".home .text-2").text(data.profile.name);
      const first = data.profile.name.split(" ")[0] || data.profile.name;
      $(".js-first-name").text(first);
    }
    startTyping(data.profile?.roles);

    if (data.profile?.photo) $(".js-photo").attr("src", data.profile.photo);

    if (data.profile?.cv_url) {
      const $cv = $(".js-cv-link").length
        ? $(".js-cv-link")
        : $(".home a[href*='drive.google']");
      $cv.attr("href", data.profile.cv_url);
    }

    if (data.about?.bio) $(".js-bio").text(data.about.bio);

    const $links = $(".js-about-links").empty();
    const mk = (href, label) =>
      `<a href="${href}" target="_blank" rel="noopener" class="about-link">${label}</a>`;
    if (data.links?.linkedin)
      $links.append(mk(data.links.linkedin, "LinkedIn"));
    if (data.links?.medium) $links.append(mk(data.links.medium, "Medium"));
    if (data.links?.github) $links.append(mk(data.links.github, "GitHub"));

    if (data.skills) renderSkills(data.skills);
  }

  /* ----------- JSON project card ----------- */
  function projectCardFromJSON(p) {
    const title = p.title || "Untitled";
    const cover = p.cover || gradientPlaceholder(title);
    const updated = p.updated ? new Date(p.updated).toLocaleDateString() : "";
    const stars = p.stars || 0;
    const live = p.live
      ? `<a href="${p.live}" target="_blank" rel="noopener" class="live-link">Live Site</a>`
      : "";
    const desc = truncate(p.description || "", 120);
    return `
      <div class="card">
        <a href="${
          p.repo || "#"
        }" style="color: rgb(248, 246, 246)" target="_blank" rel="noopener">
          <div class="box">
            <div class="thumb">
              <img src="${cover}" alt="${title}" loading="lazy"
                   onerror="this.onerror=null;this.src='${gradientPlaceholder(
                     title
                   )}';" />
            </div>
            <div class="text">${title}</div>
            <div class="repo-meta">★ ${stars}${updated ? ` • Updated ${updated}` : ""}</div>
            ${live}
            <div class="repo-desc">${desc}</div>
            ${badges(p.languages || [], p.frameworks || [])}
          </div>
        </a>
      </div>
    `;
  }

  /* ----------- Render JSON first (instant) ----------- */
  async function renderFromLocalJSON() {
    const res = await fetch(LOCAL_JSON, { cache: "no-store" });
    if (!res.ok) throw new Error("No local JSON");
    const data = await res.json();

    applyProfileAndAbout(data);

    const projects = Array.isArray(data.projects) ? data.projects : [];
    if (projects.length) {
      const html = projects.map(projectCardFromJSON);
      mountCards(html); // show placeholders NOW
    }
    return projects.length > 0;
  }

  /* ----------- robust fetch with backoff ----------- */
  async function fetchWithRetries(url, maxAttempts = 5) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = await fetch(url, { headers: BASE_HEADERS });
      if (res.ok) return res;

      if (res.status === 403 || res.status === 429) {
        const retryAfter = Number(res.headers.get("Retry-After"));
        const remaining = Number(res.headers.get("x-ratelimit-remaining"));
        const resetAt = Number(res.headers.get("x-ratelimit-reset")) * 1000;
        let wait = 0;
        if (retryAfter) {
          wait = retryAfter * 1000;
        } else if (!isNaN(remaining) && remaining === 0 && !isNaN(resetAt)) {
          wait = Math.max(1500, resetAt - Date.now() + 500);
        } else {
          wait = 1200 + attempt * 800 + Math.floor(Math.random() * 300);
        }
        await sleep(wait);
        continue;
      }

      if (res.status >= 500 && res.status < 600) {
        await sleep(800 + attempt * 400);
        continue;
      }
      throw new Error(`GitHub error ${res.status}`);
    }
    throw new Error("GitHub retries exceeded");
  }

  /* ----------- GitHub helpers ----------- */
  const repoImage = (owner, name) =>
    `https://opengraph.githubassets.com/1/${owner}/${name}`;

  function isMetaRepo(r) {
    const n = (r.name || "").toLowerCase();
    const u = GH_USER.toLowerCase();
    return n === u || n === ".github" || n === `${u}.github.io`;
  }

  async function fetchRepoTopics(owner, name) {
    const url = `https://api.github.com/repos/${owner}/${name}/topics`;
    const res = await fetchWithRetries(url);
    const data = await res.json();
    return Array.isArray(data.names) ? data.names : [];
  }

  function frameworksFromTopics(topics) {
    if (!Array.isArray(topics)) return [];
    const set = new Set();
    topics.forEach((t) => {
      const k = String(t || "").toLowerCase();
      if (FW_MAP[k]) set.add(FW_MAP[k]);
    });
    return Array.from(set);
  }

  function repoCard(repo) {
    const title = displayName(repo.name);
    const cover = repoImage(repo.owner.login, repo.name);
    const fallback = gradientPlaceholder(title);
    const stars = repo.stargazers_count || 0;
    const updated = new Date(
      repo.updated_at || repo.pushed_at || repo.created_at
    ).toLocaleDateString();
    const langs = repo._languages || [];
    const fws = frameworksFromTopics(repo._topics || repo.topics || []);
    const rawDesc = repo.description || "";
    const desc = truncate(rawDesc.replace(/\blive\s*site\b/gi, "").trim(), 120);
    const live =
      repo.homepage &&
      repo.homepage.trim() &&
      !/^https?:\/\/github\.com/i.test(repo.homepage)
        ? `<a href="${repo.homepage}" target="_blank" rel="noopener" class="live-link">Live Site</a>`
        : "";

    return `
      <div class="card">
        <a href="${
          repo.html_url
        }" style="color: rgb(248, 246, 246)" target="_blank" rel="noopener">
          <div class="box">
            <div class="thumb">
              <img src="${cover}" alt="${title}" loading="lazy" onerror="this.onerror=null;this.src='${fallback}';" />
            </div>
            <div class="text">${title}</div>
            <div class="repo-meta">★ ${stars} • Updated ${updated}</div>
            ${live}
            <div class="repo-desc">${desc}</div>
            ${badges(langs, fws)}
          </div>
        </a>
      </div>
    `;
  }

  async function fetchReposWithTopics() {
    const url = `https://api.github.com/search/repositories?q=user:${encodeURIComponent(
      GH_USER
    )}&sort=updated&order=desc&per_page=100`;
    const res = await fetchWithRetries(url);
    const data = await res.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  async function enrichRepos(repos) {
    for (let i = 0; i < repos.length; i++) {
      const r = repos[i];
      try {
        // Languages
        const langRes = await fetchWithRetries(r.languages_url);
        const langMap = await langRes.json();
        const entries = Object.entries(langMap)
          .sort((a, b) => b[1] - a[1])
          .filter(([lang]) => !NOISE_LANGS.has(lang));
        r._languages = entries.map(([lang]) => lang);
        if (!r._languages.length && r.language) r._languages = [r.language];

        // Topics
        r._topics = await fetchRepoTopics(r.owner.login, r.name);
      } catch {
        r._languages = r.language ? [r.language] : [];
        r._topics = [];
      }
      // polite delay for unauthenticated use
      await sleep(1300 + Math.floor(Math.random() * 600));
    }
    return repos;
  }

  async function refreshFromGitHub() {
    let repos = await fetchReposWithTopics();
    repos = repos
      .filter((r) => !r.fork && !r.archived && !r.is_template && !isMetaRepo(r))
      .sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count ||
          new Date(b.updated_at) - new Date(a.updated_at)
      )
      .slice(0, MAX_REPOS);

    await enrichRepos(repos);
    const html = repos.map(repoCard);
    mountCards(html);
  }

  /* ----------- allow wheel scroll inside tags box ----------- */
  $(document).on("wheel", ".tags", function (e) {
    const el = this,
      evt = e.originalEvent;
    if (
      el.scrollHeight > el.clientHeight &&
      Math.abs(evt.deltaY) > Math.abs(evt.deltaX)
    ) {
      el.scrollTop += evt.deltaY;
      e.preventDefault();
    }
  });

  /* ----------- Boot ----------- */
  (async function init() {
    try {
      await renderFromLocalJSON(); // About + Skills + JSON projects
    } catch {
      startTyping(); // fallback typing
    }

    try {
      await refreshFromGitHub(); // replace with live GitHub cards
    } catch (e) {
      console.warn("GitHub load failed; keeping JSON projects.", e);
    }
  })();
});
