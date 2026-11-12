/*
 * Apple Cinema Gold for Lampa - combined Apple Cinema Hero + Gold Theme aesthetics.
 * Version: 1.3.1 (2026-11-12)
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
  var TOPBAR_CLASSES = ['lmp-cinema-topbar-1p5x', 'lmp-cinema-topbar-2x', 'lmp-cinema-topbar-3x'];

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
    var v = String(get(TOPBAR_SCALE, '1.5'));
    return v === '1' || v === '1.5' || v === '2' || v === '3' ? v : '1.5';
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

  var TOPBAR_CSS = magnifiedTopbarCSS(1.5, '1p5') + '\n' + magnifiedTopbarCSS(2) + '\n' + magnifiedTopbarCSS(3);
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
        document.body.classList.add('lmp-cinema-topbar-' + (scale === '1.5' ? '1p5' : scale) + 'x');
      }
      var mode = goldMode();
      if (mode !== 'off') {
        injectGoldStyle();
        document.body.classList.add('lmp-cinema-gold-' + mode);
      }
      injectDetailStyle();
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
            '1.5': '1,5×: компактная панель (новый размер)',
            '1': '1×: исходный размер Apple TV',
            '2': '2×: увеличенная панель',
            '3': '3×: очень крупная панель'
          },
          default: '1.5'
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
        param: {name: STORAGE_PREFIX + 'restore', type: 'button'},
        field: {
          name: 'Вернуть прежние настройки темы',
          description: 'Отключить надстройку и восстановить значения до установки. Перезапусти Lampa.'
        },
        onChange: function () {
          set(ENABLED, 'false');
          restorePreviousSettings();
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
      // Upgrade the previous 3x default to exactly half (1.5x) once.
      if (get(SCALE_MIGRATED, 'false') !== 'true') {
        if (String(get(TOPBAR_SCALE, '3')) === '3') set(TOPBAR_SCALE, '1.5');
        set(SCALE_MIGRATED, 'true');
      }
      if (enabled() && get(INITIALIZED, 'false') !== 'true') applyPreset();
      updateVisual();
      if (enabled()) ensureUpstream();
      registerSettings();
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