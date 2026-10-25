let currentLocationId = 'start';
let moveInterval = null;
let saveTimeout = null;
let rewardVerified = false;
let isResetting = false;
let joystickPointerId = null;
const joystickVector = { dx: 0, dy: 0 };
const keysPressed = {};
const SAVE_KEY = 'nccu-career-adventure-save';

const state = {
  name: '',
  studentId: '',
  role: '',
  secondaryRole: '',
  exp: 0,
  // 玩家在地圖上的百分比座標 (0 ~ 100)
  playerX: 49.5,
  playerY: 45.0,
  locations: {
    start: {
      title: '🏰 四維堂・新手整備村',
      pos: '📍 座標：Si Wei Hall（四維堂正門與內部）',
      desc: '冒險起點！除了領取初始裝備，四維堂內設有「履歷快檢」與「Prism 光影展區」，完成體驗即可領取首筆經驗值！',
      companies: ['政大職涯中心', '履歷快檢顧問團', 'Prism 沉浸特展'],
      code: 'START2027',
      exp: 20,
      done: false,
      x: 49.5, y: 38.0
    },
    lit: {
      title: '📚 文學出版與文創村',
      pos: '📍 座標：Main Library（中正圖書館前廣場）',
      desc: '匯聚圖書出版、線上教育、文化策展與藝文內容產業。適合熱愛文字企劃、故事轉譯與教育推廣的冒險者！',
      companies: ['誠品生活', '天下文化', '親子天下', 'Hahow 好學校', '藝文策展團隊'],
      code: 'BOOK2027',
      exp: 30,
      done: false,
      x: 20.5, y: 32.0
    },
    fin: {
      title: '🛡️ 金融保險與法遵村',
      pos: '📍 座標：Administration Building（行政大樓前）',
      desc: '各大金控、壽險產險、精算風控與法務合規重鎮。不限商管背景，歡迎外語、法律、社科與數理跨域人才詢問 MA 計畫！',
      companies: ['國泰金控 / 國泰人壽', '富邦金控 / 富邦產險', '南山人壽', '中信金控', '安聯人壽'],
      code: 'FIN2027',
      exp: 30,
      done: false,
      x: 76.0, y: 34.0
    },
    beauty: {
      title: '💄 美妝時尚與快消村',
      pos: '📍 座標：College of Commerce（商學院展區）',
      desc: '國際彩妝保養集團、時尚零售與 FMCG 快速消費品大廠。主打品牌行銷、社群電商、公關與儲備幹部 (MT)！',
      companies: ["台灣萊雅 L'Oréal", '雅詩蘭黛集團', '資生堂 Shiseido', '聯合利華 Unilever', 'UNIQLO'],
      code: 'BEAUTY2027',
      exp: 30,
      done: false,
      x: 18.5, y: 69.0
    },
    media: {
      title: '🎬 傳播影視與公關村',
      pos: '📍 座標：Zhi Xi Building（志希樓前四維道）',
      desc: '廣告代理商、公關顧問、新媒體影音與數位內容團隊。尋找具備社群洞察力、企劃力與跨領域溝通的創意人才！',
      companies: ['奧美集團 Ogilvy', '電通集團 dentsu', 'PressPlay', '女人迷 Womany', '影視音樂發行'],
      code: 'MEDIA2027',
      exp: 30,
      done: false,
      x: 37.5, y: 65.0
    },
    global: {
      title: '✈️ 跨國貿易與航空村',
      pos: '📍 座標：Guo Fu Building（果夫樓前四維道）',
      desc: '國際航空、外商物流、跨國製造與駐台商會組織。高度重視英/法/西/德/日/韓等外語溝通與跨文化專案協調力！',
      companies: ['星宇航空 / 長榮航空', 'DHL 國際快遞', '法國工商會', '迪卡儂 Decathlon', '外貿協會'],
      code: 'FLY2027',
      exp: 30,
      done: false,
      x: 62.0, y: 65.0
    },
    tech: {
      title: '⚡ 數位科技與軟體村',
      pos: '📍 座標：Information Building（資訊大樓展區）',
      desc: '半導體、雲端軟體、AI 應用與電商平台。除了研發工程師，亦招募大量產品經理 (PM)、UI/UX 與商業數據分析師！',
      companies: ['台積電 TSMC', 'Google 台灣', 'LINE Taiwan', '趨勢科技', '蝦皮購物 Shopee'],
      code: 'TECH2027',
      exp: 30,
      done: false,
      x: 80.5, y: 75.0
    },
    end: {
      title: '🏆 噴水池・公會結算所',
      pos: '📍 座標：中央噴水池廣場 / 學生服務台',
      desc: '四維道中心集結點！當累積滿 80 EXP（約探索 3 個展區），即可在此開啟防偽時間戳印，兌換周邊紀念品與抽獎券！',
      companies: ['學生服務台兌獎處', '一番賞摸彩箱', 'Prism 拍立得打卡站'],
      x: 49.8, y: 72.5
    }
  }
};

