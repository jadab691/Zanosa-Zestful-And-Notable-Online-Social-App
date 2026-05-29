import axios from "axios";

// export const BASE_URL = "https://zanosa-zestful-and-notable-online-social.onrender.com";
export const BASE_URL = "http://192.168.0.133:5700"; 

const API = axios.create({
  baseURL: BASE_URL,
});

export default API;