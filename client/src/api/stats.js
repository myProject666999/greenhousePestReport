import request from '../utils/request';

export const getOverview = () => request.get('/stats/overview');
export const getPestDistribution = (params) => request.get('/stats/pest-distribution', { params });
export const getRegionSummary = (params) => request.get('/stats/region-summary', { params });
export const getTrendData = (params) => request.get('/stats/trend', { params });
export const getTopPests = (params) => request.get('/stats/top-pests', { params });