// 開局初始化
function startGame(isRestore = false) {
  const studentIdInput = document.getElementById('input-student-id');
  const studentId = studentIdInput.value.trim();
  if (!isRestore && !studentId) {
    alert('請先輸入學號，供工作人員核對領獎資格。');
    studentIdInput.focus();
    return;
  }

  const roleSelect = document.getElementById('input-role');
  const secondaryRoleSelect = document.getElementById('input-secondary-role');
  if (!isRestore && secondaryRoleSelect.value === roleSelect.value) {
    alert('第二職業請選擇不同於初始職業的學院，或選擇「不填寫」。');
    secondaryRoleSelect.focus();
    return;
  }

  state.name = document.getElementById('input-name').value || '政大冒險家';
  state.role = roleSelect.value;
  state.studentId = studentId;
  state.secondaryRole = secondaryRoleSelect.value;

  document.getElementById('scene-create').style.display = 'none';
  document.getElementById('status-bar').style.display = 'block';
  document.getElementById('scene-main').style.display = 'flex';

  document.getElementById('player-name-display').innerText = state.name;
  document.getElementById('avatar-name-tag').innerText = state.name;
  document.getElementById('player-role-badge').innerText = state.role;
  const secondaryRoleDisplay = document.getElementById('player-secondary-role');
  secondaryRoleDisplay.innerText = state.secondaryRole
    ? `第二職業：${state.secondaryRole}`
    : '';
  secondaryRoleDisplay.style.display = state.secondaryRole ? 'block' : 'none';

  // 點亮所選學院的推薦建築
  document.querySelectorAll('.map-node').forEach(el => el.classList.remove('recommended'));
  for (const roleSelectElement of [roleSelect, secondaryRoleSelect]) {
    if (!roleSelectElement.value) continue;
    const recomKey = roleSelectElement.options[roleSelectElement.selectedIndex]
      .getAttribute('data-recom');
    const recNode = document.getElementById(`node-${recomKey}`);
    if (recNode) recNode.classList.add('recommended');
  }

  // 初始位置設在四維堂正前方四維道上
  setPlayerPosition(49.5, 43.0, false);
  selectLocationPanel('start');
  updateStatus();
  scheduleSave();
}

function saveGame() {
  if (!state.name || isResetting) return;

  const saveData = {
    version: 2,
    name: state.name,
    studentId: state.studentId,
    role: state.role,
    secondaryRole: state.secondaryRole,
    exp: state.exp,
    playerX: state.playerX,
    playerY: state.playerY,
    doneLocations: Object.entries(state.locations)
      .filter(([, location]) => location.done)
      .map(([id]) => id),
    currentLocationId,
    scene: document.getElementById('scene-settle').style.display === 'block' ? 'settle' : 'main',
    rewardVerified
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (error) {
    console.error('無法保存冒險進度：', error);
  }
}

function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveGame, 250);
}

