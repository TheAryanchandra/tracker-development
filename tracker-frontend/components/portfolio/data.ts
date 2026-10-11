/**
 * Single source of truth for Aryan's portfolio content.
 * Consumed by the UI, the role-fit matcher, the dev terminal and the
 * offline copilot brain so every surface stays factually consistent.
 */

export const PROFILE = {
  name: 'Aryan Chandra',
  shortName: 'ARYAN',
  title: 'Software Engineer',
  roles: ['Backend Engineer', 'Full-Stack Engineer', 'AI Systems Engineer', 'Mobile Engineer'],
  location: 'Delhi NCR, India',
  relocation: 'Open to Remote & Relocation',
  availability: 'Immediate joiner — SDE-1 / SWE-1',
  email: 'aryanchandra3456@gmail.com',
  phone: '+91 92057 23006',
  phoneRaw: '+919205723006',
  github: 'https://github.com/TheAryanchandra',
  linkedin: 'https://www.linkedin.com/in/thearyanchandra/',
  resume: 'https://drive.google.com/file/d/1fnwhYzbHkrANYvNCtQWQndm9WKlAl2QD/view?usp=sharing',
  education: 'B.Tech, Software Engineering',
  tagline:
    'I build distributed backends, agentic AI systems and mobile products that real people use — 10,000+ installs, 50K+ daily transactions, 99.9% uptime.',
};

export const METRICS = [
  { value: 10000, suffix: '+', label: 'Play Store installs', hint: 'Fonofy Partners · 4.8★' },
  { value: 50000, suffix: '+', label: 'Daily transactions', hint: 'GiantCell commerce' },
  { value: 99.9, suffix: '%', label: 'Uptime SLA', hint: '24 months in prod', decimals: 1 },
  { value: 200, prefix: '<', suffix: 'ms', label: 'P95 latency', hint: 'RAG retrieval' },
  { value: 420, suffix: '+', label: 'DSA problems', hint: 'LeetCode + SDE sheet' },
];

export interface Experience {
  org: string;
  role: string;
  kind: string;
  summary: string;
  points: string[];
  stack: string[];
}

export const EXPERIENCE: Experience[] = [
  {
    org: 'Ta Rule Technology Pvt. Ltd.',
    role: 'Software Engineer',
    kind: 'Full-time · Production Engineering',
    summary: 'Full-stack, backend, distributed systems, and agentic AI engineering for healthcare commerce and device trade-in ecosystems.',
    points: [
      'Architected GiantCell healthcare commerce platform: 150+ REST APIs serving 50,000+ daily transactions with 99.9% uptime SLA.',
      'Reduced inventory query latency from 2.1s to 1.47s (30% reduction) via Redis in-memory caching and compound MongoDB indexing.',
      'Engineered internal RAG support copilot using LangGraph, dense vector embeddings, and semantic retrieval for automated ticket triage.',
      'Optimized web frontend performance, elevating Google Lighthouse score from 65 to 92 through bundle splitting and image optimization.',
      'Shipped Fonofy Partners merchant app on Google Play Store with 10,000+ verified downloads and 4.8★ rating.',
    ],
    stack: ['Java 21', 'Spring Boot 3', 'Node.js', 'Express', 'React Native', 'MongoDB', 'Redis', 'Docker'],
  },
  {
    org: 'Indian Oil Corporation Ltd. (IOCL)',
    role: 'Software Engineer Intern',
    kind: 'Internship · Enterprise ML & Systems',
    summary: 'Machine learning inference, time-series forecasting, and real-time telemetry pipelines for industrial network operations.',
    points: [
      'Engineered XGBoost-based network bandwidth forecasting models to predict peak utilization and prevent pipeline throttling.',
      'Built full-stack real-time monitoring dashboard with React, D3.js visualization, and Node.js WebSockets for sub-100ms telemetry updates.',
      'Optimized machine learning inference pipelines, reducing prediction response times and memory consumption.',
    ],
    stack: ['Python', 'XGBoost', 'React', 'D3.js', 'Node.js', 'WebSockets', 'TimeSeries ML'],
  },
  {
    org: 'B.Tech — Software Engineering',
    role: 'Computer Science & Engineering',
    kind: 'Foundations',
    summary: 'Core computer science fundamentals: data structures, algorithms, operating systems, distributed systems, and DBMS.',
    points: ['420+ DSA problems solved across LeetCode and the Striver SDE sheet (Arrays, Trees, Graphs, DP, Tries).'],
    stack: ['Data Structures', 'Algorithms', 'System Design', 'OS', 'DBMS', 'Networks'],
  },
];

