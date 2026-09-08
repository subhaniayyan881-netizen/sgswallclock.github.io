/* ============ SGS WALL CLOCK — cinematic site logic ============ */
(function(){
"use strict";

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isTouch = window.matchMedia('(hover:none)').matches || window.innerWidth < 900;

/* avoid ScrollTrigger recalculating pinned sections when mobile browser
   chrome (address bar) shows/hides and fires a resize event */
if(window.ScrollTrigger && ScrollTrigger.config){
  ScrollTrigger.config({ignoreMobileResize:true});
}

/* ---------------- loader ---------------- */
window.addEventListener('load', function(){
  setTimeout(function(){
    document.getElementById('loader').classList.add('hide');
    document.body.classList.add('loaded');
    playHeroIntro();
  }, 900);
});

/* ---------------- custom cursor ---------------- */
if(!isTouch){
  var cursor = document.getElementById('cursor');
  var cursorLabel = document.getElementById('cursorLabel');
  var mx=0,my=0,cx=0,cy=0;
  window.addEventListener('mousemove', function(e){ mx=e.clientX; my=e.clientY; });
  (function raf(){
    cx += (mx-cx)*0.2; cy += (my-cy)*0.2;
    cursor.style.left = cx+'px'; cursor.style.top = cy+'px';
    requestAnimationFrame(raf);
  })();
  document.querySelectorAll('a,button,.showcase-card,.swatch,.stage-item,input,textarea').forEach(function(el){
    el.addEventListener('mouseenter', function(){
      cursor.classList.add('grow');
      var isProduct = el.classList.contains('showcase-card');
      var isCta = el.classList.contains('btn-primary') || el.tagName==='BUTTON';
      cursorLabel.textContent = isProduct ? 'VIEW' : (isCta ? 'OPEN' : '');
    });
    el.addEventListener('mouseleave', function(){ cursor.classList.remove('grow'); cursorLabel.textContent=''; });
  });
}

/* ---------------- header + progress ---------------- */
var header = document.getElementById('siteHeader');
var progress = document.getElementById('scroll-progress');
window.addEventListener('scroll', function(){
  header.classList.toggle('scrolled', window.scrollY > 40);
  var h = document.documentElement;
  var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = pct + '%';
}, {passive:true});

/* ---------------- mobile menu ---------------- */
var burger = document.getElementById('burger');
var mmenu = document.getElementById('mobile-menu');
burger.addEventListener('click', function(){
  burger.classList.toggle('open');
  mmenu.classList.toggle('open');
});
mmenu.querySelectorAll('a').forEach(function(a){
  a.addEventListener('click', function(){ burger.classList.remove('open'); mmenu.classList.remove('open'); });
});

/* ---------------- hero intro timeline ---------------- */
function playHeroIntro(){
  if(reduceMotion){
    document.querySelectorAll('.hero-title .line span').forEach(function(s){ s.style.transform='none'; });
    document.getElementById('heroEyebrow').style.opacity=1;
    document.getElementById('heroCopy').style.opacity=1;
    document.getElementById('heroCtas').style.opacity=1;
    return;
  }
  var tl = gsap.timeline();
  tl.to('#heroEyebrow', {opacity:1, duration:.7, ease:'power2.out'})
    .to('.hero-title .line span', {y:'0%', duration:1.1, stagger:.12, ease:'power4.out'}, '-=.3')
    .to('#heroCopy', {opacity:1, duration:.8}, '-=.5')
    .to('#heroCtas', {opacity:1, duration:.8}, '-=.6');
}

/* ---------------- animated nav link letters ---------------- */
document.querySelectorAll('nav.desktop-nav a').forEach(function(a){
  var text = a.textContent.trim();
  var letters = text.split('');
  function buildRow(cls){
    var row = document.createElement('span'); row.className = cls;
    letters.forEach(function(ch,i){
      var s = document.createElement('span');
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      s.style.transitionDelay = (i*22)+'ms';
      row.appendChild(s);
    });
    return row;
  }
  a.innerHTML = '';
  a.appendChild(buildRow('nl-letters'));
  a.appendChild(buildRow('nl-copy'));
});

/* ---------------- animated headline word-reveal ---------------- */
function wrapWords(el){
  if(el.children.length) return; // skip headings with nested markup (br, spans)
  var words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(function(w,i){
    return '<span class="word-mask"><span class="word-inner" style="transition-delay:'+(i*50)+'ms">'+w+'&nbsp;</span></span>';
  }).join('');
  el.classList.add('word-anim');
}
var headlineSelectors = '.section-head h2, .cta-inner h2, .p-info h3, .macro-caption h3';
document.querySelectorAll(headlineSelectors).forEach(function(el){
  wrapWords(el);
  var hio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); hio.unobserve(e.target); }
    });
  }, {threshold:.4});
  hio.observe(el);
});
/* macro headline changes dynamically via scroll — re-trigger a quick word pulse each change */
var macroHeadlineWatch = document.getElementById('macroHeadline');
if(macroHeadlineWatch){
  var macroWrapping = false;
  var macroObserver = new MutationObserver(function(){
    if(macroWrapping) return;
    macroWrapping = true;
    macroHeadlineWatch.classList.remove('in','word-anim');
    wrapWords(macroHeadlineWatch);
    requestAnimationFrame(function(){
      macroHeadlineWatch.classList.add('in');
      macroWrapping = false;
    });
  });
  macroObserver.observe(macroHeadlineWatch, {childList:true});
}

