export interface CollabItem {
  id: string;
  partner: string;
  partnerType: "Open Source Org" | "Startup" | "Tech Studio" | "Research Team" | "Personal" | "Employment";
  title: string;
  role: string;
  period: string;
  description: string;
  contributions: string[];
  techStack: string[];
  link?: string;
  status: "ACTIVE" | "COMPLETED" | "ONGOING";
  asciiLogo?: string;
}

export interface SkillCategory {
  category: string;
  icon: string;
  skills: { name: string; level: number; experience: string; tag: string }[];
}

export type Max8Colors =
  | []
  | [string]
  | [string, string]
  | [string, string, string]
  | [string, string, string, string]
  | [string, string, string, string, string]
  | [string, string, string, string, string, string]
  | [string, string, string, string, string, string, string]
  | [string, string, string, string, string, string, string, string];

export interface Certification {
  name: string;
  code?: string;
  issuer: string;
  date: string;
  /** Validity has lapsed: shown as "Earned <year>" instead of the full date. */
  lapsed?: boolean;
}

export interface EducationItem {
  name: string;
  school: string;
  year: string;
}

// ---------------------------------------------------------------------------
// Everything shown on the site comes from this file.
// Source: CV (March 2023) and letter of intent (2023), plus certifications
// earned since. Personal details from the CV are deliberately left out, and
// employers are not named.
// ---------------------------------------------------------------------------

