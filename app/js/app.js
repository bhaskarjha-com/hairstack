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
let dataLoaded = false;

async function loadData() {
    try {
        const [t, p, pr, s] = await Promise.all([
            fetch('data/treatments.json').then(r => { if (!r.ok) throw new Error('treatments'); return r.json(); }),
            fetch('data/protocols.json').then(r => { if (!r.ok) throw new Error('protocols'); return r.json(); }),
            fetch('data/products-india.json').then(r => { if (!r.ok) throw new Error('products'); return r.json(); }),
            fetch('data/studies.json').then(r => { if (!r.ok) throw new Error('studies'); return r.json(); })
        ]);
        treatmentsData = t.treatments;
        protocolsData = p.protocols;
        productsData = pr.products;
        studiesData = s.studies;
        dataLoaded = true;
        // Remove error banner if present
        const banner = document.getElementById('data-error');
        if (banner) banner.remove();
    } catch (e) {
        console.error('Failed to load data:', e);
        showDataError();
    }
}

function showDataError() {
    if (document.getElementById('data-error')) return;
    const banner = document.createElement('div');
    banner.id = 'data-error';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:12px 20px;background:#dc2626;color:#fff;text-align:center;z-index:9999;font-family:Inter,sans-serif;font-size:0.9rem;';
    banner.innerHTML = '⚠️ Failed to load treatment data. Please check your connection. <button onclick="loadData()" style="margin-left:12px;padding:4px 12px;background:#fff;color:#dc2626;border:none;border-radius:4px;cursor:pointer;font-weight:600;">Retry</button>';
    document.body.prepend(banner);
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
    // Reset v2/v3 dynamic sections
    ['day1-section','photo-section','mistakes-section','monitoring-section',
     'timeline-section','prognosis-section','consultation-section']
    .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
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
    // Safety gate for protocols containing oral medications
    if (risk === 'aggressive' || risk === 'gold-standard') {
        const safetyMsg = risk === 'aggressive'
            ? 'The Aggressive Protocol includes oral minoxidil (a vasodilator) and topical finasteride.\n\n⚠️ Oral minoxidil is contraindicated if you:\n• Take blood pressure medication\n• Have a heart condition\n• Have kidney disease\n\nAre you free of these conditions?'
            : 'The Gold Standard Protocol includes oral finasteride (a 5α-reductase inhibitor).\n\n⚠️ Oral finasteride may cause sexual side effects in ~5% of users (vs ~3% placebo). Most resolve on discontinuation.\n\nDo you understand these risks and wish to proceed?';
        if (!confirm(safetyMsg)) return;
    }
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
    if (stageNum <= 2 && (dur === '<1' || dur === '1-3')) return { pct: 'Excellent', label: 'Excellent', msg: 'At early stages with recent onset, most miniaturized follicles are still alive and responsive to treatment.' };
    if (stageNum <= 3.5 && dur !== '5+') return { pct: 'Good', label: 'Good', msg: 'The majority of follicles can typically be reactivated with consistent treatment at this stage.' };
    if (stageNum <= 5) return { pct: 'Moderate', label: 'Moderate', msg: 'Meaningful regrowth is possible, but some follicles may be permanently miniaturized. Results vary significantly between individuals.' };
    return { pct: 'Limited', label: 'Limited', msg: 'Focus shifts to maintaining existing hair. Advanced stages may benefit from transplant consultation. Individual outcomes vary widely.' };
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
    if (stageNum >= 6) return `At Stage ${currentLabel} with ${genetic} genetics, further loss is typically limited to density reduction in remaining areas.`;
    if (yearsTo5 === 0) return `At Stage ${currentLabel}, without treatment, continued progression is likely. The rate varies significantly between individuals and cannot be precisely predicted.`;
    return `At Stage ${currentLabel} with ${genetic} family history, without treatment, progression is likely over the coming years. While exact timelines vary by individual, ${genetic} genetic factors suggest a ${genetic === 'severe' ? 'faster' : genetic === 'moderate' ? 'moderate' : 'slower'} trajectory.`;
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
        protocolMsg = ' Your Optimal Protocol attacks hair loss through 4 independent mechanisms — DHT blocking (topical finasteride, with side effect rates similar to placebo in Phase III trials), growth stimulation (minoxidil), stem cell activation (Redensyl), and absorption amplification (microneedling). This is what a dermatologist would prescribe.';
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
    renderStreak();
    renderJournal();
    renderLibrary();

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
                <div class="profile-item-value" style="text-transform:capitalize" class="urgency-${genetic}">${genetic}</div>
            </div>
            <div>
                <div class="profile-item-label">Urgency</div>
                <div class="profile-item-value" style="color:${urgency.color}">${urgency.label}</div>
            </div>
            <div>
                <div class="profile-item-label">Recovery Potential</div>
                <div class="profile-item-value">${recovery.pct}</div>
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
        { period: 'Month 12', icon: '🏆', title: 'Near-Peak Results', desc: `Recovery potential: ${recovery.label}${stageNum >= 5 ? '. At your stage, maintaining this result is the primary goal.' : '. Continue treatment for maintenance — results are cumulative.'}`, type: 'success' }
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
    const riskRate = isOral ? '~5% (vs ~3% placebo)' : '~2.8% (vs 3.3% placebo)';
    const productName = isOral ? 'Finpecia' : 'Morr-F';

    section.innerHTML = `
        <h3>🛡️ Safety Monitoring</h3>
        <p class="monitoring-intro">Your protocol includes finasteride. In the largest Phase III trial, sexual side effects occurred in ${riskRate} of users — statistically similar to placebo, suggesting most are nocebo-driven. Still, track these markers every 2 weeks:</p>
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
        withText = `With this protocol: Clinical studies show minoxidil + microneedling produces <strong>significant regrowth</strong> in up to 82% of early-stage patients (Dhurat 2013). Expect stabilization by month 3, visible thickening by month 5-6. Your early stage and moderate genetics work in your favor.`;
    } else if (stageNum <= 4) {
        withText = `With this protocol: <strong>Meaningful regrowth</strong> is achievable. Studies show 35-60% of minoxidil users see significant improvement, with microneedling boosting outcomes substantially. Expect stabilization within 3 months and visible improvement by month 6. Consistency is critical at your stage.`;
    } else {
        withText = `With this protocol: Primary goal is <strong>halting further loss</strong> with potential for partial regrowth. At NW${stageNum}+, some follicles may be permanently miniaturized, but treatment can visually improve density in remaining areas. Individual outcomes vary significantly at advanced stages.`;
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
        'microneedling': { brand: 'Dr. Pen M8 or Dermaroller 1.0mm', type: 'Device (dermapen: use 0.5-0.75mm)', price: 30, note: 'Amazon — replace roller every 4-6 uses' },
        'redensyl': { brand: 'The Ordinary Multi-Peptide Serum / Revela', type: 'Hair Serum', price: 20, note: 'Sephora, Amazon' },
        'ketoconazole': { brand: 'Nizoral A-D 1%', type: 'Shampoo', price: 15, note: 'OTC at CVS, Walgreens, Amazon' },
        'saw-palmetto': { brand: 'NOW Saw Palmetto 320mg', type: 'Supplement', price: 12, note: 'Amazon, GNC, Whole Foods' },
        'pumpkin-seed-oil': { brand: 'NOW Pumpkin Seed Oil 1000mg', type: 'Supplement', price: 10, note: 'Amazon' },
        'oral-finasteride': { brand: 'Generic Finasteride 1mg', type: 'Prescription tablet', price: 10, note: 'Requires Rx — Hims, Keeps, or dermatologist' },
        'oral-minoxidil': { brand: 'Oral Minoxidil 2.5mg', type: 'Prescription tablet', price: 15, note: 'Off-label Rx from dermatologist' },
        'prp': { brand: 'PRP Hair Treatment', type: 'In-clinic procedure (per session)', price: 700, note: 'Dermatology clinic — monthly for 4-6 months' }
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
    window.print();
}

// ============================================
//  FEATURE: ADHERENCE STREAK TRACKER
// ============================================

function getStreakData() {
    try {
        return JSON.parse(localStorage.getItem('hairstack-streak') || '{"days":[]}');
    } catch { return { days: [] }; }
}

function saveStreakData(data) {
    localStorage.setItem('hairstack-streak', JSON.stringify(data));
}

function getDateStr(d) {
    return d.toISOString().split('T')[0];
}

function markStreakDay() {
    const data = getStreakData();
    const today = getDateStr(new Date());
    if (data.days.includes(today)) return;
    data.days.push(today);
    saveStreakData(data);
    renderStreak();
}

function calcStreak(days) {
    if (!days.length) return { current: 0, best: 0, total: days.length };
    const sorted = [...days].sort().reverse();
    const today = new Date();
    let current = 0;
    let checkDate = new Date(today);

    // Check if today or yesterday was marked (allow checking in late)
    const todayStr = getDateStr(today);
    const yesterdayStr = getDateStr(new Date(today.getTime() - 86400000));
    if (!sorted.includes(todayStr) && !sorted.includes(yesterdayStr)) {
        current = 0;
    } else {
        if (!sorted.includes(todayStr)) {
            checkDate = new Date(today.getTime() - 86400000);
        }
        for (let i = 0; i < 365; i++) {
            const ds = getDateStr(checkDate);
            if (sorted.includes(ds)) {
                current++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else break;
        }
    }

    // Best streak
    let best = 0, run = 1;
    const asc = [...days].sort();
    for (let i = 1; i < asc.length; i++) {
        const prev = new Date(asc[i - 1]);
        const curr = new Date(asc[i]);
        const diff = (curr - prev) / 86400000;
        if (diff === 1) { run++; }
        else { best = Math.max(best, run); run = 1; }
    }
    best = Math.max(best, run, current);

    return { current, best, total: days.length };
}

function renderStreak() {
    const data = getStreakData();
    const stats = calcStreak(data.days);
    const today = getDateStr(new Date());

    document.getElementById('streak-current').textContent = stats.current;
    document.getElementById('streak-best').textContent = stats.best;
    document.getElementById('streak-total').textContent = stats.total;

    // Disable button if today already marked
    const btn = document.getElementById('streak-mark-btn');
    if (data.days.includes(today)) {
        btn.textContent = '✅ Done for Today!';
        btn.disabled = true;
        btn.style.opacity = '0.6';
    } else {
        btn.textContent = '✅ Mark Today as Done';
        btn.disabled = false;
        btn.style.opacity = '1';
    }

    // Render last 30 days calendar
    const cal = document.getElementById('streak-calendar');
    let html = '';
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = getDateStr(d);
        const done = data.days.includes(ds);
        const isToday = ds === today;
        html += `<div class="streak-day ${done ? 'done' : ''} ${isToday ? 'today' : ''}" title="${ds}">${d.getDate()}</div>`;
    }
    cal.innerHTML = html;
}

// ============================================
//  FEATURE: PROGRESS JOURNAL
// ============================================

function getJournalData() {
    try {
        return JSON.parse(localStorage.getItem('hairstack-journal') || '[]');
    } catch { return []; }
}

function saveJournalData(data) {
    localStorage.setItem('hairstack-journal', JSON.stringify(data));
}

function addJournalEntry() {
    const rating = document.getElementById('journal-rating').value;
    if (!rating) { alert('Please select an improvement rating.'); return; }
    const notes = document.getElementById('journal-notes').value.trim();

    const entries = getJournalData();
    entries.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        rating: parseInt(rating),
        notes: notes
    });
    saveJournalData(entries);

    // Reset form
    document.getElementById('journal-rating').value = '';
    document.getElementById('journal-notes').value = '';

    renderJournal();
}

function deleteJournalEntry(id) {
    if (!confirm('Delete this entry?')) return;
    const entries = getJournalData().filter(e => e.id !== id);
    saveJournalData(entries);
    renderJournal();
}

function renderJournal() {
    const entries = getJournalData();
    const container = document.getElementById('journal-entries');

    if (!entries.length) {
        container.innerHTML = '<p class="journal-empty">No entries yet. Add your first log after 1 month of treatment.</p>';
        return;
    }

    const ratingLabels = ['', 'Worse', 'No change', 'Slight improvement', 'Noticeable improvement', 'Significant improvement'];
    const ratingColors = ['', '#ef4444', '#6b7280', '#f59e0b', '#22c55e', '#10b981'];

    container.innerHTML = entries.map(e => {
        const d = new Date(e.date);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `
            <div class="journal-entry">
                <div class="journal-entry-header">
                    <span class="journal-date">${dateStr}</span>
                    <span class="journal-rating-badge" style="background:${ratingColors[e.rating]}20;color:${ratingColors[e.rating]}">
                        ${'★'.repeat(e.rating)}${'☆'.repeat(5 - e.rating)} ${ratingLabels[e.rating]}
                    </span>
                    <button class="journal-delete" onclick="deleteJournalEntry(${e.id})" title="Delete">×</button>
                </div>
                ${e.notes ? `<p class="journal-notes">${e.notes}</p>` : ''}
            </div>
        `;
    }).join('');
}

// ============================================
//  FEATURE: TREATMENT LIBRARY
// ============================================

function renderLibrary() {
    if (!treatmentsData) return;

    const categoryLabels = {
        'growth-stimulation': '💊 Growth Stimulation',
        'dht-blocker': '🛡️ DHT Blocker',
        'natural-dht-blocker': '🌿 Natural DHT Blocker',
        'stem-cell-activator': '🧬 Stem Cell Activator',
        'scalp-health': '🧴 Scalp Health',
        'absorption-booster': '⚡ Absorption Booster',
        'hormonal-support': '⚖️ Hormonal Support'
    };

    const currentProtocol = protocolsData ? protocolsData[state.riskTolerance] : null;
    const activeTreatmentIds = currentProtocol ? currentProtocol.treatments : [];

    const html = treatmentsData.map(t => {
        const inProtocol = activeTreatmentIds.includes(t.id);
        const stars = '⭐'.repeat(t.evidenceRating) + '☆'.repeat(5 - t.evidenceRating);
        const study = studiesData ? studiesData.find(s => s.id === t.keyStudyId) : null;

        return `
            <div class="lib-treatment ${inProtocol ? 'in-protocol' : ''}" data-category="${t.category}" onclick="this.classList.toggle('expanded')">
                <div class="lib-treatment-header">
                    <div>
                        <span class="lib-name">${t.name}</span>
                        ${inProtocol ? '<span class="lib-badge">In Your Protocol</span>' : ''}
                        ${t.fdaApproved ? '<span class="lib-badge fda">FDA</span>' : ''}
                    </div>
                    <span class="lib-evidence">${stars}</span>
                </div>
                <div class="lib-mechanism">${t.mechanismShort}</div>
                <div class="lib-details">
                    <div class="lib-detail-row"><strong>Category:</strong> ${categoryLabels[t.category] || t.category}</div>
                    <div class="lib-detail-row"><strong>Full Mechanism:</strong> ${t.mechanism}</div>
                    <div class="lib-detail-row"><strong>Evidence:</strong> ${t.evidenceLabel}</div>
                    <div class="lib-detail-row"><strong>Frequency:</strong> ${t.applicationFrequency}</div>
                    <div class="lib-detail-row"><strong>Time to Results:</strong> ${t.timeToResults}</div>
                    <div class="lib-detail-row"><strong>Side Effects:</strong> ${t.sideEffects.join('; ')}</div>
                    <div class="lib-detail-row"><strong>Notes:</strong> ${t.notes}</div>
                    ${study ? `<div class="lib-detail-row"><strong>Key Study:</strong> <a href="${study.url}" target="_blank" rel="noopener">${study.title}</a></div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('library-content').innerHTML = html;
}

function filterLibrary(category, btn) {
    document.querySelectorAll('.lib-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.lib-treatment').forEach(el => {
        if (category === 'all' || el.dataset.category === category) {
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    });
}
