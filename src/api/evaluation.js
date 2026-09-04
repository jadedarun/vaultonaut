import API from './axios';

export const runEvaluation = async (params = {}) => {
  const response = await API.post('/api/eval/run', params);
  return response.data;
};

export const getEvaluationRuns = async () => {
  const response = await API.get('/api/eval/runs');
  return response.data;
};

export const getEvaluationRun = async (runId) => {
  const response = await API.get(`/api/eval/runs/${runId}`);
  return response.data;
};

export const runChunkingExperiment = async () => {
  const response = await API.post('/api/eval/experiments/chunking');
  return response.data;
};

export const runThresholdSweep = async () => {
  const response = await API.post('/api/eval/experiments/threshold');
  return response.data;
};

export const getExperiments = async () => {
  const response = await API.get('/api/eval/experiments');
  return response.data;
};

export const getFailureDiagnostics = async (runId) => {
  const response = await API.get(`/api/eval/failures/${runId}`);
  return response.data;
};

export const getBenchmarkDataset = async () => {
  const response = await API.get('/api/eval/dataset');
  return response.data;
};

export const getCacheStats = async () => {
  const response = await API.get('/api/eval/cache-stats');
  return response.data;
};

export const clearCache = async () => {
  const response = await API.post('/api/eval/cache/clear');
  return response.data;
};

export const seedBenchmarkCorpus = async () => {
  const response = await API.post('/api/eval/seed-benchmark');
  return response.data;
};
