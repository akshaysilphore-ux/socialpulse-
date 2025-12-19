import React, { useState, useEffect } from 'react';
import { 
  initializeApp 
} from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query,
  deleteDoc,
  where
} from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  BarChart3, 
  MessageSquare, 
  Users, 
  Zap, 
  Plus, 
  Search, 
  Bell, 
  ChevronRight, 
  ChevronLeft,
  Image as ImageIcon, 
  Type, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Filter, 
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  Settings,
  Layers,
  Sparkles,
  Mic,
  Target,
  LineChart,
  PieChart,
  Loader2,
  Check,
  X,
  Send,
  ExternalLink,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Shield,
  CreditCard,
  User,
  Palette,
  Lock,
  Mail,
  Fingerprint,
  LogOut,
  Smartphone,
  Eye,
  EyeOff,
  Building2,
  ScanFace,
  ChevronDown,
  Maximize
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'social-pulse-full';

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Biometric States
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [biometricType, setBiometricType] = useState('fingerprint'); // 'fingerprint' or 'face'
  const [biometricSettings, setBiometricSettings] = useState({ fingerprint: true, face: true });
  const [scanSuccess, setScanSuccess] = useState(false);
  
  // App Data State
  const [clients, setClients] = useState([]);
  const [posts, setPosts] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [messages, setMessages] = useState([]);
  const [roiBudget, setRoiBudget] = useState(1000);
  const [activeChat, setActiveChat] = useState(null);

  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authName, setAuthName] = useState('');
  const [authAgency, setAuthAgency] = useState('');

  // New Campaign Form State
  const [newCampaign, setNewCampaign] = useState({
    client: '',
    platform: 'Instagram',
    preview: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Draft'
  });

  // --- Auth & Data Initialization ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Real-time Data Listeners ---
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const clientsRef = collection(db, 'artifacts', appId, 'public', 'data', 'clients');
    const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
    const competitorsRef = collection(db, 'artifacts', appId, 'public', 'data', 'competitors');
    const messagesRef = collection(db, 'artifacts', appId, 'public', 'data', 'messages');

    const unsubClients = onSnapshot(clientsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length === 0) seedInitialData();
      setClients(data);
    });

    const unsubPosts = onSnapshot(postsRef, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubCompetitors = onSnapshot(competitorsRef, (snapshot) => {
      setCompetitors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubMessages = onSnapshot(messagesRef, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubClients();
      unsubPosts();
      unsubCompetitors();
      unsubMessages();
    };
  }, [user, isAuthenticated]);

  // --- Data Seeding ---
  const seedInitialData = async () => {
    const initialClients = [
      { name: 'Lumina Tech', health: 'Excellent', posts: 12, growth: '+14%', website: 'lumina.io', category: 'SaaS' },
      { name: 'Vibe Wear', health: 'Good', posts: 8, growth: '+8.2%', website: 'vibewear.com', category: 'Retail' },
      { name: 'Eco Eats', health: 'Action Needed', posts: 5, growth: '-2.1%', website: 'ecoeats.eco', category: 'F&B' }
    ];
    const initialPosts = [
      { client: 'Lumina Tech', platform: 'Instagram', status: 'Scheduled', date: new Date(2025, 11, 25, 10, 0).toISOString(), preview: 'AI is changing the game...', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=200' },
      { client: 'Vibe Wear', platform: 'TikTok', status: 'Pending Approval', date: new Date(2025, 11, 26, 14, 30).toISOString(), preview: 'New winter collection drop ❄️', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=200' },
      { client: 'Eco Eats', platform: 'LinkedIn', status: 'Pending Approval', date: new Date(2025, 11, 27, 9, 15).toISOString(), preview: 'Sustainability in 2026.', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=200' }
    ];
    const initialMessages = [
      { id: 'm1', sender: 'Sarah (Lumina)', text: "Did the ad campaign start?", time: '2h ago', platform: 'LinkedIn', unread: true },
      { id: 'm2', sender: 'Marcus (Vibe)', text: "Love the new reels!", time: '5h ago', platform: 'Instagram', unread: false }
    ];

    for (const item of initialClients) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'clients'), item);
    for (const item of initialPosts) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), item);
    for (const item of initialMessages) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), item);
  };

  // --- Handlers ---
  const handleAuth = (e) => {
    e.preventDefault();
    if (authEmail && authPass) {
      setIsAuthenticated(true);
    }
  };

  const handleBiometricLogin = (type) => {
    setBiometricType(type);
    setIsBiometricScanning(true);
    setScanSuccess(false);
    
    // Simulate biometric scan
    setTimeout(() => {
      setScanSuccess(true);
      setTimeout(() => {
        setIsBiometricScanning(false);
        setIsAuthenticated(true);
      }, 1000);
    }, 2000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    setAuthEmail('');
    setAuthPass('');
    setAuthName('');
    setAuthAgency('');
  };

  const saveCampaign = async () => {
    if (!user || !newCampaign.client) return;
    const postData = {
      ...newCampaign,
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=200',
    };
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), postData);
    setIsCampaignModalOpen(false);
    setNewCampaign({ client: '', platform: 'Instagram', preview: '', date: new Date().toISOString().split('T')[0], status: 'Draft' });
  };

  const updatePostStatus = async (postId, status) => {
    const postRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId);
    await updateDoc(postRef, { status });
  };

  // --- UI Sub-Components ---

  const BiometricScanner = () => (
    <div className={`fixed inset-0 z-[110] flex items-center justify-center transition-all duration-500 ${isBiometricScanning ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-indigo-950/95 backdrop-blur-xl"></div>
      <div className="relative z-10 flex flex-col items-center gap-8 text-white max-w-sm text-center">
        <div className="relative">
          {/* Scanning Animation */}
          <div className={`absolute -inset-4 bg-indigo-500/10 rounded-full animate-pulse ${scanSuccess ? 'hidden' : ''}`}></div>
          <div className={`w-40 h-40 rounded-3xl border-2 border-indigo-400/20 flex items-center justify-center transition-all duration-700 relative overflow-hidden ${scanSuccess ? 'bg-emerald-500 border-emerald-300 scale-105 shadow-[0_0_50px_rgba(16,185,129,0.4)]' : 'bg-white/5 shadow-2xl'}`}>
            
            {/* Face ID Grid Overlay */}
            {biometricType === 'face' && !scanSuccess && (
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20 p-2">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-indigo-300"></div>
                ))}
              </div>
            )}

            {scanSuccess ? (
              <Check size={80} className="text-white animate-in zoom-in-50 duration-300"/>
            ) : (
              biometricType === 'face' ? (
                <ScanFace size={80} className="text-indigo-300 animate-pulse relative z-10"/>
              ) : (
                <Fingerprint size={80} className="text-indigo-300 animate-pulse relative z-10"/>
              )
            )}

            {!scanSuccess && (
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_20px_rgba(129,140,248,1)] animate-scan-line z-20"></div>
            )}
          </div>
        </div>
        
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
          <h3 className="text-3xl font-bold tracking-tight">
            {scanSuccess ? 'Verified' : (biometricType === 'face' ? 'Face Recognition' : 'Touch ID')}
          </h3>
          <p className="text-indigo-200/80 font-medium px-4">
            {scanSuccess ? 'Identity confirmed. Unlocking SocialPulse...' : (biometricType === 'face' ? 'Scanning facial features to secure your agency data.' : 'Authenticating fingerprint for secure dashboard access.')}
          </p>
        </div>

        {!scanSuccess && (
          <button 
            onClick={() => setIsBiometricScanning(false)}
            className="mt-6 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold transition-all border border-white/10 backdrop-blur-sm"
          >
            Cancel and use password
          </button>
        )}
      </div>
      <style>{`
        @keyframes scan {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        .animate-scan-line {
          animation: scan 2.5s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );

  const AuthGateway = () => (
    <div className="min-h-screen w-full flex bg-[#F8FAFC]">
      <BiometricScanner />
      <div className="flex-1 hidden lg:flex flex-col justify-center p-20 bg-indigo-600 text-white relative overflow-hidden transition-all duration-700">
        <div className={`absolute top-0 right-0 p-20 opacity-10 transition-transform duration-1000 ${isSignUp ? 'translate-x-1/2 rotate-12' : ''}`}><Zap size={400}/></div>
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mb-8 shadow-xl font-black text-2xl">SP</div>
          <h1 className="text-5xl font-extrabold leading-tight">
            {isSignUp ? "Your Agency's New Operating System." : "Secure Your Agency's Digital Future."}
          </h1>
          <p className="text-xl text-indigo-100 font-medium opacity-90">
            {isSignUp ? "AI-powered creative workflows, predictive ROI, and unified client communication in one secure hub." : "Manage all your social marketing assets with enterprise-grade security and AI-driven insights."}
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-20 bg-white">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">{isSignUp ? 'Create Agency Account' : 'Sign in to SocialPulse'}</h2>
            <p className="text-slate-500 font-medium">
              {isSignUp ? 'Start your 14-day pro trial today.' : 'Enter your credentials to access your secure dashboard.'}
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleAuth}>
            <div className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                      <input 
                        required type="text" value={authName} onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Alex Rivera" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agency Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                      <input 
                        required type="text" value={authAgency} onChange={(e) => setAuthAgency(e.target.value)}
                        placeholder="Pulse Marketing" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                  <input 
                    required type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="alex@agency.com" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                  <input 
                    required type={showPassword ? 'text' : 'password'} value={authPass} onChange={(e) => setAuthPass(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-11 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all text-sm font-medium"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
            </div>
            
            {!isSignUp && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-indigo-600" /> Remember Agency
                </label>
                <button type="button" className="font-bold text-indigo-600 hover:text-indigo-700">Forgot Password?</button>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                {isSignUp ? 'Create My Account' : 'Secure Login'} <ChevronRight size={18}/>
              </button>
              
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full py-2 text-slate-500 font-bold text-sm hover:text-indigo-600 transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'New to SocialPulse? Create Account'}
              </button>
            </div>
          </form>
          
          <div className="relative py-4 text-center">
            <span className="bg-white px-4 text-[10px] font-bold text-slate-400 relative z-10 uppercase tracking-[0.2em]">Secure Fast Login</span>
            <div className="absolute top-1/2 w-full h-px bg-slate-100"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => handleBiometricLogin('fingerprint')}
              className="py-4 bg-slate-50 border border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 hover:border-slate-200 transition-all flex flex-col items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Fingerprint size={28} className="text-indigo-600"/>
              <span className="text-[10px] uppercase tracking-wider">Touch ID</span>
            </button>
            <button 
              type="button"
              onClick={() => handleBiometricLogin('face')}
              className="py-4 bg-slate-50 border border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 hover:border-slate-200 transition-all flex flex-col items-center justify-center gap-2 active:scale-[0.98]"
            >
              <ScanFace size={28} className="text-indigo-600"/>
              <span className="text-[10px] uppercase tracking-wider">Face ID</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-indigo-100 border-4 border-indigo-50 overflow-hidden shadow-inner">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'friend'}`} alt="Profile" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{authName || 'Alex Rivera'}</h3>
            <p className="text-slate-500 font-medium">{authAgency || 'Pulse Marketing'} • Agency Owner</p>
            <div className="mt-2 flex gap-2">
               <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 uppercase tracking-wider">Identity Verified</span>
               <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase tracking-wider">Pro Account</span>
            </div>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 border border-slate-200 transition-all active:scale-95">Edit Profile</button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-indigo-600" size={20}/>
            <h3 className="font-bold">Security Hub</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last scan: 5m ago</span>
        </div>
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900">Fingerprint Recognition (Touch ID)</h4>
              <p className="text-sm text-slate-500">Sign in securely using your registered fingerprints.</p>
            </div>
            <button 
              onClick={() => setBiometricSettings({...biometricSettings, fingerprint: !biometricSettings.fingerprint})}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative p-1 ${biometricSettings.fingerprint ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${biometricSettings.fingerprint ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900">Facial Recognition (Face ID)</h4>
              <p className="text-sm text-slate-500">Enable advanced 3D face scanning for dashboard access.</p>
            </div>
            <button 
              onClick={() => setBiometricSettings({...biometricSettings, face: !biometricSettings.face})}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative p-1 ${biometricSettings.face ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${biometricSettings.face ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
          <div className="pt-8 border-t border-slate-50">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Smartphone size={18} className="text-slate-400"/> Authenticated Devices</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><ScanFace size={20}/></div>
                    <div>
                      <p className="text-sm font-bold">iPhone 15 Pro • San Francisco, USA</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active Session</p>
                    </div>
                 </div>
                 <button className="px-3 py-1 bg-white text-rose-500 text-[10px] font-bold rounded-lg border border-slate-100 hover:bg-rose-50 transition-all">Revoke Access</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const CampaignModal = () => (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all ${isCampaignModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCampaignModalOpen(false)}></div>
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">New Campaign</h3>
            <button onClick={() => setIsCampaignModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Select Client</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                value={newCampaign.client}
                onChange={(e) => setNewCampaign({...newCampaign, client: e.target.value})}
              >
                <option value="">Choose a client...</option>
                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Platform</label>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {['Instagram', 'LinkedIn', 'TikTok'].map(p => (
                    <button 
                      key={p}
                      onClick={() => setNewCampaign({...newCampaign, platform: p})}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newCampaign.platform === p ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Schedule Date</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none"
                  value={newCampaign.date}
                  onChange={(e) => setNewCampaign({...newCampaign, date: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Campaign Concept</label>
              <textarea 
                rows="3"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                placeholder="What's the core strategy?"
                value={newCampaign.preview}
                onChange={(e) => setNewCampaign({...newCampaign, preview: e.target.value})}
              ></textarea>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => setIsCampaignModalOpen(false)}
              className="flex-1 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all">Cancel</button>
            <button 
              onClick={saveCampaign}
              className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
              Launch Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Sidebar & Stat Helpers ---
  const SidebarItem = ({ id, icon: Icon, label, badge }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
        activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={activeTab === id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} />
        <span className="font-medium text-sm">{label}</span>
      </div>
      {badge > 0 && <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === id ? 'bg-indigo-400' : 'bg-slate-100 text-slate-500'}`}>{badge}</span>}
    </button>
  );

  const StatCard = ({ title, value, trend, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}><Icon size={20} /></div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend?.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{trend}<TrendingUp size={12} /></div>
      </div>
      <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="text-indigo-600 animate-spin" size={40} />
          <p className="text-slate-500 font-medium tracking-tight">Syncing your agency pulse...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthGateway />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      <CampaignModal />
      
      <aside className={`bg-white border-r border-slate-100 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0"><Zap size={24} fill="currentColor" /></div>
          {isSidebarOpen && <h1 className="text-xl font-bold tracking-tight text-slate-800">SocialPulse</h1>}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">Main Menu</div>
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Pulse Dashboard" />
          <SidebarItem id="ai-studio" icon={BrainCircuit} label="AI Creative Studio" />
          <SidebarItem id="calendar" icon={CalendarIcon} label="Content Planner" />
          <SidebarItem id="analytics" icon={BarChart3} label="Performance" />
          <SidebarItem id="competitors" icon={Target} label="Competitors" badge={competitors.length} />
          <div className="pt-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">Agency Tools</div>
          <SidebarItem id="clients" icon={Users} label="Client Portals" />
          <SidebarItem id="approvals" icon={CheckCircle2} label="Approvals" badge={posts.filter(p => p.status === 'Pending Approval').length} />
          <SidebarItem id="inbox" icon={MessageSquare} label="Unified Inbox" badge={messages.filter(m => m.unread).length} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50'}`}>
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 shadow-inner"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'friend'}`} alt="Avatar" /></div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{authName || 'Alex Rivera'}</p>
                <p className="text-xs text-slate-500 truncate">{authAgency || 'Agency Owner'}</p>
              </div>
            )}
            {isSidebarOpen && <ChevronDown size={14} className={activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'} />}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-3 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
            <div className="w-10 h-10 flex items-center justify-center shrink-0"><LogOut size={20}/></div>
            {isSidebarOpen && <span className="text-sm font-bold">Secure Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold text-slate-800 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 gap-2 mr-2">
               <Shield size={14} className="text-emerald-500"/>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vault Secured</span>
            </div>
            <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl relative transition-all"><Bell size={20} /><span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span></button>
            <button 
              onClick={() => setIsCampaignModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
              <Plus size={18} /> New Campaign
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Avg. Engagement" value="4.82%" trend="+12.5%" icon={TrendingUp} color="bg-indigo-500" />
                <StatCard title="Total Impressions" value="1.2M" trend="+24.2%" icon={Users} color="bg-blue-500" />
                <StatCard title="Scheduled" value={posts.filter(p => p.status === 'Scheduled').length} trend="+2" icon={CalendarIcon} color="bg-purple-500" />
                <StatCard title="Biometric Health" value="Active" trend="+100%" icon={ScanFace} color="bg-emerald-500" />
              </section>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-bold text-lg mb-4">Latest Campaign Activity</h3>
                  <div className="space-y-4">
                    {posts.slice(0, 4).map(p => (
                      <div key={p.id} className="flex items-center gap-4 p-4 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-all">
                        <img src={p.image} className="w-12 h-12 rounded-xl object-cover" alt="Thumb"/>
                        <div className="flex-1"><p className="text-sm font-bold text-slate-900">{p.client}</p><p className="text-xs text-slate-500 truncate">{p.preview}</p></div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${p.status === 'Draft' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600'}`}>{p.platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
                   <h3 className="font-bold">Agency Pulse</h3>
                   <div className="space-y-3">
                     <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3"><Shield className="text-indigo-500" size={18}/><p className="text-xs font-medium text-indigo-900">Face ID active for {authName || 'Agent'}.</p></div>
                     <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={18}/><p className="text-xs font-medium text-emerald-900">Security vault verified.</p></div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && <SettingsView />}
          
          {/* Calendar View Placeholder */}
          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="bg-slate-50 p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
                ))}
                {Array.from({ length: 35 }, (_, i) => i).map(d => (
                  <div key={d} className="bg-white min-h-[140px] p-3 hover:bg-slate-50 transition-colors">
                    <span className="text-xs font-bold text-slate-300">{d > 0 && d <= 31 ? d : ''}</span>
                    {posts.filter(p => new Date(p.date).getDate() === d).map(p => (
                      <div key={p.id} className="mt-2 text-[10px] p-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg font-bold truncate">
                        {p.client}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Default State for other tabs */}
          {['ai-studio', 'analytics', 'competitors', 'clients', 'approvals', 'inbox'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4 bg-white rounded-3xl border border-slate-100 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center"><Maximize size={32} className="opacity-20"/></div>
              <p className="font-bold text-slate-500">Syncing {activeTab} data for {authAgency || 'your agency'}...</p>
              <button className="px-6 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-all">Secure Refresh</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;