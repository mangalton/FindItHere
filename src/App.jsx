// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';

// // --- Configuration for API endpoints ---
// const AUTH_API_URL = 'http://localhost:5001';
// const ITEM_API_URL = 'http://localhost:5002';

// // --- SVG Icons ---
// const SearchIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
//         <circle cx="11" cy="11" r="8"></circle>
//         <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
//     </svg>
// );

// const FilterIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
//         <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path>
//     </svg>
// );

// // --- Main App Component ---
// export default function App() {
//     // --- State Management ---
//     const [currentUser, setCurrentUser] = useState(null);
//     const [items, setItems] = useState([]);
//     const [activeModal, setActiveModal] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState('');

//     // --- Search & Filter State ---
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterCategory, setFilterCategory] = useState('All');
//     const [filterType, setFilterType] = useState('All');

//     // --- Data & Constants ---
//     const categories = ['Electronics', 'Books', 'Clothing', 'ID Cards', 'Keys', 'Wallets', 'Other'];

//     // --- Effects ---
//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         const user = localStorage.getItem('user');
//         if (token && user) {
//             setCurrentUser(JSON.parse(user));
//             axios.defaults.headers.common['x-auth-token'] = token;
//         }
//         setIsLoading(false);
//     }, []);

//     useEffect(() => {
//         if (currentUser) {
//             const fetchItems = async () => {
//                 try {
//                     const response = await axios.get(`${ITEM_API_URL}/items`);
//                     setItems(response.data);
//                 } catch (err) {
//                     console.error("Error fetching items:", err);
//                     setError('Could not fetch items. Please try again later.');
//                     if (err.response && (err.response.status === 401 || err.response.status === 403)) {
//                         handleLogout();
//                     }
//                 }
//             };
//             fetchItems();
//         } else {
//             setItems([]);
//         }
//     }, [currentUser]);

//     // --- Memoized Filtering ---
//     const filteredItems = useMemo(() => {
//         return items.filter(item => {
//             const matchesSearchTerm = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase());
//             const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
//             const matchesType = filterType === 'All' || item.type === filterType;
//             return matchesSearchTerm && matchesCategory && matchesType;
//         });
//     }, [items, searchTerm, filterCategory, filterType]);

//     // --- API Handlers ---
//     const handleRegister = async (userData) => {
//         try {
//             setError('');
//             const response = await axios.post(`${AUTH_API_URL}/register`, userData);
//             const { token, user } = response.data;
//             localStorage.setItem('token', token);
//             localStorage.setItem('user', JSON.stringify(user));
//             axios.defaults.headers.common['x-auth-token'] = token;
//             setCurrentUser(user);
//             setActiveModal(null);
//         } catch (err) {
//             setError(err.response?.data?.message || 'Registration failed. Please try again.');
//         }
//     };

//     const handleLogin = async (credentials) => {
//         try {
//             setError('');
//             const response = await axios.post(`${AUTH_API_URL}/login`, credentials);
//             const { token, user } = response.data;
//             localStorage.setItem('token', token);
//             localStorage.setItem('user', JSON.stringify(user));
//             axios.defaults.headers.common['x-auth-token'] = token;
//             setCurrentUser(user);
//             setActiveModal(null);
//         } catch (err) {
//             setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
//         }
//     };

//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         delete axios.defaults.headers.common['x-auth-token'];
//         setCurrentUser(null);
//         setError('');
//     };

//     const handleAddItem = async (itemData) => {
//         const formData = new FormData();
//         Object.keys(itemData).forEach(key => formData.append(key, itemData[key]));

//         try {
//             setError('');
//             const response = await axios.post(`${ITEM_API_URL}/items`, formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });
//             setItems([response.data, ...items]);
//             setActiveModal(null);
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to add item. Please try again.');
//         }
//     };
    
//     const clearError = () => setError('');
//     const openModal = (modalName) => {
//         clearError();
//         setActiveModal(modalName);
//     }

//     if (isLoading) {
//         return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><p>Loading...</p></div>
//     }

