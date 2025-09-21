import axios from "axios";

const API = axios.create({
	// baseURL: "http://127.0.0.1:8000/", // Your Django backend URL
	baseURL: "https://seagull-5adu.onrender.com", // Your Django backend URL
	headers: {
		"Content-Type": "application/json",
	},
});

// Attach Token to Requests
API.interceptors.request.use(
	async (config) => {
		const token = localStorage.getItem("access_token");
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Auto-refresh token if expired
API.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {

			const refreshToken = localStorage.getItem("refresh_token");
			if (!refreshToken) {
				window.location.href = "/login";
				return Promise.reject(error);
			}

			try {
				const res = await axios.post("http://127.0.0.1:8000/token/refresh/", {
					refresh: refreshToken,
				});

				const newAccessToken = res.data.access;
				localStorage.setItem("access_token", newAccessToken);

				error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
				return API(error.config);
			} catch (refreshError) {
				console.error("Token Refresh Failed:", refreshError.response);
				localStorage.removeItem("access_token");
				localStorage.removeItem("refresh_token");
				localStorage.clear();
				window.location.href = "/login";
			}
		}

		return Promise.reject(error);
	}
);

export default API;
