
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDs6IFCEdFNqQAqF5O4eD_eYaZ5-Sfnfs0';
const getCoordinatesFromAddress = async (address: string) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const { results } = response.data;
      if (results.length > 0) {
        const { lat, lng } = results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      } else {
        console.error('No results found for address:', address);
        return null;
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return null;
    }
  };
  
  export default getCoordinatesFromAddress;