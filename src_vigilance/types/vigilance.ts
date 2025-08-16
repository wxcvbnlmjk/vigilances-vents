export interface Vigilance {
  domain_id: string;
  echeance: string;
  phenomenon_id: number;
  phenomenon: string;
  color_id: number;
  color: string;
  begin_time: string;
  end_time: string;
  product_datetime: string;
}

export interface VigilanceFilters {
  date?: string;
  department?: string;
  phenomenonType?: string;
} 