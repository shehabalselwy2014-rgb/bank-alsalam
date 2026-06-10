// ============================================================
// التطبيق الرئيسي - مسابقة توقعات كأس العالم 2026
// بنك السلام كابيتال - مأرب، اليمن 🇾🇪
// ============================================================

class PredictionSystem {
  constructor() {
    this.PARTICIPANTS_KEY = 'worldcup2026_participants';
    this.RESULTS_KEY = 'worldcup2026_results';
    this.SETTINGS_KEY = 'worldcup2026_settings';
    this.MATCH_PREDS_KEY = 'worldcup2026_matchpreds';
    this.participants = this.loadData(this.PARTICIPANTS_KEY, []);
    this.officialResults = this.loadData(this.RESULTS_KEY, {});
    this.settings = this.loadData(this.SETTINGS_KEY, { predictionsOpen: true, announcementMode: false });
    this.matchPredictions = this.loadData(this.MATCH_PREDS_KEY, {});
  }

  loadData(key, def) { try{return JSON.parse(localStorage.getItem(key))||def}catch(e){return def} }
  saveData(key, data) { try{localStorage.setItem(key,JSON.stringify(data))}catch(e){} }

  registerParticipant(data) {
    if(this.participants.find(p=>p.phone===data.phone)) return {success:false,message:'رقم الجوال مسجل مسبقاً!'};
    const p = {
      id:'P'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).substr(2,4).toUpperCase(),
      ...data, predictions:{}, matchPredictions:{}, points:0, matchPoints:0, rank:0,
      registrationDate:new Date().toISOString(),
      shareCode:this.generateShareCode(), referrals:[],
      pointsBreakdown:{groupWinners:0,groupRunnersUp:0,bestThird:0,perfectGroups:0,socialBonus:0,referralBonus:0,matchResults:0,matchExact:0}
    };
    this.participants.push(p);
    this.saveData(this.PARTICIPANTS_KEY,this.participants);
    return {success:true,participant:p};
  }

  savePredictions(pid, preds) {
    const i=this.participants.findIndex(p=>p.id===pid);
    if(i===-1)return{success:false,message:'غير موجود!'};
    this.participants[i].predictions=preds;
    this.saveData(this.PARTICIPANTS_KEY,this.participants);
    return{success:true};
  }

  // حفظ توقعات المباريات
  saveMatchPrediction(pid, matchId, homeGoals, awayGoals) {
    const i=this.participants.findIndex(p=>p.id===pid);
    if(i===-1)return{success:false,message:'غير موجود!'};
    if(!this.participants[i].matchPredictions) this.participants[i].matchPredictions = {};
    this.participants[i].matchPredictions[matchId] = { home: parseInt(homeGoals), away: parseInt(awayGoals) };
    this.saveData(this.PARTICIPANTS_KEY,this.participants);
    return{success:true};
  }

  // حفظ جميع توقعات المباريات دفعة واحدة
  saveAllMatchPredictions(pid, preds) {
    const i=this.participants.findIndex(p=>p.id===pid);
    if(i===-1)return{success:false,message:'غير موجود!'};
    this.participants[i].matchPredictions = preds;
    this.saveData(this.PARTICIPANTS_KEY,this.participants);
    return{success:true};
  }

  // حساب نقاط المباريات للمشارك
  calculateMatchPoints(pid) {
    const p=this.participants.find(x=>x.id===pid);
    if(!p||!p.matchPredictions) return{success:false};
    
    const results = this.officialResults.matchResults || {};
    const breakdown = { matchResults: 0, matchExact: 0 };
    let total = 0;

    Object.entries(p.matchPredictions).forEach(([matchId, pred]) => {
      const actual = results[matchId];
      if (!actual) return;
      
      const predResult = getMatchResult(pred.home, pred.away);
      const actualResult = getMatchResult(actual.home, actual.away);
      
      // 2 points for correct result (win/draw/loss)
      if (predResult === actualResult) {
        breakdown.matchResults += 2;
        total += 2;
      }
      
      // 5 points for exact score
      if (pred.home === actual.home && pred.away === actual.away) {
        breakdown.matchExact += 5;
        total += 5;
      }
    });

    const idx = this.participants.findIndex(x=>x.id===pid);
    this.participants[idx].matchPoints = total;
    this.participants[idx].pointsBreakdown.matchResults = breakdown.matchResults;
    this.participants[idx].pointsBreakdown.matchExact = breakdown.matchExact;
    this.participants[idx].points = (this.participants[idx].points || 0) + total;
    this.saveData(this.PARTICIPANTS_KEY,this.participants);
    return{success:true,total,breakdown};
  }

  calculateGroupPoints(pid) {
    const p=this.participants.find(x=>x.id===pid);
    if(!p||!this.officialResults||Object.keys(this.officialResults).length===0) return{success:false,points:0};
    
    const b={groupWinners:0,groupRunnersUp:0,bestThird:0,perfectGroups:0,socialBonus:p.predictions?.socialShare?5:0,referralBonus:(p.referrals?.length||0)*3};
    let total=0;
    
    WORLD_CUP_DATA.groups.forEach(g=>{
      const gr=this.officialResults[g.id];if(!gr)return;
      const pg=p.predictions.groups?.[g.id];if(!pg)return;
      if(pg.winner===gr.winner){b.groupWinners+=10;total+=10;}
      if(pg.runnerUp===gr.runnerUp){b.groupRunnersUp+=10;total+=10;}
      if(pg.winner===gr.winner&&pg.runnerUp===gr.runnerUp&&pg.third===gr.third&&pg.fourth===gr.fourth){b.perfectGroups+=30;total+=30;}
    });
    
    if(p.predictions.bestThird&&this.officialResults.bestThird){
      p.predictions.bestThird.forEach(c=>{if(this.officialResults.bestThird.includes(c)){b.bestThird+=15;total+=15;}});
    }
    total+=b.socialBonus+b.referralBonus;
    
    const i=this.participants.findIndex(x=>x.id===pid);
    this.participants[i].pointsBreakdown={...this.participants[i].pointsBreakdown,...b};
    const matchPts = this.participants[i].matchPoints || 0;
    this.participants[i].points = total + matchPts;
    this.saveData(this.PARTICIPANTS_KEY,this.participants);
    return{success:true,totalPoints:total,breakdown:b};
  }

  calculateAllPoints(pid) {
    this.calculateGroupPoints(pid);
    this.calculateMatchPoints(pid);
  }

  calculateAllRanks() {
    this.participants.forEach(p=>{this.calculateAllPoints(p.id);});
    const s=[...this.participants].sort((a,b)=>b.points-a.points);
    s.forEach((p,i)=>{const idx=this.participants.findIndex(x=>x.id===p.id);this.participants[idx].rank=i+1;});
    this.saveData(this.PARTICIPANTS_KEY,this.participants);
    return s;
  }

  getLeaderboard(limit=100){return this.calculateAllRanks().slice(0,limit);}
  addSocialShareBonus(pid){const i=this.participants.findIndex(p=>p.id===pid);if(i===-1)return false;this.participants[i].predictions.socialShare=true;this.saveData(this.PARTICIPANTS_KEY,this.participants);return true;}
  generateShareCode(){const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let r='';for(let i=0;i<8;i++)r+=c.charAt(Math.floor(Math.random()*c.length));return r;}
  
  getStats(){
    const t=this.participants.length;
    const b=this.participants.filter(p=>p.hasBankAccount==='yes').length;
    const w=this.participants.filter(p=>p.predictions&&Object.keys(p.predictions).length>0).length;
    const m=this.participants.filter(p=>p.matchPredictions&&Object.keys(p.matchPredictions).length>0).length;
    return{totalParticipants:t,hasBankAccount:b,withPredictions:w,withMatchPreds:m};
  }

  // حساب عدد توقعات المباريات لمشارك
  getMatchPredCount(pid) {
    const p=this.participants.find(x=>x.id===pid);
    if(!p||!p.matchPredictions) return 0;
    return Object.keys(p.matchPredictions).length;
  }
}