//     return (
//         <div className="bg-slate-50 min-h-screen font-sans text-gray-900">
//             <Header currentUser={currentUser} onLoginClick={() => openModal('login')} onRegisterClick={() => openModal('register')} onLogout={handleLogout} />
//             <main className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mx-auto max-w-7xl">
//                 {!currentUser ? (
//                     <WelcomeSplash onGetStarted={() => openModal('register')} />
//                 ) : (
//                     <ItemList
//                         items={filteredItems}
//                         categories={categories}
//                         searchTerm={searchTerm}
//                         setSearchTerm={setSearchTerm}
//                         filterCategory={filterCategory}
//                         setFilterCategory={setFilterCategory}
//                         filterType={filterType}
//                         setFilterType={setFilterType}
//                         onReportItemClick={() => openModal('report')}
//                     />
//                 )}
//             </main>
//             {activeModal === 'report' && <ReportItemModal onClose={() => setActiveModal(null)} onAddItem={handleAddItem} categories={categories} error={error} />}
//             {activeModal === 'login' && <LoginModal onClose={() => setActiveModal(null)} onSwitchToRegister={() => openModal('register')} onLogin={handleLogin} error={error} />}
//             {activeModal === 'register' && <RegisterModal onClose={() => setActiveModal(null)} onSwitchToLogin={() => openModal('login')} onRegister={handleRegister} error={error} />}
//         </div>
//     );
// }

// // --- Sub-Components ---

// const Header = ({ currentUser, onLoginClick, onRegisterClick, onLogout }) => (
//     <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30">
//         <nav className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
//             <div className="flex justify-between items-center h-16">
//                 <a href="#" className="text-xl font-bold tracking-tight">FindItHere</a>
//                 <div>
//                     {currentUser ? (
//                         <div className="flex items-center gap-4">
//                             <span className="text-sm text-slate-600 hidden sm:block">Welcome, {currentUser.name}</span>
//                             <button onClick={onLogout} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Logout</button>
//                         </div>
//                     ) : (
//                         <div className="flex items-center gap-2">
//                             <button onClick={onLoginClick} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Sign In</button>
//                             <button onClick={onRegisterClick} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Sign Up</button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </nav>
//     </header>
// );

// const WelcomeSplash = ({ onGetStarted }) => (
//     <div className="text-center py-24 sm:py-32 lg:py-40">
//         <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">Find it here.</h1>
//         <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">The central hub for all lost and found items on campus. Sign in to start connecting.</p>
//         <div className="mt-10">
//             <button onClick={onGetStarted} className="px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg shadow-blue-500/20">
//                 Get Started
//             </button>
//         </div>
//     </div>
// );

// const ItemList = ({ items, categories, searchTerm, setSearchTerm, filterCategory, setFilterCategory, filterType, setFilterType, onReportItemClick }) => (
//     <div>
//         <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
//             <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
//             <button onClick={onReportItemClick} className="w-full md:w-auto px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
//                 Report an Item
//             </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-white/70 backdrop-blur-xl rounded-xl border border-slate-200">
//             <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
//                 <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
//             </div>
//             <div className="relative">
//                 <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full appearance-none bg-white pl-4 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
//                     <option value="All">All Categories</option>
//                     {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//                 </select>
//                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><FilterIcon /></div>
//             </div>
//             <div className="relative">
//                 <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full appearance-none bg-white pl-4 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
//                     <option value="All">All Types</option>
//                     <option value="Lost">Lost</option>
//                     <option value="Found">Found</option>
//                 </select>
//                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><FilterIcon /></div>
//             </div>
//         </div>

//         {items.length > 0 ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {items.map(item => <ItemCard key={item._id} item={item} />)}
//             </div>
//         ) : (
//             <div className="text-center py-20 px-6 bg-white rounded-xl border border-slate-200">
//                 <h3 className="text-xl font-medium">No items found</h3>
//                 <p className="mt-2 text-slate-500">Try adjusting your search filters or be the first to report an item!</p>
//             </div>
//         )}
//     </div>
// );

// const ItemCard = ({ item }) => {
//     const itemTypeColor = item.type === 'Lost' ? 'border-red-500' : 'border-emerald-500';
//     const imageUrl = item.imageUrl ? `${ITEM_API_URL}${item.imageUrl}` : 'https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Image';
    
//     return (
//         <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
//              <div className="w-full h-48 bg-slate-200">
//                 <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Image' }}/>
//             </div>
//             <div className={`p-5 border-t-4 ${itemTypeColor} flex-grow flex flex-col`}>
//                 <div className="flex-grow">
//                     <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{item.category}</p>
//                     <h3 className="text-lg font-semibold mt-1">{item.name}</h3>
//                     <p className="text-sm text-slate-600 mt-2 line-clamp-3 h-[60px]">{item.description}</p>
//                 </div>
//                  <div className="mt-4 pt-4 border-t border-slate-100">
//                     <p className={`text-sm font-bold ${item.type === 'Lost' ? 'text-red-600' : 'text-emerald-600'}`}>{item.type} Item</p>
//                     <p className="text-xs text-slate-500 mt-1">Reported: {new Date(item.dateReported).toLocaleDateString()}</p>
//                  </div>
//             </div>
//         </div>
//     );
// };

// // --- Modal Components ---

