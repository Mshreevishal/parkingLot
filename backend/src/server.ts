import app from './app';

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`[ParkCommand] Server running on http://localhost:${port}`);
});