/* ---------------- magnetic buttons ---------------- */
if(!isTouch){
  document.querySelectorAll('.btn').forEach(function(btn){
    btn.addEventListener('mousemove', function(e){
      var r = btn.getBoundingClientRect();
      var relX = e.clientX - r.left - r.width/2;
      var relY = e.clientY - r.top - r.height/2;
      gsap.to(btn, {x:relX*0.28, y:relY*0.5, duration:.4, ease:'power2.out'});
    });
    btn.addEventListener('mouseleave', function(){
      gsap.to(btn, {x:0, y:0, duration:.5, ease:'elastic.out(1,0.4)'});
    });
  });
}

/* ---------------- 3D tilt cards ---------------- */
if(!isTouch){
  document.querySelectorAll('.why-panel, .showcase-card').forEach(function(card){
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left)/r.width - 0.5;
      var py = (e.clientY - r.top)/r.height - 0.5;
      gsap.to(card, {rotateY: px*8, rotateX: -py*8, duration:.5, ease:'power2.out', transformPerspective:700});
    });
    card.addEventListener('mouseleave', function(){
      gsap.to(card, {rotateY:0, rotateX:0, duration:.6, ease:'power3.out'});
    });
  });
}

/* ---------------- scroll reveals ---------------- */
document.querySelectorAll('.reveal').forEach(function(el){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ el.classList.add('in'); io.unobserve(el); }
    });
  }, {threshold:.15});
  io.observe(el);
});

/* ---------------- problem section swap ---------------- */
var problemVisual = document.getElementById('problemVisual');
if(problemVisual){
  var pio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ setTimeout(function(){ problemVisual.classList.add('swap'); }, 500); pio.unobserve(problemVisual); }
    });
  }, {threshold:.5});
  pio.observe(problemVisual);
}

/* ---------------- solution stage list ---------------- */
var stageItems = document.querySelectorAll('.stage-item');
var stageImg = document.getElementById('stageImg');
stageItems.forEach(function(item){
  item.addEventListener('click', function(){
    stageItems.forEach(function(i){ i.classList.remove('active'); });
    item.classList.add('active');
    var src = item.getAttribute('data-img');
    if(stageImg && src){
      gsap.to(stageImg, {opacity:0, duration:.25, onComplete:function(){
        stageImg.src = src;
        gsap.to(stageImg, {opacity:1, duration:.35});
      }});
    }
  });
});
/* auto-advance stages on scroll-into-view (gentle, once) */
if(!reduceMotion && stageItems.length){
  var stageAuto = 0;
  var stageSection = document.getElementById('solution');
  var sio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var interval = setInterval(function(){
          stageAuto = (stageAuto+1) % stageItems.length;
          stageItems[stageAuto].click();
        }, 3200);
        setTimeout(function(){ clearInterval(interval); }, 3200*stageItems.length);
        sio.unobserve(stageSection);
      }
    });
  }, {threshold:.6});
  if(stageSection) sio.observe(stageSection);
}