export interface Project {
  id: string;
  title: string;
  kicker: string;
  oneLiner: string;
  problem: string;
  solution: string;
  contribution: string;
  architecture: string;
  decisions: string;
  approach: string[];
  impact: string[];
  stack: string[];
  href: string;
  demoUrl?: string;
  accent: string;
  award?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'jarvis',
    title: 'Jarvis — AI-Powered Engineering Growth Platform',
    kicker: 'Agentic AI · Multi-Model Copilot',
    oneLiner: 'Production-ready AI copilot with multi-model gateway, RAG semantic retrieval, and tool orchestration.',
    problem:
      'Engineering teams need an intelligent assistant that can answer technical architectural questions grounded in actual codebases, execute tool workflows, and withstand single-provider LLM outages.',
    solution:
      'Engineered an agentic copilot with LangGraph orchestration, multi-model failover (Gemini / Claude / GPT-4o), in-process ONNX embeddings, vector search, and WebSocket streaming.',
    contribution:
      'Architected end-to-end: multi-model routing gateway, RAG vector retrieval pipeline, Web Audio synthesis, and real-time streaming state synchronization.',
    architecture:
      'Next.js 14 Client ↔ WebSocket Gateway ↔ LangGraph Agent Loop ↔ Model Gateway (Auto-Failover) ↔ Vector DB (Qdrant/Atlas) & Redis Cache.',
    decisions:
      'Implemented dynamic circuit-breaker fallbacks across model providers to guarantee zero downtime during API rate limits; used local ONNX embeddings for instant offline fallback.',
    approach: [
      'LangGraph ReAct loop: Plan → Think → Act → Observe → Synthesize.',
      'Multi-model gateway with automatic provider failover and streaming chunk buffer.',
      'Hybrid semantic vector retrieval with verified source document citations.',
      'Persistent WebSockets and Web Audio speech synthesis for low-latency voice interaction.',
    ],
    impact: [
      '100% availability through automated multi-model failover',
      'Sub-250ms initial token streaming latency (TTFT)',
      'Grounded answers with zero hallucination on verified codebase facts',
    ],
    stack: ['TypeScript', 'Next.js 14', 'Node.js', 'Express', 'LangGraph', 'Qdrant', 'MongoDB Atlas', 'WebSockets', 'Redis'],
    href: 'https://github.com/TheAryanchandra/tracker-development',
    demoUrl: 'https://aryanchandra.in',
    accent: '#38bdf8',
  },
  {
    id: 'stadium',
    title: 'Stadium Pulse — AI Venue Intelligence',
    kicker: 'Agentic AI · Google Cloud Award',
    oneLiner: 'Multi-agent venue crowd intelligence system awarded Top Builder in Google Cloud Agentic Premier League.',
    problem:
      'Stadium operators during high-attendance sports events lack real-time automated intelligence to predict crowd density surges, congestion hazards, and route security dispatch.',
    solution:
      'Built a distributed multi-agent system orchestrating specialized agents (Planner, Analyst, Dispatcher) with strict Pydantic validation over Gemini models.',
    contribution:
      'Designed the multi-agent state graph architecture, schema validation pipelines, prompt chaining, and serverless deployment on Google Cloud Run.',
    architecture:
      'IoT Telemetry & Video Feeds → LangGraph State Machine (Routing & Planning) → Gemini Schema Validator → Real-Time Event Bus → Cloud Run.',
    decisions:
      'Enforced strict Pydantic JSON schemas on model inferences to eliminate non-deterministic formatting errors during high-urgency crowd dispatch instructions.',
    approach: [
      'LangGraph multi-agent state graph orchestrating specialized planning and dispatch agents.',
      'Gemini API calls validated against strict Pydantic schemas for deterministic structured output.',
      'Semantic context retrieval over venue spatial topology maps.',
      'Zero-downtime serverless container deployment on Google Cloud Run.',
    ],
    impact: [
      'Top Builder Award — Google Cloud Agentic Premier League',
      'Sub-500ms end-to-end agent decision and dispatch latency',
      'Serverless autoscaling with zero baseline idle cost',
    ],
    stack: ['Python', 'LangGraph', 'Gemini API', 'Pydantic', 'OpenAI Embeddings', 'Google Cloud Run', 'Docker'],
    href: 'https://github.com/TheAryanchandra/agentic-premier-league',
    demoUrl: 'https://github.com/TheAryanchandra/agentic-premier-league',
    accent: '#818cf8',
    award: 'Top Builder Award',
  },
  {
    id: 'giantcell',
    title: 'GiantCell Healthcare Platform',
    kicker: 'High-Throughput Commerce & APIs',
    oneLiner: '150+ REST APIs, 50K+ daily transactions, and 99.9% uptime over 24 months.',
    problem:
      'A healthcare commerce business experienced high inventory query latency (2.1s), cart drop-offs, and reconciliation discrepancies during peak hospital ordering windows.',
    solution:
      'Engineered a high-concurrency commerce backend with compound MongoDB indexing, Redis distributed caching, and idempotent payment webhooks.',
    contribution:
      'Led backend engineering: designed 150+ REST endpoints, database indexing strategy, Redis cache invalidation layer, and payment integration with Razorpay and Paytm.',
    architecture:
      'Client Apps ↔ Nginx Gateway ↔ Node.js Cluster ↔ Redis Sentinel Cache (LRU) ↔ MongoDB Replica Set & MySQL ↔ Payment Gateways.',
    decisions:
      'Replaced unindexed relational table scans with compound MongoDB indexes and Redis cache-aside caching, cutting inventory latency from 2.1s to 1.47s (30% improvement).',
    approach: [
      '150+ REST APIs on Node.js/Express with a React Native client app.',
      'Idempotent payment webhook flows with distributed Redis mutex locks.',
      'Real-time inventory cache synchronisation backed by Redis 7 and MongoDB.',
      'Dockerised container deployments with Prometheus and Grafana SLA monitoring.',
    ],
    impact: [
      '50,000+ daily transactions processed reliably',
      '99.9% uptime maintained across 24 consecutive months',
      'Inventory query latency reduced from 2.1s to 1.47s',
    ],
    stack: ['Node.js', 'Express', 'React Native', 'MongoDB', 'Redis', 'Docker', 'MySQL', 'Razorpay'],
    href: 'https://github.com/TheAryanchandra',
    demoUrl: 'https://giantcell.in',
    accent: '#34d399',
  },
  {
    id: 'fonofy',
    title: 'Fonofy Partners',
    kicker: 'B2B Diagnostics & Trade-In Commerce',
    oneLiner: 'Merchant trade-in platform with 10,000+ downloads on Google Play Store and 4.8★ rating.',
    problem:
      'Mobile merchants suffered from slow manual trade-in device inspections, subjective pricing disputes, and delayed device catalog fulfillment.',
    solution:
      'Built a full-stack mobile platform with automated on-device hardware diagnostics, dynamic algorithmic device valuation, and seamless trade-in ordering.',
    contribution:
      'Developed the React Native merchant application and the high-throughput Node.js microservices handling device valuations and inventory syncing.',
    architecture:
      'React Native App ↔ Express Gateway ↔ Dynamic Valuation Engine ↔ MongoDB Atlas ↔ AWS S3 Object Storage.',
    decisions:
      'Built an offline-first SQLite cache for device diagnostics so merchant evaluations complete uninterrupted even in weak cellular connectivity.',
    approach: [
      'Automated hardware diagnostic checks (screen digitizer, sensors, battery health, camera).',
      'Algorithmic real-time trade-in valuation pricing engine with dynamic market depreciation.',
      'Instant merchant KYC and trade-in fulfillment tracking pipeline.',
      'Shipped on Google Play Store with continuous release delivery.',
    ],
    impact: [
      '10,000+ verified downloads on Google Play Store',
      '4.8★ user rating across 500+ merchant reviews',
      '₹2Cr+ trade-in device GMV processed through the platform',
    ],
    stack: ['React Native', 'Node.js', 'Express', 'MongoDB Atlas', 'AWS S3', 'Firebase Cloud Messaging'],
    href: 'https://play.google.com/store/apps/details?id=com.fonofy.merchant&hl=en_IN',
    demoUrl: 'https://play.google.com/store/apps/details?id=com.fonofy.merchant&hl=en_IN',
    accent: '#38bdf8',
  },
  {
    id: 'delhi_golf',
    title: 'Delhi Golf Federation App',
    kicker: 'Tournament & Real-Time Scoring',
    oneLiner: 'Official iOS and Android tournament management platform with live leaderboards and handicap tracking.',
    problem:
      'Paper scorecards and manual scoring caused tournament delays, handicap calculation disputes, and zero real-time spectator visibility across 18-hole courses.',
    solution:
      'Developed a real-time mobile scoring app with live WebSocket leaderboard broadcasts, USGA-compliant handicap algorithms, and tournament brackets.',
    contribution:
      'Engineered the mobile client in React Native and implemented the real-time leaderboard WebSocket pipeline with sub-150ms broadcast latency.',
    architecture:
      'React Native App ↔ WebSocket Gateway ↔ Spring Boot / Node.js ↔ PostgreSQL ↔ Redis Pub/Sub.',
    decisions:
      'Leveraged Redis Pub/Sub channels partitioned per tournament hole to broadcast live score updates to thousands of spectator devices concurrently.',
    approach: [
      'Real-time hole-by-hole scorecard synchronization with offline fallback.',
      'Algorithmic USGA-compliant handicap differential index computation.',
      'Live tournament leaderboard with instant rank movement animations.',
      'Verified player profiles and tournament registration flow.',
    ],
    impact: [
      '5,000+ verified active players on Apple App Store (4.9★)',
      'Sub-150ms real-time leaderboard update broadcast latency',
      'Zero scoring disputes across 30+ regional federation tournaments',
    ],
    stack: ['React Native', 'Node.js', 'PostgreSQL', 'WebSockets', 'Redis', 'Apple App Store'],
    href: 'https://apps.apple.com/in/app/delhi-golf-federation/id6758339712',
    demoUrl: 'https://apps.apple.com/in/app/delhi-golf-federation/id6758339712',
    accent: '#a78bfa',
  },
  {
    id: 'tutor',
    title: 'Concept Learning Engine',
    kicker: 'Adaptive AI Pedagogy & Knowledge Graphs',
    oneLiner: 'Adaptive AI tutor utilizing Directed Acyclic Graphs (DAGs) and dense embeddings to diagnose and bridge conceptual gaps.',
    problem:
      'Learners tackling advanced computer science topics often struggle because foundational prerequisite gaps remain undetected in traditional linear syllabi.',
    solution:
      'Constructed an adaptive knowledge engine modeling prerequisite concepts as a Directed Acyclic Graph (DAG) coupled with semantic vector retrieval.',
    contribution:
      'Designed the DAG prerequisite traversal algorithm, knowledge gap diagnostic state machine, and vector-grounded remedial explanations.',
    architecture:
      'Next.js 14 Client ↔ FastAPI Python Service ↔ DAG Graph Engine ↔ Qdrant Vector Index ↔ LLM Context Injector.',
    decisions:
      'Combined graph topological sorting with cosine vector similarity so remedial explanations explicitly address root prerequisite concepts first.',
    approach: [
      'Engineered directed acyclic graph (DAG) mapping topic dependencies and prerequisite trees.',
      'Semantic document retrieval over course materials using dense embeddings.',
      'Adaptive diagnostic evaluation with structured schema validation for real-time gap discovery.',
      'Interactive quiz generation and conversational remediation loop.',
    ],
    impact: [
      'Automated root knowledge gap diagnosis in 94% of benchmark trials',
      'Interactive real-time graph visualization of concept mastery',
      'Sub-250ms diagnostic retrieval time',
    ],
    stack: ['Python', 'FastAPI', 'Next.js 14', 'Qdrant Vector DB', 'OpenAI Embeddings', 'MongoDB'],
    href: 'https://github.com/TheAryanchandra',
    demoUrl: 'https://github.com/TheAryanchandra',
    accent: '#f472b6',
  },
];

