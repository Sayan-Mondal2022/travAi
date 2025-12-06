// components/Globe3D.js
"use client";

import { useEffect, useRef, useState } from "react";
import Globe from 'react-globe.gl';

// Compute arc points with altitude for curved flight path
function computeArcPoints(start, end, numPoints = 50) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;

  const lat1 = toRad(start.lat);
  const lon1 = toRad(start.lng);
  const lat2 = toRad(end.lat);
  const lon2 = toRad(end.lng);

  // Calculate great circle distance
  const R = 6371; // Earth's radius in km
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Calculate midpoint for arc peak
  const bx = Math.cos(lat2) * Math.cos(lon2 - lon1);
  const by = Math.cos(lat2) * Math.sin(lon2 - lon1);
  const midLat = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + bx) ** 2 + by ** 2)
  );
  const midLng = lon1 + Math.atan2(by, Math.cos(lat1) + bx);

  // Calculate arc altitude based on distance
  const altitude = Math.min(Math.max(distance * 0.15, 0.05), 0.3);

  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const t2 = t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    
    // Quadratic Bezier interpolation
    const lat = mt2 * start.lat + 2 * mt * t * toDeg(midLat) + t2 * end.lat;
    const lng = mt2 * start.lng + 2 * mt * t * toDeg(midLng) + t2 * end.lng;
    const alt = 2 * mt * t * altitude; // Parabolic altitude
    
    points.push([lat, lng, alt]);
  }

  return points;
}