// const ModalWrapper = ({ children, onClose, title }) => (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={onClose}>
//         <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto" onClick={e => e.stopPropagation()}>
//             <div className="p-8">
//                 <div className="flex justify-between items-start mb-6">
//                     <h3 className="text-2xl font-bold">{title}</h3>
//                     <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl leading-none">&times;</button>
//                 </div>
//                 {children}
//             </div>
//         </div>
//     </div>
// );

// const FormInput = ({ label, type, value, onChange, required=true }) => (
//     <div>
//         <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
//         <input type={type} value={value} onChange={onChange} required={required} className="block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
//     </div>
// );

// const FormButton = ({ children, type="submit" }) => (
//     <button type={type} className="w-full py-3 px-4 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300">
//         {children}
//     </button>
// );

// const SwitchFormText = ({ children, buttonText, onSwitch }) => (
//     <p className="text-sm text-center text-slate-600">
//         {children} <button type="button" onClick={onSwitch} className="font-medium text-blue-600 hover:underline">{buttonText}</button>
//     </p>
// );

// const ErrorMessage = ({ error }) => {
//     if (!error) return null;
//     return <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center">{error}</p>
// };

// const LoginModal = ({ onClose, onSwitchToRegister, onLogin, error }) => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         onLogin({ email, password });
//     };

//     return (
//         <ModalWrapper onClose={onClose} title="Welcome Back">
//             <form onSubmit={handleSubmit} className="space-y-6">
//                 <ErrorMessage error={error} />
//                 <FormInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
//                 <FormInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
//                 <FormButton>Sign In</FormButton>
//                 <SwitchFormText onSwitch={onSwitchToRegister} buttonText="Create one">
//                     Don't have an account?
//                 </SwitchFormText>
//             </form>
//         </ModalWrapper>
//     );
// };

// const RegisterModal = ({ onClose, onSwitchToLogin, onRegister, error }) => {
//     const [name, setName] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         onRegister({ name, email, password });
//     };

//     return (
//         <ModalWrapper onClose={onClose} title="Create Account">
//             <form onSubmit={handleSubmit} className="space-y-6">
//                 <ErrorMessage error={error} />
//                 <FormInput label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} />
//                 <FormInput label="College Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
//                 <FormInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
//                 <FormButton>Create Account</FormButton>
//                 <SwitchFormText onSwitch={onSwitchToLogin} buttonText="Sign In">
//                     Already have an account?
//                 </SwitchFormText>
//             </form>
//         </ModalWrapper>
//     );
// };

// const ReportItemModal = ({ onClose, onAddItem, categories, error }) => {
//     const [name, setName] = useState('');
//     const [description, setDescription] = useState('');
//     const [category, setCategory] = useState(categories[0]);
//     const [type, setType] = useState('Found');
//     const [image, setImage] = useState(null);

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         onAddItem({ name, description, category, type, image });
//     };

//     return (
//         <ModalWrapper onClose={onClose} title="Report an Item">
//             <form onSubmit={handleSubmit} className="space-y-6">
//                 <ErrorMessage error={error} />
//                 <div className="grid grid-cols-2 gap-4 p-2 bg-slate-100 rounded-lg">
//                     <label className={`flex items-center justify-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${type === 'Found' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}>
//                         <input type="radio" name="type" value="Found" checked={type === 'Found'} onChange={e => setType(e.target.value)} className="sr-only" /> I Found
//                     </label>
//                     <label className={`flex items-center justify-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${type === 'Lost' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}>
//                         <input type="radio" name="type" value="Lost" checked={type === 'Lost'} onChange={e => setType(e.target.value)} className="sr-only" /> I Lost
//                     </label>
//                 </div>
//                 <FormInput label="Item Name" type="text" value={name} onChange={e => setName(e.target.value)} />
//                 <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
//                     <textarea value={description} onChange={e => setDescription(e.target.value)} required rows="3" className="block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"></textarea>
//                 </div>
//                 <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
//                     <select value={category} onChange={e => setCategory(e.target.value)} className="block w-full px-4 py-2.5 border border-slate-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
//                         {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//                     </select>
//                 </div>
//                 <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">Upload Image (Optional)</label>
//                     <input type="file" onChange={e => setImage(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
//                 </div>
//                 <FormButton>Submit Report</FormButton>
//             </form>
//         </ModalWrapper>
//     );
// };

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- API Base URLs ---
const AUTH_API_URL = 'http://localhost:5001';
const ITEM_API_URL = 'http://localhost:5002';

// --- SVG Icons ---
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);


