import request from '../utils/request';

export const getGreenhouseByQr = (qr_code) => request.get(`/greenhouses/qr/${qr_code}`);
export const getGreenhouses = (params) => request.get('/greenhouses', { params });
export const createGreenhouse = (data) => request.post('/greenhouses', data);
export const updateGreenhouse = (id, data) => request.put(`/greenhouses/${id}`, data);
export const getFarmerGreenhouses = (farmer_id) => request.get(`/greenhouses/farmer/${farmer_id}`);
