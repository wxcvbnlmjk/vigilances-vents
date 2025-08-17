import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Vigilance } from '../types/vigilance';
import { Department } from '../types/geojson';

// Fonction pour formater la date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Mappage entre l'ID du phénomène et le nom du fichier image correspondant
const PHENOMENON_ICON_MAP: Record<number, string> = {
  1: '🌪️',
  2: '🌧️',
  3: '⚡', // Corrigé depuis 'orages.png' pour correspondre au nom de fichier
  4: '🌊',
  5: '❄️',
  6: '🌡️',
  7: '🌡️', // Fallback pour 'grand-froid.png' qui est manquant
  8: '🏔️',
  9: '🌊',
};

// Couleurs des vigilances avec leurs labels
const VIGILANCE_CONFIG: Record<number, { color: string; label: string }> = {
  2: { color: '#ffeb3b', label: 'Jaune - Soyez attentif' },
  3: { color: '#ff9800', label: 'Orange - Soyez très vigilant' },
  4: { color: '#f44336', label: 'Rouge - Vigilance absolue' }
};

// URL du GeoJSON des départements français
const DEPARTMENTS_GEOJSON_URL = 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson';

// Coordonnées de la France métropolitaine
const FRANCE_BOUNDS_COORDS = [
  [41.0, -6.3], // Sud-Ouest (plus bas et plus à l'ouest pour inclure la Corse et la Bretagne)
  [51.5, 11.1]  // Nord-Est (plus haut et plus à l'est)
] as [[number, number], [number, number]];

const FRANCE_BOUNDS = L.latLngBounds(
  L.latLng(FRANCE_BOUNDS_COORDS[0]),
  L.latLng(FRANCE_BOUNDS_COORDS[1])
);

const FRANCE_CENTER: L.LatLngExpression = [46.227638, 2.213749];

interface MapProps {
  vigilances: Vigilance[];
}