// --- Main App Component ---
export default function App() {
    const [items, setItems] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedType, setSelectedType] = useState('All');

    const categories = ['Electronics', 'Clothing', 'Books', 'Stationery', 'Accessories', 'Other'];

    // --- Authentication Effect ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            setCurrentUser(JSON.parse(user));
        }
        setLoading(false);
    }, []);

    // --- Fetch Items Effect ---
    useEffect(() => {
        const fetchItems = async () => {
            if (currentUser) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`${ITEM_API_URL}/items`, {
                        headers: { 'x-auth-token': token }
                    });
                    setItems(res.data);
                } catch (error) {
                    console.error('Failed to fetch items:', error);
                }
            }
        };
        fetchItems();
    }, [currentUser]);

    // --- Event Handlers ---
    const handleLogin = (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        setActiveModal(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setItems([]);
    };
    
    const handleAddItem = (newItem) => {
        setItems(prevItems => [newItem, ...prevItems]);
        setActiveModal(null);
    };

    // --- Filtering Logic ---
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            const matchesType = selectedType === 'All' || item.type === selectedType;
            return matchesSearch && matchesCategory && matchesType;
        });
    }, [items, searchTerm, selectedCategory, selectedType]);

    // --- Render Logic ---
    if (loading) {
        return <div className="bg-slate-50 min-h-screen"></div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
            <Header currentUser={currentUser} onLogout={handleLogout} onLoginClick={() => setActiveModal('login')} onRegisterClick={() => setActiveModal('register')} onReportClick={() => setActiveModal('report')} />

            <main className="px-4 sm:px-6 lg:px-8 py-8">
                 <div className="max-w-7xl mx-auto">
                    {currentUser ? (
                        <Dashboard
                            items={filteredItems}
                            categories={categories}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            selectedType={selectedType}
                            setSelectedType={setSelectedType}
                            currentUser={currentUser}
                        />
                    ) : (
                        <LandingPage onGetStarted={() => setActiveModal('register')} />
                    )}
                </div>
            </main>
            
            <ModalRenderer 
                activeModal={activeModal}
                setActiveModal={setActiveModal}
                handleLogin={handleLogin}
                handleAddItem={handleAddItem}
                categories={categories}
            />
        </div>
    );
}

// --- Header Component ---
const Header = ({ currentUser, onLogout, onLoginClick, onRegisterClick, onReportClick }) => (
    <header className="sticky top-0 bg-white/80 backdrop-blur-lg z-10 border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                    <span className="font-bold text-2xl text-slate-900">FindItHere</span>
                </div>
                <div className="flex items-center space-x-2">
                    {currentUser ? (
                        <>
                            <span className="text-sm text-slate-600 hidden sm:block">Welcome, {currentUser.name}</span>
                             <button onClick={onReportClick} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                Report an Item
                            </button>
                            <button onClick={onLogout} className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={onLoginClick} className="px-4 py-2 bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
                                Sign In
                            </button>
                            <button onClick={onRegisterClick} className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    </header>
);

// --- Landing Page Component ---
const LandingPage = ({ onGetStarted }) => (
    <div className="text-center py-20 lg:py-40">
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900">Find it here.</h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">The central hub for all lost and found items on campus. Sign in to start connecting.</p>
        <button onClick={onGetStarted} className="mt-8 px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Get Started
        </button>
    </div>
);


// --- Dashboard Component ---
const Dashboard = ({ items, categories, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, selectedType, setSelectedType, currentUser }) => (
    <div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
             <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        </div>
       
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-white rounded-xl border border-slate-200">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                </div>
                <input
                    type="text"
                    placeholder="Search for items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                />
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition">
                <option value="All">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition">
                <option value="All">All Types</option>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
            </select>
        </div>

        {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(item => <ItemCard key={item._id} item={item} currentUser={currentUser} />)}
            </div>
        ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800">No Items Found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your search filters or report a new item.</p>
            </div>
        )}
    </div>
);


