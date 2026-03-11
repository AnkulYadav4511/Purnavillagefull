// // File: services/api.js
// import axios from 'axios';

const BASE_URL = 'https://purna-full.onrender.com/api'; 

// const API = axios.create({
//   baseURL: BASE_URL,
//   headers: { 
//     'Content-Type': 'application/json',
//   },
// });

// export default API;

// File: services/api.js
import axios from 'axios';

// export const BASE_URL = 'http://192.168.0.147:3000/api'; 

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API; 