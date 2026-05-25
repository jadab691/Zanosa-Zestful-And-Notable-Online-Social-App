import axios from "axios";

export const BASE_URL = "http://192.168.0.133:5500";

const API = axios.create({
  baseURL: BASE_URL,
});

export default API;