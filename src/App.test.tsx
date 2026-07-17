import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders the Badland Campers storefront', () => {
  render(<App />);
  expect(screen.getByText(/premium off-road camper trailers/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /build the buffalo/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /build the goat/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /build the buffalo/i }));
  expect(screen.getByText(/^build the buffalo$/i)).toBeInTheDocument();
  expect(screen.getByText(/welded and powder-coated 2-inch steel frame/i)).toBeInTheDocument();
  expect(screen.getAllByText('$10,000').length).toBeGreaterThan(0);
  expect(screen.getByText(/second cabin door/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /select all/i })).toBeInTheDocument();
  expect(screen.getByText(/rooftop tent options/i)).toBeInTheDocument();
  expect(screen.queryByText(/frame type/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/breaking hubs?/i)).not.toBeInTheDocument();
});
