export function Icon({name,size=22}:{name:string;size?:number}){
  const content:Record<string,React.ReactNode>={
    settings:<><path d="M3 6h4m4 0h10M3 12h10m4 0h4M3 18h4m4 0h10"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="18" r="2"/></>,
    image:<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
    expand:<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>,
    external:<path d="M7 17 17 7M7 7h10v10"/>,
    arrowLeft:<path d="M20 12H4m6-6-6 6 6 6"/>,
    spark:<path d="M12 2v20M3.34 7l17.32 10M3.34 17 20.66 7"/>,
    search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
    bag:<><path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>,
    user:<><circle cx="12" cy="8" r="3.5"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    heart:<path d="M20.3 5c-2-2-5-1.8-6.7.2L12 7l-1.6-1.8C8.7 3.2 5.7 3 3.7 5c-2 2-2 5 .2 7.2L12 21l8.1-8.8C22.3 10 22.3 7 20.3 5Z"/>,
    arrow:<path d="M4 12h16m-6-6 6 6-6 6"/>,
    chevron:<path d="m9 5 7 7-7 7"/>,
    close:<path d="m6 6 12 12M18 6 6 18"/>,
    plus:<path d="M12 5v14M5 12h14"/>,
    minus:<path d="M5 12h14"/>,
    grid:<><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></>,
    box:<><path d="m12 3 9 5v10l-9 5-9-5V8l9-5Zm0 10 9-5M3 8l9 5v10M7.5 5.5l9 5"/></>,
    truck:<><path d="M2 5h12v12H2zM14 9h4l4 4v4h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    telegram:<path d="m22 3-4 18-7-6-4 3 1-6 10-6L6 11 2 9l20-6Z"/>,
    check:<path d="m5 12 4 4L20 5"/>,
    menu:<path d="M3 6h18M3 12h18M3 18h18"/>,
    dice:<><path d="m12 2 10 6v10l-10 5-10-5V8l10-6Zm0 0 5 9-5 12-5-12 5-9ZM2 8l5 3h10l5-3M2 18l5-7m10 0 5 7"/></>,
    game:<><path d="M7 7h10a4 4 0 0 1 4 3l2 8c.4 2-2 3-3.5 1.5L16 16H8l-3.5 3.5C3 21 1 20 1.5 18l2-8A4 4 0 0 1 7 7Z"/><path d="M7 10v5m-2.5-2.5h5M16 11h.01M19 14h.01"/></>,
    star:<path d="m12 2 2.8 6.2 6.7.8-5 4.7 1.4 6.6-5.9-3.4-5.9 3.4 1.4-6.6-5-4.7 6.7-.8L12 2Z"/>,
    pin:<><path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{content[name]||content.box}</svg>;
}
