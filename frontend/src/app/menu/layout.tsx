export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-view">
      {children}
    </div>
  );
}