export function Map({ vigilances }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [mapKey, setMapKey] = useState(0); // Ajout d'une clé pour forcer le remontage

  // Effet pour réinitialiser la carte quand les vigilances changent
  useEffect(() => {
    setMapKey(prev => prev + 1); // Force le remontage du composant
  }, [vigilances]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Nettoyer la carte précédente si elle existe
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Créer une nouvelle carte
    mapRef.current = L.map(mapContainer.current, {
      center: FRANCE_CENTER,
      zoom: 4.5,
      minZoom: 4.5,
      maxZoom: 9,
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: true,
      maxBounds: FRANCE_BOUNDS
    });

    // Ajouter la couche OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(mapRef.current);

    // S'assurer que la vue est centrée sur la France
    mapRef.current.fitBounds(FRANCE_BOUNDS, {
      padding: [20, 20],
      animate: false
    });

    // Charger et ajouter les départements
    fetch(DEPARTMENTS_GEOJSON_URL)
      .then(response => response.json())
      .then(data => {
        if (!mapRef.current) return;

        geoJsonLayerRef.current = L.geoJSON(data, {
          style: {
            fillColor: 'transparent',
            fillOpacity: 0,
            weight: 1,
            color: '#666',
          }
        }).addTo(mapRef.current);

        // Mettre à jour les styles immédiatement
        updateDepartmentsStyle();

        // Ajout des pictogrammes de vigilance
        markersLayerRef.current = L.layerGroup().addTo(mapRef.current!);

        // Créer une map pour une recherche rapide de la vigilance la plus haute par département
        const topVigilanceMap = vigilances.reduce((acc, v) => {
          if (!acc[v.domain_id] || v.color_id > acc[v.domain_id].color_id) {
            acc[v.domain_id] = v;
          }
          return acc;
        }, {} as Record<string, Vigilance>);

        geoJsonLayerRef.current?.eachLayer(layer => {
          const feature = (layer as any).feature as Department | undefined;
          const deptCode = feature?.properties?.code;

          if (deptCode) {
            const vigilance = topVigilanceMap[deptCode];
            // S'assurer que la couche est un chemin (polygone, etc.) avant d'appeler getBounds
            if (vigilance && layer instanceof L.Path) {
              // Calcul de la taille de l'icône en fonction de la taille du département
              const bounds = (layer as any).getBounds();
              const diagonal = bounds.getSouthWest().distanceTo(bounds.getNorthEast()); // en mètres
              const minSize = 20; // Taille min en pixels
              const maxSize = 40; // Taille max en pixels
              const minDiag = 70000; // 50km, taille de réf pour un petit département (+20)
              const maxDiag = 600000; // 400km, taille de réf pour un grand département(+200)
              const scale = Math.max(0, Math.min(1, (diagonal - minDiag) / (maxDiag - minDiag)));
              const baseSize = Math.round(minSize + scale * (maxSize - minSize));

              // Utilisation de 'as any' en dernier recours pour contourner un problème de linter persistant.
              const center = (layer as any).getBounds().getCenter();
              const icon = createVigilanceIcon(vigilance.phenomenon_id, baseSize, mapRef.current?.getZoom() || 4.5);
              if (icon) {
                const marker = L.marker(center, { icon }).addTo(markersLayerRef.current!);
                markersRef.current[deptCode] = marker;
              }
            }
          }
        });

        // Ajouter un écouteur d'événement de zoom pour mettre à jour la taille des emojis
        let zoomTimeout: ReturnType<typeof setTimeout>;
        mapRef.current.on('zoomend', () => {
          // Annuler le timeout précédent pour éviter les conflits
          clearTimeout(zoomTimeout);
          
          zoomTimeout = setTimeout(() => {
            const currentZoom = mapRef.current?.getZoom() || 4.5;
            
            // Supprimer tous les marqueurs existants
            Object.values(markersRef.current).forEach(marker => {
              marker.remove();
            });
            markersRef.current = {};
            
            // Recréer tous les marqueurs avec la nouvelle taille
            geoJsonLayerRef.current?.eachLayer(layer => {
              const feature = (layer as any).feature as Department | undefined;
              const deptCode = feature?.properties?.code;

              if (deptCode) {
                const vigilance = topVigilanceMap[deptCode];
                if (vigilance && layer instanceof L.Path) {
                  const bounds = (layer as any).getBounds();
                  const diagonal = bounds.getSouthWest().distanceTo(bounds.getNorthEast());
                  const minSize = 20;
                  const maxSize = 40;
                  const minDiag = 70000;
                  const maxDiag = 600000;
                  const scale = Math.max(0, Math.min(1, (diagonal - minDiag) / (maxDiag - minDiag)));
                  const baseSize = Math.round(minSize + scale * (maxSize - minSize));
                  const center = bounds.getCenter();
                  const icon = createVigilanceIcon(vigilance.phenomenon_id, baseSize, currentZoom);
                  if (icon) {
                    const marker = L.marker(center, { icon }).addTo(markersLayerRef.current!);
                    markersRef.current[deptCode] = marker;
                  }
                }
              }
            });
          }, 50); // Petit délai pour s'assurer que le zoom est terminé
        });

        // Recentrer la carte
        mapRef.current.fitBounds(FRANCE_BOUNDS, {
          padding: [20, 20],
          animate: false
        });
      });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapKey]); // Dépendance à mapKey au lieu de []

  // Fonction pour mettre à jour les styles des départements
  const updateDepartmentsStyle = () => {
    if (!geoJsonLayerRef.current || !vigilances.length) return;

    geoJsonLayerRef.current.eachLayer((layer: L.Layer) => {
      const path = layer as L.Path;
      const geoJsonFeature = (layer as any).feature as Department;
      
      if (geoJsonFeature && geoJsonFeature.properties) {
        const departmentVigilances = vigilances.filter(v => 
          v.domain_id === geoJsonFeature.properties.code
        );
        
        if (departmentVigilances.length > 0) {
          const maxVigilance = departmentVigilances.reduce((max, v) => 
            v.color_id > max.color_id ? v : max
          , departmentVigilances[0]);

          const config = VIGILANCE_CONFIG[maxVigilance.color_id];
          path.setStyle({
            fillColor: config.color,
            fillOpacity: 1
          });

          // Version plus compacte de la liste des vigilances
          const vigilancesList = departmentVigilances
            .sort((a, b) => b.color_id - a.color_id)
            .map(vigilance => {
              const vConfig = VIGILANCE_CONFIG[vigilance.color_id];
              return `
                <div class="mb-2 text-sm">
                  <div class="flex items-center gap-2">
                    <span style="color: ${vConfig.color}" class="font-bold">●</span>
                    <span class="font-medium">${vigilance.phenomenon}</span>
                  </div>
                  <div class="ml-4 text-xs text-gray-600">
                    ${formatDate(vigilance.begin_time).split('à')[0]} → ${formatDate(vigilance.end_time).split('à')[0]}
                  </div>
                </div>
              `;
            })
            .join('');

          const popupContent = `
            <div class="p-2">
              <h3 class="text-base font-bold mb-2">${geoJsonFeature.properties.nom}</h3>
              <div>
                ${vigilancesList}
              </div>
            </div>
          `;

          path.bindPopup(popupContent, {
            maxWidth: 250,
            className: 'vigilance-popup'
          });
        }
      }
    });
  };

  // Mettre à jour les couleurs des départements quand les vigilances changent
  useEffect(() => {
    updateDepartmentsStyle();
  }, [vigilances]);

  return (
    <div 
      key={mapKey} // Ajout de la clé pour forcer le remontage
      ref={mapContainer}
      style={{ 
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        borderRadius: '0.5rem',
        overflow: 'hidden'
      }}
    >
      {/* Badge GitHub en bas à gauche */}
      <div 
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '4px',
          padding: '2px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <a 
          href="https://github.com/wxcvbnlmjk/vigilances-vents" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <img 
            src="https://img.shields.io/github/last-commit/wxcvbnlmjk/vigilances-vents" 
            alt="Dernier commit GitHub"
            style={{ display: 'block' }}
          />
        </a>
      </div>
    </div>
  );
}

