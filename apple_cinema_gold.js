/*
 * Apple Cinema Gold 1.8.1 (2026-11-14)
 * Single-file Lampa overlay. Build with python3 build.py.
 * AppleTV AgNative NG remains an external dependency; no upstream code is bundled.
 */
(function () {
  'use strict';
  if (window.__LMP_APPLE_CINEMA_GOLD_V12__) return;
  window.__LMP_APPLE_CINEMA_GOLD_V12__ = true;

  var VERSION = '1.8.1';
  var PREFIX = 'lmp_apple_cinema_';
  var STYLE_ID = 'lmp-apple-cinema-v18-style';
  // The approved layout was verified against AgNative 0.4.1. Do not follow
  // changes to the author's live Pages file implicitly on every TV restart.
  var UPSTREAM_PATH = '/gh/Llowmikee/AppleTVAGNativeNG@b68d7840996da040ef4fe9d8f5e53e8ed4f759a7/appletv_agnative.js';
  var UPSTREAM_URLS = ['https://cdn.jsdelivr.net' + UPSTREAM_PATH, 'https://fastly.jsdelivr.net' + UPSTREAM_PATH];
  var UPSTREAM_INTEGRITY = 'sha384-Q0c9mcezE6gwRwsNN+WJq5DBAe5WtTrQBc1OfHyAOBV+bpULBKwFJl+dLreBuAxZ';
  var TRAILER_ORIGIN = 'https://lqllisa.github.io';
  var TRAILER_PAGE = TRAILER_ORIGIN + '/apple-cinema-gold/trailer.html';
  var CSS = "/* Sizes follow Lampa's body scale, including a true 20% toolbar enlargement. */\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 {\n  --acg-unit:16px; --acg-nav-unit:19.2px; --acg-nav-scale:1.2;\n  --acg-row-gap:calc(3.2 * var(--acg-unit));\n  --acg-safe-top:calc(2.2 * var(--acg-unit) + 2.9 * var(--acg-nav-unit));\n  --acg-ink:#f8f4ed; --acg-accent:#e9d9b9; --acg-edge:rgba(247,232,203,.26);\n  --acg-glass:linear-gradient(125deg,rgba(255,246,228,.12),rgba(255,255,255,.025) 44%,rgba(225,202,159,.07)),rgba(19,21,24,.78);\n  --acg-panel:linear-gradient(135deg,rgba(250,234,204,.09),rgba(255,255,255,.015) 48%,rgba(220,200,162,.055)),rgba(19,21,24,.86);\n  --acg-primary:linear-gradient(135deg,#fffaf1 0%,#f2ecdf 62%,#e6d7bc 100%);\n  --acg-focus:linear-gradient(115deg,rgba(255,249,234,.24),rgba(238,218,180,.12));\n  --acg-shadow:inset 0 1px 0 rgba(255,250,237,.22),inset 0 -1px 0 rgba(229,207,166,.07),0 6px 22px rgba(0,0,0,.24);\n  --acg-blur:18px;\n  background:#0b0e12 !important; color:var(--acg-ink);\n}\n/* Native Lampa blurs the selected poster once and crossfades its cached canvas. */\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .background { opacity:.38 !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .head { z-index:40 !important; background:transparent !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .head__body { height:0 !important; min-height:0 !important; }\n/* Symmetric gutters keep the category strip centered in the SCREEN.\n   Menu/search sit on the left; reload/settings/account sit on the right. */\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-shell {\n  position:absolute !important; top:calc(.9 * var(--acg-unit)) !important;\n  left:calc(11.5 * var(--acg-nav-unit)) !important; right:calc(11.5 * var(--acg-nav-unit)) !important;\n  width:auto !important; max-width:none !important; height:calc(2.9 * var(--acg-nav-unit)) !important;\n  transform:none !important; font-size:var(--acg-nav-unit) !important; display:flex !important; justify-content:center !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-shell__inner {\n  display:flex !important; width:auto !important; max-width:100% !important; min-width:0 !important; height:100% !important;\n  min-height:0 !important; padding:calc(.22 * var(--acg-nav-unit)) !important; box-sizing:border-box !important;\n  overflow:hidden !important; border-radius:calc(1.6 * var(--acg-nav-unit)) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-shell__items {\n  display:flex !important; flex:0 1 auto !important; min-width:0 !important;\n  justify-content:flex-start !important; overflow-x:auto !important; overflow-y:hidden !important;\n  scrollbar-width:none; padding:0 !important; margin:0 !important; scroll-padding:calc(.3 * var(--acg-nav-unit));\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-shell__items::-webkit-scrollbar { display:none; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-shell__item.selector {\n  display:inline-flex !important; align-items:center !important; justify-content:center !important;\n  flex:0 0 auto !important; box-sizing:border-box !important; height:calc(2.4 * var(--acg-nav-unit)) !important;\n  font:500 calc(.88 * var(--acg-nav-unit))/1.2 system-ui,Roboto,Arial,sans-serif !important; letter-spacing:0 !important;\n  border-radius:calc(1.3 * var(--acg-nav-unit)) !important; padding:0 calc(.3 * var(--acg-nav-unit)) !important; margin:0 !important;\n  color:var(--acg-ink) !important; white-space:nowrap !important; transform:none !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-rightdock,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .head__menu-icon,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-system-action.acg-action {\n  position:absolute !important; top:calc(.9 * var(--acg-unit)) !important; bottom:auto !important;\n  width:calc(2.9 * var(--acg-nav-unit)) !important; height:calc(2.9 * var(--acg-nav-unit)) !important;\n  min-width:0 !important; min-height:0 !important; padding:calc(.22 * var(--acg-nav-unit)) !important; margin:0 !important;\n  display:flex !important; align-items:center !important; justify-content:center !important;\n  box-sizing:border-box !important; border-radius:50% !important; transform:none !important;\n  font-size:var(--acg-nav-unit) !important; z-index:2;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .head__menu-icon { left:calc(1.4 * var(--acg-unit)) !important; right:auto !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-system-action.acg-search { left:calc(1.4 * var(--acg-unit) + 3.6 * var(--acg-nav-unit)) !important; right:auto !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-system-action.acg-refresh { right:calc(1.4 * var(--acg-unit) + 7.2 * var(--acg-nav-unit)) !important; left:auto !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-system-action.acg-settings { right:calc(1.4 * var(--acg-unit) + 3.6 * var(--acg-nav-unit)) !important; left:auto !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-rightdock { right:calc(1.4 * var(--acg-unit)) !important; left:auto !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .head__menu-icon svg,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .head__menu-icon > *,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-system-action svg,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-right__profile svg { width:calc(1.3 * var(--acg-nav-unit)) !important; height:calc(1.3 * var(--acg-nav-unit)) !important; margin:0 !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-right__profile.selector { width:100% !important; height:100% !important; min-width:0 !important; padding:0 !important; background:transparent !important; border:0 !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-right__profile-img { width:calc(1.8 * var(--acg-nav-unit)) !important; height:calc(1.8 * var(--acg-nav-unit)) !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-clock,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-shell__right,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-shell__items > [data-role],\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock__item.acg-top-hidden,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock .acg-empty { display:none !important; }\n/* Top anchored drawer: never retain the upstream translateY(-50%). */\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock {\n  top:calc(2.1 * var(--acg-unit) + 2.9 * var(--acg-nav-unit)) !important;\n  bottom:calc(1.4 * var(--acg-unit)) !important; left:calc(1.4 * var(--acg-unit)) !important;\n  width:calc(21 * var(--acg-unit)) !important; max-width:calc(100vw - 2.8 * var(--acg-unit)) !important;\n  height:auto !important; max-height:none !important; padding:calc(.65 * var(--acg-unit)) !important;\n  box-sizing:border-box !important; font-size:var(--acg-unit) !important;\n  border-radius:calc(1.2 * var(--acg-unit)) !important;\n  transform:translateX(-115%) !important; opacity:0 !important; pointer-events:none !important;\n  overflow-x:hidden !important; overflow-y:auto !important; overscroll-behavior:contain;\n  scroll-padding:calc(.7 * var(--acg-unit)); z-index:42 !important;\n  transition:transform .2s ease,opacity .18s ease !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock.is-visible { transform:translateX(0) !important; opacity:1 !important; pointer-events:auto !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock__inner { padding:0 !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock__item.selector {\n  display:flex !important; align-items:center !important; width:100% !important; min-height:calc(3.05 * var(--acg-unit)) !important;\n  padding:calc(.6 * var(--acg-unit)) calc(.75 * var(--acg-unit)) !important; margin:calc(.12 * var(--acg-unit)) 0 !important;\n  border-radius:calc(.65 * var(--acg-unit)) !important; border:1px solid transparent !important;\n  background:transparent !important; color:var(--acg-ink) !important; box-sizing:border-box !important;\n  font-size:calc(1.12 * var(--acg-unit)) !important; line-height:1.3 !important; transform:none !important; box-shadow:none !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock__item .menu__ico { width:calc(1.45 * var(--acg-unit)) !important; height:calc(1.45 * var(--acg-unit)) !important; margin-right:calc(.8 * var(--acg-unit)) !important; flex-shrink:0 !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock__item .menu__ico svg { width:100% !important; height:100% !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock__item .menu__text { font-size:inherit !important; white-space:normal !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock__split { margin:calc(.5 * var(--acg-unit)) calc(.7 * var(--acg-unit)) !important; background:rgba(241,225,195,.12) !important; }\n/* Settings and source selectors use the same right-hand glass sheet. */\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .selectbox { font-size:var(--acg-unit) !important; z-index:60 !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings__content,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings__content.layer--height,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .selectbox__content,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .selectbox__content.layer--height {\n  top:calc(1.4 * var(--acg-unit)) !important; bottom:calc(1.4 * var(--acg-unit)) !important; right:calc(1.4 * var(--acg-unit)) !important;\n  width:calc(30 * var(--acg-unit)) !important; min-width:0 !important; max-width:calc(100vw - 2.8 * var(--acg-unit)) !important;\n  padding:calc(1.25 * var(--acg-unit)) !important; border-radius:calc(1.25 * var(--acg-unit)) !important; box-sizing:border-box !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings__body,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .selectbox__body { padding:calc(.45 * var(--acg-unit)) !important; mask-image:none !important; -webkit-mask-image:none !important; scroll-padding:calc(.65 * var(--acg-unit)); }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings__title,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .selectbox__title { color:var(--acg-ink) !important; font-size:calc(1.45 * var(--acg-unit)) !important; line-height:1.3 !important; font-weight:600 !important; text-align:left !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings-folder,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings-param,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .selectbox-item.selector {\n  border:1px solid transparent !important; background:transparent !important; color:var(--acg-ink) !important;\n  border-radius:calc(.65 * var(--acg-unit)) !important; padding:calc(.9 * var(--acg-unit)) calc(.85 * var(--acg-unit)) !important;\n  margin-bottom:calc(.3 * var(--acg-unit)) !important; box-shadow:none !important; transform:none !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings-param__name,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings-folder__name { font-size:calc(1.1 * var(--acg-unit)) !important; line-height:1.3 !important; color:inherit !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings-param__value,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings-param__descr { color:rgba(245,235,215,.67) !important; line-height:1.4 !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings-param-title > span { color:var(--acg-accent) !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings__layer,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .selectbox__layer { background:rgba(0,0,0,.27) !important; }\n/* Hero: one composition, no absolute pseudo-button over the synopsis. */\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero {\n  width:calc(100% + 5em) !important; margin:0 -2.5em calc(.8 * var(--acg-unit)) !important; height:75vh !important;\n  min-height:calc(29 * var(--acg-unit)) !important; max-height:calc(62 * var(--acg-unit)) !important; border-radius:0 !important; border:0 !important;\n  background:#0b0e12 !important; box-shadow:none !important; transform:none !important; overflow:hidden !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero__bg {\n  width:100% !important; height:100% !important; min-height:100% !important; object-fit:cover !important;\n  object-position:center 30% !important; border-radius:0 !important; transform:none !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero::before,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail::before {\n  content:\"\" !important; display:block !important; position:absolute; top:0; left:0; right:0; bottom:0;\n  pointer-events:none; z-index:2; border-radius:0 !important;\n  background:linear-gradient(90deg,rgba(6,9,13,.83) 0%,rgba(6,9,13,.58) 26%,rgba(6,9,13,.1) 65%,transparent 100%) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero::after,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail::after {\n  content:\"\" !important; display:block !important; position:absolute; left:0; right:0; bottom:0;\n  height:50%; pointer-events:none; z-index:2; background:linear-gradient(transparent,#0b0e12) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero__content {\n  position:absolute !important; top:auto !important; bottom:calc(4.5 * var(--acg-unit)) !important; left:calc(4.1 * var(--acg-unit)) !important; right:auto !important;\n  width:calc(38 * var(--acg-unit)) !important; max-width:54% !important; transform:none !important; z-index:4 !important;\n  display:flex !important; align-items:flex-start !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero__logo {\n  width:auto !important; max-width:calc(25 * var(--acg-unit)) !important; max-height:calc(5.1 * var(--acg-unit)) !important; object-position:left center !important; margin:0 0 calc(1 * var(--acg-unit)) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero__title {\n  font-size:calc(2.65 * var(--acg-unit)) !important; font-weight:600 !important; line-height:1.1 !important; letter-spacing:.015em !important;\n  color:#f8f6f1 !important; margin:0 0 calc(1 * var(--acg-unit)) !important; max-width:100%;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero__overview,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail-overview {\n  width:calc(32 * var(--acg-unit)) !important; max-width:100% !important; font-size:calc(1.05 * var(--acg-unit)) !important; line-height:1.48 !important;\n  color:rgba(246,244,240,.87) !important; font-weight:400 !important; margin:calc(.75 * var(--acg-unit)) 0 calc(1.25 * var(--acg-unit)) !important;\n  display:-webkit-box !important; -webkit-line-clamp:3 !important; -webkit-box-orient:vertical; overflow:hidden;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-metadata,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-tags { display:flex; align-items:center; flex-wrap:wrap; color:#e2e2df; font-size:calc(.88 * var(--acg-unit)); line-height:1.6; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-metadata > span { margin-right:calc(.7 * var(--acg-unit)); }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-tags > span {\n  padding:calc(.12 * var(--acg-unit)) calc(.52 * var(--acg-unit)); margin:calc(.3 * var(--acg-unit)) calc(.4 * var(--acg-unit)) 0 0; border:1px solid rgba(255,255,255,.19); border-radius:calc(.4 * var(--acg-unit)); background:rgba(19,23,28,.45);\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-enhanced .agnative-hero__year,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-enhanced .agnative-hero__meta { display:none !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-hero-actions { display:flex; align-items:center; flex-wrap:wrap; position:relative; z-index:5; padding:0; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-action,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero__play.selector {\n  position:relative !important; top:auto !important; right:auto !important; bottom:auto !important; left:auto !important;\n  display:inline-flex !important; flex:0 0 auto !important; align-items:center !important; justify-content:center !important;\n  height:calc(3 * var(--acg-unit)) !important; width:calc(3 * var(--acg-unit)) !important; min-width:0 !important; padding:0 !important; margin:0 calc(.6 * var(--acg-unit)) calc(.3 * var(--acg-unit)) 0 !important;\n  border-radius:50% !important; border:1px solid rgba(255,255,255,.2) !important;\n  background:rgba(23,27,32,.68) !important; color:#f6f4ef !important; font:500 calc(1 * var(--acg-unit))/1.2 system-ui,Roboto,Arial,sans-serif !important;\n  box-sizing:border-box !important; text-shadow:none !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.08) !important;\n  cursor:pointer; transform:none !important; outline:none; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero__play::after { content:none !important; display:none !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-action svg { width:calc(1.3 * var(--acg-unit)); height:calc(1.3 * var(--acg-unit)); flex-shrink:0; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-action:not(.acg-watch) > span { position:absolute; width:1px; height:1px; padding:0; overflow:hidden; clip:rect(0,0,0,0); }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-action.acg-watch {\n  width:auto !important; min-width:calc(10 * var(--acg-unit)) !important; padding:0 calc(1.35 * var(--acg-unit)) !important; border-radius:calc(1.7 * var(--acg-unit)) !important;\n  background:#f6f3ed !important; color:#11151a !important; border-color:#f6f3ed !important; font-size:calc(1.08 * var(--acg-unit)) !important; font-weight:650 !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-watch svg { margin-right:calc(.6 * var(--acg-unit)); }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-action.focus,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-action:hover,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero__play.focus {\n  outline:2px solid #f6f3ed !important; outline-offset:3px; box-shadow:0 calc(.2 * var(--acg-unit)) calc(.8 * var(--acg-unit)) rgba(0,0,0,.18) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-action[aria-pressed=\"true\"] { color:#f0dfbd !important; background:rgba(235,218,185,.2) !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-bookmark[aria-pressed=\"true\"] svg { fill:rgba(233,217,185,.22); }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero__indicators { bottom:calc(1.65 * var(--acg-unit)) !important; z-index:5 !important; background:rgba(8,11,15,.35) !important; box-shadow:none !important; }\n/* Deliberate row spacing replaces the tiny .12em + .32em upstream gap. */\n/* Lampa aligns rows to scroll__body, then translates that body. Keep the\n   toolbar inset on its stationary parent, never on the moving row itself. */\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-feed-scroll > .scroll__content {\n  padding-top:var(--acg-safe-top) !important; padding-bottom:var(--acg-safe-top) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-feed-scroll .scroll--horizontal > .scroll__content {\n  padding-top:0 !important; padding-bottom:0 !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-feed-scroll {\n  mask-image:linear-gradient(to bottom,transparent 0,transparent calc(var(--acg-safe-top) - .45 * var(--acg-unit)),#000 var(--acg-safe-top),#000 calc(100% - .75 * var(--acg-unit)),transparent 100%) !important;\n  -webkit-mask-image:linear-gradient(to bottom,transparent 0,transparent calc(var(--acg-safe-top) - .45 * var(--acg-unit)),#000 var(--acg-safe-top),#000 calc(100% - .75 * var(--acg-unit)),transparent 100%) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-feed-scroll > .scroll__content > .scroll__body > .agnative-hero {\n  height:calc(75vh - var(--acg-safe-top)) !important;\n  min-height:calc(29 * var(--acg-unit) - var(--acg-safe-top)) !important;\n  max-height:calc(62 * var(--acg-unit) - var(--acg-safe-top)) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .activity .items-line {\n  min-height:0 !important; padding-top:0 !important; padding-bottom:calc(.75 * var(--acg-unit)) !important; margin-bottom:var(--acg-row-gap) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .activity .items-line__head { margin-bottom:calc(1.05 * var(--acg-unit)) !important; padding-bottom:calc(.35 * var(--acg-unit)) !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .items-line__title { font-size:calc(1.2em * var(--agnative-scale,1) * var(--agnative-category-scale,1)) !important; font-weight:600 !important; letter-spacing:0 !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .items-line .card:not(.card--button-compact):not(.card--genre-compact):not(.streaming-card--button-compact) { width:var(--acg-card-width,22em) !important; flex:0 0 auto !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18[data-agnative-backdrop=\"off\"] .items-line .card:not(.card--button-compact):not(.card--genre-compact):not(.streaming-card--button-compact) { width:var(--acg-poster-width,16.25em) !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18[data-agnative-card-size=\"xs\"] { --acg-card-width:17.5em; --acg-poster-width:13em; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18[data-agnative-card-size=\"sm\"] { --acg-card-width:19.75em; --acg-poster-width:14.625em; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18[data-agnative-card-size=\"md\"] { --acg-card-width:22em; --acg-poster-width:16.25em; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18[data-agnative-card-size=\"lg\"] { --acg-card-width:24.25em; --acg-poster-width:17.875em; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18[data-agnative-card-size=\"xl\"] { --acg-card-width:26.5em; --acg-poster-width:19.5em; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .items-line .card .card__view {\n  border-radius:calc(.65 * var(--acg-unit)) !important; border:0 !important; box-shadow:none !important;\n  clip-path:none !important; -webkit-clip-path:none !important; overflow:hidden !important; outline:none !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .items-line .card__view > *,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .items-line .card__view img { border-radius:inherit !important; }\n/* Detail header shares the hero composition; native watch/book handlers stay attached. */\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail { position:relative; min-height:72vh; overflow:hidden; padding:0 !important; margin-bottom:calc(2 * var(--acg-unit)) !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail .full-start__background {\n  top:0 !important; left:0 !important; width:100% !important; height:100% !important; object-fit:cover !important;\n  object-position:center 30%; mask-image:none !important; -webkit-mask-image:none !important; z-index:0 !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail .full-start__background.loaded { opacity:1 !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail .full-start-new__body {\n  position:relative !important; z-index:3; min-height:72vh; box-sizing:border-box; padding:calc(7 * var(--acg-unit)) calc(2.6 * var(--acg-unit)) calc(3.5 * var(--acg-unit)) !important;\n  align-items:flex-end !important; transform:none !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail .full-start-new__left { display:none !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail .full-start-new__right { flex:0 1 calc(42 * var(--acg-unit)) !important; width:58%; max-width:64%; margin:0 !important; padding:0 !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail .full-start-new__title { font-size:calc(2.55 * var(--acg-unit)) !important; line-height:1.12 !important; font-weight:600 !important; white-space:normal !important; overflow:visible !important; margin-bottom:calc(1 * var(--acg-unit)) !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail .full-start-new__tagline,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail .full-start-new__head,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail .full-start-new__details { display:none !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail .full-start-new__rate-line { margin:calc(.6 * var(--acg-unit)) 0 !important; font-size:calc(.85 * var(--acg-unit)); }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons { display:flex !important; flex-wrap:wrap !important; overflow:visible !important; margin-top:calc(.6 * var(--acg-unit)) !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .full-start__button {\n  display:inline-flex; align-items:center !important; justify-content:center !important; flex:0 0 auto !important;\n  height:calc(3 * var(--acg-unit)) !important; min-width:calc(3 * var(--acg-unit)) !important; width:calc(3 * var(--acg-unit)) !important; padding:0 !important; margin:0 calc(.6 * var(--acg-unit)) calc(.4 * var(--acg-unit)) 0 !important;\n  border-radius:50% !important; border:1px solid rgba(255,255,255,.2) !important; box-sizing:border-box;\n  color:#f6f3ed !important; background:rgba(23,27,32,.68) !important; box-shadow:none !important; transform:none !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .full-start__button.hide { display:none !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .button--play,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .acg-provider {\n  width:auto !important; min-width:calc(10 * var(--acg-unit)) !important; padding:0 calc(1.35 * var(--acg-unit)) !important; border-radius:calc(1.7 * var(--acg-unit)) !important;\n  background:#f6f3ed !important; color:#11151a !important; border-color:#f6f3ed !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .button--play span,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .acg-provider span { display:inline !important; font-size:calc(1.08 * var(--acg-unit)) !important; font-weight:650 !important; margin-left:calc(.6 * var(--acg-unit)) !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .full-start__button:not(.button--play):not(.acg-provider) span { display:none !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .full-start__button svg { width:calc(1.25 * var(--acg-unit)) !important; height:calc(1.25 * var(--acg-unit)) !important; margin:0 !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .full-start__button.focus { outline:2px solid #f6f3ed !important; outline-offset:3px !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new ~ .items-line,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new + * { transform:none !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-trailer-preview { position:absolute; top:0; left:0; right:0; bottom:0; z-index:1; overflow:hidden; pointer-events:none; opacity:0; transition:opacity .45s; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-trailer-playing { opacity:1; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-trailer-preview iframe,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-trailer-preview video { position:absolute; width:100%; height:100%; border:0; object-fit:cover; pointer-events:none; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-trailer-preview iframe {\n  top:50%; left:50%; width:100vw; height:56.25vw; min-width:100%; min-height:100%; transform:translate(-50%,-50%);\n}\n@media(max-width:900px) {\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero__content { left:calc(3 * var(--acg-unit)) !important; max-width:68% !important; }\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail .full-start-new__right { max-width:76%; width:76%; }\n}\n@media(max-width:600px) {\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero__content { left:calc(2.5 * var(--acg-unit)) !important; max-width:84% !important; bottom:calc(4 * var(--acg-unit)) !important; }\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero__title { font-size:calc(2 * var(--acg-unit)) !important; }\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail .full-start-new__right { max-width:100%; width:100%; }\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail .full-start-new__body { padding:calc(6 * var(--acg-unit)) calc(1.5 * var(--acg-unit)) calc(3 * var(--acg-unit)) !important; }\n}\n@media(prefers-reduced-motion:reduce) {\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-trailer-preview { transition:none; }\n}\n\n\n/* One champagne glass palette for navigation, actions and sheets. The material\n   is static; only focus changes animate. No blur is applied to poster rows. */\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-shell__inner,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .head__menu-icon,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-rightdock,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-action,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-hero__play.selector,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .full-start__button {\n  background:var(--acg-glass) !important; color:var(--acg-ink) !important; border:1px solid var(--acg-edge) !important;\n  box-shadow:var(--acg-shadow) !important; backdrop-filter:blur(var(--acg-blur)) saturate(115%) !important;\n  -webkit-backdrop-filter:blur(var(--acg-blur)) saturate(115%) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings__content,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings__content.layer--height,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .selectbox__content,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .selectbox__content.layer--height,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .modal__content,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings-input__content {\n  background:var(--acg-panel) !important; color:var(--acg-ink) !important; border:1px solid var(--acg-edge) !important;\n  box-shadow:var(--acg-shadow) !important; backdrop-filter:blur(var(--acg-blur)) saturate(110%) !important;\n  -webkit-backdrop-filter:blur(var(--acg-blur)) saturate(110%) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-action.acg-watch,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .button--play,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .acg-provider {\n  background:var(--acg-primary) !important; color:#17191c !important; border-color:rgba(255,248,231,.8) !important;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 3px 14px rgba(0,0,0,.2) !important;\n  backdrop-filter:none !important; -webkit-backdrop-filter:none !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-action.acg-watch.focus,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .button--play.focus,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .acg-provider.focus { background:linear-gradient(135deg,#fffdf8,#f5ead5) !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-shell__item.is-active { background:rgba(244,228,197,.12) !important; color:var(--acg-ink) !important; box-shadow:inset 0 0 0 1px rgba(247,231,201,.18) !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock__item.is-active { background:rgba(244,228,197,.08) !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock__item.focus,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock__item.hover,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .menu__item.focus,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings-folder.focus,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings-folder.hover,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings-param.focus,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings-param.hover,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .selectbox-item.focus,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .selectbox-item.hover,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .selectbox-item.selected.focus,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-shell__item.focus,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-shell__item.hover {\n  background:var(--acg-focus) !important; color:#fffbf3 !important; border-color:rgba(253,239,209,.72) !important;\n  box-shadow:inset 0 1px 0 rgba(255,252,242,.55),inset 0 0 0 1px rgba(244,224,184,.4),0 0 12px rgba(236,214,172,.16) !important;\n  transform:none !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-action.focus,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-action:hover,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .head__menu-icon.focus,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .head__menu-icon:hover,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .full-start-new__buttons > .full-start__button.focus { outline:2px solid var(--acg-accent) !important; outline-offset:3px !important; }\n/* A single inset border, above the image, shares its exact radius.\n   Remove nested scale/3D transforms which distort and clip the frame on TV. */\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .items-line .card,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .items-line .card .card__view,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18[data-agnative-card-anim] .items-line .card .card__view {\n  transform:none !important; -webkit-transform:none !important; animation:none !important;\n  will-change:auto !important; transform-style:flat !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .items-line .card.focus .card__view,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .items-line .card.hover .card__view {\n  box-shadow:0 6px 20px rgba(0,0,0,.32) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .items-line .card.focus .card__view::after,\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .items-line .card.hover .card__view::after {\n  content:\"\" !important; display:block !important; position:absolute !important;\n  top:0 !important; right:0 !important; bottom:0 !important; left:0 !important;\n  width:auto !important; height:auto !important; margin:0 !important; padding:0 !important;\n  border:2px solid var(--acg-accent) !important; border-radius:inherit !important; box-sizing:border-box !important;\n  background:transparent !important; box-shadow:none !important; outline:none !important;\n  transform:none !important; animation:none !important; opacity:1 !important; z-index:20; pointer-events:none;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-tags > span { border-color:rgba(239,221,186,.22); background:rgba(20,22,25,.5); color:#eee6d8; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-bookmark[aria-pressed=\"true\"] svg { color:var(--acg-accent) !important; }\nbody.appletv-agnative-topnav.lmp-cinema-hero.acg-v18.acg-simple-glass { --acg-blur:0px; --acg-glass:linear-gradient(125deg,#2e3032,#1c1f23 60%,#272829); --acg-panel:linear-gradient(135deg,#292c30,#171b20); }\n@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))) {\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 { --acg-glass:linear-gradient(125deg,#323334,#1d2024 60%,#292b2d); --acg-panel:linear-gradient(135deg,#2a2d31,#171b20); }\n}\n@media(prefers-reduced-transparency:reduce) {\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 { --acg-blur:0px; --acg-glass:linear-gradient(125deg,#323334,#1d2024); --acg-panel:linear-gradient(135deg,#2a2d31,#171b20); }\n}\n@media(prefers-reduced-motion:reduce) {\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock,\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .settings__content,\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .selectbox__content { transition:none !important; animation:none !important; }\n}\n@media(max-width:600px) {\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 { --acg-safe-top:calc(2.9 * var(--acg-unit) + 5.8 * var(--acg-nav-unit)); }\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-topnav-shell { top:calc(1.6 * var(--acg-unit) + 2.9 * var(--acg-nav-unit)) !important; left:calc(1.4 * var(--acg-unit)) !important; right:calc(1.4 * var(--acg-unit)) !important; }\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .agnative-leftdock { top:calc(2.4 * var(--acg-unit) + 5.8 * var(--acg-nav-unit)) !important; }\n  body.appletv-agnative-topnav.lmp-cinema-hero.acg-v18 .acg-detail .full-start-new__body { padding-top:calc(11 * var(--acg-unit)) !important; }\n}\n";
  var ready = false, syncTimer = null, startupTimer = null, pending = null;
  var heroNode = null, controllerHero = null, heroObserver = null, fullState = null, watchers = [];
  var dockController = null, upstreamRequest = null;
  var player = null, preview = null, previewTimer = null, previewDeadline = null, epoch = 0;
  var videoCache = {}, cacheOrder = [];
  var diagnostics = {version: VERSION, trailer: 'idle'};
  var preset = {
    appletv_agnative_topnav_enabled: 'on', appletv_agnative_topnav_visible: 'true',
    appletv_agnative_topnav_size: 'md', appletv_agnative_topnav_icons_order: 'end',
    appletv_agnative_hero_enabled: 'true', appletv_agnative_hero_align: 'bottom',
    appletv_agnative_hero_indicators: 'true', appletv_agnative_hero_interval: '40',
    appletv_agnative_hero_animation: 'false',
    appletv_agnative_hero_bg_anim: 'off', appletv_agnative_hero_quality: 'w1280',
    appletv_agnative_hero_trailer: 'false', appletv_agnative_backdrop: 'on',
    appletv_agnative_card_image_mode: 'backdrop', appletv_agnative_rating_style: 'mono',
    appletv_agnative_card_anim: 'off',
    background: true, background_type: 'simple', black_style: false,
    content_rows_shots_main: false
  };

  function get(key, fallback) { try { return Lampa.Storage.get(key, fallback); } catch (_) { return fallback; } }
  function set(key, value) { try { Lampa.Storage.set(key, value); } catch (_) {} }
  function enabled() { return String(get(PREFIX + 'enabled', 'true')) !== 'false'; }
  function qs(selector, root) { return (root || document).querySelector(selector); }
  function all(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function element(value) { return value && (value.nodeType ? value : value[0]); }
  function activePage() { return qs('.activity--active') || document; }
  function connected(node) { return !!(node && document.documentElement.contains(node)); }
  function remove(node) { if (node && node.parentNode) node.parentNode.removeChild(node); }
  function notify(message) { try { Lampa.Noty.show(message); } catch (_) {} }
  function originalValues() {
    var saved = get(PREFIX + 'original_values', {});
    if (typeof saved === 'string') { try { saved = JSON.parse(saved); } catch (_) { saved = {}; } }
    var copy = {};
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) Object.keys(saved).forEach(function (key) { copy[key] = saved[key]; });
    return copy;
  }
  function remember(key) {
    var saved = originalValues();
    if (!Object.prototype.hasOwnProperty.call(saved, key)) {
      saved[key] = get(key, null);
      set(PREFIX + 'original_values', JSON.stringify(saved));
    }
  }
  function change(key, value) {
    if (JSON.stringify(get(key, null)) === JSON.stringify(value)) return;
    remember(key); set(key, value);
  }
  function applyPreset() { Object.keys(preset).forEach(function (key) { change(key, preset[key]); }); }
  function restore() {
    var saved = originalValues();
    Object.keys(saved).forEach(function (key) { set(key, saved[key] === null ? '' : saved[key]); });
  }
  function visual() {
    var body = document.body;
    if (!body) return;
    if (!enabled()) { body.classList.remove('lmp-cinema-hero', 'acg-v18'); return; }
    body.classList.add('lmp-cinema-hero', 'acg-v18');
    // Lampa scales body, not html. Freeze that base in px so nested controls
    // stay proportional at 720p/1080p/4K without inheriting font multipliers.
    var unit = parseFloat(window.getComputedStyle(body).fontSize) || 16;
    body.style.setProperty('--acg-unit', unit + 'px');
    var scale = String(get(PREFIX + 'topbar_scale', '1.2'));
    if (['1', '1.1', '1.2'].indexOf(scale) < 0) scale = '1.2';
    body.style.setProperty('--acg-nav-scale', scale);
    body.style.setProperty('--acg-nav-unit', (unit * Number(scale)) + 'px');
    body.classList.toggle('acg-simple-glass', String(get(PREFIX + 'simple_glass', 'false')) === 'true');
    var spacing = String(get(PREFIX + 'row_gap', '3.2'));
    if (['2.4', '3.2', '4'].indexOf(spacing) < 0) spacing = '3.2';
    body.style.setProperty('--acg-row-gap', (Number(spacing) * unit) + 'px');
    if (!document.getElementById(STYLE_ID)) {
      var style = document.createElement('style'); style.id = STYLE_ID; style.textContent = CSS;
      (document.head || body).appendChild(style);
    }
  }
  var icons = {
    play: '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    settings: '<path d="m10 3-.6 2.1-2 .9-2-.5-2 3.5L5 10.5v3l-1.6 1.6 2 3.4 2-.5 2 .9.6 2.1h4l.6-2.1 2-.9 2 .5 2-3.4-1.6-1.6v-3l1.6-1.5-2-3.5-2 .5-2-.9L14 3z"/><circle cx="12" cy="12" r="3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
    next: '<path d="m9 5 7 7-7 7"/>',
    refresh: '<path d="M20 5v6h-6M4 19v-6h6M5.5 9a7 7 0 0 1 12-3L20 9M4 15l2.5 3a7 7 0 0 0 12-3"/>'
  };
  function svg(name) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[name] + '</svg>'; }
  function label(node, text) { node.setAttribute('title', text); node.setAttribute('aria-label', text); }
  function bind(node, fn) {
    if (node.__acgBound) return;
    node.__acgBound = true;
    var last = 0;
    function run(event) {
      if (event) { event.preventDefault(); event.stopPropagation(); }
      if (!enabled() || Date.now() - last < 250) return;
      last = Date.now(); fn();
    }
    node.addEventListener('click', run);
    node.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') run(event); });
    if (window.$) window.$(node).on('hover:enter.acg', run);
  }
  function button(name, text, icon, fn) {
    var node = document.createElement('div');
    node.className = 'selector acg-action acg-' + name;
    node.setAttribute('role', 'button'); node.setAttribute('tabindex', '0'); node.setAttribute('data-selector', 'true');
    label(node, text); node.innerHTML = svg(icon);
    var span = document.createElement('span'); span.textContent = text; node.appendChild(span);
    bind(node, fn); return node;
  }
  function nativeEnter(node) {
    if (!node) return false;
    if (window.$) window.$(node).trigger('hover:enter');
    else if (node.click) node.click();
    return true;
  }
  function cardData(node) {
    if (node.card_data) return node.card_data;
    if (window.$) return window.$(node).data('card') || window.$(node).data('json');
    return null;
  }
  function currentMovie(hero) {
    var title = qs('.agnative-hero__title', hero), bg = qs('.agnative-hero__bg', hero);
    var titleText = title ? title.textContent.trim() : '', image = bg ? bg.getAttribute('src') || '' : '';
    var cards = all('.items-line .card', activePage()), candidate = null;
    for (var i = 0; i < cards.length; i++) {
      var data = cardData(cards[i]);
      if (!data || !data.id || (data.title || data.name || '') !== titleText) continue;
      candidate = data;
      if (data.backdrop_path && image.indexOf(data.backdrop_path) >= 0) return data;
    }
    return candidate;
  }
  function isTV(movie) { return movie.media_type === 'tv' || !!(movie.first_air_date && !movie.release_date); }
  function metadata(host, movie, fallbackGenres, showRating) {
    host.textContent = '';
    var line = document.createElement('div'); line.className = 'acg-metadata';
    var tags = document.createElement('div'); tags.className = 'acg-tags';
    var values = [];
    if (movie) {
      var year = String(movie.release_date || movie.first_air_date || '').slice(0, 4);
      if (year) values.push(year);
      values.push(isTV(movie) ? 'Сериал' : 'Фильм');
      if (showRating !== false && Number(movie.vote_average) > 0) values.push('★ ' + Number(movie.vote_average).toFixed(1));
      if (Number(movie.runtime) > 0) values.push(movie.runtime + ' мин');
      if (isTV(movie) && Number(movie.number_of_seasons) > 0) values.push('Сезоны: ' + movie.number_of_seasons);
      if (isTV(movie) && Number(movie.number_of_episodes) > 0) values.push('Серии: ' + movie.number_of_episodes);
      try {
        var tmdb = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
        var age = tmdb && tmdb.parsePG && tmdb.parsePG(movie);
        if (age) values.push(String(age));
      } catch (_) {}
    }
    values.forEach(function (value) { var span = document.createElement('span'); span.textContent = value; line.appendChild(span); });
    var genres = movie && movie.genres ? movie.genres.map(function (genre) { return typeof genre === 'string' ? genre : genre.name; }) : [];
    if (!genres.length && fallbackGenres) genres = fallbackGenres.split(/\s*[·|,]\s*/);
    genres.filter(Boolean).slice(0, 4).forEach(function (value) { var span = document.createElement('span'); span.textContent = value; tags.appendChild(span); });
    host.appendChild(line); host.appendChild(tags);
  }
  function updateBookmark(node, movie) {
    if (!node || !movie || !Lampa.Favorite || !Lampa.Favorite.check) return;
    var status = Lampa.Favorite.check(movie), saved = !!status.book;
    node.setAttribute('aria-pressed', saved ? 'true' : 'false');
    label(node, saved ? 'Закладки: фильм сохранён' : 'Добавить в закладки или подборку');
  }
  function openFromHero(action, hero) {
    stopTrailer('navigation');
    var movie = currentMovie(hero);
    pending = {action:action, id:movie && movie.id, title:qs('.agnative-hero__title', hero).textContent, until:Date.now() + 12000};
    nativeEnter(qs('.agnative-hero__play', hero));
  }
  function folderButton(root) {
    var candidates = all('.buttons--container .full-start__button, .full-start-new__buttons .full-start__button', root);
    for (var i = 0; i < candidates.length; i++) {
      var node = candidates[i];
      if (node.classList.contains('button--book') || node.classList.contains('hide') || node.classList.contains('acg-action')) continue;
      if (/папк|подборк|коллекц/i.test(node.textContent + ' ' + (node.getAttribute('title') || ''))) return node;
    }
    return qs('.button--book', root);
  }
  function completePending(event) {
    if (!pending || !event.data || !event.data.movie) return;
    var action = pending, movie = event.data.movie, root = element(event.body);
    pending = null;
    if (Date.now() > action.until || !root) return;
    if (action.id && String(action.id) !== String(movie.id)) return;
    if (!action.id && action.title !== (movie.title || movie.name || '')) return;
    // Full's own groupButtons/toggle runs after the completion event.
    setTimeout(function () {
      if (!enabled() || !connected(root)) return;
      if (action.action === 'bookmark') nativeEnter(folderButton(root));
      else if (action.action === 'watch') {
        var play = qs('.button--play', root);
        if (play && !play.classList.contains('hide')) nativeEnter(play);
        else notify('Для просмотра выбери доступный источник в карточке фильма.');
      }
    }, 220);
  }
  function registerHeroController(hero) {
    if (controllerHero === hero || !window.__AGNATIVE_HERO_CONTROLLER__ || !Lampa.Controller || !Lampa.Controller.add || !window.$) return;
    controllerHero = hero;
    function move(direction) { if (window.Navigator && Navigator.canmove(direction)) Navigator.move(direction); else if (direction === 'left') Lampa.Controller.toggle('menu'); }
    Lampa.Controller.add('agnative_hero', {
      toggle:function () {
        if (!enabled() || !connected(hero)) { Lampa.Controller.toggle('content'); return; }
        hero.classList.remove('agnative-hero--hidden', 'agnative-hero--unfocused');
        document.body.classList.remove('agnative-hero-collapsed');
        try {
          var scrollBody = hero.closest('.scroll__body');
          if (scrollBody) { scrollBody.style.transform = 'translate3d(0,0,0)'; scrollBody.style.webkitTransform = 'translate3d(0,0,0)'; }
          var scrollHost = hero.closest('.scroll'); if (scrollHost) scrollHost.scrollTop = 0;
        } catch (_) {}
        Lampa.Controller.collectionSet(window.$(hero), false, true);
        Lampa.Controller.collectionFocus(qs('.acg-watch', hero), window.$(hero), true);
      },
      left:function () { move('left'); }, right:function () { move('right'); },
      up:function () { Lampa.Controller.toggle('head'); },
      down:function () { Lampa.Controller.toggle('content'); },
      back:function () { Lampa.Activity.backward(); }
    });
    var current = Lampa.Controller.enabled && Lampa.Controller.enabled();
    if (current && current.name === 'agnative_hero') Lampa.Controller.toggle('agnative_hero');
  }
  function enhanceHero() {
    var hero = qs('.agnative-hero', activePage());
    if (!hero) {
      if (heroObserver) heroObserver.disconnect();
      heroObserver = null; heroNode = null; return;
    }
    var content = qs('.agnative-hero__content', hero), native = qs('.agnative-hero__play', hero);
    if (!content || !native) return;
    if (!hero.classList.contains('acg-enhanced')) {
      hero.classList.add('acg-enhanced');
      var meta = document.createElement('div'); meta.className = 'acg-meta-block';
      content.insertBefore(meta, qs('.agnative-hero__overview', content));
      var row = document.createElement('div'); row.className = 'acg-hero-actions';
      row.appendChild(button('watch', 'Смотреть', 'play', function () { openFromHero('watch', hero); }));
      row.appendChild(button('bookmark', 'Добавить в закладки или подборку', 'bookmark', function () { openFromHero('bookmark', hero); }));
      native.classList.add('acg-action', 'acg-details'); native.setAttribute('role', 'button'); label(native, 'Подробнее');
      native.innerHTML = svg('info') + '<span>Подробнее</span>'; row.appendChild(native);
      row.appendChild(button('next', 'Следующий фильм', 'next', function () {
        var dots = all('.agnative-hero__indicator', hero), index = 0;
        dots.forEach(function (dot, i) { if (dot.classList.contains('agnative-hero__indicator--active')) index = i; });
        // AgNative's indicators use DOM click, not Lampa's hover:enter.
        if (dots.length) dots[(index + 1) % dots.length].click();
      }));
      content.appendChild(row);
    }
    var movie = currentMovie(hero), genreNode = qs('.agnative-hero__meta', hero);
    var genres = genreNode ? genreNode.textContent : '';
    var yearNode = qs('.agnative-hero__year', hero), year = yearNode ? yearNode.textContent : '';
    var key = JSON.stringify([movie && movie.id, genres, year, movie && movie.vote_average]);
    if (hero.__acgMeta !== key) {
      hero.__acgMeta = key;
      metadata(qs('.acg-meta-block', hero), movie || {release_date:year}, genres);
      updateBookmark(qs('.acg-bookmark', hero), movie);
    }
    registerHeroController(hero);
    if (heroNode !== hero && typeof MutationObserver === 'function') {
      if (heroObserver) heroObserver.disconnect();
      heroNode = hero; heroObserver = new MutationObserver(queueSync);
      heroObserver.observe(content, {childList:true, subtree:true});
    }
  }
  function enhanceDetail(event) {
    var root = element(event.body), movie = event.data && event.data.movie;
    if (!root || !movie) return;
    var header = qs('.full-start-new', root);
    if (!header) return;
    var right = qs('.full-start-new__right', header), actions = qs('.full-start-new__buttons', header);
    if (!right || !actions) return;
    header.classList.add('acg-detail');
    header.__acgData = event.data;
    var image = qs('.full-start__background', root);
    if (image && image.parentNode !== header) {
      header.__acgBackgroundParent = image.parentNode;
      header.insertBefore(image, header.firstChild);
    }
    var meta = qs('.acg-meta-block', header);
    if (!meta) { meta = document.createElement('div'); meta.className = 'acg-meta-block'; right.insertBefore(meta, qs('.full-start-new__rate-line', right)); }
    metadata(meta, movie, '', false);
    var overview = qs('.acg-detail-overview', header);
    if (!overview) { overview = document.createElement('div'); overview.className = 'acg-detail-overview'; right.insertBefore(overview, actions); }
    overview.textContent = movie.overview || '';
    decorateDetailButtons(header);
    if (trailersAllowed(event.data) && !qs('.acg-manual-trailer', actions)) {
      var manual = button('manual-trailer', 'Смотреть трейлер', 'play', function () {
        stopTrailer('manual');
        var native = qs('.view--trailer', root);
        if (native && !native.classList.contains('hide')) { nativeEnter(native); return; }
        videos(event.data, function (list) {
          if (!connected(header) || !activePage().contains(header)) return;
          if (!list.length) { notify('Для этого фильма трейлер пока не найден.'); return; }
          var items = list.map(function (video) {
            return {title:video.name || 'Трейлер', url:video.url || 'https://www.youtube.com/watch?v=' + video.key, youtube:!video.url, id:video.key};
          });
          function play(item) { if (Lampa.Player && Lampa.Player.play) { Lampa.Controller.toggle('content'); Lampa.Player.play(item); if (Lampa.Player.playlist) Lampa.Player.playlist(items); } }
          if (Lampa.Select && Lampa.Select.show) Lampa.Select.show({title:'Трейлеры', items:items, onSelect:play, onBack:function () { Lampa.Controller.toggle('content'); }});
          else play(items[0]);
        });
      });
      manual.classList.add('full-start__button'); actions.appendChild(manual);
    }
    fullState = {root:root, header:header, data:event.data};
    scheduleTrailer(fullState);
  }
  function decorateDetailButtons(header) {
    var actions = qs('.full-start-new__buttons', header); if (!actions) return;
    all('.full-start__button', actions).forEach(function (node) {
      // Priority providers are inserted by Lampa after the full completion event.
      // Keep their original handler and always expose the provider's label.
      var provider = node.classList.contains('button--priority') || /amedia|амедиа/i.test(node.textContent + ' ' + node.className);
      node.classList.toggle('acg-provider', provider);
      if (node.classList.contains('button--play')) label(node, 'Смотреть');
      else if (node.classList.contains('button--book')) label(node, 'Закладки и подборки');
      else if (node.classList.contains('button--options')) label(node, 'Ещё');
      else if (!node.getAttribute('title')) label(node, node.textContent.trim());
    });
  }
  function trailerEnabled() { return String(get(PREFIX + 'trailer_preview', 'true')) !== 'false'; }
  function trailersAllowed(data) { return !data.movie.adult && !(window.lampa_settings && lampa_settings.disable_features && lampa_settings.disable_features.trailers); }
  function setTrailerPreview(on) {
    set(PREFIX + 'trailer_preview', on ? 'true' : 'false');
    if (!on) stopTrailer('disabled');
    else if (fullState && connected(fullState.header)) scheduleTrailer(fullState, true);
  }
  function trailerStatus(reason) {
    diagnostics.trailer = reason;
  }

  /* Prefer videos already returned by Lampa. Its API keeps proxy/language handling. */
  function candidates(data) {
    var list = Array.isArray(data) ? data : (data && data.results) || [], seen = {};
    return list.map(function (video) {
      if (!video || (video.type && !/^(trailer|teaser)$/i.test(video.type))) return null;
      var direct = typeof video.url === 'string' && /^https:\/\/[^\s]+\.(mp4|webm)(\?|$)/i.test(video.url);
      var match = String(video.url || '').match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      var key = video.key || (match && match[1]), youtube = String(video.site || 'youtube').toLowerCase() === 'youtube' && video.youtube !== false;
      if (!direct && !(youtube && /^[A-Za-z0-9_-]{11}$/.test(key || ''))) return null;
      return {key:key, url:direct ? video.url : '', type:video.type || 'Trailer', official:video.official, name:video.name};
    }).filter(function (video) {
      if (!video) return false;
      var key = video.url || video.key;
      if (seen[key]) return false; seen[key] = true; return true;
    }).sort(function (a, b) {
      function score(v) { return (v.url ? 200 : 0) + (/^trailer$/i.test(v.type) ? 100 : 0) + (v.official ? 10 : 0); }
      return score(b) - score(a);
    });
  }
  function videos(data, done) {
    var movie = data.movie, found = candidates(data.videos || movie.videos);
    if (found.length) { done(found); return; }
    var key = (movie.source || 'tmdb') + '/' + (isTV(movie) ? 'tv/' : 'movie/') + movie.id;
    if (videoCache[key]) { done(videoCache[key]); return; }
    var sources = Lampa.Api && Lampa.Api.sources;
    var source = sources && (sources[movie.source] || sources.tmdb);
    var id = movie.id;
    if ((!source || typeof source.videos !== 'function') && sources && sources.tmdb && movie.tmdb_id) { source = sources.tmdb; id = movie.tmdb_id; }
    if (!source || typeof source.videos !== 'function') { done([]); return; }
    var finished = false;
    var timeout = setTimeout(function () { finish([]); }, 9000);
    function finish(result) {
      if (finished) return; finished = true; clearTimeout(timeout);
      if (result.length) {
        if (cacheOrder.length >= 20) delete videoCache[cacheOrder.shift()];
        cacheOrder.push(key); videoCache[key] = result;
      }
      done(result);
    }
    try { source.videos({id:id, method:isTV(movie) ? 'tv' : 'movie'}, function (result) { finish(candidates(result)); }, function () { finish([]); }); }
    catch (_) { finish([]); }
  }
  function releasePreview() {
    if (previewDeadline) clearTimeout(previewDeadline); previewDeadline = null;
    if (player) { try { player.destroy(); } catch (_) {} player = null; }
    if (preview) {
      var video = qs('video', preview);
      if (video) { video.onplaying = video.onerror = video.onwaiting = video.onstalled = video.onpause = null; try { video.pause(); video.removeAttribute('src'); video.load(); } catch (_) {} }
      remove(preview); preview = null;
    }
  }
  function stopTrailer(reason) {
    epoch++;
    if (previewTimer) clearTimeout(previewTimer); previewTimer = null;
    releasePreview(); trailerStatus(reason || 'stopped');
  }
  function scheduleTrailer(state, immediate) {
    stopTrailer('waiting');
    if (!enabled() || !trailerEnabled()) { trailerStatus('disabled'); return; }
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches && !immediate) { trailerStatus('reduced-motion'); return; }
    if (!trailersAllowed(state.data)) return;
    var token = epoch, waiting = 0, attempt = 0;
    function valid() { return token === epoch && enabled() && trailerEnabled() && connected(state.header) && activePage().contains(state.header) && !document.hidden; }
    function finish(reason) { if (token === epoch) stopTrailer(reason); }
    function load() {
      previewTimer = null;
      if (token !== epoch || !enabled() || !trailerEnabled()) return;
      // Full may complete before its cached Activity has been attached/activated.
      if (!valid()) {
        if (++waiting < 20) previewTimer = setTimeout(load, 250);
        else trailerStatus('inactive');
        return;
      }
      trailerStatus('loading-videos');
      videos(state.data, function (list) {
        if (!valid()) return;
        if (!list.length) { finish('no-trailer'); return; }
        var index = 0;
        function next(reason) {
          if (!valid()) return;
          releasePreview();
          if (index >= Math.min(list.length, 3)) { finish(reason || 'no-trailer'); return; }
          var selected = list[index++], serial = ++attempt;
          diagnostics.trailerAttempt = index;
          var holder = document.createElement('div'); holder.className = 'acg-trailer-preview'; holder.setAttribute('aria-hidden', 'true');
          state.header.insertBefore(holder, state.header.firstChild); preview = holder;
          function current() { return valid() && serial === attempt && preview === holder; }
          function retry(error) { if (current()) next(error); }
          function playing() {
            if (!current()) return;
            if (previewDeadline) clearTimeout(previewDeadline); previewDeadline = null;
            holder.classList.add('acg-trailer-playing'); trailerStatus('playing');
          }
          function buffering() {
            if (!current()) return;
            holder.classList.remove('acg-trailer-playing'); trailerStatus('buffering');
            if (!previewDeadline) previewDeadline = setTimeout(function () { retry('playback-timeout'); }, 18000);
          }
          previewDeadline = setTimeout(function () { retry('playback-timeout'); }, 18000);
          if (selected.url) {
            trailerStatus('loading-video');
            var video = document.createElement('video'); video.muted = true; video.defaultMuted = true; video.autoplay = true; video.loop = true;
            video.setAttribute('playsinline', ''); video.setAttribute('webkit-playsinline', ''); video.setAttribute('muted', ''); video.setAttribute('tabindex', '-1');
            video.onplaying = playing; video.onerror = function () { retry('video-error'); };
            video.onwaiting = video.onstalled = video.onpause = buffering;
            holder.appendChild(video); video.src = selected.url;
            try { var promise = video.play(); if (promise && promise.catch) promise.catch(function () { if (current()) finish('autoplay-blocked'); }); }
            catch (_) { retry('video-error'); }
            return;
          }
          // HTTPS supplies a real origin/referrer for Lampa's file:// WebViews.
          trailerStatus('loading-youtube');
          var frame = document.createElement('iframe'); frame.setAttribute('tabindex', '-1');
          frame.setAttribute('title', 'Фоновый трейлер'); frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
          frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
          var bridgeToken = 'acg_' + Date.now() + '_' + epoch + '_' + serial + '_' + Math.random().toString(36).slice(2);
          function receive(event) {
            if (!current() || event.source !== frame.contentWindow || event.origin !== TRAILER_ORIGIN) return;
            var message = event.data;
            if (!message || message.acgToken !== bridgeToken) return;
            if (message.state === 'playing') playing();
            else if (message.state === 'ready' || message.state === 'buffering') buffering();
            else if (message.state === 'error') retry('youtube-error-' + String(message.code || 'unknown'));
            else if (message.state === 'blocked') finish('autoplay-blocked');
          }
          window.addEventListener('message', receive);
          player = {destroy:function () {
            window.removeEventListener('message', receive);
            frame.onerror = null;
            try { frame.contentWindow.postMessage({acgToken:bridgeToken, command:'destroy'}, TRAILER_ORIGIN); } catch (_) {}
            remove(frame);
          }};
          frame.src = TRAILER_PAGE + '?v=' + VERSION + '&video=' + selected.key + '&token=' + bridgeToken;
          frame.onerror = function () { retry('youtube-unavailable'); };
          holder.appendChild(frame);
        }
        next();
      });
    }
    previewTimer = setTimeout(load, immediate ? 0 : 1200);
  }

  function syncCategories() {
    var menu = qs('.menu'); if (!menu) return;
    var source = all('.menu__item.selector[data-action]', menu), result = [];
    var groups = [ ['main', /^главная$|home/i], ['cartoon', /мультфильм/i], ['anime', /^аниме$|^anime$/i], ['movie', /^фильмы$/i], ['tv', /^сериалы$/i],
      ['dorama', /дорам/i], ['catalog', /каталог/i], ['filter', /фильтр/i], ['favorite', /избранн|закладки/i] ];
    groups.forEach(function (group) {
      for (var i = 0; i < source.length; i++) {
        var node = source[i], action = node.getAttribute('data-action');
        if (action === group[0] || group[1].test(node.textContent.trim())) { if (result.indexOf(action) < 0) result.push(action); break; }
      }
    });
    if (result.length) change('appletv_agnative_topnav_items', result);
    var wrap = qs('.agnative-topnav-shell__items');
    if (wrap) {
      var moved = {};
      all('[data-action]', wrap).forEach(function (node) { moved[node.getAttribute('data-action')] = true; });
      all('.agnative-leftdock__item[data-action]').forEach(function (node) {
        var hidden = !!moved[node.getAttribute('data-action')];
        node.classList.toggle('acg-top-hidden', hidden); node.classList.toggle('selector', !hidden);
        if (hidden) node.classList.remove('focus', 'is-active');
        // AgNative replaces native icons with letter circles. Restore Lampa's
        // own SVGs, including icons contributed by installed extensions.
        var original = source.filter(function (item) { return item.getAttribute('data-action') === node.getAttribute('data-action'); })[0];
        var icon = original && qs('.menu__ico', original), target = qs('.menu__ico', node);
        if (icon && target && qs('svg', icon) && target.innerHTML !== icon.innerHTML) target.innerHTML = icon.innerHTML;
      });
      if (!wrap.__acgFocus) {
        wrap.__acgFocus = true;
        function scroll(node) { var left = node.offsetLeft, right = left + node.offsetWidth; if (left < wrap.scrollLeft) wrap.scrollLeft = left; else if (right > wrap.scrollLeft + wrap.clientWidth) wrap.scrollLeft = right - wrap.clientWidth; }
        wrap.addEventListener('focusin', function (event) { scroll(event.target); });
        if (window.$) window.$(wrap).on('hover:focus.acg', '.agnative-topnav-shell__item', function () { scroll(this); });
      }
    }
    syncToolbar(); syncDock();
    var keyboard = all('.head [title], .head [aria-label]').filter(function (node) { return /keyboard|клавиат/i.test((node.getAttribute('title') || '') + (node.getAttribute('aria-label') || '')); })[0];
    if (keyboard && !qs('.acg-keyboard', menu)) {
      var group = qs('.menu__list', menu) || qs('.menu__case', menu);
      if (group) {
        var target = keyboard.closest ? keyboard.closest('.head__action') || keyboard : keyboard;
        var link = button('keyboard', 'Remote-клавиатура', 'info', function () { nativeEnter(target); });
        link.className = 'menu__item selector acg-keyboard'; link.setAttribute('data-action', 'acg-remote-keyboard');
        link.innerHTML = '<div class="menu__ico">⌨</div><div class="menu__text">Remote-клавиатура</div>';
        group.appendChild(link); target.style.display = 'none';
      }
    }
  }
  function syncToolbar() {
    var head = qs('.head__body') || qs('.head'); if (!head) return;
    function system(name, title, handler) {
      if (qs('.acg-system-action.acg-' + name, head)) return;
      var node = button(name, title, name, handler); node.classList.add('acg-system-action'); head.appendChild(node);
    }
    system('search', 'Поиск', function () {
      var native = qs('.menu [data-action="search"]') || qs('.head__action.open--search,.head__search') || qs('.agnative-topnav-shell [data-role="search"]');
      if (!nativeEnter(native) && Lampa.Search && Lampa.Search.open) Lampa.Search.open({});
    });
    system('refresh', 'Обновить', function () { if (Lampa.Activity.reload) Lampa.Activity.reload(); else location.reload(); });
    system('settings', 'Настройки', function () {
      var native = qs('.menu [data-action="settings"]') || qs('.head__action.open--settings,.head__settings,.settings-icon-holder') || qs('.agnative-topnav-shell [data-role="settings"]');
      if (nativeEnter(native)) return;
      if (Lampa.ParentalControl && Lampa.ParentalControl.personal) Lampa.ParentalControl.personal('settings', function () { Lampa.Controller.toggle('settings'); }, false, true);
      else Lampa.Controller.toggle('settings');
    });
    var menu = qs('.head__menu-icon', head), account = qs('.agnative-topnav-right__profile', head);
    if (menu) label(menu, 'Меню'); if (account) label(account, 'Аккаунт');
  }
  function syncDock() {
    var dock = qs('.agnative-leftdock'); if (!dock) return;
    all('.agnative-leftdock__case', dock).forEach(function (group) { group.classList.toggle('acg-empty', !qs('.agnative-leftdock__item:not(.acg-top-hidden)', group)); });
    all('.agnative-leftdock__split', dock).forEach(function (split) {
      var before = split.previousElementSibling, after = split.nextElementSibling;
      split.classList.toggle('acg-empty', !before || !after || before.classList.contains('acg-empty') || after.classList.contains('acg-empty'));
    });
    if (dockController === dock || !Lampa.Controller || !Lampa.Controller.add || !window.$) return;
    dockController = dock;
    function hide() { dock.classList.remove('is-visible'); var menu = qs('.head__menu-icon'); if (menu) menu.setAttribute('aria-expanded', 'false'); }
    function rememberFocus(event) {
      var node = event.target.closest && event.target.closest('.agnative-leftdock__item.selector');
      if (node) dock.__acgLastFocus = node;
    }
    dock.addEventListener('hover:focus', rememberFocus); dock.addEventListener('focusin', rememberFocus);
    window.$(dock).on('hover:focus.acg', '.agnative-leftdock__item.selector', function () { dock.__acgLastFocus = this; });
    Lampa.Controller.add('agnative_leftdock', {
      toggle:function () {
        dock.classList.add('is-visible');
        var menu = qs('.head__menu-icon'); if (menu) menu.setAttribute('aria-expanded', 'true');
        var target = dock.__acgLastFocus;
        if (!target || !connected(target) || target.classList.contains('acg-top-hidden')) target = qs('.agnative-leftdock__item.selector.is-active', dock) || qs('.agnative-leftdock__item.selector', dock);
        Lampa.Controller.collectionSet(window.$(dock), false, true);
        Lampa.Controller.collectionFocus(target, window.$(dock), true);
        if (target) {
          var top = target.getBoundingClientRect().top - dock.getBoundingClientRect().top + dock.scrollTop;
          dock.scrollTop = Math.max(0, top - dock.clientHeight / 3);
        }
      },
      gone:hide, update:function () {},
      up:function () { if (window.Navigator) Navigator.move('up'); },
      down:function () { if (window.Navigator) Navigator.move('down'); },
      left:function () {},
      right:function () { hide(); Lampa.Controller.toggle('content'); },
      back:function () { hide(); Lampa.Controller.toggle('content'); }
    });
  }
  function observe(node, deep) {
    if (!node || node.__acgWatched || typeof MutationObserver !== 'function') return;
    node.__acgWatched = true;
    var observer = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var nodes = records[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) if (nodes[j].nodeType === 1) { queueSync(); return; }
        if (records[i].removedNodes.length && heroNode && !connected(heroNode)) { queueSync(); return; }
      }
    });
    observer.observe(node, {childList:true, subtree:!!deep}); watchers.push({node:node, observer:observer});
  }
  function sync() {
    syncTimer = null; if (!enabled()) return;
    try {
      visual(); syncCategories(); enhanceHero(); syncFeedScroll();
      watchers = watchers.filter(function (watch) { if (!connected(watch.node)) { watch.observer.disconnect(); delete watch.node.__acgWatched; return false; } return true; });
      var header = qs('.acg-detail', activePage());
      if (header) decorateDetailButtons(header);
      if (header && header.__acgData && (!fullState || fullState.header !== header)) {
        fullState = {root:header.parentNode, header:header, data:header.__acgData}; scheduleTrailer(fullState);
      }
      observe(qs('.head__body'), true); observe(qs('.menu__list'), true); observe(qs('.agnative-leftdock'), false);
      observe(qs('.activity--active .activity__body') || qs('.activity--active'), true);
    } catch (err) { diagnostics.lastError = String(err.message || err); }
  }
  function queueSync() { if (!syncTimer && enabled()) syncTimer = setTimeout(sync, 120); }
  function syncFeedScroll() {
    var page = activePage();
    if (qs('.acg-detail', page)) return;
    all('.items-line', page).forEach(function (row) {
      var scroll = row.closest && row.closest('.scroll');
      while (scroll && scroll.classList.contains('scroll--horizontal')) scroll = scroll.parentNode.closest('.scroll');
      if (scroll) scroll.classList.add('acg-feed-scroll');
    });
  }
  function cleanup() {
    stopTrailer('disabled'); pending = null; controllerHero = null;
    cancelUpstream();
    if (syncTimer) clearTimeout(syncTimer); syncTimer = null;
    if (startupTimer) clearInterval(startupTimer); startupTimer = null;
    watchers.forEach(function (watch) { watch.observer.disconnect(); delete watch.node.__acgWatched; }); watchers = [];
    if (heroObserver) heroObserver.disconnect(); heroObserver = null;
    all('.acg-system-action').forEach(remove);
    all('.acg-feed-scroll').forEach(function (node) { node.classList.remove('acg-feed-scroll'); });
    all('.agnative-leftdock__item.acg-top-hidden').forEach(function (node) { node.classList.remove('acg-top-hidden'); node.classList.add('selector'); });
    all('.agnative-leftdock .acg-empty').forEach(function (node) { node.classList.remove('acg-empty'); });
    all('.agnative-hero.acg-enhanced').forEach(function (hero) {
      var native = qs('.agnative-hero__play', hero);
      if (native) { native.classList.remove('acg-action', 'acg-details'); native.textContent = 'Смотреть'; hero.appendChild(native); }
      remove(qs('.acg-hero-actions', hero)); remove(qs('.acg-meta-block', hero)); hero.classList.remove('acg-enhanced');
    });
    all('.acg-detail').forEach(function (header) {
      var image = qs('.full-start__background', header);
      if (image && header.__acgBackgroundParent) header.__acgBackgroundParent.insertBefore(image, header.__acgBackgroundParent.firstChild);
      all('.acg-meta-block,.acg-detail-overview,.acg-action', header).forEach(remove); header.classList.remove('acg-detail');
      all('.acg-provider', header).forEach(function (node) { node.classList.remove('acg-provider'); });
      delete header.__acgData;
    });
  }
  function settings() {
    if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;
    Lampa.SettingsApi.addComponent({component:'lmp_apple_cinema_gold', name:'Apple Cinema Gold', icon:svg('play')});
    function param(name, type, title, description, values, fallback, onChange) {
      var config = {name:PREFIX + name, type:type, default:fallback}; if (values) config.values = values;
      Lampa.SettingsApi.addParam({component:'lmp_apple_cinema_gold', param:config, field:{name:title, description:description}, onChange:onChange});
    }
    param('enabled', 'trigger', 'Apple Cinema Gold 1.8.1', 'Стекло, шампань и кинематографичная главная страница.', null, 'true', function (v) {
      set(PREFIX + 'enabled', String(v)); if (!enabled()) { cleanup(); restore(); } else { applyPreset(); ensureUpstream(); queueSync(); } visual();
    });
    param('topbar_scale', 'select', 'Размер верхней панели', 'Категории по центру, системные кнопки отдельно.', {'1':'Компактный','1.1':'На 10% крупнее','1.2':'На 20% крупнее, по макету'}, '1.2', function (v) { set(PREFIX + 'topbar_scale', String(v)); visual(); });
    param('row_gap', 'select', 'Расстояние между каруселями', 'Вертикальное пространство между рядами фильмов.', {'2.4':'Умеренное','3.2':'Свободное, по макету','4':'Максимальное'}, '3.2', function (v) { set(PREFIX + 'row_gap', String(v)); visual(); });
    param('trailer_preview', 'trigger', 'Фоновый трейлер в карточке', 'Включён по умолчанию, без звука. Если видео недоступно, остаётся постер.', null, 'true', function (v) { setTrailerPreview(String(v) !== 'false'); });
    param('simple_glass', 'trigger', 'Упростить стеклянные эффекты', 'Уменьшить нагрузку на слабый телевизор, сохранив цветовую гамму.', null, 'false', function (v) { set(PREFIX + 'simple_glass', String(v)); visual(); });
    param('restore', 'button', 'Вернуть прежние настройки', 'Отключить оформление и восстановить исходные параметры. Затем перезапусти Lampa.', null, '', function () { set(PREFIX + 'enabled','false'); cleanup(); restore(); visual(); notify('Настройки восстановлены. Перезапусти Lampa.'); });
  }
  function cancelUpstream() {
    if (!upstreamRequest) return;
    clearTimeout(upstreamRequest.timer);
    upstreamRequest.node.onload = upstreamRequest.node.onerror = null;
    remove(upstreamRequest.node); upstreamRequest = null;
  }
  function ensureUpstream() {
    if (window.__APPLETV_AGNATIVE_TOPNAV__) { diagnostics.upstream = 'already-loaded'; return; }
    if (upstreamRequest || qs('script[data-apple-cinema-upstream]')) return;
    function load(index) {
      if (!enabled()) return;
      if (window.__APPLETV_AGNATIVE_TOPNAV__) { diagnostics.upstream = 'already-loaded'; return; }
      if (index >= UPSTREAM_URLS.length) {
        diagnostics.upstream = 'unavailable'; diagnostics.lastError = 'AgNative 0.4.1 could not be loaded';
        notify('Apple Cinema Gold: не удалось загрузить тему. Проверь подключение и перезапусти Lampa.');
        return;
      }
      var script = document.createElement('script');
      var request = {node:script, timer:null}; upstreamRequest = request;
      diagnostics.upstream = 'loading-0.4.1';
      script.async = true; script.crossOrigin = 'anonymous';
      script.integrity = UPSTREAM_INTEGRITY;
      script.setAttribute('data-apple-cinema-upstream', '0.4.1');
      script.onload = function () {
        if (upstreamRequest !== request) return;
        clearTimeout(request.timer); script.onload = script.onerror = null; upstreamRequest = null;
        diagnostics.upstream = window.__APPLETV_AGNATIVE_TOPNAV__ ? 'ready-0.4.1' : 'initialization-error';
        queueSync();
      };
      function failed() {
        if (upstreamRequest !== request) return;
        cancelUpstream(); load(index + 1);
      }
      script.onerror = failed;
      request.timer = setTimeout(failed, 15000);
      script.src = UPSTREAM_URLS[index]; (document.head || document.body).appendChild(script);
    }
    load(0);
  }
  function boot() {
    if (ready || !document.body || !window.Lampa || !Lampa.Storage || typeof Lampa.Storage.get !== 'function' || typeof Lampa.Storage.set !== 'function') return;
    ready = true;
    if (String(get(PREFIX + 'v18_migrated', false)) !== 'true') {
      if (String(get(PREFIX + 'v17_migrated', false)) !== 'true') set(PREFIX + 'topbar_scale', '1.2');
      if (['2.4', '3.2', '4'].indexOf(String(get(PREFIX + 'row_gap', ''))) < 0) set(PREFIX + 'row_gap', '3.2');
      set(PREFIX + 'trailer_preview', 'true');
      if (enabled()) applyPreset();
      set(PREFIX + 'v18_migrated', 'true');
    }
    visual();
    try { settings(); } catch (err) { diagnostics.lastError = String(err.message || err); }
    if (enabled()) { ensureUpstream(); sync(); }
    if (Lampa.Listener && Lampa.Listener.follow) {
      Lampa.Listener.follow('full', function (event) {
        if (!enabled() || !event) return;
        if (/^(complite|complete)$/.test(String(event.type))) {
          try { enhanceDetail(event); completePending(event); queueSync(); }
          catch (err) { diagnostics.lastError = String(err.message || err); }
        }
        else if (event.type === 'start' || event.type === 'destroy') stopTrailer('navigation');
      });
      Lampa.Listener.follow('activity', function () {
        queueSync();
        if (fullState && (!connected(fullState.header) || !activePage().contains(fullState.header))) { stopTrailer('navigation'); fullState = null; }
      });
      Lampa.Listener.follow('player', function () { stopTrailer('player'); });
      Lampa.Listener.follow('resize_end', visual);
      Lampa.Listener.follow('state:changed', function (event) {
        if (!enabled() || !event || event.target !== 'favorite') return;
        if (heroNode && connected(heroNode)) updateBookmark(qs('.acg-bookmark', heroNode), currentMovie(heroNode));
      });
    }
    if (Lampa.Player && Lampa.Player.listener && Lampa.Player.listener.follow) {
      ['create', 'start', 'external'].forEach(function (event) {
        Lampa.Player.listener.follow(event, function () { stopTrailer('player'); });
      });
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopTrailer('hidden');
      else if (diagnostics.trailer === 'hidden' && fullState) scheduleTrailer(fullState);
    });
    var attempts = 0;
    startupTimer = setInterval(function () { if (++attempts >= 24 || !enabled()) { clearInterval(startupTimer); startupTimer = null; } else queueSync(); }, 500);
    diagnostics.startup = 'ready';
  }
  function safeBoot() {
    try { boot(); }
    catch (err) {
      diagnostics.startup = 'error'; diagnostics.lastError = String(err.message || err);
      if (window.console && console.error) console.error('Apple Cinema Gold startup', err);
      notify('Apple Cinema Gold: ошибка запуска оформления. Подробности в Консоли Lampa.');
    }
  }
  window.AppleCinemaGold = {version:VERSION, diagnostics:diagnostics};
  if (window.Lampa && Lampa.Listener && Lampa.Listener.follow) Lampa.Listener.follow('app', function (event) { if (event && event.type === 'ready') safeBoot(); });
  if (window.appready) safeBoot();
  if (!ready) {
    var attempts = 0, bootTimer = setInterval(function () {
      if (window.appready && window.Lampa) { safeBoot(); if (ready) clearInterval(bootTimer); }
      else if (++attempts >= 100) clearInterval(bootTimer);
    }, 200);
  }
})();
