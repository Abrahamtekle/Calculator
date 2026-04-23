// ============================================================
// SCIENTIFIC CALCULATOR - FULL JAVASCRIPT
// Works with calculator1.html, calculator2.html, calculator3.html
// ============================================================

// ===== STATE =====
var state = {
  display:      '',        // current input string
  expression:   '',        // expression shown above display
  operator:     '',        // current operator (+, -, *, /, pow, mod)
  firstNum:     null,      // first operand
  waitingForNum: false,    // true after operator pressed
  memory:       0,         // memory storage
  mode:         'DEG',     // angle mode: DEG or RAD
  feMode:       false,     // F-E (scientific notation) toggle
  justCalc:     false,     // true after = pressed
  history:      []         // calculation history
};

// ===== HELPERS: Get/Set display elements =====
function getResultEl()     { return document.getElementById('result')     || document.getElementById('res1') || document.getElementById('res2') || document.getElementById('res3'); }
function getExprEl()       { return document.getElementById('expression') || document.getElementById('expr1') || document.getElementById('expr2') || document.getElementById('expr3'); }

// ===== UPDATE DISPLAY =====
function updateDisplay(val) {
  var el  = getResultEl();
  var str = String(val);

  // Auto-shrink font for long numbers
  if      (str.length > 14) el.style.fontSize = '22px';
  else if (str.length > 12) el.style.fontSize = '28px';
  else if (str.length > 9)  el.style.fontSize = '36px';
  else                      el.style.fontSize = '';   // reset to CSS default

  el.textContent = str;
}

function updateExpression(str) {
  var el = getExprEl();
  if (el) el.textContent = str;
  state.expression = str;
}

// ===== ROUNDING helper (avoid float artifacts) =====
function rnd(n) {
  if (typeof n !== 'number' || isNaN(n)) return n;
  return Math.round(n * 1e10) / 1e10;
}

// ============================================================
// ===== NUMBER INPUT =====
// ============================================================
function num(n) {
  if (state.justCalc && n !== '.') {
    state.display  = '';
    state.justCalc = false;
    updateExpression('');
  }
  if (state.waitingForNum) {
    state.display       = (n === '.') ? '0.' : n;
    state.waitingForNum = false;
  } else {
    if (state.display.length >= 15) return;  // max digits
    if (state.display === '0' && n !== '.') {
      state.display = n;
    } else {
      state.display += n;
    }
  }
  updateDisplay(state.display);
}

// ============================================================
// ===== OPERATORS =====
// ============================================================
function op(o) {
  var cur = parseFloat(state.display || getResultEl().textContent || '0');

  // Chain calculations: 5 + 3 * → calculate 5+3 first
  if (state.firstNum !== null && !state.waitingForNum) {
    var result = calculate(state.firstNum, cur, state.operator);
    state.firstNum = result;
    updateDisplay(result);
    state.display = String(result);
  } else {
    state.firstNum = cur;
  }

  state.operator      = o;
  state.waitingForNum = true;
  state.justCalc      = false;

  // Show expression
  var opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷', 'pow': '^', 'mod': 'mod' };
  updateExpression(state.firstNum + ' ' + (opSymbols[o] || o));

  // Highlight active operator button
  highlightOperator(o);
}

function highlightOperator(o) {
  var opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  document.querySelectorAll('.btn-op').forEach(function(btn) {
    btn.classList.remove('selected');
    if (opSymbols[o] && btn.textContent.trim() === opSymbols[o]) {
      btn.classList.add('selected');
    }
  });
}

function clearOperatorHighlight() {
  document.querySelectorAll('.btn-op').forEach(function(btn) {
    btn.classList.remove('selected');
  });
}

// ============================================================
// ===== CORE CALCULATE =====
// ============================================================
function calculate(a, b, o) {
  var result;
  switch (o) {
    case '+':   result = a + b;              break;
    case '-':   result = a - b;              break;
    case '*':   result = a * b;              break;
    case '/':
      if (b === 0) return 'Cannot divide by zero';
      result = a / b;
      break;
    case 'pow': result = Math.pow(a, b);     break;
    case 'mod':
      if (b === 0) return 'Cannot mod by zero';
      result = a % b;
      break;
    default:    result = b;
  }
  return rnd(result);
}

