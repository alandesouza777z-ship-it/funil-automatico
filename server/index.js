import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'tracking-data.json');
const PORT = 3333;

const app = express();
app.use(cors());
app.use(express.json());

// Load data
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return { events: [] };
}

// Save data
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Receive tracking events
app.post('/api/track', (req, res) => {
  const event = {
    ...req.body,
    receivedAt: new Date().toISOString(),
    ip: req.ip,
  };

  const data = loadData();
  data.events.push(event);

  // Keep only last 50k events
  if (data.events.length > 50000) {
    data.events = data.events.slice(-50000);
  }

  saveData(data);
  res.json({ ok: true });
});

// Get stats for a funnel
app.get('/api/stats/:funnelId', (req, res) => {
  const { funnelId } = req.params;
  const data = loadData();

  const funnelEvents = data.events.filter(e => e.funnelId === funnelId);

  // Aggregate by node
  const nodeStats = {};
  for (const event of funnelEvents) {
    if (!nodeStats[event.nodeId]) {
      nodeStats[event.nodeId] = { visits: 0, exits: 0, clicks: 0, sessions: new Set() };
    }
    const ns = nodeStats[event.nodeId];

    if (event.type === 'pageview') {
      ns.visits++;
      ns.sessions.add(event.sessionId);
    } else if (event.type === 'exit') {
      ns.exits++;
    } else if (event.type === 'click') {
      ns.clicks++;
    }
  }

  // Convert sets to counts
  const result = {};
  for (const [nodeId, stats] of Object.entries(nodeStats)) {
    result[nodeId] = {
      visits: stats.visits,
      exits: stats.exits,
      clicks: stats.clicks,
      uniqueVisitors: stats.sessions.size,
    };
  }

  res.json(result);
});

// Get all events (for debugging)
app.get('/api/events/:funnelId', (req, res) => {
  const data = loadData();
  const events = data.events
    .filter(e => e.funnelId === req.params.funnelId)
    .slice(-200);
  res.json(events);
});

// Serve the tracking script
app.get('/api/tracker.js', (req, res) => {
  const { funnelId, nodeId } = req.query;
  const script = `
(function() {
  var TRACKING_URL = "${req.protocol}://${req.get('host')}/api/track";
  var FUNNEL_ID = "${funnelId || ''}";
  var NODE_ID = "${nodeId || ''}";
  var SESSION_ID = sessionStorage.getItem("_fby_sid") || (Date.now().toString(36) + Math.random().toString(36).slice(2));
  sessionStorage.setItem("_fby_sid", SESSION_ID);
  var startTime = Date.now();

  function send(type, extra) {
    var data = {
      funnelId: FUNNEL_ID,
      nodeId: NODE_ID,
      type: type,
      url: location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      sessionId: SESSION_ID
    };
    if (extra) Object.assign(data, extra);
    navigator.sendBeacon ? navigator.sendBeacon(TRACKING_URL, new Blob([JSON.stringify(data)], {type: "application/json"}))
      : fetch(TRACKING_URL, { method: "POST", body: JSON.stringify(data), headers: {"Content-Type":"application/json"}, keepalive: true });
  }

  // Pageview
  send("pageview");

  // Exit (with time on page)
  window.addEventListener("beforeunload", function() {
    send("exit", { timeOnPage: Math.round((Date.now() - startTime) / 1000) });
  });

  // Track outbound clicks
  document.addEventListener("click", function(e) {
    var a = e.target.closest("a[href]");
    if (a && a.hostname !== location.hostname) {
      send("click", { targetUrl: a.href });
    }
  });
})();
`;
  res.type('application/javascript').send(script);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', events: loadData().events.length });
});

// === OFFER IMPORT FROM FB-ADS-MANAGER ===
const IMPORTED_FILE = path.join(__dirname, 'imported-funnels.json');

