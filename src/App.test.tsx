import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Badland Campers storefront', () => {
  render(<App />);
  expect(screen.getByText(/premium off-road camper trailers/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /build your badlands/i })).toBeInTheDocument();
  expect(screen.queryByText(/^jeepers$/i)).not.toBeInTheDocument();
});
