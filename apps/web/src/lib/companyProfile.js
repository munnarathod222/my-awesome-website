import { useState, useEffect } from 'react';
import pb from './pocketbaseClient.js';

let cachedProfile = null;
let listeners = [];

export const getCompanyProfileSync = () => {
  if (cachedProfile) return cachedProfile;

  try {
    const saved = localStorage.getItem('jbc_company_profile_cache');
    if (saved) {
      cachedProfile = JSON.parse(saved);
      return cachedProfile;
    }
  } catch (e) {}

  return {
    company_name: 'JAI BHAVANI CARGO',
    company_address: 'Plot No. 3, Patel Nagar, Ghatkesar, Medchal-Malkajgiri Dist., Telangana - 501301',
    company_phone: '+91 7794072244',
    company_email: 'operations@jaibhavanicargo.com',
    company_website: 'www.jaibhavanicargo.com',
    company_gstin: '36DPXPR9171A1Z8',
    bank_name: 'HDFC Bank',
    account_name: 'JAI BHAVANI CARGO',
    account_number: '50200117182677',
    ifsc_code: 'HDFC0004480',
    branch_name: 'Ghatkesar Branch',
    signatory_name: 'Vinod kumar Rathod',
    signatory_title: 'Authorized Signatory',
    company_logo: '',
    e_signature: localStorage.getItem('jbc_e_signature') || ''
  };
};

export const fetchCompanyProfile = async () => {
  try {
    const record = await pb.collection('company_settings').getOne('companysettings', { $autoCancel: false });
    if (record) {
      let logoUrl = '';
      if (record.company_logo) {
        logoUrl = pb.files.getUrl(record, record.company_logo);
      }

      let sigUrl = localStorage.getItem('jbc_e_signature') || '';
      if (record.e_signature) {
        sigUrl = pb.files.getUrl(record, record.e_signature);
        localStorage.setItem('jbc_e_signature', sigUrl);
      }

      cachedProfile = {
        company_name: record.company_name || 'JAI BHAVANI CARGO',
        company_address: record.company_address || 'Plot No. 3, Patel Nagar, Ghatkesar, Medchal-Malkajgiri Dist., Telangana - 501301',
        company_phone: record.company_phone || '+91 7794072244',
        company_email: record.company_email || 'operations@jaibhavanicargo.com',
        company_website: record.company_website || 'www.jaibhavanicargo.com',
        company_gstin: record.company_gstin || '36DPXPR9171A1Z8',
        bank_name: record.bank_name || 'HDFC Bank',
        account_name: record.account_name || record.company_name || 'JAI BHAVANI CARGO',
        account_number: record.account_number || '50200117182677',
        ifsc_code: record.ifsc_code || 'HDFC0004480',
        branch_name: record.branch_name || 'Ghatkesar Branch',
        signatory_name: record.signatory_name || localStorage.getItem('jbc_signatory_name') || 'Vinod kumar Rathod',
        signatory_title: record.signatory_title || localStorage.getItem('jbc_signatory_title') || 'Authorized Signatory',
        company_logo: logoUrl,
        e_signature: sigUrl
      };

      try {
        localStorage.setItem('jbc_company_profile_cache', JSON.stringify(cachedProfile));
      } catch (e) {}

      listeners.forEach(fn => fn(cachedProfile));
      return cachedProfile;
    }
  } catch (err) {
    console.warn('[companyProfile] Error fetching company settings:', err?.message);
  }

  return getCompanyProfileSync();
};

export const useCompanyProfile = () => {
  const [profile, setProfile] = useState(() => getCompanyProfileSync());

  useEffect(() => {
    let isMounted = true;
    
    const updateProfile = (newProfile) => {
      if (isMounted) setProfile(newProfile);
    };

    listeners.push(updateProfile);
    fetchCompanyProfile().then(data => {
      if (isMounted && data) setProfile(data);
    });

    return () => {
      isMounted = false;
      listeners = listeners.filter(fn => fn !== updateProfile);
    };
  }, []);

  return profile;
};
