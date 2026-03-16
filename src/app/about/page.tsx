'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'

interface TimelineEvent {
  date?: string
  text: string
}

interface TimelineEntry {
  year: number
  title: string
  events: TimelineEvent[]
}

const KEY_YEARS = new Set([2028, 2031, 2032, 2040, 2058])

const TIMELINE: TimelineEntry[] = [
  {
    year: 2028,
    title: 'The cobalt is found',
    events: [
      { date: 'Nov 5', text: 'Rubio-Vance wins the US Presidential Election. Trump remains in an unofficial capacity until his death in 2030.' },
      { date: 'Aug', text: 'A massive cobalt deposit is discovered in Zamfara. Local groups immediately fight for control.' },
      { date: 'Oct', text: 'Sinomine prospectors arrive from China.' },
      { text: 'America and the EU slow oil imports. America had secured large new sources from Venezuela and Iran and was producing more domestically. Europe was simply moving away from oil. Nigerian state revenue collapses.' },
      { text: 'ISWAP offensive, escalating farmer-herder conflict, and banditry break down the Nigerian state. The Fourth Republic collapses.' },
    ],
  },
  {
    year: 2029,
    title: 'Nigeria fractures',
    events: [
      { date: 'May 1', text: 'Reform-Conservative-Restore wins the UK Parliament with 391 seats. British borders close. Similar surges sweep France, Germany, Poland, Italy, Australia, and Japan. Brain drain from Nigeria ends.' },
      { date: 'Sep 14', text: 'Michael Khalil arrives in Nigeria. Born in America to a Lebanese-Nigerian father and a Burkinabè mother, educated at Columbia Law, deported after birthright citizenship was overturned in Trump v. Barbara.' },
      { text: 'Padas develop their own identity. In the West, nobody called them Yoruba or Igbo. They were simply Nigerian. Back home, Nigerians now treated them as outsiders, culturally and linguistically distinct. Khalil quickly integrates into the pada community.' },
      { text: 'Qadiriyya leadership condemns ISWAP and urges followers to form autonomous communities to weather the collapse.' },
    ],
  },
  {
    year: 2030,
    title: 'The invasion',
    events: [
      { date: 'Oct 17', text: 'The Alliance of Sahel States invades Nigeria. The stated justification is cross-border Boko Haram attacks. Modern scholars agree the real motivation is the Zamfara cobalt.' },
      { text: 'ASS forces seize mining outposts and advance toward Zamfara. The fractured Nigerian military mounts a determined but fragmented resistance.' },
      { date: 'Dec 22', text: 'The Sokoto Sultanate Council signs a non-aggression pact with the ASS, granting free passage in exchange for protection of religious sites and a guarantee of religious autonomy. This act of collaboration, one of many by northern elites during the war, would haunt Sokoto for decades.' },
      { date: 'Dec', text: 'ASS columns reach Abuja. Their hold on the country is shallow — the city and governing it are very different things. Khalil joins the Nigeria Defense Front. PLA documents declassified in the 2050s will later reveal the NDF had been receiving Chinese equipment, funding, and training from as early as this month.' },
    ],
  },
  {
    year: 2031,
    title: 'Khalil rises',
    events: [
      { date: 'Feb 8', text: 'Khalil wins a decisive battle at Jikakuchi. The battle was not especially large — perhaps four hundred NDF fighters against a Sahelian garrison of two hundred — but it opened a corridor to Abuja. More importantly, it made Khalil famous.' },
      { date: 'Mar', text: 'Local Tijaniyya leaders approach Khalil with an offer. They will provide intelligence on ASS troop positions in exchange for a single promise: religious autonomy for the north after the war. Khalil has little choice but to agree. He will be reminded of this promise, by allies and enemies alike, for the rest of his career.' },
      { date: 'Sep 19', text: 'Abuja is recaptured after eleven days of fighting. The NDF had swelled to tens of thousands of fighters, absorbing ethnic militias and military defectors. Khalil stands in the wreckage of the National Assembly and gives the Three Pillars Speech: Unity, Liberty, Secularism.' },
      { date: 'Nov 4', text: 'An Igbo resistance group captures Lagos. By December, the last ASS forces are driven back across the border. The war is over.' },
    ],
  },
  {
    year: 2032,
    title: 'The Fifth Republic',
    events: [
      { date: 'Jan 1', text: 'Khalil proclaims the Fifth Republic of Nigeria. The capital moves from Abuja to Lagos. Over the next three months, remaining militias, jihadist cells, and wartime collaborators are hunted down. These final skirmishes are brutal and poorly documented.' },
      { date: 'Jan 15', text: 'The Board for the Investigation of Corruption (BIC) is established. Officials are presumed guilty until proven innocent. BIC officers can raid homes and monitor internet activity without warrant. The punishment for corruption is death. Government salaries are set extraordinarily high. The logic is straightforward: raise the reward for honesty and the penalty for dishonesty until rational calculus favors compliance.' },
      { date: 'Jan 27', text: 'The Ministry for Modernization (MM) is created, staffed by padas, Chinese economic consultants, and a Dutch developmentalist stranded in Lagos during the war who decided to stay. Its mandate is simple: make Nigeria an industrial power.' },
      { date: 'Mar 28', text: 'Khalil flies to Beijing and signs WAFTA with President Ding Xuexiang. China gets preferential resource access. Nigeria secures joint-ownership requirements and technology transfer agreements — two concessions that will prove critical.' },
      { date: 'May 1', text: 'The 36-state system is dissolved. Eight Administrative Zones replace it, each governed by a Khalil-appointed governor. The Yoruba are furious. As a compromise, five of the eight initial governors are Yoruba.' },
      { date: 'May', text: 'The Lagos Forum is founded — in theory a social club for Nigeria\'s elite, something between London\'s Athenaeum and a Masonic lodge. In practice, it quickly becomes the most powerful informal institution in the country. Membership is almost entirely pada.' },
      { date: 'Aug 17', text: 'Former Lagos governor Babajide Sanwo-Olu is tried by the BIC for corruption and wartime collaboration with the ASS. Many legal scholars argue the evidence was convincing but not quite convicting. Under the BIC\'s inverted burden of proof, it did not need to be. Sanwo-Olu fails to prove his innocence. He is executed.' },
    ],
  },
  {
    year: 2033,
    title: 'The education deal',
    events: [
      { date: 'Jan', text: 'WAFTA expands with an education bill. Top secondary graduates are sent to Tsinghua, Peking University, and Delft on the state\'s dime. In exchange, they owe five years of civil service.' },
      { text: 'Nigerian professors immediately protest. An open letter warns the policy will gut Nigerian universities and produce technocrats with no loyalty to their own country. They are ignored. Nigerian universities will limp along for the next twenty years, serving students who did not score high enough to leave.' },
      { date: 'Jun 15', text: 'China breaks ground on a high-speed rail from Lagos to Gausa. Almost no Nigerian workers are hired. Protests follow. Khalil negotiates a 60% Nigerian labor requirement. Enforcement remains difficult and stays a source of friction for years.' },
      { date: 'Oct 1', text: 'The NDF reconstitutes as a political party. Elections are held. The NDF wins a supermajority. Nigeria is, officially, a parliamentary democracy. In practice, a single-party state with democratic trappings. This will remain the case for the foreseeable future.' },
    ],
  },
  {
    year: 2034,
    title: 'The First Boom',
    events: [
      { text: 'Oil exports to Beijing reach an all-time high. BUA Group expands into pharmaceuticals, winning approval for Naijacor, a cardiac drug that reduces heart attack incidence by 8%.' },
      { date: 'Jun 1', text: 'Khalil launches the Nigerian Renaissance Initiative, funding artists and writers tasked with creating a distinctly Nigerian culture free of African American influences. Most grant recipients are American padas. The work produced is, by nearly universal consensus, sterile — though it pumps money into Lagos\'s creative economy.' },
      { date: 'Jul 18', text: 'Nigeria places fourth in the FIFA World Cup. This does more for national morale than anything the NRI produced.' },
      { text: 'The MM enlists Danjuma Corporation to build northern rail lines. In exchange, former Danjuma militia members receive amnesty.' },
    ],
  },
  {
    year: 2035,
    title: 'Sharia subordinated. Al-Shahid born.',
    events: [
      { date: 'Mar 3', text: 'Sharia court convictions can now be appealed to secular federal courts. This is not technically an abolition of Sharia, but it is a clear subordination of Islamic law to the federal system.' },
      { date: 'Apr 19', text: 'Conservative imam Johani al-Wakfild founds al-Shahid. It runs community schools, organizes protests, and provides healthcare in the poorest parts of the north. It is effective precisely because it fills the gap the state cannot or will not.' },
      { date: 'Jul', text: 'IDA Corporation is founded by a Yoruba family, manufacturing drones and light arms.' },
      { date: 'Oct 2', text: 'Construction begins on New Anka, a planned city on the Zamfara river. Padas move there in droves, drawn by modern infrastructure and the proximity to cobalt wealth.' },
    ],
  },
  {
    year: 2036,
    title: 'Girls in school, north in protest',
    events: [
      { date: 'Jan 15', text: 'Girls\' secondary school is mandated nationally. Northern LGAs refuse to comply. AZ governors withhold funds until they concede. Al-Shahid organizes protests. The girls are eventually enrolled.' },
      { date: 'Apr 1', text: 'Ethnic quotas for government positions and university admissions are abolished. In theory, merit alone will now determine access to power.' },
      { text: 'Padas and southerners, with better educational infrastructure and native English, dominate. By 2038, 82% of senior civil service positions are held by padas or southern ethnic groups. For the Hausa and Muslim population, the conclusion is obvious: Khalil\'s Nigeria is not their Nigeria.' },
      { text: 'Northern regions stage a tax protest over forced secularization.' },
    ],
  },
  {
    year: 2037,
    title: 'The $2,000 milestone',
    events: [
      { text: 'GDP per capita crosses $2,000 — still poor by Western standards, but a staggering increase from the depths of the early thirties.' },
      { date: 'May 8', text: 'The Ministry for Modernization completes a massive AI-assisted data center in Lagos for industrial planning.' },
      { text: 'IDA Corporation is contracted to produce a state drone swarm.' },
      { text: 'A syncretic Black Hebrew Israelite movement rises in Oyo, founded by an Igbo man calling himself Moses Two, claiming all Nigerians are the true Israelites.' },
      { date: 'Sep', text: 'The Pro-Trust Campaign launches. Fraud policed aggressively. Educational programs against ethnic bigotry broadcast nationally.' },
    ],
  },
  {
    year: 2038,
    title: 'The al-Shahid split',
    events: [
      { text: 'Khalil founds the All-Nigeria Sports Commission. Former UFC welterweight champion Kamaru Usman is a founding board member.' },
      { date: 'Aug 21', text: 'A news station surfaces an old khutbah in which Sheikh Diallo calls jihad "a means to protect Islam, when absolutely necessary." Al-Wakfild\'s institutionalist wing recoils. Veterans of past jihads rally around Diallo. The split within al-Shahid between institutionalists and militants will define the next two decades of Nigerian history.' },
    ],
  },
  {
    year: 2039,
    title: 'The AI makes a mistake',
    events: [
      { text: 'State media claims fraud has fallen 75% from the Pro-Trust Campaign. The figure is probably exaggerated, but not fabricated entirely.' },
      { text: 'Eko Atlantic is completed and marketed to aging Lagosian Western returnees.' },
      { text: 'The AI industrial planner redirects subsidies from cassava to soy. Crops fail. Food prices spike. Subsidies are reversed. Engineers tell the AI to "Make no mistakes."' },
      { date: 'Oct', text: 'The first cohort of WAFTA-educated Nigerians returns from China. They are bright, technically accomplished, and culturally alien. Some openly advocate for "a Nigerian path to socialism." The term Naijin emerges for ethnic Sino-Nigerians and those with deep ties to China.' },
    ],
  },
  {
    year: 2040,
    title: 'The pogroms. Parliament suspended.',
    events: [
      { date: 'Mar 9', text: 'A bomb detonates in Tafawa Balewa Square. 42 dead. Media personality Prudence Nzechukwu publicly accuses al-Shahid.' },
      { date: 'Mar 9–12', text: 'Anti-Muslim pogroms erupt across Lagos over the next three days. 13 killed.' },
      { date: 'Mar 14', text: 'Lagos Metropolitan Police open fire on rioters outside the Peaceful Health Hospital in Ijegun. The footage goes viral.' },
      { date: 'Mar 15', text: 'Sheikh Diallo makes the speech that changes everything. He calls on all Muslims to flee to Kano and declares jihad against the enemies of the Ummah.' },
      { date: 'Mar 18', text: 'Prudence Nzechukwu is found dead. Al-Shahid claims responsibility — its first explicit endorsement of terrorism. A Nigerian Army convoy on its way to arrest Diallo is ambushed in Kano. Within 72 hours, Nigeria\'s second-largest city is no longer under federal control.' },
      { date: 'Mar 22', text: 'Khalil suspends Parliament and declares himself President until the crisis is resolved. The word "temporarily" appears in his address. It will not appear again.' },
      { date: 'Apr', text: 'Pada activist Obi Bako leads a civil resistance movement demanding democratic freedoms. He is the first civilian to be surveilled by the BIC, an institution designed to police officials, not citizens. Bako goes underground. His movement will persist, intermittently, for the next decade.' },
    ],
  },
  {
    year: 2041,
    title: 'The insurgency entrenches',
    events: [
      { text: 'The Lagos Forum fractures. Some endorse the military turn. Others believe Nigeria is ready for real democracy and that Khalil\'s authoritarianism is the greater threat. A third faction argues the south should simply secede. None prevail. The Forum settles into an uneasy consensus that defers to Khalil while quietly advancing its own interests. This pattern will characterize its relationship with the regime for the next two decades.' },
      { date: 'Aug 7', text: 'A suicide truck bomb breaches the Ribadu Cantonment in Kaduna. Al-Shahid militants storm the base. The army shelves its planned operation to retake Kano. The insurgency is entrenched.' },
    ],
  },
  {
    year: 2042,
    title: 'Growth and Sinophobia',
    events: [
      { text: 'GDP per capita reaches $3,700. The country is beginning to look, in macroeconomic terms, like an early-stage developmental success story — even as a full-blown insurgency rages in the north.' },
      { date: 'Apr 28', text: 'BIC arrests Khalil\'s own right-hand man on corruption charges. He is executed. Whether Khalil genuinely did not know about the corruption, or whether he sacrificed a liability to shore up his legitimacy, remains a matter of scholarly debate.' },
      { date: 'Sep 1', text: 'English is mandated as the primary school language. Mandarin is relegated to secondary. Pidgin, which millions speak as their first language, is actively discouraged.' },
      { date: 'Nov 3', text: '47 Nigerian suicide drones strike the supposed hideout of Imam Diallo. The only casualty is a janitor. Whether the intelligence was faulty or whether Diallo was tipped off has never been established.' },
    ],
  },
  {
    year: 2043,
    title: 'The Almajiri crisis',
    events: [
      { text: 'Millions of Almajiri — itinerant Quranic students, mostly children, who roam from city to city begging for food — flood south. Al-Shahid recruits heavily from them, arming children with hand grenades and using them in attacks.' },
      { date: 'May', text: 'The Ministry for Modernization attempts to solve the problem by force, rounding up Almajiri and enrolling them in secular schools. The children face brutal bullying and resist enrollment. The program is abandoned within two years.' },
      { date: 'Oct 15', text: 'Construction finishes on the Lagos Decade Tower, the tallest building in West Africa — a monument to the southern boom.' },
      { text: 'Al-Shahid roadside bombs become a regular hazard on the A2 highway. Clearance parties are ambushed. A gleaming tower in the south, IEDs on the highway in the north. Two Nigerias are emerging and they have less and less to say to each other.' },
    ],
  },
  {
    year: 2044,
    title: 'Nigeria refines its own oil',
    events: [
      { text: 'The Bonny Island refinery comes online. Niger Delta communities receive a 5% stake at no cost, a shrewd concession that buys their acquiescence. Two smaller refineries follow.' },
      { date: 'Aug 1', text: 'Fuel subsidies begin phasing out. The southern refineries are already operational while the Maiduguri refinery — intended as a gesture of goodwill to the north — is still under construction. Fuel prices spike in the north. Whatever goodwill Khalil had purchased evaporates.' },
      { text: 'Southern fertility nears replacement levels. Northern fertility remains near 3.0. Islamic clerics openly speculate that demographics will accomplish what politics could not. Christian think tanks begin discussing pronatalist policies.' },
    ],
  },
  {
    year: 2045,
    title: 'Strikes and atrocities',
    events: [
      { date: 'Feb 3', text: 'A three-month nationwide strike nearly halts production. Workers demand a wage increase — the last had been in 2024. The MM eventually capitulates. Corporations immediately begin investing in automation.' },
      { date: 'Jun 14', text: 'A mob in what locals call Biafraland rapes and kills three Muslim girls. Imam Diallo declares a hundred days of retribution.' },
      { date: 'Aug 22', text: 'Al-Shahid militants seize Gombe State University and take hostages. After a three-day standoff, Nigerian forces storm the building with thermobaric munitions. Many hostages die in the resulting fire. The government denies the weapons used; an international probe forces the admission. Gombe becomes a rallying point for critics of the regime.' },
      { date: 'Oct 17', text: 'Al-Shahid attacks the motorcade of Biafran community leader Lewo Chukwuma in Port Harcourt. Chukwuma survives, permanently vegetative.' },
      { date: 'Nov 9', text: 'An FPV drone strikes the Shiroro hydroelectric plant, causing rolling blackouts across the Niger Delta. Al-Shahid has demonstrated it can strike anywhere in the country.' },
    ],
  },
  {
    year: 2046,
    title: 'Sharia goes underground',
    events: [
      { date: 'Feb 8', text: 'A woman in Sokoto is convicted by a Sharia court of immodesty and blasphemy. She had burned a Quran while her hair was uncovered. She is sentenced to death. The first capital sentence by a Sharia court in decades.' },
      { date: 'Jun 19', text: 'The Supreme Court overturns the conviction. The north erupts. Hundreds of thousands of Almajiri go on hunger strike. Northern authorities refuse to cooperate with federal police.' },
      { text: 'Sharia courts begin operating in secret, carrying out punishments extralegally to prevent appeals. Al-Shahid militants stand guard outside courtrooms during trials.' },
      { date: 'Nov 11', text: 'BIC agents arrive in Sokoto to investigate local officials. No one will speak to them — not officials, not merchants, not ordinary citizens. The wall of silence is total. The federal government has lost the north, not in a dramatic military defeat, but in a quiet, comprehensive withdrawal of consent.' },
    ],
  },
  {
    year: 2047,
    title: 'The Naijin consolidate',
    events: [
      { text: 'GDP per capita surpasses $7,000.' },
      { date: 'Mar 14', text: 'The Naijin Community Council (NCC) is founded in New Makoko — essentially a Lagos Forum for Sino-Nigerians, who now control large parts of the financial system and technology manufacturing.' },
      { date: 'Sep 2', text: 'Hua Sharif, the first Naijin billionaire, is granted Lagos Forum membership. Several pada members resign in protest. One letter that circulates widely reads: "The Lagos Forum is for Nigerians, for Retournees, for our nation. It is not for the children of foreigners."' },
      { text: '10% of Nigerians report being biologically enhanced.' },
    ],
  },
  {
    year: 2048,
    title: 'Immigration and housing crisis',
    events: [
      { text: 'Immigrants from the Alliance of Sahel States and the East African Federation flood into Nigeria, drawn by the booming economy but unable to afford its prices. ASS immigrants face violent discrimination.' },
      { text: 'Lagos is in a full housing crisis. Real estate is largely controlled by pada families on the Forum, and they have no incentive to build — scarcity maintains the value of their existing assets. Obi Bako accuses the Forum of engineering the crisis. He is not entirely wrong.' },
    ],
  },
  {
    year: 2049,
    title: 'Infrastructure, informal settlements',
    events: [
      { text: 'The Lagos Embankment Port Authority Building is completed.' },
      { text: 'Informal settlements reappear outside major cities, populated by immigrants and Nigerian minority groups priced out of formal housing.' },
    ],
  },
  {
    year: 2050,
    title: 'The Chinese exit',
    events: [
      { text: 'Chinese firms evacuate Nigeria at an accelerating rate as labor costs rise. Many formerly joint-owned corporations become entirely Nigerian-owned. This was, from a certain angle, exactly what Khalil had planned.' },
      { text: 'The minimum wage is raised again.' },
    ],
  },
  {
    year: 2051,
    title: 'The language wars',
    events: [
      { date: 'Jan 15', text: 'Khalil launches the Civilizing Task Force. It encourages Nigerians to speak proper English, not pidgin. News stations hire British pada anchors who speak in RP accents. Littering is aggressively punished. Public defecation is policed with a zeal that borders on obsession. The NCC lobbies to replace English with Mandarin as the language of culture and commerce. Khalil refuses.' },
      { text: 'Language has become the most politically charged issue in the country. In the south, English signals Atlanticism; Mandarin marks the speaker as a Sinophile technocrat. In the north, young people increasingly speak Arabic — not because they are Arabs, but because the language signals primary allegiance to the Ummah over Khalil\'s state. Every public utterance is a political position.' },
    ],
  },
  {
    year: 2052,
    title: 'Peace talks',
    events: [
      { text: 'GDP per capita crosses $13,000.' },
      { date: 'Aug 7', text: 'Al-Shahid enters formal peace talks with the Khalil administration for the first time. The talks are tentative and neither side trusts the other, but the fact that they are happening at all suggests exhaustion. No deal is reached. Al-Shahid operations have significantly died down. Experts speculate their support may have dried up.' },
      { text: 'Nigerian boxer Kamaru Oluwole wins the WBC super middleweight belt by 8th-round stoppage. He becomes a national symbol overnight.' },
    ],
  },
  {
    year: 2053,
    title: 'Women march',
    events: [
      { text: 'Women march across the south on International Women\'s Day, demanding an end to domestic violence, access to abortion, and workplace protections. The marches are organized, disciplined, and entirely ignored by the federal government.' },
      { text: 'Southern AZ governors, more responsive to their urban constituents, pass some workplace protections. One AZ funds abortion clinics, provoking outrage from both Christian and Muslim conservatives.' },
      { text: '24% of Nigerians report being biologically enhanced.' },
    ],
  },
  {
    year: 2054,
    title: 'Deindustrialization',
    events: [
      { text: 'Chinese firms sell off their Nigerian factories and shift outsourcing to Ghana, the East African Federation, and Indonesia. Nigerian labor costs have risen enough that the calculation no longer favors staying.' },
      { text: 'Unemployment spikes in the south.' },
      { date: 'Nov 1', text: 'The Ministry of Modernization pivots from export-led growth toward domestic production and consumption.' },
    ],
  },
  {
    year: 2055,
    title: 'AZ governors demand autonomy',
    events: [
      { text: 'Electronic component manufacturing rises sharply in southern industrial zones.' },
      { text: 'AZ governors lobby Khalil for fiscal autonomy. Southerners are tired of subsidizing the north. Northerners are tired of funding a state they despise.' },
    ],
  },
  {
    year: 2056,
    title: 'Khalil fades',
    events: [
      { text: 'Concerns about Khalil\'s health mount. He spends increasing time at the Military Academy personally training cadets and less time governing. He has named no successor.' },
      { text: 'The Lagos Forum, the NCC, the AZ governors, the remnants of al-Shahid, the military brass — everyone is quietly positioning for what comes next.' },
    ],
  },
  {
    year: 2057,
    title: 'The last year of the old order',
    events: [
      { text: 'GDP per capita crosses $26,000.' },
      { text: '42% of Nigerians report being biologically enhanced: steroids, peptides, or nootropics.' },
      { date: 'Oct 29', text: 'Khalil announces he is planning to retire, citing his health and a desire for a peaceful transition to democracy. Parliamentary elections will be held the following year.' },
    ],
  },
  {
    year: 2058,
    title: 'The game begins',
    events: [
      { text: 'Khalil steps down. He remains interim head of state and will oversee the first democratic election since the Fifth Republic\'s founding.' },
      { text: 'A parliamentary system is devised. 622 seats across 150 districts are at stake.' },
      { text: 'Every question Khalil deferred is now open. Constitution. Sharia. The BIC. Ethnic quotas. The Pada. The Naijin. The demographic gap. What the military will do.' },
    ],
  },
]

