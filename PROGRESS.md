# FundenFlo App — Progress Tracker (Hinglish)

> Ye file har phase ke baad update hoti hai. Agla kaam shuru karne se pehle ye file AI/dev ko de do — isse pata chal jayega kya ho chuka hai aur aage kya karna hai.
>
> Last update: 5 Oct 2026 · Phase 8 complete

---

## 1. Project ka current setup (inspect karke pata chala)

- **Expo SDK 57**, React Native 0.86, Expo Router (routes `src/app/` me), Reanimated 4, TypeScript strict.
- **Redux / Axios / backend APIs / auth module — project me EXIST hi nahi karte the.** Isliye:
  - State ke liye **React Context + AsyncStorage** (`src/store/app-store.tsx`) banaya. Redux add nahi kiya (extra dependency).
  - API ke liye **fetch-based client** (`src/services/api.ts`) banaya. Axios add nahi kiya.
  - Backend nahi hai → **Mock mode** chalta hai. `EXPO_PUBLIC_API_URL` set karoge toh real API hit hogi.
- **Design source of truth:** `stitch_fundenflo_mobile_login_screen (4)/stitch_fundenflo_mobile_login_screen/` (har screen ka `screen.png` + `code.html`, design system `sovereign_advisory/DESIGN.md`). Prompt me `design-reference/` likha tha, par actual folder ye hai.
- **Fonts:** Poppins (headings) + Inter (body) — `assets/fonts` me bundled.
- **Icons:** `expo-symbols` (already installed) — iOS pe SF Symbols, Android/web pe Material Symbols. Nayi icon library install NAHI ki.
- **Koi nayi dependency install nahi hui.**

## 2. Design tokens (Stitch se)

`src/constants/brand.ts` me sab hai:
- Navy `#0A192F` (primary CTA), pressed `#012C5A`
- Gold `#FDB901`, Deep gold `#C59B27` (selection, accents)
- Canvas `#F8FBFF`, Subtle `#F0F4F8`, Card `#FFFFFF`, Border `#E2E8F0`
- Text `#191C1E`, Muted `#64748B`, Success `#1F7A43`, Error `#BA1A1A`
- Radius: button/field 12, card 16, sheet 28 · Margin 20 · Max content width 560 (tablet/web)

## 3. Phase status

| # | Phase | Screens | Status |
|---|-------|---------|--------|
| 0 | Splash + Onboarding | Splash, 3 intro slides | ✅ (user ne pehle banaya tha) |
| 1 | Auth + Foundation | Mobile login, OTP, Step 1 (Individual/MSME) | ✅ Done |
| 2 | Loan requirement + Pre-check | Loan Category, Loan Amount & Tenure, Loan Purpose, Pre-Eligibility (Step 3) | ✅ Done |
| 3 | Consent | Consent (Step 4) | ✅ Done |
| 4 | Documents | Documents checklist, Upload (Step 5), Document Verification (analysing) | ✅ Done |
| 5 | Identity | Verify Your Details (Full Name, PAN, DOB) — design me nahi hai | ✅ Done |
| 6 | Assessment | Financial Health Score (Step 6), Improvement Plan | ✅ Done |
| 7 | Matching + Apply | Matched lenders, apply, application status | ✅ Done |
| 8 | Post-apply | Home dashboard (`Namaste, {firstName} 👋`) | ✅ Done |

## 4. Phase 1 me kya bana (detail)

### Foundation (reusable — aage har screen me use karna hai)
- `src/constants/brand.ts` — colors, fonts, radius, spacing, shadows.
- `src/components/ui/icon.tsx` — `<Icon name="arrow-forward" />`. Naya icon chahiye toh `ICONS` map me iOS + Android naam add karo (Material naam `node_modules/expo-symbols/build/android/symbols.json` me check karo).
- `src/components/ui/button.tsx` — `primary | gold | ghost`, `loading`, `disabled`, `icon`.
- `src/components/ui/screen.tsx` — SafeArea + KeyboardAvoiding + ScrollView + pinned footer + 560px centered column. **Har naya screen isi me wrap karo.**
- `src/components/ui/step-header.tsx` — back button + "Step x of 6" + gold progress bar.
- `src/services/api.ts` — `api()` fetch wrapper, `ApiError`, `USE_MOCK`, `setAuthToken`.
- `src/services/auth.ts` — `requestOtp`, `verifyOtp`, `isValidMobile`, `formatMobile`, `User` type (fullName/pan/dob fields ready for Verify Details).
- `src/store/app-store.tsx` — `useAppStore()` → `session`, `journey`, `signIn`, `signOut`, `updateUser`, `updateJourney`. AsyncStorage me persist. `firstName(user)` helper dashboard greeting ke liye.

