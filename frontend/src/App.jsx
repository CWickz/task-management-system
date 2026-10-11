import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiSearch, FiPlus, FiGrid, FiCheckSquare, FiEdit2,
  FiTrash2, FiX, FiCalendar, FiClock, FiChevronDown,
  FiCheckCircle, FiAlertCircle, FiAlertTriangle,
  FiPieChart, FiSettings, FiChevronLeft, FiChevronRight,
  FiTarget, FiActivity, FiUser, FiShield, FiDownload,
  FiBell, FiCheck, FiMoreHorizontal, FiTrendingUp, FiFlag
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
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9, 1)); // October 2026

  // Persistent Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('taskmaster_settings');
    return saved ? JSON.parse(saved) : {
      name: 'Chamara Sandakelum',
      email: 'chamara@taskmaster.app',
      role: 'Lead Designer'
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
      const payload = editingId ? formData : { ...formData, createdDate: new Date().toISOString() };

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (error) {
      console.error("Error saving task", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
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

  // Calendar Navigation
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
    <div className="flex h-screen bg-[#F7F9FC] font-sans text-slate-800 p-6 overflow-hidden gap-6 antialiased">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white rounded-3xl p-6 flex flex-col justify-between shrink-0 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-purple-500/20">
              T
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">TaskMaster</span>
              <span className="text-[9px] font-extrabold text-[#7C3AED] tracking-wider uppercase bg-purple-50 px-1.5 py-0.5 rounded">Workspace Pro</span>
            </div>
          </div>

          <p className="text-[10px] font-extrabold text-slate-400 tracking-widest mb-3 px-3 uppercase">Menu</p>
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', icon: FiGrid, label: 'Dashboard' },
              { id: 'tasks', icon: FiCheckSquare, label: 'My Tasks', badge: statsActive },
              { id: 'calendar', icon: FiCalendar, label: 'Calendar' },
              { id: 'analytics', icon: FiPieChart, label: 'Analytics' },
              { id: 'settings', icon: FiSettings, label: 'Settings' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-[#F3EEFE] text-[#7C3AED] shadow-sm font-extrabold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-3"><item.icon size={16} /> {item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === item.id ? 'bg-[#7C3AED] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
            {settings.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <span className="block text-xs font-extrabold text-slate-800 truncate">{settings.name}</span>
            <span className="block text-[10px] font-bold text-slate-400 truncate">{settings.role}</span>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* HEADER NAVBAR */}
        <header className="flex justify-between items-center mb-6 shrink-0 bg-white px-6 py-3.5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center bg-[#F8FAFC] rounded-2xl px-4 py-2 border border-slate-200/60 w-96 focus-within:border-[#7C3AED] transition-colors">
            <FiSearch className="text-slate-400 mr-3" size={16} />
            <input
              type="text"
              placeholder="Search tasks, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full text-slate-700 font-medium placeholder-slate-400"
            />
            <span className="text-[10px] bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded font-bold shadow-2xs">⌘K</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-extrabold text-slate-500">PROGRESS</span>
              <span className="text-xs font-extrabold text-[#7C3AED]">{progressPercent}%</span>
              <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <div className="h-4 w-px bg-slate-200 mx-1"></div>
              <span className="text-[10px] font-bold text-slate-500">ACTIVE <strong className="text-slate-900">{statsActive}</strong></span>
              <span className="text-[10px] font-bold text-slate-500">DONE <strong className="text-emerald-600">{statsCompleted}</strong></span>
            </div>

            <button className="relative text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <FiBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* WORKSPACE VIEW AREA */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-1 pb-6 gap-6">

          {/* WELCOME SPRINT BANNER */}
          {activeTab === 'dashboard' && (
            <div className="bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] rounded-3xl p-8 text-white shadow-lg shadow-purple-500/10 relative overflow-hidden shrink-0">
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-extrabold tracking-widest uppercase mb-3 text-purple-100">
                  <FiFlag size={12} /> Overview Dashboard
                </span>
                <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Welcome back, {settings.name}!</h1>
                <p className="text-sm font-medium text-white/90 max-w-2xl mb-6 leading-relaxed">
                  You have completed <strong>{statsCompleted} of {statsTotal}</strong> tasks. You are on track to wrap up this week's milestone deliverables.
                </p>

                <div className="grid grid-cols-3 gap-6 max-w-lg pt-5 border-t border-white/15">
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-purple-200">Pending</span>
                    <span className="text-2xl font-extrabold">{pendingCount} <span className="text-xs font-medium text-purple-200">tasks</span></span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-purple-200">In Progress</span>
                    <span className="text-2xl font-extrabold">{inProgressCount} <span className="text-xs font-medium text-purple-200">active</span></span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-purple-200">High Priority</span>
                    <span className="text-2xl font-extrabold">{highPriority} <span className="text-xs font-medium text-purple-200">critical</span></span>
                  </div>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            </div>
          )}

          {/* MAIN SPLIT GRID (Timeline Calendar + Task Feed) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

            {/* TIMELINE / CALENDAR PANEL */}
            {(activeTab === 'dashboard' || activeTab === 'calendar') && (
              <div className="xl:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] shrink-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-1 text-slate-400">
                    <button onClick={prevMonth} className="p-1.5 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition-colors"><FiChevronLeft size={16} /></button>
                    <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition-colors"><FiChevronRight size={16} /></button>
                  </div>
                </div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-5">Sprint Schedule Timeline</p>

                <div className="grid grid-cols-7 mb-3 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="text-[10px] font-extrabold text-slate-400">{d}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-y-2.5 text-center mb-5">
                  {getCalendarDays().slice(0, 28).map((day, idx) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    const hasTasks = tasks.some(t => new Date(t.dueDate).toDateString() === day.toDateString());
                    return (
                      <div key={idx} className="flex flex-col items-center justify-center relative py-0.5">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isToday ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-500/20' :
                          hasTasks ? 'text-[#7C3AED] bg-purple-50 font-extrabold' : 'text-slate-700 hover:bg-slate-100'
                        }`}>
                          {day.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Micro Metric Chip */}
                <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl text-[#7C3AED] shadow-2xs"><FiTrendingUp size={16} /></div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block">Sprint Completion Rate</span>
                    <span className="text-xs font-extrabold text-slate-800">{progressPercent}% On Time Delivery</span>
                  </div>
                </div>
              </div>
            )}

            {/* MAIN TASKS / CONTENT FEED */}
            <div className={`${activeTab === 'dashboard' || activeTab === 'calendar' ? 'xl:col-span-8' : 'xl:col-span-12'} flex flex-col gap-4`}>

              {/* Controls Header */}
              {activeTab !== 'settings' && activeTab !== 'analytics' && (
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-[#F3EEFE] text-[#7C3AED] rounded-xl"><FiCheckSquare size={16} /></span>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {activeTab === 'dashboard' ? 'Recent Tasks (Latest 2)' : 'All Active Tasks'}
                    </h3>
                    <button onClick={() => openModal()} className="ml-2 px-3.5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm shadow-purple-500/20 transition-all hover:scale-[1.02]">
                      <FiPlus size={14} /> New Task
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      Sort:
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer">
                        <option value="newest">Newest First</option>
                        <option value="dueDate">Due Date</option>
                        <option value="priority">Priority</option>
                      </select>
                    </div>

                    <div className="flex bg-slate-100/80 p-1 rounded-xl">
                      {['All', 'Pending', 'In Progress', 'Completed'].map(status => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            filterStatus === status ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER ACTIVE TAB VIEW */}
              {activeTab === 'analytics' ? (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase">Total Tasks</p>
                      <h4 className="text-3xl font-extrabold text-slate-900 mt-2">{statsTotal}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase">Completed</p>
                      <h4 className="text-3xl font-extrabold text-emerald-600 mt-2">{statsCompleted}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase">In Progress</p>
                      <h4 className="text-3xl font-extrabold text-blue-600 mt-2">{inProgressCount}</h4>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
                      <p className="text-[10px] font-extrabold text-rose-400 uppercase">Overdue</p>
                      <h4 className="text-3xl font-extrabold text-rose-600 mt-2">{overdueTasks}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
                      <h3 className="text-sm font-extrabold text-slate-900 mb-6 flex items-center gap-2"><FiActivity className="text-[#7C3AED]"/> Status Breakdown</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5"><span>Pending</span><span>{pendingPct}%</span></div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="bg-slate-400 h-full" style={{width: `${pendingPct}%`}}></div></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5"><span>In Progress</span><span>{inProgressPct}%</span></div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="bg-blue-500 h-full" style={{width: `${inProgressPct}%`}}></div></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5"><span>Completed</span><span>{completedPct}%</span></div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{width: `${completedPct}%`}}></div></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
                      <h3 className="text-sm font-extrabold text-slate-900 mb-6 flex items-center gap-2"><FiTarget className="text-[#7C3AED]"/> Priority Distribution</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5"><span>High Priority</span><span>{highPriority} Tasks</span></div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="bg-rose-500 h-full" style={{width: `${highPct}%`}}></div></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5"><span>Medium Priority</span><span>{mediumPriority} Tasks</span></div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="bg-amber-400 h-full" style={{width: `${mediumPct}%`}}></div></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5"><span>Low Priority</span><span>{lowPriority} Tasks</span></div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{width: `${lowPct}%`}}></div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'settings' ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] max-w-2xl">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100"><FiUser className="text-[#7C3AED]"/> Profile Information</h3>
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-2">Display Name</label>
                      <input type="text" name="name" value={settings.name} onChange={handleSettingChange} className="w-full bg-[#F8FAFC] border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-2">Email Address</label>
                      <input type="email" name="email" value={settings.email} onChange={handleSettingChange} className="w-full bg-[#F8FAFC] border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-2">Job Role</label>
                      <input type="text" name="role" value={settings.role} onChange={handleSettingChange} className="w-full bg-[#F8FAFC] border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <button onClick={handleExportData} className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2"><FiDownload size={14}/> Export Backup</button>
                    <button onClick={handleSaveSettings} className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#7C3AED] rounded-xl shadow-sm">
                      {isSaving ? 'Saved! ✓' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                /* LINEAR TASK CARDS */
                <div className="space-y-3">
                  {(activeTab === 'dashboard' ? processedTasks.slice(0, 2) : processedTasks).length > 0 ?
                    (activeTab === 'dashboard' ? processedTasks.slice(0, 2) : processedTasks).map((task) => {
                    const topBarColor = task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-500';
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';

                    return (
                      <div key={task._id} className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] overflow-hidden group transition-all duration-200 hover:shadow-md hover:border-slate-200">
                        <div className={`w-full h-1 ${topBarColor}`}></div>

                        <div className="p-4">
                          <div className="flex justify-between items-start mb-1.5">
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm mb-0.5 tracking-tight">{task.title}</h4>
                              <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{task.description}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                task.priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>
                                {task.priority === 'High' ? '▲ High' : task.priority}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isOverdue ? 'bg-rose-50 text-rose-600 font-extrabold' : 'text-slate-400'
                              }`}>
                                {isOverdue ? 'Overdue: ' : 'Due '} {new Date(task.dueDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                              </span>
                            </div>
                          </div>

                          {/* Progress Indicator */}
                          <div className="my-2.5">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                              <span>Sprint Progress</span>
                              <span>{task.status === 'Completed' ? 'Completed (100%)' : task.status === 'In Progress' ? 'In Review (50%)' : 'Queue (15%)'}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#7C3AED] h-full rounded-full transition-all duration-500" style={{ width: task.status === 'Completed' ? '100%' : task.status === 'In Progress' ? '50%' : '15%' }}></div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2.5 border-t border-slate-50">
                            <div className="flex bg-slate-100/80 p-0.5 rounded-lg gap-1">
                              <button onClick={() => handleQuickStatusChange(task, 'Pending')} className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition-all ${task.status === 'Pending' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}>Pending</button>
                              <button onClick={() => handleQuickStatusChange(task, 'In Progress')} className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition-all ${task.status === 'In Progress' ? 'bg-[#7C3AED] text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}>In Progress</button>
                              <button onClick={() => handleQuickStatusChange(task, 'Completed')} className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition-all ${task.status === 'Completed' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}>Completed</button>
                            </div>

                            <div className="flex items-center gap-2">
                              {task.createdDate && (
                                <span className="text-[9px] font-bold text-slate-400">
                                  Created: {new Date(task.createdDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                                </span>
                              )}
                              <button onClick={() => openModal(task)} className="p-1.5 text-slate-400 hover:text-[#7C3AED] hover:bg-purple-50 rounded-lg transition-colors"><FiEdit2 size={13}/></button>
                              <button onClick={() => handleDelete(task._id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><FiTrash2 size={13}/></button>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  }) : (
                    <div className="py-14 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                      <FiCheckCircle size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-slate-700 font-extrabold text-sm">No tasks found</p>
                      <p className="text-slate-400 text-xs mt-0.5">Create your first task or change filter parameters.</p>
                      <button onClick={() => openModal()} className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors">
                        Create Task
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      {/* TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-slate-900">{editingId ? 'Edit Task' : 'Create New Task'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-2 hover:bg-slate-50 rounded-full transition-colors"><FiX size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-widest">Task Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-[#F8FAFC] border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7C3AED]" />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-widest">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full bg-[#F8FAFC] border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7C3AED]"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-widest">Due Date</label>
                  <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className="w-full bg-[#F8FAFC] border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7C3AED]" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-widest">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full bg-[#F8FAFC] border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7C3AED]">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-widest">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-[#F8FAFC] border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7C3AED]">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="mt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl shadow-md shadow-purple-500/20 transition-all">
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