import { motion } from "framer-motion";

export default function DayTabs({ days, activeDay, setActiveDay }) {
  return (
    <div className="flex gap-3 overflow-x-auto py-2">
      {days.map((_, index) => {
        const isActive = activeDay === index;

        return (
          <motion.button
            key={index}
            onClick={() => setActiveDay(index)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              backgroundColor: isActive ? "#00b4d8" : "rgba(255,255,255,0.6)",
              color: isActive ? "#ffffff" : "#003049",
            }}
            transition={{ duration: 0.25 }}
            className="
              px-6 py-2 
              rounded-2xl 
              font-semibold 
              shadow-md 
              whitespace-nowrap 
              border-0
              hover:cursor-pointer
            "
          >
            Day {index + 1}
          </motion.button>
        );
      })}
    </div>
  );
}
