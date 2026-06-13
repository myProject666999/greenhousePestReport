import request from '../utils/request';

export const createFeedback = (data) => request.post('/feedbacks', data);
export const getFeedbacksByWorkOrder = (work_order_id) => request.get(`/feedbacks/work-order/${work_order_id}`);