/* ---------------- customization swatches ---------------- */
var swatches = document.querySelectorAll('.swatch');
var ccImgs = document.querySelectorAll('.cc-img');
swatches.forEach(function(sw){
  sw.addEventListener('click', function(){
    swatches.forEach(function(s){ s.classList.remove('active'); });
    sw.classList.add('active');
    var key = sw.getAttribute('data-key');
    ccImgs.forEach(function(img){
      img.classList.toggle('hidden', img.getAttribute('data-key') !== key);
    });
  });
});
var logoUpload = document.getElementById('logoUpload');
var uploadText = document.getElementById('uploadText');
if(logoUpload){
  logoUpload.addEventListener('change', function(){
    if(logoUpload.files && logoUpload.files[0]){
      uploadText.textContent = 'Logo received: ' + logoUpload.files[0].name + ' — our team will place it on your mockup.';
    }
  });
}

/* ---------------- industries horizontal scroller (drag) ---------------- */
var scroller = document.getElementById('industryScroller');
if(scroller){
  var isDown=false, startX, scrollLeft;
  scroller.addEventListener('mousedown', function(e){ isDown=true; startX=e.pageX; scrollLeft=scroller.scrollLeft; scroller.style.cursor='grabbing'; });
  window.addEventListener('mouseup', function(){ isDown=false; scroller.style.cursor='grab'; });
  window.addEventListener('mousemove', function(e){
    if(!isDown) return;
    e.preventDefault();
    scroller.scrollLeft = scrollLeft - (e.pageX - startX);
  });
  /* on touch devices, native finger-swipe already scrolls this strip —
     don't fight it with a scroll-linked auto-scroll as well */
  if(!reduceMotion && !isTouch){
    ScrollTrigger && ScrollTrigger.create({
      trigger: '#industries',
      start: 'top 60%',
      end: 'bottom 40%',
      onUpdate: function(self){
        var max = scroller.scrollWidth - scroller.clientWidth;
        scroller.scrollLeft = self.progress * max * 0.6;
      }
    });
  }
}

/* ---------------- process timeline fill ---------------- */
gsap && gsap.registerPlugin && ScrollTrigger && gsap.registerPlugin(ScrollTrigger);
var processFill = document.getElementById('processFill');
var processSteps = document.querySelectorAll('.process-step');
if(processFill && ScrollTrigger){
  ScrollTrigger.create({
    trigger: '#process',
    start: 'top 70%',
    end: 'bottom 60%',
    scrub: 1,
    onUpdate: function(self){
      processFill.style.height = (self.progress*100)+'%';
      var idx = Math.floor(self.progress * processSteps.length);
      processSteps.forEach(function(s,i){ s.classList.toggle('in', i<=idx); });
    }
  });
}

