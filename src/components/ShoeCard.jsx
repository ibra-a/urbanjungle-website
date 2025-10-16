import { motion } from "framer-motion";

const ShoeCard = ({ imgURL, changeBigShoeImage, bigShoeImg }) => {
  const handleClick = () => {
    if (bigShoeImg !== imgURL.bigShoe) {
      changeBigShoeImage(imgURL.bigShoe);
    }
  };

  const isSelected = bigShoeImg === imgURL.bigShoe;

  return (
    <motion.div
      className={`relative cursor-pointer transition-all duration-300 ${
        isSelected ? "scale-105" : "scale-100 hover:scale-110"
      }`}
      onClick={handleClick}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div
        className={`
          w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32
          rounded-2xl
          bg-gradient-to-br from-gray-50 to-gray-100
          border-2 transition-all duration-300
          flex items-center justify-center
          shadow-md hover:shadow-xl
          backdrop-blur-sm
          group
          ${
            isSelected
              ? "border-black shadow-lg shadow-black/20"
              : "border-gray-200 hover:border-gray-300"
          }
        `}
      >
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
        
        <img
          src={imgURL.thumbnail}
          alt='shoe selection'
          className={`
            object-contain object-left-center w-full h-full max-w-[85%] max-h-[85%]
            transition-all duration-300
            ${isSelected ? "brightness-110" : "group-hover:brightness-110"}
            relative z-10
          `}
        />
        
        {/* Active indicator */}
        {isSelected && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default ShoeCard;
