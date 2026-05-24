'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const fadeInVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Banner / Tagline Section */}
      <section className="w-full max-w-[1160px] px-6 md:px-12 py-16 md:py-24 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
          className="max-w-3xl mx-auto"
        >
          <span className="text-xs font-sans tracking-widest text-brand-muted uppercase mb-4 block">
            Welcome to Verbum
          </span>
          <h2 className="font-serif text-4xl md:text-6xl text-brand-dark font-normal leading-tight mb-6">
            Where words find meaning.
          </h2>
          <p className="font-sans text-brand-muted text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            A serene workspace for authentic voices, crafted for those who value the weight and beauty of written language.
          </p>
        </motion.div>
      </section>

      {/* Featured Article Card */}
      <section className="w-full max-w-[1160px] px-6 md:px-12 pb-16 md:pb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInVariants}
          className="bg-brand-card rounded-lg border border-brand-sand/35 shadow-soft p-8 md:p-16 max-w-4xl mx-auto hover:shadow-premium transition-all duration-500 group"
        >
          <div className="max-w-2xl mx-auto text-center md:text-left">
            <span className="text-xs font-sans tracking-widest text-brand-muted uppercase mb-4 block">
              Featured Philosophy
            </span>
            <h3 className="font-serif text-3xl md:text-4xl text-brand-dark font-normal mb-6 group-hover:text-brand-muted transition-colors duration-300">
              The Quiet Power of Thoughtful Expression
            </h3>
            <p className="font-sans text-brand-muted text-base md:text-lg leading-relaxed mb-8">
              In a world of constant noise, Verbum invites you to slow down and rediscover the profound impact of words. Our platform is a sanctuary for authentic voices, where every sentence is crafted with intention and every story finds its resonance.
            </p>
            <div className="flex justify-center md:justify-start">
              <Link 
                href="/signup" 
                className="font-sans text-sm font-semibold tracking-wider uppercase text-brand-dark border-b border-brand-dark pb-1 hover:text-brand-muted hover:border-brand-muted transition-all duration-300"
              >
                Join the Circle
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Two-Column: Image & Text 1 */}
      <section className="w-full max-w-[1160px] px-6 md:px-12 py-16 md:py-24 border-t border-brand-sand/15">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInVariants}
            className="h-96 md:h-[480px] w-full rounded-lg overflow-hidden border border-brand-sand/30 shadow-soft"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop" 
              alt="Serene minimal writing workspace"
              className="w-full h-full object-cover hover:scale-102 transition-transform duration-700"
            />
          </motion.div>

          {/* Text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInVariants}
            className="flex flex-col space-y-6"
          >
            <span className="text-xs font-sans tracking-widest text-brand-muted uppercase block">
              The Interface
            </span>
            <h3 className="font-serif text-3xl md:text-5xl text-brand-dark font-normal leading-tight">
              A Canvas for Your Inner World
            </h3>
            <p className="font-sans text-brand-muted text-base md:text-lg leading-relaxed">
              Verbum offers a beautifully uncluttered environment, allowing your ideas to flow freely onto the page. With intuitive tools and a focus on simplicity, you can immerse yourself fully in the creative process, from the initial spark to the final masterpiece.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition: Centered Text */}
      <section className="w-full bg-brand-card py-20 md:py-32 border-y border-brand-sand/30 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInVariants}
          className="max-w-[1160px] mx-auto px-6 md:px-12"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="text-xs font-sans tracking-widest text-brand-muted uppercase block">
              Our Belief
            </span>
            <h3 className="font-serif text-3xl md:text-5xl text-brand-dark font-normal leading-tight">
              Cultivating Connection Through Story
            </h3>
            <p className="font-sans text-brand-muted text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Beyond individual expression, Verbum fosters a vibrant community of writers and readers. Share your insights, engage in meaningful discussions, and find inspiration in the shared journey of bringing words to life. It's a space where every voice is valued.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Two-Column: Image & Text 2 (Reversed) */}
      <section className="w-full max-w-[1160px] px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Text (Comes first on mobile/desktop via grid reorder or normal ordering) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInVariants}
            className="flex flex-col space-y-6 md:order-1"
          >
            <span className="text-xs font-sans tracking-widest text-brand-muted uppercase block">
              Writing Tools
            </span>
            <h3 className="font-serif text-3xl md:text-5xl text-brand-dark font-normal leading-tight">
              Refine Your Voice, Elevate Your Craft
            </h3>
            <p className="font-sans text-brand-muted text-base md:text-lg leading-relaxed">
              Our resources and community support you at every stage. From prompts that spark imagination to gentle feedback that refines your prose, Verbum is dedicated to helping you evolve as a writer and share your most impactful stories with the world.
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInVariants}
            className="h-96 md:h-[480px] w-full rounded-lg overflow-hidden border border-brand-sand/30 shadow-soft md:order-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop" 
              alt="Person holding book at minimal library"
              className="w-full h-full object-cover hover:scale-102 transition-transform duration-700"
            />
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full max-w-[1160px] px-6 md:px-12 py-20 md:py-32 text-center border-t border-brand-sand/15">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInVariants}
          className="max-w-2xl mx-auto space-y-8"
        >
          <h3 className="font-serif text-3xl md:text-5xl text-brand-dark font-normal">
            Ready to Share Your Story?
          </h3>
          <p className="font-sans text-brand-muted text-base md:text-lg max-w-md mx-auto">
            Step into the quiet workspace. Create your profile, begin writing drafts, and publish your narratives.
          </p>
          <div>
            <Link 
              href="/signup" 
              className="button inline-block bg-brand-dark text-brand-card hover:bg-brand-muted px-10 py-5 rounded text-base font-semibold tracking-widest uppercase transition-all duration-300 shadow-soft hover:shadow-premium hover:-translate-y-1"
            >
              Begin Your Journey
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