// --- Item Card Component ---
const ItemCard = ({ item, currentUser }) => {
    // FIX: Check if the URL is absolute (from Cloudinary) or relative (local)
    const imageUrl = item.imageUrl
        ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${ITEM_API_URL}${item.imageUrl}`)
        : null;

    const isOwner = item.reportedBy === currentUser?._id;
    const typeColor = item.type === 'Found' ? 'border-green-400' : 'border-red-400';

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-slate-200 flex flex-col">
            <div className="relative w-full h-48 bg-slate-200">
                {imageUrl ? (
                    <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                     <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <p className="text-slate-500 font-medium">No Image</p>
                    </div>
                )}
            </div>
            <div className={`p-4 border-l-4 ${typeColor} flex-grow flex flex-col`}>
                <p className="text-xs text-slate-500 font-semibold uppercase">{item.category}</p>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{item.name}</h3>
                <p className="text-sm text-slate-600 mt-1 flex-grow">{item.description}</p>
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                     <div>
                        <p className={`text-xs font-bold ${item.type === 'Found' ? 'text-green-600' : 'text-red-600'}`}>{item.type} Item</p>
                        <p className="text-xs text-slate-500">Reported: {new Date(item.dateReported).toLocaleDateString()}</p>
                    </div>
                    {isOwner && (
                        <button className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200">
                            Your Item
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Modal Components ---
const ModalWrapper = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

const ModalRenderer = ({ activeModal, setActiveModal, handleLogin, handleAddItem, categories }) => {
    if (!activeModal) return null;
    
    return (
        <ModalWrapper onClose={() => setActiveModal(null)}>
            {activeModal === 'login' && <LoginModal onClose={() => setActiveModal(null)} onSwitchToRegister={() => setActiveModal('register')} onLogin={handleLogin} />}
            {activeModal === 'register' && <RegisterModal onClose={() => setActiveModal(null)} onSwitchToLogin={() => setActiveModal('login')} onLogin={handleLogin} />}
            {activeModal === 'report' && <ReportItemModal onClose={() => setActiveModal(null)} onAddItem={handleAddItem} categories={categories} />}
        </ModalWrapper>
    );
};


const LoginModal = ({ onClose, onSwitchToRegister, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post(`${AUTH_API_URL}/login`, { email, password });
            onLogin(res.data.user, res.data.token);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                 <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><CloseIcon/></button>
            </div>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">College Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition bg-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition bg-white" />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Sign In</button>
            </form>
            <p className="text-center text-sm text-slate-600 mt-6">
                Don't have an account? <button onClick={onSwitchToRegister} className="font-semibold text-blue-600 hover:underline">Create one</button>
            </p>
        </div>
    );
};

const RegisterModal = ({ onClose, onSwitchToLogin, onLogin }) => {
    const [step, setStep] = useState('details'); // 'details' or 'otp'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await axios.post(`${AUTH_API_URL}/register`, { name, email, password });
            setMessage('Verification code sent! Check your email.');
            setStep('otp'); // Move to OTP step
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post(`${AUTH_API_URL}/verify-email`, { email, otp });
            onLogin(res.data.user, res.data.token); // Finalize login
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed.');
        }
    };

    return (
        <div className="p-8">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{step === 'details' ? 'Create Account' : 'Verify Your Email'}</h2>
                 <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><CloseIcon/></button>
            </div>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
            {message && <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">{message}</p>}

            {step === 'details' ? (
                 <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">College Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition bg-white" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Create Account</button>
                    <p className="text-center text-sm text-slate-600 pt-2">
                        Already have an account? <button type="button" onClick={onSwitchToLogin} className="font-semibold text-blue-600 hover:underline">Sign in</button>
                    </p>
                </form>
            ) : (
                <form onSubmit={handleVerifySubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">6-Digit Code</label>
                        <input 
                            type="text" 
                            value={otp} 
                            onChange={e => setOtp(e.target.value)} 
                            required 
                            maxLength="6"
                            className="w-full p-2 text-center text-lg tracking-[0.5em] border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition bg-white" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Verify & Sign In</button>
                     <p className="text-center text-sm text-slate-600 pt-2">
                        Entered the wrong email? <button type="button" onClick={() => setStep('details')} className="font-semibold text-blue-600 hover:underline">Go Back</button>
                    </p>
                </form>
            )}
        </div>
    );
};


const ReportItemModal = ({ onClose, onAddItem, categories }) => {
    const [type, setType] = useState('Found');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const formData = new FormData();
        formData.append('type', type);
        formData.append('name', name);
        formData.append('description', description);
        formData.append('category', category);
        if (image) {
            formData.append('image', image);
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${ITEM_API_URL}/items`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token
                }
            });
            onAddItem(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add item. Please try again.');
        }
    };
    
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Report an Item</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><CloseIcon /></button>
            </div>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                    <button type="button" onClick={() => setType('Found')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${type === 'Found' ? 'bg-white text-slate-800 shadow' : 'bg-transparent text-slate-600'}`}>I Found</button>
                    <button type="button" onClick={() => setType('Lost')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${type === 'Lost' ? 'bg-white text-slate-800 shadow' : 'bg-transparent text-slate-600'}`}>I Lost</button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition bg-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} required rows="3" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition bg-white"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition bg-white">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Upload Image (Optional)</label>
                    <input type="file" onChange={e => setImage(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Submit Report</button>
            </form>
        </div>
    );
};

