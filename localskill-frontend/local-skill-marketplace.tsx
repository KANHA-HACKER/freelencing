import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Users, Briefcase, LogIn, LogOut, Eye, EyeOff, Mail, Phone } from 'lucide-react';

const LocalSkillMarketplace = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [authMode, setAuthMode] = useState('login');
  const [userType, setUserType] = useState('client');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    city: '',
    skill: '',
    experience: ''
  });

  const [serviceForm, setServiceForm] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    deliveryTime: '',
    features: ''
  });

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Bhopal'];
  const categories = ['Web Development', 'Graphic Design', 'Digital Marketing', 'Content Writing', 'Photography', 'Tutoring'];

  const freelancers = [
    { id: 1, name: 'Rahul Sharma', skill: 'Web Development', city: 'Mumbai', rating: 4.8, projects: 23, image: '👨‍💻', email: 'rahul@example.com', phone: '+91 98765 43210' },
    { id: 2, name: 'Priya Patel', skill: 'Graphic Design', city: 'Bangalore', rating: 4.9, projects: 45, image: '👩‍🎨', email: 'priya@example.com', phone: '+91 98765 43211' },
    { id: 3, name: 'Amit Kumar', skill: 'Digital Marketing', city: 'Delhi', rating: 4.7, projects: 31, image: '👨‍💼', email: 'amit@example.com', phone: '+91 98765 43212' }
  ];

  const filteredFreelancers = freelancers.filter(f => {
    const matchesCity = !selectedCity || f.city === selectedCity;
    const matchesCategory = !selectedCategory || f.skill === selectedCategory;
    return matchesCity && matchesCategory;
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('localskill_user');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    
    const storedServices = localStorage.getItem('localskill_services');
    if (storedServices) setServices(JSON.parse(storedServices));
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAuth = (e) => {
    if (e) e.preventDefault();
    
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    if (authMode === 'signup') {
      if (!formData.fullName || !formData.phone || !formData.city) {
        setError('Please fill all required fields');
        setIsLoading(false);
        return;
      }
      
      if (userType === 'freelancer' && (!formData.skill || !formData.experience)) {
        setError('Freelancers must provide skill and experience');
        setIsLoading(false);
        return;
      }
    }

    setTimeout(() => {
      if (authMode === 'login') {
        const existingUsers = JSON.parse(localStorage.getItem('localskill_users') || '[]');
        const user = existingUsers.find(u => u.email === formData.email && u.password === formData.password);
        
        if (user) {
          const userData = { ...user };
          delete userData.password;
          setCurrentUser(userData);
          localStorage.setItem('localskill_user', JSON.stringify(userData));
          setSuccess('Login successful!');
          setTimeout(() => {
            setShowAuthModal(false);
            setActiveTab('browse');
            setFormData({ email: '', password: '', fullName: '', phone: '', city: '', skill: '', experience: '' });
          }, 1000);
        } else {
          setError('Invalid email or password');
        }
      } else {
        const existingUsers = JSON.parse(localStorage.getItem('localskill_users') || '[]');
        const userExists = existingUsers.some(u => u.email === formData.email);
        
        if (userExists) {
          setError('User already exists with this email');
        } else {
          const newUser = {
            id: Date.now(),
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            phone: formData.phone,
            city: formData.city,
            userType: userType,
            skill: formData.skill || 'N/A',
            experience: formData.experience || 'N/A'
          };
          
          existingUsers.push(newUser);
          localStorage.setItem('localskill_users', JSON.stringify(existingUsers));
          
          const userData = { ...newUser };
          delete userData.password;
          setCurrentUser(userData);
          localStorage.setItem('localskill_user', JSON.stringify(userData));
          
          setSuccess('Account created successfully!');
          setTimeout(() => {
            setShowAuthModal(false);
            setActiveTab('browse');
            setFormData({ email: '', password: '', fullName: '', phone: '', city: '', skill: '', experience: '' });
          }, 1000);
        }
      }
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('localskill_user');
    setActiveTab('home');
  };

  const handleServiceFormChange = (e) => {
    setServiceForm({ ...serviceForm, [e.target.name]: e.target.value });
  };

  const handleAddService = () => {
    setError('');
    setSuccess('');

    if (!serviceForm.title || !serviceForm.category || !serviceForm.description || !serviceForm.price || !serviceForm.deliveryTime) {
      setError('Please fill all required fields');
      return;
    }

    const newService = {
      id: editingService ? editingService.id : Date.now(),
      ...serviceForm,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userCity: currentUser.city,
      createdAt: editingService ? editingService.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedServices;
    if (editingService) {
      updatedServices = services.map(s => s.id === editingService.id ? newService : s);
      setSuccess('Service updated successfully!');
    } else {
      updatedServices = [...services, newService];
      setSuccess('Service added successfully!');
    }

    setServices(updatedServices);
    localStorage.setItem('localskill_services', JSON.stringify(updatedServices));
    
    setServiceForm({ title: '', category: '', description: '', price: '', deliveryTime: '', features: '' });
    setEditingService(null);
    
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      category: service.category,
      description: service.description,
      price: service.price,
      deliveryTime: service.deliveryTime,
      features: service.features
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteService = (serviceId) => {
    const updatedServices = services.filter(s => s.id !== serviceId);
    setServices(updatedServices);
    localStorage.setItem('localskill_services', JSON.stringify(updatedServices));
    setSuccess('Service deleted successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setServiceForm({ title: '', category: '', description: '', price: '', deliveryTime: '', features: '' });
    setError('');
  };

  const AuthModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button onClick={() => setShowAuthModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>

          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => { setAuthMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 rounded-lg font-medium transition ${authMode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 rounded-lg font-medium transition ${authMode === 'signup' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
            >
              Sign Up
            </button>
          </div>

          {authMode === 'signup' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUserType('client')}
                  className={`flex-1 py-3 rounded-lg font-medium transition border-2 ${userType === 'client' ? 'bg-blue-50 border-blue-600 text-blue-600' : 'border-gray-300 text-gray-600'}`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('freelancer')}
                  className={`flex-1 py-3 rounded-lg font-medium transition border-2 ${userType === 'freelancer' ? 'bg-purple-50 border-purple-600 text-purple-600' : 'border-gray-300 text-gray-600'}`}
                >
                  Freelancer
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          <div className="space-y-4">
            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                </div>

                {userType === 'freelancer' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Skill *</label>
                      <select
                        name="skill"
                        value={formData.skill}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select skill</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years) *</label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 3"
                        min="0"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAuth}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : (authMode === 'login' ? 'Login' : 'Create Account')}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            {authMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button onClick={() => { setAuthMode('signup'); setError(''); }} className="text-blue-600 font-semibold">
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button onClick={() => { setAuthMode('login'); setError(''); }} className="text-blue-600 font-semibold">
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {showAuthModal && <AuthModal />}

      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
                <Briefcase className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">LocalSkill</h1>
            </div>
            
            <nav className="hidden md:flex gap-6">
              <button onClick={() => setActiveTab('home')} className={`font-medium ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-600'}`}>
                Home
              </button>
              <button onClick={() => setActiveTab('browse')} className={`font-medium ${activeTab === 'browse' ? 'text-blue-600' : 'text-gray-600'}`}>
                Browse
              </button>
              {currentUser && currentUser.userType === 'freelancer' && (
                <button onClick={() => setActiveTab('myservices')} className={`font-medium ${activeTab === 'myservices' ? 'text-blue-600' : 'text-gray-600'}`}>
                  My Services
                </button>
              )}
            </nav>
            
            <div className="flex gap-3 items-center">
              {currentUser ? (
                <>
                  <span className="px-4 py-2 text-sm text-gray-700 bg-green-50 rounded-lg">Hi, <strong>{currentUser.fullName}</strong>!</span>
                  <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    <LogOut className="w-4 h-4 inline mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <LogIn className="w-4 h-4 inline mr-1" />
                    Login
                  </button>
                  <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'home' && (
          <div className="space-y-12">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12 text-center">
              <h1 className="text-5xl font-bold mb-4">LocalSkill Marketplace</h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Connect with skilled professionals in your city. Support local talent, build community.
              </p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => currentUser ? setActiveTab('browse') : setShowAuthModal(true)} className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50">
                  Find Talent
                </button>
                <button onClick={() => { setAuthMode('signup'); setUserType('freelancer'); setShowAuthModal(true); }} className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900">
                  Offer Skills
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold">2,500+</div>
                <div className="text-gray-600">Freelancers</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Briefcase className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold">5,200+</div>
                <div className="text-gray-600">Projects</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <MapPin className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <div className="text-3xl font-bold">50+</div>
                <div className="text-gray-600">Cities</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <Star className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                <div className="text-3xl font-bold">94%</div>
                <div className="text-gray-600">Success</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-red-50 p-8 rounded-xl border-2 border-red-200">
                <h3 className="text-2xl font-bold text-red-900 mb-4">The Problem</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start"><span className="text-red-500 mr-2">•</span><span>Local skilled professionals lack visibility</span></li>
                  <li className="flex items-start"><span className="text-red-500 mr-2">•</span><span>Global platforms too competitive for local hiring</span></li>
                  <li className="flex items-start"><span className="text-red-500 mr-2">•</span><span>Hard to find trusted nearby service providers</span></li>
                </ul>
              </div>

              <div className="bg-green-50 p-8 rounded-xl border-2 border-green-200">
                <h3 className="text-2xl font-bold text-green-900 mb-4">Our Solution</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span>City-based marketplace for local talent</span></li>
                  <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span>Easy profile creation and skill showcase</span></li>
                  <li className="flex items-start"><span className="text-green-500 mr-2">✓</span><span>Smart filtering and community building</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'browse' && (
          currentUser ? (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Find Local Talent</h2>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full p-3 border rounded-lg">
                      <option value="">All Cities</option>
                      {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full p-3 border rounded-lg">
                      <option value="">All Categories</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {filteredFreelancers.map(f => (
                  <div key={f.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-20"></div>
                    <div className="p-6 -mt-10">
                      <div className="text-5xl text-center mb-3">{f.image}</div>
                      <h3 className="text-xl font-bold text-center">{f.name}</h3>
                      <p className="text-sm text-gray-600 text-center mb-3">{f.skill}</p>
                      <div className="flex justify-center gap-3 mb-3 text-sm">
                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{f.city}</span>
                        <span className="flex items-center"><Star className="w-4 h-4 mr-1 fill-yellow-500 text-yellow-500" />{f.rating}</span>
                      </div>
                      <div className="text-sm text-center mb-3">{f.projects} projects</div>
                      <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg mb-3">
                        <div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-blue-600" />{f.email}</div>
                        <div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-green-600" />{f.phone}</div>
                      </div>
                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Contact</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-blue-50 rounded-2xl p-12 max-w-2xl mx-auto">
                <LogIn className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">Login Required</h2>
                <p className="text-gray-600 mb-6">Please login to browse freelancers</p>
                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
                  Login / Sign Up
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'myservices' && currentUser && currentUser.userType === 'freelancer' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">My Services</h2>
              <div className="text-sm bg-purple-50 px-4 py-2 rounded-lg">
                <strong>{services.filter(s => s.userId === currentUser.id).length}</strong> Services Listed
              </div>
            </div>

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {success}
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-blue-200">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                {editingService ? '✏️ Edit Service' : '➕ Add New Service'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={serviceForm.title}
                    onChange={handleServiceFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., I will create a professional website for your business"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      name="category"
                      value={serviceForm.category}
                      onChange={handleServiceFormChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={serviceForm.price}
                      onChange={handleServiceFormChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 5000"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time *</label>
                  <select
                    name="deliveryTime"
                    value={serviceForm.deliveryTime}
                    onChange={handleServiceFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select delivery time</option>
                    <option value="1 day">1 day</option>
                    <option value="2 days">2 days</option>
                    <option value="3 days">3 days</option>
                    <option value="5 days">5 days</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="1 month">1 month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={serviceForm.description}
                    onChange={handleServiceFormChange}
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your service in detail..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What's Included (one per line)</label>
                  <textarea
                    name="features"
                    value={serviceForm.features}
                    onChange={handleServiceFormChange}
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Responsive Design&#10;SEO Optimization&#10;3 Revisions&#10;Source Code"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">Enter each feature on a new line</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold"
                  >
                    {editingService ? 'Update Service' : 'Add Service'}
                  </button>
                  {editingService && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">Your Listed Services</h3>
              {services.filter(s => s.userId === currentUser.id).length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-12 text-center">
                  <p className="text-gray-500 text-lg">No services listed yet. Add your first service above!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {services.filter(s => s.userId === currentUser.id).map(service => (
                    <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                        <h4 className="text-white font-bold text-lg">{service.title}</h4>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {service.category}
                          </span>
                          <span className="text-2xl font-bold text-green-600">₹{service.price}</span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{service.description}</p>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <span className="mr-4">⏱️ {service.deliveryTime}</span>
                          <span>📍 {service.userCity}</span>
                        </div>

                        {service.features && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Includes:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {service.features.split('\n').filter(f => f.trim()).slice(0, 3).map((feature, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-green-500 mr-2">✓</span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditService(service)}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LocalSkillMarketplace;