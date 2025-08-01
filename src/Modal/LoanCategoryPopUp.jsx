import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';

const LoanCategoryPopUp = ({ onSelect }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const globalStyles = GlobalStyles(colors);

  // 4 static chip values
  const chipValues = ["Payroll", "Final Settlement", "Annual Leave", "Not to Deduct"];
  const [selected, setSelected] = useState(null);

  const handleChipPress = (value) => {
    setSelected(value);
    if (onSelect) {
      onSelect(value);
    }
  };

  return (
    <View style={styles.chipContainer}>
      {chipValues.map((value) => (
        <Chip
          key={value}
          selected={selected === value}
          mode={selected === value ? 'flat' : 'outlined'}
          onPress={() => handleChipPress(value)}
          style={[
            styles.chip,
            selected === value
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.background },
          ]}
          textStyle={[
            globalStyles.subtitle_3,
            { color: selected === value ? '#fff' : colors.text },
          ]}
        >
          {value}
        </Chip>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 5,
  },
  chip: {
    margin: 2,
  },
});

export default LoanCategoryPopUp;
