import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface PreviewCardProps {
  title: string;
  content: string;
  delay: number;
}

export function PreviewCard({ title, content, delay }: PreviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.div
        whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
        transition={{ duration: 0.2 }}
        className="perspective-1000"
      >
        <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-6 overflow-hidden group hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          <motion.h3
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xl font-bold text-white mb-4"
          >
            {title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-white/80"
          >
            {content}
          </motion.p>
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff00ff]/0 via-[#00ffff]/10 to-[#ff00ff]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>
      </motion.div>
    </motion.div>
  );
}
