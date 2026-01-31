import * as Icons from 'lucide-react';

export const iconNames = [
  'Wallet', 'CreditCard', 'Banknote', 'Coins', 'PiggyBank',
  'ShoppingBag', 'ShoppingCart', 'Coffee', 'Utensils', 'Beer',
  'Car', 'Bus', 'Plane', 'Home', 'Building',
  'Zap', 'Wifi', 'Smartphone', 'Tv', 'Gamepad2',
  'Heart', 'Stethoscope', 'Book', 'GraduationCap', 'Briefcase',
  'Music', 'Camera', 'Video', 'Ticket', 'Ghost',
  'Shield', 'Smile'
];


interface IconComponentProps {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export const IconComponent = ({ name, className, size = 20, style }: IconComponentProps) => {
  if (!name) {
    const Fallback = Icons.Circle;
    return <Fallback className={className} size={size} style={style} />;
  }

  const iconName = name.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');

  const Icon = (Icons as any)[iconName] || Icons.Circle;

  return <Icon className={className} size={size} style={style} />;
};
