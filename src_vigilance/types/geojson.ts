export interface Department {
  type: string;
  properties: {
    code: string;
    nom: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

export interface DepartmentsGeoJSON {
  type: string;
  features: Department[];
} 