export default function Globe3D({ startPoint, endPoint }) {
  const globeRef = useRef();
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [showResetButton, setShowResetButton] = useState(false);
  const savedViewRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [pathsData, setPathsData] = useState([]);

  // Setup auto-rotation
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = rotationEnabled;
        controls.autoRotateSpeed = 0.8;
        controls.enableZoom = false; // Disable scroll zoom
      }
    }
  }, [rotationEnabled]);

  // Initialize globe view
  useEffect(() => {
    if (globeRef.current && !startPoint && !endPoint) {
      globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 2.5 }, 1000);
    }
  }, []);

  // Handle route visualization
  useEffect(() => {
    if (!startPoint && !endPoint) {
      setMarkers([]);
      setPathsData([]);
      setRotationEnabled(true);
      setShowResetButton(false);
      savedViewRef.current = null;
      
      if (globeRef.current) {
        globeRef.current.pointOfView({ lat: 20, lng: 10, altitude: 2.5 }, 1000);
      }
      return;
    }

    if (startPoint && endPoint) {
      setRotationEnabled(false);
      setShowResetButton(true);

      // Create markers
      const newMarkers = [];
      if (startPoint) {
        newMarkers.push({
          lat: startPoint.lat,
          lng: startPoint.lng,
          name: startPoint.label,
          color: '#22C55E',
          emoji: '📍'
        });
      }
      if (endPoint) {
        newMarkers.push({
          lat: endPoint.lat,
          lng: endPoint.lng,
          name: endPoint.label,
          color: '#EF4444',
          emoji: '🎯'
        });
      }
      setMarkers(newMarkers);

      // Create curved flight path
      const arcPoints = computeArcPoints(startPoint, endPoint, 50);
      setPathsData([{ coords: arcPoints }]);

      // Calculate camera position
      const midLat = (startPoint.lat + endPoint.lat) / 2;
      const midLng = (startPoint.lng + endPoint.lng) / 2;

      const toRad = (d) => (d * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(endPoint.lat - startPoint.lat);
      const dLng = toRad(endPoint.lng - startPoint.lng);
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(startPoint.lat)) * Math.cos(toRad(endPoint.lat)) *
                Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      const altitude = Math.min(Math.max(distance / 3000, 1.5), 3);

      savedViewRef.current = { lat: midLat, lng: midLng, altitude };

      if (globeRef.current) {
        globeRef.current.pointOfView(savedViewRef.current, 2000);
      }

      console.log(`✈️ Flight path created: ${distance.toFixed(0)}km`);
    } else if (startPoint || endPoint) {
      const pt = startPoint || endPoint;
      const newMarkers = [{
        lat: pt.lat,
        lng: pt.lng,
        name: pt.label,
        color: startPoint ? '#22C55E' : '#EF4444',
        emoji: startPoint ? '📍' : '🎯'
      }];
      setMarkers(newMarkers);
      setPathsData([]);
      
      if (globeRef.current) {
        globeRef.current.pointOfView({ lat: pt.lat, lng: pt.lng, altitude: 2 }, 1500);
      }
      setShowResetButton(false);
    }
  }, [startPoint, endPoint]);

  const handleResetView = () => {
    if (globeRef.current && savedViewRef.current) {
      globeRef.current.pointOfView(savedViewRef.current, 1000);
    }
  };

  const handleZoomIn = () => {
    if (globeRef.current) {
      const pov = globeRef.current.pointOfView();
      globeRef.current.pointOfView({ 
        lat: pov.lat, 
        lng: pov.lng, 
        altitude: Math.max(pov.altitude - 0.5, 1) 
      }, 300);
    }
  };

  const handleZoomOut = () => {
    if (globeRef.current) {
      const pov = globeRef.current.pointOfView();
      globeRef.current.pointOfView({ 
        lat: pov.lat, 
        lng: pov.lng, 
        altitude: Math.min(pov.altitude + 0.5, 4) 
      }, 300);
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl overflow-hidden relative flex items-center justify-center">
      <Globe
        ref={globeRef}
        width={window.innerWidth > 1024 ? 800 : 600}
        height={window.innerWidth > 1024 ? 800 : 600}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Custom HTML markers
        htmlElementsData={markers}
        htmlElement={(d) => {
          const el = document.createElement('div');
          el.style.pointerEvents = 'none';
          
          el.innerHTML = `
            <div style="
              position: absolute;
              display: flex;
              flex-direction: column;
              align-items: center;
              transform: translate(-50%, -100%);
              pointer-events: none;
            ">
              <div style="
                background: ${d.color};
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                margin-bottom: 4px;
                border: 1.5px solid white;
                font-family: system-ui, -apple-system, sans-serif;
              ">
                ${d.emoji} ${d.name}
              </div>
              
              <svg width="24" height="30" viewBox="0 0 40 50" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
                <ellipse cx="20" cy="48" rx="6" ry="2" fill="rgba(0,0,0,0.3)"/>
                <path d="M20 2C12.8 2 7 7.8 7 15c0 9.5 13 31 13 31s13-21.5 13-31c0-7.2-5.8-13-13-13z" 
                  fill="${d.color}" 
                  stroke="white" 
                  stroke-width="2.5"
                  stroke-linejoin="round"/>
                <circle cx="20" cy="15" r="6" fill="white" opacity="0.95"/>
                <circle cx="20" cy="15" r="3" fill="${d.color}"/>
                <ellipse cx="16" cy="12" rx="2" ry="3" fill="white" opacity="0.4"/>
              </svg>
            </div>
          `;
          
          return el;
        }}
        
        // Curved flight paths
        pathsData={pathsData}
        pathPoints="coords"
        pathPointLat={p => p[0]}
        pathPointLng={p => p[1]}
        pathPointAlt={p => p[2]}
        pathColor={() => ['#00D9FF', '#EF4444']}
        pathStroke={4}
        pathDashLength={0.3}
        pathDashGap={0.1}
        pathDashAnimateTime={2500}
        pathTransitionDuration={1000}
        
        // Atmosphere
        atmosphereColor="lightskyblue"
        atmosphereAltitude={0.2}
      />

      {/* Zoom Controls */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-gray-800/80 hover:bg-gray-700 border border-white/20 rounded-lg flex items-center justify-center text-white font-bold text-xl transition shadow-lg backdrop-blur-sm"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-gray-800/80 hover:bg-gray-700 border border-white/20 rounded-lg flex items-center justify-center text-white font-bold text-xl transition shadow-lg backdrop-blur-sm"
          title="Zoom Out"
        >
          −
        </button>
      </div>
    </div>
  );
}