import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '' });
  const [editingId, setEditingId] = useState(null);

  // Fetch Tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };

  // Handle Inputs
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Create or Update Task
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      setFormData({ title: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '' });
      setEditingId(null);
      fetchTasks();
    } catch (error) {
      console.error("Error saving task", error);
    }
  };

  // Delete Task
  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this task?")) {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
    }
  };

  // Edit Task Setup
  const handleEdit = (task) => {
    setEditingId(task._id);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate.split('T')[0] // Format for input date
    });
  };

  // Filter & Search Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Task Management System</h1>

      {/* Form Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Task' : 'Create New Task'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input required type="text" name="title" placeholder="Task Title" value={formData.title} onChange={handleInputChange} className="border p-2 rounded" />
          <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className="border p-2 rounded" />
          <select name="priority" value={formData.priority} onChange={handleInputChange} className="border p-2 rounded">
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
          <select name="status" value={formData.status} onChange={handleInputChange} className="border p-2 rounded">
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <textarea required name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} className="border p-2 rounded md:col-span-2 lg:col-span-3"></textarea>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 md:col-span-2 lg:col-span-3">
            <FiPlus /> {editingId ? 'Update Task' : 'Save Task'}
          </button>
        </form>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input type="text" placeholder="Search by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border p-2 rounded flex-1" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border p-2 rounded w-full md:w-48">
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Tasks Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <div key={task._id} className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderColor: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#10b981' }}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold">{task.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(task)} className="text-blue-500 hover:text-blue-700"><FiEdit2 /></button>
                <button onClick={() => handleDelete(task._id)} className="text-red-500 hover:text-red-700"><FiTrash2 /></button>
              </div>
            </div>
            <p className="text-gray-600 mb-4 text-sm">{task.description}</p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className={`px-2 py-1 rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                {task.status}
              </span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && <p className="text-gray-500 col-span-full text-center py-8">No tasks found.</p>}
      </div>
    </div>
  );
}
export default App;