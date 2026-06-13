import request from '../utils/request';

export const createDiagnosis = (data) => request.post('/diagnoses', data);
export const getDiagnosisByWorkOrder = (work_order_id) => request.get(`/diagnoses/work-order/${work_order_id}`);
