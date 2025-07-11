import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Edit, Trash2, DollarSign, Filter } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSalaryDeductionSchema } from "@shared/schema";
import type { Worker, SalaryDeduction } from "@shared/schema";

const deductionFormSchema = insertSalaryDeductionSchema.extend({
  deductionDate: z.date({
    required_error: "Deduction date is required.",
  }),
});

type DeductionFormValues = z.infer<typeof deductionFormSchema>;

export default function SalaryDeductions() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<SalaryDeduction | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch workers
  const { data: workers = [] } = useQuery({
    queryKey: ['/api/workers'],
  });

  // Fetch salary deductions
  const { data: deductions = [], isLoading: deductionsLoading } = useQuery({
    queryKey: ['/api/salary-deductions', selectedMonth, selectedWorkerId],
    queryFn: async () => {
      let url = '/api/salary-deductions';
      if (selectedWorkerId) {
        url = `/api/salary-deductions/worker/${selectedWorkerId}`;
      } else if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        url = `/api/salary-deductions/month/${selectedMonth}/${year}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch salary deductions');
      return response.json() as Promise<SalaryDeduction[]>;
    }
  });

  // Form handling
  const form = useForm<DeductionFormValues>({
    resolver: zodResolver(deductionFormSchema),
    defaultValues: {
      workerId: 0,
      amount: 0,
      reason: "",
      deductionDate: new Date(),
      month: format(new Date(), 'yyyy-MM'),
      year: new Date().getFullYear(),
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: DeductionFormValues) => {
      const formattedData = {
        ...data,
        deductionDate: format(data.deductionDate, 'yyyy-MM-dd'),
      };
      return apiRequest('/api/salary-deductions', {
        method: 'POST',
        body: JSON.stringify(formattedData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/salary-deductions'] });
      toast({
        title: "Success",
        description: "Salary deduction added successfully",
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add salary deduction",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: DeductionFormValues) => {
      if (!editingDeduction) throw new Error('No deduction to edit');
      const formattedData = {
        ...data,
        deductionDate: format(data.deductionDate, 'yyyy-MM-dd'),
      };
      return apiRequest(`/api/salary-deductions/${editingDeduction.id}`, {
        method: 'PUT',
        body: JSON.stringify(formattedData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/salary-deductions'] });
      toast({
        title: "Success",
        description: "Salary deduction updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingDeduction(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update salary deduction",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/salary-deductions/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/salary-deductions'] });
      toast({
        title: "Success",
        description: "Salary deduction deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete salary deduction",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DeductionFormValues) => {
    if (editingDeduction) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (deduction: SalaryDeduction) => {
    setEditingDeduction(deduction);
    form.reset({
      workerId: deduction.workerId,
      amount: deduction.amount,
      reason: deduction.reason,
      deductionDate: new Date(deduction.deductionDate),
      month: deduction.month,
      year: deduction.year,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const getWorkerName = (workerId: number) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown Worker';
  };

  // Group deductions by month for better organization
  const groupedDeductions = deductions.reduce((acc, deduction) => {
    const monthKey = deduction.month;
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(deduction);
    return acc;
  }, {} as Record<string, SalaryDeduction[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <DollarSign className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-2xl font-bold">Salary Deductions</h1>
            <p className="text-muted-foreground">Manage worker salary deductions by month</p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Deduction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Salary Deduction</DialogTitle>
              <DialogDescription>
                Record a new salary deduction for a worker.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="workerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Worker</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select worker" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workers.map((worker) => (
                            <SelectItem key={worker.id} value={worker.id.toString()}>
                              {worker.name} - {worker.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deduction Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter amount"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter reason for deduction"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deductionDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Deduction Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Adding..." : "Add Deduction"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="month-filter">Month</Label>
              <Input
                id="month-filter"
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setSelectedWorkerId(null); // Clear worker filter when month changes
                }}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="worker-filter">Worker</Label>
              <Select 
                value={selectedWorkerId?.toString() || "all"} 
                onValueChange={(value) => {
                  setSelectedWorkerId(value === "all" ? null : parseInt(value));
                  setSelectedMonth(""); // Clear month filter when worker changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All workers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workers</SelectItem>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id.toString()}>
                      {worker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deductions List */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Deductions</CardTitle>
        </CardHeader>
        <CardContent>
          {deductionsLoading ? (
            <div className="text-center py-4">Loading deductions...</div>
          ) : deductions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No salary deductions found for the selected criteria.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedDeductions).map(([month, monthDeductions]) => (
                <div key={month}>
                  <h3 className="text-lg font-semibold mb-3">
                    {format(new Date(month + '-01'), 'MMMM yyyy')}
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Worker</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthDeductions.map((deduction) => (
                        <TableRow key={deduction.id}>
                          <TableCell className="font-medium">
                            {getWorkerName(deduction.workerId)}
                          </TableCell>
                          <TableCell className="text-red-600 font-semibold">
                            -{formatCurrency(deduction.amount)}
                          </TableCell>
                          <TableCell>{deduction.reason}</TableCell>
                          <TableCell>
                            {format(new Date(deduction.deductionDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(deduction)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete this salary deduction. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(deduction.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Month Total */}
                  <div className="mt-2 p-3 bg-red-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Total Deductions for {format(new Date(month + '-01'), 'MMMM yyyy')}:
                      </span>
                      <span className="text-red-600 font-bold text-lg">
                        -{formatCurrency(monthDeductions.reduce((sum, d) => sum + d.amount, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Salary Deduction</DialogTitle>
            <DialogDescription>
              Modify the salary deduction details.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="workerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Worker</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select worker" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workers.map((worker) => (
                          <SelectItem key={worker.id} value={worker.id.toString()}>
                            {worker.name} - {worker.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deduction Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter amount"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter reason for deduction"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deductionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Deduction Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingDeduction(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Deduction"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}