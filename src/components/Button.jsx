import { motion } from "framer-motion";

const Button = ({
  label,
  iconURL,
  backgroundColor,
  textColor,
  borderColor,
  fullWidth,
  onClick,
  disabled = false,
  variant = "primary"
}) => {
  const getButtonClasses = () => {
    if (variant === "secondary") {
      return "uj-button-secondary";
    }
    return "uj-button-primary";
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex justify-center items-center gap-2 px-7 py-4 font-montserrat text-lg leading-none rounded-full
        ${getButtonClasses()}
        ${fullWidth && "w-full"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        relative overflow-hidden group
        focus:outline-none focus:ring-4 focus:ring-yellow-500/30
      `}
      whileHover={!disabled ? { 
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!disabled ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span className="relative z-10">{label}</span>

      {iconURL && (
        <motion.img
          src={iconURL}
          alt='arrow right icon'
          className='ml-2 rounded-full bg-white w-5 h-5'
          whileHover={{ x: 3 }}
          transition={{ duration: 0.2 }}
        />
      )}
      
      {/* Ripple effect overlay */}
      <motion.div
        className="absolute inset-0 rounded-full bg-black/10"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
};

export default Button;