// Fonction pour créer une icône de vigilance personnalisée à partir d'un fichier image ou d'un emoji
function createVigilanceIcon(phenomenonId: number, size: number, zoom: number = 4.5): L.Icon | L.DivIcon | null {
  const iconValue = PHENOMENON_ICON_MAP[phenomenonId];
  if (!iconValue) {
    return null; // Pas de pictogramme défini pour ce phénomène
  }

  // Vérifier si c'est un emoji (contient des caractères Unicode)
  const isEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(iconValue);

  if (isEmoji) {
    // Utiliser divIcon pour les emojis
    // Calculer la taille en fonction du zoom (plus le zoom est élevé, plus l'emoji est gros)
    const zoomFactor = Math.pow(1.5, zoom - 4.5); // Facteur de zoom basé sur le niveau de zoom
    const emojiSize = Math.round((size / 2) * zoomFactor);
    return L.divIcon({
      html: `<div style="font-size: ${emojiSize}px; text-align: center; line-height: ${emojiSize}px; width: ${emojiSize}px; height: ${emojiSize}px; background: transparent; border: none;">${iconValue}</div>`,
      iconSize: [emojiSize, emojiSize],
      iconAnchor: [emojiSize / 2, emojiSize / 2],
      className: `vigilance-pictogram-icon-${phenomenonId}-${zoom}`,
    });
  } else {
    // Utiliser icon pour les images
    return L.icon({
      iconUrl: `/${iconValue}`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      className: 'vigilance-pictogram-icon',
    });
  }
} 