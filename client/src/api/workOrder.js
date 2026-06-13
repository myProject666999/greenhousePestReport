import request from '../utils/request';

export const createWorkOrder = (formData) => request.post('/work-orders', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getWorkOrders = (params) => request.get('/work-orders', { params });
export const getWorkOrderDetail = (id) => request.get(`/work-orders/${id}`);
export const claimWorkOrder = (id) => request.post(`/work-orders/${id}/claim`);
export const getPendingCount = () => request.get('/work-orders/pending-count');
