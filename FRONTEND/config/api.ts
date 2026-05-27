import axios from "axios";

// export const BASE_URL = "https://zanosa-zestful-and-notable-online-social.onrender.com";
export const BASE_URL = "http://localhost:3000" ; 

const API = axios.create({
  baseURL: BASE_URL,
});

export default API;