// ============================================================
// ===== FUNCTION KEYS =====
// ============================================================
function fnKey(key) {
  var cur = parseFloat(state.display || getResultEl().textContent || '0');

  switch (key) {

    // ----- EQUALS -----
    case 'equals':
    case 'eq':
      if (state.firstNum !== null && state.operator) {
        var expr   = state.expression;
        var result = calculate(state.firstNum, cur, state.operator);

        // Save to history
        state.history.push({
          expression: expr + ' ' + cur + ' =',
          result:     result,
          time:       new Date().toLocaleTimeString()
        });

        updateExpression(expr + ' ' + cur + ' =');
        updateDisplay(result);
        state.display    = String(result);
        state.firstNum   = null;
        state.operator   = '';
        state.justCalc   = true;
        clearOperatorHighlight();
      }
      break;

    // ----- CLEAR ALL -----
    case 'c':
      state.display       = '';
      state.firstNum      = null;
      state.operator      = '';
      state.waitingForNum = false;
      state.justCalc      = false;
      updateExpression('');
      updateDisplay('0');
      clearOperatorHighlight();
      break;

    // ----- CLEAR ENTRY -----
    case 'ce':
      state.display  = '';
      state.justCalc = false;
      updateDisplay('0');
      break;

    // ----- BACKSPACE -----
    case 'backspace':
    case 'bs':
      if (!state.justCalc && state.display.length > 0) {
        state.display = state.display.slice(0, -1);
        updateDisplay(state.display || '0');
      }
      break;

    // ----- DECIMAL POINT -----
    case 'dot':
      if (state.justCalc) {
        state.display  = '0';
        state.justCalc = false;
      }
      if (!state.display.includes('.')) {
        state.display += (state.display === '') ? '0.' : '.';
        updateDisplay(state.display);
      }
      break;

    // ----- PLUS / MINUS -----
    case 'plus-minus':
    case 'pm':
      if (state.display && state.display !== '0') {
        state.display = state.display.startsWith('-')
          ? state.display.slice(1)
          : '-' + state.display;
        updateDisplay(state.display);
      }
      break;

    // ----- PERCENTAGE -----
    case 'percent':
      var pct;
      if (state.firstNum !== null) {
        pct = rnd(state.firstNum * cur / 100);
      } else {
        pct = rnd(cur / 100);
      }
      updateExpression(cur + '%');
      state.display = String(pct);
      updateDisplay(pct);
      break;

    // ----- RECIPROCAL (1/x) -----
    case 'inv':
      if (cur === 0) { updateDisplay('Cannot divide by zero'); return; }
      var inv = rnd(1 / cur);
      updateExpression('1/(' + cur + ')');
      state.display = String(inv);
      updateDisplay(inv);
      break;

    // ----- SQUARE (x²) -----
    case 'sq':
      var sq = rnd(cur * cur);
      updateExpression('(' + cur + ')²');
      state.display = String(sq);
      updateDisplay(sq);
      break;

    // ----- CUBE (x³) -----
    case 'cube':
      var cb = rnd(cur * cur * cur);
      updateExpression('(' + cur + ')³');
      state.display = String(cb);
      updateDisplay(cb);
      break;

    // ----- SQUARE ROOT -----
    case 'sqrt':
      if (cur < 0) { updateDisplay('Invalid input'); return; }
      var sr = rnd(Math.sqrt(cur));
      updateExpression('√(' + cur + ')');
      state.display = String(sr);
      updateDisplay(sr);
      break;

    // ----- CUBE ROOT -----
    case 'cbrt':
      var cbr = rnd(Math.cbrt(cur));
      updateExpression('∛(' + cur + ')');
      state.display = String(cbr);
      updateDisplay(cbr);
      break;

    // ----- POWER (x^y) -----
    case 'pow':
    case 'exp10':
      updateExpression(cur + ' ^');
      state.firstNum      = cur;
      state.operator      = 'pow';
      state.waitingForNum = true;
      break;

    // ----- MODULO -----
    case 'mod':
      updateExpression(cur + ' mod');
      state.firstNum      = cur;
      state.operator      = 'mod';
      state.waitingForNum = true;
      break;

    // ----- NATURAL EXPONENTIAL (e^x) -----
    case 'exp':
      var ex = rnd(Math.exp(cur));
      updateExpression('e^(' + cur + ')');
      state.display = String(ex);
      updateDisplay(ex);
      break;

    // ----- LOG BASE 10 -----
    case 'log':
      if (cur <= 0) { updateDisplay('Invalid input'); return; }
      var lg = rnd(Math.log10(cur));
      updateExpression('log(' + cur + ')');
      state.display = String(lg);
      updateDisplay(lg);
      break;

    // ----- NATURAL LOG -----
    case 'ln':
      if (cur <= 0) { updateDisplay('Invalid input'); return; }
      var ln = rnd(Math.log(cur));
      updateExpression('ln(' + cur + ')');
      state.display = String(ln);
      updateDisplay(ln);
      break;

    // ----- LOG BASE 2 -----
    case 'log2':
      if (cur <= 0) { updateDisplay('Invalid input'); return; }
      var lg2 = rnd(Math.log2(cur));
      updateExpression('log₂(' + cur + ')');
      state.display = String(lg2);
      updateDisplay(lg2);
      break;

    // ----- FLOOR -----
    case 'floor':
      var fl = Math.floor(cur);
      updateExpression('floor(' + cur + ')');
      state.display = String(fl);
      updateDisplay(fl);
      break;

    // ----- CEILING -----
    case 'ceil':
      var cl = Math.ceil(cur);
      updateExpression('ceil(' + cur + ')');
      state.display = String(cl);
      updateDisplay(cl);
      break;

    // ----- ROUND -----
    case 'round':
      var rd = Math.round(cur);
      updateExpression('round(' + cur + ')');
      state.display = String(rd);
      updateDisplay(rd);
      break;

    // ----- ABSOLUTE VALUE -----
    case 'abs':
      var ab = Math.abs(cur);
      updateExpression('|' + cur + '|');
      state.display = String(ab);
      updateDisplay(ab);
      break;

    // ----- RANDOM NUMBER (0 to 1) -----
    case 'rand':
      var rn = rnd(Math.random());
      updateExpression('rand()');
      state.display = String(rn);
      updateDisplay(rn);
      break;

    // ----- CONSTANTS -----
    case 'pi':
      state.display = String(Math.PI);
      updateDisplay(Math.PI);
      updateExpression('π');
      break;

    case 'e':
      state.display = String(Math.E);
      updateDisplay(Math.E);
      updateExpression('e');
      break;

    // ----- FACTORIAL -----
    case 'fact':
      if (cur < 0 || !Number.isInteger(cur) || cur > 170) {
        updateDisplay('Invalid input');
        return;
      }
      var fact = 1;
      for (var i = 2; i <= cur; i++) fact *= i;
      updateExpression(cur + '!');
      state.display = String(fact);
      updateDisplay(fact);
      break;

    // ----- DMS (Degrees to Decimal) -----
    case 'dms':
      var deg  = Math.floor(Math.abs(cur));
      var min  = Math.floor((Math.abs(cur) - deg) * 100);
      var sec  = rnd(((Math.abs(cur) - deg) * 100 - min) * 100);
      updateDisplay(deg + '° ' + min + "' " + sec + '"');
      break;
  }
}

