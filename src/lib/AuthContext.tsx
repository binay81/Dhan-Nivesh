import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  registerLocalUser,
  loginLocalUser,
  getCurrentLocalUser,
  logoutLocalUser,
  getLocalUserData,
  saveLocalUserData,
} from "./localAuth";

interface DemoUser extends User {
  isDemo?: boolean;
  isLocal?: boolean;
}

interface AuthContextType {
  user: DemoUser | null;
  loading: boolean;
  userData: any;
  error: string | null;
  login: () => Promise<void>;
  loginAsDemo: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isDemoMode: boolean;
  isLocalMode: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createDemoUser = (): DemoUser => ({
  uid: "demo-user",
  email: "demo@dhan-nivesh.local",
  displayName: "Demo User",
  photoURL: null,
  emailVerified: true,
  isAnonymous: true,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  refreshToken: "demo-token",
  tenantId: null,
  isDemo: true,
  delete: async () => {},
  getIdToken: async () => "demo-token",
  getIdTokenResult: async () => ({ token: "demo-token", expirationTime: new Date().toISOString() } as any),
  reload: async () => {},
  toJSON: () => ({}),
} as any);

const DEMO_USER_DATA = {
  uid: "demo-user",
  email: "demo@dhan-nivesh.local",
  name: "Demo User",
  riskProfile: "moderate",
  balance: 100000,
  goals: [],
  plan: "silver",
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false);

  useEffect(() => {
    // Check for demo mode in localStorage
    const demoMode = localStorage.getItem("dhanNiveshDemoMode") === "true";
    if (demoMode) {
      const demoUser = createDemoUser();
      setUser(demoUser);
      setIsDemoMode(true);
      const saved = JSON.parse(localStorage.getItem("dhanNiveshUser") || "null");
      setUserData(saved || DEMO_USER_DATA);
      setLoading(false);
      return;
    }

    // Check for local auth session (fallback when Firebase auth is disabled)
    const localUser = getCurrentLocalUser();
    if (localUser) {
      setUser(localUser as DemoUser);
      setIsLocalMode(true);
      const data = getLocalUserData(localUser.uid);
      setUserData(data);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setError(null);
        setUser(firebaseUser as DemoUser);
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            const newData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || "User",
              riskProfile: "moderate",
              balance: 100000,
              goals: [],
              plan: "silver",
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, "users", firebaseUser.uid), newData);
            setUserData(newData);
          }
        } else {
          setUserData(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load user data";
        setError(errorMessage);
        console.error("Auth error:", err);
        // Still allow app to function - set minimal user data
        if (firebaseUser) {
          setUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || "User",
            riskProfile: "moderate",
            balance: 100000,
            plan: "silver",
          });
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      if (errorMessage.includes("unauthorized-domain") || errorMessage.includes("popup-blocked")) {
        setError("Google login not available in development. Use Email or Demo Login.");
      } else {
        setError(errorMessage);
      }
      console.error("Login error:", err);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      const shouldTryLocal =
        errorMessage.includes("OPERATION_NOT_ALLOWED") ||
        errorMessage.includes("auth/operation-not-allowed") ||
        errorMessage.includes("NETWORK_ERROR") ||
        errorMessage.includes("auth/network-request-failed") ||
        errorMessage.includes("invalid-credential") ||
        errorMessage.includes("auth/invalid-credential") ||
        errorMessage.includes("user-not-found") ||
        errorMessage.includes("auth/user-not-found");

      if (shouldTryLocal) {
        const result = loginLocalUser(email, password);
        if (result.success && result.user) {
          setUser(result.user as DemoUser);
          setIsLocalMode(true);
          const data = getLocalUserData(result.user.uid);
          setUserData(data);
          return;
        } else if (result.error === "user-not-found") {
          setError("No account found. Please sign up first.");
        } else if (result.error === "wrong-password") {
          setError("Invalid email or password.");
        } else {
          setError(errorMessage);
        }
      } else if (errorMessage.includes("too-many-requests")) {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(errorMessage);
      }
      throw err;
    }
  };

  const signupWithEmail = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (credential.user) {
        await updateProfile(credential.user, { displayName: name });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign up";
      const shouldTryLocal =
        errorMessage.includes("OPERATION_NOT_ALLOWED") ||
        errorMessage.includes("auth/operation-not-allowed") ||
        errorMessage.includes("NETWORK_ERROR") ||
        errorMessage.includes("auth/network-request-failed");

      if (shouldTryLocal) {
        const result = registerLocalUser(name, email, password);
        if (result.success) {
          const loginResult = loginLocalUser(email, password);
          if (loginResult.success && loginResult.user) {
            setUser(loginResult.user as DemoUser);
            setIsLocalMode(true);
            const newData = {
              uid: loginResult.user.uid,
              email: loginResult.user.email,
              name: name,
              riskProfile: "moderate",
              balance: 100000,
              goals: [],
              plan: "silver",
              createdAt: new Date().toISOString(),
            };
            saveLocalUserData(loginResult.user.uid, newData);
            setUserData(newData);
          }
          return;
        } else if (result.error === "email-already-in-use") {
          setError("This email is already registered. Try logging in instead.");
        } else {
          setError(errorMessage);
        }
      } else if (errorMessage.includes("email-already-in-use")) {
        setError("This email is already registered. Try logging in instead.");
      } else if (errorMessage.includes("weak-password")) {
        setError("Password must be at least 6 characters.");
      } else if (errorMessage.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(errorMessage);
      }
      throw err;
    }
  };

  const loginAsDemo = async () => {
    try {
      setError(null);
      localStorage.setItem("dhanNiveshDemoMode", "true");
      setIsDemoMode(true);

      const demoUser = createDemoUser();
      setUser(demoUser);

      // Save demo user data to localStorage
      localStorage.setItem("dhanNiveshUser", JSON.stringify(DEMO_USER_DATA));
      setUserData(DEMO_USER_DATA);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in as demo";
      setError(errorMessage);
      console.error("Demo login error:", err);
      setIsDemoMode(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      localStorage.removeItem("dhanNiveshDemoMode");
      localStorage.removeItem("dhanNiveshLocalAuth");
      setIsDemoMode(false);
      setIsLocalMode(false);

      if (user?.isDemo || user?.isLocal) {
        setUser(null);
        setUserData(null);
      } else {
        await signOut(auth);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign out";
      setError(errorMessage);
      console.error("Logout error:", err);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, userData, error, login, loginAsDemo, loginWithEmail, signupWithEmail, logout, isDemoMode, isLocalMode, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
