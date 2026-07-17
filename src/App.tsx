import React from 'react';
import JeepersCampers from './components/JeepersCampers';
import { DepositTermsPage } from './components/DepositTermsPage';
import './App.css';

function App() {
  if (new URLSearchParams(window.location.search).get('legal') === 'deposit-terms') {
    return <DepositTermsPage />;
  }

  return (
    <div className="App">
      <JeepersCampers />
    </div>
  );
}

export default App;
