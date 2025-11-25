import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { format, addDays, differenceInDays, isSameDay, isWithinInterval, startOfDay } from 'date-fns';
import { supabase, useAuth } from '../context/AuthContext';

export default function ItineraryCalendar({ trip, itinerary, onUpdate }) {
  const { user } = useAuth();

  const startDate = useMemo(() => startOfDay(new Date(trip.start_date)), [trip.start_date]);
  const endDate = useMemo(() => startOfDay(new Date(trip.end_date)), [trip.end_date]);

  const [selectedDate, setSelectedDate] = useState(startDate);
  const [newActivity, setNewActivity] = useState('');
  const [currentMonth, setCurrentMonth] = useState(startDate);

  const tripDays = differenceInDays(endDate, startDate) + 1;

  const days = Array.from({ length: tripDays }, (_, i) => ({
    dayNumber: i + 1,
    date: format(addDays(startDate, i), 'yyyy-MM-dd'),
    dateObj: addDays(startDate, i),
  }));

  const getItineraryForDate = (date) => {
    const dayNumber = differenceInDays(date, startDate) + 1;
    return itinerary.find((day) => day.day_number === dayNumber);
  };

  const handleAddActivity = async () => {
    if (!newActivity.trim()) return;

    try {
      const dayNumber = differenceInDays(selectedDate, startDate) + 1;
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const existingDay = getItineraryForDate(selectedDate);

      if (existingDay) {
        const updatedActivities = [...existingDay.activities, newActivity];
        const { error } = await supabase
          .from('itinerary')
          .update({ activities: updatedActivities })
          .eq('id', existingDay.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('itinerary')
          .insert([{
            trip_id: trip.id,
            user_id: user.id,
            day_number: dayNumber,
            date: dateStr,
            activities: [newActivity],
            budget_day: null,
          }]);

        if (error) throw error;
      }

      setNewActivity('');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error adding activity:', err);
      alert('Failed to add activity');
    }
  };

  const handleDeleteActivity = async (activityIndex) => {
    try {
      const existingDay = getItineraryForDate(selectedDate);
      if (!existingDay) return;

      const updatedActivities = existingDay.activities.filter((_, i) => i !== activityIndex);

      const { error } = await supabase
        .from('itinerary')
        .update({ activities: updatedActivities })
        .eq('id', existingDay.id);

      if (error) throw error;

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error deleting activity:', err);
      alert('Failed to delete activity');
    }
  };

  const isDayInTrip = (date) => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return false;
      }
      const normalizedDate = startOfDay(date);
      return isWithinInterval(normalizedDate, { start: startDate, end: endDate });
    } catch (error) {
      console.error('Error in isDayInTrip:', error);
      return false;
    }
  };

  const shouldDisableDate = (date) => {
    return !isDayInTrip(date);
  };

  const selectedDayItinerary = getItineraryForDate(selectedDate);
  const selectedDayNumber = differenceInDays(selectedDate, startDate) + 1;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Trip Itinerary
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper elevation={2} sx={{ p: 2, display: 'inline-block' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateCalendar
                value={selectedDate}
                onChange={(newDate) => {
                  if (isDayInTrip(newDate)) {
                    setSelectedDate(newDate);
                  }
                }}
                onMonthChange={(newMonth) => setCurrentMonth(newMonth)}
                shouldDisableDate={shouldDisableDate}
                showDaysOutsideCurrentMonth={false}
                minDate={startDate}
                maxDate={endDate}
                sx={{
                  '& .MuiPickersDay-root:not(.Mui-disabled):not(.Mui-selected)': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    },
                  },
                  '& .MuiPickersDay-root.Mui-selected': {
                    backgroundColor: 'primary.main',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Paper>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Day {selectedDayNumber} - {format(selectedDate, 'EEE, MMM dd, yyyy')}
              </Typography>

              {selectedDayItinerary && selectedDayItinerary.activities.length > 0 ? (
                <List dense>
                  {selectedDayItinerary.activities.map((activity, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteActivity(index)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={activity} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No activities planned yet
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Add activity..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddActivity();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddActivity}
                >
                  Add
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