// ============================================================
// ===== TRIGONOMETRIC FUNCTIONS =====
// ============================================================
function trigFn(fn) {
  var cur = parseFloat(state.display || getResultEl().textContent || '0');

  // Convert to radians if in DEG mode
  var toRad = (state.mode === 'DEG') ? (Math.PI / 180) : 1;
  var valRad = cur * toRad;

  var result;

  switch (fn) {
    case 'sin':   result = rnd(Math.sin(valRad));    break;
    case 'cos':   result = rnd(Math.cos(valRad));    break;
    case 'tan':
      // tan(90°) is undefined
      if (state.mode === 'DEG' && cur % 180 === 90) {
        updateDisplay('Undefined');
        return;
      }
      result = rnd(Math.tan(valRad));
      break;
    case 'sinh':  result = rnd(Math.sinh(valRad));   break;
    case 'cosh':  result = rnd(Math.cosh(valRad));   break;
    case 'tanh':  result = rnd(Math.tanh(valRad));   break;

    // Inverse trig — input is ratio, output is angle
    case 'asin':
      if (cur < -1 || cur > 1) { updateDisplay('Invalid input'); return; }
      result = Math.asin(cur);
      if (state.mode === 'DEG') result = result * 180 / Math.PI;
      result = rnd(result);
      break;
    case 'acos':
      if (cur < -1 || cur > 1) { updateDisplay('Invalid input'); return; }
      result = Math.acos(cur);
      if (state.mode === 'DEG') result = result * 180 / Math.PI;
      result = rnd(result);
      break;
    case 'atan':
      result = Math.atan(cur);
      if (state.mode === 'DEG') result = result * 180 / Math.PI;
      result = rnd(result);
      break;
    case 'atan2':
      // atan2 needs two inputs — prompt for second
      if (state.firstNum !== null) {
        result = Math.atan2(state.firstNum, cur);
        if (state.mode === 'DEG') result = result * 180 / Math.PI;
        result = rnd(result);
      } else {
        state.firstNum      = cur;
        state.operator      = 'atan2';
        state.waitingForNum = true;
        updateExpression('atan2(' + cur + ', ?)');
        return;
      }
      break;

    // Inverse hyperbolic
    case 'asinh': result = rnd(Math.asinh(cur));     break;
    case 'acosh':
      if (cur < 1) { updateDisplay('Invalid input'); return; }
      result = rnd(Math.acosh(cur));
      break;
    case 'atanh':
      if (cur <= -1 || cur >= 1) { updateDisplay('Invalid input'); return; }
      result = rnd(Math.atanh(cur));
      break;

    default:
      result = cur;
  }

  updateExpression(fn + '(' + cur + ')' + (state.mode === 'DEG' ? ' [DEG]' : ' [RAD]'));
  state.display  = String(result);
  state.justCalc = true;
  updateDisplay(result);
}

