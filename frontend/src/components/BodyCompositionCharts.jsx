
import { Box, Typography, Paper } from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const chartDefinitions = [
  {
    key: 'bmi',
    title: 'BMI Trend',
    unit: 'kg/m²',
    color: '#1976d2',
  },
  {
    key: 'bodyFatPercentage',
    title: 'Body Fat Trend',
    unit: '%',
    color: '#ed6c02',
  },
  {
    key: 'muscleMass',
    title: 'Muscle Mass Trend',
    unit: 'kg',
    color: '#2e7d32',
  },
];

export default function BodyCompositionCharts({ data = [] }) {
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)',
        },
        gap: 3,
        width: '100%',
      }}
    >
      {chartDefinitions.map((chart) => (
        <Paper
          key={chart.key}
          elevation={2}
          sx={{ p: 3, minWidth: 0 }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {chart.title}
          </Typography>

          <Box sx={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={sortedData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />

                <YAxis domain={['auto', 'auto']} />

                <Tooltip
                  formatter={(value) => [
                    `${value} ${chart.unit}`,
                    chart.title,
                  ]}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />

                <Line
                  type="monotone"
                  dataKey={chart.key}
                  stroke={chart.color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
