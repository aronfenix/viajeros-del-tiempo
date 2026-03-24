// sprites.js — Generador de retratos canvas para Viajeros del Tiempo
// Genera avatares estilizados con silueta + accesorio por personaje

const PortraitGenerator = (() => {
  'use strict';

  const cache = {};

  const palettes = {
    gobernante:  { bg: '#ede9fe', ring: '#7c3aed', silhouette: '#4c1d95', accent: '#a78bfa' },
    explorador:  { bg: '#e0f2fe', ring: '#0ea5e9', silhouette: '#0c4a6e', accent: '#38bdf8' },
    cientifico:  { bg: '#d1fae5', ring: '#10b981', silhouette: '#064e3b', accent: '#34d399' },
    artista:     { bg: '#ffe4e6', ring: '#f43f5e', silhouette: '#881337', accent: '#fb7185' },
    escritor:    { bg: '#e0e7ff', ring: '#6366f1', silhouette: '#312e81', accent: '#818cf8' },
    pensador:    { bg: '#fef3c7', ring: '#d97706', silhouette: '#78350f', accent: '#fbbf24' },
    inventor:    { bg: '#f3e8ff', ring: '#8b5cf6', silhouette: '#3b0764', accent: '#a78bfa' },
    musico:      { bg: '#fce7f3', ring: '#ec4899', silhouette: '#831843', accent: '#f472b6' },
    aventurera:  { bg: '#fee2e2', ring: '#ef4444', silhouette: '#7f1d1d', accent: '#f87171' }
  };

  function getPalette(categoria) {
    return palettes[categoria] || palettes.gobernante;
  }

  // --- Utility drawing helpers ---
  function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
  }

  function ellipse(ctx, x, y, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // --- Draw silhouette (head + shoulders bust) ---
  function drawSilhouette(ctx, cx, cy, size, color) {
    const headR = size * 0.22;
    const headY = cy - size * 0.12;

    // Shoulders
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.38, cy + size * 0.42);
    ctx.quadraticCurveTo(cx - size * 0.35, cy + size * 0.08, cx - size * 0.12, cy + size * 0.06);
    ctx.quadraticCurveTo(cx, cy + size * 0.14, cx + size * 0.12, cy + size * 0.06);
    ctx.quadraticCurveTo(cx + size * 0.35, cy + size * 0.08, cx + size * 0.38, cy + size * 0.42);
    ctx.closePath();
    ctx.fill();

    // Head
    circle(ctx, cx, headY, headR);
    ctx.fill();
  }

  // --- Accessory drawing methods ---
  const accessories = {
    corona(ctx, cx, cy, s, pal) {
      const y = cy - s * 0.34;
      const w = s * 0.28, h = s * 0.14;
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = s * 0.015;
      // Base band
      roundRect(ctx, cx - w, y + h * 0.5, w * 2, h * 0.5, s * 0.01);
      ctx.fill(); ctx.stroke();
      // Points
      ctx.beginPath();
      ctx.moveTo(cx - w, y + h * 0.5);
      ctx.lineTo(cx - w * 0.7, y);
      ctx.lineTo(cx - w * 0.35, y + h * 0.35);
      ctx.lineTo(cx, y - h * 0.1);
      ctx.lineTo(cx + w * 0.35, y + h * 0.35);
      ctx.lineTo(cx + w * 0.7, y);
      ctx.lineTo(cx + w, y + h * 0.5);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Gems
      ctx.fillStyle = '#ef4444';
      circle(ctx, cx, y + h * 0.5, s * 0.025); ctx.fill();
      ctx.fillStyle = '#3b82f6';
      circle(ctx, cx - w * 0.5, y + h * 0.6, s * 0.02); ctx.fill();
      circle(ctx, cx + w * 0.5, y + h * 0.6, s * 0.02); ctx.fill();
    },

    corona_imperial(ctx, cx, cy, s, pal) {
      const y = cy - s * 0.36;
      const w = s * 0.3, h = s * 0.18;
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = s * 0.015;
      // Arch crown (closed top)
      roundRect(ctx, cx - w, y + h * 0.55, w * 2, h * 0.45, s * 0.01);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - w, y + h * 0.55);
      ctx.lineTo(cx - w * 0.65, y + h * 0.1);
      ctx.lineTo(cx - w * 0.3, y + h * 0.3);
      ctx.lineTo(cx, y - h * 0.05);
      ctx.lineTo(cx + w * 0.3, y + h * 0.3);
      ctx.lineTo(cx + w * 0.65, y + h * 0.1);
      ctx.lineTo(cx + w, y + h * 0.55);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Cross on top
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - s * 0.015, y - h * 0.25, s * 0.03, s * 0.08);
      ctx.fillRect(cx - s * 0.035, y - h * 0.18, s * 0.07, s * 0.025);
      // Orb
      ctx.fillStyle = '#fbbf24';
      circle(ctx, cx + s * 0.28, cy + s * 0.15, s * 0.06);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx + s * 0.265, cy + s * 0.08, s * 0.03, s * 0.04);
      ctx.fillRect(cx + s * 0.25, cy + s * 0.09, s * 0.06, s * 0.02);
    },

    cetro(ctx, cx, cy, s, pal) {
      // Crown first
      accessories.corona(ctx, cx, cy, s, pal);
      // Scepter rod
      const sx = cx + s * 0.3, sy = cy - s * 0.05;
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = s * 0.03;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + s * 0.08, sy + s * 0.35);
      ctx.stroke();
      // Gem on top
      ctx.fillStyle = '#fbbf24';
      circle(ctx, sx, sy, s * 0.04);
      ctx.fill();
      ctx.fillStyle = '#7c3aed';
      circle(ctx, sx, sy, s * 0.025);
      ctx.fill();
    },

    telescopio(ctx, cx, cy, s, pal) {
      const tx = cx + s * 0.18, ty = cy - s * 0.08;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(-0.5);
      // Tube body
      ctx.fillStyle = '#92400e';
      roundRect(ctx, -s * 0.04, -s * 0.2, s * 0.08, s * 0.35, s * 0.02);
      ctx.fill();
      // Eyepiece (wider)
      ctx.fillStyle = '#78350f';
      roundRect(ctx, -s * 0.055, s * 0.1, s * 0.11, s * 0.08, s * 0.015);
      ctx.fill();
      // Lens (top)
      ctx.fillStyle = '#93c5fd';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = s * 0.015;
      ellipse(ctx, 0, -s * 0.2, s * 0.05, s * 0.03);
      ctx.fill(); ctx.stroke();
      // Lens glare
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      circle(ctx, -s * 0.015, -s * 0.21, s * 0.012);
      ctx.fill();
      ctx.restore();
    },

    brujula(ctx, cx, cy, s, pal) {
      const bx = cx + s * 0.26, by = cy + s * 0.12;
      const r = s * 0.1;
      // Outer ring
      ctx.fillStyle = '#92400e';
      circle(ctx, bx, by, r);
      ctx.fill();
      // Inner face
      ctx.fillStyle = '#fef3c7';
      circle(ctx, bx, by, r * 0.82);
      ctx.fill();
      // N-S-E-W marks
      ctx.fillStyle = '#78350f';
      ctx.font = `bold ${s * 0.04}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', bx, by - r * 0.6);
      ctx.fillText('S', bx, by + r * 0.6);
      // Needle
      ctx.beginPath();
      ctx.moveTo(bx, by - r * 0.55);
      ctx.lineTo(bx - r * 0.12, by);
      ctx.lineTo(bx, by + r * 0.55);
      ctx.closePath();
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(bx, by - r * 0.55);
      ctx.lineTo(bx + r * 0.12, by);
      ctx.lineTo(bx, by + r * 0.55);
      ctx.closePath();
      ctx.fillStyle = '#1e3a5f';
      ctx.fill();
      // Center dot
      ctx.fillStyle = '#92400e';
      circle(ctx, bx, by, r * 0.1);
      ctx.fill();
    },

    catalejo(ctx, cx, cy, s, pal) {
      const tx = cx + s * 0.16, ty = cy - s * 0.12;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(-0.4);
      // Extended sections
      ctx.fillStyle = '#b45309';
      roundRect(ctx, -s * 0.025, -s * 0.04, s * 0.32, s * 0.06, s * 0.015);
      ctx.fill();
      ctx.fillStyle = '#92400e';
      roundRect(ctx, -s * 0.025, -s * 0.03, s * 0.12, s * 0.045, s * 0.01);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      // Brass rings
      ctx.fillRect(s * 0.09, -s * 0.045, s * 0.015, s * 0.07);
      ctx.fillRect(s * 0.2, -s * 0.045, s * 0.015, s * 0.07);
      // Lens
      ctx.fillStyle = '#93c5fd';
      ellipse(ctx, s * 0.3, -s * 0.01, s * 0.035, s * 0.035);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = s * 0.012;
      ctx.stroke();
      ctx.restore();
    },

    ancla(ctx, cx, cy, s, pal) {
      const ax = cx + s * 0.28, ay = cy + s * 0.08;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = s * 0.03;
      ctx.lineCap = 'round';
      // Vertical shaft
      ctx.beginPath();
      ctx.moveTo(ax, ay - s * 0.15);
      ctx.lineTo(ax, ay + s * 0.12);
      ctx.stroke();
      // Cross bar
      ctx.beginPath();
      ctx.moveTo(ax - s * 0.06, ay - s * 0.1);
      ctx.lineTo(ax + s * 0.06, ay - s * 0.1);
      ctx.stroke();
      // Ring on top
      ctx.lineWidth = s * 0.02;
      circle(ctx, ax, ay - s * 0.18, s * 0.035);
      ctx.stroke();
      // Curved arms
      ctx.lineWidth = s * 0.025;
      ctx.beginPath();
      ctx.arc(ax - s * 0.08, ay + s * 0.12, s * 0.08, -Math.PI * 0.5, Math.PI * 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ax + s * 0.08, ay + s * 0.12, s * 0.08, Math.PI * 0.85, Math.PI * 1.5);
      ctx.stroke();
    },

    espada(ctx, cx, cy, s, pal) {
      const sx = cx + s * 0.28, sy = cy - s * 0.15;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(0.3);
      // Blade
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = s * 0.01;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.22);
      ctx.lineTo(s * 0.03, s * 0.05);
      ctx.lineTo(-s * 0.03, s * 0.05);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Guard
      ctx.fillStyle = '#92400e';
      roundRect(ctx, -s * 0.08, s * 0.04, s * 0.16, s * 0.03, s * 0.01);
      ctx.fill();
      // Grip
      ctx.fillStyle = '#78350f';
      roundRect(ctx, -s * 0.02, s * 0.07, s * 0.04, s * 0.1, s * 0.01);
      ctx.fill();
      // Pommel
      ctx.fillStyle = '#fbbf24';
      circle(ctx, 0, s * 0.19, s * 0.025);
      ctx.fill();
      ctx.restore();
    },

    pluma(ctx, cx, cy, s, pal) {
      const px = cx + s * 0.24, py = cy - s * 0.12;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(0.25);
      // Feather body
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = s * 0.008;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.28);
      ctx.quadraticCurveTo(s * 0.08, s * 0.1, s * 0.04, -s * 0.15);
      ctx.quadraticCurveTo(0, -s * 0.2, -s * 0.03, -s * 0.15);
      ctx.quadraticCurveTo(-s * 0.06, s * 0.1, 0, s * 0.28);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Quill tip
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(0, s * 0.28);
      ctx.lineTo(s * 0.008, s * 0.35);
      ctx.lineTo(-s * 0.008, s * 0.35);
      ctx.closePath();
      ctx.fill();
      // Central spine
      ctx.strokeStyle = '#d4a574';
      ctx.lineWidth = s * 0.006;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.28);
      ctx.quadraticCurveTo(s * 0.01, s * 0, 0, -s * 0.16);
      ctx.stroke();
      ctx.restore();
    },

    libro(ctx, cx, cy, s, pal) {
      const lx = cx + s * 0.25, ly = cy + s * 0.05;
      // Book body
      ctx.fillStyle = '#7c3aed';
      roundRect(ctx, lx - s * 0.1, ly - s * 0.1, s * 0.18, s * 0.22, s * 0.015);
      ctx.fill();
      // Pages
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(lx - s * 0.07, ly - s * 0.08, s * 0.13, s * 0.18);
      // Spine
      ctx.fillStyle = '#5b21b6';
      ctx.fillRect(lx - s * 0.1, ly - s * 0.1, s * 0.03, s * 0.22);
      // Title lines
      ctx.fillStyle = '#a78bfa';
      ctx.fillRect(lx - s * 0.02, ly - s * 0.03, s * 0.07, s * 0.012);
      ctx.fillRect(lx - s * 0.02, ly + s * 0.01, s * 0.05, s * 0.012);
    },

    pergamino(ctx, cx, cy, s, pal) {
      const px = cx + s * 0.24, py = cy + s * 0.02;
      // Scroll body
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = s * 0.01;
      roundRect(ctx, px - s * 0.08, py - s * 0.12, s * 0.16, s * 0.24, s * 0.01);
      ctx.fill(); ctx.stroke();
      // Top roll
      ctx.fillStyle = '#f5deb3';
      ellipse(ctx, px, py - s * 0.12, s * 0.09, s * 0.025);
      ctx.fill(); ctx.stroke();
      // Bottom roll
      ellipse(ctx, px, py + s * 0.12, s * 0.09, s * 0.025);
      ctx.fill(); ctx.stroke();
      // Text lines
      ctx.fillStyle = '#92400e';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(px - s * 0.05, py - s * 0.06 + i * s * 0.045, s * 0.1 - i * s * 0.015, s * 0.008);
      }
      // Seal
      ctx.fillStyle = '#dc2626';
      circle(ctx, px + s * 0.04, py + s * 0.07, s * 0.02);
      ctx.fill();
    },

    cruz(ctx, cx, cy, s, pal) {
      const crx = cx + s * 0.28, cry = cy - s * 0.05;
      ctx.fillStyle = '#92400e';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = s * 0.008;
      // Vertical
      roundRect(ctx, crx - s * 0.025, cry - s * 0.18, s * 0.05, s * 0.36, s * 0.008);
      ctx.fill(); ctx.stroke();
      // Horizontal
      roundRect(ctx, crx - s * 0.1, cry - s * 0.1, s * 0.2, s * 0.05, s * 0.008);
      ctx.fill(); ctx.stroke();
      // Center gem
      ctx.fillStyle = '#fbbf24';
      circle(ctx, crx, cry - s * 0.075, s * 0.018);
      ctx.fill();
    },

    paleta(ctx, cx, cy, s, pal) {
      const px = cx + s * 0.22, py = cy + s * 0.05;
      // Palette shape
      ctx.fillStyle = '#d4a574';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = s * 0.01;
      ctx.beginPath();
      ctx.ellipse(px, py, s * 0.12, s * 0.09, -0.2, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Thumb hole
      ctx.fillStyle = getPalette(pal).bg;
      circle(ctx, px - s * 0.04, py + s * 0.01, s * 0.025);
      ctx.fill();
      // Paint blobs
      const colors = ['#ef4444', '#3b82f6', '#fbbf24', '#10b981', '#f97316'];
      const positions = [[-0.02, -0.04], [0.04, -0.05], [0.08, -0.02], [0.06, 0.03], [-0.01, 0.04]];
      colors.forEach((c, i) => {
        ctx.fillStyle = c;
        circle(ctx, px + positions[i][0] * s, py + positions[i][1] * s, s * 0.018);
        ctx.fill();
      });
      // Brush
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = s * 0.02;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px + s * 0.1, py - s * 0.08);
      ctx.lineTo(px + s * 0.18, py - s * 0.2);
      ctx.stroke();
      ctx.fillStyle = '#f87171';
      ellipse(ctx, px + s * 0.1, py - s * 0.07, s * 0.02, s * 0.025);
      ctx.fill();
    },

    cincel(ctx, cx, cy, s, pal) {
      const chx = cx + s * 0.26, chy = cy + s * 0.0;
      ctx.save();
      ctx.translate(chx, chy);
      ctx.rotate(0.3);
      // Chisel handle
      ctx.fillStyle = '#92400e';
      roundRect(ctx, -s * 0.02, 0, s * 0.04, s * 0.16, s * 0.01);
      ctx.fill();
      // Chisel blade
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-s * 0.03, 0);
      ctx.lineTo(s * 0.03, 0);
      ctx.lineTo(s * 0.015, -s * 0.08);
      ctx.lineTo(-s * 0.015, -s * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      // Hammer next to it
      const hx = chx - s * 0.12, hy = chy - s * 0.02;
      ctx.fillStyle = '#64748b';
      roundRect(ctx, hx - s * 0.04, hy - s * 0.035, s * 0.08, s * 0.05, s * 0.008);
      ctx.fill();
      ctx.fillStyle = '#92400e';
      ctx.fillRect(hx - s * 0.01, hy + s * 0.01, s * 0.02, s * 0.12);
    },

    pincel(ctx, cx, cy, s, pal) {
      const px = cx + s * 0.26, py = cy - s * 0.08;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(0.25);
      // Handle
      ctx.fillStyle = '#92400e';
      roundRect(ctx, -s * 0.015, -s * 0.02, s * 0.03, s * 0.28, s * 0.005);
      ctx.fill();
      // Ferrule
      ctx.fillStyle = '#94a3b8';
      roundRect(ctx, -s * 0.02, -s * 0.04, s * 0.04, s * 0.035, s * 0.003);
      ctx.fill();
      // Bristles
      ctx.fillStyle = pal === 'artista' ? '#f43f5e' : '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(-s * 0.022, -s * 0.04);
      ctx.quadraticCurveTo(-s * 0.025, -s * 0.1, 0, -s * 0.12);
      ctx.quadraticCurveTo(s * 0.025, -s * 0.1, s * 0.022, -s * 0.04);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },

    imprenta(ctx, cx, cy, s, pal) {
      const ix = cx + s * 0.24, iy = cy + s * 0.04;
      // Press frame
      ctx.fillStyle = '#78350f';
      ctx.fillRect(ix - s * 0.1, iy - s * 0.12, s * 0.04, s * 0.24);
      ctx.fillRect(ix + s * 0.06, iy - s * 0.12, s * 0.04, s * 0.24);
      ctx.fillRect(ix - s * 0.1, iy - s * 0.12, s * 0.2, s * 0.04);
      // Platen
      ctx.fillStyle = '#92400e';
      roundRect(ctx, ix - s * 0.07, iy - s * 0.02, s * 0.14, s * 0.04, s * 0.005);
      ctx.fill();
      // Screw
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = s * 0.02;
      ctx.beginPath();
      ctx.moveTo(ix, iy - s * 0.12);
      ctx.lineTo(ix, iy - s * 0.02);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      circle(ctx, ix, iy - s * 0.13, s * 0.02);
      ctx.fill();
      // Paper
      ctx.fillStyle = '#fef3c7';
      roundRect(ctx, ix - s * 0.06, iy + s * 0.03, s * 0.12, s * 0.08, s * 0.005);
      ctx.fill();
      // Text on paper
      ctx.fillStyle = '#1c1917';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(ix - s * 0.04, iy + s * 0.045 + i * s * 0.02, s * 0.08, s * 0.005);
      }
    },

    manzana(ctx, cx, cy, s, pal) {
      const ax = cx + s * 0.26, ay = cy + s * 0.06;
      const r = s * 0.09;
      // Apple body
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(ax, ay - r);
      ctx.bezierCurveTo(ax + r * 1.3, ay - r, ax + r * 1.3, ay + r * 1.2, ax, ay + r);
      ctx.bezierCurveTo(ax - r * 1.3, ay + r * 1.2, ax - r * 1.3, ay - r, ax, ay - r);
      ctx.closePath();
      ctx.fill();
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      circle(ctx, ax - r * 0.3, ay - r * 0.3, r * 0.3);
      ctx.fill();
      // Stem
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = s * 0.015;
      ctx.beginPath();
      ctx.moveTo(ax, ay - r);
      ctx.quadraticCurveTo(ax + s * 0.02, ay - r - s * 0.05, ax + s * 0.01, ay - r - s * 0.06);
      ctx.stroke();
      // Leaf
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(ax + s * 0.03, ay - r - s * 0.03, s * 0.025, s * 0.012, 0.5, 0, Math.PI * 2);
      ctx.fill();
    },

    farol(ctx, cx, cy, s, pal) {
      const fx = cx + s * 0.27, fy = cy - s * 0.02;
      // Post
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(fx - s * 0.015, fy - s * 0.05, s * 0.03, s * 0.25);
      // Base
      roundRect(ctx, fx - s * 0.04, fy + s * 0.18, s * 0.08, s * 0.025, s * 0.005);
      ctx.fill();
      // Arm
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = s * 0.015;
      ctx.beginPath();
      ctx.moveTo(fx, fy - s * 0.05);
      ctx.quadraticCurveTo(fx + s * 0.06, fy - s * 0.08, fx + s * 0.06, fy - s * 0.04);
      ctx.stroke();
      // Lantern
      ctx.fillStyle = '#fbbf24';
      roundRect(ctx, fx + s * 0.03, fy - s * 0.09, s * 0.06, s * 0.08, s * 0.01);
      ctx.fill();
      // Glow
      ctx.fillStyle = 'rgba(251,191,36,0.15)';
      circle(ctx, fx + s * 0.06, fy - s * 0.05, s * 0.1);
      ctx.fill();
      // Lantern frame
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = s * 0.008;
      roundRect(ctx, fx + s * 0.03, fy - s * 0.09, s * 0.06, s * 0.08, s * 0.01);
      ctx.stroke();
      // Top cap
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(fx + s * 0.03, fy - s * 0.09);
      ctx.lineTo(fx + s * 0.06, fy - s * 0.12);
      ctx.lineTo(fx + s * 0.09, fy - s * 0.09);
      ctx.closePath();
      ctx.fill();
    },

    compas(ctx, cx, cy, s, pal) {
      const ax = cx + s * 0.28, ay = cy - s * 0.05;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = s * 0.02;
      // Hinge circle
      ctx.fillStyle = '#94a3b8';
      circle(ctx, ax, ay - s * 0.12, s * 0.025);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      circle(ctx, ax, ay - s * 0.12, s * 0.025);
      ctx.stroke();
      // Left leg
      ctx.beginPath();
      ctx.moveTo(ax, ay - s * 0.1);
      ctx.lineTo(ax - s * 0.06, ay + s * 0.12);
      ctx.stroke();
      // Right leg
      ctx.beginPath();
      ctx.moveTo(ax, ay - s * 0.1);
      ctx.lineTo(ax + s * 0.06, ay + s * 0.12);
      ctx.stroke();
      // Pencil tip on left leg
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(ax - s * 0.06, ay + s * 0.12);
      ctx.lineTo(ax - s * 0.07, ay + s * 0.15);
      ctx.lineTo(ax - s * 0.05, ay + s * 0.12);
      ctx.closePath();
      ctx.fill();
      // Point tip on right leg
      ctx.fillStyle = '#94a3b8';
      circle(ctx, ax + s * 0.06, ay + s * 0.13, s * 0.012);
      ctx.fill();
    },

    violin(ctx, cx, cy, s, pal) {
      const vx = cx + s * 0.28, vy = cy + s * 0.02;
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = s * 0.012;
      ctx.fillStyle = '#d97706';
      // Upper body
      ctx.beginPath();
      ctx.ellipse(vx, vy - s * 0.06, s * 0.04, s * 0.05, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Lower body
      ctx.beginPath();
      ctx.ellipse(vx, vy + s * 0.06, s * 0.045, s * 0.055, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Waist (narrowing)
      ctx.fillStyle = '#d97706';
      ctx.fillRect(vx - s * 0.025, vy - s * 0.02, s * 0.05, s * 0.04);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = s * 0.01;
      // Waist curves
      ctx.beginPath();
      ctx.moveTo(vx - s * 0.04, vy - s * 0.02);
      ctx.quadraticCurveTo(vx - s * 0.02, vy, vx - s * 0.045, vy + s * 0.02);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(vx + s * 0.04, vy - s * 0.02);
      ctx.quadraticCurveTo(vx + s * 0.02, vy, vx + s * 0.045, vy + s * 0.02);
      ctx.stroke();
      // Neck
      ctx.fillStyle = '#92400e';
      ctx.fillRect(vx - s * 0.01, vy - s * 0.15, s * 0.02, s * 0.06);
      // Scroll
      ctx.beginPath();
      ctx.arc(vx, vy - s * 0.16, s * 0.015, 0, Math.PI, true);
      ctx.stroke();
      // Strings
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = s * 0.004;
      for (let i = -1; i <= 1; i += 2) {
        ctx.beginPath();
        ctx.moveTo(vx + i * s * 0.01, vy - s * 0.1);
        ctx.lineTo(vx + i * s * 0.012, vy + s * 0.09);
        ctx.stroke();
      }
      // F-holes
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = s * 0.006;
      ctx.beginPath();
      ctx.moveTo(vx - s * 0.015, vy - s * 0.02);
      ctx.quadraticCurveTo(vx - s * 0.025, vy, vx - s * 0.015, vy + s * 0.02);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(vx + s * 0.015, vy - s * 0.02);
      ctx.quadraticCurveTo(vx + s * 0.025, vy, vx + s * 0.015, vy + s * 0.02);
      ctx.stroke();
    }
  };

  // --- Main portrait creation ---
  function createPortrait(personaje, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2;
    const pal = getPalette(personaje.categoria);

    // Background circle
    ctx.fillStyle = pal.bg;
    circle(ctx, cx, cy, size * 0.47);
    ctx.fill();

    // Ring border
    ctx.strokeStyle = pal.ring;
    ctx.lineWidth = size * 0.03;
    circle(ctx, cx, cy, size * 0.46);
    ctx.stroke();

    // Clip to circle for silhouette
    ctx.save();
    circle(ctx, cx, cy, size * 0.44);
    ctx.clip();

    // Silhouette
    drawSilhouette(ctx, cx, cy, size, pal.silhouette);

    ctx.restore();

    // Accessory on top
    const accKey = personaje.accesorio || 'corona';
    const drawFn = accessories[accKey];
    if (drawFn) {
      drawFn(ctx, cx, cy, size, personaje.categoria);
    }

    return canvas;
  }

  function getPortraitURL(personaje, size) {
    if (!personaje) return '';
    size = size || 120;
    const key = personaje.id + '_' + size;
    if (!cache[key]) {
      const canvas = createPortrait(personaje, size);
      cache[key] = canvas.toDataURL('image/png');
    }
    return cache[key];
  }

  function getPortraitCanvas(personaje, size) {
    return createPortrait(personaje, size || 120);
  }

  return { getPortraitURL, getPortraitCanvas, createPortrait };
})();

window.PortraitGenerator = PortraitGenerator;
