import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Users, Plus, Edit, Trash2, UserCheck, DollarSign, Download, Filter } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { t, isRTL } from "@/lib/i18n";
import { insertWorkerSchema, insertWorkerAttendanceSchema } from "@shared/schema";
import type { Worker, WorkerAttendance } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import SalaryDeductions from "@/components/salary-deductions";

const attendanceSchema = insertWorkerAttendanceSchema.extend({
  attendanceDate: z.string().min(1, "Date is required"),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  hoursWorked: z.coerce.number().min(0).optional(),
  overtimeHours: z.coerce.number().min(0).optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export default function Workers() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<WorkerAttendance | null>(null);
  const [activeTab, setActiveTab] = useState("workers");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [attendanceWorkerFilter, setAttendanceWorkerFilter] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch workers
  const { data: workers = [], isLoading: workersLoading } = useQuery({
    queryKey: ['/api/workers'],
  });

  // Fetch attendance for selected date
  const { data: dailyAttendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['/api/attendance/date', format(selectedDate, 'yyyy-MM-dd')],
    enabled: !!selectedDate,
  });

  // Fetch monthly attendance for the selected worker and month
  const { data: monthlyAttendance = [], isLoading: monthlyAttendanceLoading } = useQuery({
    queryKey: ['/api/attendance/worker', attendanceWorkerFilter, format(startOfMonth(selectedMonth), 'yyyy-MM-dd'), format(endOfMonth(selectedMonth), 'yyyy-MM-dd')],
    enabled: !!attendanceWorkerFilter,
  });

  // Fetch monthly summary for selected worker
  const { data: monthlySummary } = useQuery({
    queryKey: ['/api/attendance/summary', selectedWorker?.id, selectedDate.getFullYear(), selectedDate.getMonth() + 1],
    enabled: !!selectedWorker,
  });

  // Worker form with proper number coercion for salary
  const workerFormSchema = insertWorkerSchema.extend({
    salary: z.coerce.number().min(0, "Salary must be a positive number"),
  });

  const workerForm = useForm({
    resolver: zodResolver(workerFormSchema),
    defaultValues: {
      name: "",
      position: "",
      department: "",
      salary: 0,
      hireDate: format(new Date(), 'yyyy-MM-dd'),
      email: "",
      phone: "",
    }
  });

  // Attendance form
  const attendanceForm = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      workerId: 0,
      attendanceDate: format(selectedDate, 'yyyy-MM-dd'),
      status: "present",
      checkInTime: "",
      checkOutTime: "",
      hoursWorked: 8,
      overtimeHours: 0,
      notes: ""
    }
  });

  // Add worker mutation
  const addWorkerMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/workers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
      workerForm.reset();
      setWorkerDialogOpen(false);
    },
    onError: (error: any) => {
      console.error('Worker creation failed:', error);
    }
  });

  // Delete worker mutation
  const deleteWorkerMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/workers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
    }
  });

  // Add attendance mutation
  const addAttendanceMutation = useMutation({
    mutationFn: (data: AttendanceFormValues) => apiRequest('POST', '/api/attendance', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/date'] });
      setAttendanceDialogOpen(false);
      attendanceForm.reset();
    }
  });

  // Update attendance mutation
  const updateAttendanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<AttendanceFormValues> }) => 
      apiRequest('PUT', `/api/attendance/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/date'] });
      setAttendanceDialogOpen(false);
      setEditingAttendance(null);
      attendanceForm.reset();
    }
  });

  // Delete attendance mutation
  const deleteAttendanceMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/attendance/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/date'] });
    }
  });

  const onSubmitWorker = (data: any) => {
    addWorkerMutation.mutate(data);
  };

  const onSubmitAttendance = (data: AttendanceFormValues) => {
    if (editingAttendance) {
      updateAttendanceMutation.mutate({ id: editingAttendance.id, data });
    } else {
      addAttendanceMutation.mutate(data);
    }
  };

  const handleDeleteWorker = (worker: Worker) => {
    if (window.confirm(`Are you sure you want to delete ${worker.name}? This action cannot be undone.`)) {
      deleteWorkerMutation.mutate(worker.id);
    }
  };

  const openAttendanceDialog = (worker?: Worker, attendance?: WorkerAttendance) => {
    if (attendance) {
      setEditingAttendance(attendance);
      attendanceForm.reset({
        workerId: attendance.workerId,
        attendanceDate: attendance.attendanceDate,
        status: attendance.status,
        checkInTime: attendance.checkInTime || "",
        checkOutTime: attendance.checkOutTime || "",
        hoursWorked: attendance.hoursWorked || 8,
        overtimeHours: attendance.overtimeHours || 0,
        notes: attendance.notes || ""
      });
    } else if (worker) {
      setEditingAttendance(null);
      attendanceForm.reset({
        workerId: worker.id,
        attendanceDate: format(selectedDate, 'yyyy-MM-dd'),
        status: "present",
        checkInTime: "",
        checkOutTime: "",
        hoursWorked: 8,
        overtimeHours: 0,
        notes: ""
      });
    }
    setAttendanceDialogOpen(true);
  };

  const getAttendanceForWorker = (workerId: number) => {
    return dailyAttendance.find(record => record.workerId === workerId);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'present': return 'default';
      case 'absent': return 'destructive';
      case 'late': return 'secondary';
      case 'half-day': return 'outline';
      default: return 'default';
    }
  };

  // Update attendance form date when selected date changes
  useEffect(() => {
    attendanceForm.setValue('attendanceDate', format(selectedDate, 'yyyy-MM-dd'));
  }, [selectedDate, attendanceForm]);

  // Generate PDF export for workers data
  const generateWorkersPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Workers Report - Al-Wasiloon Fertilizer Factory</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
            .report-title { font-size: 18px; margin: 10px 0; }
            .report-date { font-size: 14px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .worker-card { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .worker-name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
            .worker-details { font-size: 14px; color: #666; }
            .summary { margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Al-Wasiloon Fertilizer Factory</div>
            <div class="report-title">Workers Report</div>
            <div class="report-date">Generated on ${format(new Date(), 'MMMM dd, yyyy')}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Department</th>
                <th>Hire Date</th>
                <th>Monthly Salary</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              ${workers.map((worker: Worker) => `
                <tr>
                  <td>${worker.name}</td>
                  <td>${worker.position}</td>
                  <td>${worker.department}</td>
                  <td>${worker.hireDate}</td>
                  <td>${formatCurrency(worker.salary)}</td>
                  <td>${worker.phone}<br/>${worker.email}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Workers:</strong> ${workers.length}</p>
            <p><strong>Total Monthly Payroll:</strong> ${formatCurrency(workers.reduce((sum: number, w: Worker) => sum + w.salary, 0))}</p>
            <p><strong>Departments:</strong> ${[...new Set(workers.map((w: Worker) => w.department))].join(', ')}</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  // Generate monthly attendance data for display
  const generateMonthlyAttendanceData = () => {
    if (!attendanceWorkerFilter) return [];
    
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return daysInMonth.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const attendance = monthlyAttendance.find((att: WorkerAttendance) => 
        att.attendanceDate === dateStr
      );
      
      return {
        date: day,
        dateStr,
        attendance
      };
    });
  };

  return (
    <div className="space-y-6" dir={isRTL() ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Workers & Attendance</h1>
          <p className="text-muted-foreground">Manage workers and track daily attendance</p>
        </div>
        {activeTab === "workers" && (
          <Dialog open={workerDialogOpen} onOpenChange={setWorkerDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Worker
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Worker</DialogTitle>
                <DialogDescription>Add a new worker to your team</DialogDescription>
              </DialogHeader>
              <Form {...workerForm}>
                <form onSubmit={workerForm.handleSubmit(onSubmitWorker)} className="space-y-4">
                  <FormField
                    control={workerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={workerForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={workerForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Production">Production</SelectItem>
                              <SelectItem value="QualityControl">Quality Control</SelectItem>
                              <SelectItem value="Storage">Storage</SelectItem>
                              <SelectItem value="Maintenance">Maintenance</SelectItem>
                              <SelectItem value="Administration">Administration</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={workerForm.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Salary</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={workerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={workerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={workerForm.control}
                    name="hireDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hire Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={addWorkerMutation.isPending}>
                    {addWorkerMutation.isPending ? "Adding..." : "Add Worker"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="workers" className="text-xs md:text-sm">Workers List</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs md:text-sm">Daily Attendance</TabsTrigger>
          <TabsTrigger value="deductions" className="text-xs md:text-sm">Salary Deductions</TabsTrigger>
          <TabsTrigger value="summary" className="text-xs md:text-sm">Monthly Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workers" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Workers List</h3>
              <p className="text-sm text-muted-foreground">Manage your factory workers</p>
            </div>
            <Button onClick={generateWorkersPDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
          
          {workersLoading ? (
            <div className="text-center">Loading workers...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((worker: Worker) => (
                <Card key={worker.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{worker.name}</h3>
                        <p className="text-sm text-muted-foreground">{worker.position}</p>
                        <p className="text-sm text-muted-foreground">{worker.department}</p>
                        <p className="text-sm font-medium mt-2">
                          {formatCurrency(worker.salary)}/month
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Hired: {worker.hireDate}
                        </p>
                        <div className="text-xs text-muted-foreground mt-1">
                          <p>{worker.phone}</p>
                          <p>{worker.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteWorker(worker)}
                          disabled={deleteWorkerMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="daily">Daily View</TabsTrigger>
              <TabsTrigger value="monthly">Monthly View</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Daily Attendance - {format(selectedDate, 'MMMM dd, yyyy')}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(selectedDate, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardHeader>
                <CardContent>
                  {attendanceLoading ? (
                    <p>Loading...</p>
                  ) : (
                    <div className="space-y-4">
                      {workers.map((worker: Worker) => {
                        const attendance = getAttendanceForWorker(worker.id);
                        return (
                          <div key={worker.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4">
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium truncate">{worker.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">{worker.position} - {worker.department}</p>
                              </div>
                              {attendance && (
                                <Badge variant={getStatusBadgeVariant(attendance.status)} className="flex-shrink-0">
                                  {attendance.status}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {attendance ? (
                                <>
                                  <div className="text-sm text-muted-foreground">
                                    {attendance.checkInTime && (
                                      <span>In: {attendance.checkInTime}</span>
                                    )}
                                    {attendance.checkOutTime && (
                                      <span className="ml-2">Out: {attendance.checkOutTime}</span>
                                    )}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openAttendanceDialog(worker, attendance)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteAttendanceMutation.mutate(attendance.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openAttendanceDialog(worker)}
                                >
                                  Mark Attendance
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Monthly Attendance - {format(selectedMonth, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={attendanceWorkerFilter?.toString() || ""} onValueChange={(value) => {
                      setAttendanceWorkerFilter(value ? parseInt(value) : null);
                    }}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select a worker" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.map((worker: Worker) => (
                          <SelectItem key={worker.id} value={worker.id.toString()}>
                            {worker.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(selectedMonth, 'MMMM yyyy')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedMonth}
                          onSelect={(date) => date && setSelectedMonth(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardHeader>
                <CardContent>
                  {attendanceWorkerFilter ? (
                    monthlyAttendanceLoading ? (
                      <p>Loading monthly data...</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Day</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Check In</TableHead>
                              <TableHead>Check Out</TableHead>
                              <TableHead>Hours</TableHead>
                              <TableHead>Overtime</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {generateMonthlyAttendanceData().map(({ date, dateStr, attendance }) => (
                              <TableRow key={dateStr}>
                                <TableCell>{format(date, 'dd')}</TableCell>
                                <TableCell>{format(date, 'EEE')}</TableCell>
                                <TableCell>
                                  {attendance ? (
                                    <Badge variant={getStatusBadgeVariant(attendance.status)}>
                                      {attendance.status}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>{attendance?.checkInTime || '-'}</TableCell>
                                <TableCell>{attendance?.checkOutTime || '-'}</TableCell>
                                <TableCell>{attendance?.hoursWorked || '-'}</TableCell>
                                <TableCell>{attendance?.overtimeHours || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )
                  ) : (
                    <p className="text-center text-muted-foreground">Select a worker to view monthly attendance</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="deductions" className="space-y-6">
          <SalaryDeductions />
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Monthly Summary
              </CardTitle>
              <div className="flex items-center gap-4">
                <Select value={selectedWorker?.id.toString() || ""} onValueChange={(value) => {
                  const worker = workers.find((w: Worker) => w.id.toString() === value);
                  setSelectedWorker(worker || null);
                }}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((worker: Worker) => (
                      <SelectItem key={worker.id} value={worker.id.toString()}>
                        {worker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedWorker && monthlySummary ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">Days Worked</h3>
                        <p className="text-2xl font-bold text-green-600">{monthlySummary.totalDaysWorked}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">Days Absent</h3>
                        <p className="text-2xl font-bold text-red-600">{monthlySummary.totalAbsent}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">Late Days</h3>
                        <p className="text-2xl font-bold text-yellow-600">{monthlySummary.totalLate}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">Total Hours</h3>
                        <p className="text-2xl font-bold">{monthlySummary.totalHours}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">Overtime Hours</h3>
                        <p className="text-2xl font-bold text-blue-600">{monthlySummary.totalOvertimeHours}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">Salary Deductions</h3>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlySummary.salaryDeductions)}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2 lg:col-span-3">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">Net Salary</h3>
                        <p className="text-3xl font-bold text-green-600">
                          {formatCurrency(selectedWorker.salary - monthlySummary.salaryDeductions)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Base: {formatCurrency(selectedWorker.salary)} - Deductions: {formatCurrency(monthlySummary.salaryDeductions)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Select a worker to view monthly summary</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Attendance Dialog */}
      <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAttendance ? "Edit Attendance" : "Mark Attendance"}
            </DialogTitle>
            <DialogDescription>
              Record worker attendance for {format(selectedDate, 'MMMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          <Form {...attendanceForm}>
            <form onSubmit={attendanceForm.handleSubmit(onSubmitAttendance)} className="space-y-4">
              <FormField
                control={attendanceForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="half-day">Half Day</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={attendanceForm.control}
                  name="checkInTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check In Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={attendanceForm.control}
                  name="checkOutTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check Out Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={attendanceForm.control}
                  name="hoursWorked"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours Worked</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={attendanceForm.control}
                  name="overtimeHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overtime Hours</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={addAttendanceMutation.isPending || updateAttendanceMutation.isPending}>
                {editingAttendance 
                  ? (updateAttendanceMutation.isPending ? "Updating..." : "Update Attendance")
                  : (addAttendanceMutation.isPending ? "Adding..." : "Mark Attendance")
                }
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}