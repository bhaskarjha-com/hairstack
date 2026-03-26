/* ============================================
   HairStack v2 — Personalized Protocol Engine
   ============================================ */

// ---------- State ----------
const state = {
    norwoodStage: null,
    age: null,
    father: null,
    grandfather: null,
    duration: null,
    riskTolerance: null,
    country: null
};

let treatmentsData = null;
let protocolsData = null;
let productsData = null;
let studiesData = null;

// ---------- Data Loading ----------
async function loadData() {
    try {
        const [t, p, pr, s] = await Promise.all([
            fetch('data/treatments.json').then(r => r.json()),
            fetch('data/protocols.json').then(r => r.json()),
            fetch('data/products-india.json').then(r => r.json()),
            fetch('data/studies.json').then(r => r.json())
        ]);
        treatmentsData = t.treatments;
        protocolsData = p.protocols;
        productsData = pr.products;
        studiesData = s.studies;
    } catch (e) {
        console.error('Failed to load data:', e);
    }
}

loadData();

// ---------- Navigation ----------
function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startAssessment() { goToScreen('screen-1'); }

function startOver() {
    Object.keys(state).forEach(k => state[k] = null);
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('select').forEach(s => s.value = '');
    document.querySelectorAll('[id^="btn-s"]').forEach(b => b.disabled = true);
    goToScreen('hero');
}

