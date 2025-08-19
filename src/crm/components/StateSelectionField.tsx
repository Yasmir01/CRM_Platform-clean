import * as React from "react";
import {
  Autocomplete,
  TextField,
  TextFieldProps,
  Chip,
  Box,
  Typography,
} from "@mui/material";

interface StateOption {
  code: string;
  name: string;
  label: string;
}

interface StateSelectionFieldProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  allowFreeText?: boolean;
}

// Complete list of US states and territories
const US_STATES: StateOption[] = [
  { code: 'AL', name: 'Alabama', label: 'Alabama (AL)' },
  { code: 'AK', name: 'Alaska', label: 'Alaska (AK)' },
  { code: 'AZ', name: 'Arizona', label: 'Arizona (AZ)' },
  { code: 'AR', name: 'Arkansas', label: 'Arkansas (AR)' },
  { code: 'CA', name: 'California', label: 'California (CA)' },
  { code: 'CO', name: 'Colorado', label: 'Colorado (CO)' },
  { code: 'CT', name: 'Connecticut', label: 'Connecticut (CT)' },
  { code: 'DE', name: 'Delaware', label: 'Delaware (DE)' },
  { code: 'FL', name: 'Florida', label: 'Florida (FL)' },
  { code: 'GA', name: 'Georgia', label: 'Georgia (GA)' },
  { code: 'HI', name: 'Hawaii', label: 'Hawaii (HI)' },
  { code: 'ID', name: 'Idaho', label: 'Idaho (ID)' },
  { code: 'IL', name: 'Illinois', label: 'Illinois (IL)' },
  { code: 'IN', name: 'Indiana', label: 'Indiana (IN)' },
  { code: 'IA', name: 'Iowa', label: 'Iowa (IA)' },
  { code: 'KS', name: 'Kansas', label: 'Kansas (KS)' },
  { code: 'KY', name: 'Kentucky', label: 'Kentucky (KY)' },
  { code: 'LA', name: 'Louisiana', label: 'Louisiana (LA)' },
  { code: 'ME', name: 'Maine', label: 'Maine (ME)' },
  { code: 'MD', name: 'Maryland', label: 'Maryland (MD)' },
  { code: 'MA', name: 'Massachusetts', label: 'Massachusetts (MA)' },
  { code: 'MI', name: 'Michigan', label: 'Michigan (MI)' },
  { code: 'MN', name: 'Minnesota', label: 'Minnesota (MN)' },
  { code: 'MS', name: 'Mississippi', label: 'Mississippi (MS)' },
  { code: 'MO', name: 'Missouri', label: 'Missouri (MO)' },
  { code: 'MT', name: 'Montana', label: 'Montana (MT)' },
  { code: 'NE', name: 'Nebraska', label: 'Nebraska (NE)' },
  { code: 'NV', name: 'Nevada', label: 'Nevada (NV)' },
  { code: 'NH', name: 'New Hampshire', label: 'New Hampshire (NH)' },
  { code: 'NJ', name: 'New Jersey', label: 'New Jersey (NJ)' },
  { code: 'NM', name: 'New Mexico', label: 'New Mexico (NM)' },
  { code: 'NY', name: 'New York', label: 'New York (NY)' },
  { code: 'NC', name: 'North Carolina', label: 'North Carolina (NC)' },
  { code: 'ND', name: 'North Dakota', label: 'North Dakota (ND)' },
  { code: 'OH', name: 'Ohio', label: 'Ohio (OH)' },
  { code: 'OK', name: 'Oklahoma', label: 'Oklahoma (OK)' },
  { code: 'OR', name: 'Oregon', label: 'Oregon (OR)' },
  { code: 'PA', name: 'Pennsylvania', label: 'Pennsylvania (PA)' },
  { code: 'RI', name: 'Rhode Island', label: 'Rhode Island (RI)' },
  { code: 'SC', name: 'South Carolina', label: 'South Carolina (SC)' },
  { code: 'SD', name: 'South Dakota', label: 'South Dakota (SD)' },
  { code: 'TN', name: 'Tennessee', label: 'Tennessee (TN)' },
  { code: 'TX', name: 'Texas', label: 'Texas (TX)' },
  { code: 'UT', name: 'Utah', label: 'Utah (UT)' },
  { code: 'VT', name: 'Vermont', label: 'Vermont (VT)' },
  { code: 'VA', name: 'Virginia', label: 'Virginia (VA)' },
  { code: 'WA', name: 'Washington', label: 'Washington (WA)' },
  { code: 'WV', name: 'West Virginia', label: 'West Virginia (WV)' },
  { code: 'WI', name: 'Wisconsin', label: 'Wisconsin (WI)' },
  { code: 'WY', name: 'Wyoming', label: 'Wyoming (WY)' },
  // US Territories
  { code: 'DC', name: 'District of Columbia', label: 'District of Columbia (DC)' },
  { code: 'AS', name: 'American Samoa', label: 'American Samoa (AS)' },
  { code: 'GU', name: 'Guam', label: 'Guam (GU)' },
  { code: 'MP', name: 'Northern Mariana Islands', label: 'Northern Mariana Islands (MP)' },
  { code: 'PR', name: 'Puerto Rico', label: 'Puerto Rico (PR)' },
  { code: 'VI', name: 'US Virgin Islands', label: 'US Virgin Islands (VI)' },
];

