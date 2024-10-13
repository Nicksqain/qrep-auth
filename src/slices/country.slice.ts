import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ICountryInfo } from '../api/services/countryServicesModel';
import { getCurrentCountryInfo } from '../api/services/countryServices';
import { checkCISCountry } from '../helpers/countries';

interface CountryState {
  countryInfo: ICountryInfo | null;
  loading: boolean;
  error: string | null;
  isCIS: boolean; // Custom field (СНГ ЛИ ЭТО)
}

const initialState: CountryState = {
  countryInfo: { country_calling_code: '+7' } as ICountryInfo,
  loading: false,
  error: null,
  isCIS: true, // Значение по умолчанию
};

export const fetchCountry = createAsyncThunk('country/fetchCountry', async () => {
  const response = await getCurrentCountryInfo();
  return response;
});

const countrySlice = createSlice({
  name: 'country',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountry.fulfilled, (state, action) => {
        state.loading = false;
        state.countryInfo = action.payload;
        state.isCIS = checkCISCountry(action.payload.country_code);
      })
      .addCase(fetchCountry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch country information';
      });
  },
});

export default countrySlice.reducer;