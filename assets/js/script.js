// script.js
$(document).ready(function () {
  /* ==================== NAV + SCROLL ==================== */
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

  /* ==================== TYPED TEXT ==================== */
  new Typed(".typing", {
    strings: ["Software Engineer"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  });
  new Typed(".typing-2", {
    strings: ["Software Engineer"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true,
  });

  /* ==================== GITHUB → PROJECT CARDS ==================== */
  const GH_USER = "Induranga-kawishwara"; // your GitHub username
  const MAX_REPOS = 10; // how many cards to render
  const MAX_VISIBLE_CHIPS = 6; // > this => chips area becomes a scrollbox

  const $carousel = $("#github-carousel").length
    ? $("#github-carousel")
    : $(".carousel");

  const BASE_HEADERS = {
    Accept:
      "application/vnd.github+json, application/vnd.github.mercy-preview+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Token-free fetch with small backoff on 403 (rate/abuse)
  async function fetchGitHub(url, opts = {}, attempt = 0) {
    const res = await fetch(url, { headers: BASE_HEADERS, ...opts });
    if (res.ok) return res;

    if (res.status === 403 && attempt < 2) {
      const retryAfter =
        Number(res.headers.get("Retry-After")) || 1000 + attempt * 1500;
      await sleep(retryAfter);
      return fetchGitHub(url, opts, attempt + 1);
    }
    throw new Error(`GitHub API error: ${res.status}`);
  }

  // Filter out noisy tool/build "languages"
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

  // Pretty title from repo name
  const displayName = (n) => (n || "").replace(/[_-]+/g, " ").trim();

  // Frameworks via topics → readable labels
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
  function frameworksFromTopics(topics) {
    if (!Array.isArray(topics)) return [];
    const set = new Set();
    topics.forEach((t) => {
      const k = String(t || "").toLowerCase();
      if (FW_MAP[k]) set.add(FW_MAP[k]);
    });
    return Array.from(set);
  }

  // OpenGraph preview banner
  const repoImage = (owner, name) =>
    `https://opengraph.githubassets.com/1/${owner}/${name}`;
  const truncate = (txt, n) =>
    !txt ? "" : txt.length > n ? txt.slice(0, n - 1) + "…" : txt;

  // --- Beautiful fallback gradient poster (when OG image fails) ---
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
    const titleSafe = escapeXML(title).slice(0, 36);
    const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/>
      </linearGradient></defs>
      <rect width='1200' height='630' fill='url(#g)'/>
      <text x='60' y='360' font-family='Poppins, Ubuntu, Arial' font-size='72' font-weight='700'
            fill='rgba(255,255,255,.92)'>${titleSafe}</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  // Build chips; if too many, add scrollbox class
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

  // Card template with full-width banner cover and fallback gradient
  function repoCard(repo) {
    const title = displayName(repo.name);
    const cover = repoImage(repo.owner.login, repo.name);
    const fallback = gradientPlaceholder(title);

    const stars = repo.stargazers_count || 0;
    const updated = new Date(
      repo.updated_at || repo.pushed_at || repo.created_at
    ).toLocaleDateString();
    const langs = repo._languages || [];
    const fws = frameworksFromTopics(repo.topics || []);

    const rawDesc = repo.description || "";
    const desc = truncate(rawDesc.replace(/\blive\s*site\b/gi, "").trim(), 120);

    const hasHomepage =
      repo.homepage &&
      repo.homepage.trim() &&
      !/^https?:\/\/github\.com/i.test(repo.homepage);
    const live = hasHomepage
      ? `<a href="${repo.homepage}" target="_blank" rel="noopener" class="live-link">Live Site</a>`
      : "";

    return `
      <div class="card">
        <a href="${
          repo.html_url
        }" style="color: rgb(248, 246, 246)" target="_blank" rel="noopener">
          <div class="box">
            <div class="thumb">
              <img src="${cover}" alt="${title}" loading="lazy"
                   onerror="this.onerror=null;this.src='${fallback}';" />
            </div>
            <div class="text">${title}</div>
            <div class="repo-meta">★ ${stars} • Updated ${updated}</div>
            ${live}
            <div class="repo-desc">${desc || ""}</div>
            ${badges(langs, fws)}
          </div>
        </a>
      </div>
    `;
  }

  // Exclude meta/profile repos from Projects
  function isMetaRepo(r) {
    const name = (r.name || "").toLowerCase();
    const user = GH_USER.toLowerCase();
    if (name === user) return true; // profile README repo
    if (name === ".github") return true; // meta
    if (name === `${user}.github.io`) return true; // GitHub Pages
    return false;
  }
  const EXCLUDE_BY_NAME = new Set([
    // "repo-to-hide"
  ]);

  // Search API: repos (topics included with Accept header)
  async function fetchReposWithTopics() {
    const url = `https://api.github.com/search/repositories?q=user:${encodeURIComponent(
      GH_USER
    )}&sort=updated&order=desc&per_page=100`;
    const res = await fetchGitHub(url);
    const data = await res.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  // Languages: sequential (polite) and skip noisy ones
  async function addLanguages(repos) {
    for (let i = 0; i < repos.length; i++) {
      const r = repos[i];
      try {
        const res = await fetchGitHub(r.languages_url);
        const langMap = await res.json(); // { Lang: bytes }
        const entries = Object.entries(langMap)
          .sort((a, b) => b[1] - a[1])
          .filter(([lang]) => !NOISE_LANGS.has(lang));

        r._languages = entries.length
          ? entries.map(([lang]) => lang)
          : r.language
          ? [r.language]
          : [];
      } catch {
        r._languages = r.language ? [r.language] : [];
      }
      await sleep(150); // spread requests to avoid 403
    }
    return repos;
  }

  async function loadGitHubProjects() {
    try {
      // 1) repos with topics
      let repos = await fetchReposWithTopics();

      // 2) filter/sort/select
      repos = repos
        .filter((r) => {
          const n = (r.name || "").toLowerCase();
          return (
            !r.fork &&
            !r.archived &&
            !r.is_template &&
            !isMetaRepo(r) &&
            !EXCLUDE_BY_NAME.has(n)
          );
        })
        .sort(
          (a, b) =>
            b.stargazers_count - a.stargazers_count ||
            new Date(b.updated_at) - new Date(a.updated_at)
        )
        .slice(0, MAX_REPOS);

      // 3) languages
      await addLanguages(repos);

      // 4) render
      $carousel.empty();
      repos.forEach((r) => $carousel.append(repoCard(r)));
    } catch (e) {
      console.warn(e);
      // fallback: keep any static cards you may have
    }
  }

  function initOwl() {
    $carousel.owlCarousel({
      margin: 20,
      loop: true,
      autoplay: true,
      autoplayTimeout: 2000,
      autoplayHoverPause: true,
      responsive: {
        0: { items: 1, nav: false },
        600: { items: 2, nav: false },
        1000: { items: 3, nav: false },
      },
    });
  }

  // Allow wheel scrolling inside the chips scrollbox
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

  (async function initProjects() {
    await loadGitHubProjects();
    initOwl();
  })();
});