interface FlatEvent {
  year: number
  yearTitle: string
  date?: string
  text: string
  isFirstOfYear: boolean
  isKeyYear: boolean
}

function flattenTimeline(entries: TimelineEntry[]): FlatEvent[] {
  const flat: FlatEvent[] = []
  for (const entry of entries) {
    for (let i = 0; i < entry.events.length; i++) {
      flat.push({
        year: entry.year,
        yearTitle: entry.title,
        date: entry.events[i].date,
        text: entry.events[i].text,
        isFirstOfYear: i === 0,
        isKeyYear: KEY_YEARS.has(entry.year),
      })
    }
  }
  return flat
}

const FLAT = flattenTimeline(TIMELINE)

const DOT_SPACING = 30
const LINE_Y       = 52

export default function AboutPage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const snapRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isProgrammatic = useRef(false)
  const padXRef   = useRef(400) // will be set to containerWidth/2 on mount
  const [padX, setPadX] = useState(400)

  const [active, setActive] = useState(0)

  // Set padX to half the container width so every dot can be centered under the pointer
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      const half = Math.ceil(el.clientWidth / 2)
      padXRef.current = half
      setPadX(half)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const goTo = useCallback((idx: number) => {
    setActive(idx)
    const el = scrollRef.current
    if (!el) return
    isProgrammatic.current = true
    const dotX = padXRef.current + idx * DOT_SPACING
    el.scrollTo({ left: dotX - el.clientWidth / 2, behavior: 'smooth' })
    setTimeout(() => { isProgrammatic.current = false }, 500)
  }, [])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const centerX = el.scrollLeft + el.clientWidth / 2
    const idx = Math.max(0, Math.min(FLAT.length - 1, Math.round((centerX - padXRef.current) / DOT_SPACING)))
    setActive(idx)

    if (!isProgrammatic.current) {
      if (snapRef.current) clearTimeout(snapRef.current)
      snapRef.current = setTimeout(() => {
        const el2 = scrollRef.current
        if (!el2) return
        const cx = el2.scrollLeft + el2.clientWidth / 2
        const fi = Math.max(0, Math.min(FLAT.length - 1, Math.round((cx - padXRef.current) / DOT_SPACING)))
        el2.scrollTo({ left: padXRef.current + fi * DOT_SPACING - el2.clientWidth / 2, behavior: 'smooth' })
      }, 250)
    }
  }, [])

  const prev = () => { if (active > 0) goTo(active - 1) }
  const next = () => { if (active < FLAT.length - 1) goTo(active + 1) }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const evt = FLAT[active]

  return (
    <div className="space-y-0">
      {/* Header — archival footage banner */}
      <div className="poster-section">
        <div
          className="poster-bg"
          style={{ backgroundImage: "url('/images/archival.jpg')" }}
        />
        <div className="poster-overlay" style={{ background: 'rgba(10,15,20,0.78)' }} />
        <div className="poster-overlay" style={{ background: 'rgba(0,60,30,0.25)' }} />
        <div className="poster-content max-w-7xl mx-auto px-6 py-16">
          {/* Archival timestamp aesthetic */}
          <p className="font-mono text-nigeria-500/80 text-xs tracking-[6px] uppercase mb-4">
            ▶ ARCHIVE · FIFTH REPUBLIC · DECLASSIFIED
          </p>
          <h1 className="pixel-brand text-5xl md:text-7xl text-white leading-none mb-4">
            HOW WE<br />GOT HERE
          </h1>
          <div className="glow-line max-w-sm mb-4" />
          <p className="text-white/60 text-sm max-w-xl leading-relaxed">
            Nigeria in 2058 is the product of thirty years of invasion, reconstruction, industrialization,
            demographic collapse, and deferred reckoning. This is the history your party inherits.
          </p>
        </div>
      </div>

      <div className="py-10 space-y-10">
      {/* Event detail panel */}
      <FixedWidthContainer>
        <div className="border border-aero-500/25 rounded bg-bg-secondary/80 p-6 max-w-2xl mx-auto min-h-[9rem]" style={{ backdropFilter: 'blur(10px)' }}>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="pixel-brand text-xl" style={{ color: '#008751' }}>{evt.year}</span>
            <span className="text-text-muted text-xs font-medium uppercase tracking-wider">{evt.yearTitle}</span>
            {evt.date && (
              <span className="font-mono text-[10px] text-aero-400/60 uppercase ml-auto">{evt.date}</span>
            )}
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{evt.text}</p>
        </div>

        {/* Prev / counter / next */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <button
            onClick={prev}
            disabled={active === 0}
            className="text-aero-400 hover:text-aero-300 disabled:opacity-20 transition-colors text-lg leading-none"
            aria-label="Previous event"
          >
            ‹
          </button>
          <span className="font-mono text-xs text-text-muted tabular-nums">
            {active + 1} / {FLAT.length}
          </span>
          <button
            onClick={next}
            disabled={active === FLAT.length - 1}
            className="text-aero-400 hover:text-aero-300 disabled:opacity-20 transition-colors text-lg leading-none"
            aria-label="Next event"
          >
            ›
          </button>
        </div>
      </FixedWidthContainer>

      {/* Timeline track */}
      <div className="relative">
        {/* Edge fades */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg-primary to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg-primary to-transparent pointer-events-none z-10" />

        {/* Center pointer */}
        <div
          className="absolute z-20 pointer-events-none flex flex-col items-center"
          style={{ left: '50%', top: 0, transform: 'translateX(-50%)' }}
        >
          <div
            className="w-px bg-gradient-to-b from-transparent to-aero-500/50"
            style={{ height: `${LINE_Y - 4}px` }}
          />
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '3px solid transparent',
            borderRight: '3px solid transparent',
            borderTop: '4px solid rgba(42,139,154,0.6)',
          }} />
        </div>

        {/* Scrollable */}
        <div
          ref={scrollRef}
          className="overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
          onScroll={handleScroll}
        >
          {/* Track */}
          <div
            className="relative"
            style={{ width: `${padX * 2 + (FLAT.length - 1) * DOT_SPACING}px`, height: `${LINE_Y + 28}px` }}
          >
            {/* Horizontal line */}
            <div
              className="absolute h-px bg-aero-500/15 pointer-events-none"
              style={{ top: `${LINE_Y}px`, left: `${padX}px`, right: `${padX}px` }}
            />

            {FLAT.map((ev, i) => {
              const x = padX + i * DOT_SPACING
              const isActive = i === active
              const isLast = ev.year === 2058

              return (
                <div key={i}>
                  {ev.isFirstOfYear && (
                    <span
                      className="absolute font-mono text-[9px] tracking-widest select-none transition-colors"
                    style={{ color: ev.year === activeYear(active) ? '#008751' : 'rgba(42,139,154,0.35)' }}
                      style={{
                        top: '6px',
                        left: `${x}px`,
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ev.year}
                    </span>
                  )}

                  <button
                    onClick={() => goTo(i)}
                    aria-label={`${ev.year}${ev.date ? ' ' + ev.date : ''}: ${ev.text.slice(0, 60)}`}
                    className="absolute w-5 h-5 flex items-center justify-center focus:outline-none group"
                    style={{
                      top: `${LINE_Y}px`,
                      left: `${x}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div
                      className={`rounded-full transition-all duration-150 ${
                        isActive
                          ? isLast
                            ? 'w-3.5 h-3.5 border shadow-[0_0_10px_2px]'
                            : 'w-3 h-3 border shadow-[0_0_8px]'
                          : ev.isKeyYear
                          ? 'w-2 h-2 border group-hover:opacity-80'
                          : 'w-1.5 h-1.5 bg-bg-secondary border group-hover:opacity-60'
                      }`}
                    style={
                      isActive
                        ? isLast
                          ? { backgroundColor: '#00A862', borderColor: '#008751', boxShadow: '0 0 10px 2px rgba(0,135,81,0.5)' }
                          : { backgroundColor: '#008751', borderColor: '#00A862', boxShadow: '0 0 8px rgba(0,135,81,0.4)' }
                        : ev.isKeyYear
                        ? { backgroundColor: 'rgba(0,135,81,0.25)', borderColor: 'rgba(0,135,81,0.5)' }
                        : { borderColor: 'rgba(42,139,154,0.2)' }
                    }
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      </div> {/* end py-10 */}
    </div>
  )
}

function activeYear(idx: number): number {
  return FLAT[idx]?.year ?? 0
}