/* ---------------- macro pinned zoom sequence ---------------- */
var macroFrames = [
  {img:'assets/clock-black-gold.png', headline:'The face.', copy:'From the finish of the frame to the placement of your logo, every detail is designed to make the final product feel worthy of your brand.', pos:'50% 42%'},
  {img:'assets/logo-full.jpg', headline:'The logo.', copy:'Your identity, reproduced exactly — never altered, never redesigned.', pos:'50% 35%'},
  {img:'assets/clock-white.png', headline:'The hands.', copy:'Clean, legible movement designed to be read at a glance from across the room.', pos:'48% 46%'},
  {img:'assets/clock-lcd.png', headline:'The finishing.', copy:'A quiet frame and considered proportions — built for professional spaces, not just for show.', pos:'50% 40%'}
];
var macroWrap = document.getElementById('macroImgWrap');
var macroImg = macroWrap ? macroWrap.querySelector('img') : null;
var macroHeadline = document.getElementById('macroHeadline');
var macroCopy = document.getElementById('macroCopy');
if(macroImg && ScrollTrigger){
  ScrollTrigger.create({
    trigger: '#macro',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    onUpdate: function(self){
      var n = macroFrames.length;
      var pos = self.progress * n;
      var idx = Math.min(n-1, Math.floor(pos));
      var local = pos - idx;
      var frame = macroFrames[idx];
      if(macroImg.dataset.idx != idx){
        macroImg.dataset.idx = idx;
        macroImg.src = frame.img;
        macroImg.style.objectPosition = frame.pos;
        macroHeadline.textContent = frame.headline;
        macroCopy.textContent = frame.copy;
      }
      var scale = 1 + local*0.35;
      macroImg.style.transform = 'scale('+scale.toFixed(3)+')';
    }
  });
}

/* ---------------- contact logo field ---------------- */
var contactLogo = document.getElementById('contactLogo');
var ufStatus = document.getElementById('ufStatus');
var uploadFieldEl = document.querySelector('.upload-field');
if(uploadFieldEl){
  uploadFieldEl.addEventListener('click', function(e){
    if(e.target.tagName !== 'INPUT'){ contactLogo.click(); }
  });
}
if(contactLogo){
  contactLogo.addEventListener('change', function(){
    if(contactLogo.files && contactLogo.files[0]) ufStatus.textContent = contactLogo.files[0].name;
  });
}

/* ---------------- form submit -> whatsapp handoff ---------------- */
var mockupForm = document.getElementById('mockupForm');
if(mockupForm){
  mockupForm.addEventListener('submit', function(e){
    e.preventDefault();
    var inputs = mockupForm.querySelectorAll('input, textarea');
    var vals = {};
    inputs.forEach(function(i){ vals[i.placeholder] = i.value; });
    var msg = "Hi SGS, I'd like a free mockup.%0AName: "+encodeURIComponent(vals['Your full name']||'')+
      "%0ACompany: "+encodeURIComponent(vals['Company name']||'')+
      "%0APhone: "+encodeURIComponent(vals['03XX XXXXXXX']||'')+
      "%0AClocks needed: "+encodeURIComponent(vals['e.g. 25']||'')+
      "%0AMessage: "+encodeURIComponent(vals['Tell us a little about the space and branding you have in mind']||'');
    window.open('https://wa.me/923710730139?text='+msg, '_blank');
  });
}

/* ================= THREE.JS HERO CLOCK ================= */
var canvas = document.getElementById('clock-canvas');
var fallbackImg = document.getElementById('hero-fallback-img');
var heroReady = false;

