import axios from 'axios';
import AuthService from './AuthService';

const API_URL = 'http://localhost:3002/tasks';

class TodoService {
    getTasks(filter) {
        return axios.get(`${API_URL}?status=${filter}`);
    }

    getTaskById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    createTask(task) {
        return axios.post(API_URL, task);
    }

    updateTask(id, task) {
        return axios.put(`${API_URL}/${id}`, task);
    }

    deleteTask(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
}

export default new TodoService();