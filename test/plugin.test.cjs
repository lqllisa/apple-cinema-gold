/* DOM integration checks. No layout engine or real YouTube playback is simulated. */
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const {JSDOM} = require('jsdom');
const script = readFileSync(join(__dirname, '../apple_cinema_gold.js'), 'utf8');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function fixture(t, options = {}) {
  const dom = new JSDOM('<!doctype html><body style="font-size:24px" class="appletv-agnative-topnav"><div class="head__body"><div class="agnative-topnav-shell__items"></div><div class="agnative-topnav-shell__right"></div></div><div class="menu"><div class="menu__list"><div class="menu__item selector" data-action="main">Главная</div><div class="menu__item selector" data-action="movie">Фильмы</div></div></div><div class="activity activity--active"><div class="activity__body"></div></div></body>', {url:'https://lampa.test/',runScripts:'outside-only',pretendToBeVisual:true});
  const w = dom.window, d = w.document;
  t.after(() => w.close());
  // Compress lifecycle waits; the production plugin's intervals are unchanged.
  const nativeTimeout = w.setTimeout.bind(w), nativeInterval = w.setInterval.bind(w);
  w.setTimeout = (fn, ms) => nativeTimeout(fn, Math.max(1, ms * .02));
  w.setInterval = (fn, ms) => nativeInterval(fn, Math.max(1, ms * .02));
  const state = {favorite:false,watch:0,folder:0,details:0,trailers:0,requests:[],frames:[],destroyed:0,notices:[],playerMode:options.playerMode || 'play'};
  const handlers = {}, playerHandlers = {}, controls = {}, settings = {}, storage = Object.assign({'lmp_apple_cinema_topbar_scale':'2.25'},options.storage);
  const movie = {id:123,title:'Тестовый сериал',name:'Тестовый сериал',first_air_date:'2025-01-01',vote_average:8.1,backdrop_path:'/poster.jpg',overview:'Краткое описание из карточки фильма.',genres:[{name:'Фантастика'},{name:'Драма'}]};
  let currentController = 'head', collection = [], selected;
  const q = (selector, root=d) => root.querySelector(selector);
  const emit = (name, event) => (handlers[name] || []).forEach(fn=>fn(event));
  const playerEmit = name => (playerHandlers[name] || []).forEach(fn=>fn({}));
  const enter = node => node.dispatchEvent(new w.CustomEvent('hover:enter', {bubbles:true,cancelable:true}));
  function focus(node) {
    if (selected) selected.classList.remove('focus');
    selected = node;
    if (node) { node.classList.add('focus'); node.dispatchEvent(new w.CustomEvent('hover:focus', {bubbles:true})); }
  }
  // The overlay only needs these jQuery event/data operations. Native handlers
  // below use the event names confirmed in Lampa and AgNative sources.
  w.$ = node => ({0:node,on(names, selector, fn) {
    if (typeof selector === 'function') {fn=selector;selector=null;}
    names.split(' ').forEach(name=>node.addEventListener(name.split('.')[0], event=>{
      const target = selector ? event.target.closest(selector) : node;
      if (target) fn.call(target,event);
    }));return this;
  },trigger:enterName=>node.dispatchEvent(new w.CustomEvent(enterName,{bubbles:true,cancelable:true})),data:key=>node['data_'+key]});
  function stored(key, fallback) {
    let value=key in storage ? storage[key] : fallback;
    if (value==='true' || value==='false') return value==='true';
    if (typeof value==='string' && /^[\[{]/.test(value)) {try {return JSON.parse(value);} catch (_) {}}
    if (typeof value==='string' && /^\d+$/.test(value)) return parseInt(value,10);
    return value;
  }
  w.appready = options.appready!==false; w.__APPLETV_AGNATIVE_TOPNAV__ = options.upstream!==false; w.__AGNATIVE_HERO_CONTROLLER__ = true;
  w.Lampa = {
    Storage:{get:stored,set:(key,value)=>{storage[key]=value;}},
    SettingsApi:{addComponent:()=>{},addParam:config=>{settings[config.param.name]=config;}},
    Listener:{follow:(name,fn)=>(handlers[name]||(handlers[name]=[])).push(fn)},
    Player:{listener:{follow:(name,fn)=>(playerHandlers[name]||(playerHandlers[name]=[])).push(fn)}},
    Favorite:{check:()=>({book:state.favorite}),toggle:(type,card)=>{assert.equal(type,'book');assert.equal(card.id,movie.id);state.favorite=!state.favorite;emit('state:changed',{target:'favorite'});}},
    Noty:{show:text=>state.notices.push(text)},
    Activity:{backward:()=>home(),reload:()=>{},active:()=>({component:'main'})},
    Controller:{add:(name,value)=>{controls[name]=value;},enabled:()=>({name:currentController}),toggle:name=>{currentController=name;controls[name]?.toggle?.();},collectionSet:el=>{collection=[...(el[0]||el).querySelectorAll('.selector')];},collectionFocus:focus},
    Api:{sources:{tmdb:{parsePG:()=>'',videos:(params,ok)=>{state.requests.push(params);w.setTimeout(()=>ok({results:options.apiVideos || [video()]}), options.apiDelay || 1);}}}}
  };
  w.Navigator = {canmove:direction=>direction==='right' ? collection.indexOf(selected)<collection.length-1 : collection.indexOf(selected)>0,move:direction=>focus(collection[collection.indexOf(selected)+(direction==='right'?1:-1)])};
  // Simulate the HTTPS frame's public postMessage protocol, never a network video.
  const frames = new Set();
  const frameObserver = new w.MutationObserver(() => {
    d.querySelectorAll('.acg-trailer-preview iframe').forEach(frame=>{
      if (frames.has(frame)) return; frames.add(frame);
      const query = new URL(frame.src).searchParams, token = query.get('token');
      state.frames.push(query.get('video'));
      w.setTimeout(()=>{
        if (!frame.isConnected) return;
        const mode = options.playback ? options.playback(query.get('video')) : state.playerMode;
        if (mode === 'blocked') return;
        w.dispatchEvent(new w.MessageEvent('message', {
          origin:'https://lqllisa.github.io', source:frame.contentWindow,
          data:{acgToken:token,state:mode==='error'?'error':mode==='autoplay'?'blocked':'playing',code:options.errorCode || 153}
        }));
      },20);
    });
  });
  frameObserver.observe(d.body,{subtree:true,childList:true});
  t.after(()=>frameObserver.disconnect());
  function video() {return {site:'YouTube',type:'Trailer',key:'M7lc1UVf-VE',official:true};}
  function home(withHero=true) {
    q('.activity__body').innerHTML='<div class="scroll scroll--over scroll--mask"><div class="scroll__content"><div class="scroll__body"><div class="items-line"><div class="items-line__head"><div class="items-line__title">Популярные сериалы</div></div><div class="scroll scroll--horizontal"><div class="scroll__content"><div class="scroll__body"><div class="card"></div></div></div></div></div></div></div></div>';
    q('.card').card_data = movie; emit('activity',{type:'start'});
    if(withHero) mountHero();
  }
  function mountHero() {
    const hero=d.createElement('div');hero.className='agnative-hero';
    hero.innerHTML='<img class="agnative-hero__bg" src="/poster.jpg"><div class="agnative-hero__content"><div class="agnative-hero__title"></div><div class="agnative-hero__year">2025</div><div class="agnative-hero__meta">Фантастика · Драма</div><div class="agnative-hero__overview"></div></div><div class="agnative-hero__play selector">Подробнее</div><div class="agnative-hero__indicator agnative-hero__indicator--active"></div><div class="agnative-hero__indicator"></div>';
    q('.agnative-hero__title',hero).textContent=movie.title;
    q('.agnative-hero__overview',hero).textContent=movie.overview;
    q('.agnative-hero__play',hero).addEventListener('hover:enter',()=>{state.details++;full();});
    hero.querySelectorAll('.agnative-hero__indicator').forEach(dot=>dot.addEventListener('click',()=>{hero.querySelectorAll('.agnative-hero__indicator').forEach(n=>n.classList.remove('agnative-hero__indicator--active'));dot.classList.add('agnative-hero__indicator--active');}));
    q('.scroll__body').prepend(hero);
  }
  function full(preloaded=true) {
    const root=q('.activity__body');
    root.innerHTML='<div class="full"><img class="full-start__background loaded" src="/poster.jpg"><div class="full-start-new"><div class="full-start-new__body"><div class="full-start-new__left"></div><div class="full-start-new__right"><div class="full-start-new__title">Тестовый сериал</div><div class="full-start-new__rate-line"></div><div class="full-start-new__buttons"><div class="full-start__button selector button--play"><svg></svg><span>Смотреть</span></div><div class="full-start__button selector button--book"><svg></svg><span>Закладки</span></div></div></div></div><div class="hide buttons--container"><div class="full-start__button view--trailer">Трейлер</div></div></div></div>';
    q('.button--book').addEventListener('hover:enter',()=>{state.folder++;});
    q('.view--trailer').addEventListener('hover:enter',()=>{state.trailers++;});
    emit('activity',{type:'start'});
    emit('full',{type:'complite',body:w.$(root),data:{movie,videos:preloaded?{results:options.preloadedVideos || [video()]}:null}});
    // Lampa binds its Watch action AFTER sending the completion event.
    q('.button--play').addEventListener('hover:enter',()=>{state.watch++;});
  }
  home(false);if(options.beforeBoot) options.beforeBoot(w);w.eval(script);
  return {w,d,q,state,storage,settings,movie,enter,emit,playerEmit,home,full,mountHero,controls,selected:()=>selected};
}

test('late hero gets real controls, metadata and working Next', async t=>{
  const e=fixture(t);await wait(330);e.mountHero();await wait(30);
  assert.equal(e.d.querySelectorAll('.acg-hero-actions .selector').length,4);
  assert.equal(e.q('.acg-favorite'),null);
  assert.match(e.q('.acg-metadata').textContent,/2025Сериал★ 8.1/);
  assert.match(e.q('.acg-tags').textContent,/ФантастикаДрама/);
  assert.equal(e.q('.agnative-hero__overview').textContent,e.movie.overview);
  e.enter(e.q('.acg-next'));
  assert.equal(e.q('.agnative-hero__indicator--active'),e.d.querySelectorAll('.agnative-hero__indicator')[1]);
  assert.equal(e.w.AppleCinemaGold.diagnostics.lastError,undefined);
});

test('remote reaches a single bookmark action without duplicate dispatch', async t=>{
  const e=fixture(t);e.mountHero();await wait(25);
  e.w.Lampa.Controller.toggle('agnative_hero');assert(e.selected().classList.contains('acg-watch'));
  e.controls.agnative_hero.right();assert(e.selected().classList.contains('acg-bookmark'));
  const bookmark=e.selected();e.enter(bookmark);bookmark.click();await wait(20);
  assert.equal(e.state.folder,1);assert.equal(e.state.details,1);
  assert.equal(e.q('.acg-favorite'),null);assert.equal(e.d.querySelectorAll('.button--book').length,1);
});

test('returning to an archived hero restores its own remote controller', async t=>{
  const e=fixture(t);e.mountHero();await wait(20);
  const original=e.q('.agnative-hero');original.remove();
  e.home();await wait(20);e.q('.agnative-hero').remove();
  e.q('.scroll__body').prepend(original);await wait(20);
  e.w.Lampa.Controller.toggle('agnative_hero');
  assert(original.contains(e.selected()));
});

test('Watch and folder reach original full handlers after completion', async t=>{
  const e=fixture(t);e.mountHero();await wait(20);e.enter(e.q('.acg-watch'));await wait(20);
  assert.equal(e.state.watch,1);assert.equal(e.state.details,1);
  assert.equal(e.q('.acg-detail-overview').textContent,e.movie.overview);
  e.home();await wait(20);e.enter(e.q('.acg-bookmark'));await wait(20);assert.equal(e.state.folder,1);
});

test('preloaded trailer reveals only on PLAYING; manual action stops it', async t=>{
  const e=fixture(t);e.full();await wait(70);
  assert.equal(e.w.AppleCinemaGold.diagnostics.trailer,'playing');
  assert(e.q('.acg-trailer-playing'));assert.equal(e.state.requests.length,0);
  const frame=e.q('.acg-trailer-preview iframe');
  e.enter(e.q('.acg-manual-trailer'));assert.equal(e.state.trailers,1);
  assert(!frame.isConnected);assert.equal(e.q('.acg-trailer-preview'),null);
});

test('missing trailer data uses Lampa API and real Player lifecycle stops it', async t=>{
  const e=fixture(t);e.full(false);await wait(80);
  assert.equal(e.state.requests.length,1);assert.equal(e.state.requests[0].method,'tv');
  assert.equal(e.w.AppleCinemaGold.diagnostics.trailer,'playing');
  e.playerEmit('create');assert.equal(e.q('.acg-trailer-preview'),null);
  assert.equal(e.w.AppleCinemaGold.diagnostics.trailer,'player');
});

test('navigation invalidates a pending video response', async t=>{
  const e=fixture(t,{apiDelay:3000});e.full(false);await wait(50);e.home();await wait(100);
  assert.equal(e.state.requests.length,1);assert.equal(e.q('.acg-trailer-preview'),null);
});

test('YouTube errors preserve poster and native trailer button', async t=>{
  const e=fixture(t,{playerMode:'error'});e.full();await wait(75);
  assert.equal(e.w.AppleCinemaGold.diagnostics.trailer,'youtube-error-153');
  assert.equal(e.q('.acg-trailer-preview'),null);
  assert(e.q('.full-start__background'));assert(e.q('.acg-manual-trailer'));
});

test('blocked autoplay times out without covering the poster', async t=>{
  const e=fixture(t,{playerMode:'blocked'});e.full();await wait(65);
  assert.equal(e.q('.acg-trailer-playing'),null);
  await wait(370);assert.equal(e.q('.acg-trailer-preview'),null);
  assert.equal(e.w.AppleCinemaGold.diagnostics.trailer,'playback-timeout');
});

test('migration enlarges toolbar 20%; scaling follows actual Lampa body font', t=>{
  const e=fixture(t);assert.equal(e.storage.lmp_apple_cinema_topbar_scale,'1.2');
  assert(Math.abs(parseFloat(e.d.body.style.getPropertyValue('--acg-nav-unit'))-28.8)<.01);
  assert.equal(e.d.body.style.getPropertyValue('--acg-unit'),'24px');
  assert(Math.abs(parseFloat(e.d.body.style.getPropertyValue('--acg-row-gap'))-76.8)<.01);
  e.d.body.style.fontSize='16px';e.emit('resize_end',{});
  assert.equal(e.d.body.style.getPropertyValue('--acg-unit'),'16px');
  assert.equal(e.d.body.style.getPropertyValue('--acg-row-gap'),'51.2px');
});

test('disable restores background container and removes extra controls', async t=>{
  const e=fixture(t);e.full();await wait(70);
  e.settings.lmp_apple_cinema_enabled.onChange('false');
  assert.equal(e.q('.acg-trailer-preview'),null);assert.equal(e.q('.acg-detail'),null);
  assert.equal(e.q('.full-start__background').parentNode,e.q('.full'));
  assert.equal(e.d.querySelectorAll('.acg-meta-block,.acg-detail-overview,.acg-favorite').length,0);
  assert(e.q('.button--play'));assert(!e.d.body.classList.contains('acg-v18'));
});


test('preview rejects messages from a different frame or origin', async t=>{
  const e=fixture(t,{playerMode:'blocked'});e.full();await wait(70);
  const frame=e.q('.acg-trailer-preview iframe');
  const token=new URL(frame.src).searchParams.get('token');
  e.w.dispatchEvent(new e.w.MessageEvent('message',{origin:'https://untrusted.test',source:frame.contentWindow,data:{acgToken:token,state:'playing'}}));
  e.w.dispatchEvent(new e.w.MessageEvent('message',{origin:'https://lqllisa.github.io',source:e.w,data:{acgToken:token,state:'playing'}}));
  assert.equal(e.q('.acg-trailer-playing'),null);
});

test('HTTPS trailer bridge mutes and starts video; sends confirmed state only', t=>{
  const html=readFileSync(join(__dirname,'../trailer.html'),'utf8');
  const dom=new JSDOM(html,{url:'https://lqllisa.github.io/apple-cinema-gold/trailer.html?video=M7lc1UVf-VE&token=acg_test',runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const w=dom.window, messages=[];let config,muted=0,played=0,destroyed=0;
  w.postMessage=message=>messages.push(message);
  w.YT={Player:function(id,options){config=options;this.destroy=()=>destroyed++;}};
  w.eval(w.document.querySelector('script').textContent);w.onYouTubeIframeAPIReady();
  const frame=w.document.querySelector('iframe'), params=new URL(frame.src).searchParams;
  assert.match(frame.src,/https:\/\/www.youtube.com\/embed\/M7lc1UVf-VE/);
  assert.equal(params.get('origin'),'https://lqllisa.github.io');assert.equal(params.get('mute'),'1');
  assert.match(frame.getAttribute('allow'),/autoplay/);assert.equal(messages.length,0);
  const target={mute:()=>muted++,playVideo:()=>played++};
  config.events.onReady({target});assert.equal(muted,1);assert.equal(played,1);assert.equal(messages[0].state,'ready');
  config.events.onStateChange({target,data:1});assert.equal(messages[1].state,'playing');
  config.events.onStateChange({target,data:3});assert.equal(messages.at(-1).state,'buffering');
  // Autoplay can begin in the pre-created frame before the API attaches.
  target.getPlayerState=()=>1;
  config.events.onReady({target});assert.equal(messages.at(-1).state,'playing');
  w.dispatchEvent(new w.MessageEvent('message',{source:w,data:{acgToken:'acg_test',command:'destroy'}}));
  assert.equal(destroyed,1);
});

test('toolbar buttons are independent, unique and preserve native actions', async t=>{
  const e=fixture(t);let searches=0,reloads=0,settings=0;
  e.w.Lampa.Search={open:()=>searches++};e.w.Lampa.Activity.reload=()=>reloads++;
  const native=e.d.createElement('div');native.className='menu__item selector';native.dataset.action='settings';native.textContent='Настройки';
  native.addEventListener('hover:enter',()=>settings++);e.q('.menu__list').append(native);
  await wait(30);
  for(const name of ['search','refresh','settings']) {
    const node=e.q('.acg-system-action.acg-'+name);
    assert.equal(node.parentNode,e.q('.head__body'));
    e.enter(node);node.click();
  }
  assert.deepEqual([searches,reloads,settings],[1,1,1]);
  e.emit('activity',{type:'start'});await wait(20);
  assert.equal(e.d.querySelectorAll('.acg-system-action').length,3);
});

test('drawer skips categories already in top bar and restores native SVG icons', async t=>{
  const e=fixture(t);
  e.q('.agnative-topnav-shell__items').innerHTML='<div data-action="main">Главная</div><div data-action="movie">Фильмы</div>';
  e.q('.menu__list').insertAdjacentHTML('beforeend','<div class="menu__item selector" data-action="history"><div class="menu__ico"><svg><path d="M1 1h2"/></svg></div><div class="menu__text">История</div></div>');
  const dock=e.d.createElement('div');dock.className='agnative-leftdock';
  dock.innerHTML='<div class="agnative-leftdock__case"><div class="agnative-leftdock__item selector is-active" data-action="main">Главная</div><div class="agnative-leftdock__item selector" data-action="history"><div class="menu__ico">И</div><div class="menu__text">История</div></div></div>';
  e.d.body.append(dock);e.emit('activity',{type:'start'});await wait(30);
  e.w.Lampa.Controller.toggle('agnative_leftdock');
  assert.equal(e.selected().dataset.action,'history');assert(dock.classList.contains('is-visible'));
  assert.equal(e.q('[data-action="main"]',dock).classList.contains('selector'),false);
  assert(e.q('[data-action="history"] .menu__ico svg',dock));
  e.controls.agnative_leftdock.back();assert.equal(dock.classList.contains('is-visible'),false);
});

test('late Amedia priority button keeps its original handler and visible-label class', async t=>{
  const e=fixture(t);e.full();await wait(20);let opens=0;
  const provider=e.d.createElement('div');provider.className='full-start__button selector button--priority';
  provider.innerHTML='<svg></svg><span>Amedia</span>';provider.addEventListener('hover:enter',()=>opens++);
  e.q('.full-start-new__buttons').prepend(provider);await wait(25);
  assert(provider.classList.contains('acg-provider'));assert.equal(provider.title,'Amedia');
  e.enter(provider);assert.equal(opens,1);assert.equal(e.state.watch,0);
});

test('failed or non-embeddable first trailer tries the next unique trailer', async t=>{
  const first={site:'YouTube',type:'Trailer',key:'abcdefghijk',official:true};
  const second={site:'YouTube',type:'Trailer',key:'M7lc1UVf-VE'};
  const e=fixture(t,{preloadedVideos:[first,first,second],errorCode:150,playback:id=>id==='abcdefghijk'?'error':'play'});
  e.full();await wait(90);
  assert.deepEqual(e.state.frames,['abcdefghijk','M7lc1UVf-VE']);
  assert.equal(e.w.AppleCinemaGold.diagnostics.trailer,'playing');
  assert.equal(e.d.querySelectorAll('.acg-trailer-preview').length,1);
});

test('normalized Lampa video links without TMDB site/type are accepted', async t=>{
  const e=fixture(t,{preloadedVideos:[{url:'https://www.youtube.com/watch?v=M7lc1UVf-VE',youtube:true,name:'Трейлер'}]});
  e.full();await wait(65);assert.equal(e.w.AppleCinemaGold.diagnostics.trailer,'playing');
  assert.equal(e.state.requests.length,0);
});

test('background preview has no card switch; settings stop, restart and persist it', async t=>{
  const e=fixture(t);e.full();await wait(65);
  assert.equal(e.q('.acg-preview-toggle'),null);
  e.settings.lmp_apple_cinema_trailer_preview.onChange('false');
  assert.equal(e.storage.lmp_apple_cinema_trailer_preview,'false');assert.equal(e.q('.acg-trailer-preview'),null);
  e.settings.lmp_apple_cinema_trailer_preview.onChange('true');await wait(30);
  assert.equal(e.w.AppleCinemaGold.diagnostics.trailer,'playing');
  e.settings.lmp_apple_cinema_trailer_preview.onChange('false');e.home();e.full();await wait(65);
  assert.equal(e.q('.acg-trailer-preview'),null);assert(e.q('.full-start__background'));
});

test('autoplay denial ends attempts and keeps a readable poster fallback', async t=>{
  const e=fixture(t,{playerMode:'autoplay'});e.full();await wait(70);
  assert.equal(e.w.AppleCinemaGold.diagnostics.trailer,'autoplay-blocked');
  assert.equal(e.q('.acg-trailer-preview'),null);assert(e.q('.full-start__background'));
  assert.equal(e.q('.acg-trailer-status'),null);assert.equal(e.state.notices.length,0);
  assert(e.q('.acg-manual-trailer'));
});

test('full completion before attachment waits for the active header', async t=>{
  const e=fixture(t);e.full();
  const full=e.q('.full');full.remove();
  e.emit('full',{type:'complite',body:e.w.$(full),data:{movie:e.movie,videos:{results:[{site:'YouTube',type:'Trailer',key:'M7lc1UVf-VE'}]}}});
  await wait(40);assert.equal(e.q('.acg-trailer-preview'),null);
  e.q('.activity__body').append(full);await wait(40);
  assert.equal(e.w.AppleCinemaGold.diagnostics.trailer,'playing');
});

test('1.8 defaults to video once, keeping approved toolbar size and row spacing', async t=>{
  const e=fixture(t,{storage:{lmp_apple_cinema_v17_migrated:'true',lmp_apple_cinema_topbar_scale:'1.1',lmp_apple_cinema_trailer_preview:'false',lmp_apple_cinema_row_gap:'4'}});
  e.full();await wait(70);
  assert.equal(e.storage.lmp_apple_cinema_trailer_preview,'true');assert.equal(e.storage.lmp_apple_cinema_row_gap,'4');
  assert.equal(e.storage.lmp_apple_cinema_topbar_scale,'1.1');assert.equal(e.w.AppleCinemaGold.diagnostics.trailer,'playing');
});

test('a trailer preference saved after 1.8 migration survives restarting', async t=>{
  const e=fixture(t,{storage:{lmp_apple_cinema_v18_migrated:'true',lmp_apple_cinema_trailer_preview:'false'}});
  e.full();await wait(65);assert.equal(e.q('.acg-trailer-preview'),null);
  assert.equal(e.storage.lmp_apple_cinema_trailer_preview,'false');
});

test('native ambient background and only Shots main row are configured and restorable', t=>{
  const previous={background:false,background_type:'poster',black_style:true,content_rows_shots_main:true,content_rows_shots_favorite:true};
  const e=fixture(t,{storage:previous});
  assert.equal(e.storage.background,true);assert.equal(e.storage.background_type,'simple');assert.equal(e.storage.black_style,false);
  assert.equal(e.storage.content_rows_shots_main,false);assert.equal(e.storage.content_rows_shots_favorite,true);
  e.settings.lmp_apple_cinema_enabled.onChange('false');
  for (const key of Object.keys(previous)) assert.equal(e.storage[key],previous[key]);
});

test('Anime joins the centered categories and leaves the drawer without rebinding its action', async t=>{
  const e=fixture(t);let opens=0;
  e.q('.menu__list').insertAdjacentHTML('beforeend','<div class="menu__item selector" data-action="anime">Аниме</div>');
  e.emit('activity',{type:'start'});await wait(25);
  assert(e.storage.appletv_agnative_topnav_items.includes('anime'));
  e.q('.agnative-topnav-shell__items').innerHTML='<div class="agnative-topnav-shell__item selector" data-action="anime">Аниме</div>';
  e.q('.agnative-topnav-shell__item').addEventListener('hover:enter',()=>opens++);
  const dock=e.d.createElement('div');dock.className='agnative-leftdock';dock.innerHTML='<div class="agnative-leftdock__item selector" data-action="anime">Аниме</div>';
  e.d.body.append(dock);e.emit('activity',{type:'start'});await wait(25);
  assert(e.q('[data-action="anime"]',dock).classList.contains('acg-top-hidden'));
  assert(!e.q('[data-action="anime"]',dock).classList.contains('selector'));
  e.enter(e.q('.agnative-topnav-shell__item'));assert.equal(opens,1);
});

test('toolbar inset belongs to the outer vertical scroller and survives navigation', async t=>{
  const e=fixture(t);await wait(25);
  assert.equal(e.d.querySelectorAll('.acg-feed-scroll').length,1);
  assert.equal(e.q('.acg-feed-scroll'),e.q('.activity__body > .scroll'));
  assert(!e.q('.scroll--horizontal').classList.contains('acg-feed-scroll'));
  e.home();await wait(25);assert.equal(e.d.querySelectorAll('.acg-feed-scroll').length,1);
  e.settings.lmp_apple_cinema_enabled.onChange('false');assert.equal(e.q('.acg-feed-scroll'),null);
});

test('a stalled trailer immediately reveals the poster, then resumes or times out', async t=>{
  const e=fixture(t);e.full();await wait(70);
  const frame=e.q('.acg-trailer-preview iframe'),token=new URL(frame.src).searchParams.get('token');
  const send=state=>e.w.dispatchEvent(new e.w.MessageEvent('message',{origin:'https://lqllisa.github.io',source:frame.contentWindow,data:{acgToken:token,state}}));
  send('buffering');assert.equal(e.q('.acg-trailer-playing'),null);assert(e.q('.full-start__background'));
  send('playing');assert(e.q('.acg-trailer-playing'));
  send('buffering');await wait(380);
  assert.equal(e.q('.acg-trailer-preview'),null);assert.equal(e.w.AppleCinemaGold.diagnostics.trailer,'playback-timeout');
});

test('native boolean migration flags do not reset settings on every startup', async t=>{
  const e=fixture(t,{storage:{lmp_apple_cinema_v18_migrated:true,lmp_apple_cinema_trailer_preview:false,lmp_apple_cinema_topbar_scale:'1.1'}});
  e.full();await wait(65);
  assert.equal(e.storage.lmp_apple_cinema_trailer_preview,false);
  assert.equal(e.storage.lmp_apple_cinema_topbar_scale,'1.1');
  assert.equal(e.q('.acg-trailer-preview'),null);
});

test('already parsed original settings remain intact across startup and restoration', t=>{
  const original={background:false,background_type:'poster',appletv_agnative_hero_enabled:false};
  const e=fixture(t,{storage:{lmp_apple_cinema_original_values:original}});
  e.settings.lmp_apple_cinema_restore.onChange();
  for (const key of Object.keys(original)) assert.equal(e.storage[key],original[key]);
});

test('dependency is pinned and a network failure retries the same revision once', t=>{
  const e=fixture(t,{upstream:false});
  const first=e.q('script[data-apple-cinema-upstream]');
  assert.match(first.src,/cdn\.jsdelivr\.net\/gh\/Llowmikee\/AppleTVAGNativeNG@b68d7840996da040ef4fe9d8f5e53e8ed4f759a7\/appletv_agnative\.js$/);
  assert.equal(first.crossOrigin,'anonymous');assert.match(first.integrity,/^sha384-/);
  const lateFailure=first.onerror;first.onerror();
  const second=e.q('script[data-apple-cinema-upstream]');
  assert(!first.isConnected);assert.notEqual(first,second);
  assert.match(second.src,/fastly\.jsdelivr\.net/);assert.equal(second.integrity,first.integrity);
  lateFailure();assert.equal(e.d.querySelectorAll('script[data-apple-cinema-upstream]').length,1);
  e.w.__APPLETV_AGNATIVE_TOPNAV__=true;second.onload();
  assert.equal(e.w.AppleCinemaGold.diagnostics.upstream,'ready-0.4.1');
});

test('dependency load attempts stop after both sources fail', t=>{
  const e=fixture(t,{upstream:false});
  e.q('script[data-apple-cinema-upstream]').onerror();
  e.q('script[data-apple-cinema-upstream]').onerror();
  assert.equal(e.q('script[data-apple-cinema-upstream]'),null);
  assert.equal(e.w.AppleCinemaGold.diagnostics.upstream,'unavailable');
  assert.equal(e.state.notices.length,1);assert.equal(e.w.AppleCinemaGold.diagnostics.startup,'ready');
});

test('disabled overlay cancels a pending dependency request', t=>{
  const e=fixture(t,{upstream:false});
  e.settings.lmp_apple_cinema_enabled.onChange('false');
  assert.equal(e.q('script[data-apple-cinema-upstream]'),null);
});

test('the ready event starts the overlay once with native boolean settings', async t=>{
  const e=fixture(t,{appready:false});
  assert.equal(e.w.AppleCinemaGold.diagnostics.startup,undefined);
  e.w.appready=true;e.emit('app',{type:'ready'});e.emit('app',{type:'ready'});await wait(20);
  assert.equal(e.w.AppleCinemaGold.diagnostics.startup,'ready');
  assert.equal(e.d.querySelectorAll('.acg-system-action').length,3);
  assert.equal(e.d.querySelectorAll('#lmp-apple-cinema-v18-style').length,1);
});

test('malformed original settings do not throw during startup', t=>{
  const e=fixture(t,{storage:{lmp_apple_cinema_original_values:'true'}});
  assert.equal(e.w.AppleCinemaGold.diagnostics.startup,'ready');
  assert.equal(e.w.AppleCinemaGold.diagnostics.lastError,undefined);
});
