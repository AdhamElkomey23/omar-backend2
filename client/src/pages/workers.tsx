import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Users, Clock, DollarSign, Plus, Edit, Trash2, UserCheck } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { t, isRTL } from "@/lib/i18n";
import { insertWorkerSchema, insertWorkerAttendanceSchema } from "@shared/schema";
import type { Worker, WorkerAttendance } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

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
      role: "",
      department: "",
      salary: 0,
      hireDate: format(new Date(), 'yyyy-MM-dd'),
      email: "",
      phone: "",
      status: "active"
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
      // Handle error appropriately - could show toast notification
    }
  });

  // Add attendance mutation
  const addAttendanceMutation = useMutation({
    mutationFn: (data: AttendanceFormValues) => apiRequest('POST', '/api/attendance', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/date'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/summary'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/summary'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/summary'] });
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

  return (
    <div className="space-y-6" dir={isRTL() ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Workers & Attendance</h1>
          <p className="text-muted-foreground">Manage workers and track daily attendance</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog>
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={workerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Role</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={workerForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={workerForm.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Salary (EGP)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={workerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={workerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={addWorkerMutation.isPending}>
                    {addWorkerMutation.isPending ? "Adding..." : "Add Worker"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="attendance">Daily Attendance</TabsTrigger>
          <TabsTrigger value="workers">Workers List</TabsTrigger>
          <TabsTrigger value="summary">Monthly Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                {t('dailyAttendance')} - {format(selectedDate, 'MMMM dd, yyyy')}
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
                <p>{t('loading')}</p>
              ) : (
                <div className="space-y-4">
                  {workers.map((worker: Worker) => {
                    const attendance = getAttendanceForWorker(worker.id);
                    return (
                      <div key={worker.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-medium">{worker.name}</h3>
                            <p className="text-sm text-muted-foreground">{worker.role} - {worker.department}</p>
                          </div>
                          {attendance && (
                            <Badge variant={getStatusBadgeVariant(attendance.status)}>
                              {attendance.status}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
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

        <TabsContent value="workers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Workers List
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workersLoading ? (
                <p>Loading workers...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((worker: Worker) => (
                      <TableRow key={worker.id}>
                        <TableCell className="font-medium">{worker.name}</TableCell>
                        <TableCell>{worker.role}</TableCell>
                        <TableCell>{worker.department}</TableCell>
                        <TableCell>{formatCurrency(worker.salary)}</TableCell>
                        <TableCell>
                          <Badge variant={worker.status === 'active' ? 'default' : 'secondary'}>
                            {worker.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedWorker(worker)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
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
                      <FormLabel>{t('checkInTime')}</FormLabel>
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
                      <FormLabel>{t('checkOutTime')}</FormLabel>
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
                      <FormLabel>{t('hoursWorked')}</FormLabel>
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
                      <FormLabel>{t('overtimeHours')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={attendanceForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={addAttendanceMutation.isPending || updateAttendanceMutation.isPending}
              >
                {editingAttendance ? t('updateAttendance') : t('markAttendance')}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}