import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Sparkles, Zap, Brain, ChevronRight, CheckCircle2, Shield, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../components/ui';

// Fade in up animation variant
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="relative min-h-screen bg-background overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 origin-left z-50 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        style={{ scaleX }}
      />

      <main>
        <HeroSection />
        <FeaturesSection />
        <ProcessSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}

function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
      <motion.div 
        style={{ y, opacity }}
        className="max-w-5xl mx-auto text-center"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/30 text-blue-400 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>Powered by Gemma 4 AI</span>
        </motion.div>
        
        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Grade assignments with <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient">
            superhuman precision
          </span>
        </motion.h1>
        
        <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Automate grading for handwritten assignments using advanced OCR and ultra-intelligent AI rubrics. Save hours, maintain fairness, and scale your teaching.
        </motion.p>
        
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="relative group px-8 py-4 rounded-full bg-blue-600 text-white font-semibold text-lg overflow-hidden w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_100%)] transition-opacity duration-300" />
            <span className="relative flex items-center justify-center gap-2">
              Start Grading Free <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 rounded-full glass border border-white/10 text-white font-semibold text-lg hover:bg-white/5 transition-all w-full sm:w-auto"
          >
            Go to App Dashboard
          </button>
        </motion.div>
      </motion.div>

      {/* Floating Mockup */}
      <motion.div 
        className="mt-20 max-w-4xl mx-auto relative perspective-1000"
        initial={{ opacity: 0, y: 100, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 50 }}
      >
        <div className="glass rounded-2xl p-2 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="bg-[#0B1120] rounded-xl overflow-hidden border border-white/5">
            <div className="h-10 bg-white/5 flex items-center px-4 border-b border-white/5 gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="p-8 font-mono text-sm text-slate-300 flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <span className="text-blue-400">Student:</span> <span>Alice Smith</span>
                <span className="text-emerald-400 ml-auto flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Graded</span>
              </div>
              <div className="h-px bg-white/10 w-full" />
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <p className="text-slate-500 mb-2">// OCR Extraction</p>
                  <p>Q1. Wavelength is the distance between two consecutive points that are in phase...</p>
                </div>
                <div className="w-full md:w-1/2 glass p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                  <p className="text-blue-400 font-semibold mb-2">AI Evaluation</p>
                  <p className="text-xs mb-2">Criteria 1: Conceptual Understanding <span className="text-emerald-400 float-right">1.0 / 1.0</span></p>
                  <div className="w-full h-1 bg-white/10 rounded-full mb-4">
                    <div className="w-full h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  </div>
                  <p className="text-xs mb-2">Criteria 2: Clarity & Structure <span className="text-amber-400 float-right">2.5 / 3.0</span></p>
                  <div className="w-full h-1 bg-white/10 rounded-full">
                    <div className="w-[83%] h-full bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Bot className="w-6 h-6 text-blue-400" />,
      title: "Intelligent Rubric Generation",
      description: "Provide the questions and max marks, and let our Gemma 4 AI auto-generate rigorous, independently checkable criteria.",
      span: "col-span-1 md:col-span-2"
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Lightning Fast OCR",
      description: "Extract handwritten text and tables from PDFs with high accuracy.",
      span: "col-span-1"
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
      title: "Strict & Fair Evaluation",
      description: "The AI acts as a rigorous examiner, quoting direct evidence from the student's text to justify every single partial mark awarded.",
      span: "col-span-1"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      title: "Constructive Feedback",
      description: "Automatically generates personalized, actionable feedback for each student based on where they lost marks.",
      span: "col-span-1 md:col-span-2"
    }
  ];

  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful capabilities, <br/>beautifully simple.</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to automate your grading workflow without losing the human touch of personalized evaluation.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              className={cn(
                "glass p-8 rounded-2xl border border-white/5 hover:border-white/20 transition-all group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
                feat.span
              )}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    { num: "01", title: "Create Assignment", desc: "Input your questions, max marks, and answer key. The AI builds the rubric." },
    { num: "02", title: "Upload Scans", desc: "Upload student PDFs. Our system extracts handwriting and diagrams." },
    { num: "03", title: "AI Grading", desc: "Gemma 4 evaluates the text against the rubric, assigning marks and evidence." },
    { num: "04", title: "Review & Publish", desc: "Review low-confidence grades and publish results instantly." }
  ];

  return (
    <section id="process" className="py-32 px-6 border-t border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-3xl md:text-5xl font-bold text-center mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          How GradeFlow Works
        </motion.h2>

        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-purple-500/0 md:-translate-x-1/2" />
          
          <div className="space-y-12">
            {steps.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div 
                  key={i}
                  className={cn(
                    "flex flex-col md:flex-row items-start md:items-center relative gap-8 md:gap-0",
                    isEven ? "md:flex-row-reverse" : ""
                  )}
                  initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, type: "spring" }}
                >
                  <div className={cn("w-full md:w-1/2", isEven ? "md:pl-16" : "md:pr-16 text-left md:text-right")}>
                    <div className="glass p-6 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-colors">
                      <span className="text-blue-500 font-mono font-bold text-sm mb-2 block">STEP {step.num}</span>
                      <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                  
                  {/* Center Dot */}
                  <div className="absolute left-[24px] md:left-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,1)] md:-translate-x-1/2 top-8 md:top-1/2 md:-translate-y-1/2 z-10" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const navigate = useNavigate();
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)] pointer-events-none" />
      
      <motion.div 
        className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 md:p-20 border border-white/10 relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to transform your grading?</h2>
        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
          Join modern educators saving thousands of hours. Experience the future of AI-assisted grading today.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="relative group px-10 py-5 rounded-full bg-white text-background font-bold text-lg overflow-hidden"
        >
          <div className="absolute inset-0 bg-slate-200 group-hover:scale-105 transition-transform duration-300" />
          <span className="relative flex items-center justify-center gap-2">
            Get Started For Free <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0B1120] py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-bold text-white">GradeFlow AI</span>
        </div>
        <div className="flex gap-8 text-sm text-slate-500">
          <a href="#" className="hover:text-white transition-colors relative group">
            Privacy
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300" />
          </a>
          <a href="#" className="hover:text-white transition-colors relative group">
            Terms
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300" />
          </a>
          <a href="#" className="hover:text-white transition-colors relative group">
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300" />
          </a>
        </div>
        <p className="text-sm text-slate-600">© 2026 GradeFlow AI. All rights reserved.</p>
      </div>
    </footer>
  );
}