// ======== واجهة المستخدم ========
class UIManager {
  constructor(system) {
    this.system = system;
    this.currentParticipant = null;
    this.currentTab = 'predict';
    this.matchFilter = 'all';
    const saved = localStorage.getItem('currentUser');
    if(saved) try{const ud=JSON.parse(saved);this.currentParticipant=this.system.participants.find(p=>p.id===ud.id);}catch(e){}
    this.init();
  }

  init() { this.render(); this.attachEvents(); this.startCountdown(); }

  render() {
    const main = document.getElementById('mainContent');
    if(!main)return;
    
    const BANK = WORLD_CUP_DATA.bankShortName || WORLD_CUP_DATA.bankName;
    const LOC = WORLD_CUP_DATA.bankLocation;
    
    if(this.currentParticipant) {
      const mp = this.system.getMatchPredCount(this.currentParticipant.id);
      
      main.innerHTML = `
        <div class="container">
          <!-- ترحيب -->
          <div class="card mb-20">
            <div class="card-body" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:15px;">
              <div style="display:flex;align-items:center;gap:15px;">
                <img src="assets/logo-bank.png" alt="${WORLD_CUP_DATA.bankName}" style="height:45px;width:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <div>
                  <h3 style="font-size:18px;">👋 مرحباً ${this.currentParticipant.name}</h3>
                  <p style="color:var(--text-light);font-size:13px;">رمز مشاركتك: <strong style="color:#283c8c;font-family:monospace;font-size:16px;letter-spacing:2px;">${this.currentParticipant.shareCode}</strong></p>
                </div>
              </div>
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <span class="team-badge" style="background:#e8f5e9;color:#2e7d32;border-color:#a5d6a7;">🏆 ${this.currentParticipant.points||0} نقطة</span>
                <button class="btn" style="background:var(--accent);color:white;border:none;padding:8px 16px;border-radius:50px;cursor:pointer;font-size:14px;" onclick="ui.logout()">🚪 خروج</button>
              </div>
            </div>
          </div>
          
          <!-- التبويبات -->
          <div class="card">
            <div class="tabs" style="overflow-x:auto;flex-wrap:nowrap;">
              <button class="tab ${this.currentTab==='predictgroups'?'active':''}" onclick="ui.switchTab('predictgroups')" style="flex:0 0 auto;white-space:nowrap;">📋 المجموعات</button>
              <button class="tab ${this.currentTab==='matches'?'active':''}" onclick="ui.switchTab('matches')" style="flex:0 0 auto;white-space:nowrap;">⚽ المباريات (${mp})</button>
              <button class="tab ${this.currentTab==='leaderboard'?'active':''}" onclick="ui.switchTab('leaderboard')" style="flex:0 0 auto;white-space:nowrap;">🏆 المتصدرون</button>
              <button class="tab ${this.currentTab==='prizes'?'active':''}" onclick="ui.switchTab('prizes')" style="flex:0 0 auto;white-space:nowrap;">🎁 الجوائز</button>
              <button class="tab ${this.currentTab==='allmatches'?'active':''}" onclick="ui.switchTab('allmatches')" style="flex:0 0 auto;white-space:nowrap;">📅 جدول المباريات</button>
            </div>
            
            <div id="tabPredictGroups" class="tab-content ${this.currentTab==='predictgroups'?'active':''}">${this.renderPredictGroups()}</div>
            <div id="tabMatches" class="tab-content ${this.currentTab==='matches'?'active':''}">${this.renderMatchTab()}</div>
            <div id="tabLeaderboard" class="tab-content ${this.currentTab==='leaderboard'?'active':''}">${this.renderLBTab()}</div>
            <div id="tabPrizes" class="tab-content ${this.currentTab==='prizes'?'active':''}">${this.renderPrizesTab()}</div>
            <div id="tabAllMatches" class="tab-content ${this.currentTab==='allmatches'?'active':''}">${this.renderAllMatchesTab()}</div>
          </div>
        </div>`;
      
      if(this.currentTab==='predictgroups') this.populateGroupPredictions();
      if(this.currentTab==='matches') this.populateMatchPredictions();
      if(this.currentTab==='leaderboard') this.renderLeaderboard();
      if(this.currentTab==='allmatches') this.renderAllMatchesTable();
      
    } else {
      // الصفحة الرئيسية للزوار
      main.innerHTML = `
        <div class="container">
          <div style="text-align:center;margin-bottom:20px;margin-top:10px;">
            <img src="assets/logo-bank.png" alt="${WORLD_CUP_DATA.bankName}" style="height:70px;width:auto;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <p style="margin-top:5px;font-size:13px;color:var(--text-light);">🇾🇪 ${WORLD_CUP_DATA.bankFullName} - ${LOC}</p>
          </div>
          
          <div class="stats-banner" id="statsBanner"></div>
          
          <div class="registration-section">
            <div class="card">
              <div class="card-header" style="border-top:4px solid #d4a843;">
                <h2>📝 سجل الآن!</h2>
                <span class="team-badge" style="background:#283c8c;color:white;border-color:#283c8c;">🏆 ${BANK}</span>
              </div>
              <div class="card-body">
                <form id="registrationForm" onsubmit="ui.handleRegistration(event)">
                  <div class="form-group"><label>الاسم الكامل <span class="required">*</span></label><input type="text" class="form-control" id="fullName" required placeholder="أدخل اسمك الكامل" maxlength="100"></div>
                  <div class="form-group"><label>رقم الجوال (يمني) <span class="required">*</span></label><input type="tel" class="form-control" id="phone" required placeholder="7xxxxxxxx" pattern="7[0-9]{8}" maxlength="9" dir="ltr" style="text-align:left;"><div class="form-error" id="phoneError">يرجى إدخال رقم جوال يمني صحيح</div></div>
                  <div class="form-group"><label>المدينة/المنطقة <span class="required">*</span></label><select class="form-control" id="city" required><option value="">-- اختر --</option><option value="marib">مأرب</option><option value="sanaa">صنعاء</option><option value="aden">عدن</option><option value="taiz">تعز</option><option value="hudaydah">الحديدة</option><option value="hadramout">حضرموت</option><option value="ibb">إب</option><option value="dhamar">ذمار</option><option value="other">أخرى</option></select></div>
                  <div class="form-group"><label>هل لديك حساب في بنك السلام كابيتال؟ <span class="required">*</span></label><select class="form-control" id="hasBankAccount" required><option value="">-- اختر --</option><option value="yes">نعم، لدي حساب</option><option value="no">لا، ليس لدي حساب</option></select></div>
                  <div class="form-check"><input type="checkbox" id="agreeTerms" required><label for="agreeTerms">أوافق على <a href="#" onclick="document.getElementById('termsModal').classList.add('show');return false;" style="color:#283c8c;">الشروط والأحكام</a> <span class="required">*</span></label></div>
                  <button type="submit" class="btn btn-lg" style="width:100%;margin-top:15px;background:linear-gradient(135deg,#d4a843,#b8922e);color:#1a2a6b;font-weight:700;border:none;padding:14px 28px;border-radius:50px;cursor:pointer;font-size:18px;">🚀 سجل وابدأ التوقعات</button>
                  <div style="text-align:center;margin-top:12px;display:flex;justify-content:center;gap:15px;align-items:center;flex-wrap:wrap;">
                    <span style="font-size:13px;color:var(--text-light);">🏆 جوائز تصل إلى 20,000 ريال يمني</span>
                    <span style="width:1px;height:15px;background:#ddd;"></span>
                    <span style="font-size:13px;color:var(--text-light);">🇾🇪 بنك السلام كابيتال - مأرب</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <!-- شريط نقاط المسابقة -->
          <div class="card mb-20">
            <div class="card-body">
              <h3 style="text-align:center;margin-bottom:15px;">📊 نظام النقاط</h3>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:15px;">
                <div style="text-align:center;padding:12px;background:#f0f4ff;border-radius:10px;"><strong style="color:#283c8c;font-size:20px;">10</strong><br><span style="font-size:13px;">توقع المتصدر</span></div>
                <div style="text-align:center;padding:12px;background:#f0f4ff;border-radius:10px;"><strong style="color:#283c8c;font-size:20px;">10</strong><br><span style="font-size:13px;">توقع الوصيف</span></div>
                <div style="text-align:center;padding:12px;background:#fefaf0;border-radius:10px;"><strong style="color:#d4a843;font-size:20px;">15</strong><br><span style="font-size:13px;">أفضل ثوالث</span></div>
                <div style="text-align:center;padding:12px;background:#e8f5e9;border-radius:10px;"><strong style="color:#2e7d32;font-size:20px;">2</strong><br><span style="font-size:13px;">توقع فائز المباراة</span></div>
                <div style="text-align:center;padding:12px;background:#e8f5e9;border-radius:10px;"><strong style="color:#2e7d32;font-size:20px;">5</strong><br><span style="font-size:13px;">توقع النتيجة الصحيحة</span></div>
                <div style="text-align:center;padding:12px;background:#fce4ec;border-radius:10px;"><strong style="color:#c62828;font-size:20px;">30</strong><br><span style="font-size:13px;">ترتيب كامل للمجموعة</span></div>
              </div>
            </div>
          </div>
          
          <div class="prizes-section"><h2 style="text-align:center;margin-bottom:25px;font-size:28px;">🎁 الجوائز</h2>
            <p style="text-align:center;color:var(--text-light);margin-bottom:20px;">🇾🇪 بنك السلام كابيتال - مأرب، اليمن</p>
            <div class="prizes-grid">
              <div class="prize-card gold"><div class="prize-icon">🥇</div><div class="prize-amount">20,000 ريال</div><div class="prize-label">المركز الأول</div></div>
              <div class="prize-card silver"><div class="prize-icon">🥈</div><div class="prize-amount">10,000 ريال</div><div class="prize-label">المركز الثاني</div></div>
              <div class="prize-card bronze"><div class="prize-icon">🥉</div><div class="prize-amount">5,000 ريال</div><div class="prize-label">المركز الثالث</div></div>
              <div class="prize-card"><div class="prize-icon">🎁</div><div class="prize-amount">1,000 ريال</div><div class="prize-label">10 جوائز تشجيعية</div></div>
            </div>
          </div>
        </div>`;
      this.renderStats();
    }
  }

