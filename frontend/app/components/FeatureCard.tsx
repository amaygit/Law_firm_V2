import React, { useState } from "react";
import { motion } from "motion/react";
import * as variants from "@/lib/motionVariants";

type FeatureCardProps = {
  classes?: string;
  children: React.ReactNode;
};

const FeatureCard = ({ classes, children }: FeatureCardProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={variants.staggerContainer}
      initial="start"
      whileInView="end"
      viewport={{ once: true }}
      className={`relative p-[1px] rounded-[14px] ring ring-inset ring-zinc-800/50 transition-shadow duration-300 ${
        hovered ? "ring-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" : ""
      } ${classes}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative isolate bg-card-dark text-white-strong rounded-xl overflow-hidden shadow-lg">
        {children}
      </div>
    </motion.div>
  );
};

export default FeatureCard;
