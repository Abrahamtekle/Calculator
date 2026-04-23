// ============================================================
// PANEL SWITCHER + DROPDOWN MENU
// ============================================================
var titles = { calc: 'Scientific', weight: 'Weight Converter', temp: 'Temperature', area: 'Area Converter', history: 'History' };

function toggleMenu() {
  document.getElementById('dropdown-menu').classList.toggle('open');
}

// Close menu when clicking outside
document.addEventListener('click', function(e) {
  var menu = document.getElementById('dropdown-menu');
  var btn  = document.querySelector('.menu-btn');
  if (menu && !menu.contains(e.target) && e.target !== btn) {
    menu.classList.remove('open');
  }
});

function showPanel(id) {
  // Hide all panels
  document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('active'); });
  // Remove active from all menu items
  document.querySelectorAll('.dropdown-item').forEach(function(b){ b.classList.remove('active'); });
  // Show selected panel
  document.getElementById('panel-'+id).classList.add('active');
  // Highlight selected menu item
  var menuItem = document.getElementById('menu-'+id);
  if (menuItem) menuItem.classList.add('active');
  // Update title
  var titleEl = document.getElementById('top-bar-title');
  if (titleEl) titleEl.textContent = titles[id] || 'Scientific';
  // Close dropdown
  document.getElementById('dropdown-menu').classList.remove('open');
  // If opening history, refresh it
  if (id === 'history') renderHistory();
}

// ============================================================
// CALCULATOR
// ============================================================
var state = { display:'', operator:'', firstNum:null, waiting:false, memory:0, mode:'DEG', feMode:false, justCalc:false, history:[] };

function rnd(n){ return typeof n==='number' ? Math.round(n*1e10)/1e10 : n; }
function updateDisplay(v){ var el=document.getElementById('result'),s=String(v); el.style.fontSize=s.length>14?'22px':s.length>11?'30px':s.length>8?'38px':'46px'; el.textContent=s; }
function updateExpr(s){ document.getElementById('expression').textContent=s; }
function clearOpHL(){ document.querySelectorAll('.btn-op').forEach(function(b){b.classList.remove('selected');}); }

function num(n){
  if(state.justCalc){state.display='';state.justCalc=false;updateExpr('');}
  if(state.waiting){state.display=(n==='.')?'0.':n;state.waiting=false;}
  else{if(state.display.length>=15)return;state.display=(state.display==='0'&&n!=='.')?n:state.display+n;}
  updateDisplay(state.display);
}

function op(o){
  var cur=parseFloat(state.display||document.getElementById('result').textContent||'0');
  if(state.firstNum!==null&&!state.waiting){var r=calc(state.firstNum,cur,state.operator);state.firstNum=r;updateDisplay(r);state.display=String(r);}
  else{state.firstNum=cur;}
  state.operator=o;state.waiting=true;state.justCalc=false;
  var sym={'+':'+','-':'−','*':'×','/':'÷'};
  updateExpr(state.firstNum+' '+(sym[o]||o));
  clearOpHL();
  document.querySelectorAll('.btn-op').forEach(function(b){if(b.textContent.trim()===(sym[o]||o))b.classList.add('selected');});
}

function calc(a,b,o){
  switch(o){
    case'+':return rnd(a+b);case'-':return rnd(a-b);case'*':return rnd(a*b);
    case'/':return b===0?'Div by zero':rnd(a/b);
    case'pow':return rnd(Math.pow(a,b));
    case'mod':return b===0?'Mod by zero':rnd(a%b);
    default:return rnd(b);
  }
}

