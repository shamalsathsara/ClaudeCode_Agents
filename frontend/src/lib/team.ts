export interface TeamMember {
  name: string;
  phone: string;
  slug: string;
}

export const TEAM: TeamMember[] = [
  { name: 'Vihanga Nipun', phone: '075 965 7931', slug: 'vihanga-nipun' },
  { name: 'Shamal Sathsara', phone: '077 158 1916', slug: 'shamal-sathsara' },
  { name: 'Pramoth Piumal', phone: '074 044 0553', slug: 'pramoth-piumal' },
  { name: 'Sujaya Samanjith', phone: '076 789 6758', slug: 'sujaya-samanjith' },
];

export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}
