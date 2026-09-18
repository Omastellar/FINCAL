import {
  User,
  VisitorSession,
  AppTelemetrySummary,
  JoinedMemberRecord,
  MemberGrowthSummary,
} from '../types/auth';

const TELEMETRY_STORAGE_KEY = 'fincal_visitor_telemetry';
const CURRENT_SESSION_ID_KEY = 'fincal_current_session_id';

function getClientEnvironment(): { device: string; browser: string } {
  if (typeof navigator === 'undefined') {
    return { device: 'Desktop (Windows)', browser: 'Chrome' };
  }
  const ua = navigator.userAgent;
  let device = 'Desktop (Windows)';
  if (/android/i.test(ua)) device = 'Mobile (Android)';
  else if (/iphone/i.test(ua)) device = 'Mobile (iOS)';
  else if (/ipad/i.test(ua)) device = 'Tablet (iPadOS)';
  else if (/macintosh/i.test(ua)) device = 'Desktop (macOS)';
  else if (/linux/i.test(ua)) device = 'Desktop (Linux)';

  let browser = 'Chrome';
  if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edg/i.test(ua)) browser = 'Edge';

  return { device, browser };
}

// Initial baseline sessions to demonstrate realistic telemetry
const BASELINE_SESSIONS: VisitorSession[] = [
  {
    id: 'sess_reg_001',
    type: 'registered',
    userId: 'usr_demo_002',
    userName: 'Alex Morgan',
    userEmail: 'alex@example.com',
    device: 'Desktop (macOS)',
    browser: 'Safari',
    location: 'Lagos, Nigeria',
    startedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    pagesViewed: 8,
    calculationsRun: 5,
    lastToolUsed: 'Loan Calculator',
    status: 'online',
  },
  {
    id: 'sess_reg_002',
    type: 'registered',
    userId: 'usr_admin_001',
    userName: 'Chief Administrator',
    userEmail: 'admin@fincal.app',
    device: 'Desktop (Windows)',
    browser: 'Chrome',
    location: 'London, United Kingdom',
    startedAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    pagesViewed: 14,
    calculationsRun: 2,
    lastToolUsed: 'Platform Operations',
    status: 'online',
  },
  {
    id: 'sess_guest_101',
    type: 'unregistered',
    device: 'Mobile (Android)',
    browser: 'Chrome',
    location: 'Abuja, Nigeria',
    startedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    pagesViewed: 4,
    calculationsRun: 3,
    lastToolUsed: 'Currency Converter',
    status: 'online',
  },
  {
    id: 'sess_guest_102',
    type: 'unregistered',
    device: 'Desktop (Windows)',
    browser: 'Edge',
    location: 'Nairobi, Kenya',
    startedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    pagesViewed: 6,
    calculationsRun: 4,
    lastToolUsed: 'Savings Growth',
    status: 'active',
  },
  {
    id: 'sess_guest_103',
    type: 'unregistered',
    device: 'Mobile (iOS)',
    browser: 'Safari',
    location: 'Johannesburg, South Africa',
    startedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    pagesViewed: 5,
    calculationsRun: 2,
    lastToolUsed: 'Compound Interest',
    status: 'idle',
  },
  {
    id: 'sess_guest_104',
    type: 'unregistered',
    device: 'Desktop (macOS)',
    browser: 'Firefox',
    location: 'New York, USA',
    startedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    pagesViewed: 9,
    calculationsRun: 6,
    lastToolUsed: 'Investment Returns',
    status: 'idle',
  },
  {
    id: 'sess_guest_105',
    type: 'unregistered',
    device: 'Tablet (iPadOS)',
    browser: 'Safari',
    location: 'Accra, Ghana',
    startedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    pagesViewed: 3,
    calculationsRun: 1,
    lastToolUsed: 'Debt Payoff',
    status: 'idle',
  },
  {
    id: 'sess_guest_106',
    type: 'unregistered',
    device: 'Desktop (Windows)',
    browser: 'Chrome',
    location: 'Toronto, Canada',
    startedAt: new Date(Date.now() - 200 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    pagesViewed: 7,
    calculationsRun: 5,
    lastToolUsed: 'Budget 50/30/20',
    status: 'idle',
  },
];

export function getStoredSessions(): VisitorSession[] {
  try {
    const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  // Initialize with baseline
  saveStoredSessions(BASELINE_SESSIONS);
  return BASELINE_SESSIONS;
}

export function saveStoredSessions(sessions: VisitorSession[]): void {
  try {
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

export function initOrUpdateVisitorSession(
  user: User | null,
  activeToolName?: string
): VisitorSession {
  const sessions = getStoredSessions();
  let currentSessionId = '';

  try {
    currentSessionId = localStorage.getItem(CURRENT_SESSION_ID_KEY) || '';
  } catch {
    // ignore
  }

  const env = getClientEnvironment();
  const now = new Date().toISOString();

  let existingIndex = sessions.findIndex((s) => s.id === currentSessionId);

  if (existingIndex !== -1) {
    const s = sessions[existingIndex];
    if (user) {
      s.type = 'registered';
      s.userId = user.id;
      s.userName = user.name;
      s.userEmail = user.email;
    }
    s.lastActive = now;
    s.status = 'online';
    s.pagesViewed += 1;
    if (activeToolName) {
      s.lastToolUsed = activeToolName;
    }
    sessions[existingIndex] = s;
    saveStoredSessions(sessions);
    return s;
  }

  // Create new session
  const newId = `sess_${user ? 'reg' : 'guest'}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .substring(2, 6)}`;

  try {
    localStorage.setItem(CURRENT_SESSION_ID_KEY, newId);
  } catch {
    // ignore
  }

  const newSession: VisitorSession = {
    id: newId,
    type: user ? 'registered' : 'unregistered',
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    device: env.device,
    browser: env.browser,
    location: 'Current Browser Session',
    startedAt: now,
    lastActive: now,
    pagesViewed: 1,
    calculationsRun: 0,
    lastToolUsed: activeToolName || 'Calculators Hub',
    status: 'online',
  };

  const updated = [newSession, ...sessions.slice(0, 49)];
  saveStoredSessions(updated);
  return newSession;
}

export function recordCalculationEvent(toolName: string, isRegistered: boolean): void {
  const sessions = getStoredSessions();
  let currentSessionId = '';
  try {
    currentSessionId = localStorage.getItem(CURRENT_SESSION_ID_KEY) || '';
  } catch {
    // ignore
  }

  const idx = sessions.findIndex((s) => s.id === currentSessionId);
  if (idx !== -1) {
    sessions[idx].calculationsRun += 1;
    sessions[idx].lastToolUsed = toolName;
    sessions[idx].lastActive = new Date().toISOString();
    sessions[idx].status = 'online';
    saveStoredSessions(sessions);
  }
}

export function getTelemetrySummary(): AppTelemetrySummary {
  const sessions = getStoredSessions();

  let registeredCount = 0;
  let unregisteredCount = 0;
  let activeNowCount = 0;
  let registeredCalcs = 0;
  let unregisteredCalcs = 0;

  const calculatorPopularity: Record<
    string,
    { registered: number; unregistered: number; total: number }
  > = {
    'Loan Calculator': { registered: 12, unregistered: 18, total: 30 },
    'Currency Converter': { registered: 9, unregistered: 24, total: 33 },
    'Savings Growth': { registered: 8, unregistered: 14, total: 22 },
    'Compound Interest': { registered: 11, unregistered: 12, total: 23 },
    'Investment Returns': { registered: 15, unregistered: 9, total: 24 },
    'Debt Payoff': { registered: 7, unregistered: 11, total: 18 },
    'Budget 50/30/20': { registered: 10, unregistered: 13, total: 23 },
  };

  const nowMs = Date.now();

  for (const s of sessions) {
    if (s.type === 'registered') {
      registeredCount += 1;
      registeredCalcs += s.calculationsRun;
    } else {
      unregisteredCount += 1;
      unregisteredCalcs += s.calculationsRun;
    }

    // Active within last 20 minutes
    const lastActiveMs = new Date(s.lastActive).getTime();
    if (nowMs - lastActiveMs <= 20 * 60 * 1000) {
      activeNowCount += 1;
    }

    if (s.lastToolUsed && calculatorPopularity[s.lastToolUsed]) {
      if (s.type === 'registered') {
        calculatorPopularity[s.lastToolUsed].registered += 1;
      } else {
        calculatorPopularity[s.lastToolUsed].unregistered += 1;
      }
      calculatorPopularity[s.lastToolUsed].total += 1;
    }
  }

  return {
    totalVisitors: sessions.length,
    registeredCount,
    unregisteredCount,
    activeNowCount,
    totalCalculationsRun: registeredCalcs + unregisteredCalcs,
    registeredCalculationsRun: registeredCalcs,
    unregisteredCalculationsRun: unregisteredCalcs,
    calculatorPopularity,
    recentSessions: sessions,
  };
}

export const BASELINE_JOINED_MEMBERS: JoinedMemberRecord[] = [
  {
    id: 'usr_admin_001',
    name: 'Chief Administrator',
    email: 'admin@fincal.app',
    role: 'admin',
    title: 'Lead Fintech Architect',
    joinedAt: '2026-01-01T08:00:00.000Z',
    lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'Verified',
    device: 'Desktop (Windows)',
    calculationsRun: 18,
  },
  {
    id: 'usr_demo_002',
    name: 'Alex Morgan',
    email: 'alex@example.com',
    role: 'user',
    title: 'Portfolio Investor',
    joinedAt: '2026-01-15T09:30:00.000Z',
    lastActive: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'Active',
    device: 'Desktop (macOS)',
    calculationsRun: 24,
  },
  {
    id: 'usr_mem_003',
    name: 'Ngozi Okonjo',
    email: 'ngozi.o@fintech.ng',
    role: 'user',
    title: 'Senior Treasury Analyst',
    joinedAt: '2026-02-10T11:20:00.000Z',
    lastActive: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'Verified',
    device: 'Desktop (macOS)',
    calculationsRun: 12,
  },
  {
    id: 'usr_mem_004',
    name: 'David Adeleke',
    email: 'david.a@investments.org',
    role: 'user',
    title: 'Private Wealth Manager',
    joinedAt: '2026-03-04T14:45:00.000Z',
    lastActive: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    status: 'Active',
    device: 'Mobile (iOS)',
    calculationsRun: 9,
  },
  {
    id: 'usr_mem_005',
    name: 'Fatima Al-Mansoor',
    email: 'fatima.m@globalcap.ae',
    role: 'user',
    title: 'Risk & Compliance Lead',
    joinedAt: '2026-06-18T10:15:00.000Z',
    lastActive: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'Verified',
    device: 'Tablet (iPadOS)',
    calculationsRun: 16,
  },
  {
    id: 'usr_mem_006',
    name: 'Kofi Mensah',
    email: 'kofi.mensah@accrawealth.com',
    role: 'user',
    title: 'Real Estate Finance Strategist',
    joinedAt: '2026-08-22T16:00:00.000Z',
    lastActive: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: 'Active',
    device: 'Desktop (Windows)',
    calculationsRun: 7,
  },
  {
    id: 'usr_mem_007',
    name: 'Chinedu Eze',
    email: 'chinedu.eze@lagosfin.ng',
    role: 'user',
    title: 'Capital Markets Specialist',
    joinedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    status: 'Verified',
    device: 'Mobile (Android)',
    calculationsRun: 11,
  },
  {
    id: 'usr_mem_008',
    name: 'Amina Yusuf',
    email: 'amina.yusuf@fincal.app',
    role: 'admin',
    title: 'Financial Systems Auditor',
    joinedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'Verified',
    device: 'Desktop (Windows)',
    calculationsRun: 14,
  },
];

export function getJoinedMembersSummary(): MemberGrowthSummary {
  const membersMap = new Map<string, JoinedMemberRecord>();

  // 1. Seed baseline members
  for (const m of BASELINE_JOINED_MEMBERS) {
    membersMap.set(m.email.toLowerCase(), { ...m });
  }

  // 2. Read dynamically registered members from localStorage
  try {
    const raw = localStorage.getItem('fincal_registered_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const u of parsed) {
          if (!u.email) continue;
          const cleanEmail = u.email.toLowerCase();
          const existing = membersMap.get(cleanEmail);
          const joinedDate = u.createdAt || existing?.joinedAt || new Date().toISOString();
          membersMap.set(cleanEmail, {
            id: u.id || existing?.id || `usr_${Date.now()}`,
            name: u.name || existing?.name || cleanEmail.split('@')[0],
            email: u.email,
            role: u.role || existing?.role || 'user',
            title: u.title || existing?.title || (u.role === 'admin' ? 'Administrator' : 'Standard Member'),
            joinedAt: joinedDate,
            lastActive: u.lastLogin ? new Date(u.lastLogin).toISOString() : (existing?.lastActive || new Date().toISOString()),
            status: 'Verified',
            device: existing?.device || 'Desktop (Web)',
            calculationsRun: existing?.calculationsRun || 3,
          });
        }
      }
    }
  } catch {
    // ignore
  }

  const allMembers = Array.from(membersMap.values()).sort(
    (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
  );

  const nowMs = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * oneDayMs;
  const thirtyDaysMs = 30 * oneDayMs;

  let joinedToday = 0;
  let joinedThisWeek = 0;
  let joinedThisMonth = 0;
  let standardMembersCount = 0;
  let adminMembersCount = 0;
  const monthlyBreakdown: Record<string, number> = {};

  for (const m of allMembers) {
    const joinTime = new Date(m.joinedAt).getTime();
    const diff = nowMs - joinTime;

    if (diff <= oneDayMs) joinedToday += 1;
    if (diff <= sevenDaysMs) joinedThisWeek += 1;
    if (diff <= thirtyDaysMs) joinedThisMonth += 1;

    if (m.role === 'admin') adminMembersCount += 1;
    else standardMembersCount += 1;

    const monthKey = new Date(m.joinedAt).toLocaleString('en-US', { month: 'short', year: 'numeric' });
    monthlyBreakdown[monthKey] = (monthlyBreakdown[monthKey] || 0) + 1;
  }

  return {
    totalJoined: allMembers.length,
    joinedToday,
    joinedThisWeek,
    joinedThisMonth,
    standardMembersCount,
    adminMembersCount,
    monthlyBreakdown,
    members: allMembers,
  };
}
