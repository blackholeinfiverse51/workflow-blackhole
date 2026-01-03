import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, CalendarIcon, X, DollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

const SalaryCalculation = ({ userId }) => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [userRates, setUserRates] = useState({}); // userId -> perHourRate
  const [holidayHours, setHolidayHours] = useState(0);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const { toast } = useToast();

  // Fetch all users with their hours when date range changes
  useEffect(() => {
    if (startDate && endDate && user?.role === 'Admin') {
      fetchAllUsersHours();
    }
  }, [startDate, endDate, user?.role]);

  // Calculate holiday hours when holidays change
  useEffect(() => {
    setHolidayHours(holidays.length * 8);
  }, [holidays]);

  // Calculate salary for each user when rates or hours change
  useEffect(() => {
    const updatedUsers = usersData.map(userData => {
      const perHourRate = parseFloat(userRates[userData.userId] || 0);
      const totalCumulativeHours = (userData.cumulativeHours || 0) + holidayHours;
      const calculatedSalary = perHourRate > 0 && totalCumulativeHours > 0 
        ? perHourRate * totalCumulativeHours 
        : 0;
      
      return {
        ...userData,
        perHourRate,
        totalCumulativeHours,
        calculatedSalary
      };
    });
    setUsersData(updatedUsers);
  }, [userRates, holidayHours]);

  const fetchAllUsersHours = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const response = await api.get('/new-salary/hours/all', {
        params: {
          fromDate: format(startDate, 'yyyy-MM-dd'),
          toDate: format(endDate, 'yyyy-MM-dd')
        }
      });

      if (response.success) {
        const users = response.data.users || [];
        setUsersData(users);
        
        // Initialize rates object with empty values
        const initialRates = {};
        users.forEach(u => {
          initialRates[u.userId] = userRates[u.userId] || '';
        });
        setUserRates(initialRates);
      }
    } catch (error) {
      console.error('Error fetching users hours:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users hours',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = (date) => {
    if (!date) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!holidays.includes(dateStr)) {
      setHolidays([...holidays, dateStr]);
    }
  };

  const handleRemoveHoliday = (dateStr) => {
    setHolidays(holidays.filter(h => h !== dateStr));
  };

  const handleRateChange = (userId, value) => {
    setUserRates(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const handleCalculateAllSalaries = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select date range',
        variant: 'destructive'
      });
      return;
    }

    // Validate that all users with hours have rates
    const usersWithHours = usersData.filter(u => u.cumulativeHours > 0);
    const usersWithoutRates = usersWithHours.filter(u => !userRates[u.userId] || parseFloat(userRates[u.userId]) <= 0);

    if (usersWithoutRates.length > 0) {
      toast({
        title: 'Validation Error',
        description: `Please enter per hour rate for: ${usersWithoutRates.map(u => u.name).join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    setCalculating(true);
    try {
      // Calculate salary for each user
      const calculations = usersWithHours.map(userData => {
        const perHourRate = parseFloat(userRates[userData.userId]);
        const totalCumulativeHours = (userData.cumulativeHours || 0) + holidayHours;
        const calculatedSalary = perHourRate * totalCumulativeHours;

        return {
          userId: userData.userId,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          holidays: holidays,
          perHourRate: perHourRate,
          workingHours: userData.cumulativeHours || 0,
          holidayHours: holidayHours,
          totalCumulativeHours: totalCumulativeHours,
          calculatedSalary: calculatedSalary
        };
      });

      // Save all calculations
      const savePromises = calculations.map(calc => 
        api.post('/new-salary/calculate', calc)
      );

      await Promise.all(savePromises);

      toast({
        title: 'Success',
        description: `Salary calculated and saved for ${calculations.length} employees`,
      });
      
      // Refresh data
      setTimeout(() => {
        fetchAllUsersHours();
      }, 1000);
    } catch (error) {
      console.error('Error calculating salaries:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to calculate salaries',
        variant: 'destructive'
      });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <Card className="neo-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Salary Calculation
        </CardTitle>
        <CardDescription>
          Calculate salary based on working hours, holidays, and hourly rate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Holiday Selection */}
        <div className="space-y-2">
          <Label>Holidays (Each = 8 hours)</Label>
          <div className="flex gap-2 flex-wrap">
            {holidays.map((holiday, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {format(new Date(holiday), 'dd MMM yyyy')}
                <button
                  onClick={() => handleRemoveHoliday(holiday)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Add Holiday
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  onSelect={handleAddHoliday}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-xs text-muted-foreground">
            Selected holidays: {holidays.length} ({holidays.length * 8} hours)
          </p>
        </div>

        {/* Holiday Hours Summary */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Holiday Hours (All Users):</span>
              <span className="font-semibold">{holidayHours} hrs</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Selected holidays: {holidays.length} (Each = 8 hours)
            </p>
          </CardContent>
        </Card>

        {/* Users Table with Per Hour Rate */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading users data...
          </div>
        ) : usersData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No users found for the selected date range</p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employees Salary Calculation</CardTitle>
              <CardDescription>
                Enter per hour rate for each employee to calculate their salary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[280px]">Employee Name & Per Hour Rate</TableHead>
                      <TableHead className="min-w-[150px]">Department</TableHead>
                      <TableHead className="text-right min-w-[120px]">Working Hours</TableHead>
                      <TableHead className="text-right min-w-[120px]">Holiday Hours</TableHead>
                      <TableHead className="text-right min-w-[120px]">Total Hours</TableHead>
                      <TableHead className="text-right min-w-[150px]">Calculated Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData.map((userData) => {
                      const totalHours = (userData.cumulativeHours || 0) + holidayHours;
                      const salary = userData.calculatedSalary || 0;
                      
                      return (
                        <TableRow key={userData.userId}>
                          <TableCell className="align-middle">
                            <div className="flex items-center gap-3">
                              <span className="font-medium min-w-[140px]">{userData.name}</span>
                              <div className="relative flex-1 max-w-[140px]">
                                <DollarSign className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="Rate"
                                  value={userRates[userData.userId] || ''}
                                  onChange={(e) => handleRateChange(userData.userId, e.target.value)}
                                  className="pl-7 h-9"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground align-middle">
                            {userData.department || '-'}
                          </TableCell>
                          <TableCell className="text-right align-middle">
                            {userData.cumulativeHours.toFixed(2)} hrs
                          </TableCell>
                          <TableCell className="text-right align-middle">
                            {holidayHours} hrs
                          </TableCell>
                          <TableCell className="text-right font-semibold align-middle">
                            {totalHours.toFixed(2)} hrs
                          </TableCell>
                          <TableCell className="text-right align-middle">
                            {salary > 0 ? (
                              <span className="font-bold text-primary">
                                ₹{salary.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calculate All Button */}
        {usersData.length > 0 && (
          <Button
            onClick={handleCalculateAllSalaries}
            disabled={calculating || !startDate || !endDate || usersData.filter(u => u.cumulativeHours > 0).length === 0}
            className="w-full"
            size="lg"
          >
            <Calculator className="h-4 w-4 mr-2" />
            {calculating ? 'Calculating & Saving...' : `Calculate & Save All Salaries (${usersData.filter(u => u.cumulativeHours > 0).length} employees)`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SalaryCalculation;

