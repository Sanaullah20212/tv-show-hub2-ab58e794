import { NavLink as RouterNavLink, NavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CustomNavLinkProps extends NavLinkProps {
  activeClassName?: string;
}

export const NavLink = ({ className, activeClassName, ...props }: CustomNavLinkProps) => {
  return (
    <RouterNavLink
      className={(navData) => {
        const { isActive } = navData;
        const baseClasses = typeof className === 'function' ? className(navData) : className;
        return cn(baseClasses, isActive && activeClassName);
      }}
      {...props}
    />
  );
};
