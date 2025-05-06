import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

const ThemeToggleContext = createContext();
const CurrencyContext = createContext();
const useThemeToggle = () => useContext(ThemeToggleContext);
const useCurrency = () => useContext(CurrencyContext);

const useExchangeRates = (baseCurrency) => {
  const [rates, setRates] = useState({});

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get(`https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/${baseCurrency}`);
        setRates(response.data.conversion_rates);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
    };
    fetchRates();
  }, [baseCurrency]);

  return rates;
};

function calculateAmortization(P, R, N) {
  const monthlyRate = R / 12 / 100;
  const emi = P * monthlyRate * Math.pow(1 + monthlyRate, N) / (Math.pow(1 + monthlyRate, N) - 1);
  let balance = P;
  const schedule = [];

  for (let month = 1; month <= N; month++) {
    const interest = balance * monthlyRate;
    const principal = emi - interest;
    balance -= principal;
    schedule.push({ month, principal: principal.toFixed(2), interest: interest.toFixed(2), balance: balance.toFixed(2) });
  }

  return { emi: emi.toFixed(2), schedule };
}

function LoanCalculator() {
  const [P, setP] = useState(0);
  const [R, setR] = useState(0);
  const [N, setN] = useState(0);
  const [result, setResult] = useState(null);
  const { currency } = useCurrency();
  const rates = useExchangeRates("USD");

  const handleCalculate = () => {
    const res = calculateAmortization(P, R, N);
    setResult(res);
  };

  const handleReset = () => {
    setP(0);
    setR(0);
    setN(0);
    setResult(null);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Loan EMI Calculator</Typography>
      <TextField label="Principal Amount" fullWidth margin="normal" value={P} onChange={e => setP(+e.target.value)} />
      <TextField label="Interest Rate (Annual %)" fullWidth margin="normal" value={R} onChange={e => setR(+e.target.value)} />
      <TextField label="Loan Duration (Months)" fullWidth margin="normal" value={N} onChange={e => setN(+e.target.value)} />
      <Stack direction="row" spacing={2} sx={{ my: 2 }}>
        <Button variant="contained" onClick={handleCalculate}>Calculate</Button>
        <Button variant="outlined" onClick={handleReset}>Reset</Button>
      </Stack>

      {result && (
        <Box>
          <Typography variant="h6">Monthly EMI: {result.emi} USD</Typography>
          
          
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell>Principal</TableCell>
                  <TableCell>Interest</TableCell>
                  <TableCell>Remaining Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.schedule.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell>{row.principal+" "+currency}</TableCell>
                    <TableCell>{row.interest+" "+currency}</TableCell>
                    <TableCell>{row.balance+" "+currency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
}

function Header() {
  const { darkMode, toggleTheme } = useThemeToggle();
  const { currency, setCurrency } = useCurrency();

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none' }}>Loan Calculator</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/exchange">Exchange Rate</Button>
          <Button color="inherit" component={Link} to="/about">About</Button>
          <Button color="inherit" component={Link} to="/error">Error Page</Button>
          <FormControl variant="standard" sx={{ minWidth: 100 }}>
            <InputLabel>Currency</InputLabel>
            <Select value={currency} onChange={e => setCurrency(e.target.value)}>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="INR">INR</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={toggleTheme} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function NotFound() {
  return <Typography variant="h4" sx={{ m: 3 }}>404 - Page Not Found</Typography>;
}

function ErrorPage() {
  return <Typography variant="h5" sx={{ m: 3 }}>An error occurred. Please try again later.</Typography>;
}

function AboutPage() {
 function AboutPage() {
  return (
    <Box sx={{ m: 3 }}>
      <Typography variant="h5" gutterBottom>
        This is a loan calculator application built with React and Material UI.
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        <strong>GitHub Repository:</strong>{' '}
        <a href="https://github.com/hemanthkr28/loan-calculator-app" target="_blank" rel="noopener noreferrer">
          View on GitHub
        </a>
      </Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>
        <strong>Live Demo:</strong>{' '}
        <a href="https://your-live-app-url.vercel.app" target="_blank" rel="noopener noreferrer">
          View Deployed App
        </a>
      </Typography>
    </Box>
  );
}

}

function ExchangeRatePage() {
  return <Typography variant="h5" sx={{ m: 3 }}>Exchange Rate page coming soon...</Typography>;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('USD');

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <ThemeToggleContext.Provider value={{ darkMode, toggleTheme }}>
      <CurrencyContext.Provider value={{ currency, setCurrency }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<LoanCalculator />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/exchange" element={<ExchangeRatePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </CurrencyContext.Provider>
    </ThemeToggleContext.Provider>
  );
}

export default App;



