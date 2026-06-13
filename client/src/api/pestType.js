import request from '../utils/request';

export const getPestTypes = (params) => request.get('/pest-types', { params });
export const getPestTypeDetail = (id) => request.get(`/pest-types/${id}`);
export const createPestType = (data) => request.post('/pest-types', data);
export const updatePestType = (id, data) => request.put(`/pest-types/${id}`, data);
export const deletePestType = (id) => request.delete(`/pest-types/${id}`);
