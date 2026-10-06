# FundenFlo Backend — Progress Memory

> Agla phase shuru karne se pehle **sirf ye file** padho. Poora code dobara review mat karo.
>
> Last update: 6 Oct 2026
> Current phase: **Phase 2 complete**
> Next phase: **Phase 3 — Profile + Individual/MSME** — user ki permission ke bina start mat karo

## Sources (source of truth)

- Product rules: `PROGRESS.md` (V1 borrower journey). Jahan ye file Figma se jaan-boojh ke alag hai, **PROGRESS.md jeetta hai**.
- UI: Stitch export in this repo + `FundenFlo_Complete_UI_Design_Stitch.pdf` (18 image pages, same screens). PDF me extra written spec nahi hai.
- Mobile API client (contract, purana backend nahi): `FundenFlo-v1-app/src/services/*`. App `EXPO_PUBLIC_API_URL` + path use karti hai. Isliye base URL `http://HOST:PORT/api/v1` rakho, paths `/auth/...` waise hi.

## Locked decisions

- Success JSON **unwrap** rakho. App seedha body padhti hai (`{ token, user }`). Wrapper `{ success, data }` mat lagana — app toot jayegi.
- Error JSON: `{ "message": "...", "code": "SOME_CODE" }`. App `message` aur `code` padhti hai.
- Auth header: `Authorization: Bearer <token>`.
- Version prefix: `/api/v1`.
- Financial score formula, lender match rules, EMI/APR **invent mat karna**. Jab tak official rule na ho, mock/configurable service, clearly labelled.
- Figma ke fake claims backend me mat daalna: APR 11.25%, Priority SLA, RBI encryption line, Data Shield v2.4, pre-ticked consent, hardcoded name Rohit.
- Partner portal, case queue, commissions **borrower V1 ka hissa nahi** (`PROGRESS.md` section 12). Phase 12 me sirf woh admin APIs jo borrower file chalane ke liye zaroori hon — full ops/partner product tab tak nahi jab tak user confirm na kare.
- DigiLocker abhi disabled. Integration nahi.
- Hindi toggle UI-only hai. Backend i18n nahi.
- Illustrative EMI app khud calculate karti hai. Backend rate/EMI return na kare.

## Borrower flow (server ko ye order guard karna hai)

1. OTP login (`+91`, 10 digit, 6–9 se start)
2. Entity type: `msme` | `individual`
3. Loan requirement: category (available ho), amount, tenure, location, purpose, purposeNote (sirf `other` pe required)
4. Pre-check: 4 answers, entity ke hisaab se alag. Bureau pull nahi.
5. Consent submit. `aiDocuments` required. Baaki optional. Default off. Version `2026-10-v1`.
6. Documents upload. AI read tabhi jab `aiDocuments` granted ho.
7. Analysis job. Success ke baad profile: fullName, PAN, DOB.
8. Score + improvement (`POST /score`).
9. Matched lenders (`POST /lenders`). Sirf `verified: true`.
10. Apply (`POST /applications`). Agar lender-sharing consent off ho to pehle consent on, phir apply.
11. Status track + home. Naya application = journey reset, login same.

## Phase status

| Phase | Naam | Status |
|---|---|---|
| 0 | Analysis | Done (ye file) |
| 1 | Project setup + health | Done |
| 2 | Authentication | Done |
| 3 | Profile + Individual/MSME | Not started |
| 4 | Loan application | Not started |
| 5 | Documents + verification | Not started |
| 6 | Consent + pre-eligibility | Not started |
| 7 | Financial assessment + health score | Not started |
| 8 | Improvement plan | Not started |
| 9 | Lender + matching | Not started |
| 10 | Submission + status | Not started |
| 11 | Notifications | Not started |
| 12 | Admin APIs (minimum) | Not started — scope confirm |
| 13 | Security hardening | Not started |
| 14 | Tests + Postman | Not started |
| 15 | README | Not started |

Implement order note: user ka phase list Consent ko Phase 6 me rakhta hai, lekin app flow me consent documents se **pehle** hai. Code me flow order follow karo (entity → loan → pre-check → consent → documents). Phase numbers user ke message se mat ulta karo jab tak user na kahe; har phase ke andar sahi prerequisite check rakho.

---

## 1. Backend modules

