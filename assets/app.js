(function(){
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var yr = document.getElementById('yr');
if(yr) yr.textContent = new Date().getFullYear();

var hdr = document.getElementById('hdr');
var onScroll = function(){ hdr.classList.toggle('stuck', window.scrollY > 6); };
onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

var io = new IntersectionObserver(function(es){
  es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:.1, rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

/* ---- terminal session ---- */
var script = [
  {cmd:'szygitech --about'},
  {out:'IT consulting & custom software development'},
  {cmd:'szygitech --focus'},
  {out:'JVM · Scala · distributed systems · mobile'},
  {cmd:'szygitech --status'},
  {out:'available for new projects'}
];
var body = document.getElementById('tbody');
if(!body) return runBackground();

function line(cls, html){
  var d = document.createElement('div');
  d.className = 'l';
  d.innerHTML = html;
  body.appendChild(d);
  return d;
}
function prompt(){ return '<span class="ps">$</span> '; }

if(reduce){
  script.forEach(function(s){
    line('l', s.cmd ? prompt() + '<span class="cmd">' + s.cmd + '</span>'
                    : '<span class="out">' + s.out + '</span>');
  });
  line('l', prompt() + '<i class="caret"></i>');
} else {
  var i = 0;
  function step(){
    if(i >= script.length){ line('l', prompt() + '<i class="caret"></i>'); return; }
    var s = script[i++];
    if(s.out){
      var d = line('l', '<span class="out"></span>');
      d.firstChild.textContent = s.out;
      setTimeout(step, 620);
      return;
    }
    var el = line('l', prompt() + '<span class="cmd"></span><i class="caret"></i>');
    var span = el.querySelector('.cmd'), c = 0;
    (function typeIt(){
      span.textContent = s.cmd.slice(0, ++c);
      if(c < s.cmd.length) setTimeout(typeIt, 52);
      else { el.querySelector('.caret').remove(); setTimeout(step, 380); }
    })();
  }
  setTimeout(step, 500);
}

runBackground();

/* ---- background: quiet field of terminal glyphs ---- */
function runBackground(){
var cv = document.getElementById('glyphs'), ctx = cv.getContext('2d');
var CH = '0123456789abcdef{}[]()<>/\\|=+-*_$#:;.'.split('');
var dpr = Math.min(window.devicePixelRatio || 1, 2);
var w = 0, h = 0, cells = [], cols = 0, rows = 0, S = 22;

function build(){
  w = cv.clientWidth; h = cv.clientHeight;
  cv.width = Math.floor(w*dpr); cv.height = Math.floor(h*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.textBaseline = 'top';
  cols = Math.ceil(w/S); rows = Math.ceil(h/S);
  cells = [];
  var n = Math.min(150, Math.round(cols*rows*0.05));
  for(var i=0;i<n;i++) cells.push(spawn());
}
function spawn(){
  return {
    x: Math.floor(Math.random()*cols)*S + 4,
    y: Math.floor(Math.random()*rows)*S + 4,
    ch: CH[(Math.random()*CH.length)|0],
    t: Math.random()*Math.PI*2,
    sp: 0.004 + Math.random()*0.008,
    hot: Math.random() < 0.06
  };
}

function draw(){
  ctx.clearRect(0,0,w,h);
  for(var i=0;i<cells.length;i++){
    var c = cells[i];
    c.t += c.sp;
    var a = (Math.sin(c.t) + 1) / 2;          /* 0..1 */
    if(a < 0.02 && Math.random() < 0.03){      /* respawn while invisible */
      cells[i] = spawn(); continue;
    }
    var o = a * (c.hot ? 0.16 : 0.085);
    ctx.fillStyle = c.hot ? 'rgba(91,212,139,'+o.toFixed(3)+')'
                          : 'rgba(190,205,220,'+o.toFixed(3)+')';
    ctx.fillText(c.ch, c.x, c.y);
  }
  requestAnimationFrame(draw);
}

window.addEventListener('resize', build);
build();
if(reduce){
  for(var i=0;i<cells.length;i++){
    var c = cells[i];
    ctx.fillStyle = c.hot ? 'rgba(91,212,139,.10)' : 'rgba(190,205,220,.05)';
    ctx.fillText(c.ch, c.x, c.y);
  }
} else {
  requestAnimationFrame(draw);
}
} /* runBackground */
})();