  renderStats() {
    const b=document.getElementById('statsBanner');if(!b)return;
    const s=this.system.getStats();
    b.innerHTML=`<div class="stat-card"><div class="stat-number">${s.totalParticipants}</div><div class="stat-label">👥 المشاركون</div></div><div class="stat-card"><div class="stat-number">${s.withPredictions}</div><div class="stat-label">📋 توقعوا المجموعات</div></div><div class="stat-card"><div class="stat-number">${s.withMatchPreds}</div><div class="stat-label">⚽ توقعوا المباريات</div></div><div class="stat-card"><div class="stat-number">${s.hasBankAccount}</div><div class="stat-label">🏦 عملاء السلام كابيتال</div></div>`;
  }

  // ========== توقعات المجموعات ==========
  renderPredictGroups() {
    const has=this.currentParticipant?.predictions?.groups&&Object.keys(this.currentParticipant.predictions.groups).length>0;
    if(!this.system.settings.predictionsOpen&&has)return`<div class="card-body text-center"><div style="font-size:60px;margin-bottom:15px;">✅</div><h3>تم تسجيل توقعات المجموعات!</h3><p style="color:var(--text-light);">تنتظرك ${GROUP_MATCHES.length} مباراة لتوقع نتيجتها!</p><button class="btn btn-primary" style="background:#283c8c;color:white;" onclick="ui.switchTab('matches')">⚽ توقع المباريات</button></div>`;
    if(!this.system.settings.predictionsOpen)return`<div class="card-body text-center"><div style="font-size:60px;margin-bottom:15px;">🔒</div><h3>باب التوقعات مغلق</h3><p style="color:var(--text-light);">انتهت فترة التوقعات. ترقبوا الإعلان!</p></div>`;
    return `<div class="card-body">
      <p style="margin-bottom:15px;color:var(--text-light);font-size:14px;">🎯 توقع المتصدر والوصيف والثالث والرابع لكل مجموعة</p>
      <form id="predictionsForm" onsubmit="ui.submitGroupPredictions(event)">
        <div class="groups-grid" id="predictionsGroups"></div>
        <div class="best-third-section"><div class="card"><div class="card-header" style="background:#fefaf0;"><h2>⭐ أفضل 8 منتخبات من المركز الثالث</h2><span class="team-badge" style="background:#d4a843;color:white;">اختر 8</span></div><div class="card-body"><p style="margin-bottom:15px;color:var(--text-light);font-size:14px;">أي 8 منتخبات من أصحاب المركز الثالث ستتأهل إلى دور الـ32؟</p><div class="best-third-grid" id="bestThirdGrid"></div></div></div></div>
        <div class="action-bar">
          <p style="font-size:12px;color:var(--text-light);margin-bottom:8px;">🇾🇪 بنك السلام كابيتال - مأرب، اليمن</p>
          <button type="submit" class="btn btn-lg" style="background:linear-gradient(135deg,#d4a843,#b8922e);color:#1a2a6b;border:none;padding:14px 36px;border-radius:50px;cursor:pointer;font-weight:700;font-size:18px;">✅ تأكيد توقعات المجموعات</button>
          <p style="font-size:13px;color:var(--text-light);margin-top:10px;">بعد التأكيد، ستنتقل إلى توقعات المباريات ⚽</p>
        </div>
      </form></div>`;
  }

