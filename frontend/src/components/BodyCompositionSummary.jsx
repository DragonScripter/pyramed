
import { Box, Card, CardContent, Typography } from '@mui/material';

const metrics = [
  { key: 'bmi', label: 'BMI', unit: 'kg/m²' },
  { key: 'bodyFatPercentage', label: 'Body Fat', unit: '%', changeUnit: 'pp' },
  { key: 'muscleMass', label: 'Muscle Mass', unit: 'kg' },
];

export default function BodyCompositionSummary({ data = [] }) {
  const sorted = [...data]
    .filter((item) => item.date && !Number.isNaN(Date.parse(item.date)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
      gap: 2,
      width: '100%',
    }}>
      {metrics.map((metric) => {
        const values = sorted
          .map((item) => Number(item[metric.key]))
          .filter((value, index) =>
            sorted[index]?.[metric.key] != null &&
            Number.isFinite(value)
          );

        const current = values.at(-1);
        const first = values[0];
        const change = values.length >= 2 ? current - first : null;

        return (
          <Card key={metric.key} variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {metric.label}
              </Typography>

              <Typography variant="h5" sx={{ fontWeight: 700, my: 1 }}>
                {current === undefined
                  ? 'N/A'
                  : `${current.toFixed(1)} ${metric.unit}`}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {change === null
                  ? 'Change: N/A'
                  : `Change: ${change > 0 ? '+' : ''}${change.toFixed(1)} ${metric.changeUnit ?? metric.unit}`}
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