// ============================================================
// ===== MODE: DEG / RAD =====
// ============================================================
function setMode(m) {
  state.mode = m;

  // Update UI buttons for all 3 designs
  var degBtns = document.querySelectorAll('#btn-deg, #d1-deg, #d2-deg, #d3-deg');
  var radBtns = document.querySelectorAll('#btn-rad, #d1-rad, #d2-rad, #d3-rad');

  degBtns.forEach(function(b) { b.classList.toggle('active', m === 'DEG'); });
  radBtns.forEach(function(b) { b.classList.toggle('active', m === 'RAD'); });
}

// ============================================================
// ===== F-E TOGGLE (Scientific Notation) =====
// ============================================================
function toggleFE() {
  state.feMode = !state.feMode;
  var cur = parseFloat(getResultEl().textContent || '0');

  if (state.feMode) {
    updateDisplay(cur.toExponential(4));
  } else {
    updateDisplay(cur);
  }
}

// ============================================================
// ===== TABS: Trigonometry / Function =====
// ============================================================
function switchTab(tab) {
  // Support all 3 designs
  var trigTabs  = document.querySelectorAll('#tab-trig,  #d1-ttrig, #d2-ttrig, #d3-ttrig');
  var funcTabs  = document.querySelectorAll('#tab-func,  #d1-tfunc, #d2-tfunc, #d3-tfunc');
  var trigPanels = document.querySelectorAll('#panel-trig, #d1-ptrig, #d2-ptrig, #d3-ptrig');
  var funcPanels = document.querySelectorAll('#panel-func, #d1-pfunc, #d2-pfunc, #d3-pfunc');

  trigTabs.forEach(function(b)  { b.classList.toggle('active', tab === 'trig'); });
  funcTabs.forEach(function(b)  { b.classList.toggle('active', tab === 'func'); });
  trigPanels.forEach(function(p) { p.style.display = tab === 'trig' ? 'grid' : 'none'; });
  funcPanels.forEach(function(p) { p.style.display = tab === 'func' ? 'grid' : 'none'; });
}

// Aliases for multi-design support
function d1_tab(t) { switchTab(t); }
function d2_tab(t) { switchTab(t); }
function d3_tab(t) { switchTab(t); }

// ============================================================
// ===== MEMORY FUNCTIONS =====
// ============================================================
function memClear()    { state.memory = 0; showMemIndicator(false); }
function memRecall()   { state.display = String(state.memory); updateDisplay(state.memory); }
function memAdd()      { state.memory = rnd(state.memory + (parseFloat(state.display) || 0)); showMemIndicator(true); }
function memSubtract() { state.memory = rnd(state.memory - (parseFloat(state.display) || 0)); showMemIndicator(true); }
function memStore()    { state.memory = parseFloat(state.display) || 0; showMemIndicator(true); }