function fnKey(k){
  var c=parseFloat(state.display||document.getElementById('result').textContent||'0');
  switch(k){
    case'eq':
      if(state.firstNum!==null&&state.operator){
        var ex=document.getElementById('expression').textContent,r=calc(state.firstNum,c,state.operator);
        state.history.push({expr:ex+' '+c+' =',result:r,time:new Date().toLocaleTimeString()});
        updateExpr(ex+' '+c+' =');updateDisplay(r);state.display=String(r);
        state.firstNum=null;state.operator='';state.justCalc=true;clearOpHL();
      }break;
    case'c':state.display='';state.firstNum=null;state.operator='';state.waiting=false;state.justCalc=false;updateExpr('');updateDisplay('0');clearOpHL();break;
    case'ce':state.display='';state.justCalc=false;updateDisplay('0');break;
    case'bs':if(!state.justCalc&&state.display.length>0){state.display=state.display.slice(0,-1);updateDisplay(state.display||'0');}break;
    case'dot':if(state.justCalc){state.display='0';state.justCalc=false;}if(!state.display.includes('.')){state.display+=state.display===''?'0.':'.';updateDisplay(state.display);}break;
    case'pm':if(state.display&&state.display!=='0'){state.display=state.display.startsWith('-')?state.display.slice(1):'-'+state.display;updateDisplay(state.display);}break;
    case'percent':var p=state.firstNum!==null?rnd(state.firstNum*c/100):rnd(c/100);state.display=String(p);updateDisplay(p);updateExpr(c+'%');break;
    case'inv':if(c===0){updateDisplay('Div by zero');return;}var inv=rnd(1/c);state.display=String(inv);updateDisplay(inv);updateExpr('1/('+c+')');break;
    case'sq':var sq=rnd(c*c);state.display=String(sq);updateDisplay(sq);updateExpr('('+c+')²');break;
    case'sqrt':if(c<0){updateDisplay('Invalid');return;}var sr=rnd(Math.sqrt(c));state.display=String(sr);updateDisplay(sr);updateExpr('√('+c+')');break;
    case'pow':state.firstNum=c;state.operator='pow';state.waiting=true;updateExpr(c+' ^');break;
    case'mod':state.firstNum=c;state.operator='mod';state.waiting=true;updateExpr(c+' mod');break;
    case'exp':var ex2=rnd(Math.exp(c));state.display=String(ex2);updateDisplay(ex2);updateExpr('e^('+c+')');break;
    case'log':if(c<=0){updateDisplay('Invalid');return;}var lg=rnd(Math.log10(c));state.display=String(lg);updateDisplay(lg);updateExpr('log('+c+')');break;
    case'ln':if(c<=0){updateDisplay('Invalid');return;}var ln=rnd(Math.log(c));state.display=String(ln);updateDisplay(ln);updateExpr('ln('+c+')');break;
    case'floor':var fl=Math.floor(c);state.display=String(fl);updateDisplay(fl);updateExpr('floor('+c+')');break;
    case'ceil':var cl=Math.ceil(c);state.display=String(cl);updateDisplay(cl);updateExpr('ceil('+c+')');break;
    case'round':var rd=Math.round(c);state.display=String(rd);updateDisplay(rd);updateExpr('round('+c+')');break;
    case'abs':var ab=Math.abs(c);state.display=String(ab);updateDisplay(ab);updateExpr('|'+c+'|');break;
    case'rand':var rn=rnd(Math.random());state.display=String(rn);updateDisplay(rn);updateExpr('rand()');break;
    case'fact':if(c<0||!Number.isInteger(c)||c>170){updateDisplay('Invalid');return;}var f=1;for(var i=2;i<=c;i++)f*=i;state.display=String(f);updateDisplay(f);updateExpr(c+'!');break;
  }
}

function trigFn(f){
  var c=parseFloat(state.display||document.getElementById('result').textContent||'0');
  var rad=state.mode==='DEG'?c*Math.PI/180:c,r;
  switch(f){
    case'sin':r=rnd(Math.sin(rad));break;case'cos':r=rnd(Math.cos(rad));break;
    case'tan':if(state.mode==='DEG'&&c%180===90){updateDisplay('Undefined');return;}r=rnd(Math.tan(rad));break;
    case'sinh':r=rnd(Math.sinh(rad));break;case'cosh':r=rnd(Math.cosh(rad));break;case'tanh':r=rnd(Math.tanh(rad));break;
    case'asin':if(c<-1||c>1){updateDisplay('Invalid');return;}r=Math.asin(c);if(state.mode==='DEG')r=r*180/Math.PI;r=rnd(r);break;
    case'acos':if(c<-1||c>1){updateDisplay('Invalid');return;}r=Math.acos(c);if(state.mode==='DEG')r=r*180/Math.PI;r=rnd(r);break;
    case'atan':r=Math.atan(c);if(state.mode==='DEG')r=r*180/Math.PI;r=rnd(r);break;
    default:r=c;
  }
  updateExpr(f+'('+c+') ['+(state.mode==='DEG'?'DEG':'RAD')+']');
  state.display=String(r);state.justCalc=true;updateDisplay(r);
}