function loadImported() {
  try {
    if (fs.existsSync(IMPORTED_FILE)) {
      return JSON.parse(fs.readFileSync(IMPORTED_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return { funnels: [] };
}

function saveImported(data) {
  fs.writeFileSync(IMPORTED_FILE, JSON.stringify(data, null, 2));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// Map offer funnelType to funnel node structure
function buildFunnelNodes(offer) {
  const ft = (offer.funnelType || '').toLowerCase();
  const nodes = [];
  let x = 40;
  const y = 140;
  const gap = 300;

  // Always start with Traffic
  nodes.push({ kind: 'traffic', title: 'Traffic', subtitle: offer.sourcePlatform || 'Tráfego pago', x, y });
  x += gap;

  // Landing
  if (offer.landingPageUrl) {
    nodes.push({ kind: 'landing', title: 'Landing Page', subtitle: offer.name, x, y, trackingUrl: offer.landingPageUrl });
    x += gap;
  }

  // VSL / Quiz based on funnel type
  if (ft.includes('vsl')) {
    nodes.push({ kind: 'vsl', title: 'VSL', subtitle: `Vídeo de vendas — ${offer.promise || offer.mechanism || ''}`.slice(0, 80), x, y });
    x += gap;
  } else if (ft.includes('quiz')) {
    nodes.push({ kind: 'quiz', title: 'Quiz', subtitle: `Segmentação — ${offer.micropersona || offer.mechanism || ''}`.slice(0, 80), x, y });
    x += gap;
  } else if (ft.includes('webinar')) {
    nodes.push({ kind: 'webinar', title: 'Webinar', subtitle: `Aula + Pitch — ${offer.promise || ''}`.slice(0, 80), x, y });
    x += gap;
  }

  // Checkout
  nodes.push({
    kind: 'checkout',
    title: 'Checkout',
    subtitle: offer.entryPrice ? `R$ ${offer.entryPrice}` : 'Página de pagamento',
    x, y,
    trackingUrl: offer.sourceUrl || '',
  });
  x += gap;

  // Upsell if mentioned
  if (ft.includes('upsell')) {
    nodes.push({ kind: 'upsell', title: 'Upsell', subtitle: 'Oferta complementar', x, y: y - 100 });
  }

  // Thank you
  nodes.push({ kind: 'thankyou', title: 'Thank You', subtitle: 'Confirmação e próximo passo', x, y: ft.includes('upsell') ? y + 100 : y });

  return nodes;
}

app.post('/api/import-offer', (req, res) => {
  try {
    const offer = req.body;
    if (!offer || !offer.name) {
      return res.status(400).json({ error: 'Offer name is required' });
    }

    const funnelId = uid();
    const now = new Date().toISOString();
    const nodeSpecs = buildFunnelNodes(offer);

    const nodes = nodeSpecs.map((spec, i) => ({
      id: `node-${funnelId}-${i}`,
      type: 'funnelNode',
      position: { x: spec.x, y: spec.y },
      data: {
        nodeKind: spec.kind,
        title: spec.title,
        subtitle: spec.subtitle || '',
        awarenessLevel: 'Produto',
        offerType: offer.offerType || 'Core',
        cta: 'Ação',
        notes: offer.notes || '',
        objective: offer.promise || '',
        accent: '#6366f1',
        trackingUrl: spec.trackingUrl || '',
        metrics: { visits: 0, clicks: 0, optIns: 0, sales: 0, conversion: 0, exits: 0 },
      },
    }));

    // Create sequential edges
    const edges = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge-${funnelId}-${i}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        label: 'Flow',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#475569', strokeWidth: 2 },
      });
    }

    const funnel = {
      id: funnelId,
      name: offer.name,
      description: `Funil importado do FB Ads Manager. Nicho: ${offer.niche || '—'}. Mecanismo: ${offer.mechanism || '—'}. Score: ${offer.score || 0}.`,
      type: 'Produto',
      status: 'Draft',
      objective: offer.promise || offer.mechanism || 'Funil importado',
      tags: [...(offer.tags || []), 'importado', offer.niche || ''].filter(Boolean),
      createdAt: now,
      updatedAt: now,
      nodes,
      edges,
      totals: { visits: 0, leads: 0, sales: 0, conversion: 0, revenue: 0 },
      sourceOffer: {
        id: offer.sourceId,
        name: offer.name,
        niche: offer.niche,
        micropersona: offer.micropersona,
        mechanism: offer.mechanism,
        promise: offer.promise,
        score: offer.score,
        entryPrice: offer.entryPrice,
        sourcePlatform: offer.sourcePlatform,
      },
    };

    // Save to imported funnels
    const imported = loadImported();
    imported.funnels.push(funnel);
    saveImported(imported);

    console.log(`📦 Imported offer "${offer.name}" → Funnel "${funnelId}" (${nodes.length} nodes)`);

    res.json({
      ok: true,
      funnelId,
      funnelName: offer.name,
      nodesCount: nodes.length,
      edgesCount: edges.length,
    });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all imported funnels (for Funnelby frontend)
app.get('/api/imported-funnels', (req, res) => {
  const imported = loadImported();
  res.json(imported.funnels);
});

// Mark a funnel as consumed (so it doesn't get re-imported)
app.delete('/api/imported-funnels/:id', (req, res) => {
  const imported = loadImported();
  imported.funnels = imported.funnels.filter(f => f.id !== req.params.id);
  saveImported(imported);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`🔥 Funnelby Tracking Server running on http://localhost:${PORT}`);
  console.log(`📊 Stats: http://localhost:${PORT}/api/stats/{funnelId}`);
  console.log(`📦 Import: POST http://localhost:${PORT}/api/import-offer`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
});
