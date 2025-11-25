import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';
import { supabase } from '../context/AuthContext';
import WeatherForecast from '../components/WeatherForecast';
import AttractionsList from '../components/AttractionsList';
import ItineraryCalendar from '../components/ItineraryCalendar';
import BudgetCalendar from '../components/BudgetCalendar';
import CurrencyDisplay from '../components/CurrencyDisplay';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function TripDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

      if (tripError) throw tripError;

      const { data: itineraryData } = await supabase
        .from('itinerary')
        .select('*')
        .eq('trip_id', id)
        .order('day_number', { ascending: true });

      const { data: attractionsData } = await supabase
        .from('attractions')
        .select('*')
        .eq('trip_id', id);

      setTrip({
        ...tripData,
        itinerary: itineraryData || [],
        attractions: attractionsData || [],
      });
    } catch (err) {
      console.error('Error fetching trip:', err);
      setError('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const refreshItinerary = async () => {
    try {
      const { data: itineraryData } = await supabase
        .from('itinerary')
        .select('*')
        .eq('trip_id', id)
        .order('day_number', { ascending: true });

      setTrip((prevTrip) => ({
        ...prevTrip,
        itinerary: itineraryData || [],
      }));
    } catch (err) {
      console.error('Error refreshing itinerary:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !trip) {
    return (
      <Box>
        <Alert severity="error">{error || 'Trip not found'}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Back to Trips
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {trip.city}, {trip.country}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            label={`${format(new Date(trip.start_date), 'MMM dd')} - ${format(
              new Date(trip.end_date),
              'MMM dd, yyyy'
            )}`}
            color="primary"
            sx={{ color: 'white' }}
          />
          {trip.budget_total && (
            <Chip
              label={
                <>
                  Budget: <CurrencyDisplay amount={trip.budget_total} />
                </>
              }
              color="secondary"
              sx={{ color: 'white' }}
            />
          )}
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="Itinerary" />
          <Tab label="Budget" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 4 }}>
          <WeatherForecast city={trip.city} />
        </Box>
        <Box>
          <AttractionsList city={trip.city} tripId={trip.id} />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ItineraryCalendar
          trip={trip}
          itinerary={trip.itinerary || []}
          onUpdate={refreshItinerary}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <BudgetCalendar trip={trip} />
      </TabPanel>
    </Box>
  );
}
