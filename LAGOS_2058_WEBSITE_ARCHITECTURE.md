# LAGOS 2058 — Player Website Architecture

## 1. What This Document Is

This is a build specification for the **player-facing website** of LAGOS 2058, a 12-turn political campaign simulation set in fictional 2058 Nigeria. Over 100 players are waiting in a Discord server. The game engine already exists as a Python package (`src/election_engine/`) with a FastAPI GM tool (`api/`). This website is the **player interface** — entirely separate from the GM tooling.

The existing codebase lives at `https://github.com/Theodore2058/LAGOS-2058`. Do not modify the election engine, the FastAPI backend, or the existing React GM frontend. This is a new, standalone application.

---

## 2. Project Goals

1. **Dashboard**: Each player logs in and sees their party's current state — PC balance, cohesion, exposure, vote share, seat count, momentum, awareness, EPO scores. Players should ONLY see their own party's private data.
2. **Interactive Map**: A Leaflet-based choropleth of Nigeria's 774 LGAs grouped into 150 voting districts across 8 Administrative Zones. Reads GeoJSON + election results from Supabase — NOT hardcoded. Players see public election results (vote share by district, seat allocation, turnout) but NOT raw engine internals (awareness matrices, salience arrays, etc.).
3. **Action Submission**: Forms for all 14 campaign action types matching the rulebook spec. Players fill out action parameters, see PC cost calculated live, and lock in submissions before the Friday deadline. GMs retrieve submissions, feed them to the engine, resolve the turn, and push new state.
4. **Forum / In-Character Twitter ("NairaTwitter")**: A simple social feed where players post in-character as their political figures. Posts, replies, timestamps, character attribution. Think Nairaland's headline feed meets Twitter's reply threading.
5. **Wiki**: Auto-generated and player-editable pages for parties and characters. When a player registers a party or character, a wiki stub is auto-created. Players can flesh these out with lore, history, platform descriptions. Public-facing — anyone can read, only the owner can edit their own entries.
6. **Auth + Party Registration**: Supabase auth (email/password or Discord OAuth). Each user is associated with one party. Party registration flow creates the party record AND auto-generates wiki stubs.
7. **Game State Display**: A public-facing "election results" view showing national vote shares, seat counts per party, and district-level breakdowns after each turn resolution. This is the data the GMs push after running the engine.

---

