import axios from 'axios';
import { endSession, isSessionIdle } from './session';
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://127.0.0.1:8000/api',headers:{Accept:'application/json'}});
api.interceptors.request.use(c=>{const t=localStorage.getItem('token');if(t && isSessionIdle()){endSession('You were signed out after 30 minutes of inactivity. Please sign in again.');throw new axios.CanceledError('Session expired');}if(t)c.headers.Authorization=`Bearer ${t}`;return c});
api.interceptors.response.use(response=>response, error=>{if(error.response?.status===401 && localStorage.getItem('token') && error.config?.headers?.Authorization===`Bearer ${localStorage.getItem('token')}`)endSession('Your session has expired. Please sign in again.');return Promise.reject(error);});
export default api;
