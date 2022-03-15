import React from 'react';
import { render, screen, fireEvent, wait, waitFor } from '@testing-library/react';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom';
import App from './App';

beforeEach(() => {
  fetch.resetMocks();
});

/** Sanity check of initial rendering of app before any input entered. */
test('renders no-primes-generated-yet legend', () => {
  render(<App />);
  const legendElement = screen.getByText(/no primes generated yet/i);
  expect(legendElement).toBeInTheDocument();
});

/** Snap shot of initial rendering of app before any input entered. */
it('renders snapshot correctly when no-primes-generated-yet', () => {
  const tree = renderer.create(<App />).toJSON();
  expect(tree).toMatchSnapshot();
});

/** Mock successful call to primes service and verify generated prime number content. */
it('renders correctly when valid prime generation limit is provided (10)', async() => {
  fetch.mockResponseOnce(
    JSON.stringify({ message: "primes generated!", generatedPrimes: [2,3,5,7] }),
    { status: 200 });
  const { getByText, getByLabelText,getByPlaceholderText, getByTestId, container } = render(<App />);
  const input = getByTestId('limitInput');
  fireEvent.change(input, {target: {value: '10'}});
  fireEvent.click(getByText('Go!'));
  const elemWithPrime = await waitFor(() => getByTestId('prime-nbr-7'));
  expect(getByTestId('prime-nbr-7')).toHaveTextContent('7');
  expect(fetch).toHaveBeenCalledTimes(1);
});

/** Mock call to primes service returning error and verify no prime number content was generated. */
it('renders no primes when prime generation limit is invalid (zero)', async() => {
  fetch.mockResponseOnce(
    JSON.stringify({ message: "generationLimit cannot be zero or less than zero", generatedPrimes: [] }),
    { status: 422 });
  const { getByText, getByLabelText,getByPlaceholderText, getByTestId, container } = render(<App />);
  const input = getByTestId('limitInput');
  fireEvent.change(input, {target: {value: '0'}});
  fireEvent.click(getByText('Go!'));
  const elemEmpty = await waitFor(() => getByTestId('primesEmpty'));
  expect(getByTestId('primesEmpty')).toHaveTextContent('');
  expect(fetch).toHaveBeenCalledTimes(1);
})

/** Verify no prime number content was generated when client detectes entry of invalid limit. */
it('renders no primes when prime generation limit is invalid (non-numeric)', async() => {
  const { getByText, getByLabelText,getByPlaceholderText, getByTestId, container } = render(<App />);
  const input = getByTestId('limitInput');
  fireEvent.change(input, {target: {value: 'abc'}});
  fireEvent.click(getByText('Go!'));
  expect(getByTestId('primesEmpty')).toHaveTextContent('');
})


