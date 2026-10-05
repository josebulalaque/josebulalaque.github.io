// Your CV. Each list renders in the order written here, newest first.
// Everything below is placeholder text: replace it with your own.

export const cv = {
  summary:
    'TODO: two or three sentences on what you do, the kind of servers and systems you look after, and what you are best at.',

  experience: [
    {
      role: 'TODO: Job title',
      org: 'TODO: Company',
      start: '2023',
      end: 'Present',
      points: [
        'TODO: an outcome you delivered, with a number if you have one.',
        'TODO: a system or process you built or automated.',
        'TODO: something you own or are trusted with.',
      ],
    },
    {
      role: 'TODO: Previous job title',
      org: 'TODO: Previous company',
      start: '2020',
      end: '2023',
      points: ['TODO: what you did there.'],
    },
  ],

  skills: [
    { group: 'Operating systems', items: ['Linux (RHEL, Ubuntu, Debian)', 'Windows Server', 'Active Directory'] },
    { group: 'Virtualisation', items: ['VMware vSphere', 'Proxmox', 'Hyper-V', 'Containers'] },
    { group: 'Automation', items: ['Ansible', 'Bash', 'PowerShell', 'Python', 'Git', 'CI/CD'] },
    { group: 'Operations', items: ['Patching', 'Backup and recovery', 'Monitoring', 'Storage', 'DNS and DHCP'] },
  ],

  certifications: [
    // { name: 'Certification name', issuer: 'Vendor', year: '2024' },
  ] as { name: string; issuer: string; year: string }[],

  education: [
    // { name: 'Degree or course', org: 'Institution', year: '2019' },
  ] as { name: string; org: string; year: string }[],
};
