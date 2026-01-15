const https = require('https');

/**
 * Reverse geocode coordinates to get detailed address
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * 
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Address details including full address, components, etc.
 */
async function reverseGeocode(latitude, longitude) {
  return new Promise((resolve, reject) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    
    const options = {
      headers: {
        'User-Agent': 'Infiverse Attendance System'
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const address = result.address || {};
          
          // Build formatted address
          const addressParts = [
            address.house_number,
            address.road,
            address.suburb || address.neighbourhood,
            address.city || address.town || address.village,
            address.state,
            address.postcode,
            address.country
          ].filter(Boolean);
          
          const formattedAddress = addressParts.length > 0 
            ? addressParts.join(', ')
            : result.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          resolve({
            fullAddress: formattedAddress,
            displayName: result.display_name || formattedAddress,
            pincode: address.postcode || address.pincode || null,
            area: address.suburb || address.neighbourhood || address.locality || address.city_district || null,
            city: address.city || address.town || address.village || address.county || null,
            state: address.state || null,
            country: address.country || null,
            road: address.road || address.street || null,
            houseNumber: address.house_number || null,
            raw: result
          });
        } catch (error) {
          // Fallback to bigdatacloud API
          fallbackReverseGeocode(latitude, longitude)
            .then(resolve)
            .catch(reject);
        }
      });
    }).on('error', (error) => {
      // Fallback to bigdatacloud API
      fallbackReverseGeocode(latitude, longitude)
        .then(resolve)
        .catch(reject);
    });
  });
}

/**
 * Fallback reverse geocoding using BigDataCloud API
 * 
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Address details
 */
async function fallbackReverseGeocode(latitude, longitude) {
  return new Promise((resolve, reject) => {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          const formattedAddress = result.display_name || 
            `${result.locality || ''}, ${result.countryName || ''}`.trim() ||
            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          resolve({
            fullAddress: formattedAddress,
            displayName: result.display_name || formattedAddress,
            pincode: result.postcode || null,
            area: result.locality || result.city || null,
            city: result.city || result.locality || null,
            state: result.principalSubdivision || null,
            country: result.countryName || null,
            road: null,
            houseNumber: null,
            raw: result
          });
        } catch (error) {
          // Last resort: return coordinates
          resolve({
            fullAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            displayName: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            pincode: null,
            area: null,
            city: null,
            state: null,
            country: null,
            road: null,
            houseNumber: null,
            raw: null
          });
        }
      });
    }).on('error', (error) => {
      // Last resort: return coordinates
      resolve({
        fullAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        displayName: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        pincode: null,
        area: null,
        city: null,
        state: null,
        country: null,
        road: null,
        houseNumber: null,
        raw: null
      });
    });
  });
}

module.exports = {
  reverseGeocode,
  fallbackReverseGeocode
};