| Module | Kaam | Phase |
|---|---|---|
| health | DB ping | 1 |
| auth | OTP request/verify/resend, JWT, logout, auth middleware | 2 |
| users / profile | fullName, PAN, DOB. Mobile change nahi | 3 |
| borrowers | entity type `msme` \| `individual` on the loan file | 3 |
| loan-catalog | category availability | 4 |
| loan-requirement | amount, tenure, location, purpose | 4 |
| pre-check | 4 self-declared answers | 6 (data Phase 4 ke file pe) |
| consent | 3 toggles, version, audit timestamps | 6 |
| documents | upload, status poll, delete | 5 |
| analysis | async read job, steps | 5 |
| score | health score + factors | 7 |
| improvement | actions tied to score | 8 |
| lenders | verified lender list + match reasons | 9 |
| applications | apply, get status, timeline, extra doc | 10 |
| notifications | in-app list + WhatsApp opt-in | 11 |
| admin | status change, request document, verify lender | 12 |

## 2. Database entities (abhi migrate mat karna — phase ke saath)

**User** — login identity
- id, mobile (unique), countryCode (`+91`), fullName?, pan? (unique), dob?, referralCode?, createdAt, updatedAt

**OtpChallenge** — Phase 2
- id, mobile, codeHash, expiresAt, attempts, resendAvailableAt, consumedAt, createdAt

**RefreshToken** — Phase 2
- id, userId, tokenHash, expiresAt, revokedAt

**LoanFile** — ek borrower ki current/past journey. "Start new application" purani file delete na kare; nayi file banao.
- id, userId, publicId? (apply ke baad `FF-YY-#####`), entityType, status, loanCategory?, amount?, tenureYears?, location?, purpose?, purposeNote?, createdAt, updatedAt

**PreCheck** — loanFileId unique, entityType, answers JSON

**ConsentRecord** — loanFileId, version, submittedAt, items JSON `{ aiDocuments|creditBureau|lenderSharing: { granted, at } }`

**Document** — loanFileId, userId, docType, originalName, mimeType, sizeBytes, storageKey, status (`processing|verified|rejected`), summary?, rejectReason?, consentVersion

**AnalysisJob** — loanFileId, fingerprint (document ids), status (`running|done|failed`), steps JSON, message?, notifyWhatsApp

**ScoreResult** — analysisId unique, value, band, assessedAt, basedOn, factors JSON

**ImprovementItem** — scoreResultId, title, found, why, action, evidence

**Lender** — name, kind (`NBFC|Bank|...`), verified, active, config JSON (products, cities, criteria). Criteria official nahi — config.

**LenderMatch** — analysisId, lenderId, product, indicative?, interestLabel (`As per lender policy`), documentsStillNeeded?, reasons JSON

**LenderApplication** — loanFileId, lenderId, status, timeline JSON, pendingDocument JSON?, whatsAppUpdates

**Notification** — userId, title, detail, occurredAt, loanFileId?, readAt?

Storage: local disk in dev (`UPLOAD_DIR`). Production object storage baad me. DB me file bytes mat rakho.

## 3. Relationships

- User 1—N LoanFile
- LoanFile 1—1 PreCheck, 1—1 latest ConsentRecord (history rakho, latest version se match)
- LoanFile 1—N Document, 1—N AnalysisJob
- AnalysisJob 1—1 ScoreResult 1—N ImprovementItem
- AnalysisJob 1—N LenderMatch N—1 Lender
- LoanFile 1—N LenderApplication N—1 Lender
- User 1—N Notification, 1—N RefreshToken
- Ownership: har query `userId = req.user.id`. Doosre user ki file 404.

**LoanFile status (draft side):** `draft` → `precheck_done` → `consent_done` → `documents_done` → `analysis_done` → `profile_done` → `scored` → `matched` → `submitted`

**LenderApplication status (UI timeline):** `documents_complete` → `sent_to_lender` → `under_review` → `sanctioned` → `disbursed`. Partner UI me `documents_pending` aur `rejected` bhi dikhte hain — borrower app abhi unhe render nahi karti. Transition rules **missing** (neeche).

## 4. API list (mobile contract)

Base: `/api/v1`

