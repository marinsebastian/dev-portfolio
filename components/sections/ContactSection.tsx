'use client';
import { useState } from 'react';
import { SectionReveal } from '../motion/SectionReveal';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { GithubIcon } from '../ui/GithubIcon';

export function ContactSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <section id="contact" className="py-20 bg-[#070a11] relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 font-mono-tech text-xs text-teal-400">
            <span className="text-slate-600">//</span>
            <span className="uppercase tracking-widest font-semibold font-mono-tech">GET IN TOUCH</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Let&apos;s Build Reliable Systems Together
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Ready for engineering roles focused on web interfaces, APIs, SQL data, spatial GIS, and automation.
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Direct Contact Telemetry</h3>

              <div className="space-y-4 font-mono-tech text-xs">
                <a
                  href="mailto:marinsebastian143@gmail.com"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200 hover:border-teal-500/50 hover:text-teal-300 transition-all"
                >
                  <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px]">EMAIL ADDRESS</span>
                    <span className="font-bold">marinsebastian143@gmail.com</span>
                  </div>
                </a>

                <a
                  href="tel:+59172295996"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200 hover:border-teal-500/50 hover:text-teal-300 transition-all"
                >
                  <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px]">PHONE / WHATSAPP</span>
                    <span className="font-bold">+591 72295996</span>
                  </div>
                </a>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px]">PRIMARY LOCATION</span>
                    <span className="font-bold">Cochabamba, Bolivia</span>
                  </div>
                </div>

                <a
                  href="https://github.com/marinsebastian"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200 hover:border-teal-500/50 hover:text-teal-300 transition-all"
                >
                  <GithubIcon className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px]">GITHUB PROFILE</span>
                    <span className="font-bold">github.com/marinsebastian</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Message Dispatch Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Direct Console Message</h3>

              {formSubmitted ? (
                <div className="p-6 rounded-xl bg-teal-500/10 border border-teal-500/40 text-teal-300 font-mono-tech text-xs space-y-2 text-center">
                  <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto" />
                  <div className="font-bold text-sm">MESSAGE DISPATCHED SUCCESSFULLY</div>
                  <p className="text-slate-300 text-xs">Thank you! Sebastian will review your message and reply promptly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1 font-mono-tech text-xs">
                    <label className="text-slate-300 block">SENDER NAME</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Engineering Lead / Hiring Manager"
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1 font-mono-tech text-xs">
                    <label className="text-slate-300 block">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1 font-mono-tech text-xs">
                    <label className="text-slate-300 block">PROJECT / INQUIRY DETAILS</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe role, project requirements, or technical inquiry..."
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center space-x-2 w-full py-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs font-mono-tech transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                  >
                    <Send className="w-4 h-4" />
                    <span>DISPATCH MESSAGE</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
