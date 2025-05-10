import axios from "axios";

const api = axios.create({
  baseURL: "http://host.docker.internal:3001/api", 
});

export default api;