  populateGroupPredictions() {
    const c=document.getElementById('predictionsGroups');if(!c)return;
    const ex=this.currentParticipant?.predictions?.groups||{};
    c.innerHTML=WORLD_CUP_DATA.groups.map(g=>{
      const p=ex[g.id]||{};
      const opts=g.teams.map(t=>'<option value="'+t.code+'">'+t.flag+' '+t.name+'</option>').join('');
      return '<div class="group-card"><div class="group-header"><h3>'+g.name+'</h3><span class="group-badge">'+g.id+'</span></div><div class="group-body">'+
        '<div class="team-select-row"><span class="position-label winner">🥇 متصدر</span><select class="team-select" data-group="'+g.id+'" data-pos="winner"><option value="">-- اختر --</option>'+opts+'</select></div>'+
        '<div class="team-select-row"><span class="position-label runner-up">🥈 وصيف</span><select class="team-select" data-group="'+g.id+'" data-pos="runnerUp"><option value="">-- اختر --</option>'+opts+'</select></div>'+
        '<div class="team-select-row"><span class="position-label third">🥉 ثالث</span><select class="team-select" data-group="'+g.id+'" data-pos="third"><option value="">-- اختر --</option>'+opts+'</select></div>'+
        '<div class="team-select-row"><span class="position-label fourth">⚪ رابع</span><select class="team-select" data-group="'+g.id+'" data-pos="fourth"><option value="">-- اختر --</option>'+opts+'</select></div></div></div>';
    }).join('');
    setTimeout(()=>{
      WORLD_CUP_DATA.groups.forEach(g=>{const p=ex[g.id]||{};['winner','runnerUp','third','fourth'].forEach(pos=>{const s=document.querySelector('[data-group="'+g.id+'"][data-pos="'+pos+'"]');if(s&&p[pos])s.value=p[pos];});});
      this.populateBestThird();
    },50);
  }

