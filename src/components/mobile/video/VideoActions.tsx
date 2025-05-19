interface VideoActionsProps {
  onOpenDrawer: () => void;
}

export function VideoActions({ onOpenDrawer }: VideoActionsProps) {
  return (
    <div className="absolute bottom-28 right-3 flex flex-col items-center space-y-4 z-20">
      <button className="flex flex-col items-center">
        <div className="bg-white/20 rounded-full p-3 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
        <span className="text-white text-xs">1.2k</span>
      </button>
      <button className="flex flex-col items-center">
        <div className="bg-white/20 rounded-full p-3 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <span className="text-white text-xs">60</span>
      </button>
      <button className="flex flex-col items-center">
        <div className="bg-white/20 rounded-full p-3 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"></path>
          </svg>
        </div>
        <span className="text-white text-xs">145</span>
      </button>
    </div>
  );
} 