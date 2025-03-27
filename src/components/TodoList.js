// TodoList.js
import React, { useState, useEffect } from 'react';
import TodoService from '../services/TodoService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LuPlus,
    LuPencil,
    LuTrash2,
    LuCheck,
    LuLoader
} from 'react-icons/lu';

const TodoList = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, [filter]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await TodoService.getTasks(filter);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        try {
            await TodoService.createTask({ name: newTask, status: 'PENDING' });
            setNewTask('');
            fetchTasks();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleUpdateTask = async (id) => {
        try {
            await TodoService.updateTask(id, { name: editValue });
            setEditingTask(null);
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await TodoService.updateTask(id, { status });
            fetchTasks();
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await TodoService.deleteTask(id);
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <span className="status-badge completed">Completed</span>;
            case 'IN_PROGRESS':
                return <span className="status-badge in-progress">In Progress</span>;
            default:
                return <span className="status-badge pending">Pending</span>;
        }
    };

    const statusOptions = [
        { value: 'PENDING', label: 'Pending' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'COMPLETED', label: 'Completed' }
    ];

    const filterOptions = [
        { value: 'ALL', label: 'All Tasks' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'COMPLETED', label: 'Completed' }
    ];

    return (
        <div className="todo-container">
            <div className="todo-header">
                <h1>Task Flow</h1>
                <div className="filter-container">
                    <select
                        className="filter-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        {filterOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <form onSubmit={handleAddTask} className="task-form">
                <input
                    type="text"
                    placeholder="What needs to be done?"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="task-input"
                />
                <button type="submit" className="add-button">
                    <LuPlus /> Add
                </button>
            </form>

            <div className="task-list-container">
                {loading ? (
                    <div className="loading-container">
                        <LuLoader className="loading-icon spin" />
                        <p>Loading tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="empty-illustration"></div>
                        <p>Your task list is empty</p>
                        <p className="empty-subtitle">Add your first task to get started!</p>
                    </motion.div>
                ) : (
                    <ul className="task-list">
                        <AnimatePresence>
                            {tasks.map(task => (
                                <motion.li
                                    key={task.id}
                                    className={`task-item ${task.status === 'COMPLETED' ? 'completed-task' : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.3 }}
                                    layout
                                >
                                    {editingTask === task.id ? (
                                        <div className="edit-form">
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="edit-input"
                                                autoFocus
                                            />
                                            <button
                                                className="save-button"
                                                onClick={() => handleUpdateTask(task.id)}
                                            >
                                                <LuCheck /> Save
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="task-content">
                                                <div className="task-name">{task.name}</div>
                                                {getStatusBadge(task.status)}
                                            </div>
                                            <div className="task-actions">
                                                <select
                                                    className="status-select"
                                                    value={task.status}
                                                    onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                                                >
                                                    {statusOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>

                                                <button
                                                    className="action-button edit"
                                                    onClick={() => {
                                                        setEditingTask(task.id);
                                                        setEditValue(task.name);
                                                    }}
                                                    aria-label="Edit task"
                                                >
                                                    <LuPencil />
                                                </button>

                                                <button
                                                    className="action-button delete"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    aria-label="Delete task"
                                                >
                                                    <LuTrash2 />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TodoList;