### Screens
- **Login** `src/app/(auth)/login.tsx` (`/login`): navy hero + white bottom sheet, EN/हिं toggle (Hindi abhi "coming soon" note), +91 flag input, live validation (10 digit, 6–9 se start), green tick, error state, loading button, expandable referral code (validate + Apply).
- **OTP** `src/app/(auth)/verify-otp.tsx` (`/verify-otp`): 6 boxes (ek hidden input → paste + SMS autofill support), blinking cursor, auto-submit on 6 digits, wrong code pe shake + red error, resend timer 0:30 → "Resend code", Edit number, Terms footer. Mock mode me "use code 123456" banner.
- **Step 1** `src/app/(borrower)/entity-type.tsx` (`/entity-type`): Business/MSME vs Individual cards, gold check, journey me save hota hai, "Not you? Log out".

### Navigation / flow
- `src/app/_layout.tsx` — `AppStoreProvider` wrap; native splash tab tak rehta hai jab tak fonts + saved session load na ho.
- `src/app/(borrower)/_layout.tsx` — **auth guard**: session nahi hai toh `/login` pe redirect. Saare journey screens is folder me banana.
- `src/components/welcome-flow.tsx` — sirf "Registration · Coming next" placeholder hataya. Onboarding finish/skip → `/login` (ya session ho toh `/entity-type`). Splash + slides ka design untouched.
- Flow: Splash → Onboarding → Login → OTP → Step 1. Dobara app khole: Splash → (logged in ? Step 1 : Login).

### Known limitation (Phase 1)
- Hindi translation nahi hai (sirf toggle UI).
- Real backend nahi — mock OTP `123456`.

## 5. Phase 2 me kya bana (detail)

> User ke kehne pe **Pre-Eligibility (Quick pre-check) Phase 2 me hi bana diya** — isliye Phase 3 me ab sirf Consent bacha hai.

### Screens (flow: Step 1 → Category → Amount → Purpose → Pre-check → Consent)
| Route | File | Header | Kya hai |
|---|---|---|---|
| `/loan-category` | `src/app/(borrower)/loan-category.tsx` | Step 2 of 6 · "Loan requirement • 1 of 3" | Design jaisa 2-column tile grid. MSME ko 8 categories, Individual ko 4 (Personal, Home, Vehicle, LAP). Selected = navy icon + gold check. **Unavailable** tile (Invoice Finance, "Not yet available in your area") disabled + greyed. API se availability load hoti hai → loading skeleton (pulse), error card + "Try again". |
| `/loan-amount` | `src/app/(borrower)/loan-amount.tsx` | Step 2 of 6 · "2 of 3" | "How much?" card: bada ₹ amount **editable** (number-pad, Indian commas `25,00,000` live), custom **slider** (category ke min/max/step), ₹5 Lakh — Max sanction pool — ₹2 Crore labels, tenure pills (category-wise), location picker (bottom sheet + search + "Use ‹typed town›"), **Illustrative EMI** card. Upar "Working Capital · Change" chip. |
| `/loan-purpose` | `src/app/(borrower)/loan-purpose.tsx` | Step 2 of 6 · "3 of 3" | Summary card (category · amount · tenure · city + Edit), category-wise purpose list (radio rows), notes textarea (optional; "Something else" pe **required, min 10 chars**, max 250 + counter). Continue → `submitLoanRequirement` (loading + error banner). |
| `/pre-check` | `src/app/(borrower)/pre-check.tsx` | Step 3 of 6 · "Assessment • Step 3 of 6" | Design jaisa: 4 question cards ("1 of 4"), 2-column chips, selected = navy + gold tick, shield note. MSME: business age / turnover / EMIs / GST. Individual: income type / monthly income / work years / EMIs. Continue → `submitPreCheck` (loading + error). |
| `/consent` | `src/app/(borrower)/consent.tsx` | Step 4 of 6 | Phase 2 me placeholder tha — **Phase 3 me real screen ban gaya** (neeche section 6 dekho). |