function setMode(m){state.mode=m;document.getElementById('btn-deg').classList.toggle('active',m==='DEG');document.getElementById('btn-rad').classList.toggle('active',m==='RAD');}
function toggleFE(){state.feMode=!state.feMode;document.getElementById('btn-fe').classList.toggle('active',state.feMode);var c=parseFloat(document.getElementById('result').textContent||'0');updateDisplay(state.feMode?c.toExponential(4):c);}
function switchCalcTab(t){document.getElementById('tab-trig').classList.toggle('active',t==='trig');document.getElementById('tab-func').classList.toggle('active',t==='func');document.getElementById('panel-trig').style.display=t==='trig'?'grid':'none';document.getElementById('panel-func').style.display=t==='func'?'grid':'none';}
function memClear(){state.memory=0;}function memRecall(){state.display=String(state.memory);updateDisplay(state.memory);}function memAdd(){state.memory=rnd(state.memory+(parseFloat(state.display)||0));}function memSubtract(){state.memory=rnd(state.memory-(parseFloat(state.display)||0));}function memStore(){state.memory=parseFloat(state.display)||0;}
function showHistory(){ showPanel('history'); }

document.addEventListener('keydown',function(e){
  if(e.key>='0'&&e.key<='9')num(e.key);
  else if(e.key==='.')fnKey('dot');else if(e.key==='+')op('+');else if(e.key==='-')op('-');else if(e.key==='*')op('*');
  else if(e.key==='/'){e.preventDefault();op('/');}
  else if(e.key==='Enter'||e.key==='=')fnKey('eq');else if(e.key==='Backspace')fnKey('bs');
  else if(e.key==='Escape')fnKey('c');else if(e.key==='Delete')fnKey('ce');
  else if(e.key==='%')fnKey('percent');else if(e.key==='r')fnKey('sqrt');else if(e.key==='q')fnKey('sq');
});

// ============================================================
// WEIGHT CONVERTER
// ============================================================
// All conversions go through kg as base unit
var weightToKg = { kg:1, g:0.001, mg:0.000001, lb:0.453592, oz:0.0283495, ton:1000, st:6.35029, mcg:0.000000001 };
var weightNames = { kg:'Kilogram (kg)', g:'Gram (g)', mg:'Milligram (mg)', lb:'Pound (lb)', oz:'Ounce (oz)', ton:'Metric Ton (t)', st:'Stone (st)', mcg:'Microgram (μg)' };

function convertWeight(){
  var val  = parseFloat(document.getElementById('weight-input').value);
  var from = document.getElementById('weight-from').value;
  var to   = document.getElementById('weight-to').value;
  if(isNaN(val)){document.getElementById('weight-output').value='';renderWeightAll(null,to);return;}
  var kg   = val * weightToKg[from];
  var result = kg / weightToKg[to];
  document.getElementById('weight-output').value = roundConv(result);
  renderWeightAll(kg, to);
}

function convertWeightReverse(){
  var val  = parseFloat(document.getElementById('weight-output').value);
  var from = document.getElementById('weight-to').value;
  var to   = document.getElementById('weight-from').value;
  if(isNaN(val)){document.getElementById('weight-input').value='';return;}
  var kg   = val * weightToKg[from];
  document.getElementById('weight-input').value = roundConv(kg / weightToKg[to]);
  renderWeightAll(kg, document.getElementById('weight-to').value);
}

function swapWeight(){
  var f=document.getElementById('weight-from'),t=document.getElementById('weight-to'),tmp=f.value;
  f.value=t.value;t.value=tmp;convertWeight();
}

function renderWeightAll(kg, highlightUnit){
  if(kg===null){document.getElementById('weight-all-results').innerHTML='';return;}
  var html='';
  Object.keys(weightToKg).forEach(function(u){
    var val=roundConv(kg/weightToKg[u]);
    var hl=u===highlightUnit?' highlight':'';
    html+='<div class="conv-all-row'+hl+'"><span class="conv-all-unit">'+weightNames[u]+'</span><span class="conv-all-val">'+val+'</span></div>';
  });
  document.getElementById('weight-all-results').innerHTML=html;
}

// ============================================================
// TEMPERATURE CONVERTER
// ============================================================
// All conversions go through Celsius as base
function toCelsius(val, unit){
  switch(unit){
    case'C': return val;
    case'F': return (val-32)*5/9;
    case'K': return val-273.15;
    case'R': return (val-491.67)*5/9;
  }
}
function fromCelsius(c, unit){
  switch(unit){
    case'C': return c;
    case'F': return c*9/5+32;
    case'K': return c+273.15;
    case'R': return (c+273.15)*9/5;
  }
}

