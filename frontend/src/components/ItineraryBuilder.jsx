import { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { format, addDays, differenceInDays } from 'date-fns';
import { itineraryAPI } from '../api/client';

export default function ItineraryBuilder({ trip, itinerary, onUpdate }) {
  const [activeStep, setActiveStep] = useState(0);
  const [newActivity, setNewActivity] = useState({});

  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const tripDays = differenceInDays(endDate, startDate) + 1;

  const days = Array.from({ length: tripDays }, (_, i) => ({
    dayNumber: i + 1,
    date: format(addDays(startDate, i), 'yyyy-MM-dd'),
    displayDate: format(addDays(startDate, i), 'EEE, MMM dd'),
  }));

  const getItineraryForDay = (dayNumber) => {
    return itinerary.find((day) => day.day_number === dayNumber);
  };

  const handleAddActivity = async (dayNumber, date) => {
    const activityText = newActivity[dayNumber] || '';
    if (!activityText.trim()) return;

    try {
      const existingDay = getItineraryForDay(dayNumber);

      if (existingDay) {
        const updatedActivities = [...existingDay.activities, activityText];
        await itineraryAPI.updateDay(existingDay.id, { activities: updatedActivities });
      } else {
        await itineraryAPI.addDay({
          trip_id: trip.id,
          day_number: dayNumber,
          date,
          activities: [activityText],
          budget_day: null,
        });
      }

      setNewActivity({ ...newActivity, [dayNumber]: '' });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error adding activity:', err);
      alert('Failed to add activity');
    }
  };

  const handleDeleteActivity = async (dayNumber, activityIndex) => {
    try {
      const existingDay = getItineraryForDay(dayNumber);
      if (!existingDay) return;

      const updatedActivities = existingDay.activities.filter((_, i) => i !== activityIndex);
      await itineraryAPI.updateDay(existingDay.id, { activities: updatedActivities });

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error deleting activity:', err);
      alert('Failed to delete activity');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Trip Itinerary
      </Typography>

      <Box
        sx={{
          maxHeight: '600px',
          overflowY: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          bgcolor: 'background.paper'
        }}
      >
        <Stepper activeStep={activeStep} orientation="vertical">
          {days.map((day) => {
            const dayItinerary = getItineraryForDay(day.dayNumber);

            return (
              <Step key={day.dayNumber} expanded>
                <StepLabel
                  optional={
                    <Typography variant="caption">{day.displayDate}</Typography>
                  }
                >
                  Day {day.dayNumber}
                </StepLabel>
                <StepContent>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      {dayItinerary && dayItinerary.activities.length > 0 ? (
                        <List dense>
                          {dayItinerary.activities.map((activity, index) => (
                            <ListItem
                              key={index}
                              secondaryAction={
                                <IconButton
                                  edge="end"
                                  onClick={() =>
                                    handleDeleteActivity(day.dayNumber, index)
                                  }
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
                        <Typography variant="body2" color="text.secondary">
                          No activities planned yet
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Add activity..."
                          value={newActivity[day.dayNumber] || ''}
                          onChange={(e) => setNewActivity({ ...newActivity, [day.dayNumber]: e.target.value })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddActivity(day.dayNumber, day.date);
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddActivity(day.dayNumber, day.date)}
                        >
                          Add
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    </Box>
  );
}