### Naye reusable pieces
- `src/constants/loan.ts` — **loan catalog**: har category ka title/icon, `minAmount/maxAmount/step/defaultAmount`, `tenures`, `purposes`, `assumedRate` (sirf illustration). `CATEGORIES_FOR` (MSME vs Individual), `PRE_CHECK_QUESTIONS`, `CITIES`, helpers `formatINR` (Indian grouping, Intl pe depend nahi), `formatShortINR` (₹5 Lakh / ₹2 Crore), `formatTenure`, `estimateEmi`, `clamp`.
- `src/services/loan.ts` — `getLoanCategories(entityType)`, `submitLoanRequirement(req)`, `submitPreCheck(entityType, answers)`. Mock mode me delay + data; real me `GET /loan/categories?entityType=`, `POST /loan/requirement`, `POST /loan/pre-check`, `POST /consent` (`ConsentRecord`).
- Privacy policy link: `.env` me `EXPO_PUBLIC_PRIVACY_POLICY_URL=https://...`.
- `src/components/ui/slider.tsx` — RN core touch responder pe bana slider (koi library nahi). Drag + tap-to-jump, ScrollView drag nahi churata, accessibility `adjustable` (increment/decrement).
- `src/components/journey/choice-chip.tsx` — radio chip (`card` = pre-check style, `pill` = tenure style).
- `src/components/journey/journey-footer.tsx` — Continue + hint ("kya missing hai") + red error + "256-Bit…" line. Aage ke journey screens me yahi use karo.
- `src/components/journey/city-picker.tsx` — bottom-sheet Modal, search, safe-area insets, keyboard avoiding.
- `src/components/journey/eyebrow.tsx` — gold dot + uppercase label.

### Phase 1 files me chhote changes (sirf integration)
- `entity-type.tsx` — Continue ab `router.push('/loan-category')` karta hai; "next build" saved-note hata diya.
- `app-store.tsx` — `Journey` me `loanCategory, amount, tenureYears, location, purpose, purposeNote, preCheck { entityType, answers }` add.
- `icon.tsx` — naye icons: store, sync-alt, machinery, receipt, wallet, home, car, location, verified, shield-person, search, close, refresh, edit.

### Validation / states
- Har screen pe Continue **disabled** jab tak valid na ho, aur footer me bataata hai kya missing hai (e.g. "Select your preferred tenure.", "Answer the remaining 1 question…").
- Amount: range ke bahar → red border + "Enter an amount between ₹5 Lakh and ₹2 Crore." (max cross karte hi turant, min wala blur pe). Slider clamp rehta hai. Bahut lamba number → font chhota.
- Category change → amount clamp ho jata hai naye range me; purana tenure/purpose agar naye category me valid nahi toh select nahi rehta.
- Entity type change (MSME ↔ Individual) → purane pre-check answers ignore (questions alag hain).
- Guards: prerequisite missing ho (deep link) toh pichle step pe `<Redirect>`.
- **Data persist**: har selection turant journey (AsyncStorage) me save hota hai → back/forward aur app reload pe sab wapas aata hai.
- ⚠️ PRODUCT_BRIEF rule follow kiya: koi fake lender offer / approval chance nahi. EMI card clearly "Illustrative … assumes X% p.a. … Not a lender offer — lenders set the final rate." Design ka "APR ~ 11.25%" jaan-boojh ke nahi dikhaya.

### Design se jaan-boojh ke differences
- Design me category + amount ek hi screen pe hai; requirement ke hisaab se 3 screens me split kiya (same visual style).
- Design me location "Gurugram" pre-filled tha — humne empty rakha (user khud choose kare). Tenure bhi pre-selected nahi.
- Headings Poppins me (Phase 1 jaisa), design ka Space Grotesk nahi.

