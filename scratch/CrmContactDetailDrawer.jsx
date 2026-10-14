import React, { useState } from 'react';

function safeParseArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    if (typeof val === 'string' && val.includes(',')) {
      return val.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [String(val).trim()].filter(Boolean);
  }
}

// Robust Google Maps link extraction from any field or embedded notes string
function extractGoogleMapsUrl(contact) {
  if (!contact) return '';
  const directFields = [
    contact.google_map_link,
    contact.location_url,
    contact.maps_url,
    contact.map_url,
    contact.google_maps_url,
    contact.map_link
  ];
  for (const f of directFields) {
    if (f && typeof f === 'string' && f.trim() && (f.includes('maps') || f.includes('goo.gl'))) {
      const trimmed = f.trim();
      const m = trimmed.match(/https?:\/\/[^\s"'<>\]]+/i);
      if (m) return m[0].replace(/[\]\)\}>.,;'"\\]+$/, '').trim();
      return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    }
  }
  if (contact.notes && typeof contact.notes === 'string') {
    const m = contact.notes.match(/https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.com\/maps|maps\.google\.com)\/[^\s"'<>\]]+/i);
    if (m) return m[0].replace(/[\]\)\}>.,;'"\\]+$/, '').trim();
    const locMatch = contact.notes.match(/\[Location:\s*([^\s\]]+)\]/i);
    if (locMatch) {
      const u = locMatch[1].trim();
      return u.startsWith('http') ? u : `https://${u}`;
    }
  }
  if (contact.physical_address && typeof contact.physical_address === 'string' && (contact.physical_address.includes('goo.gl') || contact.physical_address.includes('maps'))) {
    const m = contact.physical_address.match(/https?:\/\/[^\s"'<>\]]+/i);
    if (m) return m[0].replace(/[\]\)\}>.,;'"\\]+$/, '').trim();
  }
  for (const k of Object.keys(contact)) {
    const val = contact[k];
    if (typeof val === 'string' && (val.includes('maps.app.goo.gl') || val.includes('goo.gl/maps'))) {
      const m = val.match(/https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps)[^\s"'<>\]]+/i);
      if (m) return m[0].replace(/[\]\)\}>.,;'"\\]+$/, '').trim();
    }
  }
  return '';
}

function cleanPhysicalAddress(contact) {
  let addr = contact.physical_address || '';
  if (addr.startsWith('http://') || addr.startsWith('https://')) {
    addr = '';
  }
  if (!addr && contact.notes) {
    const cleanNotes = contact.notes.replace(/\[?Location:\s*https?:\/\/[^\]\s\n]+\]?/gi, '').trim();
    if (cleanNotes && cleanNotes.length < 80 && !cleanNotes.includes('\n')) {
      addr = cleanNotes;
    }
  }
  return addr.replace(/\[?Location:\s*https?:\/\/[^\]\s\n]+\]?/gi, '').trim() || 'No physical address provided.';
}