export const ENGINEERING_PRINCIPLES = [
  {
    num: '01',
    title: 'High Concurrency via Virtual Threads',
    summary: 'Project Loom fibers over reactive WebFlux',
    desc: 'Java 21 virtual threads handle blocking network and vector database I/O with negligible memory footprint, preserving clean synchronous code and full stacktraces.',
  },
  {
    num: '02',
    title: 'Event-Driven Decoupling',
    summary: 'Apache Kafka partitions isolate query traffic',
    desc: 'Heavy document OCR, embedding, and order processing are offloaded to Kafka topics. Ingestion spikes never degrade user-facing sub-200ms query latency.',
  },
  {
    num: '03',
    title: 'Idempotency & Cache Integrity',
    summary: 'Distributed Redis locks & ACID transactions',
    desc: 'Distributed mutex locks prevent race conditions in inventory and payment transactions; TTL jitter on cache keys protects databases against thundering herds.',
  },
  {
    num: '04',
    title: 'Grounded RAG with Hybrid Fusion',
    summary: 'Dense HNSW + Sparse BM25 Lexical search',
    desc: 'Pure vector similarity fails on exact technical codes; hybrid Reciprocal Rank Fusion guarantees both semantic understanding and keyword precision with verified citations.',
  },
];

export const APPS = [
  {
    name: 'Fonofy Partners',
    role: 'Device trade-in & refurbished commerce',
    downloads: '10,000+',
    rating: '4.8',
    desc: 'B2B merchant app: device diagnostics, automated trade-in grading, live dynamic pricing and fulfilment.',
    url: 'https://play.google.com/store/apps/details?id=com.fonofy.merchant&hl=en_IN',
    store: 'Google Play',
    tech: ['React Native', 'Node.js', 'MongoDB'],
  },
  {
    name: 'Delhi Golf Federation',
    role: 'Tournament & league management',
    downloads: '5,000+',
    rating: '4.9',
    desc: 'Real-time scoring, handicap calculation, live leaderboards and verified player profiles.',
    url: 'https://apps.apple.com/in/app/delhi-golf-federation/id6758339712',
    store: 'App Store',
    tech: ['React Native', 'Spring Boot', 'PostgreSQL', 'WebSocket'],
  },
  {
    name: 'Carenzy',
    role: 'Healthcare & caregiver booking',
    downloads: '2,000+',
    rating: '4.7',
    desc: 'On-demand caregiver dispatch, vitals telemetry, scheduling and patient health timelines.',
    url: 'https://carenzy.com',
    store: 'Web',
    tech: ['React Native', 'Node.js', 'Firebase', 'GCP'],
  },
];

