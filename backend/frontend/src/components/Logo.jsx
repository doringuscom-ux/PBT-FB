const Logo = ({ className = "h-16 w-auto", src = "/Logo.png", transparent = false }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src={src} 
        alt="PB TADKA Logo" 
        className={`h-full w-auto object-contain ${!transparent ? 'mix-blend-screen' : ''}`} 
        width="150" 
        height="50"
      />
    </div>
  );
};

export default Logo;