function restoreGame() {
  let rawSave;
  try {
    rawSave = localStorage.getItem(SAVE_KEY);
  } catch (error) {
    console.error('無法讀取冒險進度：', error);
    return;
  }
  if (!rawSave) return;

  let saved;
  try {
    saved = JSON.parse(rawSave);
  } catch (error) {
    console.error('冒險進度格式無效：', error);
    return;
  }

  const roleSelect = document.getElementById('input-role');
  const secondaryRoleSelect = document.getElementById('input-secondary-role');
  const validLocationIds = Object.keys(state.locations);
  if (
    !saved ||
    ![1, 2].includes(saved.version) ||
    typeof saved.name !== 'string' ||
    typeof saved.role !== 'string' ||
    !Array.from(roleSelect.options).some(option => option.value === saved.role) ||
    (saved.version === 2 && (
      typeof saved.studentId !== 'string' ||
      typeof saved.secondaryRole !== 'string' ||
      (saved.secondaryRole !== '' &&
        !Array.from(secondaryRoleSelect.options).some(option => option.value === saved.secondaryRole))
    )) ||
    (saved.version === 1 && saved.studentId !== undefined &&
      typeof saved.studentId !== 'string') ||
    !Array.isArray(saved.doneLocations) ||
    !saved.doneLocations.every(id =>
      validLocationIds.includes(id) && id !== 'end'
    ) ||
    !Number.isFinite(saved.playerX) ||
    !Number.isFinite(saved.playerY) ||
    !validLocationIds.includes(saved.currentLocationId) ||
    !['main', 'settle'].includes(saved.scene) ||
    typeof saved.rewardVerified !== 'boolean'
  ) {
    console.warn('冒險進度內容無效，已略過恢復。');
    return;
  }

  state.name = saved.name || '政大冒險家';
  state.studentId = saved.studentId || '';
  state.role = saved.role;
  state.secondaryRole = saved.secondaryRole || '';
  for (const id of saved.doneLocations) {
    state.locations[id].done = true;
  }
  state.exp = Object.values(state.locations)
    .filter(location => location.done)
    .reduce((total, location) => total + location.exp, 0);
  rewardVerified = saved.rewardVerified;

  document.getElementById('input-name').value = state.name;
  document.getElementById('input-student-id').value = state.studentId;
  roleSelect.value = state.role;
  secondaryRoleSelect.value = state.secondaryRole;
  startGame(true);

  for (const id of saved.doneLocations) {
    const node = document.getElementById(`node-${id}`);
    if (node) {
      node.classList.add('done');
      node.classList.remove('recommended');
    }
  }
  setPlayerPosition(saved.playerX, saved.playerY);
  selectLocationPanel(saved.currentLocationId);

  if (saved.scene === 'settle') {
    goSettle();
  }
  scheduleSave();
}

// 更新角色位置與靠近偵測
function setPlayerPosition(x, y, smooth = false) {
  state.playerX = Math.max(6, Math.min(94, x));
  state.playerY = Math.max(10, Math.min(92, y));

  const avatar = document.getElementById('player-avatar');
  if (smooth) {
    avatar.classList.add('smooth-glide');
  } else {
    avatar.classList.remove('smooth-glide');
  }

  avatar.style.left = state.playerX + '%';
  avatar.style.top = state.playerY + '%';

  checkProximity();
  if (state.name) scheduleSave();
}

// 點擊地圖建築直接走過去
function moveToLocation(id) {
  const loc = state.locations[id];
  if (!loc) return;
  const avatar = document.getElementById('player-avatar');
  avatar.classList.add('walking');
  setPlayerPosition(loc.x, loc.y + 4, true);
  selectLocationPanel(id);
  setTimeout(() => avatar.classList.remove('walking'), 450);
}

// 走路時自動偵測距離最近的建築物 (半徑 < 11% 即自動切換對話框)
function checkProximity() {
  let closestId = null;
  let minDist = 11.5;

  for (const [id, loc] of Object.entries(state.locations)) {
    const dx = state.playerX - loc.x;
    const dy = state.playerY - loc.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      closestId = id;
    }
  }

  if (closestId && closestId !== currentLocationId) {
    selectLocationPanel(closestId);
  }
}

// 虛擬搖桿移動控制
function startMove(dx, dy) {
  stopMove();
  const avatar = document.getElementById('player-avatar');
  avatar.classList.add('walking');
  const speed = 1.35;

  setPlayerPosition(state.playerX + dx * speed, state.playerY + dy * speed, false);
  moveInterval = setInterval(() => {
    setPlayerPosition(state.playerX + dx * speed, state.playerY + dy * speed, false);
  }, 50);
}

