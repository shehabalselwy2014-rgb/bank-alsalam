// ============================================================
// بيانات كأس العالم 2026 - المجموعات والمباريات وجدول النقاط
// مسابقة بنك السلام كابيتال - مأرب، اليمن 🇾🇪
// ============================================================

const WORLD_CUP_DATA = {
  tournamentName: "كأس العالم 2026",
  bankName: "بنك السلام كابيتال",
  bankShortName: "السلام كابيتال",
  bankLocation: "مأرب - اليمن",
  bankFullName: "بنك السلام كابيتال للتمويل الأصغر الإسلامي",
  organizer: "بنك السلام كابيتال",
  country: "اليمن",
  currency: "ريال يمني",
  website: "https://www.alsalamcb.com",
  phone: "8000086",
  social: {
    facebook: "https://www.facebook.com/acbsalambank",
    twitter: "https://x.com/alsalamcb",
    instagram: "https://www.instagram.com/alsalamcb/",
    youtube: "https://www.youtube.com/@alsalamcb",
    whatsapp: "8000086",
    appStore: "https://apps.apple.com/app/id6503481023",
    googlePlay: "https://play.google.com/store/apps/details?id=com.AamalTech.AlsalamCapitalBank"
  },
  startDate: "2026-06-11",
  endDate: "2026-07-19",
  groupsEndDate: "2026-06-27",

  // نقاط المسابقة
  scoring: {
    // توقعات المجموعات
    correctGroupWinner: 10,
    correctGroupRunnerUp: 10,
    correctBestThird: 15,
    perfectGroupOrder: 30,
    socialShareBonus: 5,
    referralBonus: 3,
    // توقعات المباريات
    matchCorrectResult: 2,    // توقع الفائز/تعادل
    matchExactScore: 5        // توقع النتيجة الصحيحة
  },

  prizes: {
    first: { label: "المركز الأول", amount: "20,000 ريال يمني", count: 1 },
    second: { label: "المركز الثاني", amount: "10,000 ريال يمني", count: 1 },
    third: { label: "المركز الثالث", amount: "5,000 ريال يمني", count: 1 },
    encouragement: { label: "جوائز تشجيعية", amount: "1,000 ريال يمني", count: 10 },
    daily: { label: "جوائز يومية", amount: "500 ريال يمني", count: 30 }
  },

  predictionsOpen: true,
  officialResults: {},

  // المجموعات
  groups: [
    {
      id: "A", name: "المجموعة A",
      teams: [
        { name: "المكسيك", flag: "🇲🇽", code: "MEX" },
        { name: "جنوب أفريقيا", flag: "🇿🇦", code: "RSA" },
        { name: "كوريا الجنوبية", flag: "🇰🇷", code: "KOR" },
        { name: "التشيك", flag: "🇨🇿", code: "CZE" }
      ]
    },
    {
      id: "B", name: "المجموعة B",
      teams: [
        { name: "كندا", flag: "🇨🇦", code: "CAN" },
        { name: "البوسنة والهرسك", flag: "🇧🇦", code: "BIH" },
        { name: "قطر", flag: "🇶🇦", code: "QAT" },
        { name: "سويسرا", flag: "🇨🇭", code: "SUI" }
      ]
    },
    {
      id: "C", name: "المجموعة C",
      teams: [
        { name: "البرازيل", flag: "🇧🇷", code: "BRA" },
        { name: "المغرب", flag: "🇲🇦", code: "MAR" },
        { name: "هايتي", flag: "🇭🇹", code: "HAI" },
        { name: "اسكتلندا", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", code: "SCO" }
      ]
    },
    {
      id: "D", name: "المجموعة D",
      teams: [
        { name: "الولايات المتحدة", flag: "🇺🇸", code: "USA" },
        { name: "باراغواي", flag: "🇵🇾", code: "PAR" },
        { name: "أستراليا", flag: "🇦🇺", code: "AUS" },
        { name: "تركيا", flag: "🇹🇷", code: "TUR" }
      ]
    },
    {
      id: "E", name: "المجموعة E",
      teams: [
        { name: "ألمانيا", flag: "🇩🇪", code: "GER" },
        { name: "كوراساو", flag: "🇨🇼", code: "CUW" },
        { name: "ساحل العاج", flag: "🇨🇮", code: "CIV" },
        { name: "الإكوادور", flag: "🇪🇨", code: "ECU" }
      ]
    },
    {
      id: "F", name: "المجموعة F",
      teams: [
        { name: "هولندا", flag: "🇳🇱", code: "NED" },
        { name: "اليابان", flag: "🇯🇵", code: "JPN" },
        { name: "تونس", flag: "🇹🇳", code: "TUN" },
        { name: "السويد", flag: "🇸🇪", code: "SWE" }
      ]
    },
    {
      id: "G", name: "المجموعة G",
      teams: [
        { name: "بلجيكا", flag: "🇧🇪", code: "BEL" },
        { name: "مصر", flag: "🇪🇬", code: "EGY" },
        { name: "إيران", flag: "🇮🇷", code: "IRN" },
        { name: "نيوزيلندا", flag: "🇳🇿", code: "NZL" }
      ]
    },
    {
      id: "H", name: "المجموعة H",
      teams: [
        { name: "إسبانيا", flag: "🇪🇸", code: "ESP" },
        { name: "الرأس الأخضر", flag: "🇨🇻", code: "CPV" },
        { name: "السعودية", flag: "🇸🇦", code: "KSA" },
        { name: "الأوروغواي", flag: "🇺🇾", code: "URU" }
      ]
    },
    {
      id: "I", name: "المجموعة I",
      teams: [
        { name: "فرنسا", flag: "🇫🇷", code: "FRA" },
        { name: "السنغال", flag: "🇸🇳", code: "SEN" },
        { name: "العراق", flag: "🇮🇶", code: "IRQ" },
        { name: "النرويج", flag: "🇳🇴", code: "NOR" }
      ]
    },
    {
      id: "J", name: "المجموعة J",
      teams: [
        { name: "الأرجنتين", flag: "🇦🇷", code: "ARG" },
        { name: "الجزائر", flag: "🇩🇿", code: "ALG" },
        { name: "النمسا", flag: "🇦🇹", code: "AUT" },
        { name: "الأردن", flag: "🇯🇴", code: "JOR" }
      ]
    },
    {
      id: "K", name: "المجموعة K",
      teams: [
        { name: "البرتغال", flag: "🇵🇹", code: "POR" },
        { name: "الكونغو الديمقراطية", flag: "🇨🇩", code: "COD" },
        { name: "أوزبكستان", flag: "🇺🇿", code: "UZB" },
        { name: "كولومبيا", flag: "🇨🇴", code: "COL" }
      ]
    },
    {
      id: "L", name: "المجموعة L",
      teams: [
        { name: "إنجلترا", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "ENG" },
        { name: "كرواتيا", flag: "🇭🇷", code: "CRO" },
        { name: "غانا", flag: "🇬🇭", code: "GHA" },
        { name: "بنما", flag: "🇵🇦", code: "PAN" }
      ]
    }
  ]
};

// ======== إنشاء جدول المباريات تلقائياً ========

function generateMatchSchedule() {
  const matches = [];
  let matchId = 1;

  // ترتيب مباريات دور المجموعات (6 مباريات لكل مجموعة)
  // لكل مجموعة من 4 فرق: T1,T2,T3,T4
  // اليوم 1: T1 vs T2, T3 vs T4
  // اليوم 2: T1 vs T3, T4 vs T2
  // اليوم 3: T4 vs T1, T2 vs T3

  const groupDates = {
    A: { md1: "2026-06-11", md2: "2026-06-18", md3: "2026-06-24" },
    B: { md1: "2026-06-12", md2: "2026-06-18", md3: "2026-06-24" },
    C: { md1: "2026-06-13", md2: "2026-06-19", md3: "2026-06-24" },
    D: { md1: "2026-06-13", md2: "2026-06-19", md3: "2026-06-25" },
    E: { md1: "2026-06-14", md2: "2026-06-20", md3: "2026-06-25" },
    F: { md1: "2026-06-14", md2: "2026-06-20", md3: "2026-06-25" },
    G: { md1: "2026-06-15", md2: "2026-06-21", md3: "2026-06-26" },
    H: { md1: "2026-06-15", md2: "2026-06-21", md3: "2026-06-26" },
    I: { md1: "2026-06-16", md2: "2026-06-22", md3: "2026-06-26" },
    J: { md1: "2026-06-16", md2: "2026-06-22", md3: "2026-06-27" },
    K: { md1: "2026-06-17", md2: "2026-06-23", md3: "2026-06-27" },
    L: { md1: "2026-06-17", md2: "2026-06-23", md3: "2026-06-27" }
  };

  WORLD_CUP_DATA.groups.forEach(g => {
    const [T1, T2, T3, T4] = g.teams.map(t => t.code);
    const dates = groupDates[g.id];

    // Matchday 1
    matches.push({ id: `M${String(matchId++).padStart(3,'0')}`, group: g.id, round: "group", matchday: 1, date: dates.md1, team1: T1, team2: T2, label: `${g.id}1` });
    matches.push({ id: `M${String(matchId++).padStart(3,'0')}`, group: g.id, round: "group", matchday: 1, date: dates.md1, team1: T3, team2: T4, label: `${g.id}2` });
    // Matchday 2
    matches.push({ id: `M${String(matchId++).padStart(3,'0')}`, group: g.id, round: "group", matchday: 2, date: dates.md2, team1: T1, team2: T3, label: `${g.id}3` });
    matches.push({ id: `M${String(matchId++).padStart(3,'0')}`, group: g.id, round: "group", matchday: 2, date: dates.md2, team1: T4, team2: T2, label: `${g.id}4` });
    // Matchday 3
    matches.push({ id: `M${String(matchId++).padStart(3,'0')}`, group: g.id, round: "group", matchday: 3, date: dates.md3, team1: T4, team2: T1, label: `${g.id}5` });
    matches.push({ id: `M${String(matchId++).padStart(3,'0')}`, group: g.id, round: "group", matchday: 3, date: dates.md3, team1: T2, team2: T3, label: `${g.id}6` });
  });

  // Knockout stages (placeholders - will be filled based on actual results)
  const koRounds = [
    { stage: "round32", label: "دور الـ32", start: "2026-06-28", count: 16 },
    { stage: "round16", label: "دور الـ16", start: "2026-07-04", count: 8 },
    { stage: "quarter", label: "ربع النهائي", start: "2026-07-09", count: 4 },
    { stage: "semi", label: "نصف النهائي", start: "2026-07-14", count: 2 },
    { stage: "third", label: "المركز الثالث", start: "2026-07-18", count: 1 },
    { stage: "final", label: "النهائي", start: "2026-07-19", count: 1 }
  ];

  koRounds.forEach(r => {
    for (let i = 0; i < r.count; i++) {
      const dayOffset = Math.floor(i / Math.max(1, r.count / 6));
      const matchDate = new Date(r.start);
      matchDate.setDate(matchDate.getDate() + dayOffset);
      matches.push({
        id: `M${String(matchId++).padStart(3,'0')}`,
        group: null,
        round: r.stage,
        roundLabel: r.label,
        matchday: null,
        date: matchDate.toISOString().split('T')[0],
        team1: null,
        team2: null,
        label: `${r.stage}_${i+1}`,
        isKnockout: true
      });
    }
  });

  return matches;
}

// توليد جميع المباريات
const ALL_MATCHES = generateMatchSchedule();
const GROUP_MATCHES = ALL_MATCHES.filter(m => m.round === "group");
const KNOCKOUT_MATCHES = ALL_MATCHES.filter(m => m.isKnockout);

// ======== دوال مساعدة ========

function getAllTeams() {
  const allTeams = [];
  WORLD_CUP_DATA.groups.forEach(g => {
    g.teams.forEach(t => {
      allTeams.push({ ...t, groupId: g.id });
    });
  });
  return allTeams;
}

function getGroupById(id) {
  return WORLD_CUP_DATA.groups.find(g => g.id === id);
}

function getTeamByCode(code) {
  const all = getAllTeams();
  return all.find(t => t.code === code);
}

function getTeamName(code) {
  const t = getTeamByCode(code);
  return t ? t.name : code;
}

function getTeamFlag(code) {
  const t = getTeamByCode(code);
  return t ? t.flag : '';
}

function getMatchesByGroup(groupId) {
  return GROUP_MATCHES.filter(m => m.group === groupId);
}

function getMatchesByMatchday(md) {
  return GROUP_MATCHES.filter(m => m.matchday === md);
}

function getMatchesByDate(dateStr) {
  return ALL_MATCHES.filter(m => m.date === dateStr);
}

function getMatchResult(goals1, goals2) {
  if (goals1 === null || goals2 === null) return null;
  if (goals1 > goals2) return "1"; // team1 wins
  if (goals1 < goals2) return "2"; // team2 wins
  return "X"; // draw
}