| Method | Path | Auth | Body / query | Response |
|---|---|---|---|---|
| GET | `/health` | no | — | `{ status, service, database, timestamp }` |
| POST | `/auth/otp/request` | no | `{ mobile, countryCode, referralCode? }` | `{ resendIn }` |
| POST | `/auth/otp/verify` | no | `{ mobile, otp }` | `{ token, user: { id, mobile, fullName?, pan?, dob? }, refreshToken }` |
| POST | `/auth/otp/resend` | no | `{ mobile }` | `{ resendIn }` |
| POST | `/auth/logout` | yes | `{ refreshToken }` | `{ ok: true }` |
| PATCH | `/auth/profile` | yes | `{ fullName, pan, dob }` | same profile object |
| GET | `/loan/categories` | yes | `?entityType=msme\|individual` | `{ categories: [{ id, available, reason? }] }` |
| POST | `/loan/requirement` | yes | entityType, loanCategory, amount, tenureYears, location, purpose, purposeNote? | `{ id }` loanFile id |
| POST | `/loan/pre-check` | yes | `{ entityType, answers }` | `{ ok: true }` |
| POST | `/consent` | yes | ConsentRecord | `{ ok: true }` |
| POST | `/documents` | yes | multipart `docType`, `consentVersion`, `file` | `{ id }` |
| GET | `/documents/:id` | yes | — | `{ status: processing\|verified\|rejected, summary?, reason? }` |
| DELETE | `/documents/:id` | yes | — | 204 |
| POST | `/analysis` | yes | `{ documentIds, consentVersion }` | `{ id }` |
| GET | `/analysis/:id` | yes | — | `{ status, steps, message? }` |
| POST | `/score` | yes | `{ analysisId }` | `{ score, improvement }` |
| POST | `/lenders` | yes | `{ analysisId }` | `{ lenders }` only verified |
| POST | `/applications` | yes | `{ lenderId }` | LoanApplication object |
| GET | `/applications/:id` | yes | — | LoanApplication object |
| POST | `/notifications/whatsapp` | yes | `{ analysisId?, applicationId?, event }` | `{ ok: true }` |
| GET | `/notifications` | yes | — | app abhi local timeline dikhati hai; server list Phase 11 |

LoanApplication shape the app expects:

```
{ id, lenderId, lenderName, product, amount, status, createdAt,
  timeline: [{ id, title, detail, at?, state: done|active|pending }],
  pendingDocument?: { title, detail }, whatsApp?: boolean }
```

Lender shape:

```
{ id, name, kind, product, verified, indicative?, interest, documentsStillNeeded?, reasons: string[] }
```

Score shape: `{ analysisId, value, band, assessedAt, factors: [{ id, label, score, max, attention? }], basedOn }`
Improvement: `{ id, title, found, why, action, evidence }`

## 5. Validation (Zod)

- mobile: `/^[6-9]\d{9}$/`, countryCode `+91` only
- otp: 6 digits
- referralCode optional: `/^[A-Z0-9]{4,12}$/` after trim+upper. **Server pe code exist karta hai ya nahi — rule missing.** App sirf format check karti hai, Apply pe API nahi marti.
- fullName: trim, 2–80, `/^[A-Za-z][A-Za-z .'-]*$/`
- PAN: `/^[A-Z]{5}\d{4}[A-Z]$/`
- DOB: `DD/MM/YYYY`, real date, age 18–100, future nahi
- entityType: `msme` | `individual`
- category ids: business, working-capital, lap, machinery, invoice, personal, home, vehicle
- MSME categories: sab 8. Individual: personal, home, vehicle, lap
- invoice default unavailable, reason `Not yet available in your area` (config, hardcode policy nahi)
- amount/tenure category ke range me (app catalog):
  - business, working-capital, machinery, invoice: 5L–2Cr, tenures business/WC 1,2,3,5; machinery 1,3,5,7; invoice 1
  - lap: 10L–5Cr, tenures 3,5,10,15
  - personal: 50k–40L, tenures 1,2,3,5
  - home: 5L–5Cr, tenures 5,10,15,20
  - vehicle: 1L–50L, tenures 1,3,5,7
- purpose usi category ki list se, ya `other`
- purposeNote: `other` pe required, min 10, max 250. Warna optional.
- location: non-empty string, max 80. App city list + custom town allow karti hai.
- pre-check MSME keys: businessAge `lt1|1-3|3-5|5+`, monthlyTurnover `lt5L|5-25L|25L-1Cr|1Cr+`, existingEmis `yes|no`, gstRegistered `yes|no`
- pre-check Individual: employment `salaried|self-employed`, monthlyIncome `lt25K|25-50K|50K-1L|1L+`, workExperience `lt1|1-3|3-5|5+`, existingEmis `yes|no`
- consent version exactly `2026-10-v1` until copy changes. aiDocuments.granted === true to continue past consent.
- files: pdf, jpeg, png; max 10 MB; empty reject
- docType allowed list entity+category+employment se aati hai:
  - required: pan, bankStatement, and itrGst (msme) OR salarySlips (individual salaried) OR itr (individual else)
  - optional: property (lap/home), vehicleQuote (vehicle), machineryQuote (machinery)
- document read ke bina analysis start nahi. aiDocuments consent ke bina analysis 403.

## 6. Auth plan