function stopMove() {
  if (moveInterval) {
    clearInterval(moveInterval);
    moveInterval = null;
  }
  joystickVector.dx = 0;
  joystickVector.dy = 0;
  joystickPointerId = null;
  const knob = document.getElementById('joystick-knob');
  if (knob) knob.style.transform = 'translate(-50%, -50%)';
  const avatar = document.getElementById('player-avatar');
  if (avatar) avatar.classList.remove('walking');
}

function updateJoystick(event) {
  const joystick = document.getElementById('map-joystick');
  const knob = document.getElementById('joystick-knob');
  const bounds = joystick.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const maxDistance = (bounds.width - knob.offsetWidth) / 2;
  let offsetX = event.clientX - centerX;
  let offsetY = event.clientY - centerY;
  const distance = Math.hypot(offsetX, offsetY);

  if (distance > maxDistance) {
    offsetX = offsetX / distance * maxDistance;
    offsetY = offsetY / distance * maxDistance;
  }
  knob.style.transform =
    `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;

  const magnitude = Math.min(distance / maxDistance, 1);
  if (magnitude < 0.12) {
    joystickVector.dx = 0;
    joystickVector.dy = 0;
    return;
  }
  const speed = (magnitude - 0.12) / 0.88;
  joystickVector.dx = offsetX / (distance || 1) * speed;
  joystickVector.dy = offsetY / (distance || 1) * speed;
}

function startJoystick(event) {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  stopMove();
  joystickPointerId = event.pointerId;
  event.currentTarget.setPointerCapture(event.pointerId);
  updateJoystick(event);
  document.getElementById('player-avatar').classList.add('walking');
  moveInterval = setInterval(() => {
    const speed = 1.95;
    if (joystickVector.dx || joystickVector.dy) {
      setPlayerPosition(
        state.playerX + joystickVector.dx * speed,
        state.playerY + joystickVector.dy * speed
      );
    }
  }, 50);
}

function moveJoystick(event) {
  if (event.pointerId !== joystickPointerId) return;
  event.preventDefault();
  updateJoystick(event);
}

function stopJoystick(event) {
  if (event.pointerId !== joystickPointerId) return;
  stopMove();
}

// 鍵盤 WASD 與方向鍵支援
window.addEventListener('keydown', (e) => {
  // 若使用者正在輸入密語或名字，不攔截按鍵
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
  if (document.getElementById('scene-main').style.display === 'none') return;

  const key = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
    e.preventDefault();
    keysPressed[key] = true;
    processKeyboardMove();
  }
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  delete keysPressed[key];
  if (Object.keys(keysPressed).length === 0) {
    const avatar = document.getElementById('player-avatar');
    if (avatar) avatar.classList.remove('walking');
  }
});

function processKeyboardMove() {
  let dx = 0, dy = 0;
  if (keysPressed['arrowup'] || keysPressed['w']) dy -= 1;
  if (keysPressed['arrowdown'] || keysPressed['s']) dy += 1;
  if (keysPressed['arrowleft'] || keysPressed['a']) dx -= 1;
  if (keysPressed['arrowright'] || keysPressed['d']) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const avatar = document.getElementById('player-avatar');
    avatar.classList.add('walking');
    const speed = 1.6;
    setPlayerPosition(state.playerX + dx * speed, state.playerY + dy * speed, false);
  }
}

// 渲染下方 RPG 對話框內容
function selectLocationPanel(id) {
  currentLocationId = id;
  const loc = state.locations[id];

  document.getElementById('panel-title').innerText = loc.title;
  document.getElementById('panel-location-sub').innerText = loc.pos;
  document.getElementById('panel-desc').innerText = loc.desc;

  const compContainer = document.getElementById('panel-companies');
  compContainer.innerHTML = (loc.companies || []).map(c => `<span class="company-tag">${c}</span>`).join('');

  const status = document.getElementById('panel-status');
  const action = document.getElementById('panel-action');
  const settleBtn = document.getElementById('panel-settle-btn');
  const tip = document.getElementById('panel-tip');

  if (id === 'end') {
    action.style.display = 'none';
    settleBtn.style.display = 'block';
    status.innerText = state.exp >= 80 ? '✓ 可結算兌獎' : `尚差 ${80 - state.exp} EXP`;
    status.style.background = state.exp >= 80 ? '#059669' : '#451a03';
  } else {
    settleBtn.style.display = 'none';
    tip.innerText = `💡 測試密語：輸入 ${loc.code} 解鎖此建築`;
    if (loc.done) {
      status.innerText = '✓ 已討伐完成';
      status.style.background = '#059669';
      action.style.display = 'none';
    } else {
      status.innerText = `未探索 (+${loc.exp} EXP)`;
      status.style.background = '#451a03';
      action.style.display = 'block';
    }
  }
  if (state.name) scheduleSave();
}

// 驗證企業通關密碼
function submitPanelCode() {
  const input = document.getElementById('panel-code-input');
  const val = input.value.trim().toUpperCase();
  const loc = state.locations[currentLocationId];

  if (!loc || loc.done) return;

  if (val === loc.code) {
    loc.done = true;
    state.exp += loc.exp;
    input.value = '';

    const nodeEl = document.getElementById(`node-${currentLocationId}`);
    if (nodeEl) {
      nodeEl.classList.add('done');
      nodeEl.classList.remove('recommended');
    }

    alert(`🎉 成功攻略「${loc.title}」！獲得 +${loc.exp} EXP！`);
    selectLocationPanel(currentLocationId);
    updateStatus();
  } else {
    alert(`密語錯誤！Demo 測試請輸入：${loc.code}`);
  }
}

function updateStatus() {
  document.getElementById('exp-text').innerText = state.exp;
  document.getElementById('exp-fill').style.width = Math.min(state.exp, 100) + '%';
  const lvl = document.getElementById('player-level');
  const rank = document.getElementById('rank-title');

  if (state.exp >= 80) {
    lvl.innerText = 'MAX';
    rank.innerText = '四維道傳奇勇者';
  } else if (state.exp >= 50) {
    lvl.innerText = '3';
    rank.innerText = '資深探險家';
  } else if (state.exp >= 20) {
    lvl.innerText = '2';
    rank.innerText = '進階冒險者';
  } else {
    lvl.innerText = '1';
    rank.innerText = '新手見習生';
  }
}

// 背包道具彈窗
function openModal(type) {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const content = document.getElementById('modal-content');

  if (type === 'card') {
    title.innerText = '📜 攤位破冰攻略卡';
    content.innerHTML = `
      <ul>
        <li><strong>【問 HR 人資】</strong><br>「身為跨領域背景的學生，貴公司在篩選新鮮人時最看重哪項專案特質？」</li>
        <li><strong>【問美妝/傳播/文創主管】</strong><br>「面對近期社群與數位工具轉變，品牌企劃職位的日常工作有哪些新挑戰？」</li>
        <li><strong>【問金融/科技/外商學長姐】</strong><br>「非本科系加入貴司團隊或 MA 計畫，前半年建議如何快速補強實務能力？」</li>
      </ul>
    `;
  } else if (type === 'tips') {
    title.innerText = '💡 博覽會實戰錦囊';
    content.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.6;">1. 開場 30 秒簡介「科系＋一項實作或社團經驗」。<br>2. 挑 1~2 題破冰卡問題深度交流，展現事前準備。<br>3. 結束前主動向攤位小天使索取通關密語！</p>`;
  } else if (type === 'info') {
    title.innerText = '🔑 各建築測試密語一覽';
    content.innerHTML = `
      <ul style="font-family: monospace;">
        <li>四維堂 (Si Wei Hall)：<strong>START2027</strong> (+20)</li>
        <li>總圖 (Main Library)：<strong>BOOK2027</strong> (+30)</li>
        <li>行政大樓 (Admin Bldg)：<strong>FIN2027</strong> (+30)</li>
        <li>商學院 (Commerce)：<strong>BEAUTY2027</strong> (+30)</li>
        <li>志希樓 (Zhi Xi Bldg)：<strong>MEDIA2027</strong> (+30)</li>
        <li>果夫樓 (Guo Fu Bldg)：<strong>FLY2027</strong> (+30)</li>
        <li>資訊大樓 (Info Bldg)：<strong>TECH2027</strong> (+30)</li>
      </ul>
    `;
  }
  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function saveStudentId() {
  const input = document.getElementById('legacy-student-id');
  const studentId = input.value.trim();
  if (!studentId) {
    alert('請輸入學號。');
    input.focus();
    return;
  }

  state.studentId = studentId;
  input.value = '';
  goSettle();
}

