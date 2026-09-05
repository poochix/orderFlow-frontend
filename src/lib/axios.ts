import axios from 'axios'

// Creates a centralized Axios instance
export const api = axios.create({
    //Vite exposes env variables via import.meta.env
    baseURL: import.meta.env.VITE_API_URL,
    // CRITICAL : this tells the browser to include http-Only cookies in request
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
});

// adding a response interceptor for global error handling (e.g., kicking user out if cookie expires)
api.interceptors.response.use(
    (response)=> response,
    (error)=> {
        if(error.response?.status === 401){
            //Trigger logout action later
            console.warn('Unauthorized: Session expired or invalid');
        }
        return Promise.reject(error)
    }
)