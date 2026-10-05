export interface CollabItem {
  id: string;
  partner: string;
  partnerType: "Open Source Org" | "Startup" | "Tech Studio" | "Research Team" | "Personal" | "Employer";
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

// ---------------------------------------------------------------------------
// Everything shown on the site comes from this file. Lines marked TODO are
// placeholders: replace them with your own details.
// ---------------------------------------------------------------------------

export const PORTFOLIO_DATA = {
  developer: {
    name: "Jose Bulalaque",
    handle: "josebulalaque",
    title: "Systems Engineer & Server Administrator",
    alias: "jose@srv-01",
    github: "https://github.com/josebulalaque",
    // TODO: add your LinkedIn profile URL, or leave empty to hide it.
    linkedin: "",
    // Leave empty to hide.
    twitter: "",
    // TODO: your city and timezone, e.g. "Perth, AU // UTC+8".
    location: "TODO: City, Country // UTC+8",
    status: " ONLINE // ALL SERVICES NOMINAL",
    // Shown in the GUI dashboard. TODO: set your real years of experience.
    focus: "Linux & Windows Servers, Virtualisation & Automation",
    experience: "TODO Years",
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
    // TODO: rewrite in your own words.
    bio: "Systems engineer and server administrator. I build and look after Linux and Windows servers, physical and virtual, from first install through patching, backups and the 2 a.m. alert. I lean towards DevOps habits: configuration lives in Git, changes go through Ansible or a script rather than by hand, and anything I do twice gets automated.",
    quote: '"Hope is not a strategy." – Traditional SRE saying',
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
    // Shown by `neofetch`. TODO: swap in your real daily driver if you like.
    specs: {
      OS: "RHEL 9 / Ubuntu 24.04 LTS / Windows Server 2022",
      Kernel: "6.x LTS",
      Uptime: "99.99% and counting",
      Shell: "bash 5.2 / PowerShell 7",
      Terminal: "Web-TUI Astro",
      WM: "tmux",
      Editor: "Vim / VS Code",
      CPU: "Whatever the hypervisor gives me",
      Memory: "Never enough",
    },
  },

  // TODO: adjust the levels (0-100) and years to match your experience.
  skills: [
    {
      category: "Operating Systems",
      icon: "🐧",
      skills: [
        { name: "Linux (RHEL / Rocky)", level: 85, experience: "", tag: "PRO" },
        { name: "Linux (Ubuntu / Debian)", level: 85, experience: "", tag: "PRO" },
        { name: "Windows Server", level: 80, experience: "", tag: "ADVANCED" },
        { name: "Active Directory / DNS / DHCP", level: 75, experience: "", tag: "ADVANCED" },
      ],
    },
    {
      category: "Virtualisation & Storage",
      icon: "🗄️",
      skills: [
        { name: "VMware vSphere", level: 80, experience: "", tag: "ADVANCED" },
        { name: "Proxmox VE", level: 75, experience: "", tag: "ADVANCED" },
        { name: "Hyper-V", level: 65, experience: "", tag: "INTERMEDIATE" },
        { name: "Docker / Containers", level: 70, experience: "", tag: "INTERMEDIATE" },
        { name: "Backup & Recovery", level: 80, experience: "", tag: "ADVANCED" },
      ],
    },
    {
      category: "Automation & DevOps",
      icon: "⚙️",
      skills: [
        { name: "Ansible", level: 80, experience: "", tag: "ADVANCED" },
        { name: "Bash", level: 85, experience: "", tag: "PRO" },
        { name: "PowerShell", level: 70, experience: "", tag: "INTERMEDIATE" },
        { name: "Python", level: 65, experience: "", tag: "INTERMEDIATE" },
        { name: "Git & CI/CD", level: 75, experience: "", tag: "ADVANCED" },
      ],
    },
    {
      category: "Operations",
      icon: "📈",
      skills: [
        { name: "Monitoring & Alerting", level: 80, experience: "", tag: "ADVANCED" },
        { name: "Patch Management", level: 85, experience: "", tag: "PRO" },
        { name: "Incident Response", level: 75, experience: "", tag: "ADVANCED" },
        { name: "Networking Fundamentals", level: 70, experience: "", tag: "INTERMEDIATE" },
      ],
    },
  ] as SkillCategory[],

  // Shown by `collabs` and in the GUI. TODO: replace with real projects or roles.
  collabs: [
    {
      id: "projects-in-progress",
      partner: "Personal",
      partnerType: "Personal",
      title: "Project write-ups",
      role: "Systems Engineer",
      period: "2026 - PRESENT",
      status: "ONGOING",
      description:
        "Write-ups of server builds, automation and homelab work are in progress. Until they're up, run `repos` to see my public GitHub repositories.",
      contributions: ["TODO: add your first project here."],
      techStack: ["Linux", "Ansible", "Bash"],
      link: "https://github.com/josebulalaque",
      asciiLogo: `+----------------------+
|  BUILD IN PROGRESS   |
|  [STATUS: ONGOING]   |
+----------------------+`,
    },
  ] as CollabItem[],

  commands: [
    { name: "help", desc: "List all available terminal commands", usage: "help" },
    { name: "about", desc: "Display bio and summary", usage: "about [or cat bio.txt]" },
    { name: "skills", desc: "Display skill proficiency meters", usage: "skills [or cat skills.sh]" },
    { name: "collabs", desc: "Display projects and roles", usage: "collabs [or cat collabs.md]" },
    { name: "neofetch", desc: "Display ASCII banner & system specs", usage: "neofetch" },
    { name: "contact", desc: "Display contact links", usage: "contact" },
    { name: "links", desc: "Display links to GitHub and other profiles", usage: "links [or socials, urls]" },
    { name: "theme", desc: "Switch colour theme", usage: "theme <green|amber|cyan|dracula|mono|cappuccino>" },
    { name: "pong", desc: "Play retro 1972 arcade Pong vs CPU", usage: "pong [or game, play, ./pong.sh]" },
    { name: "snake", desc: "Play classic retro Snake", usage: "snake [or playsnake, ./snake.sh]" },
    { name: "github", desc: "Display live GitHub stats and language metrics", usage: "github [or gh, stats]" },
    { name: "repos", desc: "List GitHub repositories with star counts and links", usage: "repos [or projects]" },
    { name: "radio", desc: "Play retro Lo-Fi/Chiptune radio or stream from YouTube", usage: "radio [play|pause|next|add <url>|vol <n>|list]" },
    { name: "matrix", desc: "Toggle digital rain overlay", usage: "matrix" },
    { name: "crt", desc: "Toggle CRT scanline screen effect", usage: "crt" },
    { name: "sfx", desc: "Toggle keypress sounds", usage: "sfx" },
    { name: "clear", desc: "Clear the terminal", usage: "clear [or cls]" },
    { name: "gui", desc: "Switch to the visual dashboard", usage: "gui" },
    { name: "cli", desc: "Switch to the interactive CLI", usage: "cli" },
  ],
};

/** Profile links that have a URL set, in display order. */
export function getSocialLinks() {
  const d = PORTFOLIO_DATA.developer;
  return [
    { label: "GitHub", icon: "🐙", url: d.github },
    { label: "LinkedIn", icon: "💼", url: d.linkedin },
    { label: "X / Twitter", icon: "𝕏", url: d.twitter },
  ].filter((l) => l.url);
}