export interface SkillGroup {
  id: string;
  label: string;
  skills: string[];
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'backend',
    label: 'Backend and APIs',
    skills: ['Java 21', 'Spring Boot 3', 'Node.js', 'Express', 'REST APIs', 'WebSockets', 'Project Loom', 'Microservices'],
  },
  {
    id: 'distributed',
    label: 'Distributed Systems',
    skills: ['Apache Kafka', 'Event Streaming', 'Distributed Locks', 'KRaft Quorum', 'Dead Letter Queues', 'Horizontal Partitioning'],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    skills: ['React', 'Next.js 14', 'TypeScript', 'Tailwind CSS', 'React Native', 'Three.js', 'HTML5 / CSS3'],
  },
  {
    id: 'databases',
    label: 'Databases and Caching',
    skills: ['PostgreSQL 16', 'MongoDB Atlas', 'Redis 7 Cache', 'MySQL', 'HNSW Vector Indexes', 'ACID Transactions'],
  },
  {
    id: 'cloud',
    label: 'Cloud and DevOps',
    skills: ['Docker', 'Google Cloud (GCP)', 'Cloud Run', 'CI/CD Pipelines', 'Linux / Bash', 'Nginx'],
  },
  {
    id: 'ai',
    label: 'AI and RAG',
    skills: ['RAG Pipelines', 'LangGraph', 'Qdrant Vector DB', 'OpenAI & Gemini APIs', 'Dense & Sparse Embeddings', 'Pydantic Validation'],
  },
];

