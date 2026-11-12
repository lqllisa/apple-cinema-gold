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
  const state = {favorite:false,watch:0,folder:0,details:0,trailers:0,requests:[],destroyed:0,notices:[],playerMode:options.playerMode || 'play'};
  const handlers = {}, playerHandlers = {}, controls = {}, settings = {}, storage = {'lmp_apple_cinema_topbar_scale':'2.25'};
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
  w.appready = true; w.__APPLETV_AGNATIVE_TOPNAV__ = true; w.__AGNATIVE_HERO_CONTROLLER__ = true;
  w.Lampa = {
    Storage:{get:(key,fallback)=>key in storage ? storage[key] : fallback,set:(key,value)=>{storage[key]=value;}},
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
      const token = new URL(frame.src).searchParams.get('token');
      w.setTimeout(()=>{
        if (!frame.isConnected) return;
        if (state.playerMode === 'blocked') return;
        w.dispatchEvent(new w.MessageEvent('message', {
          origin:'https://lqllisa.github.io', source:frame.contentWindow,
          data:{acgToken:token,state:state.playerMode==='error'?'error':'playing',code:153}
        }));
      },20);
    });
  });
  frameObserver.observe(d.body,{subtree:true,childList:true});
  t.after(()=>frameObserver.disconnect());
  function video() {return {site:'YouTube',type:'Trailer',key:'M7lc1UVf-VE',official:true};}
  function home(withHero=true) {
    q('.activity__body').innerHTML='<div class="scroll"><div class="scroll__body"><div class="items-line"><div class="card"></div></div></div></div>';
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
    emit('full',{type:'complite',body:w.$(root),data:{movie,videos:preloaded?{results:[video()]}:null}});
    // Lampa binds its Watch action AFTER sending the completion event.
    q('.button--play').addEventListener('hover:enter',()=>{state.watch++;});
  }
  home(false);w.eval(script);
  return {w,d,q,state,storage,settings,movie,enter,emit,playerEmit,home,full,mountHero,controls,selected:()=>selected};
}

test('late hero gets real controls, metadata and working Next', async t=>{
  const e=fixture(t);await wait(330);e.mountHero();await wait(30);
  assert.equal(e.d.querySelectorAll('.acg-hero-actions .selector').length,5);
  assert.match(e.q('.acg-metadata').textContent,/2025Сериал★ 8.1/);
  assert.match(e.q('.acg-tags').textContent,/ФантастикаДрама/);
  assert.equal(e.q('.agnative-hero__overview').textContent,e.movie.overview);
  e.enter(e.q('.acg-next'));
  assert.equal(e.q('.agnative-hero__indicator--active'),e.d.querySelectorAll('.agnative-hero__indicator')[1]);
  assert.equal(e.w.AppleCinemaGold.diagnostics.lastError,undefined);
});

test('remote navigation and favorite are usable and do not double toggle', async t=>{
  const e=fixture(t);e.mountHero();await wait(25);
  e.w.Lampa.Controller.toggle('agnative_hero');assert(e.selected().classList.contains('acg-watch'));
  e.controls.agnative_hero.right();assert(e.selected().classList.contains('acg-favorite'));
  e.enter(e.selected());e.selected().click();assert(e.state.favorite);
  assert.equal(e.selected().getAttribute('aria-pressed'),'true');
  await wait(270);e.enter(e.selected());assert(!e.state.favorite);
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
  e.home();await wait(20);e.enter(e.q('.acg-folder'));await wait(20);assert.equal(e.state.folder,1);
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

test('migration resets oversized menu; scaling follows actual Lampa body font', t=>{
  const e=fixture(t);assert.equal(e.storage.lmp_apple_cinema_topbar_scale,'1');
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
  assert(e.q('.button--play'));assert(!e.d.body.classList.contains('acg-v16'));
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
  assert.equal(config.videoId,'M7lc1UVf-VE');assert.equal(config.playerVars.origin,'https://lqllisa.github.io');
  assert.equal(config.playerVars.mute,1);assert.equal(messages.length,0);
  const target={mute:()=>muted++,playVideo:()=>played++};
  config.events.onReady({target});assert.equal(muted,1);assert.equal(played,1);assert.equal(messages.length,0);
  config.events.onStateChange({target,data:1});assert.equal(messages[0].state,'playing');
  w.dispatchEvent(new w.MessageEvent('message',{source:w,data:{acgToken:'acg_test',command:'destroy'}}));
  assert.equal(destroyed,1);
});
