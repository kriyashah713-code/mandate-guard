**🔐 MANDATE GUARD**

**Know Your Agent — Trust the Action, Not Just the Agent**

Mandate Guard is an **agent-risk and transaction decisioning platform** designed for the **Know Your Agent (KYA)** problem.

> **Core idea:** An AI agent can be authenticated, trusted, and operating within normal limits — yet still perform an action that the customer never authorized.

Mandate Guard evaluates every sensitive agent action against the **customer's delegated mandate**.

**Decision Unit:**  
**Agent + Mandate + Action**

---

**🌐 PROJECT LINKS**

🚀 **Live Website**  
[Open Mandate Guard](YOUR_ACTUAL_RENDER_URL)

💻 **GitHub Repository**  
[View Source Code](https://github.com/kriyashah713-code/mandate-guard)

🎥 **Demo Video**  
[Watch Demo](https://youtu.be/gCTCcJTlV4M)

---

**🎯 THE PROBLEM**

As AI agents increasingly perform financial and business actions on behalf of users, traditional trust models become insufficient.

An agent may be:

- Properly authenticated
- Operating through a valid session
- Within transaction limits
- Considered low-risk
- Trusted based on historical behavior

…and still attempt a transaction that **violates the customer's actual instructions**.

**Example**

**Customer-authorized account:** 4412  
**Agent-requested account:** 9087  
**Transaction amount:** ₹1,40,000

Traditional identity and trust checks may pass.

But the **mandate does not**.

Mandate Guard detects this mismatch before the transaction creates financial exposure.

---

**💡 OUR SOLUTION**

Mandate Guard introduces **mandate-relative trust**.

Instead of asking only:

> "Can we trust this agent?"

Mandate Guard asks:

> **"Can we trust this specific action under this customer's mandate?"**

**Decision Flow**

Customer Mandate  
↓  
Agent Identity  
↓  
Session Attribution  
↓  
Authority Check  
↓  
Mandate Fidelity / Drift  
↓  
Transaction Exposure  
↓  
Decision Engine  
↓  
**ALLOW / STEP-UP / HOLD / BLOCK**  
↓  
Explainable Evidence

---

**⭐ KEY USP**

The core trust relationship is:

**Agent + Mandate + Action**

This means a trusted agent does **not automatically become trusted for every possible action**.

Mandate Guard evaluates whether the **specific action is authorized by the specific customer mandate**.

---

**🚨 FLAGSHIP DEMO SCENARIO**

**Normal Baseline**

Transactions **#1 → #40** are evaluated normally.

They match the customer's mandate and are allowed.

**Transaction #41 — Suspicious Action**

The agent requests:

**₹1,40,000 → Account ending 9087**

But the customer's mandate authorizes:

**Account ending 4412**

**Identity Check** → ✅ Passed  
**Agent Authentication** → ✅ Passed  
**Normal Trust Checks** → ✅ Passed  
**Mandate Destination** → ❌ Failed

Mandate Guard identifies the violation and produces an explainable risk decision.

**Possible Intervention**

🟡 **STEP-UP**  
🟠 **HOLD**  
🔴 **BLOCK**

The system prevents unauthorized financial exposure before the transaction is completed.

---

**🧠 DECISION MODEL**

Mandate Guard evaluates more than identity.

**1. Identity**  
Who is performing the action?

**2. Authority**  
What permissions were delegated to the agent?

**3. Mandate Fidelity**  
Does the requested action match the customer's actual mandate?

**4. Drift**  
Has the agent's behavior moved away from previously authorized behavior?

**5. Exposure**  
How much financial or operational risk is associated with the action?

**6. Expected Cost**  
Is intervention safer and cheaper than allowing the action?

**Decision Types**

| Decision | Meaning |
|---|---|
| 🟢 **ALLOW** | Action is consistent with the mandate |
| 🟡 **STEP-UP** | Additional customer verification required |
| 🟠 **HOLD** | Temporarily stop the action for review |
| 🔴 **BLOCK** | Action violates policy or mandate |

---

**👥 USER ROLES**

**Customer / Principal**

The person who owns the mandate.

**Capabilities**

- Create mandates
- Define permitted actions
- View authorized agents
- Review transactions
- Approve or reject sensitive actions
- Manage security
- Monitor agent activity

**Risk / Fraud Analyst**

The operational user responsible for investigating agent activity.

**Capabilities**

- Monitor transactions
- Inspect agent sessions
- Review mandates
- Investigate cases
- View decision evidence
- Run simulations
- Evaluate risk performance
- Understand why an action was blocked or escalated

---

**📊 OPERATIONS WORKSPACE**

The Risk Operations workspace provides a centralized view of agent activity.

It brings together:

- Active sessions
- Agents
- Mandates
- Transactions
- Risk decisions
- Cases
- Simulations
- Evaluation metrics

The goal is not simply to show a risk score.

It shows **why an action is trusted or rejected**.

---

**🔎 EXPLAINABLE MANDATE DIFF**

**CUSTOMER AUTHORIZED**

Account → **4412**  
Purpose → **Approved vendor payment**  
Limit → **₹50,000**

**REQUESTED ACTION**

Account → **9087**  
Amount → **₹1,40,000**  
Purpose → **Unknown**

**MANDATE RESULT**

❌ **Destination mismatch**  
❌ **Amount exceeds authorized scope**

**→ HOLD / STEP-UP / BLOCK**

This gives analysts a clear reason for intervention instead of presenting an unexplained risk score.

---

**🏗️ APPLICATION STRUCTURE**

**Customer**

`/customer`  
`/customer/mandates`  
`/customer/agents`  
`/customer/transactions`  
`/customer/approvals`  
`/customer/security`

**Risk Operations**

`/operations`  
`/sessions`  
`/agents`  
`/mandates`  
`/transactions`  
`/cases`  
`/simulations`  
`/evaluation`

---

**⚙️ TECH STACK**

**Frontend**

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Motion
- Lucide React

**UI & Experience**

- Role-based workspace
- Animated transaction states
- Interactive risk decisions
- Light / Dark mode
- Responsive interface
- Cinematic product presentation

**Deployment**

- GitHub
- Render
- Vite Production Build

---

**🚀 GETTING STARTED**

**Clone the repository**

```bash
git clone https://github.com/kriyashah713-code/mandate-guard.git
cd mandate-guard
```

**Install dependencies**

```bash
npm install
```

**Run locally**

```bash
npm run dev
```

---

**🏭 PRODUCTION BUILD**

```bash
npm run build
```

**TypeScript Check**

```bash
npm run lint
```

---

**☁️ RENDER DEPLOYMENT**

**Build Command**

```text
npm install && npm run build
```

**Publish Directory**

```text
dist
```

**SPA Rewrite**

```text
/* → /index.html
```

---

**🎥 PRODUCT DEMO**

🎬 **Mandate Guard Demo**

https://youtu.be/gCTCcJTlV4M

The demo demonstrates how mandate-relative decisioning can detect an action that appears trustworthy at the agent level but violates the customer's delegated authority.

---

**🏆 HACKATHON CONTEXT**

Built for:

**Perfios × IIT Bombay Techfest 2026**

**Problem:** Know Your Agent (KYA)

Mandate Guard focuses on protecting customers from:

- Agent overreach
- Mandate drift
- Unauthorized actions
- Unexplained risk decisions

by making **customer-delegated authority a first-class part of transaction decisioning**.

---

**🌟 CORE TAKEAWAY**

AI agents should not be trusted simply because they are authenticated.

They should be trusted **within the boundaries of what the customer actually authorized**.

**Mandate Guard**

**Know the Agent.  
Know the Mandate.  
Judge the Action.**