- Password nahi. Mobile OTP.
- Dev: mock SMS provider. Fixed code sirf `NODE_ENV=development` me `OTP_DEV_CODE` se (default `123456`). Production me env code band.
- Architecture: `SmsProvider` interface. Dev implementation log/mock. Real provider baad me same interface.
- OTP hash bcrypt. Plain OTP DB me nahi.
- Proposed limits (**assumption, confirm nahi**): expiry 5 min, resend cooldown 30s (`resendIn: 30`), max 5 verify attempts, phir code invalid. Request rate limit per mobile + IP.
- Access JWT short (15m). Refresh 30d, rotate on use, logout pe revoke.
- Response me `token` = access (app yahi store karti hai). `refreshToken` extra field — current app ignore karegi jab tak update na ho.
- Roles abhi: `borrower`. Admin role Phase 12. Borrower apni resources ke alawa kuch nahi.

## 7. Documents, score, notifications

- Upload ke baad status `processing`, poll `verified` ya `rejected`.
- Analysis steps: (1) bank statement read (2) MSME: GST & ITR consistency / Individual: income consistency (3) score calculate. WhatsApp opt-in event `analysis.completed`.
- Score **mock** jab tak formula na mile. App ka mock sirf shape dikhane ke liye hai (cashflow 19/25, etc.). Production number invent karke "real score" mat bolo. Band labels app me hain: 80+ Strong, 60+ Good, 40+ Fair, else Needs work. Ye bhi unofficial hain — config me rakho.
- Credit-history factor sirf jab creditBureau consent on ho.
- Improvement sirf jab `existingEmis=yes`. Text app ke mock jaisa, "48% of inflow" **mat** likhna (Figma fake hai, PROGRESS ne mana kiya).
- Lender interest hamesha `As per lender policy`. Fake eligible amount tabhi jab config me ho.
- Apply timeline start: documents complete + sent to lender done, under review active, sanctioned/disbursed pending. Baaki transitions admin ke bina automatic mat karo.
- WhatsApp: do events `analysis.completed`, `application.status`. Provider missing — interface + dev log.
- In-app notifications Phase 11: application timeline events.

## 8. Missing info (assumption mat banana)

1. OTP expiry, attempt cap, resend cap — upar proposed, **confirm chahiye**.
2. Referral code ka matlab: sirf format, ya partner table me hona zaroori? Lead-protection days (Figma 58/45/60) ka rule nahi.
3. Official Financial Health Score formula, weights, bands.
4. Lender eligibility rules (turnover, vintage, city, EMI). Abhi koi lender master data nahi.
5. Application status kaun badalta hai (ops human vs lender webhook). Webhook spec nahi.
6. `pendingDocument` kab aur kaun set kare.
7. Rejected / documents-pending borrower ko dikhe ya nahi.
8. Ek user ki purani applications list karni hai ya sirf latest? App abhi sirf current id rakhti hai. Server side purani files **delete mat karo**.
9. PAN uniqueness across users? Likely unique — confirm.
10. Business legal name, GSTIN, CIN borrower flow me collect nahi hote. Mat add karo.
11. File storage production target (S3 etc.) nahi.
12. SMS aur WhatsApp vendor nahi.
13. Privacy policy URL nahi.
14. Admin/partner scope: borrower V1 me out. Phase 12 minimum kya hai — user confirm kare.
15. Co-applicant Figma improvement text me hai, koi screen/field nahi. Mat banao.

## Phase 1 setup (kya install hona chahiye)

Runtime: Node 24 (machine pe hai), npm, PostgreSQL 16+, Prisma.

npm dependencies: express, cors, helmet, express-rate-limit, zod, dotenv, @prisma/client
dev: typescript, tsx, prisma, eslint, typescript-eslint, prettier, @types/node, @types/express, @types/cors

Phase 2 par add: bcrypt, jsonwebtoken, @types/bcrypt, @types/jsonwebtoken
Phase 5 par add: multer, @types/multer

Machine pe system PostgreSQL / Docker nahi hai, sudo bhi nahi. Local dev DB `embedded-postgres` (PostgreSQL 18.4) se chalti hai: `npm run db:up` → `127.0.0.1:5432`, user/db `fundenflo`. Data `.pgdata/` me hai (gitignored). Production pe sirf `DATABASE_URL` badlega.

Prisma **6.19.3** pin hai. npm ne pehle Prisma 8 RC de diya tha, usme `prisma generate` nahi hai.

## Phase 1 result

Implemented:
- TypeScript strict, Express 5, Zod 4, Prisma 6, ESLint, Prettier
- Folder: `src/config`, `src/lib`, `src/middlewares`, `src/modules/health`, `src/routes`
- Central error `{ message, code }`, 404, helmet, cors, rate limit (health skip)
- `GET /api/v1/health`