/** Map a skill name to the projects that actually used it (for highlight). */
export function projectsUsingSkill(skill: string): string[] {
  const s = skill.toLowerCase();
  const alias: Record<string, string[]> = {
    java: ['java 21'],
    kafka: ['kafka'],
    'spring boot': ['spring boot 3', 'spring boot'],
    'vector search': ['qdrant', 'mongodb atlas'],
    rag: ['spring ai', 'qdrant'],
    'gemini api': ['gemini api'],
    'cloud run': ['cloud run'],
    gcp: ['cloud run'],
    mongodb: ['mongodb atlas', 'mongodb'],
    'rest apis': ['express', 'spring boot 3'],
    microservices: ['docker', 'kafka'],
    react: ['next.js', 'react native'],
  };
  const needles = [s, ...(alias[s] || [])];
  return PROJECTS.filter((p) =>
    p.stack.some((t) => needles.some((n) => t.toLowerCase().includes(n))),
  ).map((p) => p.id);
}

/** Role-fit matcher vocabulary: keyword → evidence from real work. */
export const FIT_VOCAB: { keys: string[]; label: string; evidence: string }[] = [
  { keys: ['java'], label: 'Java', evidence: 'Java 21 virtual threads in the RAG Copilot' },
  { keys: ['spring', 'spring boot'], label: 'Spring Boot', evidence: 'Spring Boot 3 + Spring AI gateway' },
  { keys: ['kafka', 'event-driven', 'event driven', 'streaming', 'pub/sub', 'message queue'], label: 'Kafka / Event-driven', evidence: 'Kafka ingestion pipeline' },
  { keys: ['microservice', 'distributed'], label: 'Distributed systems', evidence: 'Decoupled ingestion & query services' },
  { keys: ['node', 'node.js', 'express'], label: 'Node.js', evidence: '150+ REST APIs on GiantCell' },
  { keys: ['typescript', 'javascript'], label: 'TypeScript / JS', evidence: 'Next.js + Node.js products' },
  { keys: ['python'], label: 'Python', evidence: 'LangGraph agents · IOCL ML pipelines' },
  { keys: ['react', 'next.js', 'nextjs', 'frontend'], label: 'React / Next.js', evidence: 'This portfolio + Jarvis dashboard' },
  { keys: ['react native', 'mobile', 'android', 'ios'], label: 'Mobile', evidence: '3 shipped apps · 10K+ installs' },
  { keys: ['sql', 'postgres', 'postgresql', 'mysql', 'rdbms'], label: 'SQL databases', evidence: 'PostgreSQL & MySQL in production' },
  { keys: ['mongodb', 'nosql'], label: 'MongoDB', evidence: 'Atlas Vector Search memory' },
  { keys: ['redis', 'cache', 'caching'], label: 'Redis / Caching', evidence: 'Hot-path caching for commerce + RAG' },
  { keys: ['docker', 'container', 'kubernetes', 'k8s'], label: 'Containers', evidence: 'Dockerised services' },
  { keys: ['gcp', 'google cloud', 'cloud run', 'aws', 'azure', 'cloud'], label: 'Cloud', evidence: 'Serverless on Google Cloud Run' },
  { keys: ['llm', 'genai', 'gen ai', 'generative', 'rag', 'langchain', 'langgraph', 'agent', 'ai'], label: 'LLM / Agentic AI', evidence: 'Top Builder Award · LangGraph' },
  { keys: ['vector', 'embedding', 'semantic search', 'search'], label: 'Vector search', evidence: 'Qdrant dense + BM25 hybrid' },
  { keys: ['rest', 'api', 'apis', 'graphql'], label: 'API design', evidence: '150+ production REST APIs' },
  { keys: ['payment', 'fintech', 'razorpay'], label: 'Payments', evidence: 'Razorpay & Paytm integrations' },
  { keys: ['websocket', 'real-time', 'realtime'], label: 'Real-time', evidence: 'Live leaderboards & IoT sockets' },
  { keys: ['data structure', 'algorithm', 'dsa', 'problem solving', 'problem-solving'], label: 'DSA', evidence: '420+ problems solved' },
  { keys: ['system design', 'scalab', 'high availability', 'reliability', 'uptime', 'sla'], label: 'Scale & reliability', evidence: '99.9% uptime · 50K+ txns/day' },
  { keys: ['ci/cd', 'cicd', 'devops', 'linux', 'git'], label: 'DevOps', evidence: 'CI/CD pipelines on Linux' },
  { keys: ['ml', 'machine learning', 'forecast', 'time series', 'time-series'], label: 'ML', evidence: 'IOCL forecasting models' },
];

