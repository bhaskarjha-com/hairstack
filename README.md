# HairStack

**Evidence-based hair loss treatment protocols, personalized for you.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> Get a personalized, research-backed hair loss protocol in 60 seconds. Free, open-source, no signup.

## 🎯 What is HairStack?

HairStack is an **open-source protocol generator** for male androgenetic alopecia (pattern hair loss). Answer 5 questions → get a treatment protocol backed by clinical studies → print your daily routine.

**No marketing. No affiliate links. No tracking. Just research.**

### [→ Get Your Protocol](https://YOUR_USERNAME.github.io/hairstack/app/)

---

## Why This Exists

- 🔬 Most hair loss content online is **product shilling** or Reddit anecdotes — we provide curated clinical evidence
- 😰 **Finasteride fear** makes men avoid treatment entirely — we present the data honestly so you can make informed decisions
- 💰 Hair loss clinics charge hundreds for advice that should be free — this is that advice, open-sourced
- 🌍 Men in developing countries lack access to trichologists — a guided protocol fills the gap

---

## 📊 Protocol Tiers

| Tier | Approach | Efficacy | Risk | Monthly Cost |
|---|---|---|---|---|
| **Zero Risk** | Minoxidil + microneedling + natural DHT blockers | ~62% | Zero | ₹1,300 / $45 |
| **Optimal** ⭐ | + Topical finasteride + Redensyl stem cell serum | ~87% | Near-zero (0.002%) | ₹1,750 / $55 |
| **Aggressive** | + Oral minoxidil + PRP injections | ~93% | Low-moderate | ₹5,000 / $150 |
| **Gold Standard** | Oral finasteride + topical minoxidil (reference) | 100% | Moderate (~2%) | ₹800 / $30 |

*Efficacy is relative to the Gold Standard (oral finasteride + topical minoxidil), which is the clinical reference point.*

---

## 🧬 Treatments Analyzed

Every treatment is scored on a 5-point evidence scale based on study quality and replication.

| Treatment | Mechanism | Evidence | Category |
|---|---|---|---|
| Topical Minoxidil 5% | Vasodilation, prolongs anagen | ⭐⭐⭐⭐⭐ FDA-approved | Growth stimulation |
| Microneedling 1.5mm | 4× minoxidil absorption + growth factors | ⭐⭐⭐⭐⭐ Multiple RCTs | Absorption booster |
| Topical Finasteride 0.1% | 70% scalp DHT reduction, minimal systemic | ⭐⭐⭐⭐⭐ Phase III RCT | DHT blocker |
| Oral Finasteride 1mg | 70% systemic DHT reduction | ⭐⭐⭐⭐⭐ FDA-approved | DHT blocker |
| Redensyl 3% | Hair follicle stem cell activation | ⭐⭐⭐⭐ Strong emerging | Stem cell activator |
| Saw Palmetto 320mg | Natural 5α-reductase inhibition (~30%) | ⭐⭐⭐⭐ Meta-analysis (502pts) | Natural DHT blocker |
| Pumpkin Seed Oil 400mg | Phytosterol-based anti-androgen | ⭐⭐⭐⭐ RCT (40% count increase) | Natural DHT blocker |
| Ketoconazole 2% shampoo | Scalp anti-androgen + anti-inflammatory | ⭐⭐⭐⭐ Well-studied adjunct | Scalp health |
| PRP (Platelet Rich Plasma) | Concentrated growth factors from own blood | ⭐⭐⭐⭐ Multiple RCTs | Growth stimulation |
| Rosemary Oil | Microcirculation + mild DHT inhibition | ⭐⭐⭐ 1 RCT (matched minox 2%) | Growth stimulation |

*See [full treatment database](data/treatments.json) for all 18 treatments with mechanisms, side effects, and citations.*

---

## 🧠 How It Works

1. **Select your Norwood stage** — visual top-down head diagrams for each stage
2. **Enter your details** — age, family history (father + grandfather), duration of loss
3. **Choose risk priority** — Zero Risk, Optimal, Aggressive, or Gold Standard
4. **Pick your country** — India (branded products + ₹ pricing) or US/UK/Other
5. **Get your protocol** — personalized assessment, treatment cards, daily routine, timeline, safety monitoring, prognosis, shopping list, and PubMed citations

### What You Get

| Section | What It Does |
|---|---|
| 🩺 **Consultation** | Personalized assessment paragraph based on ALL your inputs |
| 💊 **Treatments** | Evidence-rated cards with application instructions |
| 📋 **Daily Routine** | Morning/evening/weekly schedule with timing |
| 📈 **Timeline** | 5-milestone roadmap with shedding phase warning |
| 🛡️ **Safety Monitoring** | Finasteride stop-triggers (if applicable) |
| 🔮 **Prognosis** | "Without treatment" projection vs "With protocol" |
| ✅ **Day 1 Checklist** | Actionable first steps to start treatment properly |
| 📸 **Photo Protocol** | How to take consistent monthly progress photos |
| ⚠️ **Common Mistakes** | Protocol-specific pitfalls that silently kill results |
| 🛒 **Shopping List** | Region-specific products with prices |
| 📚 **Key Evidence** | Direct PubMed links for every treatment |

---

## 🛠 Tech Stack

- **Vanilla HTML + CSS + JS** — zero dependencies, instant load
- **GitHub Pages** — free hosting, auto-deploy from `app/` directory
- **JSON data files** — easy to update and contribute to
- **html2pdf.js** (CDN) — PDF export for routine cards
- **No backend** — your data stays on your device

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Easy ways to contribute:**
- 🌍 Add product recommendations for your country (PR to `data/products-{country}.json`)
- 📊 Submit new treatment evidence (with PubMed/DOI citations)
- 🐛 Report bugs or suggest improvements
- 🌐 Help translate to other languages

---

## ⚕️ Disclaimer

HairStack is an **evidence library**, not medical advice. Every recommendation links to published clinical studies. Always consult a board-certified dermatologist before starting any treatment. See [DISCLAIMER.md](DISCLAIMER.md).

---

## 📄 License

MIT License — free to use, modify, and distribute. See [LICENSE](LICENSE).

---

*Built with research, not marketing budgets.*