function initThree(){
  var renderer;
  try{
    renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:!isTouch, alpha:true, powerPreference:'high-performance'});
  }catch(err){ showFallback(); return; }
  if(!renderer){ showFallback(); return; }

  var hero = document.getElementById('hero');
  var W = hero.clientWidth, H = hero.clientHeight;
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouch?1.5:2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, W/H, 0.1, 100);
  camera.position.set(0,0, isTouch ? 9 : 7.2);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  var key = new THREE.DirectionalLight(0xffe9c9, 1.1);
  key.position.set(3,4,5); scene.add(key);
  var rim = new THREE.DirectionalLight(0xb6905a, 1.4);
  rim.position.set(-4,-2,-3); scene.add(rim);
  var fill = new THREE.PointLight(0xffffff, 0.4);
  fill.position.set(0,0,4); scene.add(fill);

  /* ---- build clock texture (editable placeholder — real GLB can replace this group later) ---- */
  function buildFaceTexture(){
    var size = 1024;
    var c = document.createElement('canvas'); c.width=c.height=size;
    var ctx = c.getContext('2d');
    var r = size/2;
    // face
    ctx.fillStyle = '#f4ecdc';
    ctx.beginPath(); ctx.arc(r,r,r,0,Math.PI*2); ctx.fill();
    // subtle radial shading
    var grad = ctx.createRadialGradient(r,r,r*0.2,r,r,r);
    grad.addColorStop(0,'rgba(255,255,255,0.15)');
    grad.addColorStop(1,'rgba(0,0,0,0.06)');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(r,r,r,0,Math.PI*2); ctx.fill();
    // ticks
    ctx.strokeStyle = '#141209';
    for(var i=0;i<60;i++){
      var ang = (i/60)*Math.PI*2;
      var isHour = i%5===0;
      var len = isHour ? r*0.09 : r*0.035;
      ctx.lineWidth = isHour ? size*0.006 : size*0.0022;
      var x1 = r + Math.sin(ang)*(r*0.9), y1 = r - Math.cos(ang)*(r*0.9);
      var x2 = r + Math.sin(ang)*(r*0.9-len), y2 = r - Math.cos(ang)*(r*0.9-len);
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    }
    // numerals
    ctx.fillStyle = '#141209';
    ctx.font = '600 '+(size*0.09)+'px Georgia, serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    for(var n=1;n<=12;n++){
      var a = (n/12)*Math.PI*2;
      var nx = r + Math.sin(a)*(r*0.74);
      var ny = r - Math.cos(a)*(r*0.74);
      ctx.fillText(n, nx, ny);
    }
    // wordmark
    ctx.fillStyle = '#3a2f1c';
    ctx.font = '700 '+(size*0.075)+'px Georgia, serif';
    ctx.fillText('SGS', r, r - size*0.16);
    ctx.font = '400 '+(size*0.026)+'px Arial';
    ctx.fillStyle = '#6b5f45';
    ctx.fillText('QUARTZ', r, r + size*0.2);
    var tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 8;
    return tex;
  }

  var clockGroup = new THREE.Group();
  scene.add(clockGroup);

  // outer rim (bezel)
  var rimGeo = new THREE.TorusGeometry(2.05, 0.16, 32, 128);
  var rimMat = new THREE.MeshStandardMaterial({color:0x3c1f22, metalness:0.6, roughness:0.35});
  var rimMesh = new THREE.Mesh(rimGeo, rimMat);
  clockGroup.add(rimMesh);

  // inner bezel ring (bronze accent)
  var innerRingGeo = new THREE.TorusGeometry(1.86, 0.045, 24, 128);
  var innerRingMat = new THREE.MeshStandardMaterial({color:0xb6905a, metalness:0.85, roughness:0.3});
  clockGroup.add(new THREE.Mesh(innerRingGeo, innerRingMat));

  // back body
  var backGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.22, 64);
  var backMat = new THREE.MeshStandardMaterial({color:0x121009, metalness:0.4, roughness:0.6});
  var backMesh = new THREE.Mesh(backGeo, backMat);
  backMesh.rotation.x = Math.PI/2; backMesh.position.z = -0.14;
  clockGroup.add(backMesh);

  // face
  var faceTex = buildFaceTexture();
  var faceGeo = new THREE.CircleGeometry(1.85, 96);
  var faceMat = new THREE.MeshStandardMaterial({map:faceTex, roughness:0.55, metalness:0.05});
  var faceMesh = new THREE.Mesh(faceGeo, faceMat);
  faceMesh.position.z = 0.02;
  clockGroup.add(faceMesh);

  // glass
  var glassGeo = new THREE.CircleGeometry(1.98, 96);
  var glassMat = new THREE.MeshPhysicalMaterial({
    color:0xffffff, transparent:true, opacity:0.06, roughness:0.05, metalness:0,
    transmission: 0.9, thickness:0.05, clearcoat:1
  });
  var glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.position.z = 0.14;
  clockGroup.add(glassMesh);

  // hands
  function makeHand(len, width, color, z){
    var geo = new THREE.BoxGeometry(width, len, 0.03);
    geo.translate(0, len/2 - width*0.6, 0);
    var mat = new THREE.MeshStandardMaterial({color:color, metalness:0.3, roughness:0.4});
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = z;
    return mesh;
  }
  var hourHand = makeHand(0.85, 0.05, 0x141209, 0.09);
  var minHand = makeHand(1.25, 0.038, 0x141209, 0.11);
  var secHand = makeHand(1.45, 0.014, 0xb6905a, 0.13);
  clockGroup.add(hourHand, minHand, secHand);

  var pinGeo = new THREE.SphereGeometry(0.06, 24,24);
  var pinMat = new THREE.MeshStandardMaterial({color:0xb6905a, metalness:0.9, roughness:0.2});
  var pin = new THREE.Mesh(pinGeo, pinMat); pin.position.z = 0.15;
  clockGroup.add(pin);

  function updateHands(){
    var d = new Date();
    var ms = d.getMilliseconds()/1000;
    var s = d.getSeconds() + ms;
    var m = d.getMinutes() + s/60;
    var h = (d.getHours()%12) + m/60;
    secHand.rotation.z = -(s/60)*Math.PI*2;
    minHand.rotation.z = -(m/60)*Math.PI*2;
    hourHand.rotation.z = -(h/12)*Math.PI*2;
  }

  /* ---- resize ---- */
  function onResize(){
    var w = hero.clientWidth, h = hero.clientHeight;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  }
  window.addEventListener('resize', onResize);

  /* ---- render loop ---- */
  var lost = false;
  canvas.addEventListener('webglcontextlost', function(e){ e.preventDefault(); lost=true; showFallback(); });

  var mouseX=0, mouseY=0;
  window.addEventListener('mousemove', function(e){
    mouseX = (e.clientX/window.innerWidth - 0.5);
    mouseY = (e.clientY/window.innerHeight - 0.5);
  });

  var scrollProgress = 0; // 0..1 within pinned hero
  var heroVisible = true;
  var rafId = null;
  function tick(){
    if(lost || !heroVisible) { rafId = null; return; }
    updateHands();
    if(!reduceMotion){
      clockGroup.rotation.y = mouseX*0.18 + Math.sin(Date.now()*0.00015)*0.05;
      clockGroup.rotation.x = mouseY*0.1;
    }
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  }
  tick();
  heroReady = true;

  /* pause the render loop entirely once the hero is scrolled out of view —
     saves battery/CPU on phones during the rest of the (long) page */
  if(window.IntersectionObserver){
    new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        heroVisible = e.isIntersecting;
        if(heroVisible && rafId === null){ tick(); }
      });
    }, {threshold:0}).observe(hero);
  }

  /* ---- scroll-driven camera cinematics (pinned hero) ---- */
  if(!reduceMotion && window.gsap && window.ScrollTrigger){
    // start close on the mechanism, pull back to reveal full clock + headline
    camera.position.z = 3.1;
    clockGroup.position.z = 0.4;
    gsap.timeline({
      scrollTrigger:{
        trigger:'#hero',
        start:'top top',
        end:'+=140%',
        scrub:0.6,
        pin:true,
        anticipatePin:1
      }
    })
    .to(camera.position, {z: isTouch?9:7.2, duration:1, ease:'power2.out'}, 0)
    .to(clockGroup.position, {z:0, duration:1, ease:'power2.out'}, 0)
    .to(clockGroup.rotation, {y: 0.55, duration:1, ease:'power1.inOut'}, 0)
    .to('.hero-inner', {opacity:0, y:-40, duration:.4}, 0.6)
    .to(camera.position, {z: isTouch?11:9.5, duration:.6, ease:'power1.in'}, 0.75);
  }
}

function showFallback(){
  canvas.style.display='none';
  fallbackImg.style.display='block';
}

/* WebGL capability check */
function hasWebGL(){
  try{
    var c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  }catch(e){ return false; }
}

if(window.THREE && hasWebGL()){
  try{ initThree(); }catch(err){ console.warn('SGS 3D hero fallback:', err); showFallback(); }
} else {
  showFallback();
}

})();