  populateBestThird() {
    const g=document.getElementById('bestThirdGrid');if(!g)return;
    const ex=this.currentParticipant?.predictions?.bestThird||[];
    const teams=WORLD_CUP_DATA.groups.map((t,i)=>{const tm=t.teams[2];return{code:tm?.code||'',name:tm?.name||'',flag:tm?.flag||'',gid:t.id};}).filter(t=>t.code);
    g.innerHTML=teams.map((t,i)=>'<div class="best-third-item"><span class="rank">'+(i+1)+'</span><span style="font-size:22px;">'+t.flag+'</span><span>'+t.name+'</span><span style="font-size:12px;color:var(--text-light);">(المجموعة '+t.gid+')</span><input type="checkbox" data-third-code="'+t.code+'" '+(ex.includes(t.code)?'checked':'')+' style="margin-right:auto;width:20px;height:20px;cursor:pointer;"></div>').join('');
  }

  submitGroupPredictions(e) {
    e.preventDefault();
    if(!this.currentParticipant){this.notify('خطأ','يجب تسجيل الدخول أولاً','error');return;}
    const pred={groups:{},bestThird:[]};let valid=true;const errs=[];
    WORLD_CUP_DATA.groups.forEach(g=>{
      const w=document.querySelector('[data-group="'+g.id+'"][data-pos="winner"]')?.value;
      const ru=document.querySelector('[data-group="'+g.id+'"][data-pos="runnerUp"]')?.value;
      const th=document.querySelector('[data-group="'+g.id+'"][data-pos="third"]')?.value;
      const fo=document.querySelector('[data-group="'+g.id+'"][data-pos="fourth"]')?.value;
      const s=[w,ru,th,fo].filter(v=>v);
      if(new Set(s).size!==s.length){errs.push('المجموعة '+g.id+': تكرار منتخب');valid=false;return;}
      if(!w||!ru){errs.push('المجموعة '+g.id+': اختر المتصدر والوصيف');valid=false;return;}
      pred.groups[g.id]={winner:w,runnerUp:ru,third:th||'',fourth:fo||''};
    });
    document.querySelectorAll('[data-third-code]').forEach(cb=>{if(cb.checked)pred.bestThird.push(cb.dataset.thirdCode);});
    if(pred.bestThird.length!==8){errs.push('اختر 8 منتخبات بالضبط من أفضل ثوالث');valid=false;}
    if(!valid){this.notify('خطأ',errs.join('\n'),'error');return;}
    const r=this.system.savePredictions(this.currentParticipant.id,pred);
    if(!r.success){this.notify('خطأ',r.message,'error');return;}
    this.notify('✅ توقعات المجموعات!','تم الحفظ! الآن توقع نتائج المباريات ⚽','success');
    setTimeout(()=>{this.switchTab('matches');},1000);
  }

  // ========== توقعات المباريات ==========
  renderMatchTab() {
    if(!this.system.settings.predictionsOpen) return `<div class="card-body text-center"><div style="font-size:60px;margin-bottom:15px;">🔒</div><h3>باب التوقعات مغلق</h3></div>`;
    
    const mdFilter = this.matchFilter === 'all' ? '' : this.matchFilter;
    
    return `<div class="card-body">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:20px;">
        <div>
          <h3>⚽ توقع نتائج المباريات</h3>
          <p style="font-size:13px;color:var(--text-light);">✅ الفائز/تعادل = 2 نقطة | 🎯 النتيجة الصحيحة = 5 نقاط</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-sm ${this.matchFilter==='all'?'btn-primary':''}" style="background:${this.matchFilter==='all'?'#283c8c':'#e0e0e0'};color:${this.matchFilter==='all'?'white':'#333'};border:none;padding:6px 12px;border-radius:20px;cursor:pointer;" onclick="ui.setMatchFilter('all')">الكل</button>
          <button class="btn btn-sm ${this.matchFilter==='md1'?'btn-primary':''}" style="background:${this.matchFilter==='md1'?'#283c8c':'#e0e0e0'};color:${this.matchFilter==='md1'?'white':'#333'};border:none;padding:6px 12px;border-radius:20px;cursor:pointer;" onclick="ui.setMatchFilter('md1')">الجولة 1</button>
          <button class="btn btn-sm ${this.matchFilter==='md2'?'btn-primary':''}" style="background:${this.matchFilter==='md2'?'#283c8c':'#e0e0e0'};color:${this.matchFilter==='md2'?'white':'#333'};border:none;padding:6px 12px;border-radius:20px;cursor:pointer;" onclick="ui.setMatchFilter('md2')">الجولة 2</button>
          <button class="btn btn-sm ${this.matchFilter==='md3'?'btn-primary':''}" style="background:${this.matchFilter==='md3'?'#283c8c':'#e0e0e0'};color:${this.matchFilter==='md3'?'white':'#333'};border:none;padding:6px 12px;border-radius:20px;cursor:pointer;" onclick="ui.setMatchFilter('md3')">الجولة 3</button>
        </div>
      </div>
      
      <div id="matchPredictionsContainer" style="min-height:300px;">
        <div style="text-align:center;padding:40px;"><div class="loading-spinner"></div><p style="margin-top:15px;">جاري تحميل المباريات...</p></div>
      </div>
      
      <div class="action-bar">
        <button class="btn btn-lg" style="background:linear-gradient(135deg,#283c8c,#1a2a6b);color:white;border:none;padding:14px 36px;border-radius:50px;cursor:pointer;font-weight:700;font-size:18px;" onclick="ui.saveMatchPredictions()">💾 حفظ توقعات المباريات</button>
      </div>
    </div>`;
  }