## 3. Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Hosting**: Vercel
- **Database + Auth**: Supabase (Postgres + Auth + Storage + Realtime)
- **Map**: Leaflet via `react-leaflet` — the existing frontend already uses this successfully
- **Styling**: Tailwind CSS with a custom theme implementing the visual direction below
- **GeoJSON source**: Supabase Storage bucket (upload `nga_lga_enriched.geojson` ~5.4MB, `district_info.json` ~59KB, `zone_info.json` ~2KB from the repo's `GeoJSON/` folder)

---

## 4. Visual Direction: Nairaland × Frutiger Aero

The site should look like a collision between **Nairaland Forum** (the Nigerian internet's living fossil — text-dense, link-heavy, beige backgrounds, serif headers, comma-separated category links, centered single-column layout) and **Frutiger Aero / Web 2.0 Gloss** (the early-to-mid-2000s aesthetic of Mac OS X Tiger/Leopard, Windows Vista — glossy translucent panels, aqua gradient buttons, glass-effect headers, drop shadows for depth, Lucida Grande font stack).

### Core Aesthetic Principles

- **Layout**: Fixed-width centered column (max ~1100px), NOT a modern full-bleed responsive layout. This is deliberate — it should feel like a 2005 website that happens to work on mobile.
- **Panels**: Translucent glass panels with `backdrop-filter: blur()`, subtle `linear-gradient` backgrounds going from a slightly darker top to lighter bottom, `box-shadow` for depth, and a white/light `::after` pseudo-element overlay on the top half for the glossy "glare" effect.
- **Buttons**: Frutiger Aero style — pill-shaped or slightly rounded, gradient backgrounds (darker at top, lighter at bottom), a radial glow at the bottom center (`radial-gradient(farthest-corner at bottom center, rgba(255,255,255,0.7), transparent)`), 1px border matching the gradient midpoint, `box-shadow: 0 4px 4px rgba(0,0,0,0.4)`. Font: `"Lucida Grande", "Lucida Sans Unicode", "Segoe UI", system-ui, sans-serif`. Weight 700. Use the OKLCH color system for accurate hue control. Reference: https://codepen.io/fkeiler/pen/gOZzNzj
- **Headers**: Section headers should have a brushed-metal or teal gradient background with white/light text, similar to Nairaland's green `NAIRALAND NIGERIAN FORUMS` bar but with the Aero gloss treatment. A subtle inner glow and text-shadow.
- **Color Palette**: Primary teal/aqua (#2A8B9A range), secondary warm amber/beige (#F2E2C6, matching the existing map's parchment tone), accent green for positive states, red for scandals/warnings. The overall feel should be warm (Nairaland's beige/cream) with cool glass accents (Aero's translucent blue-green).
- **Typography**: Section headers in a display weight of the system sans-serif stack. Body text and links in the Lucida/Segoe stack. Category links in the Nairaland style — comma-separated, colored, inline, dense. Headlines in the feed use bold mixed with normal weight for emphasis (see Nairaland's `» Bold Keyword Normal text «` pattern).
- **Unorthodox quality**: NOT every element should get the same treatment. The header panel might be full Aero gloss, the forum feed might be nearly plain with just beveled borders, the map panel might have the amber parchment aesthetic from the existing `nigeria_2058_map.html`. The visual inconsistency IS the period authenticity — before design systems flattened everything.
- **Navigation**: A top nav bar (not a sidebar) styled as a row of glossy Aero buttons/tabs, reminiscent of browser chrome from 2006. Items: Home, Map, Submit Actions, NairaTwitter, Wiki, My Party.
- **Details that sell it**: Beveled `<hr>` dividers, subtle scan-line overlay (very faint, like the existing map has), section corner accents, a "glow line" separator (the existing map's `.glow-line` class is a good reference — a gradient line that peaks at translucent teal in the center).

### What to Avoid
- Modern flat design, card-based layouts, hamburger menus
- Tailwind's default aesthetic (gray-50 backgrounds, rounded-lg cards, ring focus states)
- Any font named Inter, Roboto, or Space Grotesk
- Purple gradients, modern glassmorphism (frosted glass is fine, but it should look 2006, not 2024)

---

## 5. Supabase Database Schema

### 5.1 Auth
Use Supabase Auth. Support email/password signup. Optionally add Discord OAuth later (many players come from Discord).

### 5.2 Tables

```sql
-- Player profiles linked to Supabase auth
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  party_id UUID REFERENCES parties(id),
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'gm', 'admin', 'spectator')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Political parties
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,           -- Short name (e.g., "NRP")
  full_name TEXT NOT NULL,             -- Full name (e.g., "National Reform Party")
  color TEXT DEFAULT '#888888',        -- Hex color for map/charts
  leader_name TEXT,
  leader_ethnicity TEXT,
  religious_alignment TEXT,
  positions JSONB DEFAULT '[]',        -- Array of 28 floats (-5 to +5)
  manifesto_text TEXT,                 -- Player-written manifesto prose
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-turn game state snapshot (pushed by GMs after engine resolution)
CREATE TABLE game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turn INTEGER NOT NULL,
  phase TEXT,
  -- National results
  national_vote_shares JSONB,          -- { "NRP": 0.23, "PDP": 0.18, ... }
  national_turnout FLOAT,
  seat_counts JSONB,                   -- { "NRP": 142, "PDP": 98, ... }
  total_seats INTEGER DEFAULT 622,
  -- Per-district results (public)
  district_results JSONB,              -- Array of { district_id, vote_shares, seat_allocation, winner }
  -- Per-LGA results (public, used for map coloring)
  lga_results JSONB,                   -- Array of { lga, az, district_id, turnout, vote_shares, winner }
  -- Metadata
  resolved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT                           -- GM notes about the turn
);

-- Per-party per-turn private state (only visible to party owner + GMs)
CREATE TABLE party_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turn INTEGER NOT NULL,
  party_id UUID REFERENCES parties(id),
  -- Private stats
  political_capital FLOAT,
  cohesion FLOAT,
  exposure FLOAT,
  momentum INTEGER,
  momentum_direction TEXT,
  vote_share FLOAT,
  seats FLOAT,
  awareness_mean FLOAT,                -- Mean awareness across LGAs (0-1)
  -- EPO scores per category per zone
  epo_scores JSONB,                    -- { "economic": { "1": 3.5, "2": 7.0 }, "labor": { ... }, ... }
  -- Scandal history relevant to this party
  scandals JSONB,
  -- Poll results delivered this turn (if any)
  poll_results JSONB,
  UNIQUE(turn, party_id)
);

-- Action submissions (players write, GMs read)
CREATE TABLE action_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turn INTEGER NOT NULL,
  party_id UUID REFERENCES parties(id),
  submitted_by UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  -- Action parameters (varies by type)
  target_district TEXT,                -- For rally, ground_game
  target_azs INTEGER[],               -- For advertising, ethnic_mobilization, crisis_response, epo_engagement
  target_lgas TEXT[],                  -- For patronage
  target_party TEXT,                   -- For opposition_research, media (negative/contrast)
  target_ethnicity TEXT,               -- For ethnic_mobilization
  language TEXT DEFAULT 'english',
  medium TEXT,                         -- For advertising: radio/tv/internet
  intensity TEXT,                      -- For ground_game/patronage: standard/reinforced/surge or standard/heavy/massive
  ad_spend TEXT,                       -- For advertising: standard/heavy/blitz
  endorser_type TEXT,                  -- For endorsement
  endorser_name TEXT,                  -- For endorsement
  tone TEXT,                           -- For media: positive/negative/contrast
  narrative TEXT,                      -- For media (positive): the narrative angle
  source TEXT,                         -- For fundraising: grassroots/corporate/diaspora/party_levy
  poll_tier INTEGER,                   -- For poll: 1-5
  epo_category TEXT,                   -- For epo_engagement: economic/labor/elite/youth
  epo_score_change INTEGER,            -- For epo_engagement: 1-5
  positions JSONB,                     -- For manifesto: new 28-dimension positions
  -- Quality-boosting content
  description TEXT,                    -- Detailed narrative / speech content / rationale
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'locked', 'resolved')),
  gm_quality_score INTEGER,            -- GM assigns 2-10 after review
  gm_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  locked_at TIMESTAMPTZ
);

-- Forum / NairaTwitter posts
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id),
  character_name TEXT,                 -- In-character attribution
  party_id UUID REFERENCES parties(id),
  content TEXT NOT NULL,
  reply_to UUID REFERENCES forum_posts(id),  -- Threading
  category TEXT DEFAULT 'general',     -- general, campaign, news, satire, etc.
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wiki pages
CREATE TABLE wiki_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,           -- URL-friendly identifier
  title TEXT NOT NULL,
  page_type TEXT CHECK (page_type IN ('party', 'character', 'lore', 'zone', 'issue')),
  content TEXT,                        -- Markdown content
  party_id UUID REFERENCES parties(id), -- If party or character page
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  auto_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn deadlines and game config (managed by GMs)
CREATE TABLE game_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);
-- Expected keys:
-- 'current_turn': { "turn": 3, "deadline": "2026-03-21T05:00:00Z", "phase": "Expansion" }
-- 'party_colors': { "NRP": "#2A8B9A", "PDP": "#008000", ... }
-- 'submission_open': { "open": true }
```

### 5.3 Row Level Security (RLS)

```sql
-- Profiles: users can read all, update own
-- Parties: all can read, creator can update
-- game_state: all can read, only GMs can insert/update
-- party_state: players can read only their own party's rows, GMs can read/write all
-- action_submissions: players can CRUD their own party's drafts, GMs can read all + update scores
-- forum_posts: all can read, authenticated can insert, author can update/delete own
-- wiki_pages: all can read, creator/party-owner can update their own, GMs can update any
-- game_config: all can read, only GMs can write
```

Critical security rule: **party_state** must enforce that `party_id` matches the requesting user's `profiles.party_id`. A player must NEVER see another party's PC balance, cohesion, exposure, awareness, or EPO scores.

---

## 6. Page Specifications

### 6.1 Home / Landing Page

**Route**: `/`

The front page. Structured like Nairaland's homepage:

- **Header**: Site title "LAGOS 2058" in display font, subtitle "Political Campaign Simulation", glossy Aero-style header panel. Current turn number, phase name, and countdown to next deadline prominently displayed.
- **Category bar**: Nairaland-style comma-separated links: `Dashboard · Map · Submit Actions · NairaTwitter · Wiki · Rulebook · Discord`
- **News feed**: The most recent forum posts / GM announcements, displayed in Nairaland's `» Headline text «` format. Bold keywords mixed with normal weight.
- **Standings sidebar or section**: Current party rankings by seat count — a simple leaderboard table. Party name, color swatch, seats, vote share.
- **If not logged in**: Show standings + news feed + prominent login/register buttons. No action submission or private dashboard.

### 6.2 Dashboard

**Route**: `/dashboard`
**Auth**: Required. Redirects to login if not authenticated.

The player's private command center. Shows only THEIR party's data.

- **Party header**: Party name, full name, color, leader name.
- **Stats grid**: PC balance (with hoarding cap indicator), cohesion (with multiplier shown), exposure (with scandal probability), momentum (rising/falling/stable icon), current vote share, seat count, mean awareness.
- **EPO scores**: A small table showing scores per category (Economic, Labor, Elite, Youth) per zone (8 AZs). Highlight any at 7+ (dividend threshold) and 5+ (intel threshold).
- **Action history**: List of past turns' submitted actions with GM quality scores.
- **Poll results**: If any polls have been delivered, show them here.
- **Scandal history**: If any scandals have hit, show turn, penalty, and details.

Data source: `party_state` table filtered to user's party + latest turn. `game_state` for public standings.

### 6.3 Interactive Map

**Route**: `/map`
**Auth**: Optional (public view shows results; logged-in view can show party-specific overlays).

A Leaflet choropleth map of Nigeria.

- **GeoJSON**: Load `nga_lga_enriched.geojson` from Supabase Storage. This contains 774 LGA polygons. The existing React frontend at `frontend/src/pages/Map.tsx` has a working implementation with LGA name normalization and alias mapping — reference that code for the matching logic (lines 12-55 of Map.tsx, including the `LGA_ALIASES` map).
- **Color modes**: Winner (color by winning party), Turnout (gradient by turnout percentage), Margin (gradient by winner's margin of victory). These are the same three modes the existing frontend implements.
- **District boundaries**: Overlay district boundaries from `district_info.json`. Each district groups multiple LGAs.
- **Zone boundaries**: 8 Administrative Zones from `zone_info.json`.
- **Hover tooltip**: LGA name, state, district ID, zone name, population, ethnic composition (top 3 groups + percentages), religious breakdown, turnout, vote shares per party (from latest `game_state.lga_results`).
- **Click detail panel**: Expanded view with district-level seat allocation, vote share breakdown per party, and historical trend if multiple turns have been resolved.
- **Aesthetic**: Use the amber-parchment background from the existing standalone map (`#F2E2C6`). The panels overlaying the map should use the glass-panel Aero treatment. Subtle scanline overlay and vignette effect (the existing map has both — see the `.scanlines` and `.vignette` CSS classes in `nigeria_2058_map.html`).

Data source: GeoJSON from Supabase Storage. Election results from `game_state` table. `district_info.json` and `zone_info.json` can be bundled as static assets.

### 6.4 Action Submission

**Route**: `/actions`
**Auth**: Required.

The core gameplay interface. Players compose and submit campaign actions.

**Turn context bar**: Current turn, phase, deadline countdown, player's remaining PC.

**Action builder**: A form that adapts based on the selected action type. The 14 action types and their form fields:

| Action | Cost | Fields |
|--------|------|--------|
| Rally | 2 PC | Target District, Language |
| Advertising | 2+ PC | Target AZ(s), Language, Medium (radio/tv/internet), Ad Spend (standard/heavy/blitz) |
| Ground Game | 3+ PC | Target District, Language, Intensity (standard/reinforced/surge) |
| Media | 1 PC | Language, Tone (positive/negative/contrast), Target Party (if neg/contrast) OR Narrative (if positive) |
| Endorsement | 2+ PC | Endorser Type (traditional_ruler/religious_leader/epo_leader/celebrity/political_figure), Endorser Name, Target |
| Patronage | 3+ PC | Target LGA(s), Scale (standard/heavy/massive) |
| Ethnic Mobilization | 2 PC | Target AZ(s), Target Ethnicity |
| EPO Engagement | 3+ PC | Target AZ, Category (economic/labor/elite/youth), Score Change (1-5, >3 costs +1 PC) |
| Opposition Research | 2 PC | Target Party, Target Dimensions (up to 4 of the 28 issues, or auto-detect) |
| Crisis Response | 2 PC | Target AZ(s) |
| Manifesto | 3 PC | New positions on all 28 dimensions (-5 to +5 sliders) |
| Fundraising | 2 PC | Source (grassroots/corporate/diaspora/party_levy) |
| Poll | 1-5 PC | Poll Tier (1-5) |
| EPO Intelligence | 0 PC | Target AZ (requires EPO score 5+ in that zone) |

**For every action**: Include a large `description` textarea where the player writes their narrative, speech content, ad copy, or strategic rationale. This is what GMs score for quality. Prominently display the quality scoring rubric:
- Strategic Fit (1-5): Right action, right region, right demographic, right language?
- Quality (1-5): How detailed, realistic, and contextually aware?
- Creativity bonuses (+1 each, capped at 5): actual speech/ad content, visual/audio production notes, strategic documentation.

**PC cost calculator**: As the player fills in fields, dynamically calculate and display the total PC cost. Reference the cost structure in `campaign_actions.py` lines 27-51:
- Advertising: base 2, TV adds +1, heavy ads +1, blitz +2
- Ground Game: base 3, reinforced +1, surge +2
- Patronage: base 3, heavy +1, massive +2
- EPO Engagement: base 3, score_change > 3 adds +1
- Poll: tier IS the cost (1-5 PC)
- Endorsement: base 2, political_figure type adds +1

**Action queue**: Players can compose multiple actions per turn. Show them as a list with running PC total. Each action can be saved as draft, then locked/submitted.

**Submission flow**:
1. Player composes actions → saved as `status: 'draft'` in `action_submissions`
2. Player clicks "Submit Turn" → all drafts flip to `status: 'submitted'`, `submitted_at` timestamped
3. After deadline, GMs lock submissions → `status: 'locked'`
4. After resolution, GMs update → `status: 'resolved'`, `gm_quality_score` filled in

**Validation rules**:
- Cannot submit if total cost exceeds current PC
- Cannot submit EPO Intelligence if party's EPO score in target zone < 5
- Manifesto required by turn 3
- Warn (but don't block) on high-exposure actions (ethnic mobilization, patronage)

### 6.5 NairaTwitter (Forum)

**Route**: `/forum`
**Auth**: Required to post, public to read.

A simple threaded feed. NOT a full forum engine — more like a timeline.

- **Post composer**: Character name (defaults to party leader), content textarea, category selector (general/campaign/news/satire/debate).
- **Feed**: Reverse-chronological. Each post shows: character name, party affiliation (with color), timestamp, content. Reply button expands inline thread.
- **Nairaland styling**: Posts separated by thin horizontal rules. Bold character names. Timestamps in the `Thursday, 12 March 2058 at 03:37 PM` format. Category headers in the Nairaland green bar style.
- **GM posts**: GMs can post as "INEC" (election commission), "NTA" (news agency), or crisis event narrators. These should be visually distinct — pinned, perhaps with a different panel treatment.
- **No pagination initially** — just load the latest 50 posts. Add "Load More" button later.

### 6.6 Wiki

**Route**: `/wiki`, `/wiki/[slug]`
**Auth**: Required to edit, public to read.

- **Index page** (`/wiki`): Lists all wiki pages grouped by type: Parties, Characters, Zones, Issues, Lore. Nairaland-style comma-separated links.
- **Party pages** (auto-generated on party creation): Party name, full name, color, leader, positions on the 28 dimensions visualized as a simple bar chart or radar chart, manifesto text, current standings (from latest `game_state`).
- **Character pages** (auto-generated on character creation): Character name, party affiliation, role, biography (player-written).
- **Content editing**: Markdown editor. Simple — a textarea with preview. Players can only edit pages linked to their own party/characters. GMs can edit anything.
- **Auto-generation**: When a party is registered, create wiki pages for the party AND its leader character with stub content. Slug format: `party-[shortname]`, `character-[name]`.

### 6.7 Login / Register

**Route**: `/login`, `/register`

- Supabase Auth email/password flow.
- On first login, prompt to create a profile (username, display name).
- Party registration is a separate flow from `/dashboard` — not everyone starts with a party (spectators can just watch and post on the forum).

---

## 7. The 28 Issue Dimensions

These are used in the Manifesto action form and the wiki party pages. Here they are with pole labels:

| # | Dimension Key | Negative Pole (-5) | Positive Pole (+5) |
|---|--------------|--------------------|--------------------|
| 1 | sharia_jurisdiction | Secular | Full Sharia |
| 2 | fiscal_autonomy | Centralism | Confederalism |
| 3 | chinese_relations | Western pivot | Deepen WAFTA |
| 4 | bic_reform | Abolish BIC | Preserve BIC |
| 5 | ethnic_quotas | Meritocracy | Affirmative action |
| 6 | fertility_policy | Population control | Pro-natalism |
| 7 | constitutional_structure | Parliamentary | Presidential |
| 8 | resource_revenue | Federal monopoly | Local control |
| 9 | housing | Pure market | State intervention |
| 10 | education | Radical localism | Meritocratic centralism |
| 11 | labor_automation | Pro-capital | Pro-labor |
| 12 | military_role | Civilian control | Military guardianship |
| 13 | immigration | Open borders | Restrictionism |
| 14 | language_policy | Vernacular | English supremacy |
| 15 | womens_rights | Traditional patriarchy | Aggressive feminism |
| 16 | traditional_authority | Marginalization | Formal integration |
| 17 | infrastructure | Targeted | Universal provision |
| 18 | land_tenure | Customary | Formalization |
| 19 | taxation | Low tax | High redistribution |
| 20 | agricultural_policy | Free market | Protectionist smallholder |
| 21 | biological_enhancement | Prohibition | Universal access |
| 22 | trade_policy | Autarky | Full openness |
| 23 | environmental_regulation | Growth first | Strong regulation |
| 24 | media_freedom | State control | Full press freedom |
| 25 | healthcare | Pure market | Universal provision |
| 26 | pada_status | Anti-Padà | Padà preservation |
| 27 | energy_policy | Fossil status quo | Green transition |
| 28 | az_restructuring | Return to 36+ states | Keep 8 AZs |

---

## 8. The 8 Administrative Zones

From `zone_info.json`:

| AZ | Name | States | Districts | LGAs | Population |
|----|------|--------|-----------|------|------------|
| 1 | Federal Capital Zone | Lagos | 4 | 20 | 40,887,993 |
| 2 | Niger Zone | Kwara, Niger, Ogun, Oyo | 19 | 94 | 34,464,679 |
| 3 | Confluence Zone | Edo, Ekiti, Kogi, Ondo, Osun | 20 | 103 | 33,199,957 |
| 4 | Littoral Zone | Akwa Ibom, Bayelsa, Cross River, Delta, Rivers | 21 | 105 | 39,567,438 |
| 5 | Eastern Zone | Abia, Anambra, Benue, Ebonyi, Enugu, Imo | 22 | 118 | 45,286,963 |
| 6 | Central Zone | FCT, Kano, Nasarawa, Plateau | 18 | 80 | 34,684,702 |
| 7 | Chad Zone | Adamawa, Bauchi, Borno, Gombe, Jigawa, Taraba, Yobe | 24 | 139 | 33,903,194 |
| 8 | Savanna Zone | Kaduna, Katsina, Kebbi, Sokoto, Zamfara | 22 | 115 | 33,005,073 |

Total: 150 districts, 774 LGAs, 622 seats, ~295 million population.

---

## 9. Data Flow: Engine ↔ Website

The election engine and the website are **completely decoupled**. They share data only through Supabase.

### Player → Engine (action submission)
```
Player fills form on website
  → Saved to `action_submissions` table in Supabase
  → GMs query Supabase for all submitted actions for the turn
  → GMs transform submissions into ActionSpec objects for the Python engine
  → Engine resolves turn
  → GMs push results back to Supabase
```

### Engine → Player (results publication)
```
Engine produces TurnResultResponse (see api/schemas/campaign.py lines 85-97)
  → GMs extract:
    - National vote shares, turnout, seat counts → `game_state` table
    - Per-LGA results (turnout, vote shares, winner) → `game_state.lga_results`
    - Per-district results (seat allocation) → `game_state.district_results`
    - Per-party private state (PC, cohesion, exposure, etc.) → `party_state` table
    - Poll results (if any) → `party_state.poll_results`
  → Website reads from these tables on page load / realtime subscription
```

### What Players See vs. What's Hidden

**Public** (all players can see):
- National vote shares and seat counts per party
- District-level vote shares and seat allocation
- LGA-level vote shares, turnout, and winner (for map coloring)
- All parties' names, colors, leaders, manifesto positions (once published)
- Forum posts, wiki pages

**Private per party** (only that party's members + GMs):
- Political Capital balance
- Cohesion score
- Exposure level
- Momentum direction and level
- Mean awareness
- EPO scores per zone per category
- Poll results
- Scandal details
- Action submission history and GM quality scores

**Hidden from all players** (GM-only):
- Raw awareness matrices (774 × J array)
- Raw salience shift arrays
- Raw valence arrays per LGA
- Turnout ceiling/modifier internals
- Other parties' private state
- The election engine source code and parameters

---

## 10. GeoJSON Integration Notes

The existing frontend at `frontend/src/pages/Map.tsx` already solves the hard problem of matching GeoJSON LGA names to engine LGA names. The GeoJSON uses `adm2_name` as the LGA name property, and there are ~30 discrepancies with the engine's naming. The `LGA_ALIASES` map (Map.tsx lines 23-55) handles these. Copy this alias map into the new map component.

The enriched GeoJSON at `GeoJSON/nga_lga_enriched.geojson` (5.4MB) contains the LGA polygons with properties including state name, zone, population data, and ethnic/religious breakdowns. This is the primary data source for map rendering.

For coloring: join GeoJSON features to `game_state.lga_results` by normalized LGA name. Each LGA result contains `{ lga, az, district_id, turnout, vote_shares: { party: share }, winner }`.

---

## 11. GM Admin Interface (Minimal)

The website should include a basic GM-only section (route: `/admin`, role check against `profiles.role`):

- **View all submitted actions** for the current turn, grouped by party.
- **Export actions** as JSON that can be fed to the Python engine.
- **Import results**: A form or JSON upload to push resolved turn data into `game_state` and `party_state` tables.
- **Post announcements**: Create pinned forum posts as system accounts (INEC, NTA).
- **Manage deadlines**: Update `game_config` for current turn, deadline, submission_open flag.

This doesn't need to be beautiful. It's a tool for 2-3 GMs. Basic Aero-styled forms are fine.

---

## 12. Implementation Priority

Build in this order:

1. **Supabase setup**: Schema, RLS policies, storage bucket for GeoJSON.
2. **Auth + profiles**: Login, register, profile creation.
3. **Party registration**: Create party, auto-generate wiki stubs.
4. **Dashboard**: Read party_state, display stats.
5. **Action submission**: All 14 action type forms, PC calculator, draft/submit flow.
6. **Map**: Leaflet + GeoJSON + election results overlay.
7. **Forum (NairaTwitter)**: Post, reply, feed.
8. **Wiki**: Index, auto-generated pages, markdown editor.
9. **GM admin**: Action export, result import, announcements.
10. **Polish**: Aesthetic refinement, mobile fallback, loading states.

---

## 13. Key Files to Reference in the Existing Repo

- `src/election_engine/config.py` — Issue dimension names, engine parameters, Party dataclass
- `src/election_engine/campaign_actions.py` — PC costs, action types, targeting scopes, synergy table
- `src/election_engine/campaign_state.py` — CampaignState, CampaignModifiers, ActiveEffect dataclasses
- `api/schemas/campaign.py` — API response shapes (CampaignStateResponse, TurnResultResponse)
- `api/schemas/party.py` — PartySchema (name, positions, leader_ethnicity, etc.)
- `frontend/src/pages/Map.tsx` — Working Leaflet map implementation, LGA alias map
- `frontend/src/components/ActionBuilder.tsx` — Existing action builder UI (GM-facing, but useful reference)
- `GeoJSON/nga_lga_enriched.geojson` — LGA polygons (upload to Supabase Storage)
- `GeoJSON/district_info.json` — District metadata (bundle as static)
- `GeoJSON/zone_info.json` — Zone metadata (bundle as static)
- `nigeria_2058_map.html` — Standalone map with good CSS for the amber/parchment/scanline aesthetic

---

## 14. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Server-side only, for GM operations
NEXT_PUBLIC_GEOJSON_URL=         # Supabase Storage URL for GeoJSON files
```

---

## 15. Summary

Build a Nairaland-meets-Frutiger-Aero player website for a 774-LGA political simulation. Next.js + Supabase + Leaflet. The engine stays separate — players submit actions, GMs resolve turns, results flow back through the database. Security boundary: players see only public results and their own party's private state. The aesthetic is deliberately retro — early 2000s web forum meets Mac OS X glossy UI. Not every panel needs the same treatment; the inconsistency is the style.
