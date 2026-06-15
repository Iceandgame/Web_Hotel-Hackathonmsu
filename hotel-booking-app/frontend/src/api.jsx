import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://web-hotel-hackathonmsu.onrender.com';

axios.defaults.baseURL = API_URL;

export default API_URL;