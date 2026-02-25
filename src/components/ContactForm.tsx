import React, { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  if (status === 'success') {
    return (
      <div class="h-full flex flex-col items-center justify-center text-center p-8 bg-[var(--color-graphite)]/20 border border-[var(--color-gold)]/30 rounded-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
        <h3 class="font-display text-3xl text-[var(--color-ivory)] mb-2">Solicitud Recibida</h3>
        <p class="font-body text-[var(--color-silver)]/80">
          Un asesor personal de Caveduke se pondrá en contacto con usted en las próximas 24 horas laborables.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} class="flex flex-col gap-10">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div class="relative group">
          <input 
            type="text" 
            id="name" 
            required
            class="premium-input peer" 
            placeholder=" "
          />
          <label htmlFor="name" class="absolute left-0 top-0 font-accent tracking-widest text-[var(--color-silver)]/50 uppercase text-xs transition-all duration-300 peer-focus:-top-5 peer-focus:text-[var(--color-gold)] peer-focus:text-[10px] peer-not-placeholder-shown:-top-5 peer-not-placeholder-shown:text-[10px] pointer-events-none">
            Nombre Completo *
          </label>
        </div>

        <div class="relative group">
          <input 
            type="tel" 
            id="phone" 
            class="premium-input peer" 
            placeholder=" "
          />
          <label htmlFor="phone" class="absolute left-0 top-0 font-accent tracking-widest text-[var(--color-silver)]/50 uppercase text-xs transition-all duration-300 peer-focus:-top-5 peer-focus:text-[var(--color-gold)] peer-focus:text-[10px] peer-not-placeholder-shown:-top-5 peer-not-placeholder-shown:text-[10px] pointer-events-none">
            Teléfono
          </label>
        </div>
      </div>

      <div class="relative group">
        <input 
          type="email" 
          id="email" 
          required
          class="premium-input peer" 
          placeholder=" "
        />
        <label htmlFor="email" class="absolute left-0 top-0 font-accent tracking-widest text-[var(--color-silver)]/50 uppercase text-xs transition-all duration-300 peer-focus:-top-5 peer-focus:text-[var(--color-gold)] peer-focus:text-[10px] peer-not-placeholder-shown:-top-5 peer-not-placeholder-shown:text-[10px] pointer-events-none">
          Correo Electrónico *
        </label>
      </div>

      <div class="relative group mt-4">
        <div class="font-accent tracking-widest text-[var(--color-silver)]/50 uppercase text-xs mb-6">
          Tipo de Proyecto
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Madera', 'Acero', 'Bajo Escalera', 'Medida Especial'].map(type => (
            <label class="flex items-center gap-2 cursor-pointer group/label">
              <input type="radio" name="project_type" value={type.toLowerCase()} class="hidden peer" />
              <div class="w-4 h-4 rounded-full border border-[var(--color-silver)]/30 peer-checked:border-[var(--color-gold)] peer-checked:bg-[var(--color-gold)] transition-colors flex items-center justify-center">
                <div class="w-1.5 h-1.5 rounded-full bg-[var(--color-noir)] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
              </div>
              <span class="font-body text-sm text-[var(--color-silver)]/80 group-hover/label:text-[var(--color-ivory)] transition-colors">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div class="relative group mt-4">
        <textarea 
          id="message" 
          rows={4}
          class="premium-input peer resize-none" 
          placeholder=" "
        ></textarea>
        <label htmlFor="message" class="absolute left-0 top-0 font-accent tracking-widest text-[var(--color-silver)]/50 uppercase text-xs transition-all duration-300 peer-focus:-top-5 peer-focus:text-[var(--color-gold)] peer-focus:text-[10px] peer-not-placeholder-shown:-top-5 peer-not-placeholder-shown:text-[10px] pointer-events-none">
          Detalles de su visión
        </label>
      </div>

      <button 
        type="submit" 
        disabled={status === 'submitting'}
        class="premium-button mt-4 w-full md:max-w-max justify-center disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
      >
        <span class="relative z-10 flex items-center gap-2">
          {status === 'submitting' ? 'Enviando...' : 'Solicitar Asesoría'}
          {status !== 'submitting' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right transform group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
        </span>
        <div class="absolute inset-0 bg-[var(--color-gold)] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
      </button>

    </form>
  );
}