/**
 * State selection field with autocomplete functionality
 * Allows users to type and get suggestions, or select from dropdown
 */
export default function StateSelectionField({ 
  value, 
  onChange, 
  allowFreeText = true,
  error,
  helperText,
  required,
  ...props 
}: StateSelectionFieldProps) {
  const [inputValue, setInputValue] = React.useState('');

  React.useEffect(() => {
    // Find matching state and set input value
    const matchingState = US_STATES.find(
      state => 
        state.code === value || 
        state.name.toLowerCase() === value.toLowerCase()
    );
    
    if (matchingState) {
      setInputValue(matchingState.label);
    } else {
      setInputValue(value);
    }
  }, [value]);

  const handleChange = (event: any, newValue: StateOption | string | null) => {
    if (typeof newValue === 'string') {
      // Free text input
      onChange(newValue);
    } else if (newValue) {
      // Selected from dropdown
      onChange(newValue.name);
    } else {
      // Cleared
      onChange('');
    }
  };

  const handleInputChange = (event: any, newInputValue: string) => {
    setInputValue(newInputValue);
    
    // If allowFreeText and no exact match, use the input value
    if (allowFreeText) {
      const exactMatch = US_STATES.find(
        state => state.label.toLowerCase() === newInputValue.toLowerCase()
      );
      
      if (!exactMatch && newInputValue.length > 0) {
        onChange(newInputValue);
      }
    }
  };

  const getOptionLabel = (option: StateOption | string) => {
    if (typeof option === 'string') {
      return option;
    }
    return option.label;
  };

  const isOptionEqualToValue = (option: StateOption | string, value: StateOption | string) => {
    if (typeof option === 'string' && typeof value === 'string') {
      return option.toLowerCase() === value.toLowerCase();
    }
    if (typeof option === 'object' && typeof value === 'object') {
      return option.code === value.code;
    }
    if (typeof option === 'object' && typeof value === 'string') {
      return option.name.toLowerCase() === value.toLowerCase() || 
             option.code.toLowerCase() === value.toLowerCase();
    }
    return false;
  };

  const filterOptions = (options: StateOption[], { inputValue }: { inputValue: string }) => {
    if (!inputValue) return options;

    const filtered = options.filter((option) =>
      option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.code.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    // If allowFreeText and no exact match, add the input as an option
    if (allowFreeText && inputValue.length > 0) {
      const exactMatch = filtered.find(
        option => option.name.toLowerCase() === inputValue.toLowerCase()
      );
      
      if (!exactMatch) {
        return [
          ...filtered,
          // Add a custom option for free text
          { code: 'CUSTOM', name: inputValue, label: `"${inputValue}" (Custom)` }
        ];
      }
    }

    return filtered;
  };

  const renderOption = (props: any, option: StateOption) => (
    <Box component="li" {...props}>
      <Box>
        <Typography variant="body1">
          {option.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {option.code === 'CUSTOM' ? 'Custom entry' : option.code}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Autocomplete
      options={US_STATES}
      value={US_STATES.find(state => 
        state.name.toLowerCase() === value.toLowerCase() || 
        state.code.toLowerCase() === value.toLowerCase()
      ) || (allowFreeText ? value : null)}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      filterOptions={filterOptions}
      renderOption={renderOption}
      freeSolo={allowFreeText}
      autoHighlight
      autoSelect
      clearOnBlur={!allowFreeText}
      selectOnFocus
      handleHomeEndKeys
      renderInput={(params) => (
        <TextField
          {...params}
          {...props}
          error={error}
          helperText={helperText || (allowFreeText ? "Type to search or select from dropdown" : "Select a state from the dropdown")}
          required={required}
          placeholder="Type state name or select..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            variant="outlined"
            label={typeof option === 'string' ? option : option.name}
            {...getTagProps({ index })}
            key={index}
          />
        ))
      }
    />
  );
}

/**
 * Utility function to validate state
 */
export const isValidState = (state: string): boolean => {
  if (!state) return false;
  
  return US_STATES.some(s => 
    s.name.toLowerCase() === state.toLowerCase() || 
    s.code.toLowerCase() === state.toLowerCase()
  );
};

/**
 * Utility function to get state code from name
 */
export const getStateCode = (stateName: string): string => {
  const state = US_STATES.find(s => 
    s.name.toLowerCase() === stateName.toLowerCase()
  );
  return state?.code || stateName;
};

/**
 * Utility function to get state name from code
 */
export const getStateName = (stateCode: string): string => {
  const state = US_STATES.find(s => 
    s.code.toLowerCase() === stateCode.toLowerCase()
  );
  return state?.name || stateCode;
};
