// GameHud.js — интерфейс заезда и меню: спидометр (км/ч: дуга со шкалой, маркер и цифры), полоса прогресса трассы с флажками
// чекпоинтов, таймер и падения, монеты, кнопки «за рекламу» (пропуск этапа, ракета), всплывающие
// надписи, главное меню с выбором мира, пауза, экран финиша. Раскладка заезда — HudLayout (без наложений
// на любом экране), тексты — HUD_TEXT в LANG_STRINGS (ru/en). Решения принимает Game; Hud только рисует
// и передаёт нажатия (Hud.on.<имя>).

const HUD_ICON = {
    coin: 'assets/ui/icons/coin.webp', timer: 'assets/ui/icons/timer.webp', skull: 'assets/ui/icons/skull.webp',
    pause: 'assets/ui/icons/pause.webp', play: 'assets/ui/icons/play.webp', skip: 'assets/ui/icons/skip.webp',
    rocket: 'assets/ui/icons/lightning.webp', ad: 'assets/ui/icons/ad-video.webp', lock: 'assets/ui/icons/lock.webp',
    shop: 'assets/ui/icons/shop.webp', gift: 'assets/ui/icons/gift.webp', wheel: 'assets/ui/icons/prize-wheel.webp',
    trophy: 'assets/ui/icons/trophy.webp', settings: 'assets/ui/icons/settings.webp', home: 'assets/ui/icons/home.webp',
    restart: 'assets/ui/icons/restart.webp', star: 'assets/ui/icons/star.webp', check: 'assets/ui/icons/check.webp',
    question: 'assets/ui/icons/question.webp', arrow: 'assets/ui/icons/arrow-right.webp', crown: 'assets/ui/icons/crown.webp',
};

// Спидометр: скорость Game отдаёт в px/с (2600 px/с — полный газ ≈ 156 км/ч), шкала дуги — до HUD_KMH_MAX (Constants.js).
const hudKmhMax = () => (typeof HUD_KMH_MAX !== 'undefined' ? HUD_KMH_MAX : 220);

// Машинка-маркер на полосе прогресса (вид сбоку, как у значка Гаража).
const HUD_CAR_MARK = '<svg viewBox="0 0 64 32" aria-hidden="true"><g stroke="#05060a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M4 23v-5q0-3 4-4l9-2q4-8 12-9h9q7 1 12 9l8 2q4 1 4 5v4z" fill="#ffd600"/><path d="M20 13q3-5 8-6h6v6zM38 7h2q5 1 8 6H38z" fill="#b6f6ff" stroke-width="2"/><circle cx="17" cy="24" r="5" fill="#0b0d14"/><circle cx="49" cy="24" r="5" fill="#0b0d14"/></g></svg>';

// Обложки миров для карточки выбора (иллюстрации с собственной рамкой и клетчатой лентой).
const HUD_WORLD_ART = ['assets/ui/worlds/world-1.webp', 'assets/ui/worlds/world-2.webp', 'assets/ui/worlds/world-3.webp'];

const HUD_TEXT = {
    ru: {
        'game.title1': 'Obby Car', 'game.title2': 'Master',
        'world.1': 'Небесный автодром', 'world.2': 'Конфетное шоссе', 'world.3': 'Вулканический трек',
        'world.n': 'Мир {n}', 'world.locked': 'Пройди мир {n}', 'world.best': 'Рекорд {t}', 'world.noBest': 'Ещё не пройден',
        'world.cp': 'Чекпоинт {a}/{b}',
        'menu.play': 'Поехали!', 'menu.continue': 'Продолжить', 'menu.garage': 'Гараж', 'menu.daily': 'Подарок',
        'menu.wheel': 'Колесо', 'menu.records': 'Рекорды', 'menu.settings': 'Настройки', 'menu.howto': 'Как играть',
        'hud.progress': 'Трасса {p}%', 'hud.kmh': 'км/ч', 'hud.skip': 'Этап', 'hud.rocket': 'Ракета', 'hud.ad': 'За рекламу',
        'hud.wait': '{n} с', 'hud.rocketOn': 'Ракета {n} с',
        'toast.cp': 'Чекпоинт {n}!', 'toast.coins': '+{n}', 'toast.fall': 'Упс!', 'toast.boost': 'Ускорение!',
        'toast.knock': 'Врезался в {name}!', 'toast.rocket': 'Ракета на {n} с!', 'toast.skip': 'Этап пропущен', 'toast.adFail': 'Реклама сейчас недоступна',
        'pause.title': 'Пауза', 'pause.resume': 'Продолжить', 'pause.restart': 'Мир заново', 'pause.menu': 'В меню',
        'finish.title': 'Пройдено!', 'finish.time': 'Время', 'finish.best': 'Рекорд', 'finish.coins': 'Монеты',
        'finish.deaths': 'Падения', 'finish.record': 'Новый рекорд!', 'finish.next': 'Дальше', 'finish.again': 'Ещё раз',
        'finish.menu': 'В меню', 'finish.all': 'Все миры пройдены!',
        'offer.title': 'Слетел с трассы? Поезжай стильно!', 'offer.watch': 'За рекламу {a}/{b}', 'offer.wait': 'Реклама через {n} с',
        'offer.buy': 'Купить за {n}', 'offer.no': 'Нет, спасибо', 'offer.got': 'Новая вещь надета!',
        'offer.r.common': 'Обычная', 'offer.r.rare': 'Редкая', 'offer.r.epic': 'Эпическая', 'offer.r.legendary': 'Легендарная',
        'tut.ride.t': 'Жми на газ', 'tut.ride.keyboard': 'Держи {keys}, чтобы разогнать машину', 'tut.ride.touch': 'Двигай джойстик вверх — машина поедет',
        'tut.steer.t': 'Рули', 'tut.steer.keyboard': '{keys} — поворот руля', 'tut.steer.touch': 'Джойстик влево и вправо — поворот руля',
        'tut.hop.t': 'Прыжок', 'tut.hop.keyboard': 'Нажми {keys} — гидравлика подбросит машину', 'tut.hop.touch': 'Нажми кнопку прыжка справа — машина подпрыгнет',
        'tut.cp.t': 'Доедь до флажка', 'tut.cp.h': 'Флажок — чекпоинт: если слетишь с трассы, вернёшься к нему. Цель — финиш мира!',
    },
    en: {
        'game.title1': 'Obby Car', 'game.title2': 'Master',
        'world.1': 'Sky Speedway', 'world.2': 'Candy Highway', 'world.3': 'Volcano Track',
        'world.n': 'World {n}', 'world.locked': 'Finish world {n}', 'world.best': 'Best {t}', 'world.noBest': 'Not finished yet',
        'world.cp': 'Checkpoint {a}/{b}',
        'menu.play': 'Drive!', 'menu.continue': 'Continue', 'menu.garage': 'Garage', 'menu.daily': 'Gift',
        'menu.wheel': 'Wheel', 'menu.records': 'Records', 'menu.settings': 'Settings', 'menu.howto': 'How to play',
        'hud.progress': 'Track {p}%', 'hud.kmh': 'km/h', 'hud.skip': 'Stage', 'hud.rocket': 'Rocket', 'hud.ad': 'Watch ad',
        'hud.wait': '{n} s', 'hud.rocketOn': 'Rocket {n} s',
        'toast.cp': 'Checkpoint {n}!', 'toast.coins': '+{n}', 'toast.fall': 'Oops!', 'toast.boost': 'Boost!',
        'toast.knock': 'Bumped into {name}!', 'toast.rocket': 'Rocket for {n} s!', 'toast.skip': 'Stage skipped', 'toast.adFail': 'Ad is not available now',
        'pause.title': 'Paused', 'pause.resume': 'Resume', 'pause.restart': 'Restart world', 'pause.menu': 'Menu',
        'finish.title': 'Finished!', 'finish.time': 'Time', 'finish.best': 'Best', 'finish.coins': 'Coins',
        'finish.deaths': 'Falls', 'finish.record': 'New record!', 'finish.next': 'Next', 'finish.again': 'Again',
        'finish.menu': 'Menu', 'finish.all': 'All worlds completed!',
        'offer.title': 'Fell off? Drive in style!', 'offer.watch': 'Watch ad {a}/{b}', 'offer.wait': 'Ad in {n} s',
        'offer.buy': 'Buy for {n}', 'offer.no': 'No, thanks', 'offer.got': 'New item equipped!',
        'offer.r.common': 'Common', 'offer.r.rare': 'Rare', 'offer.r.epic': 'Epic', 'offer.r.legendary': 'Legendary',
        'tut.ride.t': 'Hit the gas', 'tut.ride.keyboard': 'Hold {keys} to speed up', 'tut.ride.touch': 'Push the joystick up to drive',
        'tut.steer.t': 'Steer', 'tut.steer.keyboard': '{keys} — turn the wheel', 'tut.steer.touch': 'Joystick left and right to steer',
        'tut.hop.t': 'Jump', 'tut.hop.keyboard': 'Press {keys} — the hydraulics will bounce your car', 'tut.hop.touch': 'Tap the jump button on the right to bounce',
        'tut.cp.t': 'Reach the flag', 'tut.cp.h': 'A flag is a checkpoint: fall off the track and you return to it. Reach the finish of the world!',
    },
};
(() => {
    if (typeof LANG_STRINGS === 'undefined') return;
    for (const lang of Object.keys(HUD_TEXT)) {
        const dst = LANG_STRINGS[lang] || (LANG_STRINGS[lang] = {});
        for (const [k, v] of Object.entries(HUD_TEXT[lang])) if (!(k in dst)) dst[k] = v;
    }
})();