export const PORTFOLIO_DATA = {
  developer: {
    name: "Jose Bulalaque",
    handle: "josebulalaque",
    title: "Senior Systems Engineer",
    alias: "jose@srv-01",
    github: "https://github.com/josebulalaque",
    linkedin: "https://www.linkedin.com/in/josebulalaque/",
    // Leave empty to hide.
    twitter: "",
    location: "Philippines // UTC+8",
    status: " ONLINE // ALL SERVICES NOMINAL",
    // Shown in the GUI dashboard.
    focus: "VMware, Windows & Linux Infrastructure, Automation with Ansible & PowerShell",
    experience: "15+ Years",
    CLI_EMOJI: "🖥️",
    palette: [
      "#0f0f0f",
      "#ef4444",
      "#22c55e",
      "#eab308",
      "#3b82f6",
      "#a855f7",
      "#06b6d4",
      "#f8fafc",
    ],
    bio: "Infrastructure engineer with 15+ years in systems implementation and administration, from first-line support to senior systems engineering. I plan, build and run VMware, Windows and Linux infrastructure, automate it with Ansible and PowerShell, and deploy monitoring with Zabbix, Grafana and the TICK stack. I always aim to do more with less: automating repetitive work removes human error and frees the team for the work that matters. I also run regular knowledge-sharing sessions so the whole team levels up.",
    quote: '"Developer by passion, infrastructure engineer by profession."',
    asciiBanner: `
     _   ___   ____   _____
    | | / _ \\ / ___| | ____|
 _  | || | | |\\___ \\ |  _|
| |_| || |_| | ___) || |___
 \\___/  \\___/ |____/ |_____|
 ____   _   _  _         _     _         _      ___   _   _  _____
| __ ) | | | || |       / \\   | |       / \\    / _ \\ | | | || ____|
|  _ \\ | | | || |      / _ \\  | |      / _ \\  | | | || | | ||  _|
| |_) || |_| || |___  / ___ \\ | |___  / ___ \\ | |_| || |_| || |___
|____/  \\___/ |_____|/_/   \\_\\|_____|/_/   \\_\\ \\__\\_\\ \\___/ |_____|
`,
    // Shown by `neofetch`.
    specs: {
      OS: "Windows Server / RHEL / Ubuntu / VMware ESXi",
      Kernel: "6.x LTS",
      Uptime: "15+ years and counting",
      Shell: "PowerShell 7 / bash 5.2",
      Terminal: "Web-TUI Astro",
      WM: "tmux",
      Editor: "VS Code / Vim",
      CPU: "Whatever the hypervisor gives me",
      Memory: "Never enough",
    },
  },

  // Levels are self-assessed; years are counted from when each tool first appears in the CV.
  skills: [
    {
      category: "Virtualisation (VMware)",
      icon: "🗄️",
      skills: [
        { name: "vSphere / ESXi / vCenter", level: 92, experience: "13 yrs", tag: "EXPERT" },
        { name: "vSAN", level: 80, experience: "5 yrs", tag: "ADVANCED" },
        { name: "NSX / Network Virtualization", level: 75, experience: "3 yrs", tag: "ADVANCED" },
        { name: "Horizon (VDI)", level: 75, experience: "8 yrs", tag: "ADVANCED" },
        { name: "PowerCLI", level: 88, experience: "8 yrs", tag: "PRO" },
      ],
    },
    {
      category: "Windows & Linux Systems",
      icon: "🐧",
      skills: [
        { name: "Windows Server", level: 92, experience: "15 yrs", tag: "EXPERT" },
        { name: "Active Directory / DNS / DHCP / NPS", level: 92, experience: "15 yrs", tag: "EXPERT" },
        { name: "MDT & DFS", level: 88, experience: "15 yrs", tag: "PRO" },
        { name: "Linux (RHEL / Ubuntu)", level: 85, experience: "7 yrs", tag: "PRO" },
      ],
    },
    {
      category: "Automation & DevOps",
      icon: "⚙️",
      skills: [
        { name: "PowerShell", level: 92, experience: "13 yrs", tag: "EXPERT" },
        { name: "Ansible", level: 85, experience: "6 yrs", tag: "PRO" },
        { name: "Bash", level: 80, experience: "7 yrs", tag: "ADVANCED" },
        { name: "Azure DevOps Pipelines / Git", level: 75, experience: "8 yrs", tag: "ADVANCED" },
        { name: "Terraform", level: 60, experience: "POC", tag: "INTERMEDIATE" },
      ],
    },
    {
      category: "Monitoring, Cloud & Network",
      icon: "📈",
      skills: [
        { name: "Zabbix / Grafana / TICK", level: 85, experience: "6 yrs", tag: "PRO" },
        { name: "Graylog / ELK", level: 75, experience: "6 yrs", tag: "ADVANCED" },
        { name: "NetBox / Passbolt", level: 75, experience: "6 yrs", tag: "ADVANCED" },
        { name: "AWS / Azure", level: 60, experience: "6 yrs", tag: "INTERMEDIATE" },
        { name: "Networking (CCNA)", level: 70, experience: "6 yrs", tag: "INTERMEDIATE" },
      ],
    },
  ] as SkillCategory[],

  // Work experience, newest first. Shown by `experience` and in the GUI.
  collabs: [
    {
      id: "senior-systems-engineer",
      partner: "",
      partnerType: "Employment",
      title: "Senior Systems Engineer",
      role: "Senior Systems Engineer",
      period: "Dec 2020 - Apr 2023",
      status: "COMPLETED",
      description:
        "Provisioning, support, monitoring and management of back-office infrastructure services, with third-level support for onsite services.",
      contributions: [
        "Automated Linux patching with Ansible: a dynamic VMware inventory finds servers by vCenter tag, snapshots them, then runs distro-specific updates.",
        "Built MDT with DFS replication across 3 sites for weekly onboarding of 200+ laptops.",
        "Wrote PowerShell and PowerCLI tooling for AD onboarding, bulk live VM migration, ESXi provisioning, VM inventory to CMDB, DHCP lease clean-up and server health-check reports.",
        "Deployed Filebeat and Winlogbeat agents with Ansible, and stood up NetBox, Grafana, Graylog, Zabbix and Passbolt.",
        "Planned and built new back-office sites: AD, DNS, DHCP, NPS, MDT and VMware vSAN.",
        "Ran knowledge-sharing sessions on DNS, Active Directory, VMware and PowerShell for the helpdesk team.",
      ],
      techStack: ["VMware vSphere", "vSAN", "Ansible", "PowerShell", "Bash", "Windows Server", "Linux", "Zabbix", "Grafana"],
    },
    {
      id: "infrastructure-engineer",
      partner: "",
      partnerType: "Employment",
      title: "Infrastructure Engineer",
      role: "Infrastructure Engineer",
      period: "May 2018 - Nov 2020",
      status: "COMPLETED",
      description:
        "Remote provisioning, support and management of servers and virtualisation infrastructure for an international organisation, covering support outside its home-office hours.",
      contributions: [
        "Cut server build time from 3 hours to 30 minutes by moving scripts into Bitbucket and running them through Azure DevOps pipelines with on-premises agents.",
        "Wrote a PowerShell build script that talks to IPAM, the password manager, vCenter and Active Directory; used it to build 1,200+ VMs.",
        "Created a VMware content library spanning 5 vCenters so templates stay identical everywhere.",
        "Evaluated Terraform with a two-tier AWS web application proof of concept and presented it at an internal global learning event.",
        "Deployed PRTG to monitor latency to VDI services.",
      ],
      techStack: ["VMware vSphere", "PowerShell", "Azure DevOps", "Bitbucket", "Terraform", "AWS", "PRTG"],
    },
    {
      id: "systems-engineer",
      partner: "",
      partnerType: "Employment",
      title: "Systems Engineer",
      role: "Systems Engineer",
      period: "May 2013 - Apr 2018",
      status: "COMPLETED",
      description:
        "Planned, implemented and maintained server infrastructure for a company and its subsidiaries, with third-level support for mission-critical systems.",
      contributions: [
        "Deployed VMware vSphere 5.5 on HP ProLiant servers with EMC VNXe storage.",
        "Upgraded Exchange Server 2007 to 2013 for 500+ mailboxes.",
        "Implemented DFS and redirected Documents folders for 1,000+ user accounts.",
        "Managed Veritas NetBackup and Symantec Enterprise Vault, and deployed Synology and Seagate NAS for backups.",
        "Supervised second-level support and trained L1 and L2 staff.",
      ],
      techStack: ["VMware vSphere", "EMC VNXe", "Windows Server", "Exchange", "DFS", "NetBackup"],
    },
    {
      id: "technical-support-engineer",
      partner: "",
      partnerType: "Employment",
      title: "Technical Support Engineer",
      role: "Technical Support Engineer",
      period: "Mar 2011 - May 2013",
      status: "COMPLETED",
      description:
        "First-level support by email, chat and phone, escalating issues beyond first-line scope to the right teams.",
      contributions: [
        "Led a Windows 7 rollout to 1,000+ workstations with MDT within a 3-month deadline.",
        "Ran hardware and software inventory with MAP for license purchasing and renewal.",
        "Only member of the team granted Domain Admin rights; promoted to Systems Engineer.",
      ],
      techStack: ["MDT", "Windows 7", "Active Directory", "MAP"],
    },
    {
      id: "technical-support-representative",
      partner: "",
      partnerType: "Employment",
      title: "Technical Support Representative",
      role: "Technical Support Representative",
      period: "Nov 2009 - Nov 2010",
      status: "COMPLETED",
      description:
        "Phone support for home customers of consumer PCs and of fibre broadband, IPTV and VoIP services.",
      contributions: ["Diagnosed and resolved hardware, software and home-network issues over the phone."],
      techStack: ["Windows", "Home Networking", "VoIP"],
    },
  ] as CollabItem[],

  // Newest first. Shown by `certs` and in the GUI.
  certifications: [
    { name: "LPIC-2: Linux Engineer", issuer: "Linux Professional Institute", date: "Sep 2024" },
    { name: "VMware Certified Professional - Network Virtualization 2023", code: "VCP-NV 2023", issuer: "VMware", date: "Nov 2023" },
    { name: "AWS Certified Cloud Practitioner", code: "CLF-C01", issuer: "Amazon Web Services", date: "Jan 2023", lapsed: true },
    { name: "VMware Certified Professional 7 - Data Center Virtualization", code: "2V0-21.20", issuer: "VMware", date: "Sep 2022" },
    { name: "Microsoft Azure Fundamentals", code: "AZ-900", issuer: "Microsoft", date: "Oct 2020" },
    { name: "Cisco Certified Network Associate", code: "200-301", issuer: "Cisco", date: "Sep 2020", lapsed: true },
    { name: "CompTIA Linux+ (Powered by LPI)", code: "LX0-103 / LX0-104", issuer: "CompTIA", date: "Sep 2019" },
    { name: "VMware Certified Professional 7 - Desktop and Mobility", code: "2V0-751", issuer: "VMware", date: "Nov 2018" },
    { name: "VMware Certified Professional 6 - Data Center Virtualization", code: "2V0-621", issuer: "VMware", date: "Nov 2016" },
    { name: "MCSA: Windows Server 2012 R2", code: "70-417", issuer: "Microsoft", date: "Apr 2016" },
    { name: "MCSA: Windows Server 2008", code: "70-640 / 70-642 / 70-646", issuer: "Microsoft", date: "Jul 2013" },
    { name: "MCTS: Windows 7, Configuring", code: "70-680", issuer: "Microsoft", date: "Dec 2011" },
    { name: "CompTIA A+", code: "220-701 / 220-702", issuer: "CompTIA", date: "Dec 2010" },
  ] as Certification[],

  education: [
    { name: "Bachelor of Science in Information Technology", school: "Informatics College Northgate", year: "2016" },
    { name: "Advanced Diploma in Computer Studies, Major in Multimedia", school: "Informatics Computer Institute", year: "2009" },
  ] as EducationItem[],

  commands: [
    { name: "help", desc: "List all available terminal commands", usage: "help" },
    { name: "about", desc: "Display bio and summary", usage: "about [or cat bio.txt]" },
    { name: "experience", desc: "Display work experience", usage: "experience [or cat experience.md]" },
    { name: "skills", desc: "Display skill proficiency meters", usage: "skills [or cat skills.sh]" },
    { name: "certs", desc: "Display certifications and education", usage: "certs [or cat certs.txt]" },
    { name: "neofetch", desc: "Display ASCII banner & system specs", usage: "neofetch" },
    { name: "contact", desc: "Display contact links", usage: "contact" },
    { name: "links", desc: "Display links to GitHub and LinkedIn", usage: "links [or socials, urls]" },
    { name: "theme", desc: "Switch colour theme", usage: "theme &lt;green|amber|cyan|dracula|mono|cappuccino&gt;" },
    { name: "github", desc: "Display live GitHub stats and language metrics", usage: "github [or gh, stats]" },
    { name: "repos", desc: "List GitHub repositories with star counts and links", usage: "repos [or projects]" },
    { name: "matrix", desc: "Toggle digital rain overlay", usage: "matrix" },
    { name: "crt", desc: "Toggle CRT scanline screen effect", usage: "crt" },
    { name: "sfx", desc: "Toggle keypress sounds", usage: "sfx" },
    { name: "clear", desc: "Clear the terminal", usage: "clear [or cls]" },
    { name: "gui", desc: "Switch to the visual dashboard", usage: "gui" },
    { name: "cli", desc: "Switch to the interactive CLI", usage: "cli" },
  ],
};

/** Date label for a certification: the month earned, or "Earned <year>" once lapsed. */
export function certDate(c: Certification) {
  return c.lapsed ? `Earned ${c.date.split(" ").pop()}` : c.date;
}

/** Profile links that have a URL set, in display order. */
export function getSocialLinks() {
  const d = PORTFOLIO_DATA.developer;
  return [
    { label: "GitHub", icon: "🐙", url: d.github },
    { label: "LinkedIn", icon: "💼", url: d.linkedin },
    { label: "X / Twitter", icon: "𝕏", url: d.twitter },
  ].filter((l) => l.url);
}
