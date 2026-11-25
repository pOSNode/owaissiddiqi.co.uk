// Kaplan-Meier explorer: draws precomputed curves from /Projects/data/km.json.
(function () {
  var select = document.getElementById('kmGroup');
  var canvas = document.getElementById('kmChart');
  if (!select || !canvas) return;

  var COLOURS = ['#b3200f', '#2f6aa8', '#1c1917'];
  var DASHES = [[], [7, 4], [2, 3]];
  var X_MAX = 240;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stat = document.getElementById('kmStat');
  var note = document.getElementById('kmNote');
  var risk = document.getElementById('kmRisk');
  var details = document.querySelector('.km-all');
  var chart, data;

  function fail() {
    stat.textContent = 'The chart could not load. The table below holds the same groupings.';
    canvas.parentNode.hidden = true;
    if (details) details.open = true;
  }
  if (!window.Chart) return fail();

  function el(tag, text) { var e = document.createElement(tag); if (text != null) e.textContent = text; return e; }
  function swatch(i) {
    var s = el('span'); s.className = 'sw' + (i ? ' d' + i : ''); s.style.setProperty('--c', COLOURS[i]);
    s.setAttribute('aria-hidden', 'true'); return s;
  }
  function fmtP(p) { return p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3); }

  function points(g) {
    var pts = [];
    for (var i = 0; i < g.t.length && g.t[i] <= X_MAX; i++) pts.push({ x: g.t[i], y: g.s[i] * 100 });
    var last = pts[pts.length - 1];
    if (g.t[g.t.length - 1] > X_MAX) pts.push({ x: X_MAX, y: last.y });
    return pts;
  }

  function show(id) {
    var grouping = data.groupings.filter(function (g) { return g.id === id; })[0];
    var groups = grouping.groups;

    stat.textContent = '';
    groups.forEach(function (g, i) {
      var part = el('span');
      part.appendChild(swatch(i));
      part.appendChild(document.createTextNode(g.label + ': ' + g.n + ' patients, ' + g.events + ' metastases'));
      stat.appendChild(part);
    });
    if (grouping.p != null) stat.appendChild(el('span', 'Log-rank p ' + fmtP(grouping.p)));
    note.textContent = grouping.note;
    note.hidden = !grouping.note;

    var caption = risk.querySelector('caption');
    risk.textContent = '';
    risk.appendChild(caption);
    var head = el('thead'), hr = el('tr'), body = el('tbody');
    hr.appendChild(el('th', 'Group')).setAttribute('scope', 'col');
    data.riskTimes.forEach(function (t) { hr.appendChild(el('th', String(t))).setAttribute('scope', 'col'); });
    head.appendChild(hr);
    groups.forEach(function (g, i) {
      var tr = el('tr'), th = el('th');
      th.setAttribute('scope', 'row');
      th.appendChild(swatch(i));
      th.appendChild(document.createTextNode(g.label));
      tr.appendChild(th);
      g.atRisk.forEach(function (n) { tr.appendChild(el('td', String(n))); });
      body.appendChild(tr);
    });
    risk.appendChild(head);
    risk.appendChild(body);

    canvas.setAttribute('aria-label', 'Kaplan-Meier curves of distant-metastasis-free survival, ' + grouping.label +
      '. ' + groups.map(function (g) { return g.label + ', ' + g.n + ' patients'; }).join('; ') +
      (grouping.p != null ? '. Log-rank p ' + fmtP(grouping.p) + '.' : '.'));

    chart.data.datasets = groups.map(function (g, i) {
      return {
        label: g.label, data: points(g), steppedLine: 'after', fill: false,
        borderColor: COLOURS[i], backgroundColor: COLOURS[i], borderWidth: 2, borderDash: DASHES[i],
        pointRadius: 0, pointHitRadius: 6, pointHoverRadius: 4
      };
    });
    chart.update();
  }

  function init(json) {
    data = json;
    Chart.defaults.global.defaultFontFamily = 'Inter';
    Chart.defaults.global.defaultFontColor = '#44403c';
    chart = new Chart(canvas, {
      type: 'line',
      data: { datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: still ? 0 : 400 },
        legend: { display: false },
        tooltips: {
          mode: 'nearest', intersect: false,
          callbacks: {
            title: function (items) { return Math.round(items[0].xLabel) + ' months'; },
            label: function (item, d) { return d.datasets[item.datasetIndex].label + ': ' + item.yLabel.toFixed(1) + '% free of metastasis'; }
          }
        },
        scales: {
          xAxes: [{ type: 'linear', ticks: { min: 0, max: X_MAX, stepSize: 60 },
                    scaleLabel: { display: true, labelString: 'Follow-up time (months)' } }],
          yAxes: [{ ticks: { min: 0, max: 100, stepSize: 20, callback: function (v) { return v + '%'; } },
                    scaleLabel: { display: true, labelString: 'Free of distant metastasis' } }]
        }
      }
    });

    select.textContent = '';
    data.groupings.forEach(function (g) { select.appendChild(new Option(g.label, g.id)); });
    select.disabled = false;
    select.addEventListener('change', function () { show(select.value); });
    if (details) details.open = false;
    show(select.value);
  }

  fetch('/Projects/data/km.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(init)
    .catch(fail);
})();
