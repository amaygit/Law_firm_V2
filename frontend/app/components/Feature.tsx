import React from "react";
import FeatureCard from "./FeatureCard";
import { motion } from "motion/react";
import { featureData } from "@/constants";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import * as variants from "@/lib/motionVariants";
const Feature = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <motion.p
            variants={variants.fadeInUp}
            initial="start"
            whileInView="end"
            viewport={{ once: true }}
            className="section-subtitle dark text-sm font-medium uppercase"
          >
            {featureData.sectionSubtitle}
          </motion.p>
          <motion.h2
            variants={variants.fadeInUp}
            initial="start"
            whileInView="end"
            viewport={{ once: true }}
            className="section-title dark:text-foreground text-3xl font-semibold leading-snug py-3 md:text-[40px]"
          >
            {featureData.sectionTitle}
          </motion.h2>
          <motion.p
            variants={variants.fadeInUp}
            initial="start"
            whileInView="end"
            viewport={{ once: true }}
            className="section-text"
          >
            {featureData.sectionText}
          </motion.p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 xl:grid-cols-6">
          {featureData.features.map(
            ({ icon, iconBoxColor, title, desc, imgSrc }, index) => (
              <FeatureCard
                key={index}
                classes={
                  index < 2
                    ? "md:col-span-2 lg:col-span-1 xl:col-span-3"
                    : "xl:col-span-2"
                }
              >
                <>
                  <div className="p-8">
                    <motion.div
                      variants={variants.fadeInUp}
                      className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${iconBoxColor}`}
                    >
                      {icon}
                    </motion.div>
                    <motion.h3
                      variants={variants.fadeInUp}
                      className="text-primary-foreground text-xl font-medium mt-4 mb-3"
                    >
                      {title}
                    </motion.h3>
                    <motion.p
                      variants={variants.fadeInUp}
                      className="text-sidebar-ring line-clamp-2"
                    >
                      {desc}
                    </motion.p>
                    <motion.div variants={variants.fadeInUp}>
                      <Button
                        variant="link"
                        className="text-primary-land p-0 h-auto mt-3"
                      >
                        Learn More <ArrowRight />
                      </Button>
                    </motion.div>
                  </div>
                </>
                {imgSrc && (
                  <motion.figure
                    variants={variants.fadeInUp}
                    className="p-6 pt-0"
                  >
                    <img src={imgSrc} alt={title} />
                  </motion.figure>
                )}
              </FeatureCard>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default Feature;
