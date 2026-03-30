"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Scissors, Smartphone, Users } from "lucide-react";

const reasons = [
  {
    title: "Premium Quality",
    desc: "Artisanal designs crafted by world-class experts with an eye for luxury.",
    icon: ShieldCheck,
    accent: "bg-lavender/10 text-lavender"
  },
  {
    title: "Fast Delivery",
    desc: "Experience rapid turnaround times with digital invites delivered in 24-48 hours.",
    icon: Zap,
    accent: "bg-blush-rose text-dusty-mauve"
  },
  {
    title: "Affordable Luxury",
    desc: "Experience high-end design without the traditional price tag.",
    icon: Scissors,
    accent: "bg-soft-lilac text-lavender"
  },
  {
    title: "Personalized Support",
    desc: "Our dedicated designers work with you to ensure every detail is perfect.",
    icon: Users,
    accent: "bg-champagne-cream text-soft-gold"
  },
  {
    title: "Mobile First Design",
    desc: "Optimized for all modern smartphones for a seamless guest experience.",
    icon: Smartphone,
    accent: "bg-pearl-white text-charcoal/50"
  }
];

export const WhyChooseUs = () => {
  return (
    <section className="py-24 bg-pearl-white">
      <div className="site-container">
        <div className="text-center mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-4 italic">The Zubizo Promise</h2>
            <p className="text-charcoal/50 font-medium max-w-xl mx-auto">
              Everything we do is built around creating an unforgettable first impression.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 px-4">
          {reasons.map((reason, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center group"
            >
              <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${reason.accent}`}>
                <reason.icon size={28} />
              </div>
              <h4 className="text-lg font-bold text-charcoal mb-2">{reason.title}</h4>
              <p className="text-xs text-charcoal/40 leading-relaxed font-medium">
                {reason.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
