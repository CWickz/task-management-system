import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiSearch, FiBell, FiPlus, FiGrid, FiUsers,
  FiFolder, FiSettings, FiCheckSquare, FiMessageSquare,
  FiCalendar, FiDownload, FiEdit2, FiTrash2, FiX,
  FiChevronLeft, FiChevronRight, FiMoon, FiSliders, FiMoreHorizontal
} from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'Medium', status: 'Pending', dueDate: ''
  });

  // Task Count banner state
  const [showBanner, setShowBanner] = useState(true);

  // Fetch Tasks on Load
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

  // Form Handling
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
    }
  };

  // Derived State
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Unique visual avatar assignments based on task index
  const getAvatarStack = (index) => {
    const avatars = [
      "https://randomuser.me/api/portraits/women/1.jpg",
      "https://randomuser.me/api/portraits/men/2.jpg",
      "https://randomuser.me/api/portraits/women/3.jpg",
      "https://randomuser.me/api/portraits/men/4.jpg",
      "https://randomuser.me/api/portraits/women/5.jpg"
    ];
    return [
      avatars[index % avatars.length],
      avatars[(index + 1) % avatars.length],
      avatars[(index + 2) % avatars.length]
    ];
  };

  return (
    <div className="flex h-screen bg-[#F4F6F8] font-sans text-slate-800 p-6 overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-72 bg-white rounded-[2.5rem] p-6 flex flex-col justify-between hidden lg:flex border border-slate-100 shadow-sm mr-6">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8 mt-2 px-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              T
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">TaskMaster.</span>
          </div>

          {/* User Heading */}
          <div className="px-2 mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              Start Your Day<br />& Be Productive ✌️
            </h1>
          </div>

          {/* Menu */}
          <div>
            <p className="text-xs font-bold text-slate-400 tracking-wider mb-4 px-2 uppercase">Menu</p>
            <nav className="space-y-1.5">
              <a href="#" className="flex items-center justify-between px-4 py-3 bg-black text-white rounded-2xl font-bold transition-all shadow-md group">
                <span className="flex items-center gap-3"><FiGrid size={18} /> Dashboard</span>
                <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-lg group-hover:scale-105 transition-transform">↘</span>
              </a>
              <a href="#" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-2xl font-semibold transition-colors">
                <span className="flex items-center gap-3"><FiMessageSquare size={18} /> Messages</span>
                <span className="text-xs font-extrabold bg-[#FF6A55] text-white px-2 py-0.5 rounded-full">+6</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-2xl font-semibold transition-colors">
                <FiCheckSquare size={18} /> My Tasks
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-2xl font-semibold transition-colors">
                <FiUsers size={18} /> Friends
              </a>
              <a href="#" className="flex items-center justify-between px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-2xl font-semibold transition-colors">
                <span className="flex items-center gap-3"><FiCalendar size={18} /> Calendar</span>
                <span className="text-xs font-extrabold bg-orange-400 text-white px-2 py-0.5 rounded-full">+2</span>
              </a>
            </nav>
          </div>

          {/* Avatar Pool Stack */}
          <div className="mt-8 px-2 flex items-center gap-2">
            <div className="flex -space-x-2">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
              <img src="https://randomuser.me/api/portraits/men/85.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
              <img src="https://randomuser.me/api/portraits/women/21.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">10+</span>
          </div>
        </div>

        {/* Michie Chat Card Component */}
        <div className="bg-[#F8F9FA] p-4 rounded-[1.8rem] border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">Michie ✌️ <span className="text-xs text-orange-500 font-semibold">+2</span></span>
            <button className="text-slate-400"><FiMoreHorizontal size={14} /></button>
          </div>
          <div className="space-y-2">
            <div className="bg-white p-2.5 rounded-2xl text-xs text-slate-600 shadow-sm border border-slate-100">
              Morning 👋<br />Today we will move on to the wireframe process.
            </div>
            <div className="bg-[#00D0B6]/15 text-[#008977] p-2 rounded-xl text-right text-xs font-bold w-fit ml-auto flex items-center gap-1">
              <span>Okay Michie 👍</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* TOP NAVBAR */}
        <header className="flex justify-between items-center mb-6 shrink-0">
          {/* Search bar styling */}
          <div className="flex items-center bg-white rounded-2xl px-4 py-2.5 border border-slate-100 shadow-sm flex-1 max-w-xl">
            <FiSearch className="text-slate-400 mr-3" size={18} />
            <input
              type="text"
              placeholder="Start searching here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 font-medium placeholder-slate-400"
            />
            <button className="text-slate-400 hover:text-slate-600 pl-2 border-l border-slate-100 ml-2">
              <FiSliders size={18} />
            </button>
          </div>

          {/* Notification / Profile Tray */}
          <div className="flex items-center gap-4">
            <button className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl border border-slate-100 shadow-sm transition-colors">
              <FiMoon size={18} />
            </button>
            <button className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl border border-slate-100 shadow-sm relative transition-colors">
              <FiBell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
            </button>
            <button className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl border border-slate-100 shadow-sm transition-colors">
              <FiSettings size={18} />
            </button>
            <div className="flex items-center gap-3 bg-white pl-3 pr-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
              <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=KimSoMen" alt="Avatar" className="w-9 h-9 rounded-xl bg-orange-100" />
              <div className="text-left hidden md:block">
                <p className="text-xs font-extrabold text-slate-900 leading-none">Kim So Men</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">UI/UX Designer</p>
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE INTERACTIVE GRID */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

            {/* TODAY'S TASKS LIST - 2/3 width */}
            <div className="xl:col-span-2 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between">

              {/* Header with quick Filter Tabs */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <FiCheckSquare className="text-slate-800" size={22} />
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Today Tasks</h2>
                  <button onClick={() => openModal()} className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors ml-1">
                    <FiPlus size={16} />
                  </button>
                </div>

                <div className="flex bg-[#F4F6F8] p-1 rounded-xl w-full sm:w-auto">
                  {['All', 'Pending', 'In Progress', 'Completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filterStatus === status ? 'bg-black text-white shadow' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Task cards mapping */}
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {filteredTasks.length > 0 ? filteredTasks.map((task, idx) => (
                  <div key={task._id} className="group relative bg-[#F8F9FA] hover:bg-white border hover:border-slate-200 border-transparent p-5 rounded-[1.8rem] transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${task.priority === 'High' ? 'bg-[#FF6A55]' : task.priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                          <h3 className="font-extrabold text-slate-800 leading-tight">{task.title}</h3>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 pr-6">{task.description}</p>
                      </div>

                      {/* Action trigger overlay / Dots */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => openModal(task)} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiEdit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(task._id)} className="p-1.5 text-slate-400 hover:text-[#FF6A55] hover:bg-[#FF6A55]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiTrash2 size={13} />
                        </button>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          task.status === 'Completed' ? 'bg-[#00D0B6]/15 text-[#008977]' :
                          task.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>

                    {/* Meta info & Progress Bar */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <FiCalendar size={12} />
                        <span className="text-[10px] font-bold">Due: {new Date(task.dueDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1 max-w-[200px] ml-4">
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${task.status === 'Completed' ? 'bg-[#00D0B6] w-full' : task.status === 'In Progress' ? 'bg-indigo-600 w-1/2' : 'bg-amber-400 w-1/12'}`} />
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-400">
                          {task.status === 'Completed' ? '100%' : task.status === 'In Progress' ? '50%' : '5%'}
                        </span>
                      </div>
                      <div className="flex -space-x-1.5 ml-3">
                        {getAvatarStack(idx).map((av, avIdx) => (
                          <img key={avIdx} src={av} alt="Team" className="w-6 h-6 rounded-full border border-white" />
                        ))}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <p className="text-slate-400 font-bold text-sm">No tasks listed today. Try adding one! ✌️</p>
                  </div>
                )}
              </div>

              {/* Action Banner */}
              {showBanner && (
                <div className="bg-black text-white p-4 rounded-[1.5rem] mt-6 flex justify-between items-center transition-all">
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <span className="text-lg">💬</span>
                    <p>You have {pendingCount + inProgressCount} tasks today. Keep it up! 💪</p>
                  </div>
                  <button onClick={() => setShowBanner(false)} className="text-white/40 hover:text-white p-1">
                    <FiX size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* HIGH-FIDELITY CALENDAR CARD - 1/3 width */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-full">
              <div className="flex justify-between items-center mb-5">
                <span className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <FiCalendar size={18} className="text-slate-400" /> Calendar
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">October 2026 ▾</span>
              </div>

              {/* Day Headings */}
              <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-3 gap-y-3">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>

                {/* Visual day grid mapping with stylized markers */}
                {Array.from({length: 31}, (_, i) => i + 1).map(day => {
                  const isMarkedActive = [9, 14, 16, 23, 28].includes(day);
                  const isDeadlined = [10, 16, 25].includes(day);
                  return (
                    <div key={day} className="flex justify-center items-center py-1 relative">
                      <span className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full cursor-pointer transition-colors
                        ${isMarkedActive ? 'bg-[#00D0B6] text-white' : ''}
                        ${isDeadlined && !isMarkedActive ? 'bg-[#FF6A55] text-white' : ''}
                        ${!isMarkedActive && !isDeadlined ? 'hover:bg-slate-100 text-slate-800' : ''}`}>
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* LOWER ANALYTICS ROW (Task Progress & Timeline) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">

            {/* Task Progress (Vertical Graph visual representation) */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <span className="font-extrabold text-base text-slate-900">Task Progress</span>
                <button className="text-slate-400"><FiMoreHorizontal size={18} /></button>
              </div>
              <div className="flex items-end justify-between px-4 py-2 flex-1 min-h-[140px] relative">

                {/* 12th Bar */}
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[10px] font-bold text-[#00D0B6] bg-[#00D0B6]/15 px-1.5 py-0.5 rounded-md mb-2">+8%</span>
                  <div className="h-20 w-8 bg-[#F4F6F8] rounded-2xl relative overflow-hidden flex flex-col justify-end">
                    <div className="h-10 w-full bg-slate-300 rounded-b-2xl"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 mt-2">12</span>
                </div>

                {/* 13th Bar */}
                <div className="flex flex-col items-center flex-1">
                  <div className="h-16 w-8 bg-[#F4F6F8] rounded-2xl relative overflow-hidden flex flex-col justify-end">
                    <div className="h-4 w-full bg-slate-900 rounded-b-2xl"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 mt-2">13</span>
                </div>

                {/* 14th Bar */}
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[10px] font-bold text-[#FF6A55] bg-[#FF6A55]/15 px-1.5 py-0.5 rounded-md mb-2">+12%</span>
                  <div className="h-24 w-8 bg-[#F4F6F8] rounded-2xl relative overflow-hidden flex flex-col justify-end">
                    <div className="h-14 w-full bg-[#FF6A55] rounded-b-2xl"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 mt-2">14</span>
                </div>

                {/* 15th Bar */}
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[10px] font-bold text-[#00D0B6] bg-[#00D0B6]/15 px-1.5 py-0.5 rounded-md mb-2">+5%</span>
                  <div className="h-20 w-8 bg-[#F4F6F8] rounded-2xl relative overflow-hidden flex flex-col justify-end">
                    <div className="h-8 w-full bg-slate-300 rounded-b-2xl"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 mt-2">15</span>
                </div>

                {/* 16th Bar (Highlighted) */}
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[10px] font-bold text-white bg-black px-1.5 py-0.5 rounded-md mb-2">65%</span>
                  <div className="h-28 w-10 bg-black rounded-3xl flex flex-col justify-between p-1 items-center relative">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A55] mt-1"></span>
                    <span className="text-[10px] font-extrabold text-white bg-[#FF6A55] rounded-full px-1 py-0.5 mb-1 scale-90">+8%</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-2">16</span>
                </div>

                {/* 17th Bar */}
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[10px] font-bold text-[#00D0B6] bg-[#00D0B6]/15 px-1.5 py-0.5 rounded-md mb-2">+6%</span>
                  <div className="h-20 w-8 bg-[#F4F6F8] rounded-2xl relative overflow-hidden flex flex-col justify-end">
                    <div className="h-12 w-full bg-[#00D0B6] rounded-b-2xl"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 mt-2">17</span>
                </div>

                {/* 18th Bar */}
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[10px] font-bold text-[#FF6A55] bg-[#FF6A55]/15 px-1.5 py-0.5 rounded-md mb-2">+10%</span>
                  <div className="h-20 w-8 bg-[#F4F6F8] rounded-2xl relative overflow-hidden flex flex-col justify-end">
                    <div className="h-4 w-full bg-slate-300 rounded-b-2xl"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 mt-2">18</span>
                </div>

              </div>
            </div>

            {/* Task Timeline Graphic (horizontal progress indicator) */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <span className="font-extrabold text-base text-slate-900">Task Timeline</span>
                <button className="text-slate-400"><FiMoreHorizontal size={18} /></button>
              </div>

              <div className="relative flex-1 flex flex-col gap-3 min-h-[140px] pl-4">
                {/* Timeline background dashes */}
                <div className="absolute inset-y-0 left-12 right-0 flex justify-between pointer-events-none opacity-10">
                  <div className="border-l border-dashed border-slate-800 h-full"></div>
                  <div className="border-l border-dashed border-slate-800 h-full"></div>
                  <div className="border-l border-dashed border-slate-800 h-full"></div>
                  <div className="border-l border-dashed border-slate-800 h-full"></div>
                  <div className="border-l border-dashed border-slate-800 h-full"></div>
                </div>

                {/* Visual Task Timeline Horizontal bars */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-extrabold text-slate-400 w-8">12</span>
                  <div className="bg-[#FF6A55] text-white px-4 py-2 rounded-2xl text-xs font-bold w-1/3">Interview</div>
                </div>
                <div className="flex items-center gap-4 pl-8">
                  <span className="text-xs font-extrabold text-slate-400 w-8">13-15</span>
                  <div className="bg-[#00D0B6] text-white px-4 py-2 rounded-2xl text-xs font-bold w-1/2">Ideate</div>
                </div>
                <div className="flex items-center gap-4 pl-12">
                  <span className="text-xs font-extrabold text-slate-400 w-8">15-16</span>
                  <div className="bg-[#5C71F7] text-white px-4 py-2 rounded-2xl text-xs font-bold w-1/4">Wireframe</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-extrabold text-slate-400 w-8">16-18</span>
                  <div className="bg-black text-white px-4 py-2 rounded-2xl text-xs font-bold w-1/2">Evaluate</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* CUSTOM HEAVILY ROUNDED POPUP MODAL (TaskMaster theme) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{editingId ? 'Edit Task ✍️' : 'New Task 🚀'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full"><FiX size={18}/></button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Task Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-[#F4F6F8] p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm font-semibold border-transparent" placeholder="e.g. Upgrade Redis Cluster" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full bg-[#F4F6F8] p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 text-sm font-semibold border-transparent" placeholder="Describe this mission..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Due Date</label>
                  <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className="w-full bg-[#F4F6F8] p-3 rounded-2xl focus:outline-none text-sm font-bold border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full bg-[#F4F6F8] p-3 rounded-2xl focus:outline-none text-sm font-bold border-transparent">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-[#F4F6F8] p-3 rounded-2xl focus:outline-none text-sm font-bold border-transparent">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="mt-4 flex gap-3 border-t border-slate-100 pt-5 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 text-sm font-extrabold text-white bg-black hover:bg-black/95 rounded-2xl shadow-md hover:scale-[1.02] active:scale-100 transition-all">
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