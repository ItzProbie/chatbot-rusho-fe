import axios from 'axios'

const api = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL
})

// Interceptor to handle 401 responses -> token invalid or expired
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Auth routes
export const signUp = (props) => {
    return api.post('auth/signup', props);
}

export const login = (props) => {
    return api.post('auth/login', props);
}

// Chat routes
export const getMySessions = () => {
    return api.get('chat/get-my-sessions', {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
    });
}

export const getSession = (sessionId) => {
    return api.get(`chat/get-session/${sessionId}`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
    });
}

export const deleteSession = (sessionId) => {
    return api.delete(`chat/delete-session/${sessionId}`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
    });
}

// AI Messenger routes
export const chat = (props) => {
    return api.post('chatbot/chat', props, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
    });
}