Important files: `src/app.ts`, `src/server.ts`, `src/config/env.ts`, `prisma/schema.prisma` (abhi koi model nahi — tables Phase 2 se), `scripts/dev-db.mjs`, `.env.example`

Database changes: none. Connection `SELECT 1` only.

Test:
- `tsc --noEmit` pass
- `eslint .` pass
- `GET /api/v1/health` → **200** `{"status":"ok","database":"up",...}`
- unknown route → **404** `{"message":"Route not found","code":"NOT_FOUND"}`

Run next time:
```bash
npm run db:up          # terminal 1, tab tak chalta rahe
npm run dev            # terminal 2
curl http://127.0.0.1:4000/api/v1/health
```

## Phase 2 result — Authentication

Implemented:
- Tables: `User`, `OtpChallenge`, `RefreshToken`. Migration `20261006085753_auth_otp`.
- `POST /api/v1/auth/otp/request` → `{ resendIn: 30 }`
- `POST /api/v1/auth/otp/resend` → `{ resendIn: 30 }`
- `POST /api/v1/auth/otp/verify` → `{ token, refreshToken, user }`
- `POST /api/v1/auth/refresh` → naya `{ token, refreshToken, user }` (purana refresh token burn)
- `POST /api/v1/auth/logout` Bearer + `{ refreshToken }` → `{ ok: true }`
- `GET /api/v1/auth/me` Bearer → `{ user }` protected route
- Dev SMS: `SmsProvider` interface + `DevSmsProvider`. Real SMS baad me isi interface pe lagega.
- Dev OTP `123456` (`OTP_DEV_CODE`). Production me ye code use nahi hota, aur mock SMS `SMS_NOT_CONFIGURED` throw karta hai.
- OTP bcrypt hash. Refresh token ka sirf SHA-256 hash DB me hai.
- Access JWT 15 min. Refresh 30 din. Logout refresh revoke karta hai. Access token 15 min tak valid rehta hai (denylist nahi, jaan-boojh ke).
- Purana refresh dobara use ho to us user ke saare refresh tokens revoke (`REFRESH_REUSED`).

Limits (assumption, product doc me number nahi the — yahi use ho rahe hain):
- OTP expiry 5 min
- resend cooldown 30 sec
- 5 galat attempts, phir code lock
- 5 OTP requests / 15 min / mobile
- IP limit: request+resend 10 / 15 min, verify 20 / 15 min

Referral: format `4–12` letters/numbers, uppercase save. Partner table check **nahi** (rule missing). Sirf naye user pe save hota hai.

Profile `PATCH /auth/profile` is phase me nahi. Woh Phase 3 hai. `fullName`, `pan`, `dob` columns table me empty hain.

Important files:
- `src/modules/auth/*`
- `src/middlewares/require-auth.ts`
- `prisma/schema.prisma`
- `postman/FundenFlo.postman_collection.json` — Health + Auth. Verify/Refresh token variables khud save karte hain.

Test (pass):
- invalid mobile 400
- request 200, turant dusri request 429 `OTP_COOLDOWN`
- galat OTP 401 `OTP_INVALID`, sahi `123456` 200
- `/auth/me` bina token 401, token ke saath 200
- refresh naya token deta hai; purana refresh `REFRESH_REUSED`
- logout ke baad refresh 401
- 5 galat attempts `OTP_LOCKED`, uske baad sahi code bhi nahi chalta
- referral `ffdsa1` user pe `FFDSA1` save
- `tsc` aur `eslint` pass
- server log: `[dev-sms] OTP for +91 ...: 123456`

Frontend connect:
- App `.env`: `EXPO_PUBLIC_API_URL=http://COMPUTER_LAN_IP:4000/api/v1`
- Phone pe `localhost` mat likhna — woh phone khud hai. Computer aur phone same Wi-Fi.
- App pehle se `POST /auth/otp/request` aur `POST /auth/otp/verify` call karti hai, aur `token` save karti hai.
- `refreshToken` response me extra hai. Current app use nahi karti. Baad me app update karni hogi, warna 15 min baad token expire ho jayega.

## Next session — Phase 3 start checklist

1. Ye file padho. Phase 2 APIs upar hain. Postman collection `postman/FundenFlo.postman_collection.json`.
2. User ne Phase 3 allow kiya ho tabhi profile + entity type.
3. `PATCH /auth/profile` name, PAN, DOB. Mobile change nahi.
4. Entity type loan file pe, user pe nahi.
5. Collection me naye requests add karke ye file update karo. Phir STOP.
