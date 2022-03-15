import React, { Component } from 'react';
import './App.css';

// Constants in lieu of environment
const REST_API_PATH_HOST = 'http://localhost:9091';
const REST_API_PATH_PRIMES = '/primes';
const REST_API_PATH_PRIMES_LIMIT_PARAM = 'generationLimit';

// Other symbolic constants
const OK_MESSAGE_CSS = 'App-PrimesBox-OK-Headline';
const ERROR_MESSAGE_CSS = 'App-PrimesBox-Error-Headline';

/**
 * Simple, React-based UI for prime number generation example (Sieve of Erathosthenses).
 */
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // input entered by user that specifies maximum prime number to generate.
      generationLimit: '',
      // CSS class for message about success or failure of primes generation.
      messageCSS: OK_MESSAGE_CSS,
      // message about success or failure of primes generation, can be returned from primes service
      message: 'no primes generated yet!',
      // generated primes numbers, returned from primes service
      generatedPrimes: []
    };

    this.setGenerationLimit = this.setGenerationLimit.bind(this);
    this.generatePrimesIfValid = this.generatePrimesIfValid.bind(this);
  }

  render() {
    const primesTableCells = this.state.generatedPrimes.map((prime, idx) =>
      <p data-testid={`prime-nbr-${prime}`} key={prime}>{prime + (this.state.generatedPrimes.length === (idx+1) ? '' : ',')}</p>
    );
    const primesTableEmpty = <span className="App-VSpacer" data-testid="primesEmpty" />;

    return (
      <div className="App">

        <header className="App-header">
          <p>Prime Number Generation Example UI</p>
        </header>

        <form onSubmit={this.generatePrimesIfValid}>
          <fieldset className="App-LimitEntry">
            <legend>Generate Primes</legend>
            <label htmlFor="limit">From Zero To:</label>
            <span className="App-HSpacer" />
            <input name="limit" type="text" data-testid="limitInput" value={this.state.generationLimit} onChange={this.setGenerationLimit} />
            <span className="App-HSpacer" />
            <button type="submit">Go!</button>
          </fieldset>

        </form>

        <fieldset className="App-PrimesBox">
          <legend className={this.state.messageCSS}>{this.state.message}</legend>
          <div className="App-PrimesWrap">
            { this.state.generatedPrimes.length === 0 ? primesTableEmpty: primesTableCells }
          </div>
        </fieldset>

      </div>
    );
  }

  setGenerationLimit(event) {
    this.setState({ generationLimit: event.target.value });
    console.log('setGenerationLimit=' + this.state.generationLimit);
  }

  generatePrimesIfValid(event) {
    console.log('generatePrimesIfValid=' + this.state.generationLimit);
    event.preventDefault();

    // Basic client-side validation of generation limit entered by user; don't
    // call primes service if invalid.

    if (!this.validateGenerationLimit(this.state.generationLimit)) {
      this.setState({
        messageCSS: ERROR_MESSAGE_CSS,
        message: 'Entered generationLimit is not a valid integer',
        generatedPrimes: []
      });
      return;
    }

    // URL to primes service; no special HTTP headers in this example.

    let url = `${REST_API_PATH_HOST}${REST_API_PATH_PRIMES}?${REST_API_PATH_PRIMES_LIMIT_PARAM}=${this.state.generationLimit}`;
    console.log('generatePrimesIfValid(URL)=' + url);

    // Invokes the primes service synchronously in this example for expediency.

    fetch(url).then(response => {
      let httpStatus = response.status;
      this.setState({
        // change CSS of message to highlight errors detected by API.
        messageCSS: httpStatus === 200 ? OK_MESSAGE_CSS : ERROR_MESSAGE_CSS
      });
      return response.json();
    }).then(result => this.setState({
      // Set message and primes array from the response if API successfully invoked;
      // API may still have detected an error and returned HTTP status other than OK.
      message: result.message,
      generatedPrimes: result.generatedPrimes
    })).catch(error => this.setState({
      // If not API successfully invoked, clear primes array and set message to fetch error.
      messageCSS: ERROR_MESSAGE_CSS,
      message: `Primes service not available: ${error}`,
      generatedPrimes: []
    }));

    console.log('generatePrimesIfValid SUCCESS!');
  }

  /** Validate the primes generation limit as being an non-blank integer. */
  validateGenerationLimit(limit) {
    let isValid = false;
    if (limit && (typeof limit === 'string')) {
      const numFromStr = Number(limit);
      isValid = Number.isInteger(numFromStr);
    }
    return isValid;
  }
}

export default App;