function showMemIndicator(active) {
  // Visual feedback — you can add an "M" indicator to your HTML if desired
  console.log(active ? 'Memory: ' + state.memory : 'Memory cleared');
}

// Aliases for multi-design
function d1_mc()   { memClear(); }    function d2_mc()   { memClear(); }    function d3_mc()   { memClear(); }
function d1_mr()   { memRecall(); }   function d2_mr()   { memRecall(); }   function d3_mr()   { memRecall(); }
function d1_madd() { memAdd(); }      function d2_madd() { memAdd(); }      function d3_madd() { memAdd(); }
function d1_msub() { memSubtract(); } function d2_msub() { memSubtract(); } function d3_msub() { memSubtract(); }
function d1_ms()   { memStore(); }    function d2_ms()   { memStore(); }    function d3_ms()   { memStore(); }

// ============================================================
// ===== ALIASES FOR MULTI-DESIGN SUPPORT =====
// (calculator1.html uses d1_*, calculator2.html uses d2_*, etc.)
// ============================================================
function d1_num(n)    { num(n); }       function d2_num(n)    { num(n); }       function d3_num(n)    { num(n); }
function d1_op(o)     { op(o); }        function d2_op(o)     { op(o); }        function d3_op(o)     { op(o); }
function d1_fn(k)     { fnKey(k); }     function d2_fn(k)     { fnKey(k); }     function d3_fn(k)     { fnKey(k); }
function d1_trig(f)   { trigFn(f); }    function d2_trig(f)   { trigFn(f); }    function d3_trig(f)   { trigFn(f); }
function d1_setMode(m){ setMode(m); }   function d2_setMode(m){ setMode(m); }   function d3_setMode(m){ setMode(m); }
function d1_toggleFE(){ toggleFE(); }   function d2_toggleFE(){ toggleFE(); }   function d3_toggleFE(){ toggleFE(); }

// ============================================================
// ===== KEYBOARD SUPPORT =====
// ============================================================
document.addEventListener('keydown', function(e) {
  if (e.key >= '0' && e.key <= '9')         { num(e.key); }
  else if (e.key === '.')                    { fnKey('dot'); }
  else if (e.key === '+')                    { op('+'); }
  else if (e.key === '-')                    { op('-'); }
  else if (e.key === '*')                    { op('*'); }
  else if (e.key === '/')                    { e.preventDefault(); op('/'); }
  else if (e.key === 'Enter' || e.key === '=') { fnKey('equals'); }
  else if (e.key === 'Backspace')            { fnKey('backspace'); }
  else if (e.key === 'Escape')               { fnKey('c'); }
  else if (e.key === '%')                    { fnKey('percent'); }
  else if (e.key === 'F9')                   { fnKey('pm'); }      // +/-
  else if (e.key === 'r')                    { fnKey('sqrt'); }    // r = square root
  else if (e.key === 'q')                    { fnKey('sq'); }      // q = square
  else if (e.key === 'l')                    { fnKey('log'); }     // l = log
  else if (e.key === 'n')                    { fnKey('ln'); }      // n = natural log
  else if (e.key === 'p')                    { fnKey('pi'); }      // p = π
  else if (e.key === 'e')                    { fnKey('e'); }       // e = Euler's number
  else if (e.key === '!')                    { fnKey('fact'); }    // ! = factorial
  else if (e.key === 'Delete')               { fnKey('ce'); }
});

// ============================================================
// ===== HISTORY =====
// ============================================================
function showHistory() {
  if (state.history.length === 0) {
    alert('No calculations yet.');
    return;
  }
  var lines = state.history.map(function(h, i) {
    return (i + 1) + '.  ' + h.expression + '  =  ' + h.result + '  [' + h.time + ']';
  });
  alert('── Calculation History ──\n\n' + lines.join('\n'));
}

// ============================================================
// ===== INIT =====
// ============================================================
window.addEventListener('load', function() {
  updateDisplay('0');

  // Wire history button if present
  var histBtn = document.querySelector('.history-btn');
  if (histBtn) {
    histBtn.addEventListener('click', showHistory);
  }
});
