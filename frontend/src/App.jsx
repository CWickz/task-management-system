import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiSearch, FiPlus, FiGrid, FiCheckSquare, FiEdit2,
  FiTrash2, FiX, FiCalendar, FiClock, FiChevronDown,
  FiCheckCircle, FiAlertCircle, FiAlertTriangle,
  FiPieChart, FiSettings, FiChevronLeft, FiChevronRight,
  FiTarget, FiActivity, FiUser, FiShield, FiDownload
} from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Persistent Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('taskmaster_settings');
    return saved ? JSON.parse(saved) : {
      name: 'Kim So Men',
      email: 'kim@taskmaster.app',
      role: 'UI/UX Designer'
    };
  });

  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'Medium', status: 'Pending', dueDate: ''
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null,
    taskId: null
  });

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

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSettingChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    localStorage.setItem('taskmaster_settings', JSON.stringify(settings));
    setTimeout(() => setIsSaving(false), 1500);
  };

  const handleExportData = () => {
    if (tasks.length === 0) return alert("No tasks to export.");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "taskmaster_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingId(task._id);
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate.split('T')[0]
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (error) {
      console.error("Error saving task", error);
    }
  };

  const handleQuickStatusChange = async (task, newStatus) => {
    if (task.status === newStatus) return;
    try {
      await axios.put(`${API_URL}/${task._id}`, { ...task, status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const executeConfirmAction = async () => {
    try {
      if (confirmDialog.type === 'DELETE_TASK') {
        await axios.delete(`${API_URL}/${confirmDialog.taskId}`);
      } else if (confirmDialog.type === 'CLEAR_COMPLETED') {
        const completedTasks = tasks.filter(t => t.status === 'Completed');
        await Promise.all(completedTasks.map(task => axios.delete(`${API_URL}/${task._id}`)));
      } else if (confirmDialog.type === 'DELETE_ACCOUNT') {
        await Promise.all(tasks.map(task => axios.delete(`${API_URL}/${task._id}`)));
        localStorage.removeItem('taskmaster_settings');
        setSettings({ name: '', email: '', role: '' });
        setActiveTab('dashboard');
      }
      fetchTasks();
    } catch (error) {
      console.error("Error executing deletion", error);
    } finally {
      setConfirmDialog({ isOpen: false, type: null, taskId: null });
    }
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(lastDay);
    if (endDate.getDay() !== 6) endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days = [];
    let d = new Date(startDate);
    while (d <= endDate) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  };

  const statsTotal = tasks.length;
  const statsCompleted = tasks.filter(t => t.status === 'Completed').length;
  const statsActive = statsTotal - statsCompleted;
  const progressPercent = statsTotal > 0 ? Math.round((statsCompleted / statsTotal) * 100) : 0;

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const highPriority = tasks.filter(t => t.priority === 'High').length;
  const mediumPriority = tasks.filter(t => t.priority === 'Medium').length;
  const lowPriority = tasks.filter(t => t.priority === 'Low').length;
  const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;

  const pendingPct = statsTotal > 0 ? Math.round((pendingCount / statsTotal) * 100) : 0;
  const inProgressPct = statsTotal > 0 ? Math.round((inProgressCount / statsTotal) * 100) : 0;
  const completedPct = statsTotal > 0 ? Math.round((statsCompleted / statsTotal) * 100) : 0;

  const highPct = statsTotal > 0 ? Math.round((highPriority / statsTotal) * 100) : 0;
  const mediumPct = statsTotal > 0 ? Math.round((mediumPriority / statsTotal) * 100) : 0;
  const lowPct = statsTotal > 0 ? Math.round((lowPriority / statsTotal) * 100) : 0;

  let processedTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  processedTasks.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdDate || Date.now()) - new Date(a.createdDate || Date.now());
    if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
    if (sortBy === 'priority') {
      const p = { High: 3, Medium: 2, Low: 1 };
      return p[b.priority] - p[a.priority];
    }
    return 0;
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 p-6 overflow-hidden gap-6 transition-colors duration-300">

      {/* SIDEBAR */}
      <aside className="w-72 bg-white rounded-3xl p-6 flex flex-col hidden lg:flex border border-slate-200 shadow-sm shrink-0 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-8 mt-2 px-2 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">T</div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">TaskMaster.</span>
        </div>

        <div className="mb-8 shrink-0">
          <p className="text-[10px] font-extrabold text-slate-400 tracking-widest mb-3 px-3 uppercase">Menu</p>
          <nav className="space-y-1">
            {[
              { id: 'dashboard', icon: FiGrid, label: 'Dashboard' },
              { id: 'tasks', icon: FiCheckSquare, label: 'My Tasks' },
              { id: 'calendar', icon: FiCalendar, label: 'Calendar' },
              { id: 'analytics', icon: FiPieChart, label: 'Analytics' },
              { id: 'settings', icon: FiSettings, label: 'Settings' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                }`}
              >
                <item.icon size={18} className={activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* HEADER */}
        <header className="flex flex-col xl:flex-row gap-6 mb-6 shrink-0 justify-between items-start xl:items-center">
          <div className="flex items-center bg-white rounded-2xl px-5 py-3.5 border border-slate-200 shadow-sm w-full max-w-xl transition-all focus-within:border-indigo-300 focus-within:shadow-md">
            <FiSearch className="text-slate-400 mr-3" size={20} />
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 font-medium placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm w-full xl:w-auto">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
              <span className="text-lg font-extrabold text-indigo-600">{progressPercent}%</span>
            </div>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex gap-4">
              <div className="text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Active</span>
                <span className="text-sm font-bold text-slate-700">{statsActive}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Done</span>
                <span className="text-sm font-bold text-emerald-600">{statsCompleted}</span>
              </div>
            </div>
          </div>
        </header>

        {/* DYNAMIC VIEW AREA */}
        <div className="flex-1 flex flex-col overflow-hidden">

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                {activeTab === 'calendar' ? <FiCalendar className="text-indigo-600" size={20} /> :
                 activeTab === 'analytics' ? <FiPieChart className="text-indigo-600" size={20} /> :
                 activeTab === 'settings' ? <FiSettings className="text-indigo-600" size={20} /> :
                 <FiCheckSquare className="text-indigo-600" size={20} />}
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === 'dashboard' ? 'Dashboard Overview' :
                 activeTab === 'calendar' ? 'Task Calendar' :
                 activeTab === 'analytics' ? 'Performance Analytics' :
                 activeTab === 'settings' ? 'Application Settings' : 'Active Tasks'}
              </h2>
              {activeTab !== 'settings' && (
                <button onClick={() => openModal()} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-md transition-all ml-4 flex items-center gap-2 font-bold text-sm transform hover:scale-105">
                  <FiPlus size={18} /> New Task
                </button>
              )}
            </div>

            {activeTab !== 'calendar' && activeTab !== 'analytics' && activeTab !== 'settings' && (
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-600 text-xs font-bold pl-4 pr-8 py-2.5 rounded-xl shadow-sm outline-none cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="dueDate">Sort: Due Date</option>
                    <option value="priority">Sort: Priority</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>

                <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                  {['All', 'Pending', 'In Progress', 'Completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterStatus === status ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {statsCompleted > 0 && (
                  <button
                    onClick={() => setConfirmDialog({ isOpen: true, type: 'CLEAR_COMPLETED', taskId: null })}
                    className="px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5 border border-rose-100"
                  >
                    <FiTrash2 size={14} /> Clear Done
                  </button>
                )}
              </div>
            )}
          </div>

          {activeTab === 'calendar' ? (
            <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h3 className="text-xl font-extrabold text-slate-800">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"><FiChevronLeft size={20} /></button>
                  <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-bold text-slate-600 transition-colors">Today</button>
                  <button onClick={nextMonth} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"><FiChevronRight size={20} /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-3 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 flex-1 overflow-y-auto">
                {getCalendarDays().map((day, idx) => {
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                  const isToday = day.toDateString() === new Date().toDateString();
                  const dayTasks = tasks.filter(task => new Date(task.dueDate).toDateString() === day.toDateString());

                  return (
                    <div key={idx} className={`min-h-[100px] border-b border-r border-slate-100 p-2 flex flex-col gap-1.5 transition-colors hover:bg-slate-50/50 ${!isCurrentMonth ? 'bg-slate-50/50 opacity-60' : 'bg-white'}`}>
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600'}`}>
                          {day.getDate()}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1">
                        {dayTasks.map(task => (
                          <div
                            key={task._id}
                            onClick={() => openModal(task)}
                            className={`text-[10px] font-bold px-2 py-1.5 rounded-md truncate cursor-pointer transition-transform hover:scale-[1.02] border-l-2 ${
                              task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-500' :
                              task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-500' : 'bg-slate-100 text-slate-700 border-slate-400'
                            }`}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === 'analytics' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><FiGrid size={24}/></div>
                  <div><p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Total Tasks</p><h4 className="text-3xl font-extrabold text-slate-900">{statsTotal}</h4></div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><FiCheckCircle size={24}/></div>
                  <div><p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Completed</p><h4 className="text-3xl font-extrabold text-slate-900">{statsCompleted}</h4></div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><FiClock size={24}/></div>
                  <div><p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">In Progress</p><h4 className="text-3xl font-extrabold text-slate-900">{inProgressCount}</h4></div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-rose-200 shadow-sm flex items-center gap-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full -z-10"></div>
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0"><FiAlertTriangle size={24}/></div>
                  <div><p className="text-[11px] font-extrabold text-rose-400 uppercase tracking-widest mb-1">Overdue Tasks</p><h4 className="text-3xl font-extrabold text-rose-600">{overdueTasks}</h4></div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2"><FiActivity className="text-indigo-600"/> Status Breakdown</h3>
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-lg">All Time</span>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2"><span className="text-slate-600">Pending</span><span className="text-slate-900">{pendingPct}%</span></div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden"><div className="bg-slate-400 h-full rounded-full transition-all duration-1000 ease-out" style={{width: `${pendingPct}%`}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2"><span className="text-slate-600">In Progress</span><span className="text-slate-900">{inProgressPct}%</span></div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden"><div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" style={{width: `${inProgressPct}%`}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2"><span className="text-slate-600">Completed</span><span className="text-emerald-600">{completedPct}%</span></div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" style={{width: `${completedPct}%`}}></div></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2"><FiTarget className="text-indigo-600"/> Priority Distribution</h3>
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-lg">Active & Done</span>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2"><span className="text-slate-600">High Priority</span><span className="text-rose-600">{highPriority} Tasks</span></div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden"><div className="bg-rose-500 h-full rounded-full transition-all duration-1000 ease-out" style={{width: `${highPct}%`}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2"><span className="text-slate-600">Medium Priority</span><span className="text-amber-500">{mediumPriority} Tasks</span></div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden"><div className="bg-amber-400 h-full rounded-full transition-all duration-1000 ease-out" style={{width: `${mediumPct}%`}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2"><span className="text-slate-600">Low Priority</span><span className="text-emerald-600">{lowPriority} Tasks</span></div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" style={{width: `${lowPct}%`}}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 flex flex-col gap-6 max-w-4xl mx-auto w-full">

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-colors">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                  <FiUser className="text-indigo-600"/> Profile Information
                </h3>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-24 h-24 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-300 shrink-0">
                    <FiUser size={40} />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Display Name</label>
                      <input type="text" name="name" value={settings.name} onChange={handleSettingChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-semibold transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Email Address</label>
                      <input type="email" name="email" value={settings.email} onChange={handleSettingChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-semibold transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Job Role</label>
                      <input type="text" name="role" value={settings.role} onChange={handleSettingChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-semibold transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-colors">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                  <FiShield className="text-indigo-600"/> Data & Privacy
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Export Task Data</p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">Download a JSON backup of all your tasks from the database</p>
                    </div>
                    <button onClick={handleExportData} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-2">
                      <FiDownload size={14} /> Export JSON
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-rose-100 bg-rose-50/50 rounded-2xl">
                    <div>
                      <p className="text-sm font-bold text-rose-700">Delete Account & Data</p>
                      <p className="text-xs font-semibold text-rose-500 mt-0.5">Permanently remove your account and clear the entire database</p>
                    </div>
                    <button
                      onClick={() => setConfirmDialog({ isOpen: true, type: 'DELETE_ACCOUNT', taskId: null })}
                      className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveSettings}
                  className={`px-8 py-3.5 text-sm font-extrabold text-white rounded-xl shadow-md transition-all transform hover:scale-[1.02] ${
                    isSaving ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                  }`}
                >
                  {isSaving ? 'Settings Saved! ✓' : 'Save Settings'}
                </button>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-4 custom-scrollbar">
              {processedTasks.length > 0 ? processedTasks.map((task) => (
                <div key={task._id} className="group relative bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between min-h-[180px] overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${
                    task.priority === 'High' ? 'bg-rose-500' :
                    task.priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}></div>

                  <div>
                    <div className="flex justify-between items-start mb-3 mt-1">
                      <h3 className="font-extrabold text-slate-800 text-lg leading-tight line-clamp-2 pr-4">{task.title}</h3>

                      <div className="flex gap-2 absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(task)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg bg-white border border-slate-100 shadow-sm transition-colors">
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDialog({ isOpen: true, type: 'DELETE_TASK', taskId: task._id })}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg bg-white border border-slate-100 shadow-sm transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-6">{task.description}</p>
                  </div>

                  <div className="flex justify-between items-end mt-auto">
                    <div className="flex bg-slate-50 border border-slate-100 rounded-lg p-1 gap-1">
                      <button
                        onClick={() => handleQuickStatusChange(task, 'Pending')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                          task.status === 'Pending' ? 'bg-slate-200 text-slate-700 shadow-sm' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleQuickStatusChange(task, 'In Progress')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleQuickStatusChange(task, 'Completed')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                          task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                      >
                        Completed
                      </button>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <div className={`flex items-center gap-1.5 ${new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-rose-500' : 'text-slate-400'}`}>
                        <FiCalendar size={12} />
                        <span className="text-xs font-bold">{new Date(task.dueDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${
                        task.priority === 'High' ? 'text-rose-500' :
                        task.priority === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {task.priority === 'High' && <FiAlertCircle size={10} />}
                        {task.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full flex flex-col items-center justify-center h-64 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                  <FiCheckCircle size={48} className="text-slate-300 mb-4" />
                  <p className="text-slate-500 font-bold text-lg">You're all caught up!</p>
                  <p className="text-slate-400 text-sm mt-1">No tasks found matching your current filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* CONFIRMATION MODAL */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 mb-5">
              <FiAlertTriangle className="h-8 w-8 text-rose-600" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">
              {confirmDialog.type === 'CLEAR_COMPLETED' ? 'Clear Completed Tasks?' :
               confirmDialog.type === 'DELETE_ACCOUNT' ? 'Delete Entire Account?' : 'Delete Task?'}
            </h3>
            <p className="text-sm text-slate-500 mb-8 font-medium px-4">
              {confirmDialog.type === 'CLEAR_COMPLETED'
                ? `You are about to permanently delete ${statsCompleted} completed tasks. This action cannot be undone.`
                : confirmDialog.type === 'DELETE_ACCOUNT'
                ? 'You are about to wipe your entire database and reset all settings. This action is absolute and cannot be undone.'
                : 'Are you sure you want to delete this task? This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, type: null, taskId: null })}
                className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmAction}
                className="flex-1 py-3 text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASK ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{editingId ? 'Edit Task' : 'Create New Task'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"><FiX size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Task Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-semibold transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-semibold transition-all"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Due Date</label>
                  <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-bold transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-bold transition-all appearance-none cursor-pointer">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-bold transition-all appearance-none cursor-pointer">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="mt-6 flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-3.5 text-sm font-extrabold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl shadow-md transition-all transform hover:scale-[1.02]">
                  {editingId ? 'Save Updates' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}