export const ROLE_PRESETS: Record<string, string> = {
  'Backend SDE-1':
    'Java Spring Boot microservices, REST APIs, SQL, Redis caching, Kafka, distributed systems, Docker, system design, data structures and algorithms.',
  'Full-Stack SDE':
    'React, Next.js, TypeScript, Node.js, REST APIs, PostgreSQL or MongoDB, CI/CD, cloud deployment, problem solving.',
  'AI / LLM Engineer':
    'Python, LLM applications, RAG, LangChain or LangGraph agents, vector search and embeddings, APIs, cloud deployment.',
  'Mobile Engineer':
    'React Native, mobile apps on Android and iOS, REST APIs, real-time WebSocket features, Firebase, performance.',
};

export function computeFit(jd: string) {
  const text = ` ${jd.toLowerCase()} `;
  const asked = FIT_VOCAB.filter((v) => v.keys.some((k) => text.includes(k)));
  if (asked.length === 0) return { score: 0, matched: [], asked: 0 };
  // All vocabulary entries are backed by real work, so a match = evidence.
  const score = Math.min(98, Math.round(62 + asked.length * 3.2));
  return { score, matched: asked, asked: asked.length };
}

export const CANDIDATE_BRIEF = `Aryan Chandra — Software Engineer (SDE-1 · Backend / Full-Stack / AI)
• Software Engineer @ Ta Rule Technology — GiantCell: 150+ APIs, 50K+ daily txns, 99.9% uptime (24 mo)
• Shipped Fonofy Partners app — 10,000+ Play Store installs, 4.8★
• Enterprise RAG Copilot — Java 21, Spring Boot 3, Kafka, Qdrant hybrid search, sub-200ms P95
• Top Builder Award — Google Cloud Agentic Premier League (LangGraph, Gemini, Cloud Run)
• 420+ DSA problems · B.Tech Software Engineering · ex-IOCL SWE Intern
• Delhi NCR · Open to remote & relocation · Immediate joiner
• ${PROFILE.email} · ${PROFILE.phone}
• Resume: ${PROFILE.resume}`;

export const CHAPTERS = [
  { id: 'hero', label: 'Intro' },
  { id: 'experience', label: 'Experience' },
  { id: 'systems', label: 'Systems Lab' },
  { id: 'projects', label: 'Projects' },
  { id: 'stack', label: 'Stack' },
  { id: 'contact', label: 'Contact' },
];
