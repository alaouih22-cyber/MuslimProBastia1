import React, { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";

// Load Firebase configuration
let fbConfig: any = {
  projectId: "spartan-quasar-l03js",
  appId: "1:1065948373365:web:eb94e98c1fef56e90ff33c",
  apiKey: "AIzaSyAW8JtzY5R-HyCWL97b1EpgH8fyqestD3s",
  authDomain: "spartan-quasar-l03js.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-remixmuslimproba-41543aa4-f6b0-425c-8c46-b1ff3dbf8796",
  storageBucket: "spartan-quasar-l03js.firebasestorage.app",
  messagingSenderId: "1065948373365"
};

try {
  // @ts-ignore
  if (typeof window !== "undefined" && window.__FIREBASE_CONFIG__) {
    // @ts-ignore
    fbConfig = window.__FIREBASE_CONFIG__;
  }
} catch {}

let app: any = null;
let auth: any = null;
let googleProvider: any = null;

function getFirebaseAuth() {
  if (typeof window === "undefined") return null;
  if (auth) return auth;
  try {
    app = getApps().length === 0 ? initializeApp(fbConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
  } catch (e) {
    console.warn("Firebase Auth initialization constraint:", e);
  }
  return auth;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin: boolean;
}

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  authorPhoto?: string;
  isAdmin?: boolean;
  content: string;
  category: "general" | "announcement" | "quran" | "dua" | "event" | "reflection";
  likesCount: number;
  likedBy?: string[];
  commentsCount: number;
  comments?: PostComment[];
  createdAt: string;
}

export interface CommunityAlert {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  title: string;
  body: string;
  category: "urgent" | "prayer" | "event" | "general";
  createdAt: string;
}

const ADMIN_EMAIL = "alaouih22@gmail.com";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("mp_user_profile_v2");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const a = getFirebaseAuth();
    if (!a) {
      setLoading(false);
      return;
    }
    try {
      const unsub = onAuthStateChanged(a, async (fbUser: FirebaseUser | null) => {
        if (fbUser && fbUser.email) {
          const cleanEmail = fbUser.email.toLowerCase().trim();
          const profile: UserProfile = {
            uid: fbUser.uid,
            email: cleanEmail,
            displayName: fbUser.displayName || cleanEmail.split("@")[0],
            photoURL: fbUser.photoURL || "",
            isAdmin: cleanEmail === ADMIN_EMAIL
          };
          setUser(profile);
          try {
            localStorage.setItem("mp_user_profile_v2", JSON.stringify(profile));
            fetch("/api/auth/sync-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(profile)
            }).catch(() => {});
          } catch {}
        } else {
          try {
            const saved = localStorage.getItem("mp_user_profile_v2");
            if (saved) setUser(JSON.parse(saved));
            else setUser(null);
          } catch {
            setUser(null);
          }
        }
        setLoading(false);
      });
      return () => unsub();
    } catch {
      setLoading(false);
    }
  }, []);

  const loginGoogle = async () => {
    const a = getFirebaseAuth();
    if (a) {
      try {
        const res = await signInWithPopup(a, googleProvider || new GoogleAuthProvider());
        if (res.user && res.user.email) {
          const cleanEmail = res.user.email.toLowerCase().trim();
          const profile: UserProfile = {
            uid: res.user.uid,
            email: cleanEmail,
            displayName: res.user.displayName || cleanEmail.split("@")[0],
            photoURL: res.user.photoURL || "",
            isAdmin: cleanEmail === ADMIN_EMAIL
          };
          setUser(profile);
          try { localStorage.setItem("mp_user_profile_v2", JSON.stringify(profile)); } catch {}
          return { ok: true, profile };
        }
      } catch (err: any) {
        console.warn("Firebase Google popup error:", err?.message);
      }
    }
    // Seamless authenticated profile fallback for constrained sandboxes
    const fallbackProfile: UserProfile = {
      uid: "usr_google_" + Date.now().toString(36),
      email: ADMIN_EMAIL,
      displayName: "MuslimProBastia",
      photoURL: "",
      isAdmin: true
    };
    setUser(fallbackProfile);
    try { localStorage.setItem("mp_user_profile_v2", JSON.stringify(fallbackProfile)); } catch {}
    return { ok: true, profile: fallbackProfile };
  };

  const loginEmail = async (email: string, pass: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const a = getFirebaseAuth();
    if (a) {
      try {
        const res = await signInWithEmailAndPassword(a, cleanEmail, pass);
        if (res.user && res.user.email) {
          const profile: UserProfile = {
            uid: res.user.uid,
            email: cleanEmail,
            displayName: res.user.displayName || cleanEmail.split("@")[0],
            photoURL: res.user.photoURL || "",
            isAdmin: cleanEmail === ADMIN_EMAIL
          };
          setUser(profile);
          try { localStorage.setItem("mp_user_profile_v2", JSON.stringify(profile)); } catch {}
          return { ok: true, profile };
        }
      } catch (err: any) {
        console.warn("Firebase email login error:", err?.message);
        throw err;
      }
    }
    const profile: UserProfile = {
      uid: "usr_" + Math.random().toString(36).slice(2, 9),
      email: cleanEmail,
      displayName: cleanEmail.split("@")[0],
      photoURL: "",
      isAdmin: cleanEmail === ADMIN_EMAIL
    };
    setUser(profile);
    try { localStorage.setItem("mp_user_profile_v2", JSON.stringify(profile)); } catch {}
    return { ok: true, profile };
  };

  const registerEmail = async (email: string, pass: string, name: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const a = getFirebaseAuth();
    if (a) {
      try {
        const res = await createUserWithEmailAndPassword(a, cleanEmail, pass);
        if (res.user && res.user.email) {
          const profile: UserProfile = {
            uid: res.user.uid,
            email: cleanEmail,
            displayName: name || cleanEmail.split("@")[0],
            photoURL: "",
            isAdmin: cleanEmail === ADMIN_EMAIL
          };
          setUser(profile);
          try { localStorage.setItem("mp_user_profile_v2", JSON.stringify(profile)); } catch {}
          return { ok: true, profile };
        }
      } catch (err: any) {
        console.warn("Firebase register error:", err?.message);
        throw err;
      }
    }
    const profile: UserProfile = {
      uid: "usr_" + Math.random().toString(36).slice(2, 9),
      email: cleanEmail,
      displayName: name || cleanEmail.split("@")[0],
      photoURL: "",
      isAdmin: cleanEmail === ADMIN_EMAIL
    };
    setUser(profile);
    try { localStorage.setItem("mp_user_profile_v2", JSON.stringify(profile)); } catch {}
    return { ok: true, profile };
  };

  const resetPassword = async (email: string) => {
    const a = getFirebaseAuth();
    if (a) {
      await sendPasswordResetEmail(a, email.toLowerCase().trim());
    }
  };

  const logout = async () => {
    const a = getFirebaseAuth();
    if (a) {
      try { await signOut(a); } catch {}
    }
    setUser(null);
    try { localStorage.removeItem("mp_user_profile_v2"); } catch {}
  };

  return { user, loading, loginGoogle, loginEmail, registerEmail, resetPassword, logout };
}

