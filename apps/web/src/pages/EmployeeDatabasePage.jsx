import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Pencil, Trash2, FileText, AlertCircle, UploadCloud, X, Image as ImageIcon, Briefcase, CalendarCheck, Plus, Printer, Truck, Route } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import EmployeeDocumentsSection from '@/components/EmployeeDocumentsSection.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import EmployeePhotoModal from '@/components/EmployeePhotoModal.jsx';
import { getEmployeePhotoUrl } from '@/lib/photoUtils.js';
import AttendanceHub from '@/components/AttendanceHub.jsx';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const formatDateSafe = (dateVal, formatStr = 'MMM d, yyyy') => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return format(d, formatStr);
  } catch (e) {
    console.error('Failed to format date:', dateVal, e);
    return '';
  }
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const EmployeeDatabasePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedEmployeeForDocs, setSelectedEmployeeForDocs] = useState(null);
  
  const [filterType, setFilterType] = useState('all');
  const [filterEmpType, setFilterEmpType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedEmployeeForPhoto, setSelectedEmployeeForPhoto] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    employee_type: 'driver', employment_type: 'Permanent', name: '', joining_date: todayStr, address: '', contact: '', emergency_contact: '', license_number: '', aadhaar_number: '', pan_card: '', salary_amount: '', active_status: 'active', assigned_routes: '', assigned_truck: '', education: ''
  });

  // Agreement template state
  const [selectedEmployeeForAgreement, setSelectedEmployeeForAgreement] = useState('');
  const [agreementTemplate, setAgreementTemplate] = useState(
    `EMPLOYEE AGREEMENT\n\nThis agreement is made and entered into on {{CURRENT_DATE}} by and between Jai Bhavani Cargo and the employee, {{full_name}}.\n\nEmployee Details:\n- Aadhaar Number: {{AADHAAR}}\n- PAN Card: {{PAN}}\n- Contact: {{CONTACT}}\n- Address: {{ADDRESS}}\n\nPosition Details:\n- Role: {{ROLE}}\n- Employment Type: {{EMPLOYMENT_TYPE}}\n- Joining Date: {{JOINING_DATE}}\n- Base Salary: ₹{{SALARY}} per month\n\nTerms & Conditions:\n1. The Employee agrees to perform their duties diligently and follow all safety and cargo transit protocols.\n2. Salary will be paid according to the payroll billing cycle subject to attendance records.\n3. Driver is liable to verify vehicle exit checklists and report any accidents immediately.\n\nSigned,\nJai Bhavani Cargo Representative\n\n_______________________\nEmployee Signature ({{full_name}})`
  );

  const [companySettings, setCompanySettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const record = await pb.collection('company_settings').getOne('companysettings', { $autoCancel: false });
        setCompanySettings(record);
      } catch (err) {
        console.error('Failed to load company settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Accident history state
  const [accidents, setAccidents] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [accidentModalOpen, setAccidentModalOpen] = useState(false);
  const [accidentForm, setAccidentForm] = useState({
    employee_id: '',
    truck_id: '',
    accident_date: todayStr,
    description: '',
    damage_cost: '',
  });
  const [accidentFiles, setAccidentFiles] = useState([]);
  const [accidentPreviews, setAccidentPreviews] = useState([]);

  useEffect(() => {
    fetchData();
  }, [filterType, filterEmpType, searchTerm]);

  // Fetch trucks list
  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const records = await pb.collection('trucks').getFullList({ sort: '-created', $autoCancel: false });
        setTrucks(records);
      } catch (err) {
        console.error('Failed to load trucks:', err);
      }
    };
    fetchTrucks();
  }, []);

  // Fetch routes list
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const records = await pb.collection('routes').getFullList({ sort: 'route_code', $autoCancel: false });
        setRoutes(records);
      } catch (err) {
        console.error('Failed to load routes:', err);
      }
    };
    fetchRoutes();
  }, []);

  const fetchAccidents = async () => {
    try {
      const records = await pb.collection('driver_accident_reports').getFullList({
        sort: '-accident_date',
        expand: 'employee_id,truck_id',
        $autoCancel: false
      });
      setAccidents(records);
    } catch (err) {
      console.error('Failed to fetch accidents:', err);
    }
  };

  const fetchData = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const filterConditions = [];
      if (filterType !== 'all') filterConditions.push(`employee_type = "${filterType}"`);
      if (filterEmpType !== 'all') filterConditions.push(`employment_type = "${filterEmpType}"`);
      if (searchTerm) filterConditions.push(`(name ~ "${searchTerm}" || contact ~ "${searchTerm}")`);
      
      const queryFilter = filterConditions.join(' && ');
      const employeesData = await pb.collection('employees').getList(1, 500, { 
        filter: queryFilter, 
        sort: '-created', 
        expand: 'assigned_truck,assigned_routes',
        $autoCancel: false 
      });
      
      const items = employeesData.items || [];
      setEmployees(items);
      
      if (currentUser && !selectedEmployeeId && items.length > 0) {
        const ownProfile = items.find(e => e.name === currentUser.name || e.contact === currentUser.phone_number);
        if (ownProfile) {
          setSelectedEmployeeId(ownProfile.id);
        } else {
          setSelectedEmployeeId(items[0].id);
        }
      }

      if (items.length > 0 && !selectedEmployeeForAgreement) {
        setSelectedEmployeeForAgreement(items[0].id);
      }

      await fetchAccidents();
    } catch (err) {
      console.error('Failed to load employee data:', err);
      setError('Failed to load employee data. You may not have the required permissions.');
    } finally {
      setIsFetching(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_FILE_TYPES.includes(file.type)) return toast.error('Invalid file type.');
    if (file.size > MAX_FILE_SIZE) return toast.error('File too large.');

    setPhotoFile(file);
    setRemovePhoto(false);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhotoFile(null); setPhotoPreview(null); setRemovePhoto(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.joining_date) return toast.error('Joining Date is required');
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'salary_amount') {
          submitData.append(key, parseFloat(formData[key]) || 0);
        } else if (key === 'joining_date') {
          submitData.append(key, new Date(formData[key]).toISOString());
        } else if (key === 'assigned_truck' || key === 'assigned_routes') {
          submitData.append(key, formData[key] === 'none' ? '' : (formData[key] || ''));
        } else {
          submitData.append(key, formData[key] || '');
        }
      });

      if (photoFile) submitData.append('photo', photoFile);
      else if (removePhoto && editingId) submitData.append('photo', ''); 

      if (editingId) {
        await pb.collection('employees').update(editingId, submitData, { $autoCancel: false });
        toast.success('Employee updated successfully');
      } else {
        await pb.collection('employees').create(submitData, { $autoCancel: false });
        toast.success('Employee added successfully');
      }
      resetForm();
      fetchData();
    } catch (err) {
      toast.error('Failed to save employee data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setFormData({
      employee_type: employee.employee_type || 'driver', employment_type: employee.employment_type || 'Permanent', name: employee.name || '', joining_date: employee.joining_date ? employee.joining_date.split('T')[0] : todayStr, address: employee.address || '', contact: employee.contact || '', emergency_contact: employee.emergency_contact || '', license_number: employee.license_number || '', aadhaar_number: employee.aadhaar_number || '', pan_card: employee.pan_card || '', salary_amount: employee.salary_amount || '', active_status: employee.active_status || 'active', assigned_routes: employee.assigned_routes || '', assigned_truck: employee.assigned_truck || '', education: employee.education || ''
    });
    setPhotoFile(null); setRemovePhoto(false);
    setPhotoPreview(employee.photo ? getEmployeePhotoUrl(employee) : null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this employee?')) {
      try {
        await pb.collection('employees').delete(id, { $autoCancel: false });
        toast.success('Employee deleted');
        fetchData();
      } catch (err) {
        toast.error('Failed to delete employee.');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ employee_type: 'driver', employment_type: 'Permanent', name: '', joining_date: todayStr, address: '', contact: '', emergency_contact: '', license_number: '', aadhaar_number: '', pan_card: '', salary_amount: '', active_status: 'active', assigned_routes: '', assigned_truck: '', education: '' });
    clearPhoto();
  };

  // Compile bracket terms in agreement template
  const compileAgreement = () => {
    const emp = employees.find(e => e.id === selectedEmployeeForAgreement);
    if (!emp) return '';
    let text = agreementTemplate;
    text = text.replace(/{{full_name}}/g, emp.name || 'N/A');
    text = text.replace(/{{AADHAAR}}/g, emp.aadhaar_number || 'N/A');
    text = text.replace(/{{PAN}}/g, emp.pan_card || 'N/A');
    text = text.replace(/{{CONTACT}}/g, emp.contact || 'N/A');
    text = text.replace(/{{ADDRESS}}/g, emp.address || 'N/A');
    text = text.replace(/{{ROLE}}/g, emp.employee_type || 'N/A');
    text = text.replace(/{{EMPLOYMENT_TYPE}}/g, emp.employment_type || 'N/A');
    text = text.replace(/{{JOINING_DATE}}/g, formatDateSafe(emp.joining_date) || 'N/A');
    text = text.replace(/{{SALARY}}/g, emp.salary_amount ? emp.salary_amount.toLocaleString() : '0');
    text = text.replace(/{{CURRENT_DATE}}/g, formatDateSafe(new Date()) || 'N/A');
    text = text.replace(/Jai Bhavani Cargo/g, companySettings?.company_name || 'Jai Bhavani Cargo');
    return text;
  };

  const handlePrint = () => {
    window.print();
  };

  // Accident images change
  const handleAccidentFiles = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAccidentFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setAccidentPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeAccidentPreview = (index) => {
    setAccidentPreviews(prev => prev.filter((_, i) => i !== index));
    setAccidentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAccidentSubmit = async (e) => {
    e.preventDefault();
    if (!accidentForm.employee_id || !accidentForm.truck_id) {
      toast.error('Driver and Truck are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('employee_id', accidentForm.employee_id);
      data.append('truck_id', accidentForm.truck_id);
      data.append('accident_date', new Date(accidentForm.accident_date).toISOString());
      data.append('description', accidentForm.description);
      data.append('damage_cost', Number(accidentForm.damage_cost));

      accidentFiles.forEach(file => {
        data.append('image_urls', file);
      });

      await pb.collection('driver_accident_reports').create(data, { $autoCancel: false });
      toast.success('Accident report logged successfully');
      setAccidentModalOpen(false);
      setAccidentForm({
        employee_id: '',
        truck_id: '',
        accident_date: todayStr,
        description: '',
        damage_cost: '',
      });
      setAccidentFiles([]);
      setAccidentPreviews([]);
      fetchAccidents();
    } catch (err) {
      console.error(err);
      toast.error('Failed to log accident report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalDamageCost = accidents.reduce((sum, item) => sum + (item.damage_cost || 0), 0);

  return (
    <div className="h-full w-full bg-background flex flex-col">
      <Helmet><title>Employee Database | Dashboard</title></Helmet>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-agreement-area, #print-agreement-area * {
            visibility: visible;
          }
          #print-agreement-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
            font-size: 13pt;
            line-height: 1.6;
            color: #000;
            background: #fff;
            box-shadow: none;
            border: none;
          }
          @page {
            size: A4;
            margin: 20mm;
          }
        }
      `}} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 max-w-7xl">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Hub</h1>
            <p className="text-muted-foreground mt-1">Manage staff records, calculate salaries, track attendance, print agreements, and log accident files.</p>
          </div>
        </div>

        <Tabs defaultValue="directory" className="w-full">
          <TabsList className="mb-6 h-12 p-1 bg-muted/50 rounded-xl w-full sm:w-auto inline-flex overflow-x-auto hide-scrollbar">
            <TabsTrigger value="directory" className="rounded-lg h-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
              <Briefcase className="w-4 h-4 mr-2" /> Directory
            </TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-lg h-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
              <CalendarCheck className="w-4 h-4 mr-2" /> Attendance Hub
            </TabsTrigger>
            <TabsTrigger value="agreements" className="rounded-lg h-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
              <FileText className="w-4 h-4 mr-2" /> Agreement Templates
            </TabsTrigger>
            <TabsTrigger value="accidents" className="rounded-lg h-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
              <AlertCircle className="w-4 h-4 mr-2" /> Accident History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-6 mt-0 outline-none">
            <Card className="shadow-sm border-border">
              <CardHeader><CardTitle>{editingId ? 'Edit Employee Record' : 'Add New Employee'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start border-b border-border pb-8">
                    <div className="w-full md:w-1/3 lg:w-1/4 space-y-3">
                      <Label>Employee Photo</Label>
                      <div 
                        className={`relative flex flex-col items-center justify-center w-full aspect-square max-w-[240px] rounded-2xl border-2 border-dashed transition-colors overflow-hidden ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 bg-muted/30 hover:bg-muted/50'}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handlePhotoChange({ target: { files: e.dataTransfer.files }}); }}
                      >
                        {photoPreview ? (
                          <>
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button type="button" size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>Change</Button>
                              <Button type="button" size="sm" variant="destructive" onClick={clearPhoto}><X className="w-4 h-4" /></Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center cursor-pointer h-full w-full" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-12 h-12 rounded-full bg-background shadow-sm flex items-center justify-center mb-3"><UploadCloud className="w-6 h-6 text-muted-foreground" /></div>
                            <p className="text-sm font-medium">Click or drag photo</p>
                            <p className="text-xs text-muted-foreground mt-1">JPG, PNG (Max 5MB)</p>
                          </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handlePhotoChange} />
                      </div>
                    </div>

                    <div className="w-full md:w-2/3 lg:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><Label>Full Name <span className="text-destructive">*</span></Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="bg-background"/></div>
                      <div className="space-y-2"><Label>Joining Date <span className="text-destructive">*</span></Label><Input type="date" max={todayStr} value={formData.joining_date} onChange={e => setFormData({...formData, joining_date: e.target.value})} required className="bg-background"/></div>
                      <div className="space-y-2"><Label>Employee Role</Label><Select value={formData.employee_type} onValueChange={v => setFormData({...formData, employee_type: v})}><SelectTrigger className="bg-background"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="driver">Driver</SelectItem><SelectItem value="supervisor">Supervisor</SelectItem><SelectItem value="manager">Manager</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>Employment Type <span className="text-destructive">*</span></Label><Select value={formData.employment_type} onValueChange={v => setFormData({...formData, employment_type: v})} required><SelectTrigger className="bg-background"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Permanent">Permanent</SelectItem><SelectItem value="Market / Leased">Market / Leased</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>Primary Contact <span className="text-destructive">*</span></Label><Input value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} required className="bg-background"/></div>
                      <div className="space-y-2"><Label>Emergency Contact</Label><Input value={formData.emergency_contact} onChange={e => setFormData({...formData, emergency_contact: e.target.value})} className="bg-background"/></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2 lg:col-span-3"><Label>Residential Address</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="bg-background"/></div>
                    <div className="space-y-2"><Label>License Number</Label><Input value={formData.license_number} onChange={e => setFormData({...formData, license_number: e.target.value})} className="bg-background"/></div>
                    <div className="space-y-2"><Label>Aadhaar Number</Label><Input value={formData.aadhaar_number} onChange={e => setFormData({...formData, aadhaar_number: e.target.value})} className="bg-background"/></div>
                    <div className="space-y-2"><Label>PAN Card</Label><Input value={formData.pan_card} onChange={e => setFormData({...formData, pan_card: e.target.value})} className="bg-background"/></div>
                    <div className="space-y-2"><Label>Base Salary (₹)</Label><Input type="number" step="0.01" value={formData.salary_amount} onChange={e => setFormData({...formData, salary_amount: e.target.value})} className="bg-background"/></div>
                    <div className="space-y-2"><Label>Status</Label><Select value={formData.active_status} onValueChange={v => setFormData({...formData, active_status: v})}><SelectTrigger className="bg-background"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="leave">On Leave</SelectItem><SelectItem value="abscond">Absconded</SelectItem><SelectItem value="terminated">Terminated</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Education / Qualification</Label><Input value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} placeholder="e.g. High School, B.A." className="bg-background"/></div>
                    <div className="space-y-2">
                      <Label>Assigned Truck</Label>
                      <Select 
                        value={formData.assigned_truck || 'none'} 
                        onValueChange={v => setFormData({...formData, assigned_truck: v})}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select a Truck" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {trucks.map(truck => (
                            <SelectItem key={truck.id} value={truck.id}>
                              {truck.truck_number} {truck.truck_name ? `(${truck.truck_name})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Assigned Route</Label>
                      <Select 
                        value={formData.assigned_routes || 'none'} 
                        onValueChange={v => setFormData({...formData, assigned_routes: v})}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select a Route" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {routes.map(r => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.route_code} ({r.start_location} → {r.end_location})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Button type="submit" disabled={isSubmitting} className="rounded-xl">{isSubmitting ? 'Saving...' : editingId ? 'Update Employee' : 'Add Employee'}</Button>
                    {editingId && <Button type="button" variant="outline" className="rounded-xl" onClick={resetForm} disabled={isSubmitting}>Cancel Edit</Button>}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border overflow-hidden bg-card">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="flex-1 w-full max-w-sm">
                    <Input placeholder="Search by name or contact..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-background"/>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-[150px] bg-background"><SelectValue placeholder="Role" /></SelectTrigger><SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="driver">Driver</SelectItem><SelectItem value="supervisor">Supervisor</SelectItem><SelectItem value="manager">Manager</SelectItem></SelectContent></Select>
                    <Select value={filterEmpType} onValueChange={setFilterEmpType}><SelectTrigger className="w-[180px] bg-background"><SelectValue placeholder="Employment Type" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="Permanent">Permanent</SelectItem><SelectItem value="Market / Leased">Market / Leased</SelectItem></SelectContent></Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4"><CardTitle>Staff Directory</CardTitle></CardHeader>
              <CardContent className="p-0">
                {isFetching ? <div className="py-24 flex justify-center"><LoadingSpinner text="Loading employee database..." /></div> : error ? (
                  <div className="py-24 text-center"><AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-50" /><p className="text-lg font-medium text-destructive">{error}</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="w-[80px]">Photo</TableHead>
                          <TableHead>Employee Profile</TableHead>
                          <TableHead>Joining Date</TableHead>
                          <TableHead>Contact Info</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Attendance</TableHead>
                          <TableHead>Salary</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employees.length === 0 ? (
                          <TableRow><TableCell colSpan={8} className="h-48 text-center text-muted-foreground">No employees found.</TableCell></TableRow>
                        ) : employees.map(emp => (
                          <TableRow key={emp.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-border shadow-sm bg-muted/50 flex items-center justify-center cursor-pointer" onClick={() => {setSelectedEmployeeForPhoto(emp); setIsPhotoModalOpen(true);}}>
                                {emp.photo ? <img src={getEmployeePhotoUrl(emp, true)} alt={emp.name} className="w-full h-full object-cover"/> : <ImageIcon className="w-5 h-5 text-muted-foreground/50" />}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              <span className="truncate max-w-[150px] block font-semibold">{emp.name}</span>
                              <div className="flex gap-1.5 flex-wrap items-center mt-1">
                                <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider">{emp.employee_type || 'Staff'}</Badge>
                                <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider">{emp.employment_type || 'Permanent'}</Badge>
                                {emp.education && (
                                  <Badge variant="outline" className="font-normal text-[10px] text-amber-500 border-amber-500/30 bg-amber-500/5">
                                    🎓 {emp.education}
                                  </Badge>
                                )}
                                {emp.expand?.assigned_truck && (
                                  <Badge variant="outline" className="font-normal text-[10px] text-primary border-primary/30 bg-primary/5 flex items-center gap-1">
                                    <Truck className="w-3 h-3" /> {emp.expand.assigned_truck.truck_number}
                                  </Badge>
                                )}
                                {emp.expand?.assigned_routes && (
                                  <Badge variant="outline" className="font-normal text-[10px] text-success border-success/30 bg-success/5 flex items-center gap-1">
                                    <Route className="w-3 h-3" /> {emp.expand.assigned_routes.route_code}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{formatDateSafe(emp.joining_date) || '-'}</TableCell>
                            <TableCell className="text-muted-foreground">{emp.contact}</TableCell>
                            <TableCell>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${emp.active_status === 'active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{emp.active_status}</span>
                            </TableCell>
                            <TableCell>
                              <button 
                                onClick={() => navigate(`/dashboard/attendance?employeeId=${emp.id}`)}
                                className="text-primary hover:text-primary/80 hover:underline font-medium text-sm transition-all focus:outline-none"
                              >
                                View Logs
                              </button>
                            </TableCell>
                            <TableCell>
                              <button 
                                onClick={() => navigate(`/dashboard/attendance?employeeId=${emp.id}`)}
                                className="text-primary hover:text-primary/80 hover:underline font-medium tabular-nums text-sm transition-all focus:outline-none"
                              >
                                {emp.salary_amount ? `₹${emp.salary_amount.toLocaleString()}` : '-'}
                              </button>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="sm" variant={selectedEmployeeForDocs?.id === emp.id ? 'secondary' : 'ghost'} onClick={() => setSelectedEmployeeForDocs(selectedEmployeeForDocs?.id === emp.id ? null : emp)}>
                                  <FileText className="w-4 h-4 mr-1.5" /> Docs
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleEdit(emp)}><Pencil className="w-4 h-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => handleDelete(emp.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
            {selectedEmployeeForDocs && <div className="animate-in slide-in-from-bottom-4"><EmployeeDocumentsSection employee={selectedEmployeeForDocs} /></div>}
          </TabsContent>

          <TabsContent value="attendance" className="mt-0 outline-none space-y-6">
            <Card className="shadow-sm border-border bg-card">
              <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full flex items-center gap-3">
                  <Label className="whitespace-nowrap font-medium text-muted-foreground">Viewing Attendance For:</Label>
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger className="w-full md:max-w-xs bg-background rounded-xl">
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.employee_type})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <AttendanceHub employeeId={selectedEmployeeId} />
          </TabsContent>

          {/* Agreement Templates Tab */}
          <TabsContent value="agreements" className="mt-0 outline-none space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Settings Panel */}
              <Card className="lg:col-span-1 border border-border/50 rounded-3xl p-6 bg-card space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-heading text-foreground">Agreement Template Settings</h3>
                  <p className="text-xs text-muted-foreground">Customize default templates with fields</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Employee to Generate</Label>
                    <Select value={selectedEmployeeForAgreement} onValueChange={setSelectedEmployeeForAgreement}>
                      <SelectTrigger className="rounded-xl bg-background">
                        <SelectValue placeholder="Choose staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.employee_type})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Template Body</Label>
                      <span className="text-[10px] text-primary font-bold">Use rich text bracket variables</span>
                    </div>
                    <textarea 
                      className="w-full h-[320px] p-3 text-xs bg-background border border-border/50 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      value={agreementTemplate}
                      onChange={e => setAgreementTemplate(e.target.value)}
                    />
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl border border-border/50 space-y-2 text-[10px] text-muted-foreground">
                    <p className="font-bold">Available variables:</p>
                    <div className="grid grid-cols-2 gap-1 font-mono">
                      <span>{"{{full_name}}"}</span>
                      <span>{"{{AADHAAR}}"}</span>
                      <span>{"{{PAN}}"}</span>
                      <span>{"{{CONTACT}}"}</span>
                      <span>{"{{ADDRESS}}"}</span>
                      <span>{"{{ROLE}}"}</span>
                      <span>{"{{EMPLOYMENT_TYPE}}"}</span>
                      <span>{"{{JOINING_DATE}}"}</span>
                      <span>{"{{SALARY}}"}</span>
                      <span>{"{{CURRENT_DATE}}"}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Right Preview Panel */}
              <Card className="lg:col-span-2 border border-border/50 rounded-3xl p-6 bg-card space-y-6 flex flex-col">
                <div className="flex justify-between items-center border-b border-border/50 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-heading text-foreground">Document Print Preview</h3>
                    <p className="text-xs text-muted-foreground">Verify final document before printing</p>
                  </div>
                  <Button onClick={handlePrint} className="rounded-xl shadow-sm flex items-center gap-2">
                    <Printer className="w-4 h-4" /> Print Form
                  </Button>
                </div>

                <div className="flex-1 flex items-center justify-center bg-muted/10 rounded-2xl p-4 overflow-y-auto min-h-[450px]">
                  <div 
                    id="print-agreement-area" 
                    className="p-8 bg-background border border-gray-300 rounded-2xl shadow-sm max-w-2xl w-full font-mono whitespace-pre-wrap leading-relaxed text-xs min-h-[550px]"
                  >
                    {/* Visual corporate header for agreement print */}
                    {companySettings && (
                      <div className="border-b border-gray-300 pb-6 mb-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {companySettings.company_logo && (
                            <img 
                              src={pb.files.getUrl(companySettings, companySettings.company_logo)} 
                              alt="Logo" 
                              className="h-10 w-auto object-contain"
                            />
                          )}
                          <div>
                            <h2 className="text-sm font-bold uppercase tracking-wide text-black">
                              {companySettings.company_name}
                            </h2>
                            <p className="text-[9px] text-gray-500 mt-0.5 max-w-sm leading-tight">
                              {companySettings.company_address}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-[9px] text-gray-500">
                          {companySettings.company_phone && <p>Phone: {companySettings.company_phone}</p>}
                          {companySettings.company_email && <p>Email: {companySettings.company_email}</p>}
                        </div>
                      </div>
                    )}
                    <div className="text-black">
                      {compileAgreement() || 'Select an employee and draft your agreement to preview it here.'}
                    </div>
                  </div>
                </div>
              </Card>

            </div>
          </TabsContent>

          {/* Accident History Tab */}
          <TabsContent value="accidents" className="mt-0 outline-none space-y-6">
            
            {/* Top Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border border-border/50 rounded-3xl bg-card">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Total Recorded Accidents</span>
                <span className="text-3xl font-bold text-foreground mt-1 block">{accidents.length}</span>
              </Card>
              <Card className="p-6 border border-border/50 rounded-3xl bg-card">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Total Damage Cost</span>
                <span className="text-3xl font-bold text-destructive mt-1 block">₹{totalDamageCost.toLocaleString()}</span>
              </Card>
              <Card className="p-6 border border-border/50 rounded-3xl bg-card flex flex-col justify-center">
                <Button onClick={() => setAccidentModalOpen(true)} className="rounded-xl flex items-center justify-center gap-2 h-12 shadow-sm">
                  <Plus className="w-4 h-4" /> Log Accident Report
                </Button>
              </Card>
            </div>

            {/* Accidents List */}
            <Card className="shadow-sm border-border overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4"><CardTitle>Accident & Damage Logs</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Driver Profile</TableHead>
                        <TableHead>Vehicle Number</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Damage Cost</TableHead>
                        <TableHead>Snapshots</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accidents.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="h-48 text-center text-muted-foreground">No accident reports logged yet.</TableCell></TableRow>
                      ) : accidents.map(log => {
                        const driver = log.expand?.employee_id;
                        const truckRec = log.expand?.truck_id;
                        
                        return (
                          <TableRow key={log.id} className="hover:bg-muted/30">
                            <TableCell className="font-semibold text-muted-foreground">
                              {formatDateSafe(log.accident_date) || '-'}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {driver?.name || 'Unknown Driver'}
                              <span className="block text-[10px] text-muted-foreground">{driver?.contact}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-bold font-mono">
                                {truckRec?.truck_number || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-muted-foreground text-xs" title={log.description}>
                              {log.description}
                            </TableCell>
                            <TableCell className="font-bold text-destructive tabular-nums">
                              ₹{log.damage_cost ? log.damage_cost.toLocaleString() : '0'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1.5 overflow-x-auto max-w-[120px]">
                                {log.image_urls && (Array.isArray(log.image_urls) ? log.image_urls : [log.image_urls]).slice(0, 3).map((img, i) => (
                                  <a 
                                    key={i} 
                                    href={pb.files.getURL(log, img)} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="w-8 h-8 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted flex items-center justify-center shadow-inner hover:scale-105 transition-transform"
                                  >
                                    <img src={pb.files.getURL(log, img, { thumb: '50x50' })} alt="damage" className="w-full h-full object-cover" />
                                  </a>
                                ))}
                                {(!log.image_urls || log.image_urls.length === 0) && (
                                  <span className="text-[10px] text-muted-foreground">No Photos</span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>

      {/* Log Accident Dialog */}
      <Dialog open={accidentModalOpen} onOpenChange={(val) => !val && !isSubmitting && setAccidentModalOpen(false)}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-border/50 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-bold">Log Driver Accident Report</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAccidentSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Driver <span className="text-destructive">*</span></Label>
              <Select required value={accidentForm.employee_id} onValueChange={val => setAccidentForm({...accidentForm, employee_id: val})}>
                <SelectTrigger className="rounded-xl bg-background">
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.employee_type === 'driver').map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Select Truck <span className="text-destructive">*</span></Label>
              <Select required value={accidentForm.truck_id} onValueChange={val => setAccidentForm({...accidentForm, truck_id: val})}>
                <SelectTrigger className="rounded-xl bg-background">
                  <SelectValue placeholder="Select truck" />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.truck_number} ({t.truck_name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Accident Date <span className="text-destructive">*</span></Label>
              <Input 
                type="date" 
                required
                className="rounded-xl" 
                value={accidentForm.accident_date} 
                onChange={e => setAccidentForm({...accidentForm, accident_date: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Damage Cost (₹) <span className="text-destructive">*</span></Label>
              <Input 
                type="number" 
                required 
                min="0"
                className="rounded-xl" 
                value={accidentForm.damage_cost} 
                onChange={e => setAccidentForm({...accidentForm, damage_cost: e.target.value})} 
                placeholder="e.g. 15000"
              />
            </div>

            <div className="space-y-2">
              <Label>Accident / Damage Description</Label>
              <textarea 
                className="w-full min-h-[80px] p-3 text-xs bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                value={accidentForm.description}
                onChange={e => setAccidentForm({...accidentForm, description: e.target.value})}
                placeholder="Briefly describe the accident and damages..."
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Accident Photos</Label>
              <div className="border border-border/50 bg-muted/10 rounded-2xl p-4 text-center relative cursor-pointer hover:bg-muted/20 transition-all flex flex-col items-center justify-center min-h-[100px]">
                <div className="py-2">
                  <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <span className="text-xs text-muted-foreground">Select multiple images</span>
                </div>
                <input 
                  type="file" 
                  multiple
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={handleAccidentFiles} 
                />
              </div>

              {accidentPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {accidentPreviews.map((url, i) => (
                    <div key={i} className="relative aspect-square border rounded-lg overflow-hidden bg-background">
                      <img src={url} alt="accident preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        className="absolute top-1 right-1 bg-destructive/90 text-white rounded-full p-0.5"
                        onClick={() => removeAccidentPreview(i)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setAccidentModalOpen(false)} disabled={isSubmitting} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl shadow-sm">
                {isSubmitting && <LoadingSpinner className="w-4 h-4 mr-2 animate-spin" />}
                Log Report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <EmployeePhotoModal isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} employee={selectedEmployeeForPhoto} />
    </div>
  );
};

export default EmployeeDatabasePage;