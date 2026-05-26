import axios from "axios";

export const BASE_URL = "https://zanosa-zestful-and-notable-online-social.onrender.com";

const API = axios.create({
  baseURL: BASE_URL,
});

export default API;