// 結算所切換與核銷
function goSettle() {
  document.getElementById('scene-main').style.display = 'none';
  document.getElementById('scene-settle').style.display = 'block';
  document.getElementById('legacy-student-id-entry').style.display =
    state.studentId ? 'none' : 'block';
  const roleSummary = state.secondaryRole
    ? `主職業：${state.role}\n第二職業：${state.secondaryRole}`
    : `主職業：${state.role}`;
  document.getElementById('settle-summary').innerText =
    `${state.name}｜學號：${state.studentId || '舊存檔未提供'}\n${roleSummary}`;

  const visitedCount = Object.values(state.locations).filter(l => l.done).length;
  document.getElementById('settle-visited').innerText = `已攻略建築：${visitedCount} 處 ｜ 累積經驗：${state.exp} EXP`;

  const msg = document.getElementById('settle-status-msg');
  const btn = document.getElementById('verify-btn');

  if (!state.studentId) {
    msg.innerHTML = '<span style="color: #fbbf24;">⚠️ 請先補登學號，供工作人員核對領獎資格</span>';
    btn.disabled = true;
    btn.style.background = '#334155';
  } else if (state.exp >= 80) {
    msg.innerHTML = `<span style="color: #10b981; font-weight: bold;">✅ 任務達標！請由服務台人員點擊核銷</span>`;
    btn.disabled = false;
    btn.style.background = '#d97706';
  } else {
    msg.innerHTML = `<span style="color: #fbbf24;">⚠️ 尚差 ${80 - state.exp} EXP 解鎖兌獎（建議再逛 1~2 棟建築）</span>`;
    btn.disabled = true;
    btn.style.background = '#334155';
  }
  if (rewardVerified) {
    btn.disabled = true;
    btn.style.background = '#475569';
    btn.innerText = state.studentId
      ? '✓ 已完成服務台核銷與學號登記'
      : '✓ 已完成服務台核銷';
  }
  scheduleSave();
}

