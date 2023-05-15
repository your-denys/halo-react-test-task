import axios from 'axios';

export const fetchCities = (): Promise<any> => {
  return axios.get('https://run.mocky.io/v3/9fcb58ca-d3dd-424b-873b-dd3c76f000f4');
};

export const fetchSpecialties = (): Promise<any> => {
  return axios.get('https://run.mocky.io/v3/e8897b19-46a0-4124-8454-0938225ee9ca');
};

export const fetchDoctors = (): Promise<any> => {
  return axios.get('https://run.mocky.io/v3/3d1c993c-cd8e-44c3-b1cb-585222859c21');
};