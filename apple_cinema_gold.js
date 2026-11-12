/*
 * Apple Cinema Gold for Lampa - combined Apple Cinema Hero + Gold Theme aesthetics.
 * Version: 1.5.0 (2026-11-12)
 * Purpose: Apple TV navigation, immersive cinematic hero and integrated gold palettes.
 * The AppleTV AgNative NG upstream is loaded separately and not embedded.
 * Gold palettes were reimplemented from the publicly documented BazZziliuS Gold Theme aesthetic.
 *
 * Safety:
 *  - no remote sources except optional upstream AppleTV AgNative NG JS
 *  - no changes to Lampa navigation/controller or content provider integrations
 *  - reversible settings snapshot
 *  - no MutationObserver, infinite loops, or general DOM rewrites
 *  - catches failures; default Lampa UI remains usable if upstream is unavailable
 */
(function () {
  'use strict';

  var GUARD = '__LMP_APPLE_CINEMA_GOLD_V12__';
  if (window[GUARD]) return;
  window[GUARD] = true;

  var UPSTREAM = 'https://llowmikee.github.io/AppleTVAGNativeNG/appletv_agnative.js';
  var STYLE_ID = 'lmp-apple-cinema-hero-style';
  var GOLD_STYLE_ID = 'lmp-apple-cinema-gold-style';
  var GOLD_MODE = 'lmp_apple_cinema_gold_mode';
  var TOPBAR_SCALE = 'lmp_apple_cinema_topbar_scale';
  var STORAGE_PREFIX = 'lmp_apple_cinema_';
  var SCALE_MIGRATED = STORAGE_PREFIX + 'v13_scale_migrated';
  var ENABLED = STORAGE_PREFIX + 'enabled';
  var INITIALIZED = STORAGE_PREFIX + 'preset_initialized';
  var SNAPSHOT = STORAGE_PREFIX + 'original_values';
  var SETTINGS_COMPONENT = 'lmp_apple_cinema_gold';
  var started = false;
  var settingsReady = false;
  var GOLD_CLASSES = ['lmp-cinema-gold-classic', 'lmp-cinema-gold-noir'];
  var TOPBAR_CLASSES = ['lmp-cinema-topbar-1p5x', 'lmp-cinema-topbar-2x', 'lmp-cinema-topbar-2p25x', 'lmp-cinema-topbar-3x'];
  var NAV_STYLE_ID = 'lmp-cinema-nav-champagne-v15';

  // Preset keys match the AppleTV AgNative NG v0.4.1 source. These belong to upstream, not a new API.
  var PRESET = {
    'appletv_agnative_topnav_enabled': 'on',
    'appletv_agnative_topnav_visible': 'true',
    'appletv_agnative_topnav_size': 'md',
    'appletv_agnative_hero_enabled': 'true',
    'appletv_agnative_hero_align': 'bottom',
    'appletv_agnative_hero_indicators': 'true',
    'appletv_agnative_hero_animation': 'true',
    'appletv_agnative_hero_interval': '40',
    'appletv_agnative_hero_bg_anim': 'off',
    'appletv_agnative_hero_quality': 'w1280',
    'appletv_agnative_hero_trailer': 'false',
    'appletv_agnative_backdrop': 'on',
    'appletv_agnative_card_image_mode': 'backdrop',
    'appletv_agnative_rating_style': 'mono',
    'appletv_agnative_perf_mode': 'auto'
  };

  function get(key, fallback) {
    try { return Lampa.Storage.get(key, fallback); }
    catch (err) { return fallback; }
  }
  function set(key, val) {
    try { Lampa.Storage.set(key, val); }
    catch (err) { /* Keep default UI functional. */ }
  }
  function enabled() { return get(ENABLED, 'true') !== 'false'; }
  function goldMode() {
    var mode = String(get(GOLD_MODE, 'noir'));
    return mode === 'classic' || mode === 'noir' ? mode : 'off';
  }

  function topbarScale() {
    var v = String(get(TOPBAR_SCALE, '2.25'));
    return v === '1' || v === '1.5' || v === '2' || v === '2.25' || v === '3' ? v : '2.25';
  }

  function snapshotOriginalSettings() {
    if (get(SNAPSHOT, null) !== null) return;
    var saved = {};
    Object.keys(PRESET).forEach(function (key) {
      saved[key] = get(key, null);
    });
    set(SNAPSHOT, JSON.stringify(saved));
  }

  function applyPreset() {
    snapshotOriginalSettings();
    Object.keys(PRESET).forEach(function (key) {
      set(key, PRESET[key]);
    });
    set(INITIALIZED, 'true');
  }

  function restorePreviousSettings() {
    var raw = get(SNAPSHOT, null);
    if (!raw) return;
    try {
      var original = JSON.parse(raw);
      Object.keys(PRESET).forEach(function (key) {
        if (!Object.prototype.hasOwnProperty.call(original, key)) return;
        var value = original[key];
        // Storage.set accepts values, including null; Lampa's own defaults
        // take effect if the original setting did not exist.
        set(key, value === null ? '' : value);
      });
    } catch (err) { /* Never crash the app if stored JSON is malformed. */ }
    set(INITIALIZED, 'false');
  }

  var CSS = [
    'body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero {',
    '  width: calc(100% + 5em) !important;',
    '  margin: -0.75em -2.5em 0 !important;',
    '  height: 76vh !important;',
    '  max-height: 980px !important;',
    '  min-height: 420px !important;',
    '  border: 0 !important;',
    '  border-radius: 0 !important;',
    '  box-shadow: none !important;',
    '  overflow: hidden !important;',
    '  background: #0c1019 !important;',
    '}',
    'body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__bg {',
    '  width: 100% !important;',
    '  height: 100% !important;',
    '  min-height: 100% !important;',
    '  object-fit: cover !important;',
    '  object-position: center center !important;',
    '  border-radius: 0 !important;',
    '}',
    'body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero::before {',
    '  border-radius: 0 !important;',
    '  background: linear-gradient(90deg, rgba(2,6,12,.82) 0%, rgba(3,7,14,.48) 28%, rgba(3,7,14,.08) 67%, transparent 86%) !important;',
    '}',
    'body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero::after {',
    '  content: ""; display: block; position: absolute; pointer-events: none;',
    '  left: 0; right: 0; bottom: 0; height: 48%; z-index: 1;',
    '  background: linear-gradient(180deg, transparent 2%, rgba(7,9,14,.18) 35%, rgba(7,9,14,.92) 100%);',
    '}',
    'body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__content {',
    '  top: auto !important; bottom: 9.4em !important;',
    '  left: 4.3em !important; right: auto !important;',
    '  transform: none !important; max-width: 40% !important;',
    '  align-items: flex-start !important;',
    '}',
    'body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__logo {',
    '  max-height: 7em !important; max-width: 86% !important;',
    '  margin-bottom: .6em !important;',
    '}',
    'body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__title {',
    '  font-weight: 750 !important; font-size: 2.25em !important;',
    '  letter-spacing: -.015em !important;',
    '}',
    'body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__overview {',
    '  font-size: 1.02em !important; font-weight: 450 !important;',
    '  line-height: 1.5 !important; -webkit-line-clamp: 3 !important;',
    '  max-width: 92% !important; margin-bottom: 0 !important;',
    '}',
    'body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__play.selector::after {',
    '  content: "▶  Подробнее";',
    '  display: inline-flex; align-items: center; justify-content: center;',
    '  position: absolute; left: 4.3em; bottom: 4.35em;',
    '  padding: .55em 1.15em; min-width: 8.8em;',
    '  border-radius: 99em; box-sizing: border-box;',
    '  font-size: 1.12rem; font-weight: 700; line-height: 1.45;',
    '  color: #18181c; background: rgba(255,255,255,.95);',
    '  box-shadow: 0 .35em 1.6em rgba(0,0,0,.3);',
    '  pointer-events: none;',
    '}',
    'body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__play.selector.focus::after,',
    'body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__play.selector.hover::after {',
    '  background: #fff; box-shadow: 0 0 0 .14em rgba(255,255,255,.55), 0 .35em 1.4em rgba(0,0,0,.35);',
    '}',
    'body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__indicators {',
    '  bottom: 2.5em !important;',
    '  border-radius: 99em !important;',
    '  background: rgba(7,9,14,.28) !important;',
    '}',
    'body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero + .items-line {',
    '  position: relative !important; z-index: 11 !important;',
    '  margin-top: -1em !important;',
    '}',
    '@media (max-width: 1000px) {',
    '  body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero { height: 67vh !important; min-height: 325px !important; }',
    '  body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__content { left: 3em !important; bottom: 7.6em !important; max-width: 51% !important; }',
    '  body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__play.selector::after { left: 3em; bottom: 3em; }',
    '}',
    '@media (prefers-reduced-motion: reduce) {',
    '  body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero { transition: none !important; }',
    '}'
  ].join('\n');

  // The gold layer is self-contained and opt-in by body class. It does not
  // load gold_theme.js, so Lampa only needs one custom plugin URL.
  var GOLD_CSS = [
    /* Gold Theme original-inspired scheme, warm cocoa / cream gradient. */
    'body.lmp-cinema-hero.lmp-cinema-gold-classic { background:#564335 !important; color:#dfd9ce; }',
    'body.lmp-cinema-hero.lmp-cinema-gold-classic.black--style { background:#201911 !important; }',
    'body.lmp-cinema-gold-classic .card__vote { color:#dfd9ce; }',
    'body.lmp-cinema-gold-classic .menu__item.focus, body.lmp-cinema-gold-classic .menu__item.traverse, body.lmp-cinema-gold-classic .menu__item.hover,',
    'body.lmp-cinema-gold-classic .settings-folder.focus, body.lmp-cinema-gold-classic .settings-param.focus, body.lmp-cinema-gold-classic .selectbox-item.focus,',
    'body.lmp-cinema-gold-classic .selectbox-item.hover, body.lmp-cinema-gold-classic .simple-button.focus, body.lmp-cinema-gold-classic .iptv-list__item.focus,',
    'body.lmp-cinema-gold-classic .head__action.focus, body.lmp-cinema-gold-classic .head__action.hover,',
    'body.lmp-cinema-gold-classic .player-panel .button.focus, body.lmp-cinema-gold-classic .search-source.active {',
    ' background:linear-gradient(100deg,#fef4de 1%,#edcfab 100%) !important; color:#17130d !important; }',
    'body.lmp-cinema-gold-classic .extensions__item, body.lmp-cinema-gold-classic .extensions__block-add { background-color:#423a32 !important; }',
    'body.lmp-cinema-gold-classic .iptv-channel { background-color:#624e3f !important; }',
    'body.lmp-cinema-gold-classic .torrent-file.focus, body.lmp-cinema-gold-classic .torrent-serial.focus { background:rgba(223,217,206,.35) !important; }',
    'body.lmp-cinema-gold-classic .torrent-item__size, body.lmp-cinema-gold-classic .torrent-item__exe, body.lmp-cinema-gold-classic .torrent-serial__size { background:#dfd9ce; color:#17130d; }',
    'body.lmp-cinema-gold-classic .agnative-topnav-shell__inner, body.lmp-cinema-gold-classic .agnative-topnav-rightdock {',
    ' background:rgba(32,25,17,.57) !important; border-color:rgba(254,244,222,.22) !important; }',
    'body.lmp-cinema-gold-classic .agnative-topnav-shell__item.is-active, body.lmp-cinema-gold-classic .agnative-topnav-shell__item.focus,',
    'body.lmp-cinema-gold-classic .agnative-topnav-shell__item.hover { background:rgba(254,244,222,.21) !important; color:#fff4de !important; }',
    'body.lmp-cinema-gold-classic .agnative-hero__play.selector::after {',
    ' background:linear-gradient(100deg,#fff8e6,#edcfab) !important; color:#201911 !important; }',
    'body.lmp-cinema-gold-classic .agnative-hero__indicator.active { background:#fef4de !important; }',

    /* More restrained gold-on-graphite premium palette. */
    'body.lmp-cinema-hero.lmp-cinema-gold-noir { background:#101114 !important; color:#f4f1ea; }',
    'body.lmp-cinema-hero.lmp-cinema-gold-noir.black--style { background:#101114 !important; }',
    'body.lmp-cinema-gold-noir .card__vote { color:#e9d7b6; }',
    'body.lmp-cinema-gold-noir .menu__item.focus, body.lmp-cinema-gold-noir .menu__item.traverse, body.lmp-cinema-gold-noir .menu__item.hover,',
    'body.lmp-cinema-gold-noir .settings-folder.focus, body.lmp-cinema-gold-noir .settings-param.focus, body.lmp-cinema-gold-noir .selectbox-item.focus,',
    'body.lmp-cinema-gold-noir .selectbox-item.hover, body.lmp-cinema-gold-noir .simple-button.focus, body.lmp-cinema-gold-noir .iptv-list__item.focus,',
    'body.lmp-cinema-gold-noir .head__action.focus, body.lmp-cinema-gold-noir .head__action.hover,',
    'body.lmp-cinema-gold-noir .player-panel .button.focus, body.lmp-cinema-gold-noir .search-source.active {',
    ' background:linear-gradient(105deg,#f4e5c7 0%,#d3ac74 100%) !important; color:#18140f !important; }',
    'body.lmp-cinema-gold-noir .extensions__item, body.lmp-cinema-gold-noir .extensions__block-add { background:#282620 !important; }',
    'body.lmp-cinema-gold-noir .torrent-file.focus, body.lmp-cinema-gold-noir .torrent-serial.focus { background:rgba(212,171,111,.20) !important; }',
    'body.lmp-cinema-gold-noir .torrent-item__size, body.lmp-cinema-gold-noir .torrent-item__exe, body.lmp-cinema-gold-noir .torrent-serial__size { background:#e4cfaa; color:#18140f; }',
    'body.lmp-cinema-gold-noir .agnative-topnav-shell__inner, body.lmp-cinema-gold-noir .agnative-topnav-rightdock {',
    ' background:rgba(17,18,22,.60) !important; border:1px solid rgba(218,183,122,.26) !important;',
    ' box-shadow:inset 0 1px 0 rgba(255,245,225,.10), 0 12px 30px rgba(0,0,0,.22) !important; }',
    'body.lmp-cinema-gold-noir .agnative-topnav-shell__item.is-active, body.lmp-cinema-gold-noir .agnative-topnav-shell__item.focus,',
    'body.lmp-cinema-gold-noir .agnative-topnav-shell__item.hover { background:rgba(218,183,122,.18) !important; color:#f5e8d1 !important; }',
    'body.lmp-cinema-gold-noir .agnative-hero__play.selector::after {',
    ' background:linear-gradient(100deg,#f4e5c7,#d3ac74) !important; color:#16120d !important; }',
    'body.lmp-cinema-gold-noir .agnative-hero__indicator.active { background:#dfc08e !important; }',

    /* Shared restrained gold accents for selection, playback and settings. */
    'body.lmp-cinema-gold-classic .card.focus .card__view::after, body.lmp-cinema-gold-classic .card.hover .card__view::after,',
    'body.lmp-cinema-gold-classic .extensions__item.focus::after, body.lmp-cinema-gold-classic .torrent-item.focus::after,',
    'body.lmp-cinema-gold-classic .online-prestige.focus::after { border-color:#fef4de !important; }',
    'body.lmp-cinema-gold-noir .card.focus .card__view::after, body.lmp-cinema-gold-noir .card.hover .card__view::after,',
    'body.lmp-cinema-gold-noir .extensions__item.focus::after, body.lmp-cinema-gold-noir .torrent-item.focus::after,',
    'body.lmp-cinema-gold-noir .online-prestige.focus::after { border-color:#d9b77a !important; }',
    'body.lmp-cinema-gold-classic .time-line > div, body.lmp-cinema-gold-classic .player-panel__position { background-color:#fef4de !important; }',
    'body.lmp-cinema-gold-noir .time-line > div, body.lmp-cinema-gold-noir .player-panel__position { background-color:#d9b77a !important; }',
    'body.lmp-cinema-gold-classic .settings-folder.focus .settings-folder__icon,',
    'body.lmp-cinema-gold-noir .settings-folder.focus .settings-folder__icon { filter:invert(1); }',
    '@media (prefers-reduced-motion:reduce) {',
    ' body.lmp-cinema-gold-classic .agnative-topnav-shell__item, body.lmp-cinema-gold-noir .agnative-topnav-shell__item { transition:none !important; }',
    '}'
  ].join('\n');

  // Magnified AppleTV top bar, targeting exact class names from upstream v0.4.1.
  // This enlarges *hit areas and SVGs*, not merely CSS-transforming their picture,
  // so focus/navigation and pointer targeting remain aligned on Android TV.
  // Center menu text is intentionally kept smaller than icons to avoid losing items.
  function magnifiedTopbarCSS(multiplier, suffix) {
    var factor = Number(multiplier);
    var scope = 'body.appletv-agnative-topnav.lmp-cinema-hero.lmp-cinema-topbar-' + (suffix || multiplier) + 'x';
    var height = (2.6 * factor).toFixed(2) + 'em';
    var button = (2.16 * factor).toFixed(2) + 'em';
    var icon = factor.toFixed(2) + 'em';
    var menuIcon = (1.1 * factor).toFixed(2) + 'em';
    var photo = (1.56 * factor).toFixed(2) + 'em';
    var padding = (0.21 * factor).toFixed(2) + 'em ' + (0.32 * factor).toFixed(2) + 'em';
    return [
      scope + ' .agnative-topnav-shell { height:' + height + ' !important; max-width:calc(100vw - 34em) !important; }',
      scope + ' .agnative-topnav-shell__inner { height:' + height + ' !important; min-height:' + height + ' !important; max-width:100% !important; box-sizing:border-box !important; padding:' + padding + ' !important; overflow-x:auto !important; overflow-y:hidden !important; scrollbar-width:none; }',
      scope + ' .agnative-topnav-shell__inner::-webkit-scrollbar { display:none; }',
      scope + ' .agnative-topnav-shell__item--icon.selector { height:' + button + ' !important; width:' + button + ' !important; min-width:' + button + ' !important; padding:0 !important; }',
      scope + ' .agnative-topnav-shell__item--icon svg { width:' + icon + ' !important; height:' + icon + ' !important; max-width:none !important; max-height:none !important; }',
      scope + ' .agnative-topnav-shell__item.selector:not(.agnative-topnav-shell__item--icon) { font-size:1.15em !important; height:' + (2.16 * factor / 1.15).toFixed(2) + 'em !important; padding:0 .78em !important; }',
      scope + ' .agnative-topnav-rightdock { height:' + height + ' !important; min-height:' + height + ' !important; box-sizing:border-box !important; padding:' + padding + ' !important; gap:.14em !important; }',
      scope + ' .agnative-topnav-rightdock .agnative-topnav-shell__item--icon.selector,' + scope + ' .agnative-topnav-rightdock .agnative-topnav-right__profile.selector { height:' + button + ' !important; width:' + button + ' !important; min-width:' + button + ' !important; }',
      scope + ' .agnative-topnav-right__profile-img { width:' + photo + ' !important; height:' + photo + ' !important; max-width:none !important; max-height:none !important; }',
      scope + ' .agnative-topnav-rightdock .agnative-topnav-clock { font-size:1.25em !important; height:' + (2.16 * factor / 1.25).toFixed(2) + 'em !important; min-width:' + (4.2 * factor / 1.25).toFixed(2) + 'em !important; padding:0 .5em !important; }',
      scope + ' .head__menu-icon { width:' + height + ' !important; height:' + height + ' !important; min-width:' + height + ' !important; }',
      scope + ' .head__menu-icon > *,' + scope + ' .head__menu-icon svg,' + scope + ' .head__menu-icon img { width:' + menuIcon + ' !important; height:' + menuIcon + ' !important; max-width:' + menuIcon + ' !important; max-height:' + menuIcon + ' !important; }',
      '@media (max-width:1100px) { ' + scope + ' .agnative-topnav-shell { max-width:calc(100vw - 26em) !important; } }'
    ].join('\n');
  }

  var TOPBAR_CSS = magnifiedTopbarCSS(1.5, '1p5') + '\n' + magnifiedTopbarCSS(2) + '\n' + magnifiedTopbarCSS(2.25, '2p25') + '\n' + magnifiedTopbarCSS(3);
  var TOPBAR_STYLE_ID = 'lmp-apple-cinema-topbar-style';
  var DETAIL_STYLE_ID = 'lmp-apple-cinema-design-13';
  function injectTopbarStyle() {
    if (document.getElementById(TOPBAR_STYLE_ID)) return;
    var node = document.createElement('style');
    node.id = TOPBAR_STYLE_ID;
    node.type = 'text/css';
    node.textContent = TOPBAR_CSS;
    (document.head || document.documentElement).appendChild(node);
  }


  // Styles for elegant controls, 25% larger carousel covers and Gold typography.
  // Unlike earlier versions, no settings/modal panel background or blur is overridden.
  var DETAIL_CSS = "\n/* Apple Cinema Gold 1.3: color and typography only inside menus and settings.\n   Preserve existing panel sizes, positioning, backgrounds, blur and opacity. */\nbody.lmp-cinema-hero.lmp-cinema-gold-noir {\n  --acg-text:#f2e8d9;--acg-metal:#d6b780;--acg-dim:#c2ab88;\n  --acg-glow:rgba(216,177,109,.23);--acg-cream:#f3e8d0;\n  --acg-primary:linear-gradient(112deg,#f9eed8 0%,#d7b482 100%);\n}\nbody.lmp-cinema-hero.lmp-cinema-gold-classic {\n  --acg-text:#f2e5d4;--acg-metal:#e9cca5;--acg-dim:#d8bb98;\n  --acg-glow:rgba(250,222,173,.22);--acg-cream:#fff6e7;\n  --acg-primary:linear-gradient(112deg,#fff8e9 0%,#eac9a0 100%);\n}\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .menu__item,\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .settings-folder,\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .settings-param,\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .settings__title,\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .menu__title {\n  font-family:system-ui,Roboto,Arial,sans-serif !important;\n  font-weight:500 !important;\n  letter-spacing:.018em !important;\n  color:var(--acg-text) !important;\n  text-shadow:0 1px 5px rgba(0,0,0,.34);\n  transition:color .18s ease,background .18s ease,box-shadow .18s ease !important;\n}\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .settings__title,\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .menu__title {\n  font-weight:600 !important;letter-spacing:.035em !important;\n  color:var(--acg-metal) !important;\n}\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .settings-folder__name,\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .settings-param__name,\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .menu__item-title {\n  font-weight:550 !important;letter-spacing:.02em !important;\n}\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .settings-param__descr,\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .settings-param__description {\n  color:var(--acg-dim) !important;letter-spacing:.008em !important;\n}\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .menu__item.focus,\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .menu__item.hover,\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .menu__item.traverse,\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .settings-folder.focus,\nbody.lmp-cinema-hero[class*=\"lmp-cinema-gold-\"] .settings-param.focus {\n  color:#231b13 !important;text-shadow:0 1px 0 rgba(255,255,255,.25) !important;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.38),0 5px 22px var(--acg-glow) !important;\n}\n/* The hero remains one real action: \"Подробнее\"; do not draw a fake \"Смотреть\" hit target. */\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__play.selector::after {\n  content:\"Подробнее\" !important;\n  font-family:system-ui,Roboto,Arial,sans-serif !important;\n  font-size:1.06rem !important;font-weight:620 !important;letter-spacing:.048em !important;\n  color:#241c13 !important;text-shadow:0 1px 0 rgba(255,255,255,.4) !important;\n  background:linear-gradient(115deg,rgba(255,252,244,.94),rgba(230,204,166,.81)) !important;\n  border:1px solid rgba(255,250,237,.66) !important;border-radius:.85em !important;\n  backdrop-filter:blur(16px) saturate(135%) !important;\n  -webkit-backdrop-filter:blur(16px) saturate(135%) !important;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.62),0 12px 32px rgba(0,0,0,.27),0 0 24px rgba(201,164,102,.10) !important;\n  transition:background .2s ease,box-shadow .2s ease !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__play.selector.focus::after,\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__play.selector.hover::after {\n  background:linear-gradient(115deg,#fffdf8,#e9c99b) !important;\n  box-shadow:inset 0 1px 0 #fff,0 0 0 2px rgba(247,225,190,.55),0 14px 36px rgba(0,0,0,.33) !important;\n}\n/* Film details: existing working watch/detail buttons, no event handler changes. */\nbody.lmp-cinema-hero .full-start__buttons .full-start__button,\nbody.lmp-cinema-hero .full-start-new__buttons .full-start__button,\nbody.lmp-cinema-hero .full-start-new__buttons .full-start-new__button,\nbody.lmp-cinema-hero .buttons--container .full-start__button {\n  font-family:system-ui,Roboto,Arial,sans-serif !important;\n  font-weight:600 !important;letter-spacing:.03em !important;\n  color:#f6e9d3 !important;text-shadow:0 1px 5px rgba(0,0,0,.35) !important;\n  background:linear-gradient(110deg,rgba(42,36,33,.56),rgba(101,79,54,.37)) !important;\n  border:1px solid rgba(238,206,159,.38) !important;\n  border-radius:.78em !important;\n  backdrop-filter:blur(13px) saturate(125%) !important;\n  -webkit-backdrop-filter:blur(13px) saturate(125%) !important;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.13),0 9px 24px rgba(0,0,0,.24) !important;\n  transition:color .18s ease,background .18s ease,box-shadow .18s ease !important;\n}\nbody.lmp-cinema-hero .full-start__buttons .full-start__button.view--online,\nbody.lmp-cinema-hero .full-start__buttons .full-start__button.view--torrent,\nbody.lmp-cinema-hero .full-start-new__buttons .full-start__button.view--online,\nbody.lmp-cinema-hero .full-start-new__buttons .full-start__button.view--torrent,\nbody.lmp-cinema-hero .buttons--container .full-start__button.view--online {\n  background:linear-gradient(112deg,rgba(253,242,222,.92),rgba(213,175,123,.84)) !important;\n  color:#201811 !important;text-shadow:0 1px 0 rgba(255,255,255,.25) !important;\n  border-color:rgba(255,249,227,.72) !important;\n}\nbody.lmp-cinema-hero .full-start__buttons .full-start__button.focus,\nbody.lmp-cinema-hero .full-start__buttons .full-start__button.hover,\nbody.lmp-cinema-hero .full-start-new__buttons .full-start__button.focus,\nbody.lmp-cinema-hero .full-start-new__buttons .full-start__button.hover,\nbody.lmp-cinema-hero .full-start-new__buttons .full-start-new__button.focus,\nbody.lmp-cinema-hero .buttons--container .full-start__button.focus {\n  background:linear-gradient(108deg,#fff7e9,#e6c28e) !important;color:#1b1510 !important;\n  text-shadow:none !important;border-color:rgba(255,248,229,.92) !important;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 0 0 2px rgba(240,209,160,.50),0 12px 28px rgba(0,0,0,.34) !important;\n}\n/* Enlarge actual carousel card widths by 25%, preserving layout flow and focus.\n   Exclude compact service/genre cards and grids. Upstream default width: 17.6em. */\nbody.appletv-agnative-topnav.lmp-cinema-hero:not([data-agnative-backdrop=\"off\"]) .items-line .card:not(.card--button-compact):not(.card--genre-compact):not(.streaming-card--button-compact) {\n  width:22em !important;flex:0 0 auto !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero[data-agnative-card-size=\"xs\"]:not([data-agnative-backdrop=\"off\"]) .items-line .card:not(.card--button-compact):not(.card--genre-compact):not(.streaming-card--button-compact) {width:17.5em !important;}\nbody.appletv-agnative-topnav.lmp-cinema-hero[data-agnative-card-size=\"sm\"]:not([data-agnative-backdrop=\"off\"]) .items-line .card:not(.card--button-compact):not(.card--genre-compact):not(.streaming-card--button-compact) {width:19.75em !important;}\nbody.appletv-agnative-topnav.lmp-cinema-hero[data-agnative-card-size=\"md\"]:not([data-agnative-backdrop=\"off\"]) .items-line .card:not(.card--button-compact):not(.card--genre-compact):not(.streaming-card--button-compact) {width:22em !important;}\nbody.appletv-agnative-topnav.lmp-cinema-hero[data-agnative-card-size=\"lg\"]:not([data-agnative-backdrop=\"off\"]) .items-line .card:not(.card--button-compact):not(.card--genre-compact):not(.streaming-card--button-compact) {width:24.25em !important;}\nbody.appletv-agnative-topnav.lmp-cinema-hero[data-agnative-card-size=\"xl\"]:not([data-agnative-backdrop=\"off\"]) .items-line .card:not(.card--button-compact):not(.card--genre-compact):not(.streaming-card--button-compact) {width:26.5em !important;}\nbody.appletv-agnative-topnav.lmp-cinema-hero[data-agnative-backdrop=\"off\"] .items-line .card:not(.card--button-compact):not(.card--genre-compact):not(.streaming-card--button-compact) {width:16.25em !important;flex:0 0 auto !important;}\nbody.appletv-agnative-topnav.lmp-cinema-hero[data-agnative-card-size=\"xs\"][data-agnative-backdrop=\"off\"] .items-line .card:not(.card--button-compact):not(.card--genre-compact):not(.streaming-card--button-compact) {width:13em !important;flex:0 0 auto !important;}\nbody.appletv-agnative-topnav.lmp-cinema-hero[data-agnative-card-size=\"sm\"][data-agnative-backdrop=\"off\"] .items-line .card:not(.card--button-compact):not(.card--genre-compact):not(.streaming-card--button-compact) {width:14.625em !important;flex:0 0 auto !important;}\nbody.appletv-agnative-topnav.lmp-cinema-hero[data-agnative-card-size=\"md\"][data-agnative-backdrop=\"off\"] .items-line .card:not(.card--button-compact):not(.card--genre-compact):not(.streaming-card--button-compact) {width:16.25em !important;flex:0 0 auto !important;}\nbody.appletv-agnative-topnav.lmp-cinema-hero[data-agnative-card-size=\"lg\"][data-agnative-backdrop=\"off\"] .items-line .card:not(.card--button-compact):not(.card--genre-compact):not(.streaming-card--button-compact) {width:17.875em !important;flex:0 0 auto !important;}\nbody.appletv-agnative-topnav.lmp-cinema-hero[data-agnative-card-size=\"xl\"][data-agnative-backdrop=\"off\"] .items-line .card:not(.card--button-compact):not(.card--genre-compact):not(.streaming-card--button-compact) {width:19.5em !important;flex:0 0 auto !important;}\n@media(prefers-reduced-motion:reduce){\n  body.lmp-cinema-hero .full-start__button,\n  body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__play.selector::after {transition:none !important;}\n}";
  function injectDetailStyle() {
    if (document.getElementById(DETAIL_STYLE_ID)) return;
    var node = document.createElement('style');
    node.id = DETAIL_STYLE_ID;
    node.type = 'text/css';
    node.textContent = DETAIL_CSS;
    (document.head || document.documentElement).appendChild(node);
  }


  var NAV_CSS = "\n/* Champagne glass 1.5. No settings window geometry changes. */\nbody.appletv-agnative-topnav.lmp-cinema-hero.lmp-cinema-gold-noir {\n --acg-text:#f4eee7;--acg-metal:#d5c1a2;--acg-dim:#bdb1a4;--acg-glow:rgba(217,191,151,.12);\n}\nbody.lmp-cinema-hero.lmp-cinema-gold-noir .menu__item.focus,\nbody.lmp-cinema-hero.lmp-cinema-gold-noir .settings-folder.focus,\nbody.lmp-cinema-hero.lmp-cinema-gold-noir .settings-param.focus,\nbody.lmp-cinema-hero.lmp-cinema-gold-noir .selectbox-item.focus {\n background:linear-gradient(100deg,rgba(216,197,170,.60),rgba(180,161,137,.52)) !important;\n color:#201e1b !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 4px 14px rgba(0,0,0,.15) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-topnav-shell__inner,\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-topnav-rightdock {\n background:rgba(29,31,34,.42) !important;border:1px solid rgba(234,216,189,.14) !important;\n backdrop-filter:blur(18px) saturate(105%) !important;-webkit-backdrop-filter:blur(18px) saturate(105%) !important;\n box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 10px 26px rgba(0,0,0,.12) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-topnav-shell__item.focus,\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-topnav-shell__item.is-active {\n background:rgba(216,197,170,.19) !important;color:#f9f2e7 !important;\n box-shadow:inset 0 1px 0 rgba(255,255,255,.18) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero {\n background:#0d1014 !important;border-radius:0 !important;box-shadow:none !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero::before {\n background:linear-gradient(90deg,rgba(9,12,16,.88) 0%,rgba(10,13,17,.59) 27%,rgba(10,13,17,.06) 66%,transparent 89%) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero::after {\n height:59% !important;background:linear-gradient(180deg,transparent 0%,rgba(10,12,15,.11) 38%,rgba(11,13,16,.95) 100%) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__title {\n color:#f0e8de !important;letter-spacing:.085em !important;font-weight:400 !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__overview {\n color:rgba(243,236,227,.82) !important;font-weight:400 !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__meta {\n display:block !important;font-size:.86em !important;color:#d3c3ae !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__play.selector::after {\n content:\"Подробнее\" !important;left:18em !important;bottom:4.35em !important;\n border-radius:1.25em !important;\n color:#eee5d8 !important;font-weight:500 !important;letter-spacing:.02em !important;\n background:linear-gradient(115deg,rgba(118,110,101,.32),rgba(43,45,48,.43)) !important;\n border:1px solid rgba(236,220,199,.24) !important;\n backdrop-filter:blur(18px) saturate(105%) !important;-webkit-backdrop-filter:blur(18px) saturate(105%) !important;\n box-shadow:inset 0 1px 0 rgba(255,255,255,.21),0 7px 18px rgba(0,0,0,.17) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__play.focus::after {\n border-color:rgba(248,230,204,.5) !important;box-shadow:0 0 0 2px rgba(236,218,187,.18) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__indicator.active {\n background:#ddcdb9 !important;\n}\nbody.lmp-cinema-hero .full-start-new__buttons .full-start__button {\n background:linear-gradient(110deg,rgba(102,96,88,.32),rgba(43,46,50,.42)) !important;\n color:#e9e0d7 !important;border:1px solid rgba(231,213,187,.25) !important;\n border-radius:1.3em !important;backdrop-filter:blur(20px) saturate(105%) !important;\n -webkit-backdrop-filter:blur(20px) saturate(105%) !important;\n box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 7px 18px rgba(0,0,0,.14) !important;\n}\nbody.lmp-cinema-hero .full-start-new__buttons .full-start__button.button--play {\n background:linear-gradient(115deg,rgba(224,211,193,.79),rgba(182,165,143,.67)) !important;\n color:#29241e !important;\n}\nbody.lmp-cinema-hero .full-start-new__buttons .full-start__button.focus {\n border-color:rgba(243,226,202,.78) !important;\n box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 0 0 2px rgba(235,214,181,.18) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .items-line .card__view {\n border-radius:.95em !important;box-shadow:0 7px 23px rgba(0,0,0,.16) !important;\n}\n\n\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-topnav-shell{\n left:5.6em !important;transform:none !important;\n width:calc(100vw - 19.4em) !important;max-width:calc(100vw - 19.4em) !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-topnav-shell__inner{\n width:100% !important;max-width:100% !important;overflow:hidden !important;display:flex !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-topnav-shell__items{\n flex:1 1 auto !important;min-width:0 !important;overflow-x:auto !important;overflow-y:hidden !important;\n justify-content:flex-start !important;scrollbar-width:none;overscroll-behavior-x:contain;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-topnav-shell__items::-webkit-scrollbar{display:none;}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-topnav-shell__items>.agnative-topnav-shell__item{\n flex-shrink:0 !important;white-space:nowrap !important;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-topnav-shell__right{flex-shrink:0 !important;}\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-topnav-shell__item[data-role=\"favorite\"],\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-topnav-shell__item[data-role=\"settings\"],\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-topnav-clock{display:none !important;}\nbody.appletv-agnative-topnav.lmp-cinema-hero .acg-refresh{display:inline-flex !important;align-items:center;justify-content:center;}\nbody.appletv-agnative-topnav.lmp-cinema-hero .acg-refresh svg{width:1.75em !important;height:1.75em !important;stroke:currentColor;}\nbody.lmp-cinema-hero .agnative-leftdock__item.acg-moved-to-top{display:none !important;}\n@media(max-width:1000px){\nbody.appletv-agnative-topnav.lmp-cinema-hero .agnative-topnav-shell{\n left:4.5em !important;width:calc(100vw - 15.2em) !important;max-width:calc(100vw - 15.2em) !important;}\n}\n\n\nbody.appletv-agnative-topnav.lmp-cinema-hero .acg-hero-actions {\n position:absolute;left:4.3em;bottom:4.4em;z-index:7;display:flex;gap:.6em;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .acg-hero-actions .selector {\n display:inline-flex;justify-content:center;align-items:center;cursor:pointer;\n padding:.64em 1.0em;min-width:9.4em;box-sizing:border-box;\n color:#f4eadd;background:linear-gradient(115deg,rgba(104,99,93,.33),rgba(41,44,48,.45));\n font:500 1.03rem/1.35 system-ui,Roboto,Arial,sans-serif;letter-spacing:.014em;\n border-radius:1.26em;border:1px solid rgba(238,220,195,.26);\n backdrop-filter:blur(21px) saturate(105%);-webkit-backdrop-filter:blur(21px) saturate(105%);\n box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 6px 19px rgba(0,0,0,.15);\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .acg-hero-actions .acg-watch {\n color:#29231d;background:linear-gradient(112deg,rgba(233,217,195,.85),rgba(180,160,136,.70));\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .acg-hero-actions .acg-save {\n min-width:2.9em;width:2.9em;\n}\nbody.appletv-agnative-topnav.lmp-cinema-hero .acg-hero-actions .selector.focus,\nbody.appletv-agnative-topnav.lmp-cinema-hero .acg-hero-actions .selector.hover {\n border-color:rgba(252,237,213,.8);box-shadow:0 0 0 2px rgba(233,211,183,.20);\n}\n@media(max-width:1000px){\n body.appletv-agnative-topnav.lmp-cinema-hero .acg-hero-actions{left:3em;bottom:3em;}\n body.appletv-agnative-topnav.lmp-cinema-hero .agnative-hero__play.selector::after{left:17.2em !important;bottom:3em !important;}\n}\n\n\nbody.lmp-cinema-hero .acg-trailer-preview{\n position:absolute;left:8em;top:0;width:100%;height:38em;z-index:1;\n background:transparent;pointer-events:none;overflow:hidden;\n -webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 26%,#000 76%,transparent 100%);\n mask-image:linear-gradient(90deg,transparent 0%,#000 26%,#000 76%,transparent 100%);\n}\nbody.lmp-cinema-hero .acg-trailer-preview iframe{\n width:100%;height:100%;position:absolute;left:0;top:0;border:0;pointer-events:none;opacity:.83;\n}\n\nbody.lmp-cinema-hero .acg-trailer-preview{opacity:.82;pointer-events:none;}\nbody.lmp-cinema-hero .full-start__info,body.lmp-cinema-hero .full-start-new__info,body.lmp-cinema-hero .full-start__buttons,body.lmp-cinema-hero .full-start-new__buttons{position:relative;z-index:3;}\nbody.appletv-agnative-topnav.lmp-cinema-hero .acg-hero-actions .selector{box-shadow:inset 0 1px 0 rgba(255,255,255,.17),0 6px 14px rgba(0,0,0,.16);}\n";

  var topnavLastSelection = '';
  var navSyncTimeout = null;
  var navWatchers = [];
  var navSyncRuns = 0;
  function nativeClick(n) {
    if(!n)return false;
    try{
      if(window.$){window.$(n).trigger('hover:enter');return true;}
      if(typeof n.click==='function'){n.click();return true;}
    }catch(err){}
    return false;
  }
  function bindCinemaAction(n,handler){
    if(!n||n.__acgBound)return;
    n.__acgBound=true;
    n.addEventListener('click',function(e){if(e){e.preventDefault();e.stopPropagation();}handler();});
    n.addEventListener('keydown',function(e){if(e&&(e.key==='Enter'||e.key===' ')){e.preventDefault();handler();}});
    try{if(window.$)window.$(n).on('hover:enter.acg',handler);}catch(err){}
  }
  function syncTopCategories(){
    if(!enabled()||!document.querySelectorAll)return;
    var menu=document.querySelector('.menu');if(!menu)return;
    var original=Array.prototype.slice.call(menu.querySelectorAll('.menu__item.selector[data-action]'));
    var specs=[
      {actions:['main'],re:/главная|^домой$/i,defaultAction:'main'},
      {actions:['cartoon'],re:/мультфильм|мультики/i,defaultAction:'cartoon'},
      {actions:['movie'],re:/^фильмы$/i,defaultAction:'movie'},
      {actions:['tv'],re:/^сериалы$/i,defaultAction:'tv'},
      {actions:['dorama','doramas','doramy'],re:/дорам/i},
      {actions:['catalog','catalogue'],re:/каталог/i},
      {actions:['filter','filters'],re:/фильтр/i},
      {actions:['favorite','bookmarks'],re:/избранн|закладки/i}
    ];
    var chosen=[],seen={};
    specs.forEach(function(spec){
      var action='';
      for(var i=0;i<original.length;i++){
        var node=original[i],code=node.getAttribute('data-action')||'';
        var label=(node.textContent||'').trim();
        if(spec.actions.indexOf(code)>=0||spec.re.test(label)){action=code;break;}
      }
      if(!action&&spec.defaultAction)action=spec.defaultAction;
      if(action&&!seen[action]){chosen.push(action);seen[action]=true;}
    });
    var serialized=JSON.stringify(chosen);
    if(chosen.length&&serialized!==topnavLastSelection){
      topnavLastSelection=serialized;
      set('appletv_agnative_topnav_items',chosen);
    }
  }
  function addRefresh(){
    var target=document.querySelector('.agnative-topnav-shell__right');
    if(!target||target.querySelector('.acg-refresh'))return;
    var n=document.createElement('div');
    n.className='agnative-topnav-shell__item agnative-topnav-shell__item--icon selector acg-refresh';
    n.setAttribute('data-role','refresh');n.setAttribute('data-selector','true');
    n.setAttribute('tabindex','0');n.setAttribute('title','Обновить Lampa');
    n.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 12-3l2 1M18.5 15a7 7 0 0 1-12 3l-2-1"/></svg>';
    bindCinemaAction(n,function(){
      try{
        if(Lampa.Activity&&typeof Lampa.Activity.reload==='function'){Lampa.Activity.reload();return;}
        if(window.location&&typeof window.location.reload==='function')window.location.reload();
      }catch(err){}
    });
    target.appendChild(n);
  }
  function keyboardToSidebar(){
    var menu=document.querySelector('.menu');if(!menu)return;
    var nodes=document.querySelectorAll('.head [title],.head [aria-label]');
    var original=null;
    for(var i=0;i<nodes.length;i++){
      var n=nodes[i],name=((n.getAttribute('title')||'')+' '+(n.getAttribute('aria-label')||'')).toLowerCase();
      if(/(?:remote|удал[её]нн).*(?:keyboard|клавиат)|(?:keyboard|клавиат)/i.test(name)){
        original=n.closest&&n.closest('.head__action')||n;break;
      }
    }
    if(!original)return; // Unknown remote keyboard plugin: do not hide a potentially vital control.
    var link=menu.querySelector('.acg-remote-menu-link');
    if(!link){
      var group=menu.querySelector('.menu__case');if(!group)return;
      link=document.createElement('div');
      link.className='menu__item selector acg-remote-menu-link';
      link.setAttribute('data-action','acg-remote-keyboard');
      link.setAttribute('data-selector','true');link.setAttribute('tabindex','0');
      link.innerHTML='<div class="menu__ico">⌨</div><div class="menu__text">Remote-клавиатура</div>';
      bindCinemaAction(link,function(){nativeClick(original);});
      group.appendChild(link);
    }
    if(link&&link.parentNode)original.style.display='none';
  }
  function hideMovedSidebarItems(){
    var dock=document.querySelector('.agnative-leftdock');
    var top=document.querySelector('.agnative-topnav-shell__items');
    if(!dock||!top)return;
    var moved={};
    Array.prototype.slice.call(top.querySelectorAll('.agnative-topnav-shell__item[data-action]')).forEach(function(x){
      moved[x.getAttribute('data-action')]=true;
    });
    Array.prototype.slice.call(dock.querySelectorAll('.agnative-leftdock__item[data-action]')).forEach(function(x){
      var hidden=!!moved[x.getAttribute('data-action')];
      if(hidden&&!x.classList.contains('acg-moved-to-top'))x.classList.add('acg-moved-to-top');
      if(!hidden&&x.classList.contains('acg-moved-to-top'))x.classList.remove('acg-moved-to-top');
    });
  }
  function scrollFocusedTab(){
    var wrap=document.querySelector('.agnative-topnav-shell__items');
    if(!wrap||wrap.__acgScrollBound)return;
    wrap.__acgScrollBound=true;
    wrap.addEventListener('focusin',function(e){
      try{e.target.scrollIntoView({block:'nearest',inline:'nearest'});}catch(err){}
    });
    try{
      if(window.$)window.$(wrap).on('hover:focus.acg', '.agnative-topnav-shell__item',function(){
        try{this.scrollIntoView({block:'nearest',inline:'nearest'});}catch(err){}
      });
    }catch(err){}
  }
  function syncNavigation(){
    if(!enabled()||!document.body)return;
    try{syncTopCategories();addRefresh();keyboardToSidebar();hideMovedSidebarItems();scrollFocusedTab();syncHeroActions();}
    catch(err){try{console.warn('[Apple Cinema Gold] Navigation:',err);}catch(ignore){}}
  }
  function queueNavigation(){
    if(navSyncTimeout)return;
    navSyncTimeout=setTimeout(function(){navSyncTimeout=null;syncNavigation();},200);
  }
  function watchNavigation(){
    if(!enabled()||typeof MutationObserver!=='function')return;
    var targets=[document.querySelector('.menu'),document.querySelector('.agnative-leftdock')];
    targets.forEach(function(node){
      if(!node||node.__acgObserved)return;
      node.__acgObserved=true;
      var obs=new MutationObserver(queueNavigation);
      obs.observe(node,{childList:true,subtree:false});
      navWatchers.push(obs);
    });
  }
  function beginNavigation(){
    if(!enabled())return;
    syncNavigation();watchNavigation();
    if(navSyncRuns>0)return;
    var attempts=0;
    var timer=setInterval(function(){
      attempts++;
      if(!enabled()||attempts>=18)clearInterval(timer);
      else{syncNavigation();watchNavigation();}
    },850);
    navSyncRuns=1;
  }


  var pendingHeroAction=null,pendingHeroTimer=null;
  function clearHeroAction(){
    pendingHeroAction=null;
    if(pendingHeroTimer){clearTimeout(pendingHeroTimer);pendingHeroTimer=null;}
  }
  function startHeroAction(action){
    var src=document.querySelector('.agnative-hero__play');
    if(!src)return;
    clearHeroAction();
    pendingHeroAction=action;
    pendingHeroTimer=setTimeout(clearHeroAction,9000);
    nativeClick(src);
  }
  function syncHeroActions(){
    var hero=document.querySelector('.agnative-hero');
    if(!hero||hero.querySelector('.acg-hero-actions')||!hero.querySelector('.agnative-hero__play'))return;
    var row=document.createElement('div');row.className='acg-hero-actions';
    var watch=document.createElement('div');
    watch.className='selector acg-watch';
    watch.setAttribute('data-selector','true');watch.setAttribute('tabindex','0');
    watch.textContent='▶ Смотреть';
    bindCinemaAction(watch,function(){startHeroAction('watch');});
    var book=document.createElement('div');
    book.className='selector acg-save';
    book.setAttribute('data-selector','true');book.setAttribute('tabindex','0');
    book.setAttribute('title','Добавить в избранное или папку');
    book.textContent='♡';
    bindCinemaAction(book,function(){startHeroAction('book');});
    row.appendChild(watch);row.appendChild(book);hero.appendChild(row);
  }
  function heroCardComplete(e) {
    if(!e||!(/^(complite|complete)$/.test(String(e.type)))||!pendingHeroAction)return;
    var action=pendingHeroAction;
    clearHeroAction();
    var el=e.body&&(e.body[0]||e.body);
    if(!el||!el.querySelector)return;
    var btn=el.querySelector(action==='book'?'.full-start__button.button--book':'.full-start__button.button--play');
    if(btn&&!btn.classList.contains('hide')){
      setTimeout(function(){if(btn.isConnected!==false)nativeClick(btn);},180);
    }
  }


  var TRAILER_KEY=STORAGE_PREFIX+'trailer_preview';
  var previewTimer=null,previewNode=null,previewAbort=null,previewEpoch=0;
  var trailerCache={},trailerCacheCount=0;
  function stopTrailerPreview(){
    previewEpoch++;
    if(previewTimer){clearTimeout(previewTimer);previewTimer=null;}
    if(previewAbort){try{previewAbort.abort();}catch(err){}previewAbort=null;}
    if(previewNode){try{previewNode.remove();}catch(err){}previewNode=null;}
  }
  function trailerIdFromTMDB(result){
    var list=(result&&result.results)||[];
    var candidates=list.filter(function(x){
      return x&&x.site==='YouTube'&&x.type==='Trailer'&&typeof x.key==='string'&&/^[A-Za-z0-9_-]{11}$/.test(x.key);
    });
    candidates.sort(function(a,b){return Number(!!b.official)-Number(!!a.official);});
    return candidates.length?candidates[0].key:null;
  }
  function getTrailer(kind,id,callback){
    var cacheKey=kind+'/'+id;
    if(Object.prototype.hasOwnProperty.call(trailerCache,cacheKey))return callback(trailerCache[cacheKey]);
    if(typeof window.fetch!=='function'||!Lampa.TMDB||typeof Lampa.TMDB.api!=='function'||typeof Lampa.TMDB.key!=='function')return callback(null);
    var url=Lampa.TMDB.api(kind+'/'+encodeURIComponent(id)+'/videos');
    var apiKey=Lampa.TMDB.key();
    if(typeof url!=='string'||!/^https:\/\//.test(url)||!apiKey)return callback(null);
    previewAbort=typeof AbortController==='function'?new AbortController():null;
    var options=previewAbort?{signal:previewAbort.signal}:{};
    function request(lang){
      var link=url+(url.indexOf('?')>=0?'&':'?')+'api_key='+encodeURIComponent(apiKey)+'&language='+encodeURIComponent(lang);
      return window.fetch(link,options).then(function(r){if(!r.ok)throw Error('TMDB request');return r.json();});
    }
    request('ru-RU').then(function(data){
      var found=trailerIdFromTMDB(data);
      if(found)return found;
      return request('en-US').then(trailerIdFromTMDB);
    }).then(function(found){if(trailerCacheCount>=20){trailerCache={};trailerCacheCount=0;}trailerCache[cacheKey]=found||null;trailerCacheCount++;callback(found||null);})
    .catch(function(){callback(null);});
  }
  function startBackgroundTrailer(e){
    if(!enabled()||get(TRAILER_KEY,'true')==='false')return;
    if(window.innerWidth&&window.innerWidth<800)return;
    if(typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var body=e.body&&(e.body[0]||e.body),film=e.data&&e.data.movie;
    if(!body||!film||!film.id||typeof body.querySelector!=='function')return;
    var img=body.querySelector('.full-start__background, .full-start-new__background, .full-start__bg, .full-start-new__bg');
    if(!img)return;
    stopTrailerPreview();
    var token=previewEpoch;
    var kind=(film.name||film.first_air_date)?'tv':'movie';
    previewTimer=setTimeout(function(){
      previewTimer=null;
      getTrailer(kind,film.id,function(key){
        if(!key||token!==previewEpoch||!img.parentNode||!enabled())return;
        var holder=document.createElement('div');
        holder.className='acg-trailer-preview';
        holder.style.zIndex='1';holder.style.pointerEvents='none';
        holder.setAttribute('aria-hidden','true');
        var frame=document.createElement('iframe');
        frame.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');
        frame.setAttribute('loading','lazy');
        frame.setAttribute('tabindex','-1');
        frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(key)+'?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&rel=0&playlist='+encodeURIComponent(key);
        frame.onerror=function(){if(previewNode===holder)stopTrailerPreview();};
        holder.appendChild(frame);
        img.parentNode.insertBefore(holder,img.nextSibling);
        previewNode=holder;
      });
    },3200);
  }
  function onDetailEvent(e){
    if(!e||!(/^(complite|complete)$/.test(String(e.type))))return;
    startBackgroundTrailer(e);
  }
  function initTrailerPreview(){
    if(!window.Lampa||!Lampa.Listener||typeof Lampa.Listener.follow!=='function')return;
    try{
      Lampa.Listener.follow('full',onDetailEvent);
      Lampa.Listener.follow('player',stopTrailerPreview);
      Lampa.Listener.follow('activity',function(){
        try{
          var current=Lampa.Activity&&Lampa.Activity.active&&Lampa.Activity.active();
          if(current&&current.component&&current.component!=='full')stopTrailerPreview();
        }catch(err){}
      });
    }catch(err){}
  }

  function injectNavStyle(){if(document.getElementById(NAV_STYLE_ID))return;var n=document.createElement('style');n.id=NAV_STYLE_ID;n.textContent=NAV_CSS;(document.head||document.documentElement).appendChild(n);}

  function injectGoldStyle() {
    if (document.getElementById(GOLD_STYLE_ID)) return;
    var node = document.createElement('style');
    node.id = GOLD_STYLE_ID;
    node.type = 'text/css';
    node.textContent = GOLD_CSS;
    (document.head || document.documentElement).appendChild(node);
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }
  function updateVisual() {
    if (!document.body) return;
    GOLD_CLASSES.forEach(function (name) { document.body.classList.remove(name); });
    TOPBAR_CLASSES.forEach(function (name) { document.body.classList.remove(name); });
    if (enabled()) {
      injectStyle();
      document.body.classList.add('lmp-cinema-hero');
      var scale = topbarScale();
      if (scale !== '1') {
        injectTopbarStyle();
        document.body.classList.add('lmp-cinema-topbar-' + (scale === '1.5' ? '1p5' : scale === '2.25' ? '2p25' : scale) + 'x');
      }
      var mode = goldMode();
      if (mode !== 'off') {
        injectGoldStyle();
        document.body.classList.add('lmp-cinema-gold-' + mode);
      }
      injectDetailStyle();
      injectNavStyle();
    } else {
      document.body.classList.remove('lmp-cinema-hero');
    }
  }

  function ensureUpstream() {
    // If the original theme is already installed, never load another copy.
    if (window.__APPLETV_AGNATIVE_TOPNAV__) return;
    if (document.querySelector('script[data-apple-cinema-upstream]')) return;
    var script = document.createElement('script');
    script.src = UPSTREAM;
    script.async = true;
    script.setAttribute('data-apple-cinema-upstream', 'true');
    script.onerror = function () {
      // Missing theme must not prevent standard Lampa from launching.
      try { console.warn('[Apple Cinema Hero] Upstream theme not available'); }
      catch (_) {}
    };
    (document.head || document.documentElement).appendChild(script);
  }

  function registerSettings() {
    if (settingsReady) return;
    if (!Lampa.SettingsApi || typeof Lampa.SettingsApi.addComponent !== 'function') return;
    settingsReady = true;
    try {
      Lampa.SettingsApi.addComponent({
        component: SETTINGS_COMPONENT,
        name: 'Apple Cinema Gold',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/></svg>'
      });
      Lampa.SettingsApi.addParam({
        component: SETTINGS_COMPONENT,
        param: {name: ENABLED, type: 'trigger', default: 'true'},
        field: {
          name: 'Большой кинематографичный баннер',
          description: 'Оформление Apple TV на главной. Понадобится перезапуск Lampa.'
        },
        onChange: function (v) {
          set(ENABLED, String(v));
          if (enabled()) { applyPreset(); ensureUpstream(); }
          else restorePreviousSettings();
          updateVisual();
        }
      });
      Lampa.SettingsApi.addParam({
        component: SETTINGS_COMPONENT,
        param: {
          name: GOLD_MODE,
          type: 'select',
          values: {
            noir: 'Тёмное золото (Apple Cinema Gold)',
            classic: 'Оригинальное Gold Theme',
            off: 'Без золотого оформления'
          },
          default: 'noir'
        },
        field: {
          name: 'Золотая цветовая схема',
          description: 'Тёмный графит с шампанью, оригинальная коричневая тема или без золота.'
        },
        onChange: function (v) {
          set(GOLD_MODE, String(v));
          updateVisual();
        }
      });
      Lampa.SettingsApi.addParam({
        component: SETTINGS_COMPONENT,
        param: {
          name: TOPBAR_SCALE,
          type: 'select',
          values: {
            '2.25': '2,25×: по макету',
            '1.5': '1,5×: компактная панель',
            '1': '1×: исходный размер Apple TV',
            '2': '2×: увеличенная панель',
            '3': '3×: очень крупная панель'
          },
          default: '2.25'
        },
        field: {
          name: 'Масштаб верхнего меню и иконок',
          description: 'Увеличивает иконки, их кнопки и высоту верхней панели. Текст меню увеличен умеренно, чтобы помещаться на экране.'
        },
        onChange: function (v) {
          set(TOPBAR_SCALE, String(v));
          updateVisual();
        }
      });
      Lampa.SettingsApi.addParam({
        component: SETTINGS_COMPONENT,
        param:{name:TRAILER_KEY,type:'trigger',default:'true'},
        field:{name:'Фоновый трейлер в карточке',description:'Автозапуск без звука при наличии ролика. На слабой приставке можно отключить.'},
        onChange:function(v){set(TRAILER_KEY,String(v));if(String(v)==='false')stopTrailerPreview();}
      });
      Lampa.SettingsApi.addParam({
        component: SETTINGS_COMPONENT,
        param: {name: STORAGE_PREFIX + 'restore', type: 'button'},
        field: {
          name: 'Вернуть прежние настройки темы',
          description: 'Отключить надстройку и восстановить значения до установки. Перезапусти Lampa.'
        },
        onChange: function () {
          set(ENABLED, 'false');
          restorePreviousSettings();
          stopTrailerPreview();
          clearHeroAction();
          updateVisual();
          try { if (Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show('Настройки восстановлены. Перезапусти Lampa.'); }
          catch (_) {}
        }
      });
    } catch (e) {
      // Settings API layouts differ between Lampa builds. Styling remains optional.
      try { console.warn('[Apple Cinema Hero] Cannot register settings:', e); }
      catch (_) {}
    }
  }

  function boot() {
    if (started || !window.Lampa || !Lampa.Storage) return;
    started = true;
    try {
      // Existing 1.5x default becomes 2.25x in the approved layout.
      if (get(STORAGE_PREFIX + 'v14_scale_migrated','false') !== 'true') {
        if(String(get(TOPBAR_SCALE,'1.5'))==='1.5')set(TOPBAR_SCALE,'2.25');
        set(STORAGE_PREFIX + 'v14_scale_migrated','true');
      }
      // Backward compatibility with earlier stored values.
      if (get(SCALE_MIGRATED, 'false') !== 'true') {
        if (String(get(TOPBAR_SCALE, '3')) === '3') set(TOPBAR_SCALE, '2.25');
        set(SCALE_MIGRATED, 'true');
      }
      if (enabled() && get(INITIALIZED, 'false') !== 'true') applyPreset();
      updateVisual();
      if (enabled()) ensureUpstream();
      registerSettings();
      if (enabled()) beginNavigation();
      if (enabled()) initTrailerPreview();
      if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow==='function') {
        try{Lampa.Listener.follow('full',heroCardComplete);}catch(err){}
      }
      if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow==='function') {
        try { Lampa.Listener.follow('activity',queueNavigation); }catch(err){}
      }
    } catch (e) {
      try { console.warn('[Apple Cinema Hero] Safe mode:', e); }
      catch (_) {}
    }
  }

  // Only proceed when Lampa initializes. The poll ends automatically.
  if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
    try {
      Lampa.Listener.follow('app', function (event) {
        if (event && event.type === 'ready') boot();
      });
    } catch (_) {}
  }
  if (window.appready) boot();
  else {
    var attempts = 0;
    var timer = setInterval(function () {
      attempts++;
      if (window.appready && window.Lampa && Lampa.Storage) {
        clearInterval(timer);
        boot();
      } else if (attempts >= 100) {
        clearInterval(timer);
      }
    }, 200);
  }
})();