  setMatchFilter(filter) {
    this.matchFilter = filter;
    this.render();
  }

  populateMatchPredictions() {
    const c=document.getElementById('matchPredictionsContainer');
    if(!c) return;
    
    let matches = GROUP_MATCHES;
    if(this.matchFilter === 'md1') matches = matches.filter(m=>m.matchday===1);
    else if(this.matchFilter === 'md2') matches = matches.filter(m=>m.matchday===2);
    else if(this.matchFilter === 'md3') matches = matches.filter(m=>m.matchday===3);
    
    const existing = this.currentParticipant?.matchPredictions || {};
    
    let html = '<div style="display:grid;gap:12px;">';
    let lastGroup = '';
    
    matches.forEach(m => {
      const t1 = getTeamByCode(m.team1);
      const t2 = getTeamByCode(m.team2);
      const saved = existing[m.id] || {};
      const hg = saved.home !== undefined ? saved.home : '';
      const ag = saved.away !== undefined ? saved.away : '';
      
      if (m.group !== lastGroup) {
        lastGroup = m.group;
        const gName = WORLD_CUP_DATA.groups.find(g=>g.id===m.group)?.name || m.group;
        html += `<div style="margin-top:15px;padding:8px 12px;background:linear-gradient(135deg,#283c8c,#1a2a6b);color:white;border-radius:8px;font-weight:700;font-size:15px;">📌 ${gName} - الجولة ${m.matchday}</div>`;
      }
      
      html += `
        <div style="display:flex;align-items:center;gap:10px;padding:12px 15px;background:#f8f9fa;border-radius:10px;border:1px solid #eee;">
          <div style="flex:1;text-align:left;display:flex;align-items:center;gap:8px;justify-content:flex-end;">
            <span style="font-weight:600;">${t1?.name||'?'}</span>
            <span style="font-size:20px;">${t1?.flag||''}</span>
          </div>
          <div style="display:flex;align-items:center;gap:5px;">
            <input type="number" min="0" max="20" class="match-score-input" data-match="${m.id}" data-side="home" value="${hg}" placeholder="?" style="width:45px;padding:8px 6px;border:2px solid #ddd;border-radius:6px;text-align:center;font-size:16px;font-weight:700;">
            <span style="font-weight:700;color:#666;">-</span>
            <input type="number" min="0" max="20" class="match-score-input" data-match="${m.id}" data-side="away" value="${ag}" placeholder="?" style="width:45px;padding:8px 6px;border:2px solid #ddd;border-radius:6px;text-align:center;font-size:16px;font-weight:700;">
          </div>
          <div style="flex:1;text-align:right;display:flex;align-items:center;gap:8px;">
            <span style="font-size:20px;">${t2?.flag||''}</span>
            <span style="font-weight:600;">${t2?.name||'?'}</span>
          </div>
          <div style="font-size:11px;color:var(--text-light);min-width:50px;text-align:center;">
            ${m.date?.slice(5)||''}
          </div>
        </div>`;
    });
    
    html += '</div>';
    
    html += `<div style="margin-top:15px;padding:15px;background:#fff8e1;border-radius:10px;border:1px solid #ffe082;text-align:center;">
      <p style="font-size:14px;color:#f57f17;">💡 اترك الحقل فارغاً إذا لم ترد التوقع لمباراة معينة</p>
    </div>`;
    
    c.innerHTML = html;
    
    // Add keyboard navigation
    document.querySelectorAll('.match-score-input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const inputs = [...document.querySelectorAll('.match-score-input')];
          const idx = inputs.indexOf(input);
          if (idx + 1 < inputs.length) inputs[idx + 1].focus();
        }
      });
    });
  }

  saveMatchPredictions() {
    if(!this.currentParticipant){this.notify('خطأ','يجب تسجيل الدخول','error');return;}
    
    const preds = {};
    let count = 0;
    
    document.querySelectorAll('.match-score-input[data-side="home"]').forEach(inp => {
      const matchId = inp.dataset.match;
      const homeVal = inp.value.trim();
      const awayInp = document.querySelector(`.match-score-input[data-match="${matchId}"][data-side="away"]`);
      const awayVal = awayInp?.value.trim() || '';
      
      if (homeVal !== '' && awayVal !== '') {
        preds[matchId] = { home: parseInt(homeVal), away: parseInt(awayVal) };
        count++;
      }
    });
    
    if (count === 0) {
      this.notify('⚠️ تنبيه', 'لم تدخل أي توقعات للمباريات بعد', 'warning');
      return;
    }
    
    const r = this.system.saveAllMatchPredictions(this.currentParticipant.id, preds);
    if (!r.success) { this.notify('خطأ', r.message, 'error'); return; }
    
    this.notify('✅ تم الحفظ!', `توقعات ${count} مباراة محفوظة. بالتوفيق من بنك السلام كابيتال! 🏆`, 'success');
    setTimeout(() => this.render(), 1000);
  }

  // ========== جدول جميع المباريات ==========
  renderAllMatchesTab() {
    return `<div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:20px;">
        <h3>📅 جدول مباريات كأس العالم 2026</h3>
        <span class="team-badge" style="background:#283c8c;color:white;">${ALL_MATCHES.length} مباراة</span>
      </div>
      <div id="allMatchesTableContainer">
        <div style="text-align:center;padding:20px;"><div class="loading-spinner"></div></div>
      </div>
    </div>`;
  }

  renderAllMatchesTable() {
    const c = document.getElementById('allMatchesTableContainer');
    if(!c) return;
    
    // Group matches by date
    const byDate = {};
    ALL_MATCHES.forEach(m => {
      const d = m.date || 'unknown';
      if(!byDate[d]) byDate[d] = [];
      byDate[d].push(m);
    });
    
    const sortedDates = Object.keys(byDate).sort();
    
    let html = '';
    let matchNum = 1;
    
    sortedDates.forEach(date => {
      const matches = byDate[date];
      // Format date
      const d = new Date(date + 'T00:00:00');
      const dateStr = d.toLocaleDateString('ar-SA', { weekday:'long', month:'long', day:'numeric' });
      
      html += `<div style="margin-top:15px;">
        <div style="padding:8px 15px;background:#e8eaf6;border-radius:8px;font-weight:700;color:#283c8c;font-size:14px;">📅 ${dateStr}</div>`;
      
      matches.forEach(m => {
        const t1 = m.team1 ? getTeamByCode(m.team1) : null;
        const t2 = m.team2 ? getTeamByCode(m.team2) : null;
        const roundLabel = m.isKnockout ? m.roundLabel : `المجموعة ${m.group} - الجولة ${m.matchday}`;
        
        html += `<div style="display:flex;align-items:center;gap:10px;padding:10px 15px;border-bottom:1px solid #f0f0f0;font-size:14px;">
          <span style="color:var(--text-light);min-width:30px;">#${matchNum++}</span>
          <span style="flex:1;text-align:left;">
            ${t1 ? t1.flag + ' ' + t1.name : '🇾🇪 ?'}
          </span>
          <span style="font-weight:700;padding:2px 10px;background:#f0f0f0;border-radius:4px;font-size:13px;">vs</span>
          <span style="flex:1;text-align:right;">
            ${t2 ? t2.flag + ' ' + t2.name : '🇾🇪 ?'}
          </span>
          <span style="font-size:11px;color:var(--text-light);min-width:90px;text-align:center;">${roundLabel}</span>
        </div>`;
      });
      
      html += '</div>';
    });
    
    c.innerHTML = html;
  }

  // ========== المتصدرون ==========
  renderLBTab(){return`<div class="card-body"><div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:20px;">
    <div><h3>🏆 ترتيب المشاركين</h3><p style="font-size:13px;color:var(--text-light);">🇾🇪 بنك السلام كابيتال - مأرب</p></div>
    <button class="btn btn-sm" style="background:#283c8c;color:white;border:none;padding:8px 16px;border-radius:20px;cursor:pointer;" onclick="ui.refreshLB()">🔄 تحديث</button>
  </div><div id="leaderboardContainer"><div style="text-align:center;padding:40px;"><div class="loading-spinner" style="border-color:rgba(0,0,0,0.1);border-top-color:#283c8c;"></div><p style="margin-top:15px;">جاري التحميل...</p></div></div></div>`;}

  renderLeaderboard() {
    const c=document.getElementById('leaderboardContainer');if(!c)return;
    const lb=this.system.getLeaderboard(100);
    if(lb.length===0){c.innerHTML='<div style="text-align:center;padding:40px;"><div style="font-size:60px;margin-bottom:15px;">📊</div><h3>لا يوجد مشاركون بعد</h3><p style="color:var(--text-light);">كن أول من يشارك مع بنك السلام كابيتال!</p></div>';return;}
    const uid=this.currentParticipant?.id;
    let html=`<div style="overflow-x:auto;"><table class="leaderboard-table"><thead><tr><th>#</th><th>المشارك</th><th>المجموعات</th><th>المباريات</th><th>إضافي</th><th style="color:#d4a843;">🏆 المجموع</th></tr></thead><tbody>`;
    lb.forEach((p,i)=>{
      const isMe=p.id===uid;const b=p.pointsBreakdown||{};
      const groupPts = (b.groupWinners||0)+(b.groupRunnersUp||0)+(b.bestThird||0)+(b.perfectGroups||0);
      const matchPts = (b.matchResults||0)+(b.matchExact||0);
      const extra = (b.socialBonus||0)+(b.referralBonus||0);
      html+='<tr'+(isMe?' style="background:#fefaf0;font-weight:700;"':'')+'><td><span class="rank-badge '+(i<3?'rank-'+(i+1):'rank-other')+'">'+(i<3?['🥇','🥈','🥉'][i]:'#'+(i+1))+'</span></td><td>'+(isMe?'⭐ ':'')+p.name+(isMe?' (أنت)':'')+'</td><td>'+groupPts+'</td><td>'+matchPts+'</td><td>'+extra+'</td><td style="font-weight:900;font-size:20px;color:#d4a843;">'+p.points+'</td></tr>';
    });
    html+='</tbody></table></div>';
    c.innerHTML=html;
  }

  refreshLB(){const c=document.getElementById('leaderboardContainer');if(c){c.innerHTML='<div style="text-align:center;padding:20px;"><div class="loading-spinner"></div><p>جاري التحديث...</p></div>';}setTimeout(()=>this.renderLeaderboard(),300);}

  // ========== الجوائز ==========
  renderPrizesTab(){return`<div class="card-body">
    <div style="text-align:center;margin-bottom:20px;"><img src="assets/logo-bank.png" alt="بنك السلام كابيتال" style="height:50px;width:auto;border-radius:8px;"><p style="font-size:13px;color:var(--text-light);margin-top:5px;">🇾🇪 بنك السلام كابيتال - مأرب، اليمن</p></div>
    <div class="prizes-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr));">
      <div class="prize-card gold"><div class="prize-icon">🥇</div><div class="prize-amount">20,000</div><div class="prize-label">المركز الأول</div></div>
      <div class="prize-card silver"><div class="prize-icon">🥈</div><div class="prize-amount">10,000</div><div class="prize-label">المركز الثاني</div></div>
      <div class="prize-card bronze"><div class="prize-icon">🥉</div><div class="prize-amount">5,000</div><div class="prize-label">المركز الثالث</div></div>
      <div class="prize-card"><div class="prize-icon">🎁</div><div class="prize-amount">1,000</div><div class="prize-label">10 جوائز تشجيعية</div></div>
      <div class="prize-card"><div class="prize-icon">📅</div><div class="prize-amount">500</div><div class="prize-label">جوائز يومية</div></div>
      <div class="prize-card"><div class="prize-icon">👕</div><div class="prize-amount">قميص منتخب</div><div class="prize-label">أفضل 5 مشاركات</div></div>
    </div>
    <div class="card mt-20" style="background:#f8f9fa;"><div class="card-body"><h4>📋 شروط الجوائز</h4><ul style="list-style:none;padding:0;margin-top:10px;line-height:2;"><li>✅ صرف الجوائز عبر فروع بنك السلام كابيتال في مأرب</li><li>✅ فتح حساب مجاني لغير العملاء</li><li>✅ الإعلان عبر صفحات بنك السلام كابيتال</li><li>✅ الجوائز بالريال اليمني</li></ul></div></div></div>`;}

  // ========== تسجيل ==========
  handleRegistration(e){
    e.preventDefault();
    const name=document.getElementById('fullName').value.trim();
    const phone=document.getElementById('phone').value.trim();
    const city=document.getElementById('city').value;
    const hba=document.getElementById('hasBankAccount').value;
    if(!/^7[0-9]{8}$/.test(phone)){document.getElementById('phone').classList.add('error');document.getElementById('phoneError').style.display='block';return;}
    document.getElementById('phone').classList.remove('error');document.getElementById('phoneError').style.display='none';
    const r=this.system.registerParticipant({name,phone,city,hasBankAccount:hba,source:'web'});
    if(!r.success){this.notify('خطأ',r.message,'error');return;}
    this.currentParticipant=r.participant;
    localStorage.setItem('currentUser',JSON.stringify({id:r.participant.id}));
    this.notify('🎉 مرحباً بك!','تم التسجيل مع بنك السلام كابيتال!','success');
    setTimeout(()=>this.render(),800);
  }

  logout(){this.currentParticipant=null;localStorage.removeItem('currentUser');this.render();this.notify('🚪','من بنك السلام كابيتال','warning');}
  switchTab(t){this.currentTab=t;this.render();}

  startCountdown(){const update=()=>{
    const now=new Date();const wcStart=new Date('2026-06-11T00:00:00');const diff=wcStart-now;
    if(diff<=0){
      const gEnd=new Date('2026-06-27T23:59:00');const d2=gEnd-now;
      if(d2<=0){document.querySelectorAll('.countdown').forEach(el=>{el.innerHTML='<div style="font-size:18px;font-weight:700;">🏆 المونديال انطلق!</div>';});return;}
      const dd=Math.floor(d2/(1000*60*60*24));const hh=Math.floor((d2%(1000*60*60*24))/(1000*60*60));const mm=Math.floor((d2%(1000*60*60))/(1000*60));const ss=Math.floor((d2%(1000*60))/1000);
      document.querySelectorAll('.countdown').forEach(el=>{el.innerHTML='<div class="time-box"><span class="number">'+dd+'</span><span class="label">يوم</span></div><div class="time-box"><span class="number">'+hh+'</span><span class="label">ساعة</span></div><div class="time-box"><span class="number">'+mm+'</span><span class="label">دقيقة</span></div><div class="time-box"><span class="number">'+ss+'</span><span class="label">ثانية</span></div>';});
      return;
    }
    const d=Math.floor(diff/(1000*60*60*24));const h=Math.floor((diff%(1000*60*60*24))/(1000*60*60));const m=Math.floor((diff%(1000*60*60))/(1000*60));const s=Math.floor((diff%(1000*60))/1000);
    document.querySelectorAll('.countdown').forEach(el=>{el.innerHTML='<div class="time-box"><span class="number">'+d+'</span><span class="label">يوم</span></div><div class="time-box"><span class="number">'+h+'</span><span class="label">ساعة</span></div><div class="time-box"><span class="number">'+m+'</span><span class="label">دقيقة</span></div><div class="time-box"><span class="number">'+s+'</span><span class="label">ثانية</span></div>';});
  };update();setInterval(update,1000);}

  notify(title,msg,type='info'){const c=document.getElementById('toastContainer');if(!c)return;const icons={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};const t=document.createElement('div');t.className='toast '+type;t.innerHTML='<span class="toast-icon">'+(icons[type]||'ℹ️')+'</span><div class="toast-content"><div class="toast-title">'+title+'</div><div class="toast-message">'+msg+'</div></div>';c.appendChild(t);setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(100px)';t.style.transition='all 0.3s ease';setTimeout(()=>t.remove(),300);},4000);}

  attachEvents(){document.addEventListener('click',e=>{if(e.target.classList.contains('modal-overlay'))e.target.classList.remove('show');});}
}

let ui=null,system=null;
document.addEventListener('DOMContentLoaded',()=>{system=new PredictionSystem();ui=new UIManager(system);window.ui=ui;window.system=system;});
