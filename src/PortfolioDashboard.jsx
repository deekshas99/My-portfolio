import React, { useState, useEffect, useRef, useId } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  X,
  StickyNote,
  Plus,
  Minus,
  Trash2,
  Pencil,
  Type,
  Image as ImageIcon,
  Eraser,
  MousePointer2,
  ChevronLeft,
} from "lucide-react";
import StillworldHome from "./StillworldHome";
import { supportsWebGL2 } from "./lib/webgl";
import CaseStudy from "./CaseStudy";
import { caseStudyCover } from "./caseStudyChapters.mjs";

/* ----------------------------------------------------------------
   tokens
---------------------------------------------------------------- */

const t = {
  shell: "#000000",
  rail: "#000000",
  card: "#000000",
  cardUp: "#0C0F13",
  line: "rgba(255,255,255,0.07)",
  lineUp: "rgba(255,255,255,0.14)",
  fg: "rgba(255,255,255,0.93)",
  fg2: "rgba(255,255,255,0.62)",
  fg3: "rgba(255,255,255,0.34)",
  fg4: "rgba(255,255,255,0.18)",
  accent: "#E6D264",
  serif: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  sans: "'Inter', 'Helvetica Neue', Arial, sans-serif",
};

const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/* ----------------------------------------------------------------
   content
   One card per engagement. A project can be several disciplines at once:
   that's what `disciplines` is for, and it's what the filters match.
   Blank fields are intentional: fill them in and the card grows to fit.
---------------------------------------------------------------- */

const TODO = "";

const projects = [
  {
    id: "mayfair",
    client: "Mayfair Hotels & Resorts",
    title: "Mayfair",
    disciplines: ["branding"],
    year: 2026,
    role: "Brand & art direction",
    timeline: "14 weeks",
    deliverables: "Identity, art direction, print",
    accent: "#6D8A93",
    brief:
      "A hospitality group with several properties and no shared visual language between them.",
    approach:
      "One system built to flex by property rather than one mark stretched across all of them. Palette, paper and photographic direction carry the family resemblance.",
    outcome:
      "A brand that reads as a place rather than a property, holding across signage, print and booking.",
    chapters: [
      {
        name: "Chilika",
        text: "The lakeside property. The mark was drawn from the horizon line rather than from wildlife or leisure motifs, so it sits beside the water without competing with it.",
      },
    ],
  },
  {
    id: "ibasho",
    client: "Ibasho",
    title: "Ibasho",
    disciplines: ["branding", "spatial"],
    year: 2026,
    role: "Identity & spatial direction",
    timeline: "10 weeks",
    deliverables: "Identity, interior concept, menu",
    accent: "#B08968",
    brief:
      "A cafe built around the idea of a third place, somewhere that belongs to you without being yours.",
    approach:
      "Identity and room designed together rather than in sequence, so the type, the light and the seating plan carry the same idea of quiet occupancy.",
    outcome:
      "A space where the branding is mostly invisible, and the few places it appears feel earned.",
  },
  {
    id: "lamps",
    client: "LAMPS",
    title: "LAMPS",
    disciplines: ["branding"],
    year: null,
    role: TODO,
    timeline: TODO,
    deliverables: TODO,
    accent: "#A45D52",
    brief: TODO,
    approach: TODO,
    outcome: TODO,
  },
  {
    id: "crustys",
    client: "Crustys",
    title: "Crustys",
    disciplines: ["branding"],
    year: null,
    role: TODO,
    timeline: TODO,
    deliverables: TODO,
    accent: "#C08A4A",
    brief: TODO,
    approach: TODO,
    outcome: TODO,
  },
  {
    id: "border-wallets",
    client: "Border Wallets",
    title: "Border Wallets",
    disciplines: ["branding", "web", "tool"],
    year: 2024,
    role: "Product designer",
    timeline: "Jun to Sep 2024",
    deliverables: "Identity, site, product",
    accent: "#8F9A6B",
    brief:
      "A multi-platform Bitcoin tool that needed the brand, the site and the product to stop contradicting each other.",
    approach:
      "Ran UX audits across platforms first, then rebuilt outward, so product patterns settled before the site and the identity were drawn around them.",
    outcome:
      "Over a hundred screens shipped, donation tiers and badges added, and a 7% lift in donor engagement.",
    figures: [
      { label: "Screens shipped", value: "100+", note: "Screens shipped across the product." },
      { label: "Donor engagement", value: "+7%", note: "Lift in donor engagement after the redesign." },
    ],
  },
  {
    id: "tookitaki",
    client: "Tookitaki",
    title: "Tookitaki",
    disciplines: ["web"],
    year: 2024,
    role: "Design lead",
    timeline: "2 months",
    deliverables: "Marketing site, dashboard",
    accent: "#6D7C99",
    brief:
      "Financial compliance software in Singapore, with a marketing site and a user dashboard that needed to read as one product.",
    approach:
      "Structured the story for a technical buyer, then carried the same information hierarchy into the dashboard so the promise and the product matched.",
    outcome: "A site and dashboard designed to convert and then retain, built with internal management.",
  },
  {
    id: "nexion",
    client: "Nexion",
    title: "Nexion",
    disciplines: ["web", "tool"],
    year: 2026,
    role: "Design & front-end",
    timeline: "Ongoing",
    deliverables: "Landing page, UI kit, components",
    accent: "#7A6A8C",
    brief:
      "A landing page converting poorly, with a component library that had drifted out of sync with the design files.",
    approach:
      "Audited the page against what the product actually does, rebuilt the hierarchy around a single claim, then rebuilt the component set so design and code share one source of truth.",
    outcome:
      "A page that explains the product in one screen, and a component suite the team can extend without a designer in the room.",
  },
  {
    id: "thoughtculture",
    client: "Thoughtculture",
    title: "Thoughtculture",
    disciplines: ["web"],
    year: null,
    role: TODO,
    timeline: TODO,
    deliverables: TODO,
    accent: "#5F8A86",
    brief: TODO,
    approach: TODO,
    outcome: TODO,
  },
  {
    id: "vyomaan",
    client: "Vyomaan",
    title: "Vyomaan",
    disciplines: ["web"],
    year: null,
    role: TODO,
    timeline: TODO,
    deliverables: TODO,
    accent: "#9A7BA8",
    brief: TODO,
    approach: TODO,
    outcome: TODO,
  },
  {
    id: "bitcoin-research-day",
    client: "Chaincode Labs",
    title: "Bitcoin Research Day",
    disciplines: ["web"],
    year: 2024,
    role: "Designer",
    timeline: "1 month",
    deliverables: "Marketing site",
    accent: "#C08A4A",
    brief:
      "A research institute event with a site that had to handle sign-up, a calendar and FAQs without reading as a conference funnel.",
    approach:
      "Redesigned the whole marketing site around the schedule as the primary object, since that's what attendees actually come for.",
    outcome: "Sign-up, event calendar and FAQs rebuilt for an audience that arrives already interested.",
  },
  {
    id: "aurora",
    wordmark: "aurora",
    hideOverviewClient: true,
    relatedCaseStudyIds: ["podcaster", "border-wallets", "mayfair"],
    client: "Bitshala",
    title: "Aurora",
    disciplines: ["tool"],
    year: 2025,
    role: "Product designer",
    timeline: "Jan–Sep 2025",
    deliverables: "Product design, strategy, prototyping",
    team: "2-person team",
    figures: [
      {
        label: "Challenge",
        value: "10+ mins.",
        note: "Average Bitcoin block confirmation time (up to ~60 mins. for full settlement).",
      },
      {
        label: "Opportunity",
        value: "50M+",
        note: "Professional and semi-professional creators worldwide (out of 200M+ total creators).",
      },
      {
        label: "Impact",
        value: "40%",
        note: "Reduction in manual payout complexity (alongside 85%+ task completion and a 30% lift in user confidence).",
      },
    ],
    subject: "Bitcoin payment distribution app",
    accent: "#E0A44A",
    hero: "/aurora-cover.jpg",
    widget: "/aurora-widget.jpg",
    tagline: "Making one-to-many Bitcoin payment easy",
    brief: "",
    story: [
      {
        type: "label",
        text: "Context",
        heading:
          "What if payments weren’t just sent but fairly distributed, instantly, and without friction?",
      },
      {
        type: "p",
        text: "For the last six months, I’ve been working on Aurora, a Bitcoin-based payment distribution app that aims to make multi-party payouts effortless and transparent.",
      },
      {
        type: "p",
        text: "Bitshala builds open-source Bitcoin tooling. The creator economy runs on splits: a podcast has a host, a guest and an editor; a hackathon has a team. Bitcoin has no native concept of \"divide this payment\". Every existing tool solved the transfer and left the division to spreadsheets.",
      },
      { type: "image", src: "/aurora/4nPPC1yQYITjhmhM2NfGtQEuv8.png", ratio: "56%" },

      { type: "label", text: "The problem" },
      {
        type: "p",
        text: "We audited how creator teams were actually handling it: one person receives, screenshots the total, and pays everyone else manually, often weeks later. Three failures compound. The recipient carries the tax and trust burden alone, collaborators have no visibility into what came in, and sponsors who want to pay once end up chasing five people.",
      },
      {
        type: "p",
        text: "The design question wasn't how to send Bitcoin faster. It was how to make a single incoming payment fan out to everyone behind the work, instantly and visibly.",
      },
      { type: "image", src: "/aurora/5VG9n553XudQe7TiYiNtX6OlBSE.png", ratio: "56%" },

      { type: "label", text: "Constraints that shaped every decision" },
      {
        type: "p",
        text: "Bitcoin confirmations aren't instant, but tipping is emotional and moment-driven. A spinner kills the impulse. Transparent receipts build trust between collaborators but risk publishing people's income. And the category had no UX precedent: existing distribution tools were command-line, so there was nothing to benchmark against.",
      },

      { type: "label", text: "Research" },
      {
        type: "p",
        text: "With no users yet, I ran indirect research: a competitive matrix across Patreon, Ko-fi, Buy Me a Coffee and YouTube SuperChat, plus creator-economy reports and Reddit threads. Patreon owns recurring support, Ko-fi owns spontaneity, and none of them offer split visibility.",
      },
      {
        type: "p",
        text: "Four motivations kept recurring: validation, setup-once simplicity, transparency, and spontaneity. Those became the criteria every screen was judged against.",
      },
      { type: "image", src: "/aurora/eYsMvjdDBNbWc2IgULnxG5BBUE.png", ratio: "56%" },

      { type: "label", text: "Decisions" },
      { type: "sub", text: "Splits are defined once and reused" },
      {
        type: "p",
        text: "A 70/30 is a saved object, not a per-payment task. This is what removes the dropout at setup.",
      },
      { type: "image", src: "/aurora/GVyx0Wwl3bcLlN4CEbgPNZSwD78.png", ratio: "56%" },
      { type: "image", src: "/aurora/GHkOs9L5wZdCqfqcgEb0K5AaWY.png", ratio: "56%" },
      { type: "sub", text: "Soft confirmations" },
      {
        type: "p",
        text: "The interface acknowledges the tip immediately and resolves the network state behind it. This required careful copy and iconography to stay honest without killing momentum.",
      },
      { type: "image", src: "/aurora/1c6U7yEnZhb6mUOYyVpu7nRWu4.png", ratio: "56%" },
      { type: "sub", text: "Layered transparency" },
      {
        type: "p",
        text: "Receipts are public to the payer, amounts private between collaborators. Trust without exposure.",
      },
      { type: "image", src: "/aurora/Ua89AmOAoTBT2MTK8seJbNBENvc.png", ratio: "56%" },
      { type: "sub", text: "Human language" },
      {
        type: "p",
        text: "Tip, Share, Split, Confirm. No wallet jargon anywhere in the flow.",
      },
      { type: "image", src: "/aurora/NqdBTpPzDPwDvefGVhgIkyvBVQM.png", ratio: "56%" },

      { type: "label", text: "Validation" },
      {
        type: "p",
        text: "Rather than user-testing screens, we built Podcaster at a hackathon: a working podcast app where each episode's tips distributed automatically between host, guest and editor. The concept held up in a real workflow, and it reframed Aurora. Not a wallet, but the invisible layer under creator platforms.",
      },
      { type: "image", src: "/aurora/ZY1VYKltzWzpkxyuyRAGrV4s.png", ratio: "56%" },

      { type: "label", text: "Outcomes" },
      {
        type: "list",
        items: [
          "Manual payout complexity down roughly 40%.",
          "Task completion in usability testing above 85%.",
          "20+ interactive prototypes, driving a 30% lift in measured user confidence.",
          "Automated split payouts demonstrated to a panel of 25+ reviewers.",
          "The approach won the Bitcoin Design Hackathon 2025.",
        ],
      },

      { type: "label", text: "What I'd do differently" },
      {
        type: "p",
        text: "The indirect research was the right call at that stage, but it capped what we could learn. We optimised for motivations we inferred rather than observed. With the Podcaster prototype live, the next version should be shaped by watching real creators split real money.",
      },
    ],
  },
  {
    id: "podcaster",
    client: "Split Prism",
    title: "Podcaster",
    disciplines: ["tool"],
    year: 2025,
    role: "UX designer",
    timeline: "May 2025",
    deliverables: "Product design, strategy",
    team: "2 members",
    subject: "Bitcoin-native podcast app",
    accent: "#6D8A93",
    hero: "/podcaster-cover.webp",
    tagline: "A Bitcoin-native podcast app built on our Split Prism engine.",
    brief:
      "From the outside it looks like a polished listening and creator dashboard. Under the hood, every show is wired to a programmable revenue split that pays collaborators instantly in BTC.",
    story: [
      { type: "label", text: "Introduction" },
      { type: "p", text: "The screens map the full journey:" },
      {
        type: "list",
        items: [
          "Onboarding and wallet connect",
          "Setting up a show and its split",
          "Sponsor and listener payment flows",
          "The listener-facing front screens",
        ],
      },
      { type: "image", src: "/aurora/ZY1VYKltzWzpkxyuyRAGrV4s.png", ratio: "56%" },

      { type: "label", text: "Problem statement" },
      {
        type: "h",
        text: "Podcasts are multi-player, but money usually lands in a single account.",
      },
      { type: "p", text: "From interviews and existing tooling we saw four repeating issues:" },
      {
        type: "list",
        ordered: true,
        items: [
          "Manual accounting. Hosts track sponsorship income in sheets, then push UPI or bank transfers once a month.",
          "Delayed or missed payouts. Editors and producers often wait weeks, and have to remind the host.",
          "Low transparency. Nobody except the host sees how much came in or how it was split.",
          "Friction for sponsors. They want to pay one invoice, not chase five people.",
        ],
      },
      {
        type: "quote",
        text: "How do we let a sponsor or listener pay once, and still have that money fan out instantly and trustlessly to everyone behind the show?",
      },
      { type: "image", src: "/case-studies/podcaster/8kxkIxIA8EXa3LRPVXHJoMzd1s.png", ratio: "56%" },

      { type: "label", text: "User research" },
      {
        type: "h",
        text: "Turning familiar flows into a place where getting paid in Bitcoin feels as simple as pressing play.",
      },
      {
        type: "p",
        text: "Before drawing a single screen, we lived inside podcast apps. We talked to indie hosts, editors and small studio heads about how they publish and get paid. Everyone kept saying the same thing: I just want it to feel like Spotify, but where money actually flows to my team.",
      },
      {
        type: "p",
        text: "So we opened Spotify, Wynk and Apple Music and started tracing their flows: how home feeds are laid out, how a show page looks, where the play button sits, how the mini-player behaves. Those patterns became our backbone.",
      },
      {
        type: "p",
        text: "On top of that familiar skeleton we layered our twist: the Support and Sponsor buttons, the split previews for creators, and the wallet and payout screens.",
      },
      {
        type: "p",
        text: "The result is an app that looks and behaves like a music app users already know, only now every play and payment can split fairly across the people who made the show.",
      },
      { type: "image", src: "/case-studies/podcaster/HofYMUvF3YLR75FyVc5HS4YGoNU.png", ratio: "56%" },

      { type: "label", text: "Product approach" },
      {
        type: "h",
        text: "We treated Split Prism as a protocol and Podcaster as its first vertical interface.",
      },
      { type: "sub", text: "Split Prism" },
      {
        type: "list",
        items: [
          "A Prism is one split rule set.",
          "Each facet is one member: role, BTC address, share percentage.",
          "When money hits a Prism it creates a multi-output Bitcoin transaction and sends everyone their share directly.",
        ],
      },
      { type: "sub", text: "How that shows up in the UI" },
      {
        type: "list",
        items: [
          "The Get paid and Choose a wallet screens bind the creator's primary payout wallet.",
          "The seed-phrase screens are a guided, non-technical backup flow to reduce crypto anxiety.",
          "The Boom, Done confirmation closes onboarding with a show cover and a summary of what's connected.",
        ],
      },
      { type: "sub", text: "Three pillars of functionality" },
      {
        type: "list",
        items: [
          "Create split rules, via Launch a podcast and Split Preview.",
          "Public split page, accept payment, multi-send, via pay sheets and sponsor flows.",
          "Activity logs and payment history, via Awaiting payments, Completed payments and transfer detail.",
        ],
      },
      { type: "image", src: "/case-studies/podcaster/RvIbtPefkNziedNIQ7qewbehDA.png", ratio: "56%" },

      { type: "label", text: "Major UX flows" },
      { type: "sub", text: "Creating your own podcast" },
      {
        type: "p",
        text: "Tap Launch a podcast, add name and cover, connect a wallet, and set splits between host, co-host and editor on the golden split wheel. In a few screens a new show is live and ready to receive auto-split Bitcoin payouts.",
      },
      { type: "image", src: "/case-studies/podcaster/lhCcRvQukGfCAHEIvAlro3BvCM.png", ratio: "56%" },
      { type: "sub", text: "Subscribing to a podcast" },
      {
        type: "p",
        text: "From the home feed a listener opens a show, hits Follow and Play. When they tap Support this show they pick a monthly amount, confirm, and see a light success state. Subscription active, no crypto friction.",
      },
      { type: "image", src: "/case-studies/podcaster/P9ZDvNNzsZhaX4aSTgE1KZtgZA.png", ratio: "56%" },
      { type: "sub", text: "Managing or cancelling" },
      {
        type: "p",
        text: "Under Subscriptions listeners see all the shows they support. Opening one lets them change the amount or cancel. A single confirmation explains what happens next, then updates the plan with a clear done state.",
      },
      { type: "image", src: "/case-studies/podcaster/EqQjlQ9gaMnY8Y0TW1A146ION4.png", ratio: "56%" },

      { type: "label", text: "Design parameters" },
      {
        type: "h",
        text: "It feels like a normal listening app. Play, follow and discover are always the heroes.",
      },
      { type: "sub", text: "Familiar patterns" },
      {
        type: "p",
        text: "Bottom nav of Home, Search, Library and Wallet, plus mini-player, queues and episode lists like Spotify or Apple.",
      },
      { type: "sub", text: "Studio look and feel" },
      { type: "p", text: "Dark background, warm accents, big cover art, clean typography." },
      { type: "image", src: "/case-studies/podcaster/JWHfJbXT5cd4KVPs56lE6SDSFQ.png", ratio: "56%" },
      { type: "sub", text: "Soft money layer" },
      {
        type: "p",
        text: "Support and Subscribe sit near the player, use simple language, and never overshadow listening.",
      },
      { type: "image", src: "/case-studies/podcaster/bwmnnosfeQiUIors96Jwi6YBonw.png", ratio: "56%" },
      { type: "sub", text: "Clear finance screens" },
      {
        type: "p",
        text: "Wallet, subscriptions and history use simple tables, clear labels and human-readable copy, so users can see what they paid and earned without crypto knowledge.",
      },
      { type: "image", src: "/case-studies/podcaster/ruh1LJOJ5eCCVJncwcQsXVIaOc.png", ratio: "56%" },

      { type: "label", text: "Product constraints" },
      { type: "h", text: "As a podcast app, Podcaster has to respect a few hard realities." },
      {
        type: "list",
        items: [
          "Mobile-first listening. Screens and controls are optimised for one-handed use on small phones, with offline and background play as must-haves.",
          "Content-first performance. Fast load for artwork, show lists and streams even on weak networks; heavy screens that stall audio aren't an option.",
          "Familiar patterns. We stay close to common podcast UX so users don't have to relearn how to listen.",
          "Regional and rights constraints. Shows can be region-locked or licensed differently, so the UI needs clear states for not available here without breaking the flow.",
        ],
      },
      {
        type: "p",
        text: "The split engine runs underneath all of this, but the app itself must always behave like a reliable, everyday podcast player.",
      },

      { type: "label", text: "Conclusion" },
      {
        type: "p",
        text: "Podcaster starts as a podcast app you already know how to use: press play, follow shows, build a library, discover new episodes on the home feed. The listening experience is familiar, fast, and comfortable enough to be someone's default podcast home.",
      },
      {
        type: "p",
        text: "The difference is invisible at first glance. Every show is wired to handle money fairly in the background. By treating the split system as infrastructure and the listening journey as the hero, Podcaster proves you don't need a crypto app to bring Bitcoin into people's lives.",
      },
      {
        type: "quote",
        text: "You just need a better podcast app that quietly makes sure everyone who worked on a show gets paid.",
      },
    ],
  },
  {
    id: "saveana",
    client: "Saveana",
    title: "Saveana",
    disciplines: ["game"],
    year: null,
    role: TODO,
    timeline: TODO,
    deliverables: TODO,
    accent: "#C96FA0",
    brief: TODO,
    approach: TODO,
    outcome: TODO,
  },
  {
    id: "the-town",
    client: "The Town",
    title: "The Town",
    disciplines: ["game"],
    year: null,
    role: TODO,
    timeline: TODO,
    deliverables: TODO,
    accent: "#4F7FA8",
    brief: TODO,
    approach: TODO,
    outcome: TODO,
  },
  {
    id: "vantera",
    client: "Black Lotus",
    title: "Vantera",
    disciplines: ["game", "spatial"],
    year: 2026,
    role: "Concept & world design",
    timeline: "In development",
    deliverables: "World design, mechanics, build",
    accent: "#7FB08A",
    brief:
      "A live game that runs inside a conference venue and turns the floor into a playable world.",
    approach:
      "The world is designed first and the mechanics follow from it, so it reads as a place people are visiting rather than an activation they're participating in.",
    outcome: "In development. Chapter One is scoped for a single venue and a single narrative arc.",
  },
];

const disciplineLabels = {
  branding: "Branding",
  web: "Website",
  tool: "Tool",
  game: "Game",
  spatial: "Spatial",
};

/* writing: a list, not cards. Add pieces as they publish. */
const writing = [
  {
    title: "The Raven",
    date: "2026",
    where: "Substack",
    form: "Short fiction",
    url: "https://deekshasatapathy.substack.com/p/the-raven",
    blurb: "Debut short story, published on Medium and Substack.",
    body: [
      "It was a bright day — a day bathed in golden sunlight — when the fisherman set off for his customary walk along the shore. Yet beneath the comforting warmth of the sun and the gentle caress of a cool breeze, something was off. With every step closer, a feeling of unease grew inside him. High above, hundreds of ravens wheeled in a restless pursuit, as if guarding. As he reached the water’s edge, his initial unrest melted into a deep, human sympathy.",
    ],
    images: [
      "https://substack-post-media.s3.amazonaws.com/public/images/52197eb6-9740-44f7-bc3f-ac7888b0ad01_800x600.png",
    ],
  },
  {
    title: "A second card, for the list",
    date: "2026",
    where: "Demo",
    form: "Sample",
    url: "",
    blurb: "A placeholder so the articles page can show more than one card.",
    body: [
      "This is a demo article. It is here so the list can be seen with two pieces. Replace it when the next story is ready.",
    ],
    images: ["/demo-article.svg"],
  },
  {
    title: "A third card, for the list",
    date: "2026",
    where: "Demo",
    form: "Sample",
    url: "",
    blurb: "A placeholder so the articles page can show three pieces beside the lead.",
    body: [
      "This is a demo article. It is here so the list can show one lead and three beside it. Replace it when the next story is ready.",
    ],
    images: ["/demo-article-2.svg"],
  },
  {
    title: "A fourth card, for the list",
    date: "2026",
    where: "Demo",
    form: "Sample",
    url: "",
    blurb: "A placeholder so the third piece in the side column is visible.",
    body: [
      "This is a demo article. Replace it when the next story is ready.",
    ],
    images: ["/demo-article-3.svg"],
  },
];

/* advisory, talks and recognition: credits, allowed to be short */
const credits = [
  {
    year: "2025",
    title: "Bitcoin Design Hackathon, winner",
    note: "Built the Prism Project. 5,000 USD.",
  },
  {
    year: "2025",
    title: "Saving Satoshi, mentor",
    note: "Advised the project through Summer of Bitcoin.",
  },
  {
    year: "2025",
    title: "BitPlebs Conference, Goa, speaker",
    note: "Represented Bitshala.",
  },
  {
    year: "2024",
    title: "Summer of Bitcoin",
    note: "Sole Indian designer selected from 2,000+ applicants.",
  },
  {
    year: "2021",
    title: "IIT Bombay Eureka incubator",
    note: "Startup exited via ₹20L investor acquisition.",
  },
];

const clusterSpots = [
  { x: 92, y: 16 },
  { x: 176, y: 22 },
  { x: 38, y: 102 },
  { x: 130, y: 108 },
  { x: 28, y: 210 },
  { x: 140, y: 210 },
];

const sorts = [
  { id: "recent", label: "Recent" },
  { id: "az", label: "A–Z" },
  { id: "field", label: "By field" },
];

const nav = [
  {
    group: "Work",
    rows: [3, 1],
    items: [
      { label: "Tools", glyph: "tools", filter: "tool" },
      { label: "Websites", glyph: "web", filter: "web" },
      { label: "Branding", glyph: "branding", filter: "branding" },
      { label: "Games", glyph: "games", filter: "game" },
    ],
  },
  {
    group: "Studio",
    rows: [2],
    items: [
      { label: "About me", glyph: "about", view: "about" },
      { label: "Articles", glyph: "articles", view: "writing" },
    ],
  },
];

/* ----------------------------------------------------------------
   pieces
---------------------------------------------------------------- */

function MediaBlock({ accent, ratio = "75%", radius = 14 }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: ratio,
        borderRadius: radius,
        overflow: "hidden",
        background: `linear-gradient(152deg, ${accent} -10%, ${accent}33 46%, #0A0B0E 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: grain,
          opacity: 0.16,
          mixBlendMode: "overlay",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          borderRadius: radius,
        }}
      />
    </div>
  );
}

function Chip({ children }) {
  return (
    <span
      style={{
        fontFamily: t.sans,
        fontSize: 11,
        letterSpacing: 0.1,
        color: t.fg2,
        background: "rgba(255,255,255,0.055)",
        borderRadius: 999,
        padding: "3.5px 10px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function MetaRow({ icon: Icon, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: t.sans,
        fontSize: 12.5,
        color: t.fg3,
      }}
    >
      <Icon size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
    </div>
  );
}

function Card({ project, onOpen }) {
  return (
    <button
      className="bl-card"
      onClick={() => onOpen(project)}
    >
      <span
        className="bl-card-media"
        style={{
          background: `linear-gradient(152deg, ${project.accent} -10%, ${project.accent}33 46%, #0A0B0E 100%)`,
        }}
      >
        {project.widget && <img className="bl-card-photo" src={project.widget} alt="" />}
        <span className="bl-card-grain" />
      </span>
      <span className="bl-card-scrim" />

      <span className="bl-card-go">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <polygon points="12,6 18.6,18 5.4,18" />
        </svg>
      </span>

      <span className="bl-card-foot">
        <span className="bl-card-name">{project.title}</span>
        <span className="bl-card-client">{project.client}</span>
        <span className="bl-card-row">
          <span className="bl-card-chips">
            {project.disciplines.map((d) => (
              <span key={d}>{disciplineLabels[d]}</span>
            ))}
          </span>
        </span>
      </span>
    </button>
  );
}

