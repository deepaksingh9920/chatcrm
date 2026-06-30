export const colors = {
  primary: '#2563EB', primaryLight: '#EFF6FF', primaryDark: '#1D4ED8',
  success: '#16A34A', successLight: '#F0FDF4',
  warning: '#D97706', warningLight: '#FFFBEB',
  danger: '#DC2626', dangerLight: '#FEF2F2',
  bg: '#F8FAFC', surface: '#FFFFFF', surface2: '#F1F5F9',
  border: '#E2E8F0', borderStrong: '#CBD5E1',
  text: '#0F172A', textSecondary: '#475569', textMuted: '#94A3B8',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 6, md: 8, lg: 12, xl: 16, full: 999 };

const avatarPalette = [
  ['#EFF6FF','#1D4ED8'], ['#F0FDF4','#15803D'], ['#FFFBEB','#92400E'],
  ['#F5F3FF','#5B21B6'], ['#FDF2F8','#86198F'],
];
export const getAvatarColors = (name = '') => avatarPalette[(name.charCodeAt(0) || 0) % avatarPalette.length];
export const getInitials = (name = '') => name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();

export const statusColors = {
  DRAFT: { bg:'#F1F5F9', text:'#475569' }, SENT: { bg:'#EFF6FF', text:'#1D4ED8' },
  VIEWED: { bg:'#F5F3FF', text:'#5B21B6' }, ACCEPTED: { bg:'#F0FDF4', text:'#15803D' },
  REJECTED: { bg:'#FEF2F2', text:'#DC2626' }, EXPIRED: { bg:'#FEF9C3', text:'#A16207' },
  PENDING: { bg:'#FFFBEB', text:'#92400E' }, PROCESSING: { bg:'#EFF6FF', text:'#1D4ED8' },
  PACKED: { bg:'#F5F3FF', text:'#5B21B6' }, SHIPPED: { bg:'#ECFDF5', text:'#065F46' },
  DELIVERED: { bg:'#F0FDF4', text:'#15803D' }, CANCELLED: { bg:'#FEF2F2', text:'#DC2626' },
  PAID: { bg:'#F0FDF4', text:'#15803D' }, PARTIAL: { bg:'#FFFBEB', text:'#92400E' },
  OVERDUE: { bg:'#FEF2F2', text:'#DC2626' }, COMPLETED: { bg:'#F0FDF4', text:'#15803D' },
};

export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
export const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date), now = new Date(), diff = now - d;
  if (diff < 86400000) return d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  if (diff < 604800000) return d.toLocaleDateString('en-IN', { weekday:'short' });
  return formatDate(date);
};