const HUD_CSS = `
#bo-hud, #bo-menu, #bo-over { position: fixed; inset: 0; pointer-events: none; font-family: var(--bo-font); font-weight: 800; color: #fff; user-select: none; }
#bo-hud { z-index: 20; } #bo-menu { z-index: 30; } #bo-over { z-index: 40; }
#bo-hud [data-hl], #bo-hud .hud-blk { pointer-events: auto; }
#bo-hud.off, #bo-menu.off, .bo-hide { display: none !important; }
body.meta-open #bo-menu, body.meta-open #bo-hud { display: none !important; }
.hud-k { font-size: calc(16px * var(--hl-k, 1)); }
/* плашки HUD: скошенный «приборный» экран — карбон, тонкая светлая кромка, светящиеся цифры */
.hud-plate { isolation: isolate; display: flex; align-items: center; gap: .45em; padding: .3em .85em .3em .6em; text-shadow: var(--bo-outline-thin); white-space: nowrap; box-sizing: border-box; }
.hud-plate::before { content: ''; position: absolute; inset: 0; z-index: -1; transform: skewX(-11deg); border-radius: .3em; border: .12em solid rgba(255,255,255,.32);
  background-color: #090b12; background-image: var(--bo-carbon); box-shadow: 0 0 0 .12em var(--bo-ink), 0 .24em 0 .12em var(--bo-ink), inset 0 0 .9em rgba(30,227,255,.16); }
.hud-plate img { width: 1.9em; height: 1.9em; object-fit: contain; flex: none; }
#hud-time, #hud-coins, #hud-pause, #hud-progress, #hud-actions, #hud-speed { position: fixed; }
#hud-time { flex-direction: column; align-items: stretch; gap: .15em; padding: .35em .85em .35em .9em; }
#hud-time .row { display: flex; align-items: center; gap: .4em; }
#hud-time .t { font-size: 1.5em; letter-spacing: .04em; font-variant-numeric: tabular-nums; color: var(--bo-sky); text-shadow: 0 0 .5em rgba(30,227,255,.7), 0 .08em 0 var(--bo-ink); }
#hud-time .s { font-size: .9em; opacity: .96; } #hud-time img { width: 1.5em; height: 1.5em; }
#hud-time .d { color: #ff6a86; } #hud-time .b { color: var(--bo-yellow); font-size: .9em; }
#hud-coins .n { font-size: 1.5em; min-width: 2.2em; text-align: right; font-variant-numeric: tabular-nums; color: var(--bo-yellow); text-shadow: 0 0 .45em rgba(255,214,0,.5), 0 .08em 0 var(--bo-ink); }
#hud-pause { isolation: isolate; width: 3.2em; height: 3.2em; padding: 0; border: 0; background: none; display: grid; place-items: center; cursor: pointer; transition: transform .08s; }
#hud-pause::before { content: ''; position: absolute; inset: 0; z-index: -1; transform: skewX(-11deg); border-radius: .35em; border: .12em solid rgba(255,255,255,.62);
  background-color: var(--bo-orange); background-image: linear-gradient(180deg, rgba(255,255,255,.44), rgba(0,0,0,.2)), repeating-linear-gradient(45deg, rgba(0,0,0,.1) 0 2px, transparent 2px 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,.1) 0 2px, transparent 2px 4px);
  box-shadow: 0 0 0 .12em var(--bo-ink), 0 .25em 0 .12em var(--bo-ink), inset 0 -.2em 0 rgba(0,0,0,.25); transition: box-shadow .08s; }
#hud-pause:active { transform: translateY(.18em); }
#hud-pause:active::before { box-shadow: 0 0 0 .12em var(--bo-ink), 0 .08em 0 .12em var(--bo-ink), inset 0 -.12em 0 rgba(0,0,0,.25); }
#hud-pause img { width: 2em; height: 2em; filter: drop-shadow(0 1px 0 rgba(5,6,10,.6)); }
/* прогресс трассы — дорога: разметка по центру, оранжевый «след» за машинкой, столбики чекпоинтов, шахматный финиш */
#hud-progress { display: flex; flex-direction: column; gap: .3em; align-items: stretch; }
#hud-progress .lbl { display: flex; justify-content: space-between; gap: .6em; font-size: .88em; letter-spacing: .05em; text-transform: uppercase; text-shadow: var(--bo-outline-thin); padding: 0 .5em; white-space: nowrap; }
#hud-progress .lbl .w { overflow: hidden; text-overflow: ellipsis; } #hud-progress .lbl .p { color: var(--bo-sky); flex: none; }
#hud-progress .bar { position: relative; height: 1.4em; margin: 0 1.1em 0 .5em; border-radius: .22em; transform: skewX(-11deg); border-block: .14em solid rgba(255,255,255,.72);
  background: linear-gradient(180deg, #2b3148, #1a1e2e); box-shadow: 0 0 0 .12em var(--bo-ink), 0 .22em 0 .12em var(--bo-ink); }
#hud-progress .bar::before { content: ''; position: absolute; left: 0; right: 1.2em; top: 50%; height: .14em; margin-top: -.07em; z-index: 1;
  background: repeating-linear-gradient(90deg, rgba(255,255,255,.8) 0 .7em, transparent .7em 1.35em); }
#hud-progress .bar::after { content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: 1.2em; z-index: 1; border-left: .1em solid var(--bo-ink);
  background-color: #fff; background-image: linear-gradient(45deg, var(--bo-ink) 25%, transparent 25%, transparent 75%, var(--bo-ink) 75%), linear-gradient(45deg, var(--bo-ink) 25%, transparent 25%, transparent 75%, var(--bo-ink) 75%);
  background-size: .6em .6em; background-position: 0 0, .3em .3em; }
#hud-progress .fill { position: absolute; left: 0; top: 0; bottom: 0; width: 0%; transition: width .35s; z-index: 0;
  background: linear-gradient(90deg, rgba(255,107,26,0), rgba(255,107,26,.6) 65%, rgba(255,214,0,.95)); }
#hud-progress .tick { position: absolute; top: -.25em; bottom: -.25em; width: .14em; z-index: 2; background: rgba(255,255,255,.45); }
#hud-progress .tick::after { content: ''; position: absolute; top: 0; left: 100%; width: .5em; height: .45em; background: inherit; clip-path: polygon(0 0, 100% 50%, 0 100%); }
#hud-progress .tick.on { background: var(--bo-green); box-shadow: 0 0 .5em rgba(182,255,59,.8); }
#hud-progress .me { position: absolute; top: 50%; width: 2.7em; height: 1.55em; margin: -.78em 0 0 -1.35em; z-index: 3; transition: left .35s; transform: skewX(11deg); filter: drop-shadow(0 .12em 0 rgba(5,6,10,.7)); }
#hud-progress .me svg { display: block; width: 100%; height: 100%; overflow: visible; }
/* спидометр: полукруглая шкала 0..HUD_KMH_MAX, маркер бежит по дуге, цифры внутри */
#hud-speed { isolation: isolate; padding: .22em .3em .12em; filter: drop-shadow(0 .2em 0 rgba(5,6,10,.9)); }
#hud-speed::before { content: ''; position: absolute; inset: 0; z-index: -2; background: linear-gradient(135deg, rgba(255,255,255,.75), rgba(255,255,255,.3) 55%, rgba(30,227,255,.7));
  clip-path: polygon(1.3em 0, calc(100% - 1.3em) 0, 100% 1.3em, 100% 100%, 0 100%, 0 1.3em); }
#hud-speed::after { content: ''; position: absolute; inset: .12em; z-index: -1; background-color: #090b12; background-image: var(--bo-carbon);
  clip-path: polygon(1.2em 0, calc(100% - 1.2em) 0, 100% 1.2em, 100% 100%, 0 100%, 0 1.2em); }
#hud-speed .dial { position: relative; width: 100%; height: 100%; }
#hud-speed svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; }
#hud-speed .bg { fill: none; stroke: rgba(255,255,255,.14); stroke-width: 14; stroke-linecap: round; }
#hud-speed .fl { fill: none; stroke-width: 14; stroke-linecap: round; stroke-dasharray: 0 100; opacity: 0; }
#hud-speed .ticks line { stroke: rgba(9,11,18,.75); stroke-width: 2.6; }
#hud-speed .ticks line.l { stroke: rgba(255,255,255,.92); stroke-width: 3.4; stroke-linecap: round; }
#hud-speed .mk { fill: #fff; stroke: #05060a; stroke-width: 4; }
#hud-speed .read { position: absolute; left: 0; right: 0; bottom: 7%; display: flex; flex-direction: column; align-items: center; line-height: 1; pointer-events: none; }
#hud-speed .n { font-size: 1.8em; min-width: 2.1em; text-align: center; font-variant-numeric: tabular-nums; color: #fff; text-shadow: 0 0 .5em rgba(30,227,255,.75), 0 .06em 0 var(--bo-ink); }
#hud-speed .u { margin-top: .1em; font-size: .62em; letter-spacing: .12em; text-transform: uppercase; color: var(--bo-sky); }
#hud-speed.hot .n { color: #ffd0a8; text-shadow: 0 0 .5em rgba(255,107,26,.9), 0 .06em 0 var(--bo-ink); }
.hud-act { display: flex; flex-direction: column; gap: .8em; align-items: flex-end; }
.hud-act .bo-btn { font-size: 1em; min-height: 0; padding: .4em .8em .4em .6em; flex-direction: row; gap: .35em; }
.hud-act .bo-btn img.i { width: 2em; height: 2em; }
.hud-act .bo-btn .tx { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.05; }
.hud-act .bo-btn .tx small { font-size: .62em; opacity: .95; display: flex; align-items: center; gap: .25em; }
.hud-act .bo-btn .tx small img { width: 1.25em; height: 1.25em; }
#hud-toast { font-family: var(--bo-font); position: fixed; left: 50%; top: calc(var(--hl-progress-y, 10px) + var(--hl-progress-h, 50px) + 14px); transform: translateX(-50%); text-align: center; pointer-events: none; z-index: 25; }
#hud-toast .t { font-size: clamp(26px, 5vw, 44px); font-weight: 900; font-style: italic; font-synthesis: style; text-transform: uppercase; letter-spacing: .01em; text-shadow: var(--bo-outline); color: var(--bo-yellow); animation: bo-pop .9s ease-out both; white-space: nowrap; }
#hud-toast .t.s { font-size: clamp(17px, 3vw, 24px); color: #fff; text-shadow: var(--bo-outline-thin), 2px 3px 0 var(--bo-ink); }
@keyframes bo-pop { 0% { transform: scale(.4) skewX(-10deg); opacity: 0; } 18% { transform: scale(1.12) skewX(-10deg); opacity: 1; } 30% { transform: scale(1) skewX(-10deg); } 80% { opacity: 1; } 100% { opacity: 0; transform: translateY(-14px) skewX(-10deg); } }
#hud-flash { position: fixed; inset: 0; background: #fff; opacity: 0; pointer-events: none; z-index: 26; transition: opacity .25s; }
/* ---- главное меню: зоны по краям, размеры от меньшей стороны экрана — помещается от 568×320 до 4K ---- */
#bo-menu { --u: min(1vh, 1.7vw); --pad: max(10px, calc(var(--u) * 2.2)); }
#bo-menu > * { pointer-events: auto; position: absolute; }
/* логотип: «OBBY CAR» наклонно, со скоростными линиями; «MASTER» — на номерном знаке */
.menu-logo { left: calc(var(--pad) + env(safe-area-inset-left)); top: calc(var(--pad) + env(safe-area-inset-top)); display: flex; flex-direction: column; align-items: flex-start; transform: skewX(-9deg); transform-origin: left top; isolation: isolate; }
.menu-logo::before { content: ''; position: absolute; z-index: -1; left: calc(-1 * var(--pad) - 20px); top: 6%; width: calc(100% + var(--pad) + 20px); height: 78%; opacity: .85;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.85)) 0 14% / 78% 3px no-repeat, linear-gradient(90deg, transparent, rgba(30,227,255,.95)) 0 38% / 100% 3px no-repeat,
    linear-gradient(90deg, transparent, rgba(255,255,255,.7)) 0 62% / 64% 3px no-repeat, linear-gradient(90deg, transparent, rgba(255,107,26,.95)) 0 86% / 90% 3px no-repeat; }
.menu-logo .a { font: 900 clamp(24px, calc(var(--u) * 7.2), 72px)/.95 var(--bo-font); text-transform: uppercase; color: #fff; letter-spacing: -.01em; white-space: nowrap;
  text-shadow: -2px -2px 0 var(--bo-ink), 2px -2px 0 var(--bo-ink), -2px 2px 0 var(--bo-ink), 3px 3px 0 var(--bo-ink), 4px 4px 0 var(--bo-orange), 5px 5px 0 var(--bo-orange), 6px 6px 0 var(--bo-ink), 7px 7px 0 var(--bo-ink), 0 12px 16px rgba(0,0,0,.45); }
.menu-logo .b { position: relative; margin: calc(var(--u) * 1.4) 0 0 .6em; padding: .12em .8em .14em 1.9em; font: 900 clamp(12px, calc(var(--u) * 3.2), 30px)/1.1 var(--bo-font); letter-spacing: .32em; text-transform: uppercase;
  color: var(--bo-dark); background: #f4f6fb; border: 3px solid var(--bo-dark); border-radius: 6px; box-shadow: inset 0 0 0 2px #f4f6fb, 0 0 0 2px #f4f6fb, 0 5px 0 2px var(--bo-ink); }
.menu-logo .b::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 1.35em; background: #1e4fd6; border-radius: 3px 0 0 3px;
  background-image: radial-gradient(circle at 50% 22%, #ffd600 0 .1em, transparent .12em), radial-gradient(circle at 50% 78%, #ffd600 0 .1em, transparent .12em), radial-gradient(circle at 20% 50%, #ffd600 0 .1em, transparent .12em), radial-gradient(circle at 80% 50%, #ffd600 0 .1em, transparent .12em); }
.menu-coins { right: calc(var(--pad) + env(safe-area-inset-right)); top: calc(var(--pad) + env(safe-area-inset-top)); font-size: clamp(13px, calc(var(--u) * 2.6), 20px); }
.menu-side { left: calc(var(--pad) + env(safe-area-inset-left)); top: calc(var(--pad) + env(safe-area-inset-top) + clamp(56px, calc(var(--u) * 18), 180px)); bottom: calc(var(--pad) + env(safe-area-inset-bottom));
  display: flex; flex-direction: column; justify-content: center; gap: clamp(9px, calc(var(--u) * 1.7), 16px); }
.menu-side .bo-btn { --c: var(--bo-purple); font-size: clamp(11px, calc(var(--u) * 2.3), 16px); min-height: 0; height: clamp(32px, calc(var(--u) * 7.4), 52px); padding: 0 1em 0 .5em; justify-content: flex-start;
  min-width: clamp(112px, calc(var(--u) * 24), 172px); }
.menu-side .bo-btn img { width: clamp(24px, calc(var(--u) * 5.6), 40px); height: clamp(24px, calc(var(--u) * 5.6), 40px); filter: drop-shadow(0 2px 0 rgba(5,6,10,.55)); }
.menu-side .bo-btn .dot { position: absolute; top: -7px; right: -2px; width: 14px; height: 14px; border-radius: 3px; transform: rotate(45deg); background: var(--bo-red); border: 3px solid var(--bo-ink); box-shadow: 0 0 8px rgba(255,45,85,.9); display: none; }
.menu-side .bo-btn.hot .dot { display: block; }
.menu-main { right: calc(var(--pad) + env(safe-area-inset-right)); bottom: calc(var(--pad) + env(safe-area-inset-bottom)); width: clamp(250px, calc(var(--u) * 54), 440px);
  display: flex; flex-direction: column; align-items: stretch; gap: clamp(10px, calc(var(--u) * 2), 18px); font-size: clamp(12px, calc(var(--u) * 2.3), 17px); }
.wsel { display: flex; align-items: stretch; gap: .7em; padding-right: 8px; }
.wsel .arr { flex: none; width: 2.5em; height: 3.8em; align-self: center; padding: 0; min-height: 0; --c: var(--bo-purple); font-size: 1em; }
.wsel .arr::after { display: none; }
.wsel .arr img { width: 1.4em; height: 1.4em; filter: drop-shadow(0 2px 0 rgba(5,6,10,.55)); } .wsel .arr.l img { transform: scaleX(-1); }
.wsel .arr.is-off { visibility: hidden; }
/* карточка мира — «билет на трассу»: окно с видом, перфорация, номер-табличка, штрихкод и дорожный прогресс */
.wcard { --c: var(--bo-sky); position: relative; isolation: isolate; flex: 1; min-width: 0; padding: 3px; text-align: left; color: #e9eefc; container-type: inline-size;
  background: linear-gradient(125deg, var(--c), rgba(255,255,255,.6) 50%, var(--c));
  clip-path: polygon(11px 0, calc(100% - 11px) 0, 100% 11px, 100% calc(100% - 11px), calc(100% - 11px) 100%, 11px 100%, 0 calc(100% - 11px), 0 11px); }
.wcard::before { content: ''; position: absolute; inset: 3px; z-index: -1; background-color: var(--bo-asphalt); background-image: var(--bo-carbon);
  clip-path: polygon(9px 0, calc(100% - 9px) 0, 100% 9px, 100% calc(100% - 9px), calc(100% - 9px) 100%, 9px 100%, 0 calc(100% - 9px), 0 9px); }
.wcard .view { position: relative; aspect-ratio: 2.1 / 1; overflow: hidden; background: #0b0d14; clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%, 0 8px); }
.wcard .view img.img { position: absolute; left: 0; top: 0; width: 106.4%; max-width: none; margin: -11.1% 0 0 -3.2%; display: block; pointer-events: none; }
.wcard .view::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 28%; background: linear-gradient(180deg, transparent, rgba(5,6,10,.55)); pointer-events: none; }
.wcard .view .plain { position: absolute; inset: 0; background: linear-gradient(135deg, var(--c), #12141c); opacity: .6; }
.wcard .dots { position: absolute; right: .5em; top: .45em; display: flex; gap: .25em; z-index: 2; }
.wcard .dots i { width: 1em; height: .3em; transform: skewX(-24deg); background: rgba(255,255,255,.4); border: 1px solid rgba(5,6,10,.6); }
.wcard .dots i.on { background: var(--bo-yellow); }
.wcard .done { position: absolute; left: .45em; top: .4em; width: 1.9em; height: 1.9em; display: none; z-index: 2; filter: drop-shadow(0 2px 0 rgba(5,6,10,.8)); }
.wcard.finished .done { display: block; }
.wcard .lock { position: absolute; inset: 0; z-index: 3; display: none; flex-direction: column; align-items: center; justify-content: center; gap: .3em; text-align: center; font-size: .9em; padding: 0 .5em; text-shadow: var(--bo-outline-thin);
  background: rgba(5,6,10,.62); border-bottom: .5em solid transparent; border-image: var(--bo-hazard) 1; }
.wcard.locked .lock { display: flex; }
.wcard .lock img { width: 2.6em; height: 2.6em; }
.wcard.locked .view img.img { filter: grayscale(.8) brightness(.6); }
.wcard .info { position: relative; display: flex; align-items: center; gap: .6em; padding: .45em .5em .5em .35em; border-top: 2px dashed rgba(255,255,255,.4); }
.wcard .info::before, .wcard .info::after { content: ''; position: absolute; top: -.55em; width: 1em; height: 1em; border-radius: 50%; background: var(--bo-ink); }
.wcard .info::before { left: -.6em; } .wcard .info::after { right: -.6em; }
.wcard .num { flex: none; display: grid; place-items: center; min-width: 2em; padding: .05em .35em; font: 900 1.2em/1.1 var(--bo-font); background: #f4f6fb; color: var(--bo-dark); border: .14em solid var(--bo-dark); border-radius: .3em; box-shadow: 0 0 0 .1em #f4f6fb; text-shadow: none; }
.wcard .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .1em; line-height: 1.12; }
.wcard .nm { font-size: .98em; text-transform: uppercase; color: #fff; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; text-shadow: var(--bo-outline-thin); line-height: 1.05; }
.wcard .meta { font-size: .72em; color: #9fb0d6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wcard .pbar { margin-top: .2em; height: .55em; border: 2px solid rgba(255,255,255,.35); border-radius: 2px; background: #090b12; overflow: hidden; }
.wcard .pbar i { display: block; height: 100%; background: repeating-linear-gradient(90deg, var(--c) 0 .7em, transparent .7em 1.05em); }
.wcard .code { flex: none; align-self: stretch; width: 2.3em; opacity: .7; margin: .1em 0;
  background: repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 3px, #fff 3px 6px, transparent 6px 7px, #fff 7px 8px, transparent 8px 11px); }
@container (max-width: 290px) { .wcard .code { display: none; } }
.menu-play { --c: var(--bo-green); font-size: 1.6em; min-height: 0; padding: .35em .9em; letter-spacing: .06em; text-transform: uppercase; }
.menu-play img { width: 1.2em; height: 1.2em; }
@media (orientation: portrait) {
  #bo-menu { --u: min(0.75vh, 1.45vw); }
  .menu-side { top: auto; left: 50%; transform: translateX(-50%); bottom: calc(var(--pad) + env(safe-area-inset-bottom) + min(92vw, 420px) * 0.616 + 5.8em);
    flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 10px; width: min(96vw, 520px); }
  .menu-side .bo-btn { min-width: 0; height: auto; flex-direction: column; justify-content: center; padding: .35em .3em .3em; gap: .15em; width: calc((100% - 40px) / 5); font-size: clamp(10px, 2.6vw, 14px); }
  .menu-main { left: 50%; right: auto; transform: translateX(-50%); width: min(92vw, 420px); }
}
/* ---- оверлеи: пауза, финиш ---- */
#bo-over { display: none; align-items: center; justify-content: center; background: radial-gradient(110% 90% at 50% 40%, rgba(8,10,16,.55), rgba(4,5,9,.86)); pointer-events: auto; padding: 14px; box-sizing: border-box; }
#bo-over.on { display: flex; }
.over-panel { --hc: var(--bo-orange); width: min(420px, 94vw); max-height: 94vh; overflow: auto; scrollbar-width: thin; scrollbar-color: #5b6788 #0b0d15; padding: 3px 3px 20px; text-align: center; }
.over-panel .band { height: 14px; border-bottom: 3px solid var(--bo-ink); margin-bottom: 2px; }
.over-panel .band.bo-hazard { background: var(--bo-hazard); }
.over-panel h2 { margin: 12px 8px 6px; font: 900 clamp(28px, 6vh, 44px)/1 var(--bo-font); text-transform: uppercase; font-style: italic; font-synthesis: style; color: var(--bo-yellow); text-shadow: var(--bo-outline); }
.over-panel .sub { font-size: 15px; margin-bottom: 10px; color: #aeb9d6; text-transform: uppercase; letter-spacing: .05em; }
.over-btns { display: flex; flex-direction: column; gap: 16px; padding: 8px 28px 0; }
.over-btns .bo-btn { font-size: 20px; }
.over-btns .row { display: flex; gap: 16px; } .over-btns .row .bo-btn { flex: 1; font-size: 17px; padding: .5em .6em; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 4px 24px 14px; }
.stat { position: relative; background: #090b12; border: 2px solid rgba(255,255,255,.24); border-left: 5px solid var(--bo-sky); border-radius: 3px; padding: 6px 8px 6px 10px; box-shadow: 0 3px 0 var(--bo-ink); text-align: left; }
.stat:nth-child(2) { border-left-color: var(--bo-yellow); } .stat:nth-child(3) { border-left-color: var(--bo-orange); } .stat:nth-child(4) { border-left-color: var(--bo-red); }
.stat b { display: block; font-weight: 800; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #8fa0c8; } .stat span { font-size: 21px; display: inline-flex; align-items: center; gap: 4px; color: #fff; font-variant-numeric: tabular-nums; }
.stat span img { width: 22px; height: 22px; }
.rec { display: inline-block; margin: 0 0 10px; padding: 4px 14px; background: var(--bo-yellow); color: var(--bo-dark); border: 3px solid var(--bo-ink); border-radius: 4px; text-transform: uppercase; letter-spacing: .05em;
  box-shadow: 3px 3px 0 var(--bo-red); transform: rotate(-3deg) skewX(-8deg); animation: bo-pop 1.6s both; animation-iteration-count: 1; }
@media (max-height: 430px) { .over-panel h2 { margin: 6px 0 2px; } .stats { gap: 6px; padding-bottom: 8px; } .stat span { font-size: 17px; } .over-btns { gap: 12px; } .over-btns .bo-btn { font-size: 16px; min-height: 38px; } }
/* предложение после падения */
.offer-item { position: relative; margin: 2px 26px 14px; padding: 10px 10px 8px; background-color: #090b12; background-image: var(--bo-carbon); border: 2px solid rgba(255,255,255,.3); border-radius: 4px; box-shadow: 0 4px 0 var(--bo-ink); }
.offer-item.r-rare { border-color: var(--bo-sky); box-shadow: 0 4px 0 var(--bo-ink), 0 0 16px rgba(30,227,255,.35); } .offer-item.r-epic { border-color: var(--bo-orange); box-shadow: 0 4px 0 var(--bo-ink), 0 0 16px rgba(255,107,26,.4); }
.offer-item.r-legendary { border-color: var(--bo-yellow); box-shadow: 0 4px 0 var(--bo-ink), 0 0 22px rgba(255,214,0,.55); }
.offer-img { width: clamp(90px, 22vh, 150px); height: clamp(90px, 22vh, 150px); object-fit: contain; display: block; margin: 0 auto; }
.offer-nm { font-size: 20px; color: #fff; text-transform: uppercase; } .offer-rar { font-size: 13px; color: #8fa0c8; letter-spacing: .08em; text-transform: uppercase; }
/* сенсорный джойстик и кнопка прыжка в стиле игры */
.lory-ctx { font-family: var(--bo-font) !important; font-weight: 900 !important; border: 3px solid rgba(255,255,255,.75) !important; background: var(--bo-orange) !important;
  box-shadow: 0 0 0 2px var(--bo-ink), 0 6px 0 2px var(--bo-ink) !important; text-shadow: var(--bo-outline-thin); }
.lory-ctx-icon img { filter: drop-shadow(0 2px 0 rgba(5,6,10,.6)); }
.lory-stick { border: 3px solid rgba(255,255,255,.7) !important; background: radial-gradient(circle, rgba(30,227,255,.22) 0 40%, rgba(18,20,28,.5) 41%) !important; box-shadow: 0 0 0 2px var(--bo-ink) !important; }
.lory-stick.idle { opacity: .55 !important; }
.lory-stick i { background: var(--bo-sky) !important; border: 3px solid var(--bo-ink); box-sizing: border-box; opacity: 1 !important; }
`;

