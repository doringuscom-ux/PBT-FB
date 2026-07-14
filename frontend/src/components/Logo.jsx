"use client";
const Logo = ({ className = "h-16 w-auto", style }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="/Logo1.png" 
        alt="PB TADKA Logo" 
        className={`${className} object-contain`}
        style={{
            filter: 'drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.1))',
            ...style
        }}
      />
    </div>
  );
};

export default Logo;
