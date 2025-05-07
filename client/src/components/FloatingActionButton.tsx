import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/25 flex items-center justify-center z-30"
      whileHover={{ scale: 1.1, boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.3)" }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Plus className="h-7 w-7" />
      <span className="sr-only">Adicionar recurso</span>
    </motion.button>
  );
}