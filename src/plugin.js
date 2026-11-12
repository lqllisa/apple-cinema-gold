/*
 * Apple Cinema Gold 1.7.0 (2026-11-12)
 * Single-file Lampa overlay. Build with python3 build.py.
 * AppleTV AgNative NG remains an external dependency; no upstream code is bundled.
 */
(function () {
  'use strict';
  if (window.__LMP_APPLE_CINEMA_GOLD_V12__) return;
  window.__LMP_APPLE_CINEMA_GOLD_V12__ = true;

  var VERSION = '1.7.0';
  var PREFIX = 'lmp_apple_cinema_';
  var STYLE_ID = 'lmp-apple-cinema-v17-style';
  var UPSTREAM = 'https://llowmikee.github.io/AppleTVAGNativeNG/appletv_agnative.js';
  var TRAILER_ORIGIN = 'https://lqllisa.github.io';
  var TRAILER_PAGE = TRAILER_ORIGIN + '/apple-cinema-gold/trailer.html';
  var CSS = __ACG_STYLES__;
  var ready = false, syncTimer = null, startupTimer = null, pending = null;
  var heroNode = null, controllerHero = null, heroObserver = null, fullState = null, watchers = [];
  var dockController = null;
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
    appletv_agnative_card_image_mode: 'backdrop', appletv_agnative_rating_style: 'mono'
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
  function remember(key) {
    var saved = {};
    try { saved = JSON.parse(get(PREFIX + 'original_values', '{}')) || {}; } catch (_) {}
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
    var saved = {};
    try { saved = JSON.parse(get(PREFIX + 'original_values', '{}')) || {}; } catch (_) {}
    Object.keys(saved).forEach(function (key) { set(key, saved[key] === null ? '' : saved[key]); });
  }
  function visual() {
    var body = document.body;
    if (!body) return;
    if (!enabled()) { body.classList.remove('lmp-cinema-hero', 'acg-v17'); return; }
    body.classList.add('lmp-cinema-hero', 'acg-v17');
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
    film: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 4v16M17 4v16M3 9h4m-4 6h4m10-6h4m-4 6h4"/>',
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
      var toggle = button('preview-toggle', 'Фоновый трейлер', 'film', function () { setTrailerPreview(!trailerEnabled()); });
      toggle.classList.add('full-start__button'); actions.appendChild(toggle);
      var status = document.createElement('div'); status.className = 'acg-trailer-status'; status.setAttribute('role', 'status'); right.appendChild(status);
    }
    updatePreviewToggle();
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
  function updatePreviewToggle() {
    all('.acg-preview-toggle').forEach(function (node) {
      var on = trailerEnabled(), text = on ? 'Фон: трейлер' : 'Фон: постер';
      label(node, on ? 'Выключить фоновый трейлер' : 'Включить фоновый трейлер');
      node.setAttribute('aria-pressed', on ? 'true' : 'false');
      var span = qs('span', node); if (span && span.textContent !== text) span.textContent = text;
    });
  }
  function setTrailerPreview(on) {
    set(PREFIX + 'trailer_preview', on ? 'true' : 'false'); updatePreviewToggle();
    if (!on) stopTrailer('disabled');
    else if (fullState && connected(fullState.header)) scheduleTrailer(fullState, true);
  }
  function trailerStatus(reason) {
    diagnostics.trailer = reason;
    if (!fullState) return;
    var status = qs('.acg-trailer-status', fullState.header); if (!status) return;
    var text = reason === 'no-trailer' ? 'Трейлер пока не найден' :
      /error|timeout|blocked|unavailable/.test(reason) ? 'Фоновое видео недоступно. Трейлер можно открыть кнопкой просмотра.' : '';
    if (status.textContent !== text) status.textContent = text;
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
      if (video) { video.onplaying = video.onerror = null; try { video.pause(); video.removeAttribute('src'); video.load(); } catch (_) {} }
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
          previewDeadline = setTimeout(function () { retry('playback-timeout'); }, 18000);
          if (selected.url) {
            trailerStatus('loading-video');
            var video = document.createElement('video'); video.muted = true; video.defaultMuted = true; video.autoplay = true; video.loop = true;
            video.setAttribute('playsinline', ''); video.setAttribute('webkit-playsinline', ''); video.setAttribute('muted', ''); video.setAttribute('tabindex', '-1');
            video.onplaying = playing; video.onerror = function () { retry('video-error'); };
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
            else if (message.state === 'ready') trailerStatus('buffering');
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
    var groups = [ ['main', /^главная$|home/i], ['cartoon', /мультфильм/i], ['movie', /^фильмы$/i], ['tv', /^сериалы$/i],
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
      visual(); syncCategories(); enhanceHero();
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
  function cleanup() {
    stopTrailer('disabled'); pending = null; controllerHero = null;
    if (syncTimer) clearTimeout(syncTimer); syncTimer = null;
    if (startupTimer) clearInterval(startupTimer); startupTimer = null;
    watchers.forEach(function (watch) { watch.observer.disconnect(); delete watch.node.__acgWatched; }); watchers = [];
    if (heroObserver) heroObserver.disconnect(); heroObserver = null;
    all('.acg-system-action').forEach(remove);
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
      all('.acg-meta-block,.acg-detail-overview,.acg-action,.acg-trailer-status', header).forEach(remove); header.classList.remove('acg-detail');
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
    param('enabled', 'trigger', 'Apple Cinema Gold 1.7', 'Стекло, шампань и кинематографичная главная страница.', null, 'true', function (v) {
      set(PREFIX + 'enabled', String(v)); if (!enabled()) { cleanup(); restore(); } else { applyPreset(); ensureUpstream(); queueSync(); } visual();
    });
    param('topbar_scale', 'select', 'Размер верхней панели', 'Категории по центру, системные кнопки отдельно.', {'1':'Компактный','1.1':'На 10% крупнее','1.2':'На 20% крупнее, по макету'}, '1.2', function (v) { set(PREFIX + 'topbar_scale', String(v)); visual(); });
    param('row_gap', 'select', 'Расстояние между каруселями', 'Вертикальное пространство между рядами фильмов.', {'2.4':'Умеренное','3.2':'Свободное, по макету','4':'Максимальное'}, '3.2', function (v) { set(PREFIX + 'row_gap', String(v)); visual(); });
    param('trailer_preview', 'trigger', 'Фоновый трейлер в карточке', 'Автоматически, без звука. Можно также переключить кнопкой «Фон» в карточке.', null, 'true', function (v) { setTrailerPreview(String(v) !== 'false'); });
    param('simple_glass', 'trigger', 'Упростить стеклянные эффекты', 'Уменьшить нагрузку на слабый телевизор, сохранив цветовую гамму.', null, 'false', function (v) { set(PREFIX + 'simple_glass', String(v)); visual(); });
    param('restore', 'button', 'Вернуть прежние настройки', 'Отключить оформление и восстановить исходные параметры. Затем перезапусти Lampa.', null, '', function () { set(PREFIX + 'enabled','false'); cleanup(); restore(); visual(); notify('Настройки восстановлены. Перезапусти Lampa.'); });
  }
  function ensureUpstream() {
    if (window.__APPLETV_AGNATIVE_TOPNAV__ || qs('script[data-apple-cinema-upstream]')) return;
    var script = document.createElement('script'); script.src = UPSTREAM; script.async = true;
    script.setAttribute('data-apple-cinema-upstream', 'true'); script.onload = queueSync;
    script.onerror = function () { diagnostics.lastError = 'Upstream unavailable'; }; (document.head || document.body).appendChild(script);
  }
  function boot() {
    if (ready || !window.Lampa || !Lampa.Storage) return;
    ready = true;
    if (get(PREFIX + 'v17_migrated', 'false') !== 'true') {
      set(PREFIX + 'topbar_scale', '1.2');
      if (['2.4', '3.2', '4'].indexOf(String(get(PREFIX + 'row_gap', ''))) < 0) set(PREFIX + 'row_gap', '3.2');
      if (enabled()) applyPreset();
      set(PREFIX + 'v17_migrated', 'true');
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
  }
  window.AppleCinemaGold = {version:VERSION, diagnostics:diagnostics};
  if (window.Lampa && Lampa.Listener && Lampa.Listener.follow) Lampa.Listener.follow('app', function (event) { if (event && event.type === 'ready') boot(); });
  if (window.appready) boot();
  else {
    var attempts = 0, bootTimer = setInterval(function () {
      if (window.appready && window.Lampa) { clearInterval(bootTimer); boot(); }
      else if (++attempts >= 100) clearInterval(bootTimer);
    }, 200);
  }
})();
