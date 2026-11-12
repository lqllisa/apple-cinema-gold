/*
 * Apple Cinema Gold 1.6.0 (2026-11-12)
 * Single-file Lampa overlay. Build with python3 build.py.
 * AppleTV AgNative NG remains an external dependency; no upstream code is bundled.
 */
(function () {
  'use strict';
  if (window.__LMP_APPLE_CINEMA_GOLD_V12__) return;
  window.__LMP_APPLE_CINEMA_GOLD_V12__ = true;

  var VERSION = '1.6.0';
  var PREFIX = 'lmp_apple_cinema_';
  var STYLE_ID = 'lmp-apple-cinema-v16-style';
  var UPSTREAM = 'https://llowmikee.github.io/AppleTVAGNativeNG/appletv_agnative.js';
  var TRAILER_ORIGIN = 'https://lqllisa.github.io';
  var TRAILER_PAGE = TRAILER_ORIGIN + '/apple-cinema-gold/trailer.html';
  var CSS = __ACG_STYLES__;
  var ready = false, syncTimer = null, startupTimer = null, pending = null;
  var heroNode = null, controllerHero = null, heroObserver = null, fullState = null, watchers = [];
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
    if (!enabled()) { body.classList.remove('lmp-cinema-hero', 'acg-v16'); return; }
    body.classList.add('lmp-cinema-hero', 'acg-v16');
    // Lampa scales body, not html. Freeze that base in px so nested controls
    // stay proportional at 720p/1080p/4K without inheriting font multipliers.
    var unit = parseFloat(window.getComputedStyle(body).fontSize) || 16;
    body.style.setProperty('--acg-unit', unit + 'px');
    var scale = String(get(PREFIX + 'topbar_scale', '1'));
    if (['1', '1.1', '1.2'].indexOf(scale) < 0) scale = '1';
    body.style.setProperty('--acg-nav-scale', scale);
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
    heart: '<path class="acg-heart" d="M20.5 5.5a5 5 0 0 0-7 0L12 7l-1.5-1.5a5 5 0 0 0-7 7L12 21l8.5-8.5a5 5 0 0 0 0-7z"/>',
    folder: '<path d="M3 6h6l2 2h10v11H3z"/><path d="M12 11v5m-2.5-2.5h5"/>',
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
  function updateFavorite(node, movie) {
    if (!node || !movie || !Lampa.Favorite || !Lampa.Favorite.check) return;
    var status = Lampa.Favorite.check(movie), saved = !!status.book;
    node.setAttribute('aria-pressed', saved ? 'true' : 'false');
    label(node, saved ? 'Убрать из избранного' : 'В избранное');
  }
  function toggleFavorite(movie, node) {
    if (!movie || !Lampa.Favorite || !Lampa.Favorite.toggle) { notify('Открой карточку, чтобы добавить фильм в избранное.'); return; }
    Lampa.Favorite.toggle('book', movie); updateFavorite(node, movie);
  }
  function openFromHero(action, hero) {
    stopTrailer('navigation');
    var movie = currentMovie(hero);
    if (action === 'favorite' && movie) { toggleFavorite(movie, qs('.acg-favorite', hero)); return; }
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
      if (action.action === 'favorite') toggleFavorite(movie, qs('.acg-favorite', root));
      else if (action.action === 'folder') nativeEnter(folderButton(root));
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
      row.appendChild(button('favorite', 'В избранное', 'heart', function () { openFromHero('favorite', hero); }));
      row.appendChild(button('folder', 'В папку или подборку', 'folder', function () { openFromHero('folder', hero); }));
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
      updateFavorite(qs('.acg-favorite', hero), movie);
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
    var favorite = qs('.acg-favorite', actions);
    if (!favorite) {
      favorite = button('favorite', 'В избранное', 'heart', function () { toggleFavorite(movie, favorite); });
      favorite.classList.add('full-start__button'); actions.insertBefore(favorite, qs('.button--book', actions));
    }
    updateFavorite(favorite, movie);
    all('.full-start__button', actions).forEach(function (node) {
      if (node.classList.contains('button--play')) label(node, 'Смотреть');
      else if (node.classList.contains('button--book')) label(node, 'В папку или подборку');
      else if (node.classList.contains('button--options')) label(node, 'Ещё');
      else if (!node.getAttribute('title')) label(node, node.textContent.trim());
    });
    var trailer = qs('.view--trailer', root);
    if (trailer && !trailer.classList.contains('hide') && !qs('.acg-manual-trailer', actions)) {
      var manual = button('manual-trailer', 'Трейлер', 'play', function () { stopTrailer('manual'); nativeEnter(trailer); });
      manual.classList.add('full-start__button'); actions.appendChild(manual);
    }
    fullState = {root:root, header:header, data:event.data};
    scheduleTrailer(fullState);
  }

  /* Prefer videos already returned by Lampa. Its API keeps proxy/language handling. */
  function candidates(data) {
    var list = Array.isArray(data) ? data : (data && data.results) || [];
    return list.filter(function (video) {
      return video && /^(trailer|teaser)$/i.test(video.type || '') &&
        ((String(video.site).toLowerCase() === 'youtube' && /^[A-Za-z0-9_-]{11}$/.test(video.key || '')) ||
        (typeof video.url === 'string' && /^https:\/\/[^\s]+\.(mp4|webm)(\?|$)/i.test(video.url)));
    }).sort(function (a, b) {
      function score(v) { return (/^trailer$/i.test(v.type) ? 100 : 0) + (v.official ? 10 : 0); }
      return score(b) - score(a);
    });
  }
  function videos(data, done) {
    var found = candidates(data.videos), movie = data.movie;
    if (found.length) { done(found); return; }
    var key = (isTV(movie) ? 'tv/' : 'movie/') + movie.id;
    if (videoCache[key]) { done(videoCache[key]); return; }
    var sources = Lampa.Api && Lampa.Api.sources;
    var source = sources && (sources[movie.source] || sources.tmdb);
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
    try { source.videos({id:movie.id, method:isTV(movie) ? 'tv' : 'movie'}, function (result) { finish(candidates(result)); }, function () { finish([]); }); }
    catch (_) { finish([]); }
  }
  function stopTrailer(reason) {
    epoch++;
    if (previewTimer) clearTimeout(previewTimer);
    if (previewDeadline) clearTimeout(previewDeadline);
    previewTimer = previewDeadline = null;
    if (player) { try { player.destroy(); } catch (_) {} player = null; }
    if (preview) {
      var video = qs('video', preview); if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
      remove(preview); preview = null;
    }
    diagnostics.trailer = reason || 'stopped';
  }
  function scheduleTrailer(state) {
    stopTrailer('waiting');
    if (!enabled() || String(get(PREFIX + 'trailer_preview', 'true')) === 'false') { diagnostics.trailer = 'disabled'; return; }
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { diagnostics.trailer = 'reduced-motion'; return; }
    if (state.data.movie.adult || (window.lampa_settings && lampa_settings.disable_features && lampa_settings.disable_features.trailers)) return;
    var token = epoch;
    function valid() { return token === epoch && enabled() && connected(state.header) && activePage().contains(state.header) && !document.hidden; }
    function fail(reason) { if (token === epoch) stopTrailer(reason); }
    previewTimer = setTimeout(function () {
      previewTimer = null; if (!valid()) return;
      diagnostics.trailer = 'loading-videos';
      videos(state.data, function (list) {
        if (!valid()) return;
        if (!list.length) { fail('no-trailer'); return; }
        var selected = list[0];
        var holder = document.createElement('div'); holder.className = 'acg-trailer-preview'; holder.setAttribute('aria-hidden', 'true');
        state.header.insertBefore(holder, state.header.firstChild); preview = holder;
        function playing() {
          if (!valid()) return;
          if (previewDeadline) clearTimeout(previewDeadline); previewDeadline = null;
          holder.classList.add('acg-trailer-playing'); diagnostics.trailer = 'playing';
        }
        previewDeadline = setTimeout(function () { fail('playback-timeout'); }, 18000);
        if (selected.url && /\.(mp4|webm)(\?|$)/i.test(selected.url)) {
          var video = document.createElement('video'); video.muted = true; video.autoplay = true; video.loop = true;
          video.setAttribute('playsinline', ''); video.setAttribute('muted', ''); video.setAttribute('tabindex', '-1');
          video.onplaying = playing; video.onerror = function () { fail('video-error'); };
          holder.appendChild(video); video.src = selected.url;
          var promise = video.play(); if (promise && promise.catch) promise.catch(function () { fail('autoplay-blocked'); });
          return;
        }
        // An HTTPS bridge supplies a real origin/referrer even when Lampa runs
        // from file:// in an Android WebView. Never forge the YouTube origin.
        diagnostics.trailer = 'loading-youtube';
        var frame = document.createElement('iframe'); frame.setAttribute('tabindex', '-1');
        frame.setAttribute('title', 'Фоновый трейлер'); frame.setAttribute('allow', 'autoplay; encrypted-media');
        frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        var bridgeToken = 'acg_' + Date.now() + '_' + epoch + '_' + Math.random().toString(36).slice(2);
        function receive(event) {
          if (!valid() || event.source !== frame.contentWindow || event.origin !== TRAILER_ORIGIN) return;
          var message = event.data;
          if (!message || message.acgToken !== bridgeToken) return;
          if (message.state === 'playing') playing();
          else if (message.state === 'error') fail('youtube-error-' + String(message.code || 'unknown'));
          else if (message.state === 'blocked') fail('autoplay-blocked');
        }
        window.addEventListener('message', receive);
        player = {destroy:function () {
          window.removeEventListener('message', receive);
          try { frame.contentWindow.postMessage({acgToken:bridgeToken, command:'destroy'}, TRAILER_ORIGIN); } catch (_) {}
          remove(frame);
        }};
        frame.src = TRAILER_PAGE + '?v=' + VERSION + '&video=' + selected.key + '&token=' + bridgeToken;
        frame.onerror = function () { fail('youtube-unavailable'); };
        holder.appendChild(frame);
      });
    }, 1800);
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
      all('.agnative-leftdock__item[data-action]').forEach(function (node) { node.classList.toggle('acg-top-hidden', !!moved[node.getAttribute('data-action')]); });
      if (!wrap.__acgFocus) {
        wrap.__acgFocus = true;
        function scroll(node) { var left = node.offsetLeft, right = left + node.offsetWidth; if (left < wrap.scrollLeft) wrap.scrollLeft = left; else if (right > wrap.scrollLeft + wrap.clientWidth) wrap.scrollLeft = right - wrap.clientWidth; }
        wrap.addEventListener('focusin', function (event) { scroll(event.target); });
        if (window.$) window.$(wrap).on('hover:focus.acg', '.agnative-topnav-shell__item', function () { scroll(this); });
      }
    }
    var right = qs('.agnative-topnav-shell__right');
    if (right && !qs('.acg-refresh', right)) {
      var refresh = button('refresh', 'Обновить', 'refresh', function () { if (Lampa.Activity.reload) Lampa.Activity.reload(); else location.reload(); });
      refresh.className = 'agnative-topnav-shell__item agnative-topnav-shell__item--icon selector acg-refresh';
      refresh.setAttribute('data-role', 'refresh'); right.appendChild(refresh);
    }
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
    all('.agnative-hero.acg-enhanced').forEach(function (hero) {
      var native = qs('.agnative-hero__play', hero);
      if (native) { native.classList.remove('acg-action', 'acg-details'); native.textContent = 'Смотреть'; hero.appendChild(native); }
      remove(qs('.acg-hero-actions', hero)); remove(qs('.acg-meta-block', hero)); hero.classList.remove('acg-enhanced');
    });
    all('.acg-detail').forEach(function (header) {
      var image = qs('.full-start__background', header);
      if (image && header.__acgBackgroundParent) header.__acgBackgroundParent.insertBefore(image, header.__acgBackgroundParent.firstChild);
      all('.acg-meta-block,.acg-detail-overview,.acg-action', header).forEach(remove); header.classList.remove('acg-detail');
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
    param('enabled', 'trigger', 'Apple Cinema Gold 1.6', 'Изменение оформления применяется после перезапуска Lampa.', null, 'true', function (v) {
      set(PREFIX + 'enabled', String(v)); if (!enabled()) { cleanup(); restore(); } else { applyPreset(); ensureUpstream(); queueSync(); } visual();
    });
    param('topbar_scale', 'select', 'Размер верхней панели', 'Компактная панель с отдельными кнопками меню и профиля.', {'1':'Компактный, по макету','1.1':'На 10% крупнее','1.2':'На 20% крупнее'}, '1', function (v) { set(PREFIX + 'topbar_scale', String(v)); visual(); });
    param('row_gap', 'select', 'Расстояние между каруселями', 'Вертикальное пространство между рядами фильмов.', {'2.4':'Умеренное','3.2':'Свободное, по макету','4':'Максимальное'}, '3.2', function (v) { set(PREFIX + 'row_gap', String(v)); visual(); });
    param('trailer_preview', 'trigger', 'Фоновый трейлер в карточке', 'Без звука. Если встроенное воспроизведение недоступно, остаётся постер и кнопка трейлера.', null, 'true', function (v) { set(PREFIX + 'trailer_preview', String(v)); if (String(v) === 'false') stopTrailer('disabled'); else if (fullState && connected(fullState.header)) scheduleTrailer(fullState); });
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
    if (get(PREFIX + 'v16_migrated', 'false') !== 'true') {
      set(PREFIX + 'topbar_scale', '1'); set(PREFIX + 'row_gap', '3.2');
      if (enabled()) applyPreset();
      set(PREFIX + 'v16_migrated', 'true');
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
        if (heroNode && connected(heroNode)) updateFavorite(qs('.acg-favorite', heroNode), currentMovie(heroNode));
        if (fullState && connected(fullState.header)) updateFavorite(qs('.acg-favorite', fullState.header), fullState.data.movie);
      });
    }
    if (Lampa.Player && Lampa.Player.listener && Lampa.Player.listener.follow) {
      ['create', 'start', 'external'].forEach(function (event) {
        Lampa.Player.listener.follow(event, function () { stopTrailer('player'); });
      });
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stopTrailer('hidden'); });
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
