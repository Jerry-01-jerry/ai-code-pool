export function Icon({ name, className = 'h-4 w-4' }) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="10.8" cy="10.8" r="5.8" /><path d="m15 15 4.5 4.5" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    back: <path d="M19 12H5m6-6-6 6 6 6" />,
    logo: <><path d="M4 8c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 6-2M4 13c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 6-2M4 18c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 6-2" /></>,
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
}