/** @satisfies {Record<string, any>} */
const Hud = {
    /** @type {Record<string, (...a: any[]) => void>} */ on: {},
    /** @type {Record<string, HTMLElement>} */ el: {},
    _cpTotal: 0,
    _speedShown: -1,
    _coinsShown: -1,
    _toastTimer: 0,

    init() {
        const st = document.createElement('style');
        st.id = 'bo-hud-css'; st.textContent = HUD_CSS;
        document.head.appendChild(st);
        const I = HUD_ICON;
        const hud = this._div('bo-hud', '', document.body);
        hud.className = 'off';
        hud.innerHTML = `
          <div id="hud-time" class="hud-plate hud-k"><div class="row"><img src="${I.timer}" alt=""><span class="t">00:00.00</span></div>
            <div class="row s"><img src="${I.skull}" alt=""><span class="d">0</span><span class="b"></span></div></div>
          <div id="hud-progress" class="hud-k"><div class="lbl"><span class="w"></span><span class="p"></span></div><div class="bar"><div class="fill"></div><div class="ticks"></div><div class="me">${HUD_CAR_MARK}</div></div></div>
          <div id="hud-coins" class="hud-plate hud-k"><img src="${I.coin}" alt=""><span class="n">0</span></div>
          <button id="hud-pause" class="hud-k" type="button" aria-label="pause"><img src="${I.pause}" alt=""></button>
          <div id="hud-actions" class="hud-act hud-k">
            <button class="bo-btn" id="hud-skip" type="button" style="--c: var(--bo-sky)"><img class="i" src="${I.skip}" alt=""><span class="tx"><span data-t="hud.skip"></span><small><img src="${I.ad}" alt=""><span class="w"></span></small></span></button>
            <button class="bo-btn" id="hud-rocket" type="button" style="--c: var(--bo-orange)"><img class="i" src="${I.rocket}" alt=""><span class="tx"><span class="rl" data-t="hud.rocket"></span><small><img src="${I.ad}" alt=""><span class="w"></span></small></span></button>
          </div>
          <div id="hud-speed" class="hud-k"><div class="dial">
            <svg viewBox="0 0 200 104" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
              <defs><linearGradient id="hud-sp-grad" gradientUnits="userSpaceOnUse" x1="22" y1="0" x2="178" y2="0"><stop offset="0" stop-color="#56c93a"/><stop offset=".6" stop-color="#ffd23f"/><stop offset="1" stop-color="#ff4d5e"/></linearGradient></defs>
              <path class="bg" pathLength="100" d="M22 92A78 78 0 0 1 178 92"/>
              <path class="fl" pathLength="100" stroke="url(#hud-sp-grad)" d="M22 92A78 78 0 0 1 178 92"/>
              <g class="ticks">${this._speedTicks()}</g>
              <circle class="mk" r="9" cx="22" cy="92"/>
            </svg>
            <div class="read"><span class="n">0</span><span class="u" data-t="hud.kmh"></span></div></div></div>`;
        this._div('hud-toast', '', document.body);
        this._div('hud-flash', '', document.body);
        const menu = this._div('bo-menu', '', document.body);
        menu.className = 'off';
        menu.innerHTML = `
          <div class="menu-logo"><span class="a" data-t="game.title1"></span><span class="b" data-t="game.title2"></span></div>
          <div class="menu-coins hud-plate"><img src="${I.coin}" alt=""><span class="n">0</span></div>
          <div class="menu-side">
            <button class="bo-btn" data-m="garage" type="button" style="--c: var(--bo-orange)"><img src="${I.shop}" alt=""><span data-t="menu.garage"></span><i class="dot"></i></button>
            <button class="bo-btn" data-m="daily" type="button" style="--c: var(--bo-green)"><img src="${I.gift}" alt=""><span data-t="menu.daily"></span><i class="dot"></i></button>
            <button class="bo-btn" data-m="wheel" type="button" style="--c: var(--bo-sky)"><img src="${I.wheel}" alt=""><span data-t="menu.wheel"></span><i class="dot"></i></button>
            <button class="bo-btn" data-m="records" type="button" style="--c: var(--bo-yellow)"><img src="${I.trophy}" alt=""><span data-t="menu.records"></span><i class="dot"></i></button>
            <button class="bo-btn" data-m="settings" type="button" style="--c: var(--bo-purple)"><img src="${I.settings}" alt=""><span data-t="menu.settings"></span><i class="dot"></i></button>
          </div>
          <div class="menu-main"><div class="wsel"><button class="bo-btn arr l" type="button" aria-label="prev"><img src="${I.arrow}" alt=""></button><div class="wcard"></div><button class="bo-btn arr r" type="button" aria-label="next"><img src="${I.arrow}" alt=""></button></div>
            <button class="bo-btn menu-play" type="button"><img src="${I.play}" alt=""><span data-t="menu.play"></span></button></div>`;
        const over = this._div('bo-over', '', document.body);
        void over;
        for (const k of ['hud', 'menu', 'over']) this.el[k] = /** @type {HTMLElement} */ (document.getElementById('bo-' + k));
        this.el.toast = /** @type {HTMLElement} */ (document.getElementById('hud-toast'));
        this.el.flash = /** @type {HTMLElement} */ (document.getElementById('hud-flash'));
        Lang.apply();
        const click = (sel, fn) => { const e = document.querySelector(sel); if (e) e.addEventListener('click', (ev) => { ev.stopPropagation(); this._click(); fn(ev); }); };
        click('#hud-pause', () => this.on.pause && this.on.pause());
        click('#hud-skip', () => this.on.skip && this.on.skip());
        click('#hud-rocket', () => this.on.rocket && this.on.rocket());
        click('.menu-play', () => this.on.play && this.on.play());
        click('.wsel .arr.l', () => this.on.selectWorld && this.on.selectWorld(this._sel - 1));
        click('.wsel .arr.r', () => this.on.selectWorld && this.on.selectWorld(this._sel + 1));
        for (const b of Array.from(menu.querySelectorAll('[data-m]'))) b.addEventListener('click', (ev) => { ev.stopPropagation(); this._click(); if (this.on.meta) this.on.meta(/** @type {HTMLElement} */ (b).dataset.m); });
        // кнопки HUD не отдают нажатие игре и камере
        for (const id of ['hud-pause', 'hud-skip', 'hud-rocket']) {
            const e = document.getElementById(id);
            if (e) for (const t of ['pointerdown', 'pointerup', 'touchstart']) e.addEventListener(t, (ev) => ev.stopPropagation(), { passive: true });
        }
        HudLayout.block('time', { dock: 'tl', w: 168, h: 66, el: '#hud-time', order: 0 });
        HudLayout.block('pause', { dock: 'tr', w: 52, h: 52, el: '#hud-pause', order: -1, min: 44 });
        HudLayout.block('coins', { dock: 'tr', w: 128, h: 46, el: '#hud-coins', order: 0 });
        HudLayout.block('progress', { dock: 'tc', w: 420, h: 50, fill: true, maxW: 560, el: '#hud-progress' });
        HudLayout.block('actions', { dock: 'mr', w: 150, h: 128, el: '#hud-actions', visible: () => this._actionsVisible() });
        HudLayout.block('speed', { dock: 'bc', w: 156, h: 86, el: '#hud-speed' });
        if (typeof Ads !== 'undefined') Ads.on(() => this.refreshAds());
        this.refreshAds();
    },

    /** Риски спидометра: тёмные разделители поперёк цветной дуги каждые 20 км/ч, у каждой третьей (60 км/ч) — ещё белая метка внутри. Центр дуги (100, 92). */
    _speedTicks() {
        const n = Math.max(1, Math.round(hudKmhMax() / 20));
        const line = (a, r1, r2, cls) => `<line${cls ? ' class="l"' : ''} x1="${(100 + Math.cos(a) * r1).toFixed(1)}" y1="${(92 - Math.sin(a) * r1).toFixed(1)}" x2="${(100 + Math.cos(a) * r2).toFixed(1)}" y2="${(92 - Math.sin(a) * r2).toFixed(1)}"/>`;
        let out = '';
        for (let i = 0; i <= n; i++) {
            const a = Math.PI * (1 - i / n);
            out += line(a, 71, 85, false);
            if (i % 3 === 0) out += line(a, 61, 68, true);
        }
        return out;
    },

    _actionsVisible() { return !this.el.hud.classList.contains('off') && (typeof Ads === 'undefined' || Ads.supported()); },

    _div(id, cls, parent) {
        const d = document.createElement('div');
        d.id = id; if (cls) d.className = cls;
        parent.appendChild(d);
        return d;
    },

    _click() { try { Sound.play('assets/sounds/click.ogg', { volume: 0.6 }); } catch (e) { /* звук не обязателен */ } },

    show(which) {
        this.el.hud.classList.toggle('off', which !== 'hud');
        this.el.menu.classList.toggle('off', which !== 'menu');
        HudLayout.refresh();
    },

    fmt(sec) {
        if (sec == null || !Number.isFinite(sec)) return '--:--';
        const m = Math.floor(sec / 60), s = Math.floor(sec % 60), c = Math.floor((sec * 100) % 100);
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + '.' + String(c).padStart(2, '0');
    },

    setTime(sec, deaths, best) {
        const t = this.el.hud.querySelector('#hud-time .t'), d = this.el.hud.querySelector('#hud-time .d'), b = this.el.hud.querySelector('#hud-time .b');
        if (t) t.textContent = this.fmt(sec);
        if (d) d.textContent = String(deaths);
        if (b) b.textContent = best ? '  ★ ' + this.fmt(best) : '';
    },

    setCoins(n) {
        if (n === this._coinsShown) return;
        this._coinsShown = n;
        for (const e of Array.from(document.querySelectorAll('#hud-coins .n, .menu-coins .n'))) e.textContent = String(n);
    },

    /** px/с -> км/ч (2600 px/с — полный газ — это 156 км/ч). */
    kmh(pxs) { return Math.round(Math.abs(pxs) * (typeof HUD_KMH_PER_PXS !== 'undefined' ? HUD_KMH_PER_PXS : 0.06)); },

    /** Скорость в px/с -> км/ч на цифрах, заполненная дуга и маркер на шкале. */
    setSpeed(pxs) {
        const kmh = this.kmh(pxs);
        if (kmh === this._speedShown) return;
        this._speedShown = kmh;
        const root = this.el.hud;
        const n = root.querySelector('#hud-speed .n'); if (n) n.textContent = String(kmh);
        const frac = Math.min(1, kmh / hudKmhMax()), a = Math.PI * (1 - frac);
        const fill = /** @type {SVGElement} */ (root.querySelector('#hud-speed .fl'));
        if (fill) { fill.style.strokeDasharray = (frac * 100).toFixed(2) + ' 100'; fill.style.opacity = frac > 0.004 ? '1' : '0'; }
        const mk = root.querySelector('#hud-speed .mk');
        if (mk) { mk.setAttribute('cx', (100 + Math.cos(a) * 78).toFixed(1)); mk.setAttribute('cy', (92 - Math.sin(a) * 78).toFixed(1)); }
        const box = root.querySelector('#hud-speed');
        if (box) box.classList.toggle('hot', frac > 0.82);
    },

    setWorld(n, total) {
        this._cpTotal = total;
        const w = this.el.hud.querySelector('#hud-progress .w'); if (w) w.textContent = Lang.t('world.n', { n }) + ' · ' + Lang.t('world.' + n);
        const ticks = this.el.hud.querySelector('#hud-progress .ticks');
        if (ticks) { ticks.innerHTML = ''; for (let i = 1; i < total; i++) { const t = document.createElement('i'); t.className = 'tick'; t.style.left = (i / total * 100) + '%'; ticks.appendChild(t); } }
    },

    setProgress(frac, cp) {
        const p = Math.max(0, Math.min(1, frac));
        const fill = /** @type {HTMLElement} */ (this.el.hud.querySelector('#hud-progress .fill')); if (fill) fill.style.width = (p * 100).toFixed(1) + '%';
        const me = /** @type {HTMLElement} */ (this.el.hud.querySelector('#hud-progress .me')); if (me) me.style.left = (p * 100).toFixed(1) + '%';
        const lbl = this.el.hud.querySelector('#hud-progress .p'); if (lbl) lbl.textContent = Lang.t('hud.progress', { p: Math.floor(p * 100) });
        const ticks = this.el.hud.querySelectorAll('#hud-progress .tick');
        ticks.forEach((t, i) => t.classList.toggle('on', i < cp));
    },

    toast(text, small) {
        const box = this.el.toast;
        const t = document.createElement('div');
        t.className = 't' + (small ? ' s' : '');
        t.textContent = text;
        box.appendChild(t);
        setTimeout(() => t.remove(), 950);
        while (box.children.length > 3) box.firstChild.remove();
    },

    flash(alpha, ms) {
        const f = this.el.flash;
        f.style.transition = 'none'; f.style.opacity = String(alpha || 0.7);
        requestAnimationFrame(() => { f.style.transition = 'opacity ' + ((ms || 400) / 1000) + 's'; f.style.opacity = '0'; });
    },

    /** Кнопки «за рекламу» в HUD: подпись, кулдаун, активная ракета. */
    refreshAds(rocketLeft) {
        if (rocketLeft != null) this._rocketLeft = rocketLeft;
        const left = typeof Ads !== 'undefined' ? Ads.cooldownLeft() : 0;
        const busy = typeof Ads !== 'undefined' && Ads.busy();
        for (const id of ['hud-skip', 'hud-rocket']) {
            const b = /** @type {HTMLButtonElement} */ (document.getElementById(id));
            if (!b) continue;
            const w = b.querySelector('small .w');
            const active = id === 'hud-rocket' && this._rocketLeft > 0;
            const off = left > 0 || busy || active;
            b.classList.toggle('is-off', off);
            if (w) w.textContent = active ? Lang.t('hud.wait', { n: Math.ceil(this._rocketLeft) }) : left > 0 ? Lang.t('hud.wait', { n: left }) : Lang.t('hud.ad');
        }
    },
    _rocketLeft: 0,

    /** Карточки миров в меню. worlds: [{ n, id, locked, needN, done, best, frac, cp, total }] */
    _sel: 1,
    /** Карточка выбранного мира и стрелки. worlds: [{ n, id, locked, needN, done, best, frac, cp, total }] */
    renderWorlds(worlds, selected) {
        const card = this.el.menu.querySelector('.wcard');
        if (!card) return;
        const w = worlds.find(x => x.n === selected) || worlds[0];
        if (!w) { card.innerHTML = ''; return; }
        this._sel = w.n;
        const colors = ['var(--bo-sky)', 'var(--bo-orange)', 'var(--bo-red)'];
        const art = HUD_WORLD_ART[w.n - 1];
        card.className = 'wcard' + (w.locked ? ' locked' : '') + (w.done ? ' finished' : '');
        card.style.setProperty('--c', colors[(w.n - 1) % 3]);
        const meta = w.cp > 0 && !w.done ? Lang.t('world.cp', { a: w.cp, b: w.total }) : w.best ? Lang.t('world.best', { t: this.fmt(w.best) }) : Lang.t('world.noBest');
        const dots = worlds.map(x => `<i class="${x.n === w.n ? 'on' : ''}"></i>`).join('');
        const pct = Math.round((w.done ? 1 : w.frac) * 100);
        card.innerHTML = `<div class="view">${art ? `<img class="img" src="${art}" alt="">` : '<div class="plain"></div>'}<div class="dots">${dots}</div><img class="done" src="${HUD_ICON.check}" alt="">
              <div class="lock"><img src="${HUD_ICON.lock}" alt=""><span>${Lang.t('world.locked', { n: w.needN })}</span></div></div>
            <div class="info"><span class="num">${w.n}</span><div class="txt"><span class="nm">${Lang.t('world.' + w.n)}</span><span class="meta">${meta}</span><div class="pbar"><i style="width:${pct}%"></i></div></div><i class="code"></i></div>`;
        const idx = worlds.indexOf(w);
        const l = this.el.menu.querySelector('.wsel .arr.l'), r = this.el.menu.querySelector('.wsel .arr.r');
        if (l) l.classList.toggle('is-off', idx <= 0);
        if (r) r.classList.toggle('is-off', idx >= worlds.length - 1);
        const play = this.el.menu.querySelector('.menu-play');
        if (play) play.classList.toggle('is-off', !!w.locked);
    },

    setPlayLabel(key) { const s = this.el.menu.querySelector('.menu-play span'); if (s) s.textContent = Lang.t(key); },
    setHot(name, on) { const b = this.el.menu.querySelector('[data-m="' + name + '"]'); if (b) b.classList.toggle('hot', !!on); },

    // ---- оверлеи ----
    /** opts.band: 'hazard' (по умолчанию) | 'checker' — лента сверху панели (шахматка — только у финиша). */
    overlay(html, buttons, opts) {
        const o = this.el.over;
        const band = opts && opts.band === 'checker' ? 'bo-checker' : 'bo-hazard';
        o.innerHTML = `<div class="over-panel bo-panel"><div class="band ${band}"></div>${html}<div class="over-btns"></div></div>`;
        const box = o.querySelector('.over-btns');
        for (const row of buttons) {
            const holder = Array.isArray(row) ? Object.assign(document.createElement('div'), { className: 'row' }) : box;
            if (Array.isArray(row)) box.appendChild(holder);
            for (const b of Array.isArray(row) ? row : [row]) {
                const btn = document.createElement('button');
                btn.type = 'button'; btn.className = 'bo-btn';
                btn.style.setProperty('--c', b.color || 'var(--bo-green)');
                btn.innerHTML = (b.icon ? `<img class="bo-ico" src="${b.icon}" alt="">` : '') + `<span>${Lang.t(b.key, b.params)}</span>`;
                if (b.off) btn.classList.add('is-off');
                let done = false;
                btn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    if (done || btn.classList.contains('is-off')) return;
                    if (!b.keep) done = true;
                    this._click(); b.fn();
                });
                holder.appendChild(btn);
            }
        }
        o.classList.add('on');
    },
    closeOverlay() { this.el.over.classList.remove('on'); this.el.over.innerHTML = ''; },
    overlayOpen() { return this.el.over.classList.contains('on'); },

    showPause(h) {
        this.overlay(`<h2>${Lang.t('pause.title')}</h2>`, [
            { key: 'pause.resume', icon: HUD_ICON.play, fn: h.resume },
            [{ key: 'menu.garage', icon: HUD_ICON.shop, color: 'var(--bo-orange)', fn: h.garage }, { key: 'menu.settings', icon: HUD_ICON.settings, color: 'var(--bo-purple)', fn: h.settings }],
            [{ key: 'pause.restart', icon: HUD_ICON.restart, color: 'var(--bo-sky)', fn: h.restart }, { key: 'pause.menu', icon: HUD_ICON.home, color: 'var(--bo-red)', fn: h.menu }],
        ]);
    },

    showFinish(d, h) {
        const rec = d.record ? `<div class="rec">${Lang.t('finish.record')}</div>` : '';
        const html = `<h2>${Lang.t('finish.title')}</h2><div class="sub">${Lang.t('world.n', { n: d.n })} · ${Lang.t('world.' + d.n)}</div>${rec}
          <div class="stats"><div class="stat"><b>${Lang.t('finish.time')}</b><span>${this.fmt(d.time)}</span></div>
          <div class="stat"><b>${Lang.t('finish.best')}</b><span>${this.fmt(d.best)}</span></div>
          <div class="stat"><b>${Lang.t('finish.coins')}</b><span><img src="${HUD_ICON.coin}" alt="">+${d.coins}</span></div>
          <div class="stat"><b>${Lang.t('finish.deaths')}</b><span><img src="${HUD_ICON.skull}" alt="">${d.deaths}</span></div></div>
          ${d.all ? `<div class="sub">${Lang.t('finish.all')}</div>` : ''}`;
        const btns = [];
        if (h.next) btns.push({ key: 'finish.next', icon: HUD_ICON.arrow, fn: h.next });
        btns.push([{ key: 'finish.again', icon: HUD_ICON.restart, color: 'var(--bo-sky)', fn: h.again }, { key: 'finish.menu', icon: HUD_ICON.home, color: 'var(--bo-purple)', fn: h.menu }]);
        this.overlay(html, btns, { band: 'checker' });
    },
};

// Пикабу: название только по-русски — логотип меню на всех языках
if (String(GAME_PLATFORM) === 'pikabu' && typeof LANG_STRINGS !== 'undefined') for (const c of Object.keys(LANG_STRINGS)) Object.assign(LANG_STRINGS[c], { 'game.title1': 'Машина', 'game.title2': 'в небе' });
