// Types globaux pour l'application météo

declare module 'leaflet-velocity' {
  const velocityLayer: any;
  export default velocityLayer;
}

// Types pour les composants existants
declare module '../src_vents/App' {
  const WindMap: React.ComponentType;
  export default WindMap;
}

declare module '../src_vigilance/App' {
  const VigilanceMap: React.ComponentType;
  export default VigilanceMap;
}