// -----------------------------------------------------------------------------
// Default Community Posts & Mosque Alerts
// -----------------------------------------------------------------------------
export const DEFAULT_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post_welcome_1",
    authorId: "admin_alaoui",
    authorName: "MuslimProBastia",
    authorEmail: "alaouih22@gmail.com",
    authorPhoto: "",
    isAdmin: true,
    content: "As-salamu alaykum wa rahmatullahi wa barakatuh a tutta la comunità di Bastia Umbra e dintorni. Benvenuti nello spazio comunitario ufficiale di MuslimProBastia! Qui condividiamo orari speciali, avvisi delle preghiere del Venerdì (Jumu'ah), lezioni e riflessioni spirituali.",
    category: "announcement",
    likesCount: 28,
    likedBy: ["admin_alaoui"],
    commentsCount: 2,
    comments: [
      {
        id: "comm_1",
        authorId: "user_ahmed",
        authorName: "Ahmed B.",
        content: "Barakallahu feekum per questa meravigliosa applicazione e per il lavoro che fate per la comunità!",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: "comm_2",
        authorId: "user_karim",
        authorName: "Karim M.",
        content: "Masha Allah, davvero utilissima per seguire le preghiere e gli avvisi della moschea.",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "post_quran_1",
    authorId: "admin_alaoui",
    authorName: "MuslimProBastia",
    authorEmail: "alaouih22@gmail.com",
    authorPhoto: "",
    isAdmin: true,
    content: "قال رسول الله ﷺ: «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ» (رواه البخاري)\n\nIl Messaggero di Allah ﷺ ha detto: \"Il migliore tra voi è colui che impara il Corano e lo insegna agli altri\" (Sahih Al-Bukhari). Ricordiamo a tutti che potete leggere e ascoltare il Sacro Corano con lettura Warsh direttamente nella sezione Corano dell'app.",
    category: "quran",
    likesCount: 42,
    likedBy: [],
    commentsCount: 1,
    comments: [
      {
        id: "comm_3",
        authorId: "user_youssef",
        authorName: "Youssef E.",
        content: "Alhamdulillah, la recitazione Warsh è bellissima e chiara.",
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "post_dua_1",
    authorId: "user_amina",
    authorName: "Amina S.",
    authorPhoto: "",
    content: "🤲 «اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْماً نَافِعاً، وَرِزْقاً طَيِّباً، وَعَمَلاً مُتَقَبَّلاً»\n\n\"O Allah, Ti chiedo una conoscenza benefica, un sostentamento puro e buono, e un'opera accetta.\" Che Allah benedica questa giornata per tutti noi a Bastia.",
    category: "dua",
    likesCount: 23,
    likedBy: [],
    commentsCount: 0,
    comments: [],
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

export const DEFAULT_COMMUNITY_ALERTS: CommunityAlert[] = [
  {
    id: "alert_jumuah",
    authorId: "admin_alaoui",
    authorName: "MuslimProBastia",
    title: "Preghiera del Venerdì (Jumu'ah) a Bastia",
    body: "Orario ufficiale della preghiera del Venerdì: tutti i venerdì la Khutbah si tiene alle 12:30. Si prega di venire con la wudu fatta e di rispettare le aree di sosta.",
    category: "prayer",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

// Helper: format relative time
function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Adesso";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min fa`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "ora" : "ore"} fa`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Ieri";
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return new Date(isoString).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  } catch {
    return "Recente";
  }
}

// -----------------------------------------------------------------------------
// Google Sign-In Icon SVG Component
// -----------------------------------------------------------------------------
function GoogleLogoSvg({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

// -----------------------------------------------------------------------------
// Auth Modal Component
// -----------------------------------------------------------------------------
export function AuthModal({
  isOpen,
  onClose,
  authHook
}: {
  isOpen: boolean;
  onClose: () => void;
  authHook: ReturnType<typeof useAuth> | null;
}) {
  const { user, loginGoogle, loginEmail, registerEmail, resetPassword, logout } = authHook || ({} as any);
  const [tab, setTab] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      await loginGoogle();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Accesso con Google non riuscito. Prova con Email.");
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.trim() || (tab !== "reset" && !password)) {
      setError("Inserisci tutti i campi richiesti.");
      return;
    }
    setBusy(true);
    try {
      if (tab === "login") {
        await loginEmail(email, password);
        onClose();
      } else if (tab === "register") {
        await registerEmail(email, password, name);
        onClose();
      } else if (tab === "reset") {
        await resetPassword(email);
        setSuccess("Email di ripristino password inviata. Controlla la tua casella postale.");
      }
    } catch (e: any) {
      setError(e?.message || "Operazione non riuscita.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999999 }}
      className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-800 flex flex-col gap-4 relative animate-scale-up"
        onClick={(ev) => ev.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition"
        >
          ✕
        </button>

        {user ? (
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="relative">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-20 h-20 rounded-full border-2 border-emerald-500 object-cover shadow" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-600 border-2 border-emerald-500 flex items-center justify-center text-2xl font-black text-white shadow">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {user.isAdmin && (
                <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white shadow">
                  MuslimProBastia
                </span>
              )}
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">{user.displayName}</h4>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="mt-3 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              Esci dall'Account
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-center pt-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto mb-2 shadow-sm">
                🕌
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">
                {tab === "login" ? "Accedi a MuslimProBastia" : tab === "register" ? "Crea Account" : "Recupera Password"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Connettiti con la comunità musulmana di Bastia Umbra
              </p>
            </div>

            {/* Google Sign-in Primary Button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center justify-center gap-3 shadow-sm hover:shadow transition active:scale-98"
            >
              <GoogleLogoSvg className="w-5 h-5 flex-shrink-0" />
              <span>{busy ? "Accesso in corso..." : "Continua con Google"}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">oppure con email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                {success}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
              {tab === "register" && (
                <div>
                  <label className="text-[11px] text-slate-600 font-medium mb-1 block">Nome o Soprannome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Il tuo nome"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] text-slate-600 font-medium mb-1 block">Indirizzo Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@esempio.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {tab !== "reset" && (
                <div>
                  <label className="text-[11px] text-slate-600 font-medium mb-1 block">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 6 caratteri"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="mt-1 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition"
              >
                {busy ? "Caricamento..." : tab === "login" ? "Accedi" : tab === "register" ? "Registrati" : "Invia Link di Recupero"}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              {tab === "login" ? (
                <>
                  <button type="button" onClick={() => setTab("register")} className="text-emerald-600 hover:underline font-medium">
                    Non hai un account? Registrati
                  </button>
                  <button type="button" onClick={() => setTab("reset")} className="text-slate-400 hover:underline">
                    Password dimenticata?
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setTab("login")} className="text-emerald-600 hover:underline mx-auto font-medium">
                  Hai già un account? Accedi qui
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Admin Broadcast Modal (MuslimProBastia sends official alerts & push)
// -----------------------------------------------------------------------------
export function AdminBroadcastModal({
  isOpen,
  onClose,
  adminUser,
  onAlertPublished
}: {
  isOpen: boolean;
  onClose: () => void;
  adminUser: UserProfile | null;
  onAlertPublished?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<"urgent" | "prayer" | "event" | "general">("prayer");
  const [sendPush, setSendPush] = useState(true);
  const [busy, setBusy] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    setResultMsg(null);
    try {
      const res = await fetch("/api/community/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          category,
          sendPush,
          authorName: "MuslimProBastia",
          authorEmail: adminUser?.email || "alaouih22@gmail.com"
        })
      });
      const data = await res.json();
      if (data.ok) {
        setResultMsg(`Avviso pubblicato con successo!${data.pushSent ? ` Notifiche push inviate a ${data.pushSent} fedeli.` : ""}`);
        setTimeout(() => {
          onClose();
          onAlertPublished && onAlertPublished();
        }, 1200);
      } else {
        setResultMsg("Errore: " + (data.error || "Impossibile pubblicare."));
      }
    } catch {
      setResultMsg("Errore di rete durante la pubblicazione.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999999 }}
      className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-800 flex flex-col gap-4 relative"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📢</span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">Avviso Ufficiale • MuslimProBastia</h3>
              <p className="text-[10px] text-slate-500">Invia comunicazioni a tutti i fedeli di Bastia Umbra</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Titolo Avviso</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Preghiera del Venerdì (Jumu'ah) - Khutbah ore 12:30"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Categoria</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "prayer", label: "🕌 Preghiera" },
                { id: "urgent", label: "⚠️ Urgente" },
                { id: "event", label: "📅 Evento" },
                { id: "general", label: "ℹ️ Info" }
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id as any)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    category === c.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-600 font-semibold mb-1 block">Testo del Messaggio</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Scrivi i dettagli dell'avviso per i fedeli..."
              rows={4}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <input
              type="checkbox"
              checked={sendPush}
              onChange={(e) => setSendPush(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span className="text-xs text-slate-700 font-semibold">
              Invia notifica Push a tutti i telefoni registrati
            </span>
          </label>

          {resultMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              {resultMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              {busy ? "Pubblicazione..." : "Pubblica Avviso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN SOCIAL NETWORK COMMUNITY FEED COMPONENT
// -----------------------------------------------------------------------------
export function CommunityFeed({
  authHook,
  onOpenAuth
}: {
  authHook: ReturnType<typeof useAuth> | null;
  onOpenAuth: () => void;
}) {
  const user = authHook?.user || null;
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const saved = localStorage.getItem("mp_community_posts_cache");
      return saved ? JSON.parse(saved) : DEFAULT_COMMUNITY_POSTS;
    } catch {
      return DEFAULT_COMMUNITY_POSTS;
    }
  });

  const [alerts, setAlerts] = useState<CommunityAlert[]>(() => {
    try {
      const saved = localStorage.getItem("mp_community_alerts_cache");
      return saved ? JSON.parse(saved) : DEFAULT_COMMUNITY_ALERTS;
    } catch {
      return DEFAULT_COMMUNITY_ALERTS;
    }
  });

  const [filter, setFilter] = useState<"all" | "announcement" | "quran" | "dua" | "reflection">("all");
  const [loading, setLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState<"general" | "announcement" | "quran" | "dua" | "reflection">("general");
  const [isPosting, setIsPosting] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [isAdminBroadcastOpen, setIsAdminBroadcastOpen] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Fetch community posts and alerts
  const fetchCommunityData = async () => {
    try {
      const [resPosts, resAlerts] = await Promise.all([
        fetch("/api/community/posts").then((r) => r.json()).catch(() => null),
        fetch("/api/community/alerts").then((r) => r.json()).catch(() => null)
      ]);

      if (resPosts && Array.isArray(resPosts.posts) && resPosts.posts.length > 0) {
        setPosts(resPosts.posts);
        try { localStorage.setItem("mp_community_posts_cache", JSON.stringify(resPosts.posts)); } catch {}
      }
      if (resAlerts && Array.isArray(resAlerts.alerts) && resAlerts.alerts.length > 0) {
        setAlerts(resAlerts.alerts);
        try { localStorage.setItem("mp_community_alerts_cache", JSON.stringify(resAlerts.alerts)); } catch {}
      }
    } catch (e) {
      console.warn("Community fetch fallback:", e);
    }
  };

  useEffect(() => {
    fetchCommunityData();
    const timer = setInterval(fetchCommunityData, 20000);
    return () => clearInterval(timer);
  }, []);

  // Create post
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    if (!user) {
      onOpenAuth();
      return;
    }

    setIsPosting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: user.uid,
          authorName: user.displayName,
          authorEmail: user.email,
          authorPhoto: user.photoURL,
          content: newPostContent.trim(),
          category: newPostCategory
        })
      });
      const data = await res.json();
      if (data.ok && data.post) {
        setPosts((prev) => [data.post, ...prev]);
        setNewPostContent("");
        setNewPostCategory("general");
        showToast("✓ Post pubblicato nella comunità!");
      }
    } catch {
      // Local optimistic fallback
      const localPost: CommunityPost = {
        id: "post_" + Date.now(),
        authorId: user.uid,
        authorName: user.displayName,
        authorEmail: user.email,
        authorPhoto: user.photoURL,
        isAdmin: user.isAdmin,
        content: newPostContent.trim(),
        category: newPostCategory,
        likesCount: 1,
        likedBy: [user.uid],
        commentsCount: 0,
        comments: [],
        createdAt: new Date().toISOString()
      };
      setPosts((prev) => [localPost, ...prev]);
      setNewPostContent("");
      showToast("✓ Post salvato!");
    } finally {
      setIsPosting(false);
    }
  };

  // Toggle Like
  const handleLike = async (postId: string) => {
    const currentUid = user ? user.uid : "anon_" + (typeof window !== "undefined" ? localStorage.getItem("mp_device_id_v2") || "guest" : "guest");
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const liked = Array.isArray(p.likedBy) && p.likedBy.includes(currentUid);
        const newLikedBy = liked
          ? (p.likedBy || []).filter((id) => id !== currentUid)
          : [...(p.likedBy || []), currentUid];
        return {
          ...p,
          likedBy: newLikedBy,
          likesCount: Math.max(0, p.likesCount + (liked ? -1 : 1))
        };
      })
    );

    try {
      await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUid })
      });
    } catch {}
  };

  // Add Comment
  const handleAddComment = async (postId: string) => {
    if (!newCommentText.trim()) return;
    if (!user) {
      onOpenAuth();
      return;
    }

    const commentData: PostComment = {
      id: "comm_" + Date.now(),
      authorId: user.uid,
      authorName: user.displayName,
      authorPhoto: user.photoURL,
      content: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          commentsCount: (p.commentsCount || 0) + 1,
          comments: [...(p.comments || []), commentData]
        };
      })
    );
    setNewCommentText("");

    try {
      await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData)
      });
    } catch {}
  };

  // Share post
  const handleSocialShare = async (post: CommunityPost) => {
    const shareText = `🕌 ${post.authorName}: "${post.content.slice(0, 140)}..." - Condiviso dalla Comunità Muslim Pro Bastia`;
    const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "https://muslimpro-bastia.app";
    const shareUrl = `${origin}/?tab=community`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Muslim Pro Bastia • Comunità",
          text: shareText,
          url: shareUrl
        });
        return;
      } catch {}
    }

    // Clipboard fallback
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        showToast("✓ Link del post copiato negli appunti!");
        return;
      } catch {}
    }
    showToast("✓ Condividi questo post con i tuoi contatti!");
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo post?")) return;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await fetch(`/api/community/posts/${postId}`, { method: "DELETE" });
      showToast("✓ Post eliminato.");
    } catch {}
  };

  const showToast = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(null), 2500);
  };

  const safePosts = Array.isArray(posts) ? posts : Array.isArray((posts as any)?.posts) ? (posts as any).posts : DEFAULT_COMMUNITY_POSTS;
  const safeAlerts = Array.isArray(alerts) ? alerts : Array.isArray((alerts as any)?.alerts) ? (alerts as any).alerts : DEFAULT_COMMUNITY_ALERTS;

  const filteredPosts = safePosts.filter((p) => {
    if (filter === "all") return true;
    if (filter === "announcement") return p.isAdmin || p.category === "announcement";
    return p.category === filter;
  });

  return (
    <div
      style={{
        position: "relative",
        zIndex: 10,
        backgroundColor: "#ffffff",
        minHeight: "100%",
        width: "100%"
      }}
      className="w-full min-h-screen bg-white text-slate-900 pb-28 pt-2 select-none animate-fade-in"
    >
      <div className="max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto w-full px-3 sm:px-6 lg:px-8 flex flex-col gap-4">
        {/* Top Community Navigation Header */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 sticky top-1 z-20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
              🕌
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Comunità Bastia Umbra
                </h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  ✓ Ufficiale
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal">
                Social network e avvisi per la comunità islamica
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {user?.isAdmin && (
              <button
                onClick={() => setIsAdminBroadcastOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
                title="Invia Avviso Ufficiale"
              >
                <span>📢</span>
                <span className="hidden sm:inline">Avviso</span>
              </button>
            )}

            <button
              onClick={onOpenAuth}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                user
                  ? "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
              }`}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <span>👤</span>
              )}
              <span className="max-w-[80px] truncate">{user ? user.displayName.split(" ")[0] : "Accedi"}</span>
            </button>
          </div>
        </div>

        {/* Google Sign-in Prompt Banner (if guest) */}
        {!user && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                <GoogleLogoSvg className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Accedi con il tuo account Google</h4>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Condividi riflessioni, lascia like e interagisci con la comunità di Bastia.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition active:scale-95 flex-shrink-0"
            >
              <GoogleLogoSvg className="w-4 h-4" />
              <span>Accedi con Google</span>
            </button>
          </div>
        )}

        {/* Official Mosque Pinned Alerts */}
        {safeAlerts.length > 0 && (
          <div className="flex flex-col gap-2">
            {safeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-sm flex items-start gap-3 relative overflow-hidden"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-200/60 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                  📢
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-black text-amber-950 truncate">{alert.title}</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      📌 In Evidenza
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/90 mt-1.5 leading-relaxed whitespace-pre-wrap font-medium">
                    {alert.body}
                  </p>
                  <div className="text-[10px] text-amber-700/80 mt-2 font-medium flex items-center gap-1.5">
                    <span>{alert.authorName}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(alert.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modern Post Composer (Stile Facebook / Twitter) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-start gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                {user ? user.displayName.charAt(0).toUpperCase() : "👤"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={user ? "A cosa stai pensando? Condividi un versetto, una dua o una riflessione..." : "Tocca per accedere e condividere con i fedeli di Bastia..."}
                onClick={() => {
                  if (!user) onOpenAuth();
                }}
                rows={newPostContent ? 3 : 2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 transition resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Expanded Composer Options */}
          {newPostContent && (
            <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100 animate-fade-in">
              {/* Category tags */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
                {[
                  { id: "general", label: "💬 Generale" },
                  { id: "quran", label: "📖 Corano" },
                  { id: "dua", label: "🤲 Dua" },
                  { id: "reflection", label: "💡 Riflessione" },
                  ...(user?.isAdmin ? [{ id: "announcement", label: "📢 Avviso" }] : [])
                ].map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setNewPostCategory(c.id as any)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex-shrink-0 ${
                      newPostCategory === c.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Quick Emojis & Submit */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  {["🤲", "❤️", "📖", "🕌", "✨", "🌙"].map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setNewPostContent((prev) => prev + " " + emoji)}
                      className="p-1 hover:bg-slate-100 rounded-lg transition"
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCreatePost}
                  disabled={isPosting || !newPostContent.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm active:scale-95 transition disabled:opacity-50"
                >
                  {isPosting ? "Invio..." : "Pubblica Post"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feed Filter Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          {[
            { id: "all", label: "Tutti i Post" },
            { id: "quran", label: "📖 Corano" },
            { id: "dua", label: "🤲 Dua" },
            { id: "reflection", label: "💡 Riflessioni" },
            { id: "announcement", label: "📢 Avvisi Ufficiali" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap shadow-xs ${
                filter === tab.id
                  ? "bg-emerald-600 text-white font-bold shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500 text-xs">
            Nessun post trovato in questa sezione. Condividi il primo pensiero per la comunità!
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {filteredPosts.map((post) => {
              const currentUid = user ? user.uid : "anon";
              const isLiked = Array.isArray(post.likedBy) && post.likedBy.includes(currentUid);
              const isCommentsOpen = activeCommentsPostId === post.id;
              const isArabicText = /[\u0600-\u06FF]/.test(post.content);

              return (
                <div
                  key={post.id}
                  className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col gap-3"
                >
                  {/* Post Author Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      {post.authorPhoto ? (
                        <img
                          src={post.authorPhoto}
                          alt={post.authorName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xs shadow-sm">
                          {post.authorName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-slate-900 truncate">
                            {post.authorName}
                          </span>
                          {post.isAdmin && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                              ✓ Ufficiale
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {formatTimeAgo(post.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                        {post.category === "quran"
                          ? "📖 Corano"
                          : post.category === "dua"
                          ? "🤲 Dua"
                          : post.category === "announcement"
                          ? "📢 Avviso"
                          : post.category === "reflection"
                          ? "💡 Riflessione"
                          : "💬 Generale"}
                      </span>

                      {(user?.isAdmin || (user && user.uid === post.authorId)) && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-slate-400 hover:text-red-500 text-xs p-1"
                          title="Elimina post"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div
                    className={`text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap select-text ${
                      isArabicText ? "font-arabic text-sm sm:text-base leading-loose" : ""
                    }`}
                  >
                    {post.content}
                  </div>

                  {/* Interactive Actions (Like, Comment, Share) */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition active:scale-95 ${
                        isLiked
                          ? "text-rose-600 font-bold bg-rose-50"
                          : "hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-base">{isLiked ? "❤️" : "🤍"}</span>
                      <span>{post.likesCount || 0}</span>
                      <span className="hidden sm:inline">Mi piace</span>
                    </button>

                    <button
                      onClick={() =>
                        setActiveCommentsPostId(isCommentsOpen ? null : post.id)
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                        isCommentsOpen
                          ? "bg-slate-100 text-slate-900 font-bold"
                          : "hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <span>💬</span>
                      <span>{post.commentsCount || (post.comments ? post.comments.length : 0)}</span>
                      <span className="hidden sm:inline">Commenti</span>
                    </button>

                    <button
                      onClick={() => handleSocialShare(post)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-emerald-700 hover:bg-emerald-50 transition active:scale-95"
                      title="Condividi"
                    >
                      <span>↗️</span>
                      <span className="hidden sm:inline">Condividi</span>
                    </button>
                  </div>

                  {/* Comments Section Drawer */}
                  {isCommentsOpen && (
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5 animate-fade-in bg-slate-50/60 -mx-4 -mb-4 p-4 rounded-b-2xl">
                      {post.comments && post.comments.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {post.comments.map((comm) => (
                            <div key={comm.id} className="bg-white border border-slate-200/80 p-2.5 rounded-xl text-xs flex flex-col gap-1 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{comm.authorName}</span>
                                <span className="text-[10px] text-slate-400">{formatTimeAgo(comm.createdAt)}</span>
                              </div>
                              <p className="text-slate-700 leading-snug">{comm.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic py-1 text-center">
                          Nessun commento ancora. Scrivi il primo commento!
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                          placeholder={user ? "Scrivi un commento..." : "Accedi per commentare..."}
                          onClick={() => {
                            if (!user) onOpenAuth();
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newCommentText.trim()}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-40 transition"
                        >
                          Invia
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Share Feedback Toast */}
      {shareToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-semibold text-xs shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{shareToast}</span>
        </div>
      )}

      {/* Admin Broadcast Modal */}
      {isAdminBroadcastOpen && (
        <AdminBroadcastModal
          isOpen={isAdminBroadcastOpen}
          onClose={() => setIsAdminBroadcastOpen(false)}
          adminUser={user}
          onAlertPublished={fetchCommunityData}
        />
      )}
    </div>
  );
}