function ContactHeart() {
  const ref = useRef(null);
  const [webglAvailable, setWebglAvailable] = useState(supportsWebGL2);
  const gradientId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el || !webglAvailable) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setWebglAvailable(false);
      return;
    }
    const onContextLost = () => setWebglAvailable(false);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(el.clientWidth || 28, el.clientHeight || 28, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
    camera.position.set(0, 0, 6.4);

    const shape = new THREE.Shape();
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const x = Math.sin(t) ** 3;
      const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.72,
      bevelEnabled: true,
      bevelThickness: 0.18,
      bevelSize: 0.16,
      bevelOffset: 0,
      bevelSegments: 8,
      curveSegments: 12,
    });
    geo.computeBoundingBox();
    const box = geo.boundingBox;
    const cx = (box.min.x + box.max.x) / 2;
    const cy = (box.min.y + box.max.y) / 2;
    const reach = Math.max(box.max.x - box.min.x, box.max.y - box.min.y) * 0.55;
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const dx = (x - cx) / reach;
      const dy = (y - cy) / reach;
      const radial = Math.min(1, Math.hypot(dx, dy));
      const dome = Math.sqrt(Math.max(0, 1 - radial * radial));
      pos.setXYZ(i, x + dx * 0.05, y + dy * 0.05, z + Math.sign(z || 1) * dome * 0.34);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    geo.center();
    geo.computeBoundingBox();
    const fit = new THREE.Vector3();
    geo.boundingBox.getSize(fit);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    const mat = new THREE.MeshPhysicalMaterial({
      color: "#fbfcfd",
      metalness: 1,
      roughness: 0.03,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.setScalar(2.0735 / Math.max(fit.x, fit.y));
    scene.add(mesh);
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2.4, 3.6, 4.5);
    scene.add(key);

    if (reduce) mesh.rotation.y = 0.6;
    const root = el.closest("[data-open]");
    let frame = 0;
    let dead = false;
    let previousTime = performance.now(), lastDraw = -Infinity;
    renderer.render(scene, camera);
    const tick = (now) => {
      if (dead) return;
      const elapsed = Math.min(50, now - previousTime);
      previousTime = now;
      const open = !root || root.getAttribute("data-open") === "true";
      const turning = root?.getAttribute("data-motion") === "moving";
      if (open && !turning && !document.hidden) {
        mesh.rotation.y += elapsed * 0.00096;
        if (now - lastDraw >= 1000 / 30) {
          renderer.render(scene, camera);
          lastDraw = now;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    if (!reduce) frame = requestAnimationFrame(tick);

    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      geo.dispose();
      mat.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [webglAvailable]);

  return <span className="bl-heart3d" ref={ref} aria-hidden="true">
    {!webglAvailable && <svg viewBox="0 0 24 24" width="100%" height="100%" focusable="false">
      <defs><linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#fff"/><stop offset=".45" stopColor="#aebbc6"/>
        <stop offset=".7" stopColor="#566572"/><stop offset="1" stopColor="#e5edf3"/>
      </linearGradient></defs>
      <path fill={`url(#${gradientId})`} d="M12 21 3.5 12.6C-2 7.1 5.5-.6 12 6c6.5-6.6 14 1.1 8.5 6.6Z"/>
    </svg>}
  </span>;
}

function CaseStudyActions({ backRef, onBack, onContact }) {
  return (
    <>
      <button ref={backRef} type="button" className="bl-case-metal bl-case-back" onClick={onBack} aria-label="Go back">
        <ArrowLeft size={18} strokeWidth={1.7} />
      </button>
      <button type="button" className="bl-range-btn bl-case-contact" onClick={onContact}>
        <span className="bl-case-contact-face" aria-hidden="true">
          <span className="bl-widget-sheen" />
        </span>
        <span className="bl-range-disc"><ContactHeart /></span>
        <span className="bl-range-label">Contact</span>
      </button>
    </>
  );
}

function relatedCaseStudies(project) {
  const candidates = projects.filter((candidate) =>
    candidate.id !== project.id && (candidate.brief || candidate.story?.length)
  );
  const relevance = (candidate) => candidate.disciplines.filter((discipline) => project.disciplines.includes(discipline)).length;
  const chosen = project.relatedCaseStudyIds
    ? project.relatedCaseStudyIds.map((id) => candidates.find((candidate) => candidate.id === id)).filter(Boolean)
    : candidates.sort((a, b) => relevance(b) - relevance(a)).slice(0, 3);

  return chosen.map((candidate) => ({ project: candidate, image: caseStudyCover(candidate) }));
}

/* ----------------------------------------------------------------
   notebook: an empty board. Everything on it is made in the UI.
---------------------------------------------------------------- */

const boardCard = {
  label: "Ideation board",
  count: "03",
  unit: "projects",
  action: "Explore thought process",
};

const noteColors = ["#F3E1A9", "#DCE7D5", "#E8D5D0", "#D8E0EC", "#EADFF0", "#E6E4DF"];

const masthead = {
  left: "Black Lotus",
  right: "Notebook v1",
  word: "ideation",
  sub: "messy to organised",
  w: 940,
};

const NOTES_KEY = "notebook:items:v2";
let memoryNotes = [];

async function loadNotes() {
  try {
    if (typeof window !== "undefined" && window.storage) {
      const r = await window.storage.get(NOTES_KEY, true);
      if (r && r.value) return JSON.parse(r.value);
    }
  } catch (e) {
    /* nothing saved yet */
  }
  return memoryNotes;
}

async function saveNotes(items) {
  memoryNotes = items;
  try {
    if (typeof window !== "undefined" && window.storage) {
      await window.storage.set(NOTES_KEY, JSON.stringify(items), true);
    }
  } catch (e) {
    /* keep the session copy */
  }
}

/* ----------------------------------------------------------------
   board
---------------------------------------------------------------- */

const inkColors = ["#16181C", "#A45D52", "#6D7C99", "#8F9A6B", "#B08968"];

/* shrink an upload so a board full of images still fits in storage */
function shrinkImage(file, max = 900) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new window.Image();
    reader.onload = () => {
      img.src = reader.result;
    };
    reader.onerror = reject;
    img.onerror = reject;
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve({
        url: c.toDataURL("image/jpeg", 0.72),
        ratio: c.height / c.width,
      });
    };
    reader.readAsDataURL(file);
  });
}

function strokeBox(points, pad) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return {
    minX,
    minY,
    w: Math.max(...xs) - minX + pad * 2,
    h: Math.max(...ys) - minY + pad * 2,
    pad,
  };
}

