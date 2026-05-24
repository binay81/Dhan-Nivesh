const LOCAL_USERS_KEY = 'dhanNiveshLocalUsers';
const LOCAL_AUTH_KEY = 'dhanNiveshLocalAuth';

interface LocalUserRecord {
  uid: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

function encodePassword(password: string): string {
  try {
    return btoa(password);
  } catch {
    return password;
  }
}

function decodePassword(encoded: string): string {
  try {
    return atob(encoded);
  } catch {
    return encoded;
  }
}

function getLocalUsers(): LocalUserRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUserRecord[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function emailToUid(email: string): string {
  return 'local-' + btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
}

export function registerLocalUser(name: string, email: string, password: string): { success: boolean; error?: string } {
  const users = getLocalUsers();
  const normalizedEmail = email.toLowerCase().trim();

  if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'email-already-in-use' };
  }

  const newUser: LocalUserRecord = {
    uid: emailToUid(normalizedEmail),
    email: normalizedEmail,
    name: name.trim(),
    password: encodePassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveLocalUsers(users);
  return { success: true };
}

export function loginLocalUser(email: string, password: string): { success: boolean; user?: any; error?: string } {
  const users = getLocalUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { success: false, error: 'user-not-found' };
  }

  if (decodePassword(user.password) !== password) {
    return { success: false, error: 'wrong-password' };
  }

  const now = new Date().toISOString();
  const localUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.name,
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: user.createdAt,
      lastSignInTime: now,
    },
    providerData: [],
    refreshToken: 'local-token-' + user.uid,
    tenantId: null,
    isLocal: true,
    delete: async () => {},
    getIdToken: async () => 'local-token-' + user.uid,
    getIdTokenResult: async () => ({ token: 'local-token-' + user.uid, expirationTime: now } as any),
    reload: async () => {},
    toJSON: () => ({}),
  };

  localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({ uid: user.uid, email: user.email }));

  return { success: true, user: localUser };
}

export function getCurrentLocalUser(): any | null {
  const auth = localStorage.getItem(LOCAL_AUTH_KEY);
  if (!auth) return null;

  try {
    const { email } = JSON.parse(auth);
    const users = getLocalUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;

    const now = new Date().toISOString();
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.name,
      photoURL: null,
      emailVerified: true,
      isAnonymous: false,
      metadata: {
        creationTime: user.createdAt,
        lastSignInTime: now,
      },
      providerData: [],
      refreshToken: 'local-token-' + user.uid,
      tenantId: null,
      isLocal: true,
      delete: async () => {},
      getIdToken: async () => 'local-token-' + user.uid,
      getIdTokenResult: async () => ({ token: 'local-token-' + user.uid, expirationTime: now } as any),
      reload: async () => {},
      toJSON: () => ({}),
    };
  } catch {
    return null;
  }
}

export function logoutLocalUser() {
  localStorage.removeItem(LOCAL_AUTH_KEY);
}

export function getLocalUserData(uid: string): any | null {
  const users = getLocalUsers();
  const user = users.find(u => u.uid === uid);
  if (!user) return null;

  const saved = localStorage.getItem(`dhanNiveshUser_${uid}`);
  if (saved) return JSON.parse(saved);

  return {
    uid: user.uid,
    email: user.email,
    name: user.name,
    riskProfile: 'moderate',
    balance: 100000,
    goals: [],
    plan: 'silver',
    createdAt: user.createdAt,
  };
}

export function saveLocalUserData(uid: string, data: any) {
  localStorage.setItem(`dhanNiveshUser_${uid}`, JSON.stringify(data));
}
