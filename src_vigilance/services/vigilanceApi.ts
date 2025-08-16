import { Vigilance } from '../types/vigilance';

interface ApiResponse {
  total_count: number;
  results: Vigilance[];
}

const API_URL = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/weatherref-france-vigilance-meteo-departement/records';

export async function getVigilances(echeance: 'J' | 'J1'): Promise<Vigilance[]> {
  try {

    const allDomainIds: string[] = [
      '01', '02', '03', '04', '05', '06', '07', '08', '09',
      '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
      '2A', '2B',
      '21', '22', '23', '24', '25', '26', '27', '28', '29',
      '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
      '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
      '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
      '60', '61', '62', '63', '64', '65', '66', '67', '68', '69',
      '70', '71', '72', '73', '74', '75', '76', '77', '78', '79',
      '80', '81', '82', '83', '84', '85', '86', '87', '88', '89',
      '90', '91', '92', '93', '94', '95'
    ];

    // Filtre d'échéance selon le paramètre
    const echeanceFilter = `echeance='${echeance}'`;

    // Requêtes selon l'échéance sélectionnée
    let data4: ApiResponse = { total_count: 0, results: [] };
    const query4 = `color_id=4 AND ${echeanceFilter} AND domain_id IN (${allDomainIds.map(id => `'${id}'`).join(",")})`;
    const response4 = await fetch(`${API_URL}?where=${encodeURIComponent(query4)}&limit=100`);
    if (!response4.ok) {
      throw new Error(`HTTP error! status: ${response4.status}`);
    }
    data4 = await response4.json();

    let data3: ApiResponse = { total_count: 0, results: [] };
    const query3 = `color_id=3 AND ${echeanceFilter} AND domain_id IN (${allDomainIds.map(id => `'${id}'`).join(",")})`;
    const response3 = await fetch(`${API_URL}?where=${encodeURIComponent(query3)}&limit=100`);
    if (!response3.ok) {
      throw new Error(`HTTP error! status: ${response3.status}`);
    }
    data3 = await response3.json();

    let data2: ApiResponse = { total_count: 0, results: [] };
    const query2 = `color_id=2 AND ${echeanceFilter} AND domain_id IN (${allDomainIds.map(id => `'${id}'`).join(",")})`;
    const response2 = await fetch(`${API_URL}?where=${encodeURIComponent(query2)}&limit=100`);
    if (!response2.ok) {
      throw new Error(`HTTP error! status: ${response2.status}`);
    }
    data2 = await response2.json();

    // Combiner toutes les données selon l'échéance sélectionnée
    const allVigilances = [
      ...data4.results, ...data3.results, ...data2.results
    ].map(vigilance => ({
      ...vigilance,
      domain_id: vigilance.domain_id.toString().padStart(2, '0')
    }));
    return allVigilances;
  } catch (error) {
    console.error('Erreur lors de la récupération des vigilances:', error);
    return [];
  }
} 