### Testing (Phase 2)
- `npx tsc --noEmit` ✅ · `npx expo lint` ✅ · `npx expo export -p web` ✅ (saare naye routes build hue).
- Headless Chrome (CDP script) se **pura MSME flow** 390px aur 320px dono pe chalaya — 23/23 checks pass: disabled states, unavailable tile, slider drag, out-of-range error, Indian comma formatting, tenure/location hints, city search, EMI, "Something else" required note, **back → forward data preserved**, submit loading, pre-check partial hint, consent navigation, **reload ke baad answers restore**.
- ❗ Abhi tak **nahi** hua: physical Android/iPhone test (keyboard, Modal, slider touch real device pe check karna), Individual flow ka e2e run (sirf typecheck), real backend API.

## 6. Phase 3 me kya bana (detail) — Consent

Design: `your_consent_step_4_of_6/`. Flow: Pre-check → **Consent** → `/documents` (Phase 4 placeholder).

### Screen — `/consent` (`src/app/(borrower)/consent.tsx`, Step 4 of 6)
- Design jaisa: shield badge, "You stay in control", 3 white cards + navy toggle, "You can change or withdraw consent anytime.", "Read full privacy policy →", "I agree & continue" + "256-bit encrypted".
- 3 consent items (`src/constants/consent.ts`):
  1. **Read my documents with AI** — **Required** (bina iske Financial Health Score nahi banega).
  2. **Fetch my credit bureau report** — Optional.
  3. **Share my file with lenders I choose** — Optional (off rakhoge toh bhi score + improvement plan milega).
- Poora card tap karo ya toggle — dono se on/off hota hai.
- Required off ho toh button disabled + hint: "Turn on “Read my documents with AI” to continue…".
- "I agree & continue" → `submitConsent()` (loading spinner) → button "Preferences confirmed ✓" (~0.7s) → `/documents`. Fail hua toh red error banner, toggles waise hi rehte hain.
- **Privacy sheet** (`src/components/journey/privacy-sheet.tsx`): bottom sheet me har consent ka simple-language explanation + Required/Optional badge. `.env` me `EXPO_PUBLIC_PRIVACY_POLICY_URL` set karoge toh "Open full privacy policy" button in-app browser (`expo-web-browser`, already installed) me kholega; warna "Got it".

### Consent rules (jaan-boojh ke design se alag)
- ⚠️ **Saare toggles default OFF.** Design me AI + Share pehle se ON the — par pre-ticked consent valid consent nahi maana jaata (DPDP Act: consent "clear affirmative action" se hona chahiye). User khud ON karega.
- Design ka text "withdraw … from Settings" → "change or withdraw consent anytime" kiya, kyunki Settings screen abhi exist nahi karta. Abhi withdraw = wapas Step 4 pe aake toggle off + submit.
- Design ka toast "FunderFlo Data Shield v2.4 Active" nahi dikhaya (fake/typo claim). Privacy sheet me bhi koi unverified claim (encryption-at-rest, soft enquiry) nahi likha.

### Data / audit
- `Journey.consent: ConsentRecord` = `{ version, submittedAt, items: { aiDocuments|creditBureau|lenderSharing: { granted, at } } }`.
- `CONSENT_VERSION = '2026-10-v1'`. **Wording ya purpose badle toh version bump karo** → purana record invalid, user se dobara consent liya jayega.
- Kisi item ka choice same raha toh uska purana `at` timestamp preserve hota hai; badla toh naya timestamp (audit trail).
- Kuch bhi change nahi kiya aur dobara Continue → API call skip, seedha aage.
- `Journey.consentDraft` — submit se pehle ke toggle positions (back/forward pe preserve). Ye consent **nahi** hai; submit ke baad clear ho jata hai.
- API: `src/services/consent.ts` → `submitConsent(record)` → `POST /consent` (mock me 800ms delay).

### Naye / badle files
- Naye: `src/app/(borrower)/documents.tsx` (Phase 4 placeholder — consent summary dikhata hai; valid consent na ho toh `/consent` pe redirect), `src/components/ui/toggle.tsx` (Reanimated navy switch, `role=switch` + `aria-checked`), `src/components/journey/privacy-sheet.tsx`, `src/constants/consent.ts`, `src/services/consent.ts`.
- Badle: `consent.tsx` (placeholder → real screen), `app-store.tsx` (`ConsentRecord`, `consent`, `consentDraft`), `journey-footer.tsx` (optional `icon` + `note` props).
- **Accessibility fix (Phase 2 files me bhi):** react-native-web `accessibilityState.checked` ko `aria-checked` me convert nahi karta tha → web pe screen reader ko selected/on state pata nahi chalti thi. `choice-chip.tsx`, `loan-category.tsx`, `loan-purpose.tsx`, `city-picker.tsx` aur naye `toggle.tsx` me `aria-checked` add kiya.
  - Phase 1 ke `entity-type.tsx` aur `login.tsx` (language toggle) me bhi yahi issue hai — Phase 1 ko touch nahi kiya. Chaho toh 1-line fix hai.

