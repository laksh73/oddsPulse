import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Chip } from "@mui/material";

function MarketCard({ market }) {
  const [odds, setOdds] = useState(null);

  useEffect(() => {
      const fetchOdds = async () => {
      fetch(`http://localhost:5000/api/markets/${market.marketHash}/odds`)
        .then((response) => response.json())
        .then((data) => {
          setOdds(data);
          console.log(`Fetched odds for market ${market.marketHash}:`, data);
        });
      };

      fetchOdds();

      const interval = setInterval(fetchOdds, 5000); // Fetch odds every 5 seconds

      return () => {
        clearInterval(interval); // Clean up the interval on component unmount
      };

  }, [market.marketHash]);

  return (
    <Card>
      <CardContent>
        <Typography variant="body2">
          {market.leagueLabel}
        </Typography>

        <Typography variant="h6" sx={{ mt: 1 }}>
          {market.outcomeOneName}
        </Typography>

        <Typography variant="h6">
          {market.outcomeTwoName}
        </Typography>

        <Chip
          label={market.status}
          size="small"
          sx={{ mt: 2 }}
        />

        {odds && (
          <>
            <Typography sx={{ mt: 2 }}>
                {market.outcomeOneName}:{" "}
                {odds.outcomeOne !== null ? `${odds.outcomeOne}%` : "No odds"}
            </Typography>

            <Typography>
                {market.outcomeTwoName}:{" "}
                {odds.outcomeTwo !== null ? `${odds.outcomeTwo}%` : "No odds"}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default MarketCard;