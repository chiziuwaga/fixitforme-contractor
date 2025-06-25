import { createTheme, MantineColorsTuple } from '@mantine/core';
import { BRAND } from './lib/brand';

// Custom color tuples for Mantine theme
const brandPrimary: MantineColorsTuple = [
  '#FADDE7', // light
  '#F6B8D0',
  '#F293B8',
  '#EE6E9F',
  '#EA4987',
  '#DA427A', // primary
  '#C43B6E',
  '#AE3462',
  '#982D56',
  '#82264A'  // dark
];

const brandSecondary: MantineColorsTuple = [
  '#E8F5E8', // light
  '#D1EAD1',
  '#B9DFB9',
  '#A2D4A2',
  '#8BC98B',
  '#74BE74',
  '#5DA35D',
  '#468846',
  '#2F6D2F',
  '#1A521A'  // dark
];

export const theme = createTheme({
  fontFamily: BRAND.typography.fontFamily.sans.join(','),
  
  colors: {
    'brand-primary': brandPrimary,
    'brand-secondary': brandSecondary,
  },

  primaryColor: 'brand-primary',
  
  headings: {
    fontFamily: BRAND.typography.fontFamily.sans.join(','),
    fontWeight: '700',
  },

  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
        withBorder: true,
      },
    },
  },
});