function backToTasks() {
  document.getElementById('scene-settle').style.display = 'none';
  document.getElementById('scene-main').style.display = 'flex';
  scheduleSave();
}

function resetGame() {
  if (saveTimeout) clearTimeout(saveTimeout);
  stopMove();
  isResetting = true;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    isResetting = false;
    console.error('無法清除冒險進度：', error);
    alert('清除進度失敗，請確認瀏覽器允許此網頁使用本機儲存空間。');
    return;
  }
  window.location.reload();
}

function verifyReward() {
  if (rewardVerified || state.exp < 80 || !state.studentId) return;

  const btn = document.getElementById('verify-btn');
  btn.disabled = true;
  btn.style.background = '#475569';
  btn.innerText = '✓ 已完成服務台核銷與學號登記';
  rewardVerified = true;
  scheduleSave();
  alert('🎉 恭喜通關！請領取政大徵才月專屬周邊與抽獎券！');
}

function initializeSecondaryRoleOptions() {
  const primarySelect = document.getElementById('input-role');
  const secondarySelect = document.getElementById('input-secondary-role');
  for (const option of primarySelect.options) {
    const secondaryOption = new Option(option.text, option.value);
    secondaryOption.setAttribute('data-recom', option.getAttribute('data-recom'));
    secondarySelect.add(secondaryOption);
  }
}

window.addEventListener('beforeunload', saveGame);
initializeSecondaryRoleOptions();
const joystick = document.getElementById('map-joystick');
joystick.addEventListener('pointerdown', startJoystick);
joystick.addEventListener('pointermove', moveJoystick);
joystick.addEventListener('pointerup', stopJoystick);
joystick.addEventListener('pointercancel', stopJoystick);
joystick.addEventListener('lostpointercapture', stopMove);
restoreGame();

// 防偽動態時間戳印
setInterval(() => {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);
  const elem = document.getElementById('dynamic-time');
  if (elem) elem.innerText = timeStr;
}, 80);