var tempNames = { C:'Celsius (°C)', F:'Fahrenheit (°F)', K:'Kelvin (K)', R:'Rankine (°R)' };
var tempSymbols = { C:'°C', F:'°F', K:'K', R:'°R' };

function convertTemp(){
  var val  = parseFloat(document.getElementById('temp-input').value);
  var from = document.getElementById('temp-from').value;
  var to   = document.getElementById('temp-to').value;
  if(isNaN(val)){document.getElementById('temp-output').value='';renderTempAll(null,to);return;}
  var celsius = toCelsius(val, from);
  var result  = fromCelsius(celsius, to);
  document.getElementById('temp-output').value = roundConv(result);
  renderTempAll(celsius, to);
}

function convertTempReverse(){
  var val  = parseFloat(document.getElementById('temp-output').value);
  var from = document.getElementById('temp-to').value;
  var to   = document.getElementById('temp-from').value;
  if(isNaN(val)){document.getElementById('temp-input').value='';return;}
  var celsius = toCelsius(val, from);
  document.getElementById('temp-input').value = roundConv(fromCelsius(celsius, to));
  renderTempAll(celsius, document.getElementById('temp-to').value);
}

function swapTemp(){
  var f=document.getElementById('temp-from'),t=document.getElementById('temp-to'),tmp=f.value;
  f.value=t.value;t.value=tmp;convertTemp();
}

function renderTempAll(celsius, highlightUnit){
  if(celsius===null){document.getElementById('temp-all-results').innerHTML='';return;}
  var html='';
  ['C','F','K','R'].forEach(function(u){
    var val=roundConv(fromCelsius(celsius,u));
    var hl=u===highlightUnit?' highlight':'';
    html+='<div class="conv-all-row'+hl+'"><span class="conv-all-unit">'+tempNames[u]+'</span><span class="conv-all-val">'+val+' '+tempSymbols[u]+'</span></div>';
  });
  document.getElementById('temp-all-results').innerHTML=html;
}

// ============================================================
// SHARED HELPER
// ============================================================
function roundConv(n){
  if(Math.abs(n)<0.000001&&n!==0) return n.toExponential(4);
  if(Math.abs(n)>1e12)            return n.toExponential(4);
  return Math.round(n*1e8)/1e8;
}

// ============================================================
// AREA CONVERTER
// ============================================================
// All conversions go through m² as base unit
var areaToM2 = {
  m2:   1,
  km2:  1e6,
  cm2:  1e-4,
  mm2:  1e-6,
  ft2:  0.09290304,
  in2:  0.00064516,
  yd2:  0.83612736,
  mi2:  2589988.110336,
  ha:   10000,
  ac:   4046.8564224
};

var areaNames = {
  m2:  'Square metre (m²)',
  km2: 'Square kilometre (km²)',
  cm2: 'Square centimetre (cm²)',
  mm2: 'Square millimetre (mm²)',
  ft2: 'Square foot (ft²)',
  in2: 'Square inch (in²)',
  yd2: 'Square yard (yd²)',
  mi2: 'Square mile (mi²)',
  ha:  'Hectare (ha)',
  ac:  'Acre (ac)'
};

var areaShort = {
  m2: 'm²', km2: 'km²', cm2: 'cm²', mm2: 'mm²',
  ft2: 'ft²', in2: 'in²', yd2: 'yd²', mi2: 'mi²',
  ha: 'ha', ac: 'ac'
};

function convertArea() {
  var val  = parseFloat(document.getElementById('area-input').value);
  var from = document.getElementById('area-from').value;
  var to   = document.getElementById('area-to').value;

  if (isNaN(val)) {
    document.getElementById('area-output').value = '';
    document.getElementById('area-equal-box').innerHTML = '';
    renderAreaAll(null, to);
    return;
  }

  var m2     = val * areaToM2[from];
  var result = m2 / areaToM2[to];
  document.getElementById('area-output').value = roundConv(result);

  // "Also equal to" box — show 3 interesting related units
  renderAreaEqual(m2, from, to);
  renderAreaAll(m2, to);
}