function Board({ open, onClose, notes, setNotes, mine, setMine }) {
  const [view, setView] = useState({ x: 120, y: 64, s: 1 });
  const [drag, setDrag] = useState(null);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [leaveColor, setLeaveColor] = useState(noteColors[0]);
  const [flyout, setFlyout] = useState(null);
  const [mode, setMode] = useState("select");
  const [ink, setInk] = useState(inkColors[0]);
  const [live, setLive] = useState(null);
  const [warn, setWarn] = useState("");
  const [size, setSize] = useState({ w: 1200, h: 800 });
  const surface = useRef(null);
  const fileIn = useRef(null);
  const replaceFor = useRef(null);

  useEffect(() => {
    if (!open || !surface.current) return;
    const el = surface.current;
    const measure = () => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
      setView((v) =>
        v.placed
          ? v
          : {
              ...v,
              x: Math.max(40, (el.clientWidth - masthead.w) / 2),
              y: 64,
              placed: true,
            }
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  /* the board is fenced: you can't pan off into empty space above or left of
     the masthead, and the far edges grow with whatever has been added */
  const bounds = {
    top: -70,
    left: -110,
    right: notes.reduce((m, n) => Math.max(m, n.x + 520), masthead.w + 340),
    bottom: notes.reduce((m, n) => Math.max(m, n.y + 460), 1500),
  };

  const clampView = (v) => {
    const maxX = -bounds.left * v.s;
    const minX = size.w - bounds.right * v.s;
    const maxY = -bounds.top * v.s;
    const minY = size.h - bounds.bottom * v.s;
    return {
      ...v,
      x: Math.min(maxX, Math.max(minX, v.x)),
      y: Math.min(maxY, Math.max(minY, v.y)),
    };
  };

  const zoom = (delta, cx, cy) => {
    setView((v) => {
      const s = Math.min(2.5, Math.max(0.25, v.s + delta));
      if (cx == null) return clampView({ ...v, s });
      const k = s / v.s;
      return clampView({ ...v, s, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k });
    });
  };

  /* screen → board */
  const toBoard = (e) => {
    const r = surface.current.getBoundingClientRect();
    return {
      x: (e.clientX - r.left - view.x) / view.s,
      y: (e.clientY - r.top - view.y) / view.s,
    };
  };

  const persist = (next) => {
    setNotes(next);
    const bytes = JSON.stringify(next).length;
    if (bytes > 4_400_000) {
      setWarn("Board is full. Delete an image before adding more.");
      return;
    }
    setWarn("");
    saveNotes(next);
  };

  const spawn = (item, edit = true) => {
    const id = "i" + Date.now() + Math.round(Math.random() * 99);
    const next = [
      ...notes,
      {
        id,
        x: (size.w / 2 - view.x) / view.s - 90 + (Math.random() * 40 - 20),
        y: (size.h / 2 - view.y) / view.s - 50 + (Math.random() * 30 - 15),
        author: author || "Anonymous",
        ...item,
      },
    ];
    persist(next);
    setMine(new Set([...mine, id]));
    setSelected(id);
    if (edit) setEditing(id);
    setFlyout(null);
  };

  const addNote = (color) =>
    spawn({ kind: "note", text: "", color, tilt: Math.random() * 3 - 1.5 });

  const postNote = () => {
    if (!message.trim()) return;
    setMode("select");
    spawn(
      {
        kind: "note",
        text: message.trim(),
        color: leaveColor,
        tilt: Math.random() * 3 - 1.5,
      },
      false
    );
    setMessage("");
  };
  const addText = (font) => spawn({ kind: "text", text: "", font });

  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const { url, ratio } = await shrinkImage(file);
      if (replaceFor.current) {
        const id = replaceFor.current;
        replaceFor.current = null;
        persist(notes.map((n) => (n.id === id ? { ...n, url, ratio } : n)));
      } else {
        spawn({ kind: "image", url, ratio }, false);
      }
    } catch (err) {
      setWarn("Couldn't read that file.");
    }
  };

  const patch = (id, fields) =>
    setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, ...fields } : n)));

  /* an item left blank is thrown away rather than saved */
  const commit = (id) => {
    setEditing(null);
    persist(
      notes.filter((n) => {
        if (n.id !== id) return true;
        if (n.kind === "image") return true;
        return (n.text || "").trim() !== "";
      })
    );
  };

  const remove = (id) => {
    persist(notes.filter((n) => n.id !== id));
    setSelected(null);
  };

  const eraseIf = (id) => {
    if (mode === "eraser" && mine.has(id)) remove(id);
  };

  /* ---- canvas pointer handling ---- */

  const onPointerDown = (e) => {
    if (e.target.closest("[data-ui]")) return;
    const tag = e.target.tagName;
    if (tag !== "TEXTAREA" && tag !== "INPUT") e.preventDefault();

    if (mode === "marker" || mode === "arrow") {
      const p = toBoard(e);
      setLive(
        mode === "marker"
          ? { kind: "draw", x: p.x, y: p.y, color: ink, points: [{ x: 0, y: 0 }] }
          : { kind: "arrow", x: p.x, y: p.y, color: ink, dx: 0, dy: 0 }
      );
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    if (e.target.closest("[data-item]")) return;
    if (mode === "eraser") return;

    setSelected(null);
    setFlyout(null);
    setDrag({ kind: "pan", px: e.clientX, py: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (live) {
      const p = toBoard(e);
      setLive((l) => {
        if (l.kind !== "draw") return { ...l, dx: p.x - l.x, dy: p.y - l.y };
        const nx = p.x - l.x;
        const ny = p.y - l.y;
        const last = l.points[l.points.length - 1];
        if (Math.abs(nx - last.x) + Math.abs(ny - last.y) < 1.6) return l;
        return { ...l, points: [...l.points, { x: nx, y: ny }] };
      });
      return;
    }
    if (!drag) return;
    const dx = e.clientX - drag.px;
    const dy = e.clientY - drag.py;
    if (drag.kind === "pan") {
      setView((v) => clampView({ ...v, x: v.x + dx, y: v.y + dy }));
    } else {
      setNotes((ns) =>
        ns.map((n) =>
          n.id === drag.id
            ? {
                ...n,
                x: Math.max(bounds.left + 20, n.x + dx / view.s),
                y: Math.max(bounds.top + 20, n.y + dy / view.s),
              }
            : n
        )
      );
    }
    setDrag({ ...drag, px: e.clientX, py: e.clientY });
  };

  const endPointer = () => {
    if (live) {
      const big =
        live.kind === "draw"
          ? live.points.length > 2
          : Math.abs(live.dx) + Math.abs(live.dy) > 12;
      if (big) {
        const id = "i" + Date.now();
        persist([...notes, { ...live, id, author: author || "Anonymous" }]);
        setMine(new Set([...mine, id]));
      }
      setLive(null);
      return;
    }
    if (drag && drag.kind === "item") {
      setNotes((ns) => {
        saveNotes(ns);
        return ns;
      });
    }
    setDrag(null);
  };

  const startItemDrag = (e, id) => {
    if (mode === "eraser") {
      e.stopPropagation();
      eraseIf(id);
      return;
    }
    if (mode !== "select" || editing === id) return;
    e.stopPropagation();
    setSelected(id);
    setDrag({ kind: "item", id, px: e.clientX, py: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  /* ---- stroke + arrow rendering ---- */

  const Stroke = ({ item }) => {
    const pad = 6;
    const box = strokeBox(item.points, pad);
    const pts = item.points.map((p) => ({
      x: p.x - box.minX + pad,
      y: p.y - box.minY + pad,
    }));
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      d += ` Q${pts[i].x} ${pts[i].y} ${mx} ${my}`;
    }
    if (pts.length > 1) {
      const e = pts[pts.length - 1];
      d += ` L${e.x} ${e.y}`;
    }
    return (
      <svg
        className="bl-ink"
        style={{ left: item.x + box.minX - pad, top: item.y + box.minY - pad }}
        width={box.w}
        height={box.h}
      >
        <path
          d={d}
          fill="none"
          stroke={item.color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const Arrow = ({ item }) => {
    const pad = 14;
    const box = strokeBox([{ x: 0, y: 0 }, { x: item.dx, y: item.dy }], pad);
    const x1 = -box.minX + pad;
    const y1 = -box.minY + pad;
    const x2 = item.dx - box.minX + pad;
    const y2 = item.dy - box.minY + pad;
    const a = Math.atan2(y2 - y1, x2 - x1);
    const head = 11;
    return (
      <svg
        className="bl-ink"
        style={{ left: item.x + box.minX - pad, top: item.y + box.minY - pad }}
        width={box.w}
        height={box.h}
      >
        <g stroke={item.color} strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d={`M${x1} ${y1} L${x2} ${y2}`} />
          <path
            d={`M${x2} ${y2} L${x2 - head * Math.cos(a - 0.42)} ${y2 - head * Math.sin(a - 0.42)}`}
          />
          <path
            d={`M${x2} ${y2} L${x2 - head * Math.cos(a + 0.42)} ${y2 - head * Math.sin(a + 0.42)}`}
          />
        </g>
      </svg>
    );
  };

  const tools = [
    { id: "select", icon: MousePointer2, label: "Select", mode: "select" },
    { id: "note", icon: StickyNote, label: "Sticky note", fly: true },
    { id: "text", icon: Type, label: "Text", fly: true },
    { id: "image", icon: ImageIcon, label: "Upload image", action: () => fileIn.current.click() },
    { id: "marker", icon: Pencil, label: "Marker", mode: "marker", fly: true },
    { id: "arrow", icon: ArrowUpRight, label: "Arrow", mode: "arrow", fly: true },
    { id: "eraser", icon: Eraser, label: "Eraser", mode: "eraser" },
  ];

  const cursor =
    mode === "marker" || mode === "arrow"
      ? "crosshair"
      : mode === "eraser"
      ? "cell"
      : drag && drag.kind === "pan"
      ? "grabbing"
      : "grab";

  return (
    <div className="bl-board" data-open={open ? "true" : "false"} aria-hidden={!open}>
      <input
        ref={fileIn}
        type="file"
        accept="image/*"
        onChange={onFile}
        style={{ display: "none" }}
      />

      <div className="bl-board-bar">
        <button className="bl-board-close" onClick={onClose}>
          <ArrowLeft size={14} strokeWidth={1.6} />
          Dashboard
        </button>
        <span className="bl-board-title">Notebook</span>
        <span className="bl-board-count">
          {notes.length === 0 ? "empty" : `${notes.length} items`}
        </span>
        {warn && <span className="bl-warn">{warn}</span>}

        <span className="bl-zoom" style={{ marginLeft: "auto" }} data-ui="true">
          <button onClick={() => zoom(-0.15)} aria-label="Zoom out">
            <Minus size={13} strokeWidth={2} />
          </button>
          <span>{Math.round(view.s * 100)}%</span>
          <button onClick={() => zoom(0.15)} aria-label="Zoom in">
            <Plus size={13} strokeWidth={2} />
          </button>
        </span>
      </div>

      <div
        className="bl-canvas"
        ref={surface}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey) {
            const r = surface.current.getBoundingClientRect();
            zoom(-e.deltaY * 0.002, e.clientX - r.left, e.clientY - r.top);
          } else {
            setView((v) => clampView({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
          }
        }}
        style={{ cursor }}
      >
        <div
          className="bl-plane"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }}
        >
          <div className="bl-mast" style={{ width: masthead.w }}>
            <div className="bl-mast-row">
              <span>{masthead.left}</span>
              <span>{masthead.right}</span>
            </div>
            <div className="bl-mast-word">{masthead.word}</div>
            <div className="bl-mast-sub">{masthead.sub}</div>
          </div>

          {notes.map((n) => {
            const own = mine.has(n.id);
            const isSel = selected === n.id;

            if (n.kind === "draw" || n.kind === "arrow") {
              return (
                <div
                  key={n.id}
                  data-item="true"
                  className="bl-ink-wrap"
                  data-sel={isSel ? "true" : "false"}
                  onPointerDown={(e) => startItemDrag(e, n.id)}
                  onPointerEnter={(e) => e.buttons === 1 && eraseIf(n.id)}
                >
                  {n.kind === "draw" ? <Stroke item={n} /> : <Arrow item={n} />}

                  {isSel && own && mode === "select" && (
                    <div
                      className="bl-ctx bl-ctx-ink"
                      data-ui="true"
                      style={{
                        left: n.x,
                        top: n.y,
                        transform: `scale(${1 / view.s})`,
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      {inkColors.map((c) => (
                        <button
                          key={c}
                          className="bl-ctx-swatch"
                          style={{ background: c }}
                          data-on={n.color === c ? "true" : "false"}
                          onClick={() =>
                            persist(notes.map((x) => (x.id === n.id ? { ...x, color: c } : x)))
                          }
                          aria-label="Ink colour"
                        />
                      ))}
                      <button className="bl-ctx-btn" onClick={() => remove(n.id)} aria-label="Delete">
                        <Trash2 size={12} strokeWidth={1.8} />
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={n.id}
                data-item="true"
                className={`bl-item bl-item-${n.kind}`}
                data-sel={isSel ? "true" : "false"}
                style={{
                  left: n.x,
                  top: n.y,
                  background: n.kind === "note" ? n.color : undefined,
                  transform: n.kind === "note" ? `rotate(${n.tilt || 0}deg)` : undefined,
                }}
                onPointerDown={(e) => startItemDrag(e, n.id)}
                onPointerEnter={(e) => e.buttons === 1 && eraseIf(n.id)}
                onDoubleClick={() => own && n.kind !== "image" && mode === "select" && setEditing(n.id)}
              >
                {n.kind === "image" ? (
                  <img
                    src={n.url}
                    alt=""
                    draggable={false}
                    style={{ height: n.ratio ? 220 * n.ratio : undefined }}
                  />
                ) : editing === n.id ? (
                  <textarea
                    autoFocus
                    value={n.text}
                    onChange={(e) => patch(n.id, { text: e.target.value })}
                    onBlur={() => commit(n.id)}
                    placeholder={n.kind === "text" ? "Write something" : "Note"}
                    style={
                      n.kind === "text"
                        ? {
                            fontFamily: t.sans,
                            fontWeight: n.font === "display" ? 500 : 400,
                            fontSize: n.font === "display" ? 30 : 14,
                            letterSpacing: n.font === "display" ? "-0.025em" : 0,
                            lineHeight: n.font === "display" ? 1.12 : 1.5,
                          }
                        : undefined
                    }
                  />
                ) : (
                  <div
                    className="bl-item-body"
                    style={
                      n.kind === "text"
                        ? {
                            fontFamily: t.sans,
                            fontWeight: n.font === "display" ? 500 : 400,
                            fontSize: n.font === "display" ? 30 : 14,
                            letterSpacing: n.font === "display" ? "-0.025em" : 0,
                            lineHeight: n.font === "display" ? 1.12 : 1.5,
                          }
                        : undefined
                    }
                  >
                    {n.text}
                  </div>
                )}

                {n.kind === "note" && <div className="bl-item-foot">{n.author}</div>}

                {isSel && own && mode === "select" && (
                  <div
                    className="bl-ctx"
                    data-ui="true"
                    style={{ transform: `scale(${1 / view.s})` }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    {n.kind === "note" &&
                      noteColors.map((c) => (
                        <button
                          key={c}
                          className="bl-ctx-swatch"
                          style={{ background: c }}
                          data-on={n.color === c ? "true" : "false"}
                          onClick={() =>
                            persist(notes.map((x) => (x.id === n.id ? { ...x, color: c } : x)))
                          }
                          aria-label="Note colour"
                        />
                      ))}

                    {n.kind === "text" && (
                      <>
                        <button
                          className="bl-ctx-font"
                          data-on={n.font === "display" ? "true" : "false"}
                          style={{ fontFamily: t.sans, fontSize: 14, fontWeight: 500 }}
                          onClick={() =>
                            persist(notes.map((x) => (x.id === n.id ? { ...x, font: "display" } : x)))
                          }
                        >
                          Aa
                        </button>
                        <button
                          className="bl-ctx-font"
                          data-on={n.font !== "display" ? "true" : "false"}
                          style={{ fontFamily: t.sans, fontSize: 12 }}
                          onClick={() =>
                            persist(notes.map((x) => (x.id === n.id ? { ...x, font: "body" } : x)))
                          }
                        >
                          Aa
                        </button>
                      </>
                    )}

                    {n.kind === "image" && (
                      <button
                        className="bl-ctx-font"
                        style={{ fontFamily: t.sans, fontSize: 11.5 }}
                        onClick={() => {
                          replaceFor.current = n.id;
                          fileIn.current.click();
                        }}
                      >
                        Replace
                      </button>
                    )}

                    {n.kind !== "image" && (
                      <button className="bl-ctx-btn" onClick={() => setEditing(n.id)} aria-label="Edit">
                        <Pencil size={12} strokeWidth={1.8} />
                      </button>
                    )}
                    <button className="bl-ctx-btn" onClick={() => remove(n.id)} aria-label="Delete">
                      <Trash2 size={12} strokeWidth={1.8} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {live && (live.kind === "draw" ? <Stroke item={live} /> : <Arrow item={live} />)}
        </div>

        {notes.length === 0 && !live && (
          <div className="bl-board-empty">
            Nothing here yet. Add a note, draw, or drop in an image.
          </div>
        )}

        {/* tool rail */}
        <div className="bl-rail-tools" data-ui="true">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const on = tool.mode ? mode === tool.mode : flyout === tool.id;
            return (
              <div key={tool.id} className="bl-tool-wrap">
                <button
                  className="bl-tool"
                  data-on={on ? "true" : "false"}
                  title={tool.label}
                  onClick={() => {
                    if (tool.action) return tool.action();
                    if (tool.mode) {
                      setMode(tool.mode);
                      setSelected(null);
                    }
                    setFlyout(tool.fly && flyout !== tool.id ? tool.id : null);
                  }}
                >
                  <Icon size={16} strokeWidth={1.6} />
                </button>

                {flyout === "note" && tool.id === "note" && (
                  <div className="bl-flyout">
                    {noteColors.map((c) => (
                      <button
                        key={c}
                        className="bl-fly-swatch"
                        style={{ background: c }}
                        onClick={() => addNote(c)}
                        aria-label="Add sticky note"
                      />
                    ))}
                  </div>
                )}

                {flyout === "text" && tool.id === "text" && (
                  <div className="bl-flyout bl-flyout-text">
                    <button onClick={() => addText("display")} style={{ fontFamily: t.sans, fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em" }}>
                      Heading
                    </button>
                    <button onClick={() => addText("body")} style={{ fontFamily: t.sans, fontSize: 13 }}>
                      Body text
                    </button>
                  </div>
                )}

                {flyout === tool.id && (tool.id === "marker" || tool.id === "arrow") && (
                  <div className="bl-flyout">
                    {inkColors.map((c) => (
                      <button
                        key={c}
                        className="bl-fly-swatch"
                        style={{ background: c }}
                        data-on={ink === c ? "true" : "false"}
                        onClick={() => setInk(c)}
                        aria-label="Ink colour"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* leave a note */}
        <div className="bl-leave" data-ui="true" style={{ background: leaveColor }}>
          <div className="bl-leave-title">Leave a note</div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Anything you'd tell me about this work"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) postNote();
            }}
          />

          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
          />

          <div className="bl-leave-colors">
            {noteColors.map((c) => (
              <button
                key={c}
                style={{ background: c }}
                data-on={leaveColor === c ? "true" : "false"}
                onClick={() => setLeaveColor(c)}
                aria-label="Note colour"
              />
            ))}
          </div>

          <button
            className="bl-leave-btn"
            onClick={postNote}
            disabled={!message.trim()}
          >
            Post to board
          </button>
        </div>

        <div className="bl-board-hint">
          {mode === "marker"
            ? "Drag to draw"
            : mode === "arrow"
            ? "Drag from start to end"
            : mode === "eraser"
            ? "Click or drag across anything you made"
            : "Drag to pan · ⌘/Ctrl + scroll to zoom · double-click to edit"}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   range: self-described, six axes. Edit the values and copy freely.
---------------------------------------------------------------- */

const range = [
  {
    axis: "Narrative",
    value: 84,
    text: "Worlds, voice, and the order things get revealed in. Most of what I build starts as a story about someone using it, and the structure falls out of that rather than the other way around.",
  },
  {
    axis: "Systems",
    value: 88,
    text: "Rules, mechanics, and the way constraints produce behaviour. This is the part of game design that transfers cleanly into product work; both are about what a person can do next.",
  },
  {
    axis: "Craft",
    value: 92,
    text: "Type, spacing, and the hundred small decisions that separate finished from nearly finished. The slowest part of any project and the one I refuse to compress.",
  },
  {
    axis: "Code",
    value: 74,
    text: "React and TypeScript, enough to build what I design rather than hand it over. Not an engineer, and I don't pretend the distinction doesn't matter on larger systems.",
  },
  {
    axis: "Research",
    value: 71,
    text: "Reading people: why someone hesitates at a step, what a room makes them expect. Closer to applied psychology than to user testing, and it informs the work before anything gets drawn.",
  },
  {
    axis: "Space",
    value: 66,
    text: "Physical rooms and the experiences staged inside them. The newest axis for me, and the one pulling hardest on everything else.",
  },
];

const career = [
  {
    org: "Black Lotus",
    role: "Founder & creative director",
    start: "2026-04",
    end: null,
    where: "Cuttack",
    note: "Identity, digital product and spatial work, run as a studio of one.",
  },
  {
    org: "Aurora, Bitshala",
    role: "Product designer",
    start: "2025-01",
    end: "2026-03",
    where: "Remote",
    note: "Bitcoin payment distribution: split payouts, 20+ prototypes, competitive research.",
  },
  {
    org: "IIT Delhi",
    role: "UI/UX designer",
    start: "2024-09",
    end: "2024-12",
    where: "Delhi",
    note: "Built the design system; 3D visuals and front-end performance work.",
  },
  {
    org: "Border Wallets",
    role: "Product designer",
    start: "2024-06",
    end: "2024-09",
    where: "Remote",
    note: "UX audits on multi-platform Bitcoin tools; 100+ screens shipped.",
  },
];

const NOW = "2026-09";
const months = (a, b) => {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = (b || NOW).split("-").map(Number);
  return Math.max(1, (by - ay) * 12 + (bm - am));
};
const spanLabel = (n) => {
  const y = Math.floor(n / 12);
  const m = n % 12;
  return [y && `${y} yr${y > 1 ? "s" : ""}`, m && `${m} mo`].filter(Boolean).join(" ");
};
const monthName = (d) =>
  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
    Number(d.split("-")[1]) - 1
  ];
const dateLabel = (c) =>
  `${monthName(c.start)} ${c.start.split("-")[0]} to ${
    c.end ? `${monthName(c.end)} ${c.end.split("-")[0]}` : "now"
  }`;

/* the intro video: drop a file URL here and it plays in the circle */
const heroStill = "data:image/jpeg;base64,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";

const introVideo = "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAABIsbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAANrAAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAEVZ0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAANrAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAeAAAAHgAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAADawAAAEAAABAAAAABDObWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAwAAACoABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAAQeW1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAEDlzdGJsAAAAxXN0c2QAAAAAAAAAAQAAALVhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAeAB4ABIAAAASAAAAAAAAAABFUxhdmM2MC4zMS4xMDIgbGlieDI2NAAAAAAAAAAAAAAAGP//AAAAOGF2Y0MBZAAe/+EAG2dkAB6s2YHg9pqAgICgAAADACAAAAYB4sWzQAEABmjpeESyLP34+AAAAAATY29scm5jbHgAAQABAAEAAAAAFGJ0cnQAAAAAAAKA0AACgNAAAAAYc3R0cwAAAAAAAAABAAABUAAAAgAAAAAYc3RzcwAAAAAAAAACAAAAAQAAAPsAAAm4Y3R0cwAAAAAAAAE1AAAAAQAABAAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAQAACgAAAAABAAAEAAAAAAEAAAAAAAAAAQAAAgAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAQAACgAAAAABAAAEAAAAAAEAAAAAAAAAAQAAAgAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAQAACgAAAAABAAAEAAAAAAEAAAAAAAAAAQAAAgAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAgAAAAAAgAAAgAAAAABAAAGAAAAAAEAAAIAAAAAAQAABAAAAAABAAAGAAAAAAEAAAIAAAAAAQAABAAAAAABAAAGAAAAAAEAAAIAAAAAAQAABgAAAAABAAACAAAAAAEAAAQAAAAAAQAABgAAAAABAAACAAAAAAEAAAQAAAAAAQAABgAAAAABAAACAAAAAAEAAAYAAAAAAQAAAgAAAAABAAAEAAAAAAEAAAgAAAAAAgAAAgAAAAABAAAGAAAAAAEAAAIAAAAAAQAABgAAAAABAAACAAAAAAEAAAYAAAAAAQAAAgAAAAABAAAGAAAAAAEAAAIAAAAAAQAACAAAAAACAAACAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAQAACgAAAAABAAAEAAAAAAEAAAAAAAAAAQAAAgAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAYAAAAAAQAAAgAAAAACAAAEAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAQAACgAAAAABAAAEAAAAAAEAAAAAAAAAAQAAAgAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAgAAAAAAgAAAgAAAAACAAAEAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAQAACgAAAAABAAAEAAAAAAEAAAAAAAAAAQAAAgAAAAABAAAGAAAAAAEAAAIAAAAAAQAABAAAAAABAAAIAAAAAAIAAAIAAAAAAgAABAAAAAABAAAGAAAAAAEAAAIAAAAAAQAABAAAAAABAAAGAAAAAAEAAAIAAAAAAgAABAAAAAABAAAIAAAAAAIAAAIAAAAAAQAABgAAAAABAAACAAAAAAEAAAQAAAAAAQAACgAAAAABAAAEAAAAAAEAAAAAAAAAAQAAAgAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAQAACgAAAAABAAAEAAAAAAEAAAAAAAAAAQAAAgAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAwAABAAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAQAACAAAAAACAAACAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAQAACAAAAAACAAACAAAAAAEAAAgAAAAAAgAAAgAAAAABAAAEAAAAAAEAAAYAAAAAAQAAAgAAAAABAAAGAAAAAAEAAAIAAAAAAQAABgAAAAABAAACAAAAAAEAAAQAAAAAAQAACAAAAAACAAACAAAAAAEAAAYAAAAAAQAAAgAAAAABAAAGAAAAAAEAAAIAAAAAAgAABAAAAAABAAAGAAAAAAEAAAIAAAAAAQAABAAAAAABAAAGAAAAAAEAAAIAAAAAAgAABAAAAAABAAAGAAAAAAEAAAIAAAAAAgAABAAAAAABAAAIAAAAAAIAAAIAAAAAAgAABAAAAAABAAAGAAAAAAEAAAIAAAAAAQAACAAAAAACAAACAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAQAABAAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAYAAAAAAQAAAgAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAQAAAAAAQAACgAAAAABAAAEAAAAAAEAAAAAAAAAAQAAAgAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAQAAAQAAAAAAQAACgAAAAABAAAEAAAAAAEAAAAAAAAAAQAAAgAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAoAAAAAAQAABAAAAAABAAAAAAAAAAEAAAIAAAAAAQAACgAAAAABAAAEAAAAAAEAAAAAAAAAAQAAAgAAAAABAAAKAAAAAAEAAAQAAAAAAQAAAAAAAAABAAACAAAAAAEAAAoAAAAAAQAA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Ac4AAABiAAACAQAAAO4AAACKAAAAgQAAAdwAAAElAAAAqwAAAJsAAAFeAAABLQAAALAAAACXAAAA3gAAAJ0AAACbAAAAFHN0Y28AAAAAAAAAAQAAElwAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjYwLjE2LjEwMAAAAAhmcmVlAARhdG1kYXQAAAKuBgX//6rcRem95tlIt5Ys2CDZI+7veDI2NCAtIGNvcmUgMTY0IHIzMTA4IDMxZTE5ZjkgLSBILjI2NC9NUEVHLTQgQVZDIGNvZGVjIC0gQ29weWxlZnQgMjAwMy0yMDIzIC0gaHR0cDovL3d3dy52aWRlb2xhbi5vcmcveDI2NC5odG1sIC0gb3B0aW9uczogY2FiYWM9MSByZWY9NSBkZWJsb2NrPTE6MDowIGFuYWx5c2U9MHgzOjB4MTEzIG1lPWhleCBzdWJtZT04IHBzeT0xIHBzeV9yZD0xLjAwOjAuMDAgbWl4ZWRfcmVmPTEgbWVfcmFuZ2U9MTYgY2hyb21hX21lPTEgdHJlbGxpcz0yIDh4OGRjdD0xIGNxbT0wIGRlYWR6b25lPTIxLDExIGZhc3RfcHNraXA9MSBjaHJvbWFfcXBfb2Zmc2V0PS0yIHRocmVhZHM9MSBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTMgYl9weXJhbWlkPTIgYl9hZGFwdD0xIGJfYmlhcz0wIGRpcmVjdD0zIHdlaWdodGI9MSBvcGVuX2dvcD0wIHdlaWdodHA9MiBrZXlpbnQ9MjUwIGtleWludF9taW49MjQgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD01MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTMwLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAAD8JZYiEADv/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";

function NodeGlyph({ i, x, y, r }) {
  switch (i % 6) {
    case 0:
      return <circle cx={x} cy={y} r={r} />;
    case 1:
      return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx="1.5" />;
    case 2:
      return (
        <polygon
          points={`${x},${y - r * 1.15} ${x + r},${y + r * 0.72} ${x - r},${y + r * 0.72}`}
        />
      );
    case 3:
      return (
        <polygon
          points={[0, 1, 2, 3, 4, 5]
            .map((k) => {
              const a = ((k * 60 - 90) * Math.PI) / 180;
              return `${x + Math.cos(a) * r},${y + Math.sin(a) * r}`;
            })
            .join(" ")}
        />
      );
    case 4:
      return (
        <polygon
          points={`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`}
        />
      );
    default:
      return (
        <>
          <circle cx={x} cy={y} r={r} />
          <circle cx={x} cy={y} r={r * 0.34} />
        </>
      );
  }
}

function Radar({ values, active, hover, onPick, onHover }) {
  const S = 320;
  const cx = S / 2;
  const cy = S / 2 - 4;
  const R = 88;

  const pt = (i, r) => {
    const a = ((-90 + i * 60) * Math.PI) / 180;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };

  const ring = (r) => range.map((_, i) => pt(i, r).join(",")).join(" ");
  const bands = [20, 40, 60, 80, 100];
  const plot = range.map((item, i) => {
    const score = Math.max(0, Math.min(100, values[i] ?? 0));
    const radius = (score / 100) * R;
    const [x, y] = pt(i, radius);
    return { item, i, x, y };
  });
  const shape = plot.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="bl-radar" role="img" aria-label="Range across six axes">
      <defs>
        <filter id="bl-map-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {bands.map((band) => (
        <polygon key={band} points={ring((band / 100) * R)} className="bl-radar-ring" />
      ))}

      {range.map((r, i) => {
        const [x, y] = pt(i, R);
        const on = active === i || hover === i;
        return (
          <line
            key={r.axis}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            className="bl-radar-spoke"
            data-on={on ? "true" : "false"}
          />
        );
      })}

      <polygon points={shape} className="bl-radar-shape" />
      <polygon points={shape} className="bl-radar-shape-line" />

      <circle cx={cx} cy={cy} r="2.5" className="bl-radar-core" />

      {plot.map(({ item, i, x, y }) => {
        const [lx, ly] = pt(i, R + 18);
        const anchor = i === 0 || i === 3 ? "middle" : i === 1 || i === 2 ? "start" : "end";
        const on = active === i;
        const hot = hover === i;
        return (
          <g
            key={item.axis}
            className="bl-radar-node"
            data-on={on ? "true" : "false"}
            data-hot={hot ? "true" : "false"}
            tabIndex={0}
            onClick={() => onPick(active === i ? -1 : i)}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(-1)}
            onFocus={() => onHover(i)}
            onBlur={() => onHover(-1)}
          >
            <circle cx={x} cy={y} r="16" className="bl-radar-hit" />
            <g className="bl-radar-glyph">
              <NodeGlyph i={i} x={x} y={y} r={hot || on ? 8.5 : 7} />
            </g>
            <text x={x} y={y + 3} className="bl-radar-idx">
              {i + 1}
            </text>
            <text x={lx} y={ly + 3} textAnchor={anchor} className="bl-radar-label">
              {item.axis}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RangeDisc({ paused }) {
  const rootRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;
    if (paused) {
      video.pause();
      return;
    }
    if (video.paused) video.play().catch(() => {});
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let prevMetalIndex = -1;
    const frame = () => {
      const duration = video.duration;
      if (duration && Number.isFinite(duration) && duration > 0) {
        const lap = video.currentTime / duration;
        const fraction = lap - Math.floor(lap);
        const deg = fraction * 360;
        root.style.setProperty("--sweep", `${deg}deg`);
        // Cross-fade twelve offline-rendered studio-light directions.
        // The reflection stays tied to the environment as the metal moves.
        const metalFrame = fraction * 12;
        const metalIndex = Math.floor(metalFrame) % 12;
        if (metalIndex !== prevMetalIndex) {
          root.style.setProperty("--metal-position", `${metalIndex * 100 / 11}%`);
          root.style.setProperty("--metal-next-position", `${((metalIndex + 1) % 12) * 100 / 11}%`);
          prevMetalIndex = metalIndex;
        }
        root.style.setProperty("--metal-mix", `${metalFrame - Math.floor(metalFrame)}`);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  return (
    <div className="bl-profile-video" ref={rootRef}>
      <span className="bl-disc-ambient" aria-hidden="true" />
      <span className="bl-disc-glow" aria-hidden="true" />
      <span className="bl-disc-glass" aria-hidden="true" />
      {introVideo ? (
        <video
          ref={videoRef}
          src={introVideo}
          autoPlay={!paused}
          muted
          loop
          playsInline
          aria-label="Intro video"
        />
      ) : (
        <div className="bl-profile-video-ph">
          <span className="bl-profile-play" />
          <span>Intro video</span>
        </div>
      )}
      <span className="bl-disc-ticker" aria-hidden="true" />
    </div>
  );
}

function ProfilePanel({ open, onClose, paused = false }) {
  const [active, setActive] = useState(-1);
  const [hover, setHover] = useState(-1);
  const [job, setJob] = useState(0);
  const [values, setValues] = useState(range.map(() => 0));

  useEffect(() => {
    if (!open) {
      setValues(range.map(() => 0));
      return;
    }
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setValues(range.map((r) => r.value));
      return;
    }

    let raf;
    const start = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - start) / 620);
      const eased = 1 - Math.pow(1 - k, 3);
      setValues(range.map((r) => r.value * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  return (
    <div className="bl-profile-slot" data-open={open ? "true" : "false"}>
    <aside className="bl-profile" data-open={open ? "true" : "false"} aria-hidden={!open}>
      <div className="bl-profile-body">
        <div className="bl-profile-scroll">
        <RangeDisc paused={!open || paused} />
        <div className="bl-profile-inner">
        <div className="bl-profile-head">
          <span className="bl-profile-title">Range</span>
        </div>

        <Radar
          values={values}
          active={active}
          hover={hover}
          onPick={setActive}
          onHover={setHover}
        />

        <p className="bl-profile-note" data-axis={hover >= 0 ? "true" : "false"} aria-live="polite">
          {hover >= 0 ? (
            <>
              <span className="bl-profile-note-axis">{range[hover].axis}</span>
              {range[hover].text}
            </>
          ) : (
            "How I'd describe my own range. Self-described, not a test."
          )}
        </p>

        <div className="bl-cv">
          <div className="bl-cv-label">Career</div>

          <div className="bl-cv-track">
            {career.map((c, i) => {
              const n = months(c.start, c.end);
              const open = job === i;
              return (
                <button
                  key={c.org}
                  className="bl-cv-band"
                  data-on={open ? "true" : "false"}
                  data-now={c.end ? "false" : "true"}
                  onClick={() => setJob(open ? -1 : i)}
                >
                  <span className="bl-cv-body">
                    <span className="bl-cv-top">
                      <span className="bl-cv-period">{dateLabel(c)}</span>
                      <span className="bl-cv-span">{spanLabel(n)}</span>
                    </span>
                    <span className="bl-cv-role">{c.role}</span>
                    <span className="bl-cv-org">
                      {c.org} · {c.where}
                    </span>
                    {open && <span className="bl-cv-note">{c.note}</span>}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bl-cv-foot">
            <span>Before that</span>
            B.Arch & Urban Planning, Symbiosis Pune, 2024
          </div>
        </div>

        </div>
        </div>
      </div>
    </aside>
    <svg className="bl-profile-join" viewBox="0 0 366 120" aria-hidden="true">
      <rect
        x="290.6"
        y="35.5"
        width="64"
        height="16"
        rx="8"
        fill="#000"
        transform="rotate(-45 322.6 43.5)"
      />
      <circle cx="322.6" cy="43.5" r="2.4" fill="#fff" />
    </svg>
    <button className="bl-profile-close" onClick={onClose} aria-label="Close">
      <X size={15} strokeWidth={1.6} />
    </button>
    </div>
  );
}


/* ----------------------------------------------------------------
   nav glyphs: soft, filled shapes built from circles and rounded
   rects, so they fill cleanly and read as cast metal. Each is drawn
   twice: once in metal, once as a clip for the sheen laid over it.
---------------------------------------------------------------- */

function glyphShapes(name) {
  switch (name) {
    case "tools":
      return (
        <>
          <path d="M12 2.6c.6 0 1.2.16 1.7.46l5.5 3.2c1 .6 1.7 1.7 1.7 2.9v5.7c0 1.2-.7 2.3-1.7 2.9l-5.5 3.2c-1 .6-2.4.6-3.4 0l-5.5-3.2c-1-.6-1.7-1.7-1.7-2.9V9.2c0-1.2.7-2.3 1.7-2.9l5.5-3.2c.5-.3 1.1-.46 1.7-.46z" />
          <circle cx="12" cy="12" r="3.3" fill="#000" />
        </>
      );
    case "web":
      return (
        <>
          <rect x="3" y="4.5" width="18" height="12.5" rx="3.2" />
          <rect x="8" y="18.6" width="8" height="2.6" rx="1.3" />
        </>
      );
    case "branding":
      return (
        <>
          <ellipse cx="12" cy="6.6" rx="3" ry="5" />
          <ellipse cx="12" cy="17.4" rx="3" ry="5" />
          <ellipse cx="6.6" cy="12" rx="5" ry="3" />
          <ellipse cx="17.4" cy="12" rx="5" ry="3" />
          <circle cx="12" cy="12" r="2.6" fill="#000" />
        </>
      );
    case "games":
      return (
        <>
          <rect x="2.5" y="7" width="19" height="10.5" rx="5.25" />
          <circle cx="8" cy="12.2" r="1.6" fill="#000" />
          <circle cx="16" cy="12.2" r="1.6" fill="#000" />
        </>
      );
    case "all":
      return (
        <>
          <rect x="3.5" y="3.5" width="7.4" height="7.4" rx="2.4" />
          <rect x="13.1" y="3.5" width="7.4" height="7.4" rx="2.4" />
          <rect x="3.5" y="13.1" width="7.4" height="7.4" rx="2.4" />
          <rect x="13.1" y="13.1" width="7.4" height="7.4" rx="2.4" />
        </>
      );
    case "about":
      return (
        <>
          <circle cx="12" cy="8" r="4.3" />
          <path d="M4 21c0-4.6 3.6-7.6 8-7.6s8 3 8 7.6c0 .6-.4 1-1 1H5c-.6 0-1-.4-1-1z" />
        </>
      );
    case "achievements":
      return (
        <>
          <rect x="8.2" y="12.5" width="3" height="8.5" rx="1.2" transform="rotate(20 9.7 16.7)" />
          <rect x="12.8" y="12.5" width="3" height="8.5" rx="1.2" transform="rotate(-20 14.3 16.7)" />
          <circle cx="12" cy="9" r="6" />
          <circle cx="12" cy="9" r="2.4" fill="#000" />
        </>
      );
    case "articles":
      return (
        <>
          <rect x="5" y="3" width="14" height="18" rx="3" />
          <rect x="8" y="8" width="8" height="1.6" rx="0.8" fill="#000" />
          <rect x="8" y="11.6" width="8" height="1.6" rx="0.8" fill="#000" />
          <rect x="8" y="15.2" width="5" height="1.6" rx="0.8" fill="#000" />
        </>
      );
    default:
      return <circle cx="12" cy="12" r="7" />;
  }
}

function Glyph({ name, size = 20 }) {
  /* every instance gets its own clip id, so a hidden copy can't break a visible one */
  const clip = `bl-clip-${name}-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="bl-glyph">
      <defs>
        <clipPath id={clip}>{glyphShapes(name)}</clipPath>
      </defs>
      <g fill="url(#bl-metal)">{glyphShapes(name)}</g>
      {/* soft top-left highlight, clipped to the shape */}
      <rect x="0" y="0" width="24" height="24" fill="url(#bl-sheen)" clipPath={`url(#${clip})`} />
    </svg>
  );
}

/* ----------------------------------------------------------------
   the other views: different objects, so different shapes
---------------------------------------------------------------- */

function ReadShot({ src, alt }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="bl-read-shot">
      {src && !failed ? (
        <img src={src} alt={alt} onError={() => setFailed(true)} />
      ) : (
        <span className="bl-read-shot-fallback">Image unavailable</span>
      )}
    </figure>
  );
}

const readCategories = [
  { label: "Home", view: "about" },
  { label: "Work", view: "work" },
  { label: "Index", view: "writing" },
  { label: "About", view: "about" },
];

function ReadBar({ onClose, onNavigate, current }) {
  return (
    <header className="bl-read-bar">
      <button type="button" className="bl-read-nav bl-read-back" onClick={onClose}>
        <ArrowLeft size={15} strokeWidth={1.6} />
        Back
      </button>
      <nav className="bl-read-cats" aria-label="Categories">
        {readCategories.map((c, i) => (
          <span className="bl-read-cat" key={c.label}>
            <button
              type="button"
              className="bl-read-nav"
              data-on={c.label === current ? "true" : "false"}
              aria-current={c.label === current ? "page" : undefined}
              onClick={() => onNavigate(c.view)}
            >
              {c.label}
            </button>
            {i < readCategories.length - 1 && (
              <span className="bl-read-comma" aria-hidden="true">,</span>
            )}
          </span>
        ))}
      </nav>
      <button type="button" className="bl-read-nav bl-read-contact" onClick={() => onNavigate("about")}>
        Contact
      </button>
    </header>
  );
}

function ArticlePage({ piece, onClose, onNavigate }) {
  const scroller = useRef(null);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0;
  }, [piece && piece.title]);

  return (
    <div
      className="bl-detail bl-article"
      data-open={piece ? "true" : "false"}
      aria-hidden={!piece}
      inert={!piece ? true : undefined}
    >
      <ReadBar onClose={onClose} onNavigate={onNavigate} current="Index" />

      <div className="bl-read-scroll" ref={scroller}>
        {piece && (
          <article className="bl-read">
            <div className="bl-read-copy">
              <h1>{piece.title}</h1>
              <div className="bl-read-meta">
                <div>
                  <p className="bl-read-kicker">Form</p>
                  <p className="bl-read-fact">{piece.form}</p>
                  <p className="bl-read-kicker">Published</p>
                  <p className="bl-read-fact">{piece.date}</p>
                </div>
                <div>
                  <p className="bl-read-kicker">Where</p>
                  <p className="bl-read-fact">
                    {piece.url ? (
                      <a href={piece.url} target="_blank" rel="noreferrer">
                        {piece.where}
                      </a>
                    ) : (
                      piece.where
                    )}
                  </p>
                </div>
              </div>
              <div className="bl-read-desc">
                <p className="bl-read-kicker">Description</p>
                {piece.blurb && <p>{piece.blurb}</p>}
                {(piece.body || []).map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            </div>

            {piece.images && piece.images.length > 0 && (
              <div className="bl-read-images" data-count={piece.images.length}>
                {piece.images.map((src) => (
                  <ReadShot key={src} src={src} alt="" />
                ))}
              </div>
            )}
          </article>
        )}
      </div>
    </div>
  );
}

function WritingView({ onOpen }) {
  const [feature, ...sides] = writing;
  const pieceMedia = (w) => (
    <span className="bl-piece-media">
      {w.images && w.images[0] ? (
        <img src={w.images[0]} alt="" />
      ) : (
        <span className="bl-piece-fallback" />
      )}
    </span>
  );
  const pieceCopy = (w, withArrow) => (
    <span className="bl-piece-copy">
      <span className="bl-piece-meta">
        <span>{w.date}</span>
        {w.form && <span>{w.form}</span>}
      </span>
      <span className="bl-piece-title">{w.title}</span>
      <span className="bl-piece-foot">
        {w.where && <span className="bl-piece-tag">{w.where}</span>}
        {withArrow && (
          <span className="bl-piece-arrow" aria-hidden="true">
            <ArrowRight size={16} strokeWidth={1.6} />
          </span>
        )}
      </span>
    </span>
  );
  return (
    <div className="bl-band bl-pieces">
      {feature && (
        <button
          type="button"
          className="bl-piece bl-piece-feature"
          onClick={() => onOpen(feature)}
        >
          {pieceMedia(feature)}
          {pieceCopy(feature, true)}
        </button>
      )}
      <div className="bl-piece-stack">
        {sides.slice(0, 3).map((w) => (
          <button
            type="button"
            className="bl-piece bl-piece-side"
            key={w.title}
            onClick={() => onOpen(w)}
          >
            {pieceMedia(w)}
            {pieceCopy(w, false)}
            <span className="bl-piece-arrow" aria-hidden="true">
              <ArrowRight size={16} strokeWidth={1.6} />
            </span>
          </button>
        ))}
      </div>
      <p className="bl-list-note">
        More in progress. New pieces land on Substack first.
      </p>
    </div>
  );
}

function AchievementTimeline() {
  const items = [...credits].reverse();
  const ref = useRef(null);
  const [perRow, setPerRow] = useState(items.length);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const min = 200;
      const count = Math.max(1, Math.min(items.length, Math.floor(el.clientWidth / min) || 1));
      setPerRow(count);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  const rows = [];
  for (let i = 0; i < items.length; i += perRow) rows.push(items.slice(i, i + perRow));

  return (
    <section className="bl-road" aria-label="Achievements">
      <div className="bl-road-kicker">Achievements</div>
      <div className="bl-road-rows" ref={ref}>
        {rows.map((row) => (
          <div className="bl-road-row" key={row[0].title} style={{ "--cols": perRow }}>
            {row.map((c) => {
              const latest = c === items[items.length - 1];
              return (
                <div
                  className="bl-road-stop"
                  data-latest={latest ? "true" : "false"}
                  key={c.title}
                >
                  <span className="bl-road-pill">{c.title}</span>
                  <span className="bl-road-track" aria-hidden="true">
                    <span className="bl-road-dot" />
                  </span>
                  <span className="bl-road-copy">
                    <span className="bl-road-year">{c.year}</span>
                    <span className="bl-road-note">{c.note}</span>
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

const aboutLinks = ["IG", "LI", "SU"];

function AboutView() {
  return (
    <div className="bl-me">
      <div className="bl-me-field" aria-hidden="true" />
      <div className="bl-me-grain" aria-hidden="true" />

      <div className="bl-me-statement">
        <p>
          <strong>Deeksha Satapathy</strong> is a designer working across brand
          identity, digital product and the occasional room. The work splits
          between things that need to be precise and things that need to be felt.
          I have stopped treating those as separate practices.
        </p>
      </div>

      <AchievementTimeline />

      <div className="bl-me-foot">
        <div className="bl-me-foot-name">Black Lotus</div>
        {aboutLinks.map((l) => (
          <div className="bl-me-foot-link" key={l}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}


/* the ideation board widget: a square card in the sidebar, a bar on the dial */
function BoardCard({ onOpen, bar = false }) {
  return (
    <div
      className="bl-widget"
      data-bar={bar ? "true" : "false"}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
    >
      <span className="bl-widget-sheen" aria-hidden="true" />

      <span className="bl-widget-meta">
        <span>{boardCard.label}</span>
      </span>

      <span className="bl-widget-figure">
        <span className="bl-widget-num">{boardCard.count}</span>
        <span className="bl-widget-unit">{boardCard.unit}</span>
      </span>

      <span className="bl-widget-orbit" aria-hidden="true">
        {Array.from({ length: 7 }).map((_, i) => (
          <span
            key={i}
            style={{
              transform: `rotate(${(i * 360) / 7}deg) translateY(-21px)`,
              animationDelay: `${(i * 1.4) / 7}s`,
            }}
          />
        ))}
      </span>

      <span className="bl-widget-action">
        <span className="bl-widget-pill">
          <span className="bl-widget-pill-text">{boardCard.action}</span>
          <span className="bl-widget-disc">
            <ArrowUpRight size={12} strokeWidth={1.9} />
          </span>
        </span>
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------
   dashboard
---------------------------------------------------------------- */

function Dashboard() {
  const [view, setView] = useState("about");
  const [filter, setFilter] = useState("branding");
  const [sort, setSort] = useState("recent");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(null);
  const [article, setArticle] = useState(null);
  const [board, setBoard] = useState(false);
  const [profile, setProfile] = useState(
    () => !window.matchMedia("(max-width: 1080px)").matches
  );
  const [railPinned, setRailPinned] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [short, setShort] = useState(false);
  const [dial, setDial] = useState(false);
  const [menu, setMenu] = useState(false);
  const [leaving, setLeaving] = useState(null);
  const hubRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [mine, setMine] = useState(new Set());

  /* tablets get the icon rail automatically */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1080px)");
    const mh = window.matchMedia("(max-height: 700px)");
    const sync = () => {
      const isNarrow = mq.matches;
      setNarrow(isNarrow);
      setShort(mh.matches);
      if (isNarrow) setProfile(false);
    };
    sync();
    mq.addEventListener("change", sync);
    mh.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      mh.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    loadNotes().then((n) => alive && setNotes(n));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (board) setBoard(false);
      else if (profile) setProfile(false);
      else if (article) setArticle(null);
      else setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [board, profile, article]);

  const sidePanel = profile;
  const railCollapsed = narrow || (railPinned === null ? sidePanel : railPinned);

  const leaveDial = (go) => {
    const hub = hubRef.current;
    if (!hub) {
      go();
      setDial(false);
      return;
    }
    const r = hub.getBoundingClientRect();
    const bar = window.innerWidth <= 760 ? 78 : 84;
    const tx = 14 + 29 - (r.left + r.width / 2);
    const ty = window.innerHeight - bar / 2 - (r.top + r.height / 2);
    setLeaving({ tx, ty, k: 58 / r.width });
    window.setTimeout(() => {
      go();
      setDial(false);
      setLeaving(null);
    }, 480);
  };

  const q = query.trim().toLowerCase();
  const visible = projects
    .filter((p) => {
      if (filter !== "all" && !p.disciplines.includes(filter)) return false;
      if (!q) return true;
      return (
        p.client.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.disciplines.join(" ").includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "field")
        return (
          a.disciplines[0].localeCompare(b.disciplines[0]) ||
          a.title.localeCompare(b.title)
        );
      return (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title);
    });

  const workHeadings = {
    branding: [
      "Branding",
      "Identity systems for hospitality, food and public programmes, built to survive bad printing and small screens.",
    ],
    web: [
      "Websites",
      "Marketing sites and product surfaces, structured before they're styled.",
    ],
    tool: [
      "Tools",
      "Products people come back to: payments, wallets, research instruments.",
    ],
    game: [
      "Games",
      "Playable worlds, on screens and inside rooms.",
    ],
    all: [
      "All work",
      "Brand identity, digital product, games and the occasional room, from a studio of one in Cuttack.",
    ],
  };

  const heading = {
    work: workHeadings[filter],
    writing: ["Writing", "Short fiction and notes, published as they're finished."],
    about: ["About", "The studio, and what the work has in common."],
  }[view];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..600;1,14..32,300..500&display=swap');

        /* chrome doesn't select like a document; prose still does */
        .bl-stage { -webkit-user-select:none; user-select:none; }
        .bl-stage ::selection { background: rgba(255,255,255,0.24); color:#FFFFFF; }
        .bl-board ::selection { background: rgba(20,22,26,0.22); color:#16181C; }
        .bl-me-statement, .bl-entry-note, .bl-road-note, .bl-road-pill, .bl-read-copy, .bl-readout p, .bl-cv-note,
        .bl-detail p, .bl-chapter p, .bl-profile-note,
        input, textarea {
          -webkit-user-select:text; user-select:text;
        }

        .bl-stage {
          position: relative;
          height: 100dvh;
          overflow: hidden;
          padding: 12px;
          gap: 6px;
          box-sizing: border-box;
          display: flex;
          background: linear-gradient(180deg, #2D2D2D 0%, #2D2D2D 28%, #C4E1D6 100%);
        }
        /* collapsed: icons only, everything else folds away */
        .bl-rail[data-collapsed="true"] { width:70px; padding:0 11px 14px; }
        .bl-rail[data-collapsed="true"] .bl-brand-name,
        .bl-rail[data-collapsed="true"] .bl-widget { display:none; }
        .bl-rail[data-collapsed="true"] .bl-brand {
          flex-direction:column; justify-content:center; gap:14px;
          padding:10px 0 0; margin-bottom:0;
        }
        .bl-rail[data-collapsed="true"] .bl-rail-toggle { transform: rotate(180deg); }
        .bl-rail[data-collapsed="true"] .bl-rail-compact { display:flex; }

        .bl-rail-toggle {
          display:flex; align-items:center; justify-content:center;
          margin-left:auto; width:24px; height:24px; border-radius:999px;
          border:none; background:rgba(255,255,255,0.06); color:${t.fg3};
          cursor:pointer; transition: background 160ms ease, color 160ms ease;
        }
        .bl-rail-toggle:hover { background:rgba(255,255,255,0.13); color:${t.fg}; }
        .bl-rail[data-collapsed="true"] .bl-rail-toggle {
          position:static; margin:0; transform: rotate(180deg);
        }

        .bl-rail-compact {
          display:none; align-items:center; justify-content:center;
          width:44px; height:44px; margin:auto auto 4px; border-radius:16px;
          border:none; cursor:pointer; color:${t.fg2};
          background: linear-gradient(157deg, #8C7365 0%, #5A483F 55%, #40322B 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .bl-stage *::-webkit-scrollbar { width:8px; height:8px; }
        .bl-stage *::-webkit-scrollbar-track { background:transparent; }
        .bl-stage *::-webkit-scrollbar-thumb {
          background:rgba(255,255,255,0.13); border-radius:999px;
          border:2px solid transparent; background-clip:content-box;
        }
        .bl-stage *::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.22); background-clip:content-box; }
        .bl-stage * { scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.16) transparent; }
        .bl-board *::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.16); background-clip:content-box; }
        .bl-board * { scrollbar-color:rgba(0,0,0,0.2) transparent; }

        /* the rail steps out of the way while a case study is open */
        .bl-stage[data-case="true"] .bl-rail {
          margin-left:-250px; opacity:0; pointer-events:none;
        }

        .bl-rail {
          width: 236px;
          transition: width 380ms cubic-bezier(.22,.72,.24,1),
                      padding 380ms cubic-bezier(.22,.72,.24,1),
                      margin-left 380ms cubic-bezier(.22,.72,.24,1),
                      opacity 240ms ease;
          flex-shrink: 0;
          position: relative;
          background: ${t.rail};
          border-radius: 36px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 14px 14px 14px;
        }
        .bl-brand {
          display:flex; align-items:center; gap:10px; padding: 6px 4px 0; margin-bottom:0;
        }
        /* honeycomb per group: rows of 3 then 2, a label under every disc */
        .bl-hex-wrap {
          flex:1; display:flex; flex-direction:column; justify-content:space-evenly;
          gap:0; padding-bottom:0;
        }
        .bl-hex-group { display:flex; flex-direction:column; align-items:center; width:100%; }
        .bl-hex-heading {
          align-self:stretch; margin:0 0 28px; padding:0 4px;
          font-family:${t.sans}; font-size:11px; font-weight:500; letter-spacing:0.14em;
          text-transform:uppercase; color:rgba(255,255,255,0.72);
        }
        .bl-hex-row { display:flex; gap:9px; justify-content:center; }

        /* stacked group: one per row, label under the disc as everywhere else */
        .bl-hex-group[data-stacked="true"] .bl-hex-row + .bl-hex-row { margin-top:14px; }
        .bl-hex-row + .bl-hex-row { margin-top:11px; }

        .bl-hex-btn {
          display:flex; flex-direction:column; align-items:center; gap:7px;
          width:57px; padding:0; border:none; background:transparent; cursor:pointer;
        }
        /* solid black, nothing lit */
        .bl-hex-disc {
          display:flex; align-items:center; justify-content:center;
          width:49px; height:49px; border-radius:999px;
          background:#15181D; border:none;
          transition: background 200ms ease, transform 200ms ease;
        }
        .bl-hex-btn:hover .bl-hex-disc { transform: translateY(-2px); background:#1C2027; }
        .bl-hex-btn[data-on="true"] .bl-hex-disc { background:#262B33; }

        /* filled metal glyph, standing proud of the face */
        .bl-glyph { display:block; }
        .bl-hex-disc svg {
          filter:
            drop-shadow(0 -0.7px 0 rgba(255,255,255,0.55))
            drop-shadow(0 1.6px 1.2px rgba(0,0,0,0.95));
        }

        .bl-hex-name {
          font-family:${t.sans}; font-size:11.5px; letter-spacing:0;
          color:rgba(255,255,255,0.78); white-space:nowrap; transition: color 160ms ease;
        }
        .bl-hex-btn:hover .bl-hex-name { color:${t.fg}; }
        .bl-hex-btn[data-on="true"] .bl-hex-name { color:#FFFFFF; font-weight:500; }

        /* collapsed: one column, discs only */
        .bl-rail[data-collapsed="true"] .bl-hex-heading,
        .bl-rail[data-collapsed="true"] .bl-hex-name { display:none; }
        .bl-rail[data-collapsed="true"] .bl-hex-row { flex-direction:column; gap:8px; }
        .bl-rail[data-collapsed="true"] .bl-hex-row + .bl-hex-row { margin-top:8px; }
        .bl-rail[data-collapsed="true"] .bl-hex-btn { width:auto; }
        .bl-rail[data-collapsed="true"] .bl-hex-disc { width:42px; height:42px; }
        .bl-rail[data-collapsed="true"] .bl-hex-disc svg { width:16px; height:16px; }

        .bl-main {
          flex:1; min-width:0; position:relative; display:flex; flex-direction:column;
          background:${t.shell};
          border-radius:36px; overflow:hidden;
          container-type: inline-size;
        }

        /* on About the bar floats as glass and the field runs under it */
        .bl-main[data-view="about"] .bl-topbar {
          position:absolute; top:0; left:0; right:0; z-index:6;
          height:86px; border-bottom:none;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.09) 52%, rgba(255,255,255,0) 100%);
          backdrop-filter: blur(20px) saturate(1.12);
          -webkit-backdrop-filter: blur(20px) saturate(1.12);
          -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 46%, rgba(0,0,0,0) 100%);
          mask-image: linear-gradient(180deg, #000 0%, #000 46%, rgba(0,0,0,0) 100%);
        }
        .bl-main[data-view="about"] .bl-search {
          background:#08090B; backdrop-filter:none; -webkit-backdrop-filter:none;
        }
        .bl-main[data-view="about"] .bl-search:focus-within { background:#111317; }
        .bl-main[data-view="about"] .bl-search input { color:rgba(255,255,255,0.94); }
        .bl-main[data-view="about"] .bl-search input::placeholder { color:rgba(255,255,255,0.5); }
        .bl-main[data-view="about"] .bl-search svg { color:rgba(255,255,255,0.55); }
        .bl-main[data-view="about"] .bl-me { padding-top:84px; }

        .bl-topbar {
          height:70px; flex-shrink:0; display:flex; align-items:center; gap:12px;
          padding: 0 12px 0 22px; border-bottom: 1px solid ${t.line};
        }
        .bl-search {
          display:flex; align-items:center; gap:8px; height:36px; width:290px; max-width:45%;
          padding: 0 15px; border-radius:999px; border:none;
          background: rgba(255,255,255,0.055); backdrop-filter: blur(10px);
          transition: background 160ms ease;
        }
        .bl-search:focus-within { background: rgba(255,255,255,0.085); }
        .bl-search input {
          flex:1; min-width:0; background:transparent; border:none; outline:none;
          font-family:${t.sans}; font-size:13px; color:${t.fg};
        }
        .bl-search input::placeholder { color:${t.fg3}; }

        .bl-icon-btn, .bl-ghost {
          display:flex; align-items:center; gap:7px; height:34px; padding:0 14px;
          border-radius:999px; border:none;
          background:rgba(255,255,255,0.055); backdrop-filter: blur(10px);
          font-family:${t.sans}; font-size:12.5px; color:${t.fg2}; cursor:pointer;
          transition: background 160ms ease, color 160ms ease;
        }
        .bl-icon-btn { padding:0; width:34px; justify-content:center; }
        .bl-icon-btn:hover, .bl-ghost:hover { background:rgba(255,255,255,0.1); color:${t.fg}; }

        .bl-scroll { flex:1; min-height:0; overflow-x:hidden; overflow-y:auto; }

        /* bands meet edge to edge, divided by seams that run the full width */
        .bl-band { padding: 0 22px; border-bottom:1px solid ${t.line}; }
        .bl-band-head { padding-top:30px; padding-bottom:26px; }
        .bl-band-filters {
          display:flex; align-items:center; gap:10px; flex-wrap:wrap;
          padding-top:14px; padding-bottom:14px;
        }
        .bl-band-count {
          margin-left:auto; font-family:${t.sans}; font-size:12px; color:${t.fg3};
        }
        .bl-empty {
          padding: 48px 22px; font-family:${t.sans}; font-size:14px; color:${t.fg3};
        }

        .bl-seg {
          position:relative; display:inline-flex; padding:3px; border-radius:999px; border:none;
          background:rgba(255,255,255,0.04); backdrop-filter: blur(10px);
        }
        /* the blurred shapes live in their own layer, text never goes near the filter */
        .bl-seg-goo {
          position:absolute; inset:0; filter:url(#bl-goo); pointer-events:none;
        }
        .bl-seg-thumb {
          position:absolute; top:3px; bottom:3px; background:#FFFFFF; border-radius:999px;
          transition:
            left 380ms cubic-bezier(.5,0,.12,1),
            right 560ms cubic-bezier(.4,0,.15,1);
        }
        .bl-seg button {
          position:relative; z-index:1; flex:1 1 0; min-width:82px;
          border:none; background:transparent; cursor:pointer;
          font-family:${t.sans}; font-size:12.5px; color:${t.fg3};
          padding: 7px 15px; border-radius:999px;
          transition: color 220ms ease;
        }
        .bl-seg button:hover { color:${t.fg2}; }
        .bl-seg button[data-on="true"] { color:#0A0C10; }

        .bl-main[data-view="writing"] .bl-band {
          padding-left:56px; padding-right:56px;
        }
        .bl-main[data-view="writing"] .bl-band-head { border-bottom:none; }
        .bl-pieces {
          display:grid;
          grid-template-columns:minmax(0, 0.92fr) minmax(0, 1.08fr);
          column-gap:48px; row-gap:0; align-items:start;
          padding-top:8px; padding-bottom:28px; border-bottom:none;
        }
        .bl-piece {
          padding:0; border:none; background:transparent; color:${t.fg};
          font:inherit; text-align:left; cursor:pointer; border-radius:0;
        }
        .bl-piece-feature {
          grid-column:1; grid-row:1;
          display:flex; flex-direction:column; gap:22px;
          height:100dvh; min-width:0; padding:0;
        }
        .bl-piece-feature .bl-piece-media {
          flex:1 1 auto; width:100%; height:auto; min-height:0; border-radius:20px;
        }
        .bl-piece-feature .bl-piece-copy {
          flex:none; height:auto; padding:0; justify-content:flex-start; gap:14px;
        }
        .bl-piece-feature .bl-piece-title { font-size:28px; -webkit-line-clamp:3; }
        .bl-piece-stack {
          grid-column:2; grid-row:1;
          display:flex; flex-direction:column; min-width:0;
        }
        .bl-piece-side {
          display:grid; grid-template-columns:168px minmax(0, 1fr) 36px;
          gap:20px; align-items:stretch; min-width:0; width:100%;
          padding:22px 0;
        }
        .bl-piece-stack .bl-piece-side:first-child { padding-top:0; }
        .bl-piece-side + .bl-piece-side {
          border-top:1px solid rgba(255,255,255,0.16);
        }
        .bl-piece-side .bl-piece-media {
          height:auto; min-height:0; align-self:stretch; border-radius:12px;
        }
        .bl-piece-side .bl-piece-copy { height:auto; align-self:stretch; padding:0; }
        .bl-piece-side .bl-piece-arrow { align-self:center; }
        .bl-piece-media {
          min-height:132px; height:100%; border-radius:12px; overflow:hidden; background:#1a1a1a;
        }
        .bl-piece-media img { width:100%; height:100%; object-fit:cover; display:block; }
        .bl-piece-fallback { display:block; width:100%; height:100%; background:#dedede; }
        .bl-piece-copy {
          display:flex; flex-direction:column; justify-content:space-between;
          min-width:0; height:100%; padding:10px 0;
          font-family:"Poppins", ${t.sans};
        }
        .bl-piece-meta {
          display:flex; align-items:baseline; gap:16px;
          font-family:"Poppins", ${t.sans}; font-size:11px; letter-spacing:0.02em; color:${t.fg3};
        }
        .bl-piece-meta span:last-child {
          font-size:10px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:${t.fg2};
        }
        .bl-piece-title {
          margin-top:0; font-family:"Poppins", ${t.sans}; font-size:20px;
          font-weight:500; line-height:1.2; letter-spacing:-0.03em; color:${t.fg};
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .bl-piece-foot {
          margin-top:0; padding-top:0;
          display:flex; align-items:center; justify-content:space-between; gap:16px;
        }
        .bl-piece-tag {
          display:inline-flex; align-items:center; min-height:32px; padding:0 12px;
          border:1px solid rgba(255,255,255,0.28); border-radius:999px; background:transparent;
          font-family:"Poppins", ${t.sans}; font-size:12px; color:${t.fg};
        }
        .bl-piece-arrow {
          display:inline-flex; align-items:center; justify-content:center;
          width:32px; height:32px; margin-left:auto; border-radius:999px;
          border:1px solid rgba(255,255,255,0.28); color:${t.fg}; background:transparent;
          transition:background 160ms ease, color 160ms ease, border-color 160ms ease;
        }
        .bl-piece:hover .bl-piece-arrow { background:#fff; color:#111; border-color:#fff; }
        .bl-piece:focus-visible { outline:2px solid #fff; outline-offset:4px; }
        .bl-pieces .bl-list-note { grid-column:1 / -1; margin-top:28px; color:${t.fg3}; }
        @container (max-width: 820px) {
          .bl-pieces { grid-template-columns:1fr; row-gap:28px; }
          .bl-piece-feature { height:auto; grid-row:auto; }
          .bl-piece-feature .bl-piece-media { flex:none; height:min(68dvh, 520px); }
          .bl-piece-feature .bl-piece-title { font-size:clamp(22px, 5vw, 28px); }
          .bl-piece-stack { grid-column:1; grid-row:auto; }
          .bl-piece-side { grid-template-columns:minmax(108px, 32%) minmax(0, 1fr) 36px; gap:14px; }
        }
        @media (max-width: 980px) {
          .bl-main[data-view="writing"] .bl-band { padding-left:24px; padding-right:24px; }
          .bl-pieces { grid-template-columns:1fr; row-gap:28px; }
          .bl-piece-feature { grid-column:1; grid-row:auto; height:auto; }
          .bl-piece-feature .bl-piece-media { flex:none; height:min(68dvh, 520px); }
          .bl-piece-feature .bl-piece-title { font-size:22px; }
          .bl-piece-stack { grid-column:1; grid-row:auto; }
          .bl-piece-side { grid-template-columns:120px minmax(0, 1fr) 36px; gap:14px; }
          .bl-piece-title { font-size:17px; }
        }
        @media (max-width: 480px) {
          .bl-main[data-view="writing"] .bl-band { padding-left:16px; padding-right:16px; }
          .bl-piece-side { grid-template-columns:96px minmax(0, 1fr) 36px; gap:12px; }
          .bl-range-label { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); }
          .bl-range-btn { padding-right:6px; }
        }
        .bl-entry {
          display:flex; align-items:flex-start; gap:18px; width:100%;
          padding:16px 0; border-bottom:1px solid ${t.line};
          text-decoration:none; color:inherit;
          transition: opacity 160ms ease;
        }
        button.bl-entry {
          font:inherit; text-align:left; color:inherit; background:transparent;
          border:none; cursor:pointer;
        }
        .bl-entry:hover { opacity:0.72; }
        .bl-entry-year {
          flex-shrink:0; width:52px; padding-top:2px;
          font-family:${t.sans}; font-size:11px; letter-spacing:0.1em; color:${t.fg3};
        }
        .bl-entry-body { display:flex; flex-direction:column; gap:4px; flex:1; min-width:0; }
        .bl-entry-title { font-family:${t.serif}; font-size:20px; font-weight:400; letter-spacing:-0.025em; color:${t.fg}; }
        .bl-entry-note {
          font-family:${t.sans}; font-size:13px; line-height:1.55;
          color:${t.fg2}; max-width:58ch;
        }
        .bl-entry-go {
          flex-shrink:0; display:flex; align-items:center; gap:6px; padding-top:4px;
          font-family:${t.sans}; font-size:11.5px; color:${t.fg3};
        }
        .bl-list-note {
          margin:22px 0 0; font-family:${t.sans}; font-size:13px; color:${t.fg3};
        }

        /* About: the reference's colour field, pulled well down in saturation */
        .bl-me {
          position:relative; display:flex; flex-direction:column; gap:10px;
          padding:14px; min-height:100%; overflow:hidden;
        }
        /* the reference's own background: sampled to a 48px image and
           stretched, so every band lands where it does in the original */
        .bl-me-field {
          position:absolute; inset:-6%; pointer-events:none;
          background-image: url("data:image/png;base64,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");
          background-size: 100% 100%;
          filter: blur(34px) saturate(0.81);
        }
        /* grain sits above the blur, so it stays sharp while the field stays soft */
        .bl-me-grain {
          position:absolute; inset:0; pointer-events:none;
          background-image:${"${grain}"};
          background-size:140px 140px;
          opacity:0.42; mix-blend-mode:overlay;
        }

        .bl-me > *:not(.bl-me-field):not(.bl-me-grain) { position:relative; }

        .bl-me-statement {
          flex:0 1 auto; padding:26px; border-radius:22px;
          border:1px solid rgba(12,12,10,0.28);
        }
        .bl-me-statement p {
          margin:0; max-width:30ch;
          font-family:${t.sans}; font-size:clamp(17px, 1.7vw, 23px);
          font-weight:400; line-height:1.3; letter-spacing:-0.02em;
          color:rgba(12,12,10,0.9);
        }
        .bl-me-statement strong { font-weight:500; color:#0A0A08; }

        .bl-me-foot { display:flex; gap:10px; margin-top:auto; }

        .bl-road {
          border:1px solid rgba(12,12,10,0.28);
          border-radius:22px;
          padding:20px 16px 18px;
        }
        .bl-road-kicker {
          margin:0 8px 16px;
          font-family:${t.sans}; font-size:10px; font-weight:500;
          letter-spacing:0.16em; text-transform:uppercase;
          color:rgba(12,12,10,0.55);
        }
        .bl-road-rows { display:flex; flex-direction:column; gap:26px; }
        .bl-road-row {
          display:grid;
          grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
          grid-template-rows: auto 16px auto;
        }
        .bl-road-stop {
          display:grid; grid-template-rows:subgrid; grid-row:1 / -1;
          min-width:0; padding:0 8px; text-align:center; justify-items:center;
        }
        .bl-road-pill {
          align-self:end; margin-bottom:10px; max-width:100%;
          padding:6px 12px; border-radius:999px;
          border:1px solid rgba(12,12,10,0.55); background:transparent;
          font-family:${t.sans}; font-size:12px; font-weight:500; line-height:1.3;
          letter-spacing:-0.01em; color:rgba(12,12,10,0.9);
          text-wrap:balance;
        }
        .bl-road-stop[data-latest="true"] .bl-road-pill {
          background:rgba(12,12,10,0.9); border-color:transparent; color:#F6F3EA;
        }
        .bl-road-track {
          position:relative; align-self:stretch; justify-self:stretch;
          height:16px; margin:0 -8px;
          display:flex; align-items:center; justify-content:center;
        }
        .bl-road-track::before {
          content:""; position:absolute; left:0; right:0; top:50%; height:1.5px;
          background:rgba(12,12,10,0.72);
        }
        .bl-road-dot {
          position:relative; z-index:1; width:9px; height:9px; border-radius:999px;
          background:#14120C;
        }
        .bl-road-copy {
          align-self:start;
          display:flex; flex-direction:column; gap:4px; align-items:center;
          margin-top:10px; max-width:24ch;
        }
        .bl-road-year {
          font-family:${t.sans}; font-size:10px; font-weight:500;
          letter-spacing:0.14em; text-transform:uppercase;
          color:rgba(12,12,10,0.5);
        }
        .bl-road-note {
          font-family:${t.sans}; font-size:12px; line-height:1.45;
          color:rgba(12,12,10,0.72);
        }
        .bl-me-foot-name, .bl-me-foot-link {
          display:flex; align-items:center; justify-content:center;
          height:46px; border-radius:16px;
          border:1px solid rgba(12,12,10,0.3);
          font-family:${t.sans}; font-size:9.5px; letter-spacing:0.16em;
          text-transform:uppercase; color:rgba(12,12,10,0.72);
        }
        .bl-me-foot-name { flex:1; }
        .bl-me-foot-link { width:70px; cursor:pointer; transition: background 180ms ease; }
        .bl-me-foot-link:hover { background:rgba(12,12,10,0.08); }

        .bl-chapters { margin-top:34px; padding-top:22px; border-top:1px solid ${t.line}; }
        .bl-chapter { margin-bottom:22px; }
        .bl-chapter-name {
          font-family:${t.sans}; font-size:10.5px; letter-spacing:0.16em;
          text-transform:uppercase; color:${t.fg3}; margin-bottom:8px;
        }
        .bl-chapter p {
          margin:0; font-family:${t.sans}; font-size:14.5px; line-height:1.62;
          color:${t.fg2}; max-width:56ch;
        }

        /* Card grid: 4× col, 12px gap, 22px pane padding. Column width is fluid;
           each card is width 100% × aspect-ratio 3/4 (e.g. ~393×524 at 1920). */
        .bl-grid {
          display:grid; gap:12px; padding:22px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        /* Breakpoints are pane width (.bl-main), so a open range panel drops 4→3 cols. */
        @container (max-width: 1200px) {
          .bl-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @container (max-width: 960px) {
          .bl-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @container (max-width: 560px) {
          .bl-grid { grid-template-columns: minmax(0, 1fr); }
        }
        @container (max-width: 620px) {
          .bl-band, .bl-topbar { padding-left:14px; padding-right:14px; }
          .bl-grid { padding:12px 14px 18px; }
          .bl-band-head { padding-top:22px; padding-bottom:20px; }
        }

        /* Full-bleed media; fixed geometry: 3/4, r52, foot 24/22/22, arrow 46 @ 18/18 */
        .bl-card {
          position:relative; width:100%; min-width:0; aspect-ratio: 3 / 4; overflow:hidden;
          padding:0; border-radius:52px; cursor:pointer; font:inherit;
          border:none;
          transition: transform 240ms cubic-bezier(.22,.72,.24,1);
        }
        .bl-card:hover { transform: translateY(-4px); }
        /* Condensed mode: keep 3 cards per row and wrap overflow to next line. */
        .bl-main[data-cards-condensed="true"] .bl-grid {
          display:grid;
          grid-template-columns:repeat(3, minmax(0, 1fr));
          gap:12px;
          overflow:visible;
          padding-bottom:6px;
        }

        .bl-card-media {
          position:absolute; inset:0; display:block; border-radius:inherit;
          transition: transform 420ms cubic-bezier(.22,.72,.24,1);
        }
        .bl-card-photo {
          position:absolute; inset:0; width:100%; height:100%;
          object-fit:cover; object-position:center; display:block;
        }
        .bl-card:hover .bl-card-media { transform: scale(1.05); }

        .bl-card-grain {
          position:absolute; inset:0; background-image:${"${grain}"};
          opacity:0.16; mix-blend-mode:overlay;
        }
        /* dark at the top for the mark, dark at the bottom for the type */
        .bl-card-scrim {
          position:absolute; inset:0; pointer-events:none;
          background: linear-gradient(180deg,
            rgba(0,0,0,0.34) 0%, rgba(0,0,0,0.04) 26%,
            rgba(0,0,0,0.4) 62%, rgba(0,0,0,0.82) 100%);
        }

        .bl-card-foot {
          position:absolute; left:24px; right:22px; bottom:22px;
          display:flex; flex-direction:column; align-items:flex-start; text-align:left;
        }
        .bl-card-chips { display:flex; gap:5px; flex-wrap:wrap; flex:1; min-width:0; }
        .bl-card-chips span {
          font-family:${t.sans}; font-size:10px; letter-spacing:0.08em;
          text-transform:uppercase; color:rgba(255,255,255,0.92);
          background: linear-gradient(150deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08));
          backdrop-filter: blur(12px) saturate(1.3);
          -webkit-backdrop-filter: blur(12px) saturate(1.3);
          border:1px solid rgba(255,255,255,0.22);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
          border-radius:999px; padding:3.5px 10px; white-space:nowrap;
        }
        .bl-card-name {
          font-family:${t.serif}; font-size:22px; font-weight:400; line-height:1.12; letter-spacing:-0.03em; color:#FFFFFF;
        }
        .bl-card-client {
          font-family:${t.sans}; font-size:12.5px; color:rgba(255,255,255,0.62);
          margin-top:3px; overflow:hidden; text-overflow:ellipsis;
          white-space:nowrap; max-width:100%;
        }
        .bl-card-row {
          display:flex; align-items:center; justify-content:space-between;
          gap:12px; width:100%; margin-top:14px;
        }
        /* brushed silver: a gradient that turns, a bright top lip, a dark base */
        .bl-card-go {
          --lamp: 0;
          position:absolute; top:18px; right:18px; z-index:2; overflow:hidden;
          display:flex; align-items:center; justify-content:center;
          width:46px; height:46px; border-radius:999px; flex-shrink:0;
          color:#15181D;
          background:
            linear-gradient(148deg,
              #FDFCFA 0%, #E9E6E0 22%, #B7B4AE 48%,
              #DEDBD5 66%, #FCFBF8 86%, #C2BFB8 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.95),
            inset 0 -1.5px 1px rgba(30,26,18,0.4),
            0 6px 14px -8px rgba(0,0,0,0.8),
            0 4px 10px -4px rgba(232,207,98, calc(var(--lamp, 0) * 0.3));
          transition: transform 220ms cubic-bezier(.22,.72,.24,1);
        }
        /* the specular sweep that makes it read as metal */
        .bl-card-go::before {
          content:""; position:absolute; inset:-40%;
          background: linear-gradient(104deg,
            transparent 32%, rgba(255,255,255,0.85) 47%,
            rgba(255,255,255,0.2) 54%, transparent 66%);
          transition: transform 520ms cubic-bezier(.22,.72,.24,1);
        }
        /* the glyph is cut into the face: dark stroke, lit lower lip */
        /* a tilted triangle, cut into the face */
        .bl-card-go svg {
          position:relative; z-index:2; transform: rotate(44deg);
          filter:
            drop-shadow(0 1px 0 rgba(255,255,255,0.92))
            drop-shadow(0 -0.5px 0.5px rgba(0,0,0,0.55))
            drop-shadow(0 0 2px rgba(232,207,98, calc(var(--lamp, 0) * 0.9)));
        }
        /* the groove fills with light; the lip shadows stay so it keeps its depth */
        .bl-card-go svg polygon {
          fill: color-mix(in srgb, #E8CF62 calc(var(--lamp, 0) * 100%), #23201A);
          stroke: color-mix(in srgb, #E8CF62 calc(var(--lamp, 0) * 100%), #23201A);
          stroke-width:4.6; stroke-linejoin:round;
        }

        .bl-card:hover .bl-card-go {
          transform: scale(1.08);
          animation: bl-flicker 4.2s ease-in-out infinite;
        }
        @keyframes bl-flicker {
          0%   { --lamp: 0.4; }
          14%  { --lamp: 0.9; }
          22%  { --lamp: 0.55; }
          36%  { --lamp: 1; }
          47%  { --lamp: 0.62; }
          58%  { --lamp: 0.85; }
          71%  { --lamp: 0.45; }
          84%  { --lamp: 0.95; }
          100% { --lamp: 0.4; }
        }


        .bl-detail {
          position:absolute; inset:0; z-index:5;
          background-color:#e6e2dd; color:#161616;
          display:flex; flex-direction:column;
          transition: transform 340ms cubic-bezier(.22,.72,.24,1);
        }
        .bl-detail:not(.bl-article),
        .bl-detail:not(.bl-article) * {
          font-family:"Poppins", ${t.sans} !important;
        }
        .bl-detail[data-open="false"] { transform: translateX(101%); pointer-events:none; }
        /* two columns: the case study reads on the left, the facts and the
           index stay put on the right */
        .bl-case-wrap {
          display:grid; grid-template-columns: minmax(0,1fr) 268px;
          gap:48px; align-items:start;
          padding:28px 36px 64px; max-width:1320px; margin:0 auto;
        }
        .bl-case-main { min-width:0; }
        .bl-case-main > * + * { margin-top:20px; }
        .bl-case-main .bl-case-media { margin:36px 0 12px; }
        .bl-case-main h2 {
          margin:28px 0 0; font-family:${t.serif}; font-size:42px; font-weight:400;
          line-height:1.04; letter-spacing:-0.035em; color:${t.fg};
        }
        .bl-case-main h3 {
          font-family:${t.serif}; font-size:29px; font-weight:400; line-height:1.14;
          letter-spacing:-0.03em; color:${t.fg}; max-width:34ch;
        }
        .bl-case-main p {
          font-family:${t.sans}; font-size:15px; line-height:1.8;
          color:rgba(255,255,255,0.58); max-width:74ch;
        }
        .bl-case-media { position:relative; width:100%; overflow:hidden; }
        .bl-case-media img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .bl-case-grain {
          position:absolute; inset:0; background-image:${"${grain}"};
          opacity:0.16; mix-blend-mode:overlay;
        }
        .bl-case-blocked {
          position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
          font-family:${t.sans}; font-size:10.5px; letter-spacing:0.14em;
          text-transform:uppercase; color:rgba(255,255,255,0.5);
        }
        .bl-case-by {
          margin-top:12px !important; font-family:${t.sans}; font-size:11.5px;
          letter-spacing:0.12em; text-transform:uppercase; color:${t.fg3};
        }
        .bl-case-by strong { color:${t.fg2}; font-weight:500; }
        .bl-case-tagline {
          margin-top:16px !important; font-family:${t.sans}; font-size:13px;
          color:${t.fg2} !important; max-width:40ch !important;
        }
        .bl-case-lede {
          margin-top:22px !important; font-family:${t.serif} !important; font-size:18px !important;
          font-weight:300; line-height:1.5 !important; letter-spacing:-0.012em;
          color:${t.fg} !important; max-width:50ch !important;
        }

        /* right column */
        /* other case studies, at the foot of the read */
        .bl-more-work {
          margin-top:64px !important; padding-top:22px;
          border-top:1px solid rgba(255,255,255,0.14);
        }
        .bl-more-head {
          font-family:${t.sans}; font-size:10.5px; letter-spacing:0.18em;
          text-transform:uppercase; color:rgba(255,255,255,0.5); margin-bottom:16px;
        }
        .bl-more-grid {
          display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:10px;
        }
        .bl-more-card {
          display:flex; align-items:center; gap:14px; padding:12px;
          border-radius:20px; cursor:pointer; text-align:left;
          border:1px solid rgba(255,255,255,0.08);
          background: linear-gradient(168deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
          color:${t.fg3};
          transition: background 200ms ease, border-color 200ms ease, transform 200ms ease;
        }
        .bl-more-card:hover {
          transform: translateY(-2px); border-color:rgba(255,255,255,0.18);
          background: linear-gradient(168deg, rgba(255,255,255,0.1), rgba(255,255,255,0.035));
          color:${t.fg};
        }
        .bl-more-thumb {
          flex-shrink:0; width:58px; height:72px; border-radius:14px;
          box-shadow: 0 8px 16px -10px rgba(0,0,0,0.9);
        }
        .bl-more-body { display:grid; gap:3px; flex:1; min-width:0; }
        .bl-more-title {
          font-family:${t.serif}; font-size:19px; font-weight:400; letter-spacing:-0.025em;
          color:${t.fg}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }
        .bl-more-client {
          font-family:${t.sans}; font-size:11.5px; color:rgba(255,255,255,0.62);
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }
        .bl-more-tags {
          font-family:${t.sans}; font-size:9.5px; letter-spacing:0.12em;
          text-transform:uppercase; color:rgba(255,255,255,0.42);
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }
        @container (max-width: 760px) {
          .bl-more-grid { grid-template-columns: minmax(0,1fr); }
        }

        .bl-case-side {
          position:sticky; top:20px; display:flex; flex-direction:column; gap:18px;
          max-height:calc(100vh - 116px); min-height:0;
        }
        .bl-case-live {
          display:flex; align-items:center; justify-content:space-between; gap:10px;
          flex-shrink:0; height:42px; padding:0 8px 0 16px; border-radius:999px; text-decoration:none;
          border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.05);
          font-family:${t.sans}; font-size:12.5px; color:${t.fg};
          transition: background 180ms ease, border-color 180ms ease;
        }
        a.bl-case-live:hover { background:rgba(255,255,255,0.11); border-color:rgba(255,255,255,0.24); }
        .bl-case-live span { display:flex; align-items:center; gap:9px; }
        .bl-case-live i {
          width:7px; height:7px; border-radius:999px; background:#7FB08A;
          box-shadow:0 0 0 3px rgba(127,176,138,0.18);
        }
        .bl-case-live[data-empty="true"] { color:rgba(255,255,255,0.62); }
        .bl-case-live[data-empty="true"] i { background:${t.fg4}; box-shadow:none; }

        /* facts as a two-up grid, so the column stays short */
        .bl-case-facts {
          margin:0; display:grid; grid-template-columns: repeat(2, minmax(0,1fr));
          gap:13px 18px; flex-shrink:0;
        }
        .bl-case-facts > div { display:grid; gap:3px; min-width:0; }
        .bl-case-facts > div:nth-last-child(1):nth-child(odd) { grid-column:1 / -1; }
        .bl-case-facts dt {
          font-family:${t.sans}; font-size:9.5px; letter-spacing:0.14em;
          text-transform:uppercase; color:rgba(255,255,255,0.5);
        }
        .bl-case-facts dd {
          margin:0; font-family:${t.sans}; font-size:12.5px; line-height:1.35;
          color:rgba(255,255,255,0.95);
        }

        .bl-case-index {
          display:flex; flex-direction:column; gap:1px;
          flex:1 1 auto; min-height:140px;
          padding-top:15px; border-top:1px solid rgba(255,255,255,0.14);
          overflow-y:auto; overscroll-behavior:contain;
        }
        .bl-case-index-head {
          flex-shrink:0; font-family:${t.sans}; font-size:9.5px; letter-spacing:0.14em;
          text-transform:uppercase; color:rgba(255,255,255,0.5); margin-bottom:8px;
        }
        .bl-case-index button {
          position:relative; display:flex; align-items:baseline; gap:9px; flex-shrink:0;
          padding:6px 0 6px 12px; border:none; background:transparent; cursor:pointer;
          text-align:left; font-family:${t.sans}; font-size:12px;
          color:rgba(255,255,255,0.62); transition: color 200ms ease;
        }
        .bl-case-index button span {
          font-size:9.5px; letter-spacing:0.08em; color:rgba(255,255,255,0.4);
          transition: color 200ms ease;
        }
        .bl-case-index button::before {
          content:""; position:absolute; left:0; top:8px; bottom:8px; width:1.5px;
          border-radius:2px; background:transparent; transition: background 200ms ease;
        }
        .bl-case-index button:hover { color:${t.fg2}; }
        .bl-case-index button[data-on="true"] { color:${t.fg}; }
        .bl-case-index button[data-on="true"] span { color:${t.fg2}; }
        .bl-case-index button[data-on="true"]::before { background:#FFFFFF; }

        @container (max-width: 980px) {
          .bl-case-wrap { grid-template-columns: minmax(0,1fr); gap:30px; padding:22px 22px 44px; }
          .bl-case-side { position:static; }
          .bl-case-facts { grid-template-columns: repeat(2, minmax(0,1fr)); gap:16px 28px; }
        }

        .bl-case-bar {
          position:relative; display:flex; align-items:center; gap:14px;
          height:62px; flex-shrink:0; padding: 0 26px 0 36px;
          border-bottom:1px solid transparent; transition: border-color 200ms ease;
        }
        .bl-case-bar[data-scrolled="true"] { border-bottom-color:${t.line}; }
        .bl-case-bar-title {
          position:absolute; left:50%; transform:translateX(-50%);
          font-family:${t.sans}; font-size:12px; letter-spacing:0.14em;
          text-transform:uppercase; color:${t.fg3};
        }
        .bl-case-bar .bl-icon-btn { margin-left:auto; }
        .bl-case-scroll { flex:1; overflow-y:auto; }

        /* inside an article: the same editorial page, on white */
        .bl-article { z-index:6; background:#fff; color:#161616; }
        .bl-article .bl-read-bar { border-bottom-color:rgba(0,0,0,0.12); }
        .bl-article .bl-read-nav { color:rgba(22,22,22,0.62); }
        .bl-article .bl-read-nav:hover,
        .bl-article .bl-read-nav[data-on="true"] { color:#111; }
        .bl-article .bl-read-nav:focus-visible { outline-color:#111; }
        .bl-article .bl-read-comma { color:rgba(22,22,22,0.38); }
        .bl-article .bl-read-copy h1 { color:#111; }
        .bl-article .bl-read-kicker { color:rgba(22,22,22,0.48); }
        .bl-article .bl-read-fact { color:#161616; }
        .bl-article .bl-read-desc p { color:rgba(22,22,22,0.78); }
        .bl-article .bl-read-shot { background:#f3f3f3; }
        .bl-article .bl-read-shot-fallback { color:rgba(22,22,22,0.45); }
        .bl-read-bar {
          display:grid; grid-template-columns:1fr auto 1fr; align-items:center;
          gap:12px 16px; min-height:68px; padding:0 28px; flex-shrink:0;
          border-bottom:1px solid rgba(255,255,255,0.16);
        }
        .bl-read-back { justify-self:start; }
        .bl-read-contact { justify-self:end; }
        .bl-read-cats {
          display:flex; align-items:center; justify-content:center; min-width:0;
        }
        .bl-read-cat { display:inline-flex; align-items:center; }
        .bl-read-comma {
          margin:0 8px 0 0; font-family:${t.sans}; font-size:14px;
          color:rgba(255,255,255,0.42);
        }
        .bl-read-nav {
          display:inline-flex; align-items:center; gap:7px;
          min-height:44px; padding:8px 2px; border:none; background:transparent;
          cursor:pointer; font-family:${t.sans}; font-size:14px; font-weight:400;
          letter-spacing:-0.01em; color:rgba(255,255,255,0.62);
          transition: color 160ms ease;
        }
        .bl-read-nav:hover { color:#fff; }
        .bl-read-nav[data-on="true"] { color:#fff; font-weight:600; }
        .bl-read-nav:focus-visible {
          outline:2px solid rgba(255,255,255,0.85); outline-offset:3px; border-radius:4px;
        }
        .bl-read-scroll { flex:1; overflow-y:auto; }
        .bl-read { padding:52px 0 72px; }
        .bl-read-copy { width:50%; margin:0 auto; }
        .bl-read-copy h1, .bl-read-titlecol h1 {
          margin:0; font-family:${t.sans}; font-size:clamp(36px, 4vw, 64px);
          font-weight:500; line-height:1.02; letter-spacing:-0.045em; color:#fff;
          text-wrap:balance;
        }
        /* title on the left, facts and description on the right, same width as the pictures */
        .bl-read-spread {
          width:80%; margin:0 auto;
          display:grid; grid-template-columns:minmax(0, 1fr) minmax(0, 1fr);
          grid-template-rows:auto auto; column-gap:56px; align-items:start;
        }
        .bl-read-titlecol {
          grid-column:1; grid-row:1 / span 2;
          display:grid; grid-template-rows:subgrid;
        }
        .bl-read-aside { grid-column:2; grid-row:2; }
        .bl-read-spread .bl-read-meta { margin-top:0; }
        .bl-read-follow {
          width:min(640px, 52%); margin:40px auto 0;
          text-align:left;
        }
        .bl-read-desc { margin-top:28px; }
        .bl-read-desc .bl-read-kicker { margin-top:0; }
        .bl-read-meta {
          display:grid; grid-template-columns:1fr 1fr; gap:28px 32px;
          margin-top:36px;
        }
        .bl-read-kicker {
          margin:18px 0 0; font-family:${t.sans}; font-size:12px; font-weight:400;
          color:rgba(255,255,255,0.46);
        }
        .bl-read-meta > div > .bl-read-kicker:first-child,
        .bl-read-meta > div > div:first-child .bl-read-kicker { margin-top:0; }
        .bl-visit {
          display:inline-flex; align-items:center; gap:6px;
          min-height:44px; margin:0 0 22px; padding:0; border:none;
          background:transparent; cursor:pointer; text-decoration:none; white-space:nowrap;
          font-family:${t.sans}; font-size:13px; letter-spacing:-0.01em; color:#fff;
        }
        .bl-visit:hover { text-decoration:underline; text-underline-offset:3px; }
        .bl-visit:disabled { color:rgba(255,255,255,0.72); cursor:default; text-decoration:none; }
        .bl-visit:focus-visible { outline:2px solid #fff; outline-offset:4px; border-radius:4px; }
        .bl-case-read {
          --case:min(1120px, calc(100% - 96px));
          --case-gap:64px;
          padding:72px 0 180px;
        }
        .bl-case-bar {
          position:absolute; top:0; left:0; right:0; z-index:6;
          display:flex; align-items:center; justify-content:space-between;
          height:auto; padding:12px 28px; pointer-events:none;
          border-bottom:none;
        }
        .bl-case-metal {
          position:relative; overflow:hidden; pointer-events:auto;
          display:inline-flex; align-items:center; justify-content:center;
          border:1px solid rgba(255,255,255,0.09); cursor:pointer;
          color:rgba(16,8,6,0.88);
          font-family:${t.sans}; font-size:14px; font-weight:500;
          letter-spacing:-0.01em; line-height:1;
          text-shadow:0 -1px 1px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.38);
          background:
            linear-gradient(102deg, transparent 30%, rgba(255,255,255,0.16) 46%, rgba(255,255,255,0.04) 54%, transparent 70%),
            linear-gradient(157deg, #8C7365 0%, #6A5349 26%, #40322B 58%, #4C3C34 82%, #7B6357 100%);
          background-size:170% 170%, auto;
          background-position:center, center;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.24),
            inset 0 -1px 0 rgba(0,0,0,0.55),
            0 10px 24px -14px rgba(0,0,0,0.9);
          transition:filter 180ms ease;
        }
        .bl-case-metal > * {
          position:relative;
          filter:drop-shadow(0 -1px 0.5px rgba(0,0,0,0.55)) drop-shadow(0 1px 0 rgba(255,255,255,0.4));
        }
        .bl-case-metal:hover { filter:brightness(1.1); }
        .bl-case-metal:focus-visible { outline:2px solid #111; outline-offset:3px; }
        .bl-case-back {
          width:44px; height:44px; padding:0; border-radius:999px;
        }
        .bl-case-contact {
          pointer-events:auto; flex:0 0 auto;
        }
        .bl-range-btn.bl-case-contact {
          padding:0 14px 0 4px; gap:8px; overflow:visible;
        }
        .bl-range-btn.bl-case-contact > .bl-case-contact-face {
          position:absolute; inset:0; border-radius:inherit; overflow:hidden; pointer-events:none;
        }
        .bl-case-contact .bl-range-disc { width:38px; height:38px; }
        .bl-heart3d { width:30px; height:30px; display:block; }
        .bl-heart3d canvas { width:100%; height:100%; display:block; pointer-events:none; }
        .bl-float-index {
          position:absolute; right:22px; top:88px; z-index:4;
          width:min(232px, calc(100% - 36px)); max-height:calc(100% - 110px);
          overflow:hidden; display:flex; flex-direction:column; align-items:flex-start;
          padding:12px 14px 10px; border-radius:18px;
          background:rgba(16,16,16,0.78);
          border:1px solid rgba(255,255,255,0.14);
          backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
          box-shadow:0 16px 40px rgba(0,0,0,0.45);
        }
        .bl-float-index-label {
          margin:0 0 6px; font-family:${t.sans}; font-size:10px; font-weight:500;
          letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.42);
        }
        .bl-float-index button {
          display:flex; align-items:baseline; gap:10px; width:100%;
          min-height:32px; padding:3px 0; border:none; background:transparent;
          cursor:pointer; text-align:left;
          font-family:${t.sans}; font-size:13px; color:rgba(255,255,255,0.62);
        }
        .bl-float-index button span {
          font-size:11px; letter-spacing:0.06em; color:rgba(255,255,255,0.35);
        }
        .bl-float-index button:hover,
        .bl-float-index button[data-on="true"] { color:#fff; }
        .bl-float-index button[data-on="true"] span { color:rgba(255,255,255,0.72); }
        .bl-float-index button:focus-visible { outline:2px solid #fff; outline-offset:2px; }
        .bl-read-section {
          margin:40px 0 0; scroll-margin-top:24px;
          font-family:${t.sans}; font-size:12px; font-weight:500;
          letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.5);
        }
        .bl-read-prose h3 {
          margin:22px 0 0; font-family:${t.sans}; font-weight:500;
          font-size:clamp(22px, 2vw, 28px); letter-spacing:-0.03em; color:#fff;
        }
        .bl-read-prose h4 {
          margin:22px 0 0; font-family:${t.sans}; font-size:15px; font-weight:500; color:#fff;
        }
        .bl-read-prose p {
          margin:14px 0 0; font-family:${t.sans}; font-size:15px; line-height:1.7;
          color:rgba(255,255,255,0.74);
        }
        .bl-read-quote {
          margin:28px 0 0; padding-left:18px;
          border-left:2px solid rgba(255,255,255,0.28);
          font-family:${t.sans}; font-size:22px; font-weight:400; line-height:1.35;
          letter-spacing:-0.02em; color:#fff;
        }
        .bl-read-list {
          margin:14px 0 0; padding-left:18px;
          font-family:${t.sans}; font-size:15px; line-height:1.7; color:rgba(255,255,255,0.74);
        }
        .bl-read-list li { margin-top:8px; }
        .bl-read-list li::marker { color:rgba(255,255,255,0.35); }
        .bl-read-fact {
          margin:4px 0 0; font-family:${t.sans}; font-size:14.5px; line-height:1.45;
          color:rgba(255,255,255,0.92);
        }
        .bl-read-fact a { color:inherit; text-decoration:none; }
        .bl-read-fact a:hover { text-decoration:underline; text-underline-offset:3px; }
        .bl-read-desc { margin-top:0; }
        .bl-read-desc p:first-child { margin-top:0; }
        .bl-read-desc p {
          margin:14px 0 0; font-family:${t.sans}; font-size:15px; line-height:1.7;
          color:rgba(255,255,255,0.74);
        }
        .bl-case-read .bl-read-spread,
        .bl-case-read .bl-read-follow,
        .bl-case-read .bl-read-images {
          width:var(--case); margin-left:auto; margin-right:auto;
        }
        .bl-case-read .bl-read-spread,
        .bl-case-read .bl-read-follow {
          display:grid;
          grid-template-columns:minmax(220px, 0.84fr) minmax(0, 1.16fr);
          column-gap:var(--case-gap); align-items:start;
        }
        .bl-case-read .bl-read-spread { grid-template-rows:auto auto; }
        .bl-case-read .bl-read-titlecol { grid-column:1; grid-row:1 / span 2; }
        .bl-case-read .bl-read-aside { grid-column:2; grid-row:2; min-width:0; }
        .bl-case-read .bl-read-follow { margin-top:48px; }
        .bl-case-read .bl-read-follow > * { grid-column:2; min-width:0; }
        .bl-case-read .bl-visit {
          min-height:44px; margin:0 0 4px; align-items:flex-end; padding-bottom:2px;
        }
        .bl-case-read .bl-read-titlecol h1 {
          font-size:clamp(40px, 4.4vw, 68px); line-height:0.98; letter-spacing:-0.046em;
        }
        .bl-case-read .bl-read-meta {
          margin-top:0; gap:0 40px; align-items:start;
        }
        .bl-case-read .bl-read-meta > div {
          display:flex; flex-direction:column; gap:20px; min-width:0;
        }
        .bl-case-read .bl-read-meta .bl-read-kicker { margin-top:0; }
        .bl-case-read .bl-read-fact {
          margin-top:4px; font-size:15px; font-weight:500; letter-spacing:-0.011em; line-height:1.35;
        }
        .bl-case-read > .bl-read-desc {
          width:min(62ch, var(--case)); margin:48px auto 0; text-align:left;
        }
        .bl-case-read .bl-read-desc .bl-read-kicker { margin-top:0; }
        .bl-case-read .bl-read-desc p { margin-top:12px; font-size:15.5px; line-height:1.65; }
        .bl-case-read .bl-read-section { margin-top:36px; }
        .bl-case-read .bl-read-follow > :first-child .bl-read-section:first-child,
        .bl-case-read .bl-read-follow > .bl-read-section:first-child { margin-top:0; }
        .bl-case-read .bl-read-prose p,
        .bl-case-read .bl-read-list { max-width:62ch; }
        .bl-case-read .bl-read-images { margin-top:56px; gap:16px; align-items:start; }
        .bl-case-read .bl-read-shot {
          aspect-ratio:auto; overflow:visible; background:transparent; min-width:0;
        }
        .bl-case-read .bl-read-shot img {
          width:100%; max-width:100%; height:auto; max-height:none;
          object-fit:contain; margin:0;
        }
        .bl-detail .bl-read-bar { border-bottom-color:rgba(0,0,0,0.12); background:#e6e2dd; }
        .bl-detail:not(.bl-article) .bl-read-scroll {
          background-color:#e6e2dd;
          background-image:none;
          scrollbar-width:none;
        }
        .bl-stage .bl-detail:not(.bl-article) .bl-read-scroll::-webkit-scrollbar { width:0; height:0; display:none; }
        .bl-article .bl-read-bar { background:#fff; }
        .bl-detail .bl-read-nav { color:rgba(22,22,22,0.62); }
        .bl-detail .bl-read-nav:hover,
        .bl-detail .bl-read-nav[data-on="true"] { color:#111; }
        .bl-detail .bl-read-nav:focus-visible { outline-color:#111; }
        .bl-detail .bl-read-comma { color:rgba(22,22,22,0.38); }
        .bl-detail .bl-read-copy h1,
        .bl-detail .bl-read-titlecol h1 { color:#111; }
        .bl-detail .bl-read-kicker { color:rgba(22,22,22,0.48); }
        .bl-detail .bl-read-fact { color:#161616; }
        .bl-detail .bl-read-desc p,
        .bl-detail .bl-read-prose p,
        .bl-detail .bl-read-list { color:rgba(22,22,22,0.78); }
        .bl-detail .bl-read-prose h3,
        .bl-detail .bl-read-prose h4,
        .bl-detail .bl-read-quote { color:#111; }
        .bl-detail .bl-read-quote { border-left-color:rgba(22,22,22,0.28); }
        .bl-detail .bl-read-section { color:rgba(22,22,22,0.5); }
        .bl-detail .bl-read-list li::marker { color:rgba(22,22,22,0.4); }
        .bl-detail .bl-visit { color:#161616; }
        .bl-detail .bl-visit:disabled { color:rgba(22,22,22,0.45); }
        .bl-detail .bl-visit:focus-visible { outline-color:#111; }
        .bl-detail .bl-float-index {
          top:auto; left:18px; right:18px; bottom:14px;
          width:auto; max-height:none;
          flex-direction:row; align-items:center; gap:14px;
          padding:8px 10px 8px 16px; border-radius:28px;
          opacity:calc(clamp(0, (var(--p, 0) - 0.42) / 0.58, 1) * var(--nav-show, 1));
          transform:translateY(calc((1 - clamp(0, (var(--p, 0) - 0.42) / 0.58, 1)) * 12px));
          translate:0 calc((1 - var(--nav-show, 1)) * (100% + 24px));
          transition:translate 280ms cubic-bezier(.22,.72,.24,1), opacity 220ms ease;
          pointer-events:none;
        }
        .bl-index-copper {
          border:1px solid rgba(255,255,255,0.09);
          background:
            linear-gradient(157deg,
              #8C7365 0%, #6A5349 26%, #40322B 58%, #4C3C34 82%, #7B6357 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.24),
            inset 0 -1px 0 rgba(0,0,0,0.55),
            0 10px 24px -14px rgba(0,0,0,0.9);
        }
        .bl-detail .bl-index-rows {
          display:flex; flex-direction:column; justify-content:center;
          gap:0; min-width:0; flex:1 1 auto;
        }
        .bl-detail .bl-index-track {
          display:flex; align-items:center; gap:0; min-width:0;
        }
        .bl-detail .bl-float-index .bl-next-case {
          flex:0 0 auto; display:flex; align-items:center; gap:10px;
          width:auto; height:84px; max-width:240px; min-height:0;
          padding:6px 14px 6px 6px; white-space:normal;
          border:none; border-radius:18px; background:#f4f1ed; color:#151515;
          cursor:pointer; text-align:left;
        }
        .bl-detail .bl-next-case img {
          width:84px; height:72px; object-fit:cover; border-radius:13px; flex:0 0 auto;
        }
        .bl-detail .bl-next-case small {
          display:block; font-size:10px; font-weight:500; letter-spacing:0.14em;
          text-transform:uppercase; color:rgba(21,21,21,0.5);
        }
        .bl-detail .bl-float-index .bl-next-case span { color:#151515; }
        .bl-detail .bl-next-case strong {
          display:block; margin-top:3px; font-size:15px; font-weight:600;
          letter-spacing:-0.02em; line-height:1.2; color:#151515;
        }
        .bl-detail .bl-float-index .bl-next-case:hover,
        .bl-detail .bl-float-index .bl-next-case[data-on="true"] { color:#151515; filter:brightness(1.04); }
        .bl-detail .bl-next-case:focus-visible { outline:2px solid #fff; outline-offset:3px; }
        .bl-index-copper .bl-index-sheen {
          position:absolute; inset:-30%; pointer-events:none;
          background:linear-gradient(102deg,
            transparent 34%, rgba(255,255,255,0.10) 46%,
            rgba(255,255,255,0.03) 52%, transparent 64%);
        }
        .bl-detail .bl-float-index > *:not(.bl-index-sheen) { position:relative; }
        .bl-detail[data-index="in"] .bl-float-index { pointer-events:auto; }
        .bl-detail .bl-float-index[data-away="true"] { pointer-events:none; }
        .bl-detail .bl-float-index-label {
          margin:0 4px 0 2px; flex:0 0 auto; color:rgba(255,255,255,0.62);
        }
        .bl-detail .bl-float-index button {
          align-items:center; width:auto; flex:0 0 auto;
          min-height:44px; padding:0 12px; border-radius:999px;
          white-space:nowrap; color:rgba(255,255,255,0.72);
        }
        .bl-detail .bl-float-index button span { color:rgba(255,255,255,0.48); }
        .bl-index-copper .bl-index-pit {
          width:9px; height:9px; flex:0 0 9px; border-radius:999px;
          background:rgba(0,0,0,0.46);
          box-shadow:
            inset 0 1.5px 2.2px rgba(0,0,0,0.88),
            inset 0 -1px 1.2px rgba(255,255,255,0.13),
            0 1px 0 rgba(255,255,255,0.13);
        }
        .bl-detail .bl-float-index button:hover,
        .bl-detail .bl-float-index button[data-on="true"] { color:#fff; }
        .bl-detail .bl-float-index button:hover span,
        .bl-detail .bl-float-index button[data-on="true"] span { color:rgba(255,255,255,0.78); }
        .bl-detail .bl-float-index button:hover .bl-index-pit,
        .bl-detail .bl-float-index button[data-on="true"] .bl-index-pit,
        .bl-index-copper .bl-index-rows button:hover .bl-index-pit,
        .bl-index-copper .bl-index-rows button[data-on="true"] .bl-index-pit,
        .bl-index-copper .bl-index-pit[data-lit="true"] {
          background:${t.accent};
          box-shadow:
            inset 0 1.5px 2.2px rgba(110,88,10,0.65),
            inset 0 -1px 1.2px rgba(255,255,255,0.4),
            0 1px 0 rgba(255,255,255,0.13),
            0 0 10px rgba(230,210,100,0.5);
        }
        .bl-detail .bl-float-index button:focus-visible { outline-color:#fff; }
        .bl-detail .bl-read-shot { background:#f3f3f3; }
        .bl-detail .bl-case-read .bl-read-shot { background:transparent; }
        .bl-case-head {
          width:100%;
          margin:-72px 0 0;
          padding:72px 0 48px;
          background-color:#e6e2dd;
          background-image:none;
        }
        .bl-case-body {
          width:min(850px, calc(100% - 96px));
          margin-left:auto; margin-right:auto;
        }
        .bl-case-top {
          width:min(1120px, calc(100% - 96px));
          margin-left:auto; margin-right:auto;
          display:grid;
          grid-template-columns:minmax(0, 40%) minmax(0, 60%);
          column-gap:0; align-items:start; text-align:left;
        }
        .bl-case-titlecol { min-width:0; display:flex; flex-direction:column; align-items:flex-start; }
        .bl-case-aside { min-width:0; align-self:start; margin-top:25px; padding-left:32px; }
        .bl-case-info {
          width:min(1120px, calc(100% - 96px));
          margin:120px auto 0; padding:0 0 20px;
          display:flex; align-items:center; justify-content:space-between;
          gap:24px 40px;
          border-bottom:1px solid rgba(21,21,21,0.12);
        }
        .bl-case-pills { display:flex; align-items:center; gap:8px; flex:0 0 auto; }
        .bl-case-pills span {
          display:inline-flex; align-items:center; min-height:32px; padding:0 12px;
          border-radius:999px; background:#c8c2bb;
          font-family:${t.sans}; font-size:13px; font-weight:500;
          letter-spacing:-0.01em; line-height:1; color:#3a342f;
        }
        .bl-case-fact { display:flex; align-items:center; gap:10px; min-width:0; }
        .bl-case-fact span {
          flex:0 0 auto; font-family:${t.sans}; font-size:11px; font-weight:500;
          letter-spacing:0.12em; text-transform:uppercase; line-height:1;
          color:rgba(21,21,21,0.5);
        }
        .bl-case-fact strong {
          font-family:${t.sans}; font-size:15px; font-weight:400;
          letter-spacing:-0.01em; line-height:1.35; color:#151515;
        }
        .bl-case-head h1 {
          margin:0; max-width:100%; text-align:left;
          font-family:"Poppins", ${t.sans}; font-weight:400;
          font-size:clamp(54px, 5.1vw, 78px);
          line-height:1.05; letter-spacing:-0.03em; color:#111;
        }
        .bl-case-head .bl-visit { margin:0 0 6px; color:#151515; font-size:16px; font-weight:400; }
        .bl-case-read .bl-case-head .bl-read-desc { margin-top:12px; max-width:none; text-align:left; }
        .bl-case-read .bl-case-head .bl-read-desc p {
          margin:14px 0 0; max-width:100%; font-size:20.8px; line-height:1.47; font-weight:400;
          letter-spacing:-0.02em; color:#151515;
        }
        .bl-case-read .bl-case-head .bl-read-desc p:first-child {
          margin-top:0; font-weight:400;
        }
        .bl-case-stats {
          display:grid; grid-template-columns:repeat(3, minmax(0, 1fr));
          gap:16px 28px; margin:0; padding:0; list-style:none;
        }
        .bl-case-stats li {
          display:flex; flex-direction:column; align-items:flex-start; text-align:left; min-width:0;
        }
        .bl-case-stats span {
          font-family:${t.sans}; font-size:13px; font-weight:400; line-height:1.3;
          color:rgba(21,21,21,0.68);
        }
        .bl-case-stats strong {
          margin-top:8px; font-family:${t.sans}; font-weight:500;
          font-size:clamp(28px, 2.4vw, 40px); letter-spacing:-0.04em; line-height:1; color:#151515;
        }
        .bl-case-stats small {
          margin-top:10px; max-width:26ch; font-family:${t.sans}; font-size:13px;
          font-weight:400; line-height:1.4; color:rgba(21,21,21,0.68);
        }
        .bl-case-cover {
          width:calc(var(--rest-w, 100%) + (100% - var(--rest-w, 100%)) * (1 - var(--p, 0)));
          margin-left:auto; margin-right:auto;
          height:auto;
        }
        .bl-case-cover img {
          width:100%; height:auto; object-fit:contain; object-position:center top; display:block;
        }
        .bl-case-body { margin-top:28px; }
        .bl-case-body .bl-read-desc { margin-top:0; max-width:none; }
        .bl-case-read .bl-case-body p,
        .bl-case-read .bl-case-body .bl-read-desc p,
        .bl-case-read .bl-case-body .bl-read-list {
          margin-top:16px; font-size:19px; line-height:1.65; font-weight:400;
          letter-spacing:-0.011em; color:#5e574f;
        }
        .bl-case-read .bl-case-body .bl-read-list li { margin-top:12px; }
        .bl-case-read .bl-case-body .bl-read-quote {
          margin-top:28px; padding-left:20px;
          border-left:2px solid rgba(21,21,21,0.4);
          font-size:26px; font-weight:500; line-height:1.35;
          letter-spacing:-0.025em; color:#151515;
        }
        .bl-case-read .bl-case-body .bl-read-quote + p { margin-top:28px; }
        .bl-case-body .bl-read-desc p:first-child { font-weight:700; font-size:20.8px; }
        .bl-case-body .bl-read-desc p:first-child,
        .bl-case-body > :first-child p:first-of-type { margin-top:0; }
        .bl-case-read .bl-case-body .bl-read-section + p,
        .bl-case-read .bl-case-body .bl-read-section + .bl-read-quote,
        .bl-case-read .bl-case-body .bl-read-section + .bl-read-list,
        .bl-case-read .bl-case-body h3 + p,
        .bl-case-read .bl-case-body h3 + .bl-read-quote,
        .bl-case-read .bl-case-body h3 + .bl-read-list,
        .bl-case-read .bl-case-body h4 + p,
        .bl-case-read .bl-case-body h4 + .bl-read-quote,
        .bl-case-read .bl-case-body h4 + .bl-read-list { margin-top:40px; }
        .bl-case-read .bl-case-body .bl-read-section.bl-read-plain + p { margin-top:72px; }
        .bl-case-body strong, .bl-case-body b { font-weight:700; }
        .bl-case-read .bl-read-section {
          margin:56px 0 0; font-size:40px; font-weight:700;
          letter-spacing:-0.05em; text-transform:none; line-height:1.08; color:#151515;
        }
        .bl-case-read .bl-read-section.bl-read-plain { font-weight:400; letter-spacing:-0.03em; }
        .bl-case-bento {
          width:min(1120px, calc(100% - 96px));
          margin:28px auto 0;
          display:grid; grid-template-columns:repeat(3, minmax(0, 1fr));
          gap:16px; align-items:stretch;
        }
        .bl-case-bento article {
          display:flex; flex-direction:column; min-width:0;
          background:#f4f1ed; border-radius:18px; overflow:hidden;
        }
        .bl-case-bento img {
          width:100%; aspect-ratio:4 / 3; object-fit:cover; object-position:center top; display:block;
        }
        .bl-case-bento h3 {
          margin:18px 18px 0; font-size:18px; font-weight:500;
          letter-spacing:-0.02em; line-height:1.25; color:#151515;
        }
        .bl-case-bento p {
          margin:8px 18px 20px; font-size:14px; font-weight:400;
          line-height:1.45; letter-spacing:-0.01em; color:rgba(21,21,21,0.78);
        }
        .bl-case-read .bl-read-images {
          width:min(1100px, calc(100% - 96px));
          margin:28px auto 0;
        }
        .bl-case-read .bl-read-prose h3 {
          margin:72px 0 0; max-width:28em; font-size:24px; font-weight:600;
          letter-spacing:-0.02em; line-height:1.35; color:#151515;
        }
        .bl-case-read .bl-case-body.bl-read-prose .bl-read-section + h3 { margin-top:40px; }
        .bl-case-read .bl-read-prose h4 {
          margin:72px 0 0; font-size:18px; font-weight:600;
          letter-spacing:-0.015em; line-height:1.4; color:#151515;
        }
        .bl-case-read .bl-case-body.bl-read-prose .bl-read-section + h4,
        .bl-case-read .bl-case-body.bl-read-prose h3 + h4 { margin-top:40px; }
        .bl-detail .bl-read-shot-fallback { color:rgba(22,22,22,0.45); }
        .bl-read-images {
          width:80%; margin:48px auto 0;
          display:grid; grid-template-columns:1fr 1fr; gap:12px;
        }
        .bl-read-images[data-count="1"] { grid-template-columns:minmax(0, 1fr); }
        .bl-read-shot {
          margin:0; aspect-ratio:3 / 2; overflow:hidden; background:#121316;
          display:flex; align-items:center; justify-content:center;
        }
        .bl-read-shot img { width:100%; height:100%; object-fit:cover; display:block; }
        .bl-read-shot-fallback {
          font-family:${t.sans}; font-size:12px; letter-spacing:0.08em;
          text-transform:uppercase; color:rgba(255,255,255,0.4);
        }
        @media (max-width: 1023px) {
          .bl-read { padding:36px 0 56px; }
          .bl-read-copy { width:80%; }
          .bl-read-images { width:100%; margin-top:36px; gap:8px; }
          .bl-read-copy h1, .bl-read-titlecol h1 { font-size:clamp(32px, 8vw, 48px); }
          .bl-case-read { --case:min(1120px, calc(100% - 40px)); padding-top:72px; }
          .bl-read-spread { width:80%; grid-template-columns:minmax(0, 1fr); }
          .bl-case-read .bl-read-spread,
          .bl-case-read .bl-read-follow {
            grid-template-columns:minmax(0, 1fr); row-gap:28px;
          }
          .bl-read-titlecol, .bl-case-read .bl-read-titlecol { display:block; grid-column:1; grid-row:auto; }
          .bl-read-aside, .bl-case-read .bl-read-aside { grid-column:1; grid-row:auto; margin-top:8px; }
          .bl-read-follow { width:min(640px, 80%); margin:28px auto 0; }
          .bl-case-read .bl-read-follow { margin-top:32px; }
          .bl-case-read .bl-read-follow > * { grid-column:1; }
          .bl-case-read .bl-read-images { margin-top:36px; }
          .bl-case-head { width:100%; margin:-72px 0 0; padding:72px 0 40px; }
          .bl-case-body { width:calc(100% - 40px); margin-left:auto; margin-right:auto; }
          .bl-case-top { width:calc(100% - 40px); margin-left:20px; margin-right:20px; grid-template-columns:minmax(0, 1fr); row-gap:28px; }
          .bl-case-titlecol { display:flex; flex-direction:column; align-items:flex-start; gap:12px; }
          .bl-case-head .bl-visit,
          .bl-case-head h1,
          .bl-case-read .bl-case-head .bl-read-desc,
          .bl-case-aside { grid-column:auto; grid-row:auto; margin-top:0; padding-left:0; }
          .bl-case-info { margin-top:80px; }
          .bl-case-info { width:calc(100% - 40px); margin-left:20px; margin-right:20px; flex-wrap:wrap; }
          .bl-case-bento { width:calc(100% - 40px); margin-left:20px; margin-right:20px; }
          .bl-case-stats strong { font-size:40px; }
          .bl-case-read .bl-case-head .bl-read-desc p { font-size:20px; line-height:1.45; }
          .bl-case-read .bl-read-images { width:calc(100% - 40px); margin-left:auto; margin-right:auto; }
          .bl-case-head h1 { font-size:54px; line-height:1.05; }
          .bl-case-read .bl-case-body p,
          .bl-case-read .bl-case-body .bl-read-list { font-size:18px; line-height:1.6; }
          .bl-case-read .bl-case-body .bl-read-quote { font-size:22px; line-height:1.35; }
          .bl-case-read .bl-read-section { font-size:28px; }
          .bl-case-read .bl-read-prose h3 { font-size:24px; }
          .bl-case-read .bl-read-prose h4 { font-size:18px; }
          .bl-detail .bl-float-index { left:12px; right:12px; bottom:12px; width:auto; max-height:none; flex-wrap:wrap; }
          .bl-detail .bl-float-index .bl-next-case { flex:1 1 100%; max-width:none; height:72px; }
        }
        @media (max-width: 720px) {
          .bl-case-bento { grid-template-columns:minmax(0, 1fr); }
          .bl-case-info { align-items:flex-start; }
          .bl-case-fact { flex:1 1 42%; }
          .bl-case-stats { grid-template-columns:minmax(0, 1fr); }
          .bl-read-bar { padding:6px 16px; gap:4px 10px; }
          .bl-read-cats { overflow-x:auto; scrollbar-width:none; }
          .bl-read-cats::-webkit-scrollbar { display:none; }
          .bl-read-nav { font-size:13px; }
          .bl-read-comma { margin-right:6px; }
        }
        @media (max-width: 560px) {
          .bl-case-bar { left:10px; right:10px; }
          .bl-detail .bl-float-index { padding:8px; }
          .bl-case-head h1 { font-size:45px; }
          .bl-read-copy { width:min(40rem, calc(100% - 32px)); }
          .bl-read-images, .bl-case-read .bl-read-images { grid-template-columns:minmax(0, 1fr); }
          .bl-case-read .bl-read-shot img { max-height:317px; }
        }

        /* opening spread: image, writing, rail, all on the same 36px gutter */
        .bl-case-media { position:relative; width:100%; overflow:hidden; }
        .bl-case-grain {
          position:absolute; inset:0; background-image:${"${grain}"};
          opacity:0.16; mix-blend-mode:overlay;
        }

        .bl-case-by {
          margin-top:12px; font-family:${t.sans}; font-size:11.5px;
          letter-spacing:0.12em; text-transform:uppercase; color:${t.fg3};
        }
        .bl-case-by strong { color:${t.fg2}; font-weight:500; }
        .bl-case-lede {
          margin:24px 0 0; font-family:${t.serif}; font-size:18px; font-weight:300; line-height:1.5;
          letter-spacing:-0.012em; color:${t.fg}; max-width:44ch;
        }

        .bl-case-media img {
          position:absolute; inset:0; width:100%; height:100%;
          object-fit:cover; display:block;
        }
        /* written case study */
        .bl-story-label {
          font-family:${t.sans}; font-size:10.5px; letter-spacing:0.18em;
          text-transform:uppercase; color:${t.fg3};
          padding-bottom:12px; border-bottom:1px solid ${t.line};
          margin-top:56px !important; scroll-margin-top:24px;
        }
        .bl-case-main > .bl-story-label + * { margin-top:22px !important; }
        .bl-story-sub {
          font-family:${t.sans}; font-size:15px; font-weight:500;
          letter-spacing:-0.01em; color:${t.fg}; margin-top:34px !important;
        }
        .bl-case-main > .bl-story-sub + p { margin-top:8px !important; }

        .bl-story-quote {
          padding-left:24px; border-left:2px solid rgba(255,255,255,0.28);
          font-family:${t.serif}; font-size:24px; font-weight:300; line-height:1.34;
          letter-spacing:-0.02em; color:${t.fg}; max-width:38ch;
          margin-top:36px !important; margin-bottom:16px !important;
        }
        .bl-story-list {
          padding-left:20px; max-width:80ch; margin-top:14px !important;
          font-family:${t.sans}; font-size:15.5px; line-height:1.78; color:${t.fg2};
        }
        .bl-story-list li { margin-bottom:10px; }
        .bl-story-list li::marker { color:${t.fg4}; }


        .bl-case-blocked {
          position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
          font-family:${t.sans}; font-size:10.5px; letter-spacing:0.14em;
          text-transform:uppercase; color:rgba(255,255,255,0.5);
        }

        /* the neighbours, as cards rather than buttons */
        @container (max-width: 1000px) {




        }
        @container (max-width: 680px) {




        }

        .bl-back {
          display:flex; align-items:center; gap:7px; background:transparent; border:none;
          font-family:${t.sans}; font-size:13px; color:${t.fg2}; cursor:pointer; padding:0;
          transition: color 140ms ease;
        }
        .bl-back:hover { color:${t.fg}; }

        /* brushed metal: a hue-shifting gradient, a bright top edge, a dark bottom */
        .bl-widget {
          position:relative; overflow:hidden;
          display:flex; flex-direction:column; width:100%; box-sizing:border-box;
          aspect-ratio: 1 / 1; margin-top:auto; margin-bottom:0;
          text-align:left; cursor:pointer; padding:14px;
          border:1px solid rgba(255,255,255,0.09); border-radius:24px;
          background:
            linear-gradient(157deg,
              #8C7365 0%, #6A5349 26%, #40322B 58%, #4C3C34 82%, #7B6357 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.24),
            inset 0 -1px 0 rgba(0,0,0,0.55),
            0 10px 24px -14px rgba(0,0,0,0.9);
          transition: filter 200ms ease;
        }
        .bl-widget:hover { filter: brightness(1.11); }

        /* the specular band that makes it read as metal rather than a gradient */
        .bl-widget-sheen {
          position:absolute; inset:-30%; pointer-events:none;
          background: linear-gradient(102deg,
            transparent 34%, rgba(255,255,255,0.10) 46%,
            rgba(255,255,255,0.03) 52%, transparent 64%);
          transition: transform 520ms cubic-bezier(.22,.72,.24,1);
        }
        .bl-widget:hover .bl-widget-sheen { transform: translateX(14%); }

        .bl-widget-meta {
          position:relative; display:flex; align-items:baseline; justify-content:space-between;
          padding-bottom:9px; border-bottom:1px solid rgba(255,255,255,0.1);
          font-family:${t.sans}; font-size:10px; letter-spacing:0.15em;
          text-transform:uppercase; color:rgba(255,255,255,0.62);
        }
        .bl-widget-meta > span:last-child { letter-spacing:0.06em; color:rgba(255,255,255,0.9); }

        .bl-widget-figure {
          position:relative; display:flex; align-items:baseline; gap:8px;
          margin-top:11px;
        }
        .bl-widget-num {
          font-family:${t.sans}; font-size:40px; font-weight:300; line-height:1;
          letter-spacing:-0.04em; color:rgba(255,255,255,0.94);
        }
        .bl-widget-unit {
          font-family:${t.sans}; font-size:10px; letter-spacing:0.15em;
          text-transform:uppercase; color:rgba(255,255,255,0.55);
        }

        .bl-widget-orbit {
          position:relative; flex:1; display:block; margin:10px 0 12px;
        }
        /* each dot is a hole pressed into the plate: dark inside, shadow
           along the top lip, a lit lower lip, and a bright burr outside */
        .bl-widget-orbit span {
          position:absolute; left:50%; top:50%; width:9px; height:9px;
          margin:-4.5px 0 0 -4.5px; border-radius:999px;
          transform-origin: 4.5px 4.5px;
          background: rgba(0,0,0,0.46);
          box-shadow:
            inset 0 1.5px 2.2px rgba(0,0,0,0.88),
            inset 0 -1px 1.2px rgba(255,255,255,0.13),
            0 1px 0 rgba(255,255,255,0.13);
        }
        .bl-widget:hover .bl-widget-orbit span {
          animation: bl-chase 1.4s linear infinite;
        }
        /* lighting the hole keeps the engraving: the pit fills, it doesn't flatten */
        @keyframes bl-chase {
          0%, 38%, 100% {
            background: rgba(0,0,0,0.46);
            box-shadow:
              inset 0 1.5px 2.2px rgba(0,0,0,0.88),
              inset 0 -1px 1.2px rgba(255,255,255,0.13),
              0 1px 0 rgba(255,255,255,0.13);
          }
          12% {
            background: ${t.accent};
            box-shadow:
              inset 0 1.5px 2.2px rgba(110,88,10,0.65),
              inset 0 -1px 1.2px rgba(255,255,255,0.4),
              0 1px 0 rgba(255,255,255,0.13),
              0 0 10px rgba(230,210,100,0.5);
          }
        }

        .bl-widget-action { position:relative; display:flex; }
        /* The translucent surface of the ideation board button. */
        .bl-widget-pill {
          background:rgba(255,255,255,0.10);
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.18);
        }
        .bl-widget-disc {
          background:rgba(255,255,255,0.14);
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.22);
        }
        .bl-widget-pill {
          flex:1; display:flex; align-items:center; justify-content:space-between; gap:8px;
          height:34px; padding:0 4px 0 13px; white-space:nowrap;
          border-radius:999px;
          font-family:${t.sans}; font-size:11.5px; color:${t.fg};
        }
        .bl-widget-disc {
          display:flex; align-items:center; justify-content:center;
          width:26px; height:26px; flex-shrink:0; border-radius:999px;
          color:${t.fg};
        }

        /* the range widget: a chunky brown-metal pill with a chrome asterisk */
        .bl-widget-pill-text { white-space:nowrap; }

        /* the bar: the same card laid out sideways for the dial */
        .bl-widget[data-bar="true"] {
          display:grid; aspect-ratio:auto;
          grid-template-columns: minmax(0,1fr) 64px 40px;
          grid-template-areas: "meta orbit action" "figure orbit action";
          column-gap:14px; row-gap:0; align-items:center;
          width:100%; max-width:360px; margin:auto 0 0; padding:12px 14px;
          border-radius:22px;
        }
        .bl-widget[data-bar="true"] .bl-widget-meta {
          grid-area:meta; border:none; padding:0; justify-content:flex-start;
        }
        .bl-widget[data-bar="true"] .bl-widget-figure { grid-area:figure; margin-top:4px; }
        .bl-widget[data-bar="true"] .bl-widget-num { font-size:30px; }
        .bl-widget[data-bar="true"] .bl-widget-orbit {
          grid-area:orbit; flex:none; width:64px; height:64px; margin:0;
        }
        .bl-widget[data-bar="true"] .bl-widget-action { grid-area:action; }
        .bl-widget[data-bar="true"] .bl-widget-pill {
          width:40px; height:40px; padding:0; justify-content:center;
        }
        .bl-widget[data-bar="true"] .bl-widget-pill-text { display:none; }
        .bl-widget[data-bar="true"] .bl-widget-disc { width:28px; height:28px; }

        .bl-range-btn {
          position:relative; overflow:hidden;
          display:flex; align-items:center; gap:11px; height:46px; padding:0 18px 0 6px;
          border:1px solid rgba(255,255,255,0.1); border-radius:999px;
          background: linear-gradient(157deg,
            #9A7F6E 0%, #6E574C 26%, #43342C 58%, #503F36 82%, #85695B 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.24),
            inset 0 -1px 0 rgba(0,0,0,0.6),
            0 8px 18px -10px rgba(0,0,0,0.9);
          color:${t.fg}; font-family:${t.sans}; font-size:12.5px; cursor:pointer;
          transition: filter 200ms ease;
        }
        .bl-range-btn:hover { filter: brightness(1.1); }
        .bl-range-btn[data-on="true"] { filter: brightness(1.16); }
        .bl-range-btn:hover .bl-widget-sheen { transform: translateX(16%); }
        .bl-range-btn > *:not(.bl-widget-sheen) { position:relative; }

        .bl-range-disc {
          display:flex; align-items:center; justify-content:center;
          width:34px; height:34px; border-radius:999px; flex-shrink:0;
          background:#000;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.9), inset 0 -1px 0 rgba(255,255,255,0.08);
        }
        .bl-asterisk {
          width:25px; height:25px;
          filter: drop-shadow(0 1px 1.5px rgba(0,0,0,0.6));
          transition: transform 1.8s cubic-bezier(.3,.6,.2,1);
        }
        /* a slow half turn with a slight tumble, so the form shows its depth */
        .bl-range-btn:hover .bl-asterisk { transform: rotate3d(0.25, 0.18, 1, 180deg); }
        .bl-range-disc { perspective: 120px; }
        .bl-range-label { font-weight:500; letter-spacing:-0.005em; }

        .bl-profile-slot {
          position:relative; width:366px; flex-shrink:0; display:flex; min-height:0;
          transition:
            margin-right 380ms cubic-bezier(.22,.72,.24,1),
            opacity 240ms ease,
            transform 380ms cubic-bezier(.22,.72,.24,1);
        }
        .bl-profile-slot[data-open="false"] {
          margin-right:-372px; opacity:0; transform:translateX(16px); pointer-events:none;
        }
        .bl-profile {
          position:relative;
          width:auto; flex:1; min-width:0; display:flex; flex-direction:column;
          /* Copper tones from the ideation board, fading into the black rail. */
          background:linear-gradient(180deg,#6A5349 0%,#40322B 32%,${t.rail} 72%);
          border-radius:999px; overflow:hidden;
          padding:8px 8px 10px; box-sizing:border-box;
        }

        .bl-profile-video {
          --sweep: 0deg;
          --video-inset: 4.2%;
          --metal-position: 0%;
          --metal-next-position: 9.090909%;
          --metal-mix: 0;
          position:relative; width:100%; aspect-ratio:1/1; flex-shrink:0;
          border-radius:999px; overflow:hidden; background:transparent;
        }
        /* Full glass disc below the centered video; the trail shines
           through its exposed outer edge. Only trail and pointer rotate. */
        .bl-disc-ambient,
        .bl-disc-glow,
        .bl-disc-glass {
          position:absolute; inset:0; border-radius:50%; pointer-events:none;
        }
        /* Soft light sources under the glass. They get diffused by the
           actual backdrop filter rather than painted onto the surface. */
        .bl-disc-ambient {
          z-index:1;
          background:
            radial-gradient(ellipse 4.5% 9.7% at 8.2% 26.5%,
              rgba(248,245,220,.98) 0%,rgba(248,245,220,.88) 36%,
              rgba(248,245,220,.16) 78%,transparent 100%),
            radial-gradient(ellipse 5% 11% at 94% 31%,
              rgba(205,158,129,.74) 0%,rgba(205,158,129,.35) 40%,transparent 100%);
        }
        .bl-disc-glow { z-index:2; transform:rotate(var(--sweep)); will-change:transform; }
        .bl-disc-glow::before,
        .bl-disc-glow::after {
          content:""; position:absolute; inset:0; border-radius:50%;
          /* The trail fades backwards and ends underneath the opaque
             metal pointer. No visible gap or light ahead of the pointer. */
          background:conic-gradient(from -105deg,
            transparent 0deg,
            rgba(222,175,36,.12) 23deg,
            rgba(245,205,59,.48) 55deg,
            rgba(255,222,85,.88) 84deg,
            rgba(255,229,111,.94) 97deg,
            rgba(255,229,111,.94) 103.8deg,
            transparent 105deg,
            transparent 360deg);
        }
        .bl-disc-glow::before {
          opacity:.85;
          -webkit-mask-image:radial-gradient(circle closest-side,transparent 0 91.9%,#0003 93.2%,#000b 94.7%,#000 96.2%,#0008 97.8%,transparent 99.4%);
          mask-image:radial-gradient(circle closest-side,transparent 0 91.9%,#0003 93.2%,#000b 94.7%,#000 96.2%,#0008 97.8%,transparent 99.4%);
        }
        .bl-disc-glow::after {
          opacity:.7;
          -webkit-mask-image:radial-gradient(circle closest-side,transparent 0 94.3%,#0003 95%,#000 96.1%,#0008 97.1%,transparent 98.1%);
          mask-image:radial-gradient(circle closest-side,transparent 0 94.3%,#0003 95%,#000 96.1%,#0008 97.1%,transparent 98.1%);
        }
        .bl-disc-glass {
          z-index:3; inset:.3%;
          /* Smoky glassmorphism: a live blurred backdrop, a transparent
             neutral tint and a very thin, soft bevel. No baked texture. */
          background:linear-gradient(155deg,
            rgba(17,17,15,.18) 0%,rgba(12,13,12,.28) 48%,rgba(24,22,15,.16) 100%);
          -webkit-backdrop-filter:blur(3.2px) saturate(1.18);
          backdrop-filter:blur(3.2px) saturate(1.18);
          border:1px solid rgba(255,255,255,.095); box-sizing:border-box;
          box-shadow:inset 0 1px 1px rgba(0,0,0,.27),
            inset 0 -1px 1px rgba(235,212,127,.14),
            inset 0 0 7px rgba(0,0,0,.16);
        }
        .bl-disc-ticker {
          position:absolute; inset:0; border-radius:50%; pointer-events:none; z-index:6;
          transform:rotate(var(--sweep)); will-change:transform;
        }
        .bl-disc-ticker::before,
        .bl-disc-ticker::after {
          content:""; position:absolute; left:50%; top:1.83%;
          width:4.75%; height:4.75%;
          transform:translate(-50%,-50%);
          background-image:url('/video-ticker-metal.webp');
          background-size:1200% 100%;
          background-repeat:no-repeat;
          filter:drop-shadow(0 1px 1px rgba(0,0,0,.75));
        }
        .bl-disc-ticker::before { background-position:var(--metal-position) 0; }
        .bl-disc-ticker::after { background-position:var(--metal-next-position) 0; opacity:var(--metal-mix); }
        .bl-profile-video video,
        .bl-profile-video .bl-profile-video-ph {
          position:absolute; inset:var(--video-inset);
          width:calc(100% - 2 * var(--video-inset));
          height:calc(100% - 2 * var(--video-inset)); z-index:5;
          border-radius:50%; object-fit:cover;
          box-shadow:0 1px 3px rgba(0,0,0,.24);
        }
        .bl-profile-video-ph {
          position:absolute; inset:0; display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:12px;
          background:
            radial-gradient(70% 70% at 40% 32%, rgba(255,255,255,0.10), transparent 70%),
            linear-gradient(158deg, #3A4048 0%, #22262D 45%, #14171C 100%);
          font-family:${t.sans}; font-size:10.5px; letter-spacing:0.16em;
          text-transform:uppercase; color:${t.fg3};
        }
        .bl-profile-play {
          width:46px; height:46px; border-radius:999px;
          background:rgba(255,255,255,0.1);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.22);
          position:relative;
        }
        .bl-profile-play::after {
          content:""; position:absolute; left:52%; top:50%; transform:translate(-50%,-50%);
          border-left:12px solid rgba(255,255,255,0.75);
          border-top:8px solid transparent; border-bottom:8px solid transparent;
        }
        .bl-profile-join {
          position:absolute; top:0; left:0; width:100%; height:120px;
          pointer-events:none; z-index:4; overflow:visible;
        }
        .bl-profile-close {
          position:absolute; top:6px; right:6px; z-index:5;
          display:flex; align-items:center; justify-content:center;
          width:32px; height:32px; border:none; border-radius:999px;
          background:#000; color:${t.fg}; cursor:pointer;
          transition: background 160ms ease;
        }
        .bl-profile-close:hover { background:#141414; }

        .bl-profile-body {
          flex:1; overflow-y:auto; padding:0; min-height:0;
          scrollbar-width:none;
        }
        .bl-profile-body::-webkit-scrollbar { width:0; height:0; display:none; }
        .bl-profile-scroll { display:contents; }
        @media (min-width: 1081px) {
          .bl-profile-body {
            display:flex; flex-direction:column; overflow:hidden; padding-bottom:0;
          }
          .bl-profile-scroll {
            display:block; flex:1; min-height:0; overflow-x:hidden; overflow-y:auto;
            padding-bottom:120px; scrollbar-width:none;
          }
          .bl-profile-scroll::-webkit-scrollbar { width:0; height:0; display:none; }
        }
        .bl-profile, .bl-profile * { font-family:"Poppins", ${t.sans} !important; }
        @media (min-width: 1081px) {
          .bl-profile-inner { padding: 0 28px; }
        }
        .bl-profile-head {
          display:flex; align-items:center; justify-content:center; height:28px;
        }
        .bl-profile-title { font-family:${t.serif}; font-size:18px; font-weight:500; letter-spacing:-0.02em; color:${t.fg}; }
        .bl-profile-note {
          font-family:${t.sans}; font-size:12px; line-height:1.55;
          color:${t.fg3}; margin:8px auto 0; max-width:34ch; min-height:5.6em;
          text-align:center;
        }
        .bl-profile-note[data-axis="true"] { color:${t.fg2}; }
        .bl-profile-note-axis {
          display:block; margin-bottom:6px;
          font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:${t.fg};
        }

        /* the map */
        .bl-radar { display:block; width:100%; height:auto; margin:2px 0 4px; overflow:visible; }
        .bl-radar-ring {
          fill:none; stroke:url(#bl-metal); stroke-width:1.15;
          stroke-linejoin:round; opacity:0.45;
        }
        .bl-radar-spoke {
          stroke:url(#bl-metal); stroke-width:1.35; stroke-linecap:round;
          stroke-dasharray:0.7 3.6;
          opacity:0.8;
          transition: opacity 200ms ease;
        }
        .bl-radar-spoke[data-on="true"] { opacity:1; stroke-dasharray:0.7 3.6; }
        .bl-radar-shape {
          fill:rgba(255,255,255,0.2); stroke:none;
          filter:url(#bl-map-glow);
        }
        .bl-radar-shape-line {
          fill:none; stroke:url(#bl-metal); stroke-width:2.1; stroke-linejoin:round;
          pointer-events:none;
          filter:
            drop-shadow(0 1px 0.5px rgba(0,0,0,0.85))
            drop-shadow(0 -0.45px 0 rgba(255,255,255,0.45));
        }
        .bl-radar-core { fill:url(#bl-metal); }

        .bl-radar-node { cursor:pointer; }
        .bl-radar-node:focus { outline:none; }
        .bl-radar-node:focus-visible .bl-radar-idx { fill:#fff; }
        .bl-radar-hit { fill:transparent; }
        .bl-radar-glyph > * {
          fill:${t.rail}; stroke:rgba(255,255,255,0.55); stroke-width:1.3;
          transition: fill 200ms ease, stroke 200ms ease;
        }
        .bl-radar-node[data-hot="true"] .bl-radar-glyph > *,
        .bl-radar-node[data-on="true"] .bl-radar-glyph > * {
          fill:#FFFFFF; stroke:#FFFFFF;
        }
        .bl-radar-idx {
          font-family:${t.sans}; font-size:7.5px; fill:rgba(255,255,255,0.75);
          text-anchor:middle; pointer-events:none; transition: fill 200ms ease;
        }
        .bl-radar-node[data-hot="true"] .bl-radar-idx,
        .bl-radar-node[data-on="true"] .bl-radar-idx { fill:#0A0C10; }
        .bl-radar-label {
          font-family:${t.sans}; font-size:9.5px; letter-spacing:0.1em;
          text-transform:uppercase; fill:${t.fg3}; transition: fill 200ms ease;
        }
        .bl-radar-node[data-hot="true"] .bl-radar-label,
        .bl-radar-node[data-on="true"] .bl-radar-label { fill:${t.fg}; }

        /* shown only once a node is clicked */
        .bl-readout {
          margin: 4px 0 16px; padding: 12px 0 2px;
          border-top:1px solid ${t.line};
          animation: bl-readout-in 260ms ease both;
        }
        @keyframes bl-readout-in {
          from { opacity:0; transform: translateY(-4px); }
          to   { opacity:1; transform:none; }
        }
        .bl-readout-head { display:flex; align-items:baseline; gap:9px; }
        .bl-readout-idx {
          font-family:${t.sans}; font-size:10px; letter-spacing:0.14em; color:${t.fg3};
        }
        .bl-readout-axis { font-family:${t.serif}; font-size:16px; font-weight:500; letter-spacing:-0.015em; color:${t.fg}; }
        .bl-readout-val {
          margin-left:auto; font-family:${t.sans}; font-size:11px; color:${t.fg3};
        }
        .bl-readout p {
          margin:8px 0 0; font-family:${t.sans}; font-size:12.5px;
          line-height:1.6; color:${t.fg2};
        }

        .bl-cv { margin-top:28px; padding-top:0; border-top:none; text-align:center; }
        .bl-cv-label {
          font-family:${t.sans}; font-size:16px; font-weight:600; letter-spacing:0.14em;
          text-transform:uppercase; color:${t.fg}; margin-bottom:16px; text-align:center;
        }
        .bl-cv-track { display:flex; flex-direction:column; align-items:stretch; gap:0; }

        .bl-cv-band {
          position:relative; display:flex; justify-content:center; width:100%;
          padding:0 0 20px; border:none; background:transparent;
          text-align:center; cursor:pointer;
          transition: opacity 200ms ease;
        }
        .bl-cv-band + .bl-cv-band {
          margin-top:8px; padding-top:20px;
          border-top:1px solid rgba(255,255,255,0.16);
        }

        .bl-cv-body { display:flex; flex-direction:column; align-items:center; gap:2px; flex:0 1 auto; min-width:0; }
        .bl-cv-top { display:flex; align-items:baseline; justify-content:center; gap:8px; }
        .bl-cv-period {
          font-family:${t.sans}; font-size:10px; letter-spacing:0.1em;
          text-transform:uppercase; color:${t.fg3};
        }
        .bl-cv-span {
          font-family:${t.sans}; font-size:10px;
          color:${t.fg4}; white-space:nowrap;
        }
        .bl-cv-role { font-family:${t.sans}; font-size:13px; color:${t.fg2}; }
        .bl-cv-band[data-on="true"] .bl-cv-role,
        .bl-cv-band[data-now="true"] .bl-cv-role { color:${t.fg}; }
        .bl-cv-org { font-family:${t.sans}; font-size:11.5px; color:${t.fg3}; }
        .bl-cv-note {
          margin-top:7px; font-family:${t.sans}; font-size:12px; line-height:1.55;
          color:${t.fg2}; animation: bl-readout-in 240ms ease both;
        }

        .bl-cv-foot {
          margin:22px auto 0; padding-top:0; border-top:none; max-width:26ch;
          font-family:${t.sans}; font-size:11.5px; line-height:1.5; color:${t.fg3};
          text-align:center;
        }
        .bl-cv-foot span {
          display:block; font-size:10px; letter-spacing:0.16em;
          text-transform:uppercase; color:${t.fg4}; margin-bottom:4px;
        }

        .bl-board {
          position:absolute; inset:12px; z-index:20; display:flex; flex-direction:column;
          background:#FAFAF8; border-radius:36px; overflow:hidden;
          transform: translateY(101%);
          transition: transform 420ms cubic-bezier(.22,.72,.24,1);
        }
        .bl-board[data-open="true"] { transform: translateY(0); }

        .bl-board-bar {
          display:flex; align-items:center; gap:14px; flex-shrink:0;
          height:56px; padding: 0 18px; background:#FFFFFF;
          border-bottom:1px solid #E6E5E1;
        }
        .bl-board-close {
          display:flex; align-items:center; gap:7px; background:transparent; border:none;
          font-family:${t.sans}; font-size:13px; color:#5A5D63; cursor:pointer; padding:0;
        }
        .bl-board-close:hover { color:#16181C; }
        .bl-board-title { font-family:${t.serif}; font-size:16px; font-weight:500; letter-spacing:-0.015em; color:#16181C; }
        .bl-board-count { font-family:${t.sans}; font-size:12px; color:#9A9DA3; }
        .bl-zoom {
          display:flex; align-items:center; gap:2px; height:30px; padding:0 4px;
          border:1px solid #E0DFDB; border-radius:7px; background:#FFF;
          font-family:${t.sans}; font-size:11.5px; color:#5A5D63;
        }
        .bl-zoom > span { min-width:36px; text-align:center; }
        .bl-zoom button {
          display:flex; width:22px; height:22px; align-items:center; justify-content:center;
          border:none; background:transparent; color:#5A5D63; cursor:pointer; border-radius:5px;
        }
        .bl-zoom button:hover { background:#F0EFEC; color:#16181C; }

        .bl-canvas {
          position:relative; flex:1; overflow:hidden; touch-action:none;
          user-select:none; -webkit-user-select:none;
          background-color:#FAFAF8;
          background-image: radial-gradient(#DEDDD8 1px, transparent 1px);
          background-size: 26px 26px;
        }
        .bl-plane { position:absolute; top:0; left:0; transform-origin: 0 0; }

        /* masthead */
        .bl-mast {
          position:absolute; left:0; top:0; padding-bottom:34px;
          border-bottom:1px solid #E3E2DE; pointer-events:none; user-select:none;
        }
        .bl-mast-row {
          display:flex; justify-content:space-between;
          font-family:${t.sans}; font-size:11px; color:#8B8E94;
          padding-bottom:44px;
        }
        .bl-mast-word {
          font-family:${t.sans}; font-size:104px; line-height:0.92; font-weight:300;
          letter-spacing:-0.05em; color:#16181C; text-align:center;
        }
        .bl-mast-sub {
          font-family:${t.sans}; font-size:11px; letter-spacing:0.17em;
          text-transform:uppercase; color:#9A9DA3; text-align:center; margin-top:18px;
        }

        /* items */
        .bl-item { position:absolute; cursor:grab; font-family:${t.sans}; }
        .bl-item textarea { user-select:text; -webkit-user-select:text; }
        .bl-item textarea {
          width:100%; resize:none; border:none; outline:none; background:transparent;
          font-family:${t.sans}; font-size:13px; line-height:1.45; color:#26282C;
        }
        .bl-item-body { white-space:pre-wrap; word-break:break-word; color:#26282C; }

        .bl-item-note {
          width:176px; min-height:104px; padding:11px 11px 7px;
          display:flex; flex-direction:column;
          box-shadow: 0 6px 14px -6px rgba(0,0,0,0.32), 0 1px 2px rgba(0,0,0,0.12);
        }
        .bl-item-note textarea { flex:1; min-height:62px; }
        .bl-item-note .bl-item-body { flex:1; font-size:13px; line-height:1.45; }
        .bl-item-foot { margin-top:8px; font-size:10.5px; color:rgba(0,0,0,0.4); }

        .bl-item-text { width:300px; padding:4px; }
        .bl-item-text .bl-item-body { color:#16181C; letter-spacing:-0.01em; }
        .bl-item-text textarea { color:#16181C; letter-spacing:-0.01em; }

        .bl-item-image { width:220px; }
        .bl-item-image img {
          display:block; width:100%; border-radius:3px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.16); user-select:none;
        }
        .bl-item-ph {
          height:148px; border-radius:3px; display:flex; align-items:flex-end;
          padding:9px; box-shadow: 0 2px 6px rgba(0,0,0,0.16);
        }
        .bl-item-ph span { font-size:10.5px; color:rgba(255,255,255,0.7); }

        .bl-item[data-sel="true"] { outline:1.5px solid #16181C; outline-offset:3px; }

        .bl-ctx {
          position:absolute; bottom:100%; left:0; margin-bottom:9px;
          transform-origin: 0 100%;
          display:flex; align-items:center; gap:3px; padding:4px;
          background:#FFF; border:1px solid #E6E5E1; border-radius:9px;
          box-shadow: 0 8px 20px -8px rgba(0,0,0,0.3); cursor:default;
        }
        .bl-ctx-swatch {
          width:17px; height:17px; border-radius:4px; border:1px solid rgba(0,0,0,0.1);
          cursor:pointer; padding:0;
        }
        .bl-ctx-swatch[data-on="true"] { outline:1.5px solid #16181C; outline-offset:1.5px; }
        .bl-ctx-font, .bl-ctx-btn {
          display:flex; align-items:center; justify-content:center;
          min-width:26px; height:24px; padding:0 9px; border-radius:999px;
          border:none; background:transparent; color:#4B4E54; cursor:pointer;
        }
        .bl-ctx-font:hover, .bl-ctx-btn:hover { background:#F0EFEC; color:#16181C; }
        .bl-ctx-font[data-on="true"] { background:#16181C; color:#FFF; }
        .bl-ctx-url {
          width:150px; height:24px; padding:0 8px; border-radius:6px;
          border:1px solid #E6E5E1; outline:none;
          font-family:${t.sans}; font-size:11.5px; color:#16181C;
        }

        .bl-ink { position:absolute; overflow:visible; pointer-events:none; }
        .bl-ctx-ink {
          position:absolute; bottom:auto; margin:0;
          transform-origin: 0 0; pointer-events:auto;
          translate: 0 -44px;
        }
        .bl-ink-wrap { position:absolute; inset:0; pointer-events:none; }
        .bl-ink-wrap path { pointer-events:stroke; cursor:grab; }
        .bl-ink-wrap[data-sel="true"] path { filter: drop-shadow(0 0 3px rgba(22,24,28,0.35)); }

        .bl-warn {
          font-family:${t.sans}; font-size:11.5px; color:#A4534A;
          background:#FBEEEC; border-radius:999px; padding:4px 10px;
        }

        .bl-fly-swatch[data-on="true"] { outline:1.5px solid #16181C; outline-offset:2px; }

        /* side rail */
        .bl-rail-tools {
          position:absolute; left:32px; top:50%; transform:translateY(-50%); z-index:6;
          display:flex; flex-direction:column; gap:3px; padding:5px;
          background:#FFF; border:1px solid #E6E5E1; border-radius:999px;
          box-shadow: 0 10px 26px -12px rgba(0,0,0,0.34);
        }
        .bl-tool-wrap { position:relative; display:flex; }
        .bl-tool {
          display:flex; align-items:center; justify-content:center;
          width:34px; height:34px; border-radius:999px;
          border:none; background:transparent; color:#5A5D63; cursor:pointer;
          transition: background 140ms ease, color 140ms ease;
        }
        .bl-tool:hover { background:#F2F1EE; color:#16181C; }
        .bl-tool[data-on="true"] { background:#16181C; color:#FFF; }

        .bl-flyout {
          position:absolute; left:calc(100% + 8px); top:50%; transform:translateY(-50%);
          display:flex; gap:4px; padding:6px;
          background:#FFF; border:1px solid #E6E5E1; border-radius:10px;
          box-shadow: 0 10px 26px -12px rgba(0,0,0,0.34);
        }
        .bl-fly-swatch {
          width:24px; height:24px; border-radius:5px; cursor:pointer; padding:0;
          border:1px solid rgba(0,0,0,0.08);
          transition: transform 140ms ease;
        }
        .bl-fly-swatch:hover { transform: translateY(-2px); }
        .bl-flyout-text { flex-direction:column; align-items:flex-start; width:132px; }
        .bl-flyout-text button {
          width:100%; text-align:left; padding:6px 9px; border-radius:7px;
          border:none; background:transparent; color:#16181C; cursor:pointer;
        }
        .bl-flyout-text button:hover { background:#F2F1EE; }

        /* leave a note */
        .bl-leave {
          position:absolute; right:36px; top:50%; z-index:6;
          width:208px; padding:14px 14px 13px;
          transform: translateY(-50%) rotate(-1.4deg);
          font-family:${t.sans};
          box-shadow: 0 14px 28px -12px rgba(0,0,0,0.42), 0 2px 4px rgba(0,0,0,0.14);
        }
        .bl-leave-title {
          font-family:${t.serif}; font-size:16px; font-weight:500; letter-spacing:-0.015em; color:#16181C; margin-bottom:9px;
        }
        .bl-leave textarea {
          display:block; width:100%; height:84px; box-sizing:border-box; resize:none;
          padding:8px 9px; margin-bottom:7px; outline:none;
          border:1px solid rgba(0,0,0,0.14); border-radius:4px;
          background:rgba(255,255,255,0.5);
          font-family:${t.sans}; font-size:12.5px; line-height:1.45; color:#26282C;
        }
        .bl-leave input {
          display:block; width:100%; height:30px; box-sizing:border-box;
          padding:0 9px; margin-bottom:9px; outline:none;
          border:1px solid rgba(0,0,0,0.14); border-radius:4px;
          background:rgba(255,255,255,0.5);
          font-family:${t.sans}; font-size:12.5px; color:#26282C;
        }
        .bl-leave textarea::placeholder, .bl-leave input::placeholder { color:rgba(0,0,0,0.34); }
        .bl-leave textarea:focus, .bl-leave input:focus { border-color:rgba(0,0,0,0.34); }

        .bl-leave-colors { display:flex; gap:5px; margin-bottom:11px; }
        .bl-leave-colors button {
          width:18px; height:18px; border-radius:4px; cursor:pointer; padding:0;
          border:1px solid rgba(0,0,0,0.12);
        }
        .bl-leave-colors button[data-on="true"] { outline:1.5px solid #16181C; outline-offset:1.5px; }

        .bl-leave-btn {
          display:flex; align-items:center; justify-content:center;
          width:100%; height:34px; border:none; border-radius:999px;
          background:#16181C; color:#FFF; font-family:${t.sans}; font-size:12.5px;
          cursor:pointer; transition: background 140ms ease;
        }
        .bl-leave-btn:hover:not(:disabled) { background:#2C2F35; }
        .bl-leave-btn:disabled { background:rgba(0,0,0,0.22); cursor:default; }

        .bl-board-empty {
          position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
          font-family:${t.sans}; font-size:13.5px; color:#A9ACB2; pointer-events:none;
        }
        .bl-board-hint {
          position:absolute; left:50%; bottom:16px; transform:translateX(-50%);
          font-family:${t.sans}; font-size:11px; color:#9A9DA3;
          background:rgba(250,250,248,0.92); padding:5px 11px; border-radius:6px;
          pointer-events:none; white-space:nowrap;
        }

        @media (max-width: 900px) {
          .bl-rail-tools { left:14px; }
          .bl-leave { display:none; }
          .bl-board-hint { display:none; }
        }

        .bl-card:focus-visible, .bl-hex-btn:focus-visible, .bl-seg button:focus-visible,
        .bl-ghost:focus-visible, .bl-icon-btn:focus-visible,
        .bl-back:focus-visible, .bl-entry:focus-visible {
          outline: 2px solid rgba(255,255,255,0.5); outline-offset: 2px;
        }

        .bl-flower {
          position:absolute; left:50%; bottom:10px; z-index:12;
          width:min(300px, calc(100% - 28px)); aspect-ratio:1;
          transform:translateX(-50%);
          pointer-events:none;
        }
        .bl-flower-glass {
          position:absolute; inset:0;
          background:rgba(86, 92, 72, 0.5);
          backdrop-filter:blur(22px) saturate(1.25);
          -webkit-backdrop-filter:blur(22px) saturate(1.25);
          -webkit-mask-image:
            radial-gradient(circle at 50% 24%, #000 0 58px, transparent 59px),
            radial-gradient(circle at 72.5% 37%, #000 0 58px, transparent 59px),
            radial-gradient(circle at 72.5% 63%, #000 0 58px, transparent 59px),
            radial-gradient(circle at 50% 76%, #000 0 58px, transparent 59px),
            radial-gradient(circle at 27.5% 63%, #000 0 58px, transparent 59px),
            radial-gradient(circle at 27.5% 37%, #000 0 58px, transparent 59px);
          mask-image:
            radial-gradient(circle at 50% 24%, #000 0 58px, transparent 59px),
            radial-gradient(circle at 72.5% 37%, #000 0 58px, transparent 59px),
            radial-gradient(circle at 72.5% 63%, #000 0 58px, transparent 59px),
            radial-gradient(circle at 50% 76%, #000 0 58px, transparent 59px),
            radial-gradient(circle at 27.5% 63%, #000 0 58px, transparent 59px),
            radial-gradient(circle at 27.5% 37%, #000 0 58px, transparent 59px);
          -webkit-mask-composite: source-over;
          mask-composite: add;
        }
        .bl-flower-petal, .bl-flower-hub {
          position:absolute; left:50%; top:50%;
          display:flex; align-items:center; justify-content:center;
          border:none; background:transparent; color:#fff; cursor:pointer;
          pointer-events:auto;
        }
        .bl-flower-petal {
          flex-direction:column; gap:4px;
          width:108px; height:108px; margin:-54px 0 0 -54px; border-radius:999px;
        }
        .bl-flower-petal[data-on="true"] { background:#000; }
        .bl-flower-petal .bl-glyph {
          filter:
            drop-shadow(0 -0.7px 0 rgba(255,255,255,0.55))
            drop-shadow(0 1.6px 1.2px rgba(0,0,0,0.95));
        }
        .bl-flower-label {
          font-family:${t.sans}; font-size:11px; font-weight:500; line-height:1.1;
          letter-spacing:0; color:#fff; white-space:nowrap;
        }
        .bl-flower-petal:focus-visible, .bl-flower-hub:focus-visible {
          outline:2px solid rgba(255,255,255,0.7); outline-offset:2px;
        }
        .bl-flower-hub {
          width:52px; height:52px; margin:-26px 0 0 -26px; border-radius:999px;
          background:rgba(255,255,255,0.62); color:#1c1c1c; z-index:2;
          backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
        }
        .bl-flower-hub svg { display:block; }
        .bl-dock { position:relative; z-index:20; flex-shrink:0; order:2; }
        .bl-dock-bar {
          position:relative; z-index:2; display:flex; align-items:center; gap:10px;
          height:84px; padding:0 14px; background:#000;
          border-top:1px solid rgba(255,255,255,0.08);
        }
        .bl-dock-trigger {
          display:flex; align-items:center; justify-content:center;
          width:58px; height:58px; flex-shrink:0; border-radius:999px;
          border:none; background:#000; cursor:pointer;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.12), 0 8px 18px -10px rgba(0,0,0,0.9);
          transition: transform 300ms cubic-bezier(.22,.72,.24,1), box-shadow 200ms ease;
        }
        .bl-dock-trigger .bl-asterisk { width:30px; height:30px; }
        .bl-dock-trigger[data-open="true"] {
          transform: rotate(135deg);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.3);
        }

        .bl-dock-mid {
          flex:1; min-width:0; display:flex; flex-direction:column; gap:2px;
          align-items:flex-start; padding:0 2px;
          border:none; background:transparent; cursor:pointer; text-align:left;
        }
        .bl-dock-mid span {
          font-family:${t.sans}; font-size:9.5px; letter-spacing:0.18em;
          text-transform:uppercase; color:${t.fg4};
        }
        .bl-dock-mid strong {
          font-family:${t.sans}; font-size:15px; font-weight:400;
          letter-spacing:-0.02em; color:${t.fg};
        }

        .bl-dock-right { display:flex; gap:8px; flex-shrink:0; }
        .bl-dock-mini {
          display:flex; align-items:center; justify-content:center;
          width:44px; height:44px; border-radius:999px; cursor:pointer;
          border:none; background:#15181D;
        }
        .bl-dock-mini svg {
          filter:
            drop-shadow(0 -0.6px 0 rgba(255,255,255,0.5))
            drop-shadow(0 1.4px 1px rgba(0,0,0,0.95));
        }

        /* satellites: same size, label beneath, staggered out of the trigger */
        .bl-cluster {
          position:absolute; left:14px; bottom:84px; right:14px; height:290px;
          z-index:2; pointer-events:none;
        }
        .bl-cluster-btn {
          position:absolute; display:flex; flex-direction:column; align-items:center; gap:7px;
          width:64px; margin-left:-4px;
          border:none; background:transparent; cursor:pointer;
          opacity:0; transform: scale(0.3) translate(-30px, 60px);
          transition:
            opacity 240ms ease,
            transform 440ms cubic-bezier(.24,.9,.3,1.08);
        }
        .bl-cluster-disc {
          display:flex; align-items:center; justify-content:center;
          width:56px; height:56px; border-radius:999px; background:#15181D;
          box-shadow: 0 14px 26px -14px rgba(0,0,0,1), inset 0 1px 0 rgba(255,255,255,0.06);
          transition: background 200ms ease;
        }
        .bl-cluster-disc svg {
          filter:
            drop-shadow(0 -0.6px 0 rgba(255,255,255,0.5))
            drop-shadow(0 1.4px 1px rgba(0,0,0,0.95));
        }
        .bl-cluster-name {
          font-family:${t.sans}; font-size:10.5px; color:rgba(255,255,255,0.86);
          white-space:nowrap; text-shadow: 0 1px 4px rgba(0,0,0,0.9);
        }
        .bl-cluster-btn[data-on="true"] .bl-cluster-disc { background:#2C323B; }
        .bl-cluster-btn[data-on="true"] .bl-cluster-name { color:#FFF; font-weight:500; }
        .bl-cluster[data-open="true"] { pointer-events:auto; }
        .bl-cluster[data-open="true"] .bl-cluster-btn { opacity:1; transform:none; }
        /* the page drops back so the cluster is the only thing in focus */
        .bl-cluster-scrim {
          position:fixed; inset:0; z-index:1;
          border:none; background:rgba(0,0,0,0.72); cursor:pointer;
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          animation: bl-scrim-in 240ms ease both;
        }
        @keyframes bl-scrim-in { from { opacity:0 } to { opacity:1 } }

        /* ------------------------------------------------------------------
           Compact: the dial is home, the dock is the way out, work runs
           sideways and reading runs down.
        ------------------------------------------------------------------ */
        .bl-dial {
          position:absolute; inset:0; z-index:30; overflow:hidden;
          display:flex; flex-direction:column; align-items:center; justify-content:space-between;
          padding:26px 20px 16px;
          background:
            radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px) 0 0 / 22px 22px,
            #000;
          animation: bl-dial-in 420ms cubic-bezier(.22,.72,.24,1) both;
        }
        @keyframes bl-dial-in {
          from { opacity:0; transform: scale(0.96); }
          to   { opacity:1; transform:none; }
        }

        /* the face: video, name */
        .bl-dial-head { display:flex; flex-direction:column; align-items:center; gap:8px; }
        .bl-dial-video {
          width:118px; height:118px; border-radius:999px; overflow:hidden; background:#0A0C10;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.12), 0 20px 40px -24px rgba(0,0,0,1);
          margin-bottom:6px;
        }
        .bl-dial-video video, .bl-dial-video .bl-profile-video-ph {
          width:100%; height:100%; object-fit:cover; display:block;
        }
        .bl-dial-name {
          font-family:${t.sans}; font-size:22px; font-weight:400;
          letter-spacing:-0.03em; color:${t.fg};
        }
        .bl-dial-role {
          font-family:${t.sans}; font-size:10px;
          letter-spacing:0.16em; text-transform:uppercase; color:${t.fg3};
        }

        /* the ring: a hub at the centre, seven glyphs orbiting it */
        .bl-ring { position:relative; width:320px; height:320px; flex-shrink:0; }
        .bl-ring-hub {
          position:absolute; left:50%; top:50%; width:96px; height:96px;
          margin:-48px 0 0 -48px; border-radius:999px; z-index:3;
          display:flex; align-items:center; justify-content:center;
          background:#000;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.14), 0 24px 44px -24px rgba(0,0,0,1);
          transition: transform 480ms cubic-bezier(.4,0,.2,1);
        }
        .bl-ring-hub .bl-asterisk { width:46px; height:46px; }
        .bl-ring-btn {
          position:absolute; width:64px; margin:-30px 0 0 -32px;
          display:flex; flex-direction:column; align-items:center; gap:6px;
          border:none; background:transparent; cursor:pointer;
          transition: opacity 260ms ease, transform 320ms ease;
        }
        .bl-ring-disc {
          display:flex; align-items:center; justify-content:center;
          width:60px; height:60px; border-radius:999px; background:#15181D;
          box-shadow: 0 16px 30px -18px rgba(0,0,0,1), inset 0 1px 0 rgba(255,255,255,0.06);
          transition: transform 220ms cubic-bezier(.22,.72,.24,1), background 200ms ease;
        }
        .bl-ring-btn:active .bl-ring-disc { transform: scale(0.94); background:#20252C; }
        .bl-ring-disc svg {
          filter:
            drop-shadow(0 -0.7px 0 rgba(255,255,255,0.55))
            drop-shadow(0 1.6px 1.3px rgba(0,0,0,0.95));
        }
        .bl-ring-name {
          font-family:${t.sans}; font-size:10.5px; color:rgba(255,255,255,0.82); white-space:nowrap;
        }

        /* leaving: everything but the hub drops back while it travels to the dock */
        .bl-dial[data-leaving="true"] .bl-dial-head,
        .bl-dial[data-leaving="true"] .bl-dial-foot,
        .bl-dial[data-leaving="true"] .bl-ring-btn { opacity:0; transform:scale(0.96); }
        .bl-dial[data-leaving="true"] .bl-ring-btn { transform:scale(0.7); }

        /* the foot: widget bar and the range chip on glass */
        .bl-dial-foot {
          display:flex; flex-direction:column; align-items:center; gap:10px;
          width:100%; max-width:380px; padding:12px; border-radius:26px;
          background:rgba(255,255,255,0.04);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          transition: opacity 260ms ease, transform 320ms ease;
        }
        .bl-dial-chip {
          height:42px; width:100%; padding:0 20px; border-radius:999px; cursor:pointer;
          border:1px solid rgba(255,255,255,0.1);
          background: linear-gradient(157deg, #4C535E 0%, #2F353E 30%, #1B1F26 60%, #424954 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.6);
          font-family:${t.sans}; font-size:12.5px; font-weight:500; color:${t.fg};
        }

        /* Range on compact screens: circles capped, content measured and centred */
        @media (max-width: 1080px) {
          .bl-profile-body { padding:0; }
          .bl-profile-video {
            width:min(100% - 40px, 300px); aspect-ratio:1/1; margin:22px auto 0;
          }
          .bl-profile-close { top:14px; right:14px; background:rgba(0,0,0,0.6); }
          .bl-profile-inner { padding:14px 22px 34px; max-width:760px; margin:0 auto; }
          .bl-profile-note { max-width:32ch; }
          .bl-radar { max-width:340px; margin:6px auto 4px; }
          .bl-readout { max-width:52ch; }
          .bl-cv { max-width:52ch; margin-left:auto; margin-right:auto; }
        }

        /* tablet: two columns, so the page isn't a long single stack */
        @media (min-width: 761px) and (max-width: 1080px) {
          .bl-profile-inner {
            display:grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr);
            column-gap:36px; row-gap:0; max-width:920px; align-items:start;
          }
          .bl-profile-head { grid-column:1 / -1; }
          .bl-radar { grid-column:1 / -1; justify-self:center; }
          .bl-profile-note { grid-column:1 / -1; }
          .bl-cv { grid-column:1 / -1; justify-self:center; width:min(100%, 52ch); margin-top:24px; }
        }

        @media (max-width: 760px) {
          .bl-profile-video { width:min(100% - 40px, 240px); }
          .bl-profile-inner { padding:12px 18px 30px; }
          .bl-radar { max-width:300px; }
          .bl-cv-band { padding:8px 0; }
        }

        @media (max-width: 1080px) {
          .bl-stage { flex-direction:column; padding:0; gap:0; }
          .bl-main { order:1; border-radius:0; min-height:0; min-width:0; }

          .bl-rail { display:none; }

          /* reading takes the screen and grows out of the card you tapped */
          .bl-detail {
            position:absolute; inset:0; z-index:14; border-radius:0;
            transform:none; transform-origin: var(--ox, 50%) var(--oy, 50%);
          }
          .bl-detail[data-open="false"] {
            transform: scale(0.45); opacity:0; pointer-events:none;
          }
          .bl-detail[data-open="true"] {
            animation: bl-case-in 420ms cubic-bezier(.22,.72,.24,1) both;
          }
          @keyframes bl-case-in {
            from { transform: scale(0.45); opacity:0; }
            to   { transform:none; opacity:1; }
          }





          .bl-profile-slot {
            position:absolute; inset:0; width:auto; margin-right:0; z-index:16;
          }
          .bl-profile-slot[data-open="false"] {
            transform:translateX(100%); margin-right:0; opacity:1;
          }
          .bl-profile {
            position:absolute; inset:0; width:auto; margin-right:0;
            border-radius:0; padding:0;
          }
          .bl-profile[data-open="false"] { transform:none; margin-right:0; opacity:1; }
          .bl-profile-join { display:none; }
          .bl-profile-close { top:14px; right:14px; background:rgba(0,0,0,0.6); box-shadow:none; }
          .bl-profile-inner { padding:10px 18px 24px; }
          .bl-board { inset:0; border-radius:0; }
          .bl-leave, .bl-board-hint { display:none; }
          .bl-rail-tools { left:14px; }

          .bl-topbar { height:62px; padding:0 10px 0 16px; }
          .bl-search { max-width:none; flex:1; height:38px; }
          .bl-range-btn { display:none; }
          .bl-scroll { padding-bottom: 280px; }
          .bl-band, .bl-empty { padding-left:16px; padding-right:16px; }
          .bl-band-head { padding-top:22px; padding-bottom:18px; }
          .bl-me { padding:10px; }
          .bl-main[data-view="about"] .bl-me { padding-top:76px; }
          .bl-me-foot-link { width:56px; }
        }

        @media (max-width: 760px) {
          .bl-dock-bar { height:78px; }
          .bl-cluster { bottom:78px; }
          .bl-dial { padding:18px 16px 12px; }
          .bl-dial-video { width:96px; height:96px; }
          .bl-ring { width:290px; height:290px; }
          .bl-ring-hub { width:84px; height:84px; margin:-42px 0 0 -42px; }
          .bl-ring-hub .bl-asterisk { width:40px; height:40px; }
          .bl-ring-disc { width:54px; height:54px; }
          .bl-ring-disc svg { width:27px; height:27px; }
          .bl-ring-btn { margin:-27px 0 0 -32px; }
          .bl-card { border-radius:28px; }
          .bl-rail { height:78px; }
        }

        @media (prefers-reduced-motion: reduce) {
          * { transition-duration: 1ms !important; }
        }
      `}</style>

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <linearGradient id="bl-metal" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="#FBFBFA" />
            <stop offset="0.35" stopColor="#C9CCD1" />
            <stop offset="0.62" stopColor="#8E939A" />
            <stop offset="0.82" stopColor="#E4E7EB" />
            <stop offset="1" stopColor="#9AA0A8" />
          </linearGradient>
          <radialGradient id="bl-sheen" cx="0.3" cy="0.2" r="0.75">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.28" />
          </radialGradient>
          <filter id="bl-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -13"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="bl-stage" data-case={open || article ? "true" : "false"}>
          {/* rail */}
          <aside className="bl-rail" data-collapsed={railCollapsed ? "true" : "false"}>
            <div className="bl-brand">
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  background:
                    "linear-gradient(150deg, #6D8A93 0%, #1A1D22 90%)",
                  flexShrink: 0,
                }}
              />
              <span
                className="bl-brand-name"
                style={{ fontFamily: t.serif, fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em", color: t.fg }}
              >
                Deeksha Satapathy
              </span>
            </div>

            <div className="bl-hex-wrap">
              {nav.map((group) => {
                const rows = [];
                let i = 0;
                group.rows.forEach((n) => {
                  rows.push(group.items.slice(i, i + n));
                  i += n;
                });
                return (
                  <div
                    className="bl-hex-group"
                    data-stacked={group.stacked ? "true" : "false"}
                    key={group.group}
                  >
                    <div className="bl-hex-heading">{group.group}</div>
                    {rows.map((row, r) => (
                      <div className="bl-hex-row" key={r}>
                        {row.map((item) => {
                          const on = item.filter
                            ? view === "work" && item.filter === filter
                            : view === item.view;
                          return (
                            <button
                              key={item.label}
                              className="bl-hex-btn"
                              data-on={on ? "true" : "false"}
                              onClick={() => {
                                if (narrow && on) {
                                  setDial(true);
                                  return;
                                }
                                setOpen(null);
                                setProfile(false);
                                if (item.filter) {
                                  setView("work");
                                  setFilter(item.filter);
                                } else {
                                  setView(item.view);
                                }
                              }}
                            >
                              <span className="bl-hex-disc">
                                <Glyph name={item.glyph} size={27} />
                              </span>
                              <span className="bl-hex-name">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <button
              className="bl-rail-compact"
              onClick={() => setBoard(true)}
              aria-label="Open the ideation board"
            >
              <StickyNote size={17} strokeWidth={1.5} />
            </button>

            <BoardCard bar={short} onOpen={() => setBoard(true)} />

          </aside>

          {narrow && dial && (
            <div className="bl-dial" data-leaving={leaving ? "true" : "false"}>
              <div className="bl-dial-head">
                <div className="bl-dial-video">
                  {introVideo ? (
                    <video src={introVideo} autoPlay muted loop playsInline />
                  ) : (
                    <div className="bl-profile-video-ph" />
                  )}
                </div>
                <div className="bl-dial-name">Deeksha Satapathy</div>
                <div className="bl-dial-role">Designer, Cuttack</div>
              </div>

              <div className="bl-ring">
                <div
                  className="bl-ring-hub"
                  ref={hubRef}
                  style={
                    leaving
                      ? { transform: `translate(${leaving.tx}px, ${leaving.ty}px) scale(${leaving.k})` }
                      : undefined
                  }
                >
                  <svg className="bl-asterisk" viewBox="0 0 32 32" aria-hidden="true">
                    <g fill="rgba(0,0,0,0.7)" transform="translate(0 1.6)">
                      <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" />
                      <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" transform="rotate(60 16 16)" />
                      <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" transform="rotate(120 16 16)" />
                    </g>
                    <g fill="url(#bl-metal)">
                      <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" />
                      <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" transform="rotate(60 16 16)" />
                      <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" transform="rotate(120 16 16)" />
                    </g>
                    <g fill="rgba(255,255,255,0.6)">
                      <rect x="14.2" y="4.4" width="1.3" height="23.2" rx="0.65" />
                      <rect x="14.2" y="4.4" width="1.3" height="23.2" rx="0.65" transform="rotate(60 16 16)" />
                      <rect x="14.2" y="4.4" width="1.3" height="23.2" rx="0.65" transform="rotate(120 16 16)" />
                    </g>
                    <circle cx="16" cy="16" r="3.1" fill="url(#bl-metal)" />
                  </svg>
                </div>

                {nav.flatMap((g) => g.items).map((item, i, all) => {
                  const a = (-90 + (i * 360) / all.length) * (Math.PI / 180);
                  const R = 118;
                  return (
                    <button
                      key={item.label}
                      className="bl-ring-btn"
                      style={{
                        left: `calc(50% + ${Math.cos(a) * R}px)`,
                        top: `calc(50% + ${Math.sin(a) * R}px)`,
                        transitionDelay: `${i * 40}ms`,
                      }}
                      onClick={() =>
                        leaveDial(() => {
                          setOpen(null);
                          setProfile(false);
                          if (item.filter) {
                            setView("work");
                            setFilter(item.filter);
                          } else {
                            setView(item.view);
                          }
                        })
                      }
                    >
                      <span className="bl-ring-disc">
                        <Glyph name={item.glyph} size={30} />
                      </span>
                      <span className="bl-ring-name">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="bl-dial-foot">
                <BoardCard
                  bar
                  onOpen={() =>
                    leaveDial(() => setBoard(true))
                  }
                />
                <button
                  className="bl-dial-chip"
                  onClick={() => leaveDial(() => setProfile(true))}
                >
                  My range
                </button>
              </div>
            </div>
          )}

          {narrow && !open && !article && (
            <nav className="bl-flower" aria-label="Sections">
              <span className="bl-flower-glass" aria-hidden="true" />
              {nav.flatMap((g) => g.items).map((item, i) => {
                const angle = ((-90 + i * 60) * Math.PI) / 180;
                const orbit = 78;
                const on = item.filter
                  ? view === "work" && item.filter === filter
                  : view === item.view;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className="bl-flower-petal"
                    data-on={on ? "true" : "false"}
                    aria-current={on ? "page" : undefined}
                    style={{
                      transform: `translate(${Math.cos(angle) * orbit}px, ${Math.sin(angle) * orbit}px)`,
                    }}
                    onClick={() => {
                      setOpen(null);
                      setArticle(null);
                      setProfile(false);
                      setDial(false);
                      if (item.filter) {
                        setView("work");
                        setFilter(item.filter);
                      } else {
                        setView(item.view);
                      }
                    }}
                  >
                    <Glyph name={item.glyph} size={22} />
                    <span className="bl-flower-label">{item.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                className="bl-flower-hub"
                aria-label="About me"
                onClick={() => {
                  setOpen(null);
                  setArticle(null);
                  setProfile(false);
                  setView("about");
                }}
              >
                <Plus size={22} strokeWidth={1.6} />
              </button>
            </nav>
          )}

          {/* main */}
          <main
            className="bl-main"
            data-view={view}
            data-detail-open={open ? "true" : "false"}
            data-cards-condensed={open || profile ? "true" : "false"}
          >
            <div className="bl-topbar">
              <div className="bl-search">
                <Search size={14} strokeWidth={1.6} color={t.fg3} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search work"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                    }}
                    aria-label="Clear search"
                  >
                    <X size={13} strokeWidth={1.6} color={t.fg3} />
                  </button>
                )}
              </div>
              <button
                className="bl-range-btn"
                style={{ marginLeft: "auto" }}
                data-on={profile ? "true" : "false"}
                onClick={() => {
                  setOpen(null);
                  setProfile(!profile);
                }}
              >
                <span className="bl-widget-sheen" aria-hidden="true" />
                <span className="bl-range-disc">
                  <svg className="bl-asterisk" viewBox="0 0 32 32" aria-hidden="true">
                    <defs>
                      <clipPath id="bl-clip-asterisk">
                        <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" />
                        <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" transform="rotate(60 16 16)" />
                        <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" transform="rotate(120 16 16)" />
                      </clipPath>
                    </defs>
                    {/* cast shadow under the form */}
                    <g fill="rgba(0,0,0,0.7)" transform="translate(0 1.6)">
                      <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" />
                      <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" transform="rotate(60 16 16)" />
                      <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" transform="rotate(120 16 16)" />
                    </g>
                    {/* the metal */}
                    <g fill="url(#bl-metal)">
                      <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" />
                      <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" transform="rotate(60 16 16)" />
                      <rect x="13.4" y="3" width="5.2" height="26" rx="2.6" transform="rotate(120 16 16)" />
                    </g>
                    {/* a bright ridge along one edge of each arm, the way a tube catches light */}
                    <g fill="rgba(255,255,255,0.62)">
                      <rect x="14.2" y="4.4" width="1.3" height="23.2" rx="0.65" />
                      <rect x="14.2" y="4.4" width="1.3" height="23.2" rx="0.65" transform="rotate(60 16 16)" />
                      <rect x="14.2" y="4.4" width="1.3" height="23.2" rx="0.65" transform="rotate(120 16 16)" />
                    </g>
                    {/* dark seam on the opposite edge */}
                    <g fill="rgba(0,0,0,0.35)">
                      <rect x="17.4" y="4.4" width="0.9" height="23.2" rx="0.45" />
                      <rect x="17.4" y="4.4" width="0.9" height="23.2" rx="0.45" transform="rotate(60 16 16)" />
                      <rect x="17.4" y="4.4" width="0.9" height="23.2" rx="0.45" transform="rotate(120 16 16)" />
                    </g>
                    <rect width="32" height="32" fill="url(#bl-sheen)" clipPath="url(#bl-clip-asterisk)" />
                    {/* the hub */}
                    <circle cx="16" cy="16" r="3.1" fill="url(#bl-metal)" />
                    <circle cx="15.2" cy="15.1" r="1" fill="rgba(255,255,255,0.7)" />
                  </svg>
                </span>
                <span className="bl-range-label">My range</span>
              </button>
            </div>

            <div className="bl-scroll">
              {view !== "about" && (
              <div className="bl-band bl-band-head">
                <h1
                  style={{
                    fontFamily: t.serif,
                    fontSize: "clamp(28px, 4vw, 40px)",
                    fontWeight: 400,
                    lineHeight: 1.04,
                    color: t.fg,
                    margin: 0,
                    letterSpacing: "-0.035em",
                  }}
                >
                  {heading[0]}
                </h1>
                <p
                  style={{
                    fontFamily: t.sans,
                    fontSize: 14.5,
                    color: t.fg2,
                    margin: "12px 0 0",
                    maxWidth: "52ch",
                    lineHeight: 1.55,
                  }}
                >
                  {heading[1]}
                </p>
              </div>
              )}

              {view === "work" && (
                <>
                  <div className="bl-band bl-band-filters">
                    <div className="bl-seg">
                      <span className="bl-seg-goo" aria-hidden="true">
                        <span
                          className="bl-seg-thumb"
                          style={{
                            left: `calc(3px + (100% - 6px) * ${sorts.findIndex(
                              (x) => x.id === sort
                            )} / ${sorts.length})`,
                            right: `calc(3px + (100% - 6px) * ${
                              sorts.length - 1 - sorts.findIndex((x) => x.id === sort)
                            } / ${sorts.length})`,
                          }}
                        />
                      </span>
                      {sorts.map((x) => (
                        <button
                          key={x.id}
                          data-on={sort === x.id ? "true" : "false"}
                          onClick={() => setSort(x.id)}
                        >
                          {x.label}
                        </button>
                      ))}
                    </div>

                    <span className="bl-band-count">
                      {filter === "all"
                        ? `${projects.length} projects`
                        : `${visible.length} of ${projects.length}`}
                    </span>
                  </div>

                  {visible.length > 0 ? (
                    <div className="bl-grid">
                      {visible.map((p) => (
                        <Card
                          key={p.id}
                          project={p}
                          onOpen={(proj) => {
                            setProfile(false);
                            setArticle(null);
                            setOpen(proj);
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bl-empty">
                      Nothing matches that.{" "}
                      <button
                        onClick={() => setQuery("")}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: t.fg,
                          cursor: "pointer",
                          textDecoration: "underline",
                          textUnderlineOffset: 3,
                          font: "inherit",
                          padding: 0,
                        }}
                      >
                        Clear
                      </button>
                      .
                    </div>
                  )}
                </>
              )}

              {view === "writing" && (
                <WritingView
                  onOpen={(piece) => {
                    setProfile(false);
                    setArticle(piece);
                  }}
                />
              )}
              {view === "about" && <AboutView />}
            </div>

            {open && <CaseStudy
              key={open.id}
              project={open}
              onClose={() => setOpen(null)}
              onOpen={setOpen}
              relatedStudies={relatedCaseStudies(open)}
              renderActions={(backRef) => <CaseStudyActions
                backRef={backRef}
                onBack={() => setOpen(null)}
                onContact={() => {
                  setOpen(null);
                  setArticle(null);
                  setProfile(false);
                  setView("about");
                }}
              />}
            />}

            <ArticlePage
              piece={article}
              onClose={() => setArticle(null)}
              onNavigate={(next) => {
                setArticle(null);
                setProfile(false);
                setView(next);
              }}
            />
          </main>

          <ProfilePanel open={profile} onClose={() => setProfile(false)} paused={!!open} />

          <Board
            open={board}
            onClose={() => setBoard(false)}
            notes={notes}
            setNotes={setNotes}
            mine={mine}
            setMine={setMine}
          />
      </div>
    </>
  );
}


/* ----------------------------------------------------------------
   The site: Stillworld is the front door, the studio is behind it.
   The front door is the live 3D garden from src/stillworld.
---------------------------------------------------------------- */

export default function PortfolioDashboard() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!entered) return;
    const onKey = (e) => {
      if (e.key === "Escape" && e.shiftKey) setEntered(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entered]);

  if (entered) {
    return (
      <div className="bl-site">
        <Dashboard />
        <button className="bl-back-to-world" onClick={() => setEntered(false)}>
          Return to the world
        </button>
      </div>
    );
  }

  return (
    <div className="bl-intro">
      <style>{`
        .bl-intro {
          position:relative; height:100svh; overflow:hidden; background:#a7abc2;
          font-family:'Inter','Helvetica Neue',Arial,sans-serif;
        }
        .bl-enter {
          position:absolute; left:50%; bottom:9%; transform:translateX(-50%);
          z-index:90; display:flex; align-items:center;
          background:none; border:0; padding:16px 26px; cursor:pointer;
          color:#eaf1f3; text-shadow:0 1px 14px rgba(4,16,26,.55);
        }
        .bl-enter-action {
          font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:18px;
          padding:9px 22px; border-radius:999px;
          border:1px solid rgba(234,241,243,.42);
          background:rgba(10,24,34,.34); backdrop-filter:blur(10px);
          transition:background .3s, border-color .3s;
        }
        .bl-enter:hover .bl-enter-action {
          background:rgba(234,241,243,.16); border-color:rgba(234,241,243,.7);
        }
        .bl-site { position:relative; height:100vh; overflow:hidden; background:#06070A; }
        .bl-back-to-world {
          position:fixed; left:50%; bottom:10px; transform:translateX(-50%); z-index:60;
          padding:7px 15px; border:0; border-radius:999px; cursor:pointer;
          background:rgba(255,255,255,.07); backdrop-filter:blur(12px);
          color:rgba(255,255,255,.62); font-family:'Inter',sans-serif;
          font-size:10.5px; letter-spacing:.14em; text-transform:uppercase;
          opacity:.3; transition:opacity .25s, background .25s, color .25s;
        }
        .bl-back-to-world:hover { opacity:1; background:rgba(255,255,255,.13); color:#fff; }
        @media (max-width:650px) {
          .bl-enter { bottom:12%; }
          .bl-enter-action { font-size:17px; }
          .bl-back-to-world { bottom:92px; }
        }
      `}</style>

      <StillworldHome />

      <button className="bl-enter" onClick={() => setEntered(true)}>
        <span className="bl-enter-action">Enter the studio</span>
      </button>
    </div>
  );
}
