export type Errors<K extends string> = Partial<Record<K, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_RULES = [
  { id: 'length', label: '8 to 128 characters', test: (p: string) => p.length >= 8 && p.length <= 128 },
  { id: 'upper', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
] as const;

export function isEmail(v: string): boolean {
  const t = v.trim();
  return t.length <= 254 && EMAIL_RE.test(t);
}

export type ContactField = 'name' | 'email' | 'subject' | 'message';
export function validateContact(v: Record<ContactField, string>): Errors<ContactField> {
  const e: Errors<ContactField> = {};
  const name = v.name.trim().length;
  if (name < 2) e.name = 'Please enter your name (at least 2 characters).';
  else if (name > 100) e.name = 'Name must be 100 characters or fewer.';
  if (!v.email.trim()) e.email = 'Email is required.';
  else if (!isEmail(v.email)) e.email = 'Enter a valid email address.';
  const subject = v.subject.trim().length;
  if (subject < 3) e.subject = 'Subject must be at least 3 characters.';
  else if (subject > 150) e.subject = 'Subject must be 150 characters or fewer.';
  const message = v.message.trim().length;
  if (message < 10) e.message = 'Message must be at least 10 characters.';
  else if (message > 5000) e.message = 'Message must be 5000 characters or fewer.';
  return e;
}

export type SignUpField = 'fullName' | 'email' | 'password' | 'confirmPassword';
export function validateSignUp(v: Record<SignUpField, string>): Errors<SignUpField> {
  const e: Errors<SignUpField> = {};
  const n = v.fullName.trim().length;
  if (n < 2) e.fullName = 'Please enter your full name.';
  else if (n > 100) e.fullName = 'Name must be 100 characters or fewer.';
  if (!v.email.trim()) e.email = 'Email is required.';
  else if (!isEmail(v.email)) e.email = 'Enter a valid email address.';
  if (!v.password) e.password = 'Password is required.';
  else if (PASSWORD_RULES.some((r) => !r.test(v.password))) e.password = 'Password does not meet all the rules.';
  if (!v.confirmPassword) e.confirmPassword = 'Please confirm your password.';
  else if (v.confirmPassword !== v.password) e.confirmPassword = 'Passwords do not match.';
  return e;
}

export type SignInField = 'email' | 'password';
export function validateSignIn(v: Record<SignInField, string>): Errors<SignInField> {
  const e: Errors<SignInField> = {};
  if (!v.email.trim()) e.email = 'Email is required.';
  else if (!isEmail(v.email)) e.email = 'Enter a valid email address.';
  if (!v.password) e.password = 'Password is required.';
  return e;
}