export function CrmContactDetailDrawer({ isOpen, onClose, contact, onEdit, imports }) {
  const { e, h, Dialog, DialogContent, DialogHeader, DialogTitle, Button, Badge, Phone, Mail, MapPin, Wrench, Building, Copy, Share2, Check, ExternalLink, ShieldCheck, Star } = imports;

  if (!contact) return null;

  const brands = safeParseArray(contact.truck_brands);
  const subcats = safeParseArray(contact.subcategories);
  const specs = safeParseArray(contact.service_specialisations);
  const phoneNumbers = (contact.phone_number || '').split(/[,;\/\n]+/).map(p => p.trim()).filter(Boolean);
  const mapsUrl = extractGoogleMapsUrl(contact);
  const displayAddr = cleanPhysicalAddress(contact);

  const copyDetails = async () => {
    const summary = [
      `📍 *${contact.company_name}* (${contact.main_group || contact.contact_type || 'Transport Directory'})`,
      contact.organisation_name && contact.organisation_name !== contact.company_name ? `🏢 Organisation: ${contact.organisation_name}` : null,
      contact.designation ? `👤 Designation: ${contact.designation}` : null,
      phoneNumbers.length > 0 ? `📞 Phone(s): ${phoneNumbers.join(', ')}` : null,
      contact.email ? `✉️ Email: ${contact.email}` : null,
      contact.gstin ? `📄 GSTIN: ${contact.gstin}` : null,
      brands.length > 0 ? `🚛 Supported Brands: ${brands.join(', ')}` : null,
      subcats.length > 0 ? `📂 Services: ${subcats.join(', ')}` : null,
      contact.physical_address ? `🏢 Address: ${contact.physical_address}` : null,
      mapsUrl ? `🗺️ Maps: ${mapsUrl}` : null,
      contact.notes ? `📝 Notes: ${contact.notes}` : null,
      `\nShared via Jai Bhavani Cargo Fleet CRM`
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      imports.toast.success('Full Contact Dossier copied to clipboard!');
    } catch {
      imports.toast.error('Failed to copy contact details');
    }
  };

  const shareWhatsApp = () => {
    const summary = [
      `📇 *${contact.company_name}*`,
      contact.main_group ? `📂 Group: ${contact.main_group}` : null,
      contact.primary_category ? `🔧 Role: ${contact.primary_category}` : null,
      phoneNumbers.length > 0 ? `📞 Call: ${phoneNumbers[0]}` : null,
      contact.physical_address ? `📍 Address: ${contact.physical_address}` : null,
      mapsUrl ? `🗺️ Google Maps: ${mapsUrl}` : null,
      `_Jai Bhavani Cargo CRM_`
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100 p-6 rounded-3xl shadow-2xl">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/20 text-primary border border-primary/30">
                  {contact.main_group || 'Fleet Services'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {contact.primary_category || contact.contact_type}
                </span>
                {contact.is_preferred ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    ⭐ Preferred
                  </span>
                ) : null}
                {contact.emergency_available ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                    🚨 24/7 Night Service
                  </span>
                ) : null}
              </div>
              <DialogTitle className="text-2xl font-black text-white tracking-tight">
                {contact.company_name}
              </DialogTitle>
              {contact.organisation_name && contact.organisation_name !== contact.company_name && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                  <span>🏢</span> Entity: {contact.organisation_name}
                </p>
              )}
            </div>
            {contact.verification_status === 'verified' && (
              <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1 shrink-0">
                ✓ Verified
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Direct Phone Numbers & Quick Actions */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Direct Contact Lines
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {phoneNumbers.map((ph, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-emerald-400 text-sm">📞</span>
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-sm text-white block truncate">{ph}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {idx === 0 ? 'Primary Number' : `Alternate #${idx + 1}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${ph.replace(/\D/g, '')}`}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                    >
                      Call
                    </a>
                    <a
                      href={`https://wa.me/${ph.replace(/\D/g, '').startsWith('91') ? ph.replace(/\D/g, '') : '91' + ph.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Truck Brands */}
          {brands.length > 0 && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                🚛 Supported Truck Brands & Workshop Type
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {brands.map(b => (
                  <span key={b} className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {b}
                  </span>
                ))}
                {contact.workshop_type && (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                    {contact.workshop_type} Centre
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Subcategories & Specialisations */}
          {(subcats.length > 0 || specs.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subcats.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    📂 Subcategories & Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {subcats.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800">
                        • {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {specs.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                    🔧 Repair Specialisations
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {specs.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Location & GPS Routing */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block">
              📍 Workshop Address & Regional Hub
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {displayAddr}
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
              {contact.city && <span><strong>City:</strong> {contact.city}</span>}
              {contact.area && <span><strong>Area:</strong> {contact.area}</span>}
              {contact.working_hours && <span><strong>Hours:</strong> {contact.working_hours}</span>}
            </div>

            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
              >
                <span>🗺️</span> Open Google Maps GPS Navigation
              </a>
            )}
          </div>

          {/* Corporate / Tax Details */}
          {(contact.gstin || contact.email || contact.designation) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              {contact.gstin && (
                <div>
                  <span className="text-slate-400 font-bold block">GSTIN</span>
                  <span className="font-mono text-white font-semibold">{contact.gstin}</span>
                </div>
              )}
              {contact.email && (
                <div>
                  <span className="text-slate-400 font-bold block">Email</span>
                  <a href={`mailto:${contact.email}`} className="text-primary hover:underline truncate block">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.designation && (
                <div>
                  <span className="text-slate-400 font-bold block">Designation</span>
                  <span className="text-slate-200 font-medium">{contact.designation}</span>
                </div>
              )}
            </div>
          )}

          {/* Internal Notes */}
          {contact.notes && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Internal Fleet Notes
              </span>
              <p className="text-xs text-slate-300 italic whitespace-pre-wrap">
                "{contact.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
          <Button variant="outline" onClick={copyDetails} className="border-slate-700 bg-slate-800 text-slate-200 text-xs font-bold gap-1.5">
            <span>📋</span> Copy Dossier
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={shareWhatsApp} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 shadow-md">
              <span>💬</span> WhatsApp
            </Button>
            <Button onClick={() => { onClose(); onEdit(contact); }} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5">
              <span>✏️</span> Edit Record
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
