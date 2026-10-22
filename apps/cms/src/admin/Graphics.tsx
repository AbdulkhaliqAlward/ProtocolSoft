/** Admin brand graphics: the full lockup on the login screen, the mark in the nav. */
import { LogoMark } from './LogoMark';

export const Logo = () => (
  <div className="ps-logo">
    <LogoMark size={64} className="ps-logo__mark" />
    <div className="ps-logo__text">
      <span className="ps-logo__name" lang="ar">بروتوكول سوفت</span>
      <span className="ps-logo__sub">لوحة إدارة المحتوى · Content admin</span>
    </div>
  </div>
);

export const Icon = () => <LogoMark size={28} className="ps-icon" />;