function convertAreaReverse() {
  var val  = parseFloat(document.getElementById('area-output').value);
  var from = document.getElementById('area-to').value;
  var to   = document.getElementById('area-from').value;
  if (isNaN(val)) { document.getElementById('area-input').value = ''; return; }
  var m2 = val * areaToM2[from];
  document.getElementById('area-input').value = roundConv(m2 / areaToM2[to]);
  renderAreaEqual(m2, to, from);
  renderAreaAll(m2, document.getElementById('area-to').value);
}

function swapArea() {
  var f = document.getElementById('area-from');
  var t = document.getElementById('area-to');
  var tmp = f.value; f.value = t.value; t.value = tmp;
  convertArea();
}

function renderAreaEqual(m2, from, to) {
  // Show 3 "also equal to" comparisons — skip from and to units
  var show  = ['ft2','in2','cm2','yd2','ac','ha','mi2','km2','mm2','m2'];
  var parts = [];
  for (var i = 0; i < show.length && parts.length < 3; i++) {
    var u = show[i];
    if (u === from || u === to) continue;
    var val = roundConv(m2 / areaToM2[u]);
    parts.push('<span>' + val + '</span>' + areaShort[u]);
  }
  var box = document.getElementById('area-equal-box');
  if (parts.length > 0) {
    box.innerHTML = 'Also equal to: ' + parts.join(' &nbsp;·&nbsp; ');
  } else {
    box.innerHTML = '';
  }
}

function renderAreaAll(m2, highlightUnit) {
  if (m2 === null) { document.getElementById('area-all-results').innerHTML = ''; return; }
  var html = '';
  Object.keys(areaToM2).forEach(function(u) {
    var val = roundConv(m2 / areaToM2[u]);
    var hl  = u === highlightUnit ? ' highlight' : '';
    html += '<div class="conv-all-row' + hl + '">' +
              '<span class="conv-all-unit">' + areaNames[u] + '</span>' +
              '<span class="conv-all-val">' + val + ' ' + areaShort[u] + '</span>' +
            '</div>';
  });
  document.getElementById('area-all-results').innerHTML = html;
}


// ============================================================
// HISTORY
// ============================================================
var MAX_HISTORY = 10;

// Override fnKey eq to also update history badge
var _origFnKey = fnKey;
fnKey = function(k) {
  _origFnKey(k);
  if (k === 'eq') {
    updateHistoryBadge();
    // Also render if history panel is open
    var hp = document.getElementById('panel-history');
    if (hp && hp.classList.contains('active')) renderHistory();
  }
};

function updateHistoryBadge() {
  var badge = document.getElementById('history-badge');
  if (!badge) {
    var menuItem = document.getElementById('menu-history');
    if (menuItem) {
      var sp = document.createElement('span');
      sp.id = 'history-badge';
      sp.className = 'history-badge';
      sp.textContent = state.history.length > MAX_HISTORY ? MAX_HISTORY : state.history.length;
      menuItem.appendChild(sp);
    }
  } else {
    var count = state.history.length > MAX_HISTORY ? MAX_HISTORY : state.history.length;
    badge.textContent = count;
  }
}

function renderHistory() {
  var list = document.getElementById('history-list');
  if (!list) return;

  // Only show last 10
  var items = state.history.slice(-MAX_HISTORY).reverse();

  if (items.length === 0) {
    list.innerHTML = '<div class="history-empty">No calculations yet.<br>Start using the calculator!</div>';
    return;
  }

  var html = '';
  items.forEach(function(h, i) {
    var num = items.length - i;
    html += '<div class="history-item" onclick="useHistoryResult(' + JSON.stringify(h.result) + ')">' +
              '<div class="history-item-num">#' + num + '</div>' +
              '<div class="history-item-expr">' + h.expr + '</div>' +
              '<div class="history-item-result">' + h.result + '</div>' +
              '<div class="history-item-time">🕐 ' + h.time + '</div>' +
              '<button class="history-use-btn" onclick="event.stopPropagation();useHistoryResult(' + JSON.stringify(h.result) + ')">Use ↩</button>' +
            '</div>';
  });
  list.innerHTML = html;
}

function useHistoryResult(result) {
  // Switch to calculator and load the result
  showPanel('calc');
  state.display  = String(result);
  state.justCalc = true;
  updateDisplay(result);
}

function clearHistory() {
  state.history = [];
  renderHistory();
  // Remove badge
  var badge = document.getElementById('history-badge');
  if (badge) badge.remove();
}
