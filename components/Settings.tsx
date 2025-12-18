
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../db';
import { CompanyProfile, AppTheme } from '../types';
import { Save, Building2, Palette, ShieldCheck, ToggleLeft, ToggleRight, Percent } from 'lucide-react';
import { toast } from 'sonner';

export const Settings: React.FC = () => {
  const { register, handleSubmit, setValue, watch } = useForm<CompanyProfile>();
  const currentTheme = watch('theme');
  const useDefaultGST = watch('useDefaultGST');

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await db.settings.get(1); 
      if (settings) {
        Object.keys(settings).forEach((key) => {
          setValue(key as keyof CompanyProfile, (settings as any)[key]);
        });
      }
    };
    loadSettings();
  }, [setValue]);

  const onSubmit = async (data: CompanyProfile) => {
    try {
      await db.settings.put({ ...data, id: 1 });
      toast.success('System Configuration Updated');
      setTimeout(() => window.location.reload(), 800); 
    } catch (error) {
      toast.error('Sync failed');
    }
  };

  const ThemeOption = ({ value, color, label }: { value: AppTheme, color: string, label: string }) => (
    <label className={`cursor-pointer flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${currentTheme === value ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
      <input type="radio" {...register('theme')} value={value} className="hidden" />
      <div className={`w-10 h-10 rounded-full mb-2 ${color} shadow-inner`}></div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
    </label>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">System Configuration</h2>
          <p className="text-slate-500 font-medium">Manage default billing logic and identity</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8"><Building2 className="w-6 h-6 text-blue-600" /><h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Identity Details</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Company Legal Name</label>
                  <input {...register('companyName', { required: true })} className="w-full rounded-2xl bg-slate-50 border-none px-6 py-4 font-bold text-slate-800 text-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">GSTIN Identification</label>
                  <input {...register('gstin')} className="w-full rounded-2xl bg-slate-50 border-none px-6 py-4 font-mono font-bold text-blue-600" />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Customer Support Phone</label>
                  <input {...register('phone')} className="w-full rounded-2xl bg-slate-50 border-none px-6 py-4 font-bold" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Registered Address Line 1</label>
                  <input {...register('addressLine1')} className="w-full rounded-2xl bg-slate-50 border-none px-6 py-4 font-medium" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Address Line 2 (City/Zip)</label>
                  <input {...register('addressLine2')} className="w-full rounded-2xl bg-slate-50 border-none px-6 py-4 font-medium" />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8"><Percent className="w-6 h-6 text-blue-600" /><h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Billing Logic</h3></div>
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${useDefaultGST ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Universal 5% GST Mode</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Force 5% GST on all medicines regardless of product settings</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" {...register('useDefaultGST')} className="sr-only peer" />
                  <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6"><Palette className="w-5 h-5 text-blue-400" /><h3 className="text-sm font-black uppercase tracking-widest">Interface Skin</h3></div>
              <div className="grid grid-cols-2 gap-3">
                <ThemeOption value="blue" color="bg-blue-600" label="Ocean" />
                <ThemeOption value="green" color="bg-emerald-600" label="Forest" />
                <ThemeOption value="purple" color="bg-purple-600" label="Royal" />
                <ThemeOption value="dark" color="bg-slate-800" label="Noir" />
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6"><ShieldCheck className="w-5 h-5 text-blue-600" /><h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Legal Compliance</h3></div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Judicial Jurisdiction</label>
                  <input {...register('jurisdiction')} className="w-full rounded-xl bg-slate-50 border-none px-4 py-3 font-bold text-slate-700" placeholder="e.g. Ahmedabad" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Drug Lic. Primary (20B)</label>
                  <input {...register('dlNo1')} className="w-full rounded-xl bg-slate-50 border-none px-4 py-3 font-mono text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Drug Lic. Secondary (21B)</label>
                  <input {...register('dlNo2')} className="w-full rounded-xl bg-slate-50 border-none px-4 py-3 font-mono text-sm" />
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="flex justify-center md:justify-end sticky bottom-4 z-50">
          <button type="submit" className="flex items-center px-12 py-5 bg-blue-600 text-white font-black text-lg rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all ring-8 ring-white/80">
            <Save className="w-6 h-6 mr-3" /> UPDATE CONFIGURATION
          </button>
        </div>
      </form>
    </div>
  );
};