// ---------- Screen Handlers ----------
function selectNorwood(card, stage) {
    document.querySelectorAll('.norwood-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.norwoodStage = stage;
    document.getElementById('btn-s1-next').disabled = false;
}

function checkStep2() {
    state.age = document.getElementById('age').value;
    state.father = document.getElementById('father').value;
    state.grandfather = document.getElementById('grandfather').value;
    state.duration = document.getElementById('duration').value;
    document.getElementById('btn-s2-next').disabled = !(state.age && state.father && state.grandfather && state.duration);
}

function selectRisk(card, risk) {
    document.querySelectorAll('.risk-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.riskTolerance = risk;
    document.getElementById('btn-s3-next').disabled = false;
}

function selectCountry(card, country) {
    document.querySelectorAll('.country-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.country = country;
    document.getElementById('btn-s4-next').disabled = false;
}

// ============================================
//  PERSONALIZATION ENGINE (v2)
// ============================================

function getStageNum() {
    const s = state.norwoodStage;
    if (s === '3v') return 3.5;
    return typeof s === 'number' ? s : 3;
}

function getStageLabel() {
    const s = state.norwoodStage;
    if (s === '3v') return 'IIIv';
    const labels = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    return typeof s === 'number' ? labels[s] : String(s);
}

function getGeneticSeverity() {
    let score = 0;
    if (state.father === 'severe') score += 3;
    else if (state.father === 'moderate') score += 2;
    else if (state.father === 'mild') score += 1;
    if (state.grandfather === 'severe') score += 2;
    else if (state.grandfather === 'moderate') score += 1.5;
    else if (state.grandfather === 'mild') score += 0.5;
    if (score >= 4) return 'severe';
    if (score >= 2) return 'moderate';
    return 'mild';
}

function getUrgency() {
    const stageNum = getStageNum();
    const genetic = getGeneticSeverity();
    const ageGroup = state.age;
    let urgency = 0;

    // Stage
    if (stageNum >= 5) urgency += 3;
    else if (stageNum >= 3.5) urgency += 2;
    else if (stageNum >= 3) urgency += 1.5;
    else urgency += 0.5;

    // Genetics
    if (genetic === 'severe') urgency += 2;
    else if (genetic === 'moderate') urgency += 1;

    // Age (younger with loss = more urgent)
    if (ageGroup === '18-24') urgency += 2;
    else if (ageGroup === '25-30') urgency += 1.5;
    else if (ageGroup === '31-35') urgency += 1;

    // Duration
    if (state.duration === '<1') urgency += 0.5; // fast onset
    else if (state.duration === '5+') urgency += 1; // long unchecked

    if (urgency >= 6) return { level: 'critical', label: 'Critical', color: 'var(--red)' };
    if (urgency >= 4) return { level: 'high', label: 'High', color: 'var(--amber)' };
    if (urgency >= 2) return { level: 'moderate', label: 'Moderate', color: 'var(--accent)' };
    return { level: 'low', label: 'Low', color: 'var(--green)' };
}

function getRecoveryPotential() {
    const stageNum = getStageNum();
    const dur = state.duration;
    if (stageNum <= 2 && (dur === '<1' || dur === '1-3')) return { pct: '85-95%', label: 'Excellent', msg: 'Most miniaturized follicles are still alive and recoverable.' };
    if (stageNum <= 3.5 && dur !== '5+') return { pct: '65-80%', label: 'Good', msg: 'Majority of follicles can be reactivated with consistent treatment.' };
    if (stageNum <= 5) return { pct: '40-60%', label: 'Moderate', msg: 'Significant regrowth possible, but some follicles may be permanently miniaturized.' };
    return { pct: '20-35%', label: 'Limited', msg: 'Focus shifts to maintaining existing hair and moderate regrowth. Advanced stages may benefit from transplant consultation.' };
}

function getProjectedTrajectory() {
    const stageNum = getStageNum();
    const genetic = getGeneticSeverity();
    const ageGroup = state.age;

    let yearsTo5, yearsTo6;
    if (genetic === 'severe') {
        yearsTo5 = stageNum >= 5 ? 0 : Math.max(1, Math.round((5 - stageNum) * 2));
        yearsTo6 = stageNum >= 6 ? 0 : Math.max(2, Math.round((6 - stageNum) * 2.5));
    } else if (genetic === 'moderate') {
        yearsTo5 = stageNum >= 5 ? 0 : Math.max(2, Math.round((5 - stageNum) * 3.5));
        yearsTo6 = stageNum >= 6 ? 0 : Math.max(4, Math.round((6 - stageNum) * 4));
    } else {
        yearsTo5 = stageNum >= 5 ? 0 : Math.max(5, Math.round((5 - stageNum) * 5));
        yearsTo6 = stageNum >= 6 ? 0 : Math.max(8, Math.round((6 - stageNum) * 6));
    }

    // Younger = faster progression
    if (ageGroup === '18-24') { yearsTo5 = Math.round(yearsTo5 * 0.7); yearsTo6 = Math.round(yearsTo6 * 0.7); }

    const currentLabel = getStageLabel();
    if (stageNum >= 6) return `At Stage ${currentLabel} with ${genetic} genetics, further loss is likely limited to density reduction in remaining areas.`;
    if (yearsTo5 === 0) return `At Stage ${currentLabel}, without treatment, progression to Stage VI typically occurs within ${yearsTo6} years with ${genetic} genetic factors.`;
    return `At Stage ${currentLabel} with ${genetic} family history, without treatment, most men in your profile progress to Stage V within ${yearsTo5} years and Stage VI within ${yearsTo6} years.`;
}

// ---------- Doctor's Consultation Generator ----------
function generateConsultation() {
    const stageLabel = getStageLabel();
    const stageNum = getStageNum();
    const genetic = getGeneticSeverity();
    const urgency = getUrgency();
    const recovery = getRecoveryPotential();
    const tier = state.riskTolerance;

    // Opening — stage + age + genetics
    let opening = '';
    if (urgency.level === 'critical') {
        opening = `You're at a critical juncture. At ${state.age} with Norwood Stage ${stageLabel} and ${genetic} family history, your hair loss is advancing aggressively. The window for maximum recovery is narrowing — but it's still open.`;
    } else if (urgency.level === 'high') {
        opening = `Your profile demands attention. At ${state.age} with Stage ${stageLabel} and ${genetic} genetic history, you're on an accelerated timeline. The good news: you can still intercept this trajectory.`;
    } else if (urgency.level === 'moderate') {
        opening = `You're in a treatable position. Stage ${stageLabel} at ${state.age} with ${genetic} family history gives you a solid window for intervention.`;
    } else {
        opening = `You're in an excellent position. Early-stage loss at ${state.age} with ${genetic} family history means a strong prognosis with early action.`;
    }

    // Recovery potential
    let recoveryMsg = ` Recovery potential: ${recovery.pct} of affected follicles. ${recovery.msg}`;

    // Duration context
    let durationMsg = '';
    if (state.duration === '<1') durationMsg = ' You caught this early — less than a year of visible loss means most follicles are still responsive.';
    else if (state.duration === '1-3') durationMsg = ' At 1-3 years of visible loss, the majority of your follicles are still salvageable with consistent treatment.';
    else if (state.duration === '3-5') durationMsg = ' With 3-5 years of unchecked loss, some follicles may have fully miniaturized, but significant recovery is still achievable.';
    else if (state.duration === '5+') durationMsg = ' After 5+ years of untreated loss, some permanent follicle death is likely. Focus on preserving what remains and stimulating recoverable follicles.';

    // Protocol justification
    let protocolMsg = '';
    if (tier === 'zero-risk') {
        protocolMsg = ' Your Zero Risk Protocol targets growth stimulation and absorption enhancement without any pharmaceutical DHT blockers — ideal if you\'re not comfortable with finasteride. Minoxidil + microneedling is a well-proven combination with zero systemic risk.';
    } else if (tier === 'optimal') {
        protocolMsg = ' Your Optimal Protocol attacks hair loss through 4 independent mechanisms — DHT blocking (topical finasteride, 0.002% side effect rate), growth stimulation (minoxidil), stem cell activation (Redensyl), and absorption amplification (microneedling). This is what a dermatologist would prescribe.';
    } else if (tier === 'aggressive') {
        protocolMsg = ' Your Aggressive Protocol throws the full arsenal at this: systemic growth stimulation (oral minoxidil), targeted DHT blocking (topical finasteride), stem cell activation (Redensyl), microneedling amplification, and direct growth factor injection (PRP). This maximizes your chances at the cost of moderate medical monitoring.';
    }

    // Prognosis
    let prognosisMsg = '';
    if (urgency.level === 'critical' || urgency.level === 'high') {
        prognosisMsg = ' With consistent treatment, you can expect to halt further loss within 3 months and see visible improvement by month 6. Without treatment, your genetic trajectory points toward significant further loss.';
    } else {
        prognosisMsg = ' With consistent treatment, expect stabilization within 2-3 months and meaningful regrowth by month 6-9. Your prognosis is favorable.';
    }

    return opening + recoveryMsg + durationMsg + protocolMsg + prognosisMsg;
}

// ============================================
//  PROTOCOL GENERATION
// ============================================

function generateProtocol() {
    if (!state.riskTolerance || !protocolsData) return;
    const protocol = protocolsData[state.riskTolerance];
    if (!protocol) return;

    renderRiskProfile();
    renderConsultation();
    renderProtocolHeader(protocol);
    renderTreatments(protocol);
    renderRoutine(protocol);
    renderTimeline();
    renderMonitoring(protocol);
    renderPrognosis();
    renderDay1(protocol);
    renderPhotoProtocol();
    renderMistakes(protocol);
    renderShoppingList(protocol);
    renderStudies(protocol);

    goToScreen('screen-5');
}

// ============================================
//  RENDERERS
// ============================================

function renderRiskProfile() {
    const urgency = getUrgency();
    const recovery = getRecoveryPotential();
    const genetic = getGeneticSeverity();

    document.getElementById('risk-profile').innerHTML = `
        <h3>🔍 Your Clinical Profile</h3>
        <div class="profile-grid">
            <div>
                <div class="profile-item-label">Stage</div>
                <div class="profile-item-value">NW ${getStageLabel()}</div>
            </div>
            <div>
                <div class="profile-item-label">Age</div>
                <div class="profile-item-value">${state.age}</div>
            </div>
            <div>
                <div class="profile-item-label">Genetics</div>
                <div class="profile-item-value" style="text-transform:capitalize;color:${genetic === 'severe' ? 'var(--red)' : genetic === 'moderate' ? 'var(--amber)' : 'var(--green)'}">${genetic}</div>
            </div>
            <div>
                <div class="profile-item-label">Urgency</div>
                <div class="profile-item-value" style="color:${urgency.color}">${urgency.label}</div>
            </div>
            <div>
                <div class="profile-item-label">Recovery Potential</div>
                <div class="profile-item-value" style="color:var(--green)">${recovery.pct}</div>
            </div>
            <div>
                <div class="profile-item-label">Duration</div>
                <div class="profile-item-value">${state.duration === '<1' ? '< 1' : state.duration} yr</div>
            </div>
        </div>
    `;
}

function renderConsultation() {
    const text = generateConsultation();
    document.getElementById('consultation-section').innerHTML = `
        <div class="consultation-icon">🩺</div>
        <h3>Your Assessment</h3>
        <p class="consultation-text">${text}</p>
    `;
    document.getElementById('consultation-section').style.display = 'block';
}

function renderProtocolHeader(protocol) {
    let efficacyColor = protocol.efficacy >= 70 ? 'var(--green)' : protocol.efficacy >= 50 ? 'var(--amber)' : 'var(--red)';
    const currency = state.country === 'india' ? '₹' : '$';
    const costMin = state.country === 'india' ? protocol.monthlyMinCost.INR : protocol.monthlyMinCost.USD;
    const costMax = state.country === 'india' ? protocol.monthlyMaxCost.INR : protocol.monthlyMaxCost.USD;

    document.getElementById('protocol-header').innerHTML = `
        <div class="protocol-name">${protocol.name}</div>
        <div class="protocol-tagline">${protocol.tagline}</div>
        <div class="protocol-stats">
            <div><span class="protocol-stat-value" style="color:${efficacyColor}">${protocol.efficacy}%</span><span class="protocol-stat-label">Efficacy</span></div>
            <div><span class="protocol-stat-value">${protocol.treatments.length}</span><span class="protocol-stat-label">Treatments</span></div>
            <div><span class="protocol-stat-value">${currency}${costMin}-${costMax}</span><span class="protocol-stat-label">/month</span></div>
        </div>
        <div class="efficacy-bar"><div class="efficacy-fill" style="width:${protocol.efficacy}%;background:linear-gradient(90deg,var(--accent),${efficacyColor})"></div></div>
        <p style="margin-top:16px;font-size:0.85rem;color:var(--text-muted);text-align:center">${protocol.riskLabel}</p>
    `;
}

function renderTreatments(protocol) {
    if (!treatmentsData) return;
    const cards = protocol.treatments.map(tid => {
        const t = treatmentsData.find(tr => tr.id === tid);
        if (!t) return '';
        return `
            <div class="treatment-card">
                <div class="treatment-header">
                    <div class="treatment-name">${t.name}</div>
                    <div class="treatment-evidence evidence-${t.evidenceRating}">⭐ ${t.evidenceRating}/5 — ${t.evidenceLabel}</div>
                </div>
                <div class="treatment-mechanism">${t.mechanismShort}</div>
                <div class="treatment-schedule">📅 ${t.applicationFrequency} · ⏱ ${t.timeToResults}</div>
                ${t.notes ? `<div style="margin-top:8px;font-size:0.85rem;color:var(--amber)">💡 ${t.notes}</div>` : ''}
            </div>
        `;
    }).join('');
    document.getElementById('treatment-list').innerHTML = `<h3>💊 Your ${protocol.treatments.length} Treatments</h3>${cards}`;
}

function renderRoutine(protocol) {
    const r = protocol.routine;
    let html = '';
    const blocks = [
        { key: 'morning', icon: '☀️', title: 'Morning', items: r.morning },
        { key: 'evening', icon: '🌙', title: 'Evening', items: r.evening },
        { key: 'supplements', icon: '💊', title: 'Daily Supplements', items: r.supplements },
        { key: 'weekly', icon: '📅', title: 'Weekly', items: r.weekly },
        { key: 'monthly', icon: '📆', title: 'Monthly', items: r.monthly }
    ];

    blocks.forEach(({ icon, title, items, key }) => {
        if (!items || !items.length) return;
        html += `<div class="routine-block"><div class="routine-block-title">${icon} ${title}</div>`;
        items.forEach(step => {
            const timeKey = key === 'weekly' ? 'day' : (key === 'monthly' ? null : 'time');
            const timeVal = timeKey ? step[timeKey] : 'Monthly';
            html += `
                <div class="routine-step">
                    <div class="routine-time">${timeVal}</div>
                    <div>
                        <div class="routine-action">${step.action}</div>
                        ${step.duration ? `<div style="font-size:0.8rem;color:var(--text-muted)">⏱ ${step.duration}</div>` : ''}
                        ${step.note ? `<div class="routine-note">⚠️ ${step.note}</div>` : ''}
                    </div>
                </div>`;
        });
        html += '</div>';
    });

    document.getElementById('routine-content').innerHTML = html;
}

// ---------- NEW: Timeline ----------
function renderTimeline() {
    const stageNum = getStageNum();
    const recovery = getRecoveryPotential();
    const urgency = getUrgency();

    let sheddingWarning = 'You may experience increased hair shedding. This is a POSITIVE sign — follicles are resetting from resting phase to growth phase.';
    if (urgency.level === 'critical') sheddingWarning += ' Do NOT stop treatment. This is the hardest phase psychologically, but it proves the treatment is working.';

    const milestones = [
        { period: 'Week 2-6', icon: '⚡', title: 'Initial Shedding Phase', desc: sheddingWarning, type: 'warning' },
        { period: 'Month 3', icon: '🔬', title: 'Stabilization', desc: 'Shedding normalizes. Fine vellus (baby) hairs begin appearing. Hair fall slows significantly. Book your 3-month dermatologist check-in and blood work.', type: 'info' },
        { period: 'Month 5-6', icon: '📈', title: 'Visible Improvement', desc: 'Vellus hairs thicken into terminal hairs. First cosmetic improvements visible. Thinning areas begin to fill in.', type: 'success' },
        { period: 'Month 9', icon: '🎯', title: 'Significant Results', desc: 'Substantial improvement visible to others. Hair density and coverage noticeably better. Compare with Day 1 photos.', type: 'success' },
        { period: 'Month 12', icon: '🏆', title: 'Near-Peak Results', desc: `Expected recovery: ${recovery.pct} of affected follicles${stageNum >= 5 ? '. At your stage, maintaining this result is the primary goal.' : '. Continue treatment for maintenance — results are cumulative.'}`, type: 'success' }
    ];

    const html = milestones.map(m => `
        <div class="timeline-item timeline-${m.type}">
            <div class="timeline-period">${m.icon} ${m.period}</div>
            <div class="timeline-content">
                <div class="timeline-title">${m.title}</div>
                <div class="timeline-desc">${m.desc}</div>
            </div>
        </div>
    `).join('');

    document.getElementById('timeline-content').innerHTML = html;
    document.getElementById('timeline-section').style.display = 'block';
}

// ---------- NEW: Monitoring Checklist ----------
function renderMonitoring(protocol) {
    const hasFinasteride = protocol.treatments.includes('topical-finasteride') || protocol.treatments.includes('oral-finasteride');
    const section = document.getElementById('monitoring-section');

    if (!hasFinasteride) {
        section.style.display = 'none';
        return;
    }

    const isOral = protocol.treatments.includes('oral-finasteride');
    const riskRate = isOral ? '~2%' : '0.002%';
    const productName = isOral ? 'Finpecia' : 'Morr-F';

    section.innerHTML = `
        <h3>🛡️ Safety Monitoring</h3>
        <p class="monitoring-intro">Your protocol includes finasteride (${riskRate} real-world side effect rate). Track these markers every 2 weeks against your Day 1 baseline:</p>
        <div class="monitoring-grid">
            <div class="monitoring-item">
                <div class="monitoring-label">Morning Erections</div>
                <div class="monitoring-normal">Normal: 3-5×/week</div>
                <div class="monitoring-stop">⚠️ Stop ${productName} if: absent for 2+ consecutive weeks</div>
            </div>
            <div class="monitoring-item">
                <div class="monitoring-label">Libido (1-10)</div>
                <div class="monitoring-normal">Normal: your baseline score</div>
                <div class="monitoring-stop">⚠️ Stop ${productName} if: drop of 3+ points for 2+ weeks</div>
            </div>
            <div class="monitoring-item">
                <div class="monitoring-label">Mood & Energy</div>
                <div class="monitoring-normal">Normal: your baseline</div>
                <div class="monitoring-stop">⚠️ Stop ${productName} if: new sustained anxiety or low mood for 2+ weeks</div>
            </div>
        </div>
        <div class="monitoring-action">
            <strong>If ANY stop trigger fires:</strong> Drop ${productName} → replace with a second daily Minoxidil 5% (plain) dose. Continue everything else unchanged. Side effects from topical finasteride resolve within days to weeks. You lose nothing permanent.
        </div>
    `;
    section.style.display = 'block';
}

// ---------- NEW: Prognosis (v3: personalized) ----------
function renderPrognosis() {
    const trajectory = getProjectedTrajectory();
    const stageNum = getStageNum();
    const recovery = getRecoveryPotential();
    const genetic = getGeneticSeverity();
    const urgency = getUrgency();

    let withText = '';
    if (stageNum <= 3 && genetic !== 'severe') {
        withText = `With this protocol: High probability of <strong style="color:var(--green)">significant regrowth</strong>. Expect stabilization by month 3, visible thickening by month 5-6, and near-peak recovery (${recovery.pct}) by month 12. Your early stage and moderate genetics work in your favor.`;
    } else if (stageNum <= 4) {
        withText = `With this protocol: Strong chance of <strong style="color:var(--green)">meaningful regrowth</strong>. Expect stabilization within 3 months and visible improvement by month 6. Recovery potential: ${recovery.pct}. Consistency is critical — every missed application matters at your stage.`;
    } else {
        withText = `With this protocol: Primary goal is <strong style="color:var(--amber)">halting further loss</strong> with potential for partial regrowth. ${recovery.pct} recovery of affected follicles is realistic. Some follicles at NW${stageNum}+ may be permanently miniaturized, but treatment can visually improve density in remaining areas.`;
    }
    withText += ' Treatment is ongoing — stopping reverses gains within 6-12 months.';

    document.getElementById('prognosis-content').innerHTML = `
        <p class="prognosis-text"><strong>Without treatment:</strong> ${trajectory}</p>
        <p class="prognosis-with">${withText}</p>
    `;
    document.getElementById('prognosis-section').style.display = 'block';
}

// ---------- v3: Day 1 Checklist ----------
function renderDay1(protocol) {
    const hasMicroneedling = protocol.treatments.includes('microneedling');
    const hasFinasteride = protocol.treatments.includes('topical-finasteride') || protocol.treatments.includes('oral-finasteride');

    let checklist = `
        <div class="day1-item">📸 <strong>Take 5 baseline photos</strong> — front hairline, left temple, right temple, crown (phone overhead), back of head. Same mirror, same lighting, dry hair.</div>
        <div class="day1-item">📊 <strong>Record baseline metrics</strong> — Libido (1-10), mood (1-10), morning erections per week. This is your comparison point.</div>
        <div class="day1-item">🛒 <strong>Buy all products</strong> from the shopping list below. Don't start until you have everything.</div>`;

    if (hasMicroneedling) {
        checklist += `\n        <div class="day1-item">📅 <strong>Set weekly reminder</strong> — Add a recurring calendar event for microneedling day (e.g., every Wednesday evening).</div>`;
    }
    if (hasFinasteride) {
        checklist += `\n        <div class="day1-item">🩺 <strong>Book a dermatologist appointment</strong> — Get a professional baseline assessment. Bring this protocol printout to discuss.</div>`;
    }

    checklist += `\n        <div class="day1-item">📱 <strong>Create a phone album</strong> — Name it "Hair Progress" for monthly photos. Set a monthly reminder (same date each month).</div>`;

    document.getElementById('day1-section').innerHTML = `
        <h3>✅ Day 1 Checklist</h3>
        <p class="day1-intro">Before your first application, complete these steps. They take 15 minutes and make the difference between a protocol that works and one you abandon.</p>
        <div class="day1-grid">${checklist}</div>
    `;
    document.getElementById('day1-section').style.display = 'block';
}

// ---------- v3: Photo Protocol ----------
function renderPhotoProtocol() {
    document.getElementById('photo-section').innerHTML = `
        <h3>📸 Progress Photo Protocol</h3>
        <p class="photo-intro">Consistent photos are the ONLY reliable way to track progress. Bad photos → can't see improvement → you quit. Follow this exactly:</p>
        <div class="photo-grid">
            <div class="photo-rule"><strong>📍 Same location</strong> — Always the same bathroom mirror, same distance</div>
            <div class="photo-rule"><strong>💡 Same lighting</strong> — Overhead light on, natural light off (close blinds). Harsh light shows thinning honestly.</div>
            <div class="photo-rule"><strong>💧 Dry hair</strong> — Wet hair clumps and looks thinner than reality. Always photograph dry.</div>
            <div class="photo-rule"><strong>📐 5 angles every time</strong> — Front hairline, left temple, right temple, crown (hold phone overhead), back of head.</div>
            <div class="photo-rule"><strong>📅 Same day each month</strong> — Pick the 1st or 15th. Don't compare Week 3 vs Week 7 — compare Month 1 to Month 3.</div>
            <div class="photo-rule"><strong>🚫 Don't check daily</strong> — Hair growth is invisible day-to-day. Monthly comparison is the minimum useful interval.</div>
        </div>
    `;
    document.getElementById('photo-section').style.display = 'block';
}

// ---------- v3: Common Mistakes ----------
function renderMistakes(protocol) {
    const hasMinox = protocol.treatments.includes('topical-minoxidil');
    const hasMicroneedling = protocol.treatments.includes('microneedling');
    const hasRedensyl = protocol.treatments.includes('redensyl');

    let mistakes = '';
    if (hasMinox) {
        mistakes += '<div class="mistake-item"><span class="mistake-icon">❌</span><div><strong>Applying minoxidil on wet hair</strong> — Water dilutes concentration and reduces absorption by ~50%. Always apply on DRY scalp.</div></div>';
        mistakes += '<div class="mistake-item"><span class="mistake-icon">❌</span><div><strong>Washing hair too soon</strong> — Minoxidil needs 4+ hours of contact time. Apply after your last shower of the day, not before.</div></div>';
    }
    if (hasMicroneedling) {
        mistakes += '<div class="mistake-item"><span class="mistake-icon">❌</span><div><strong>Using a dull dermaroller</strong> — Replace your roller every 4-6 uses. Dull needles tear skin instead of puncturing, causing inflammation without benefit.</div></div>';
        mistakes += '<div class="mistake-item"><span class="mistake-icon">❌</span><div><strong>Applying minoxidil right after needling</strong> — Wait 24 hours. Applying topicals on micro-wounds increases systemic absorption and irritation.</div></div>';
    }
    if (hasRedensyl) {
        mistakes += '<div class="mistake-item"><span class="mistake-icon">❌</span><div><strong>Skipping Redensyl because it\'s "just a serum"</strong> — Redensyl targets stem cells via a completely different pathway than minoxidil. They\'re synergistic, not redundant.</div></div>';
    }
    mistakes += '<div class="mistake-item"><span class="mistake-icon">❌</span><div><strong>Quitting during the shedding phase</strong> — Week 2-6 shedding means treatment IS working. Stopping now wastes everything you\'ve started.</div></div>';
    mistakes += '<div class="mistake-item"><span class="mistake-icon">❌</span><div><strong>"Every other day is fine"</strong> — It\'s not. Minoxidil\'s half-life is ~22 hours. Missing a single day drops follicle stimulation to near zero. Consistency beats intensity.</div></div>';

    document.getElementById('mistakes-section').innerHTML = `
        <h3>⚠️ Common Mistakes That Kill Results</h3>
        <div class="mistakes-grid">${mistakes}</div>
    `;
    document.getElementById('mistakes-section').style.display = 'block';
}

// ---------- Shopping List (FIXED for all countries) ----------
function renderShoppingList(protocol) {
    const isIndia = state.country === 'india';
    const currency = isIndia ? '₹' : '$';

    const usProducts = {
        'topical-minoxidil': { brand: 'Rogaine / Kirkland 5%', type: 'Solution or Foam', price: 25, note: 'OTC at Walmart, Costco, Amazon' },
        'topical-finasteride': { brand: 'Compounded Topical Finasteride 0.1%', type: 'Prescription compound', price: 50, note: 'Ask dermatologist for compounding pharmacy Rx' },
        'microneedling': { brand: 'Dr. Pen or Dermaroller 1.5mm', type: 'Device', price: 30, note: 'Amazon' },
        'redensyl': { brand: 'The Ordinary Multi-Peptide Serum / Revela', type: 'Hair Serum', price: 20, note: 'Sephora, Amazon' },
        'ketoconazole': { brand: 'Nizoral A-D 1%', type: 'Shampoo', price: 15, note: 'OTC at CVS, Walgreens, Amazon' },
        'saw-palmetto': { brand: 'NOW Saw Palmetto 320mg', type: 'Supplement', price: 12, note: 'Amazon, GNC, Whole Foods' },
        'pumpkin-seed-oil': { brand: 'NOW Pumpkin Seed Oil 1000mg', type: 'Supplement', price: 10, note: 'Amazon' },
        'oral-finasteride': { brand: 'Generic Finasteride 1mg', type: 'Prescription tablet', price: 10, note: 'Requires Rx — Hims, Keeps, or dermatologist' },
        'oral-minoxidil': { brand: 'Oral Minoxidil 2.5mg', type: 'Prescription tablet', price: 15, note: 'Off-label Rx from dermatologist' }
    };

    let items = '';
    let total = 0;

    protocol.treatments.forEach(tid => {
        if (isIndia && productsData && productsData[tid] && productsData[tid].length > 0) {
            const p = productsData[tid][0];
            total += p.price;
            items += `
                <div class="shopping-item">
                    <div>
                        <div class="shopping-name">${p.brand}</div>
                        <div class="shopping-detail">${p.type} · ${p.size} · ${p.duration} · ${p.availability}</div>
                    </div>
                    <div class="shopping-price">${currency}${p.price}</div>
                </div>`;
        } else if (!isIndia && usProducts[tid]) {
            const p = usProducts[tid];
            total += p.price;
            items += `
                <div class="shopping-item">
                    <div>
                        <div class="shopping-name">${p.brand}</div>
                        <div class="shopping-detail">${p.type} · ${p.note}</div>
                    </div>
                    <div class="shopping-price">${currency}${p.price}</div>
                </div>`;
        }
    });

    items += `<div class="shopping-total"><span>Estimated ${isIndia ? 'Initial' : 'Monthly'} Cost</span><span>${currency}${total}</span></div>`;

    if (!isIndia && state.country !== 'us') {
        items = `<p style="color:var(--text-muted);margin-bottom:16px;font-size:0.9rem">Showing US product equivalents as a reference. Search for these treatment names at your local pharmacy.</p>` + items;
    }

    document.getElementById('shopping-content').innerHTML = items;
}

// ---------- Studies ----------
function renderStudies(protocol) {
    if (!treatmentsData || !studiesData) return;
    const studyIds = new Set();
    protocol.treatments.forEach(tid => {
        const t = treatmentsData.find(tr => tr.id === tid);
        if (t && t.keyStudyId) studyIds.add(t.keyStudyId);
    });

    const html = studiesData.filter(s => studyIds.has(s.id)).map(s => `
        <div class="study-item">
            <div class="study-title"><a href="${s.url}" target="_blank" rel="noopener">${s.title}</a></div>
            <div class="study-finding">${s.finding}</div>
            <div class="study-meta">${s.type} · ${s.source} · ${s.year}</div>
        </div>
    `).join('');

    document.getElementById('studies-content').innerHTML = html;
}

// ---------- PDF Export ----------
function exportPDF() {
    const element = document.getElementById('screen-5');
    const hideEls = ['.result-actions', '#screen-5 .progress-bar', '#screen-5 .step-indicator'];
    hideEls.forEach(sel => { const el = document.querySelector(sel); if (el) el.style.display = 'none'; });

    html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: 'HairStack-Protocol.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }).from(element).save().then(() => {
        hideEls.forEach(sel => { const el = document.querySelector(sel); if (el) el.style.display = ''; });
    });
}