### Testing (Phase 3)
- `npx tsc --noEmit` ✅ · `npx expo lint` ✅ · `npx expo export -p web` ✅ (`/consent`, `/documents` build hue).
- Headless Chrome (CDP) **21/21 checks pass, 390px + 320px**: consent ke bina `/documents` → redirect, sab toggles default off, required off → disabled + hint, card tap se toggle, privacy sheet open/close, back/forward pe draft preserve, draft consent nahi maana jata, loading state, `/documents` navigation, record me version + timestamps, draft clear, saved consent wapas load, ek item badalne pe sirf uska timestamp badalta hai.
- Phase 2 regression suite dobara chalayi — sab pass.
- ❗ Abhi **nahi** hua: physical Android/iPhone (toggle animation, Modal sheet), real backend, privacy policy URL (abhi koi URL nahi hai).

## 7. Phase 4 — Documents + verification (verified complete)

Design: `upload_3_documents_step_5_of_6/` and `analysing_your_documents/`.

- `/documents` — checklist from `documentsFor(entityType, loanCategory, preCheck)`. Required: PAN, bank statement, and ITR/GST (MSME) or salary slips / ITR (individual). Optional property, vehicle, or machinery file when the category needs it.
- Upload PDF and camera scan work (`expo-document-picker`, `expo-image-picker`, already installed). DigiLocker stays disabled with “Soon”.
- AI read only when `journey.consent.items.aiDocuments.granted` is true. Otherwise redirect to `/consent`.
- Card states: pending, uploading %, reading, verified, failed, cancel, remove.
- `/analysing` polls the job, shows three steps, WhatsApp notify, offline retry, and failure with “Try again”. Success continues to `/verify-details`.
- Footer does not claim “encrypted storage”. The third analysis step says the score is being calculated.

## 8. Phase 5 me kya bana — Verify Your Details

Stitch folder me is screen ka design nahi hai. Flow: analysing (done) → `/verify-details`. Analysis `done` na ho toh `/analysing` ya `/documents`.

- Fields: Full name (letters, as on PAN), PAN (`ABCDE1234F`, auto-uppercase), DOB (`DD/MM/YYYY`, real date, 18 or older, not in the future).
- Continue disabled until all three are valid. Field errors show after blur. Green tick when a field is valid.
- Draft (`journey.profileDraft`) survives back/forward. It is not the profile until confirmed.
- “Confirm & Continue” → `saveProfile()` then `updateUser({ fullName, pan, dob })`, then `/score`. Mock, or `PATCH /auth/profile` when `EXPO_PUBLIC_API_URL` is set. Unchanged details skip the request.

## 9. Phase 6 me kya bana — Score + Improvement Plan

Stitch: `your_financial_health_score_step_6_of_6/` and `improvement_plan/`. Alag financial-assessment form design me nahi hai.

- `/score` — Step 6 of 6. Navy card, gold ring, band label, “Not a CIBIL or bureau score”, assessed date. Factor rows from the API. “Needs attention” (gold bar + chip) opens `/improvement` when the API returned an action.
- `/improvement` — one card per action (found / why / what you can do / evidence). “Upload new statement” goes back to `/documents`. A new bank statement starts a new analysis, so the next score load is a new result.
- `GET` is not used. `POST /score { analysisId }` returns `{ score, improvement }`. Mock mode builds the breakdown from entity type, bureau consent, and the EMI answer. Numbers are not hardcoded in the screen.
- Confirm on Verify Details now opens `/score`.
- “See matching lenders” and “Continue with matched lenders” open `/lenders`.
- Jaan-boojh ke design se alag: fake “48% of inflow” nahi dikhaya. Credit-history row tabhi hai jab bureau consent on ho. Chevron sirf us row pe hai jo improvement plan kholta hai.

