"use client";

import { useEffect, useRef, useState } from "react";

function computeArcPoints(start, end) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;

  const lat1 = toRad(start.lat);
  const lon1 = toRad(start.lng);
  const lat2 = toRad(end.lat);
  const lon2 = toRad(end.lng);

  const bx = Math.cos(lat2) * Math.cos(lon2 - lon1);
  const by = Math.cos(lat2) * Math.sin(lon2 - lon1);

  const midLat = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + bx) ** 2 + by ** 2)
  );

  const midLng = lon1 + Math.atan2(by, Math.cos(lat1) + bx);

  const distance = Math.acos(
    Math.sin(lat1) * Math.sin(lat2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
  ) * 6371;

  const altitude = Math.min(Math.max(distance * 800, 300000), 1200000);

  return [
    { lat: start.lat, lng: start.lng, altitude: 0 },
    { lat: toDeg(midLat), lng: toDeg(midLng), altitude: altitude },
    { lat: end.lat, lng: end.lng, altitude: 0 },
  ];
}

export default function Globe3D({ startPoint, endPoint }) {
  const mapRef = useRef(null);
  const objectsRef = useRef([]);
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const animationFrameRef = useRef(null);
  const [showResetButton, setShowResetButton] = useState(false);
  const savedViewRef = useRef(null);

  useEffect(() => {
    if (window.google?.maps) {
      setMapReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${
        process.env.NEXT_PUBLIC_GOOGLE_KEY
      }&v=alpha&libraries=maps3d&channel=2`;

    script.async = true;
    script.onload = () => {
      console.log("✅ 3D Maps API loaded");
      setMapReady(true);
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !rotationEnabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let lastTime = Date.now();
    
    const rotate = () => {
      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      const heading = Number(map.getAttribute("heading") || 0);
      map.setAttribute("heading", ((heading + 0.03 * (delta / 16)) % 360).toString());
      
      animationFrameRef.current = requestAnimationFrame(rotate);
    };

    rotate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [rotationEnabled]);

  useEffect(() => {
    if (!mapReady) return;

    const map = mapRef.current;
    if (!map) return;

    objectsRef.current.forEach((o) => {
      try {
        o.remove();
      } catch (e) {
        console.warn("Error removing object:", e);
      }
    });
    objectsRef.current = [];

    if (!startPoint && !endPoint) {
      setRotationEnabled(true);
      setShowResetButton(false);
      map.setAttribute("center", "20,10");
      map.setAttribute("range", "15000000");
      map.setAttribute("tilt", "0");
      map.setAttribute("heading", "0");
      savedViewRef.current = null;
      return;
    }

    if (startPoint && endPoint) {
      setRotationEnabled(false);
      setShowResetButton(true);
    }

    const addMarker = (pt, color = "#FF0000", label = "") => {
      if (!pt) return;

      const m = document.createElement("gmp-marker-3d");
      m.setAttribute("position", `${pt.lat},${pt.lng}`);
      m.setAttribute("altitude-mode", "RELATIVE_TO_GROUND");
      
      const template = document.createElement("template");
      
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="160" height="100" viewBox="0 0 160 100">
          <defs>
            <filter id="shadow-${label}" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="3" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <g transform="translate(80, 65)">
            <ellipse cx="0" cy="25" rx="12" ry="4" fill="rgba(0,0,0,0.4)"/>
            <path d="M0,-30 C-12,-30 -18,-18 -18,-9 C-18,0 0,30 0,30 C0,30 18,0 18,-9 C18,-18 12,-30 0,-30 Z" 
                  fill="${color}" stroke="white" stroke-width="3" filter="url(#shadow-${label})"/>
            <circle cx="0" cy="-12" r="6" fill="white"/>
          </g>
          <g transform="translate(80, 18)">
            <rect x="-60" y="-14" width="120" height="28" rx="14" 
                  fill="white" stroke="${color}" stroke-width="2.5" filter="url(#shadow-${label})"/>
            <text x="0" y="5" text-anchor="middle" 
                  font-family="Arial, sans-serif" font-size="14" font-weight="bold" 
                  fill="${color}">${label}</text>
          </g>
        </svg>
      `;
      
      template.innerHTML = svg;
      m.appendChild(template);

      map.appendChild(m);
      objectsRef.current.push(m);
    };

    if (startPoint) addMarker(startPoint, "#22C55E", startPoint.label);
    if (endPoint) addMarker(endPoint, "#EF4444", endPoint.label);

    if (startPoint && endPoint) {
      const path = computeArcPoints(startPoint, endPoint);

      // Create multiple polyline segments for better visibility
      const numSegments = 50;
      const allPoints = [];
      
      for (let i = 0; i < numSegments; i++) {
        const t = i / (numSegments - 1);
        const t2 = t * t;
        const t3 = t2 * t;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        
        // Quadratic Bezier interpolation
        const lat = mt2 * path[0].lat + 2 * mt * t * path[1].lat + t2 * path[2].lat;
        const lng = mt2 * path[0].lng + 2 * mt * t * path[1].lng + t2 * path[2].lng;
        const alt = mt2 * path[0].altitude + 2 * mt * t * path[1].altitude + t2 * path[2].altitude;
        
        allPoints.push({ lat, lng, altitude: alt });
      }

      // Main bright path
      const poly = document.createElement("gmp-polyline-3d");
      poly.setAttribute("altitude-mode", "ABSOLUTE");
      poly.setAttribute("stroke-color", "#00D9FF");
      poly.setAttribute("stroke-width", "8");
      
      const coordinates = allPoints.map(p => 
        `${p.lat.toFixed(6)},${p.lng.toFixed(6)},${p.altitude.toFixed(1)}`
      ).join(' ');
      
      poly.setAttribute("coordinates", coordinates);

      map.appendChild(poly);
      objectsRef.current.push(poly);

      // Outer glow
      const polyGlow = document.createElement("gmp-polyline-3d");
      polyGlow.setAttribute("altitude-mode", "ABSOLUTE");
      polyGlow.setAttribute("stroke-color", "#0088CC");
      polyGlow.setAttribute("stroke-width", "14");
      polyGlow.setAttribute("stroke-opacity", "0.4");
      polyGlow.setAttribute("coordinates", coordinates);

      map.appendChild(polyGlow);
      objectsRef.current.push(polyGlow);

      const midLat = (startPoint.lat + endPoint.lat) / 2;
      const midLng = (startPoint.lng + endPoint.lng) / 2;

      const R = 6371;
      const lat1Rad = startPoint.lat * (Math.PI / 180);
      const lat2Rad = endPoint.lat * (Math.PI / 180);
      const dLat = (endPoint.lat - startPoint.lat) * (Math.PI / 180);
      const dLng = (endPoint.lng - startPoint.lng) * (Math.PI / 180);

      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      const range = Math.min(
        Math.max(distance * 2000, 800000), 
        12000000
      );

      const dLon = (endPoint.lng - startPoint.lng) * (Math.PI / 180);
      const y = Math.sin(dLon) * Math.cos(lat2Rad);
      const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
      const bearing = Math.atan2(y, x) * (180 / Math.PI);
      const heading = (bearing + 360) % 360;

      savedViewRef.current = {
        center: `${midLat},${midLng}`,
        range: range.toString(),
        tilt: "55",
        heading: heading.toString()
      };

      map.setAttribute("center", savedViewRef.current.center);
      map.setAttribute("range", savedViewRef.current.range);
      map.setAttribute("tilt", savedViewRef.current.tilt);
      map.setAttribute("heading", savedViewRef.current.heading);

      console.log(`✈️ Flight path created: ${distance.toFixed(0)}km`);
    } else if (startPoint || endPoint) {
      const pt = startPoint || endPoint;
      map.setAttribute("center", `${pt.lat},${pt.lng}`);
      map.setAttribute("range", "3000000");
      map.setAttribute("tilt", "45");
      setShowResetButton(false);
    }
  }, [mapReady, startPoint, endPoint]);

  const handleResetView = () => {
    const map = mapRef.current;
    if (!map || !savedViewRef.current) return;

    map.setAttribute("center", savedViewRef.current.center);
    map.setAttribute("range", savedViewRef.current.range);
    map.setAttribute("tilt", savedViewRef.current.tilt);
    map.setAttribute("heading", savedViewRef.current.heading);
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl overflow-hidden relative flex items-center justify-center">
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-white text-lg animate-pulse">Loading Globe...</div>
        </div>
      )}
      
      <gmp-map-3d
        ref={mapRef}
        center="20,10"
        range="15000000"
        tilt="0"
        heading="0"
        mode="satellite"
        style={{ 
          width: "100%", 
          height: "100%", 
          display: "block"
        }}
      />

      <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-sm text-white px-4 py-3 rounded-xl text-sm pointer-events-none border border-white/10 shadow-lg">
        {startPoint && endPoint 
          ? "✈️ Flight route displayed" 
          : "🌍 Drag to rotate • Scroll to zoom"
        }
      </div>

      {showResetButton && (
        <button
          onClick={handleResetView}
          className="absolute top-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 border border-white/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
          </svg>
          Reset View
        </button>
      )}
    </div>
  );
}