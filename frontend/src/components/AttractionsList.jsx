import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Alert,
  IconButton,
  Skeleton,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MuseumIcon from '@mui/icons-material/Museum';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PlaceIcon from '@mui/icons-material/Place';
import AddIcon from '@mui/icons-material/Add';
import { placesAPI, attractionsAPI } from '../api/client';

export default function AttractionsList({ city, tripId }) {
  const [attractions, setAttractions] = useState([]);
  const [filteredAttractions, setFilteredAttractions] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (city) {
      fetchAttractions();
    }
  }, [city]);

  useEffect(() => {
    let filtered = attractions;

    if (selectedType !== 'all') {
      filtered = filtered.filter((a) => a.type === selectedType);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAttractions(filtered);
  }, [selectedType, searchQuery, attractions]);

  const fetchAttractions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await placesAPI.getByCity(city);
      setAttractions(response.data.data.attractions || []);
      setFilteredAttractions(response.data.data.attractions || []);
    } catch (err) {
      console.error('Error fetching attractions:', err);
      setError('Failed to load attractions.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttraction = async (attraction) => {
    try {
      await attractionsAPI.add({
        trip_id: tripId,
        name: attraction.name,
        lat: attraction.lat,
        lon: attraction.lon,
        type: attraction.type,
      });
      alert('Attraction added to trip!');
    } catch (err) {
      console.error('Error adding attraction:', err);
      alert('Failed to add attraction');
    }
  };

  const getIcon = (type) => {
    const icons = {
      museum: <MuseumIcon />,
      restaurant: <RestaurantIcon />,
      cafe: <LocalCafeIcon />,
      historic: <AccountBalanceIcon />,
      tourism: <PlaceIcon />,
    };
    return icons[type] || <PlaceIcon />;
  };

  const formatLabel = (label) => {
    return label
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const types = ['all', ...new Set(attractions.map((a) => a.type))];

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          <Skeleton width="200px" />
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" width="80px" height="32px" />
          ))}
        </Box>
        <Box
          sx={{
            maxHeight: '500px',
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}
        >
          <List>
            {[1, 2, 3, 4, 5].map((i) => (
              <ListItem key={i}>
                <ListItemAvatar>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton width="60%" />}
                  secondary={<Skeleton width="40%" />}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="warning">{error}</Alert>;
  }

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: 'primary.main', fontWeight: 600, mb: 3 }}
      >
        📍 Attractions in {city}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: 1 }}>
          {types.map((type) => (
            <Chip
              key={type}
              label={type === 'all' ? 'All' : formatLabel(type)}
              onClick={() => setSelectedType(type)}
              color={selectedType === type ? 'primary' : 'default'}
              variant={selectedType === type ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
        <TextField
          size="small"
          placeholder="Search attractions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
      </Box>

      {filteredAttractions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No attractions found.
        </Typography>
      ) : (
        <Box
          sx={{
            maxHeight: '500px',
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}
        >
          <List>
            {filteredAttractions.slice(0, 20).map((attraction, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  tripId && (
                    <IconButton
                      edge="end"
                      onClick={() => handleAddAttraction(attraction)}
                      color="primary"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  )
                }
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    {getIcon(attraction.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {attraction.name}
                    </Typography>
                  }
                  secondary={`${formatLabel(attraction.type)}${attraction.address ? ` • ${attraction.address}` : ''}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