## 10. Phase 7 me kya bana — Lenders + application

Stitch: `matched_lenders/` and `application/`. “Step 10 of 12” copy nahi kiya. Partner “file application” screen borrower flow ka hissa nahi hai.

- `/lenders` — verified lenders only. Score aur improvement dono yahi kholte hain. Card select → “Apply with {name}”. Interest “As per lender policy”. Indicative amount aur extra-document count tabhi dikhte hain jab API bheje.
- Sharing consent off ho toh button “Share and apply with {name}” hai. Confirm pe `lenderSharing` record update hota hai, phir application banti hai.
- Koi verified match na ho toh empty state + improvement plan ka link. Lender A/B/C sirf mock mode me hain, real empty response pe nahi.
- `/application` — requested amount, app id (copy), timeline: documents complete → sent → under review → sanctioned → disbursed. Extra document alert tabhi jab API `pendingDocument` bheje. WhatsApp toggle `POST /notifications/whatsapp`.
- Fake claims nahi: version number, Priority SLA, RBI encryption line, “digital verification sealed”.
- Real API: `POST /lenders { analysisId }` → `{ lenders }`, `POST /applications { lenderId }`, `GET /applications/:id`.

## 11. Phase 8 me kya bana — Home

Design: `home/`. Route `/home`.

- Header greeting `Namaste, {firstName}`. Name missing ho toh `Namaste`. “Rohit” hardcode nahi.
- Active application card tabhi jab application ho: product, lender, amount, ref, status, Track → `/application`.
- Score card tabhi jab score ho. Open → `/score`. Reassess → `/documents`.
- Pending task tabhi jab application `pendingDocument` ho → `/documents`.
- “Start a new application” confirms, clears the journey (`resetJourney`), login rehta hai, `/entity-type`.
- Apply ke baad `/home`. Application Status ka back aur “Go to home” bhi `/home` pe laate hain. Home khulte hi purana form stack hat jata hai, isliye Android back form pe nahi lautata.
- Dobara app kholo aur application ho toh splash ke baad `/home`, warna `/entity-type`.
- Header: back, `Namaste, {firstName}`, notifications bell (`/notifications`, sirf application timeline), profile avatar (`/profile`).
- Bottom tabs: Home (`/home`), Applications (`/application`), Documents (`/documents`), Profile (`/profile`). Profile me name, PAN aur DOB edit + save hota hai. Mobile sign-in wala rehta hai.
- Advisor design me hai par screen nahi. Woh nahi banaya.

## 12. Baaki
- Partner portal / case queue / commissions designs CA/DSA app ke liye hain — borrower journey ka part nahi.

## 13. Run / Test commands

```bash
npm start                 # dev server (Expo Go / dev build me scan karo)
npx expo start --web      # browser me test
npx tsc --noEmit          # typecheck
npx expo lint             # lint
```

- Mock OTP: **123456**
- Real backend: `.env` me `EXPO_PUBLIC_API_URL=https://...` → endpoints `POST /auth/otp/request {mobile,countryCode,referralCode}`, `POST /auth/otp/verify {mobile,otp}` → `{ token, user }`, `PATCH /auth/profile {fullName,pan,dob}`, `POST /score {analysisId}` → `{ score, improvement }`, `POST /lenders {analysisId}` → `{ lenders }`, `POST /applications {lenderId}`, `GET /applications/:id`, `GET /loan/categories?entityType=` → `{ categories: [{ id, available, reason? }] }`, `POST /loan/requirement`, `POST /loan/pre-check`, `POST /consent` (`ConsentRecord`).
- Privacy policy link: `.env` me `EXPO_PUBLIC_PRIVACY_POLICY_URL=https://...`.
- Mock me Invoice Finance "Unavailable" dikhta hai (`MOCK_UNAVAILABLE` in `services/loan.ts`).
- Onboarding dobara dekhna ho: app data clear karo (web pe localStorage clear).
- Phase 1 test kiya: `tsc` ✅, `expo lint` ✅, web export ✅, headless Chrome screenshots (390px + 320px) login/OTP/Step 1 ✅. Physical Android/iPhone pe abhi test